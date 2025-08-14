package com.g37.meetingmanager.service.impl;

import com.g37.meetingmanager.model.Document;
import com.g37.meetingmanager.service.CloudStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service("oneDriveStorageService")
public class OneDriveStorageService implements CloudStorageService {
    
    private static final Logger logger = LoggerFactory.getLogger(OneDriveStorageService.class);
    
    @Value("${onedrive.client-id:#{null}}")
    private String clientId;
    
    @Value("${onedrive.client-secret:#{null}}")
    private String clientSecret;
    
    @Value("${onedrive.tenant-id:#{null}}")
    private String tenantId;
    
    @Value("${onedrive.access-token:#{null}}")
    private String accessToken;
    
    private static final String GRAPH_API_BASE = "https://graph.microsoft.com/v1.0";
    private static final String UPLOAD_SESSION_URL = GRAPH_API_BASE + "/me/drive/root:/{fileName}:/createUploadSession";
    private static final String SIMPLE_UPLOAD_URL = GRAPH_API_BASE + "/me/drive/root:/{fileName}:/content";
    private static final String GET_FILE_URL = GRAPH_API_BASE + "/me/drive/items/{fileId}";
    private static final String DELETE_FILE_URL = GRAPH_API_BASE + "/me/drive/items/{fileId}";
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    @Override
    public CloudUploadResult uploadFile(MultipartFile file, Document document) throws Exception {
        logger.info("Uploading file to OneDrive: {}", file.getOriginalFilename());
        
        if (accessToken == null || accessToken.isEmpty()) {
            throw new RuntimeException("OneDrive access token is not configured");
        }
        
        try {
            String fileName = generateUniqueFileName(document);
            
            // For files smaller than 4MB, use simple upload
            if (file.getSize() < 4 * 1024 * 1024) {
                return simpleUpload(file, fileName);
            } else {
                return uploadSession(file, fileName);
            }
            
        } catch (Exception e) {
            logger.error("Error uploading to OneDrive: {}", e.getMessage(), e);
            throw new RuntimeException("OneDrive upload failed: " + e.getMessage());
        }
    }
    
    private CloudUploadResult simpleUpload(MultipartFile file, String fileName) throws Exception {
        String url = SIMPLE_UPLOAD_URL.replace("{fileName}", fileName);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        
        HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);
        
        ResponseEntity<Map> response = restTemplate.exchange(
            url, HttpMethod.PUT, entity, Map.class
        );
        
        if (response.getStatusCode() == HttpStatus.CREATED || response.getStatusCode() == HttpStatus.OK) {
            Map<String, Object> responseBody = response.getBody();
            String fileId = (String) responseBody.get("id");
            String webUrl = (String) responseBody.get("webUrl");
            String downloadUrl = (String) ((Map) responseBody.get("@microsoft.graph.downloadUrl")).get("@microsoft.graph.downloadUrl");
            
            logger.info("File uploaded successfully to OneDrive: {}", fileId);
            return new CloudUploadResult(fileId, webUrl, downloadUrl, fileName);
        } else {
            throw new RuntimeException("OneDrive upload failed with status: " + response.getStatusCode());
        }
    }
    
    private CloudUploadResult uploadSession(MultipartFile file, String fileName) throws Exception {
        // Create upload session
        String sessionUrl = UPLOAD_SESSION_URL.replace("{fileName}", fileName);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        Map<String, Object> sessionRequest = new HashMap<>();
        Map<String, Object> item = new HashMap<>();
        item.put("@microsoft.graph.conflictBehavior", "rename");
        sessionRequest.put("item", item);
        
        HttpEntity<Map<String, Object>> sessionEntity = new HttpEntity<>(sessionRequest, headers);
        
        ResponseEntity<Map> sessionResponse = restTemplate.exchange(
            sessionUrl, HttpMethod.POST, sessionEntity, Map.class
        );
        
        if (sessionResponse.getStatusCode() != HttpStatus.OK) {
            throw new RuntimeException("Failed to create upload session");
        }
        
        String uploadUrl = (String) sessionResponse.getBody().get("uploadUrl");
        
        // Upload file in chunks
        byte[] fileBytes = file.getBytes();
        int chunkSize = 320 * 1024; // 320KB chunks
        int totalSize = fileBytes.length;
        
        for (int i = 0; i < totalSize; i += chunkSize) {
            int end = Math.min(i + chunkSize, totalSize);
            byte[] chunk = new byte[end - i];
            System.arraycopy(fileBytes, i, chunk, 0, end - i);
            
            HttpHeaders chunkHeaders = new HttpHeaders();
            chunkHeaders.set("Content-Length", String.valueOf(chunk.length));
            chunkHeaders.set("Content-Range", String.format("bytes %d-%d/%d", i, end - 1, totalSize));
            chunkHeaders.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            
            HttpEntity<byte[]> chunkEntity = new HttpEntity<>(chunk, chunkHeaders);
            
            ResponseEntity<Map> chunkResponse = restTemplate.exchange(
                uploadUrl, HttpMethod.PUT, chunkEntity, Map.class
            );
            
            // Final chunk returns the file metadata
            if (end == totalSize && (chunkResponse.getStatusCode() == HttpStatus.CREATED || chunkResponse.getStatusCode() == HttpStatus.OK)) {
                Map<String, Object> responseBody = chunkResponse.getBody();
                String fileId = (String) responseBody.get("id");
                String webUrl = (String) responseBody.get("webUrl");
                String downloadUrl = (String) ((Map) responseBody.get("@microsoft.graph.downloadUrl")).get("@microsoft.graph.downloadUrl");
                
                logger.info("File uploaded successfully to OneDrive via upload session: {}", fileId);
                return new CloudUploadResult(fileId, webUrl, downloadUrl, fileName);
            }
        }
        
        throw new RuntimeException("Upload session completed but no file metadata received");
    }
    
    @Override
    public String getDownloadUrl(Document document) throws Exception {
        if (document.getDownloadUrl() != null && !document.getDownloadUrl().isEmpty()) {
            return document.getDownloadUrl();
        }
        
        String url = GET_FILE_URL.replace("{fileId}", document.getExternalFileId());
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        
        ResponseEntity<Map> response = restTemplate.exchange(
            url, HttpMethod.GET, entity, Map.class
        );
        
        if (response.getStatusCode() == HttpStatus.OK) {
            Map<String, Object> responseBody = response.getBody();
            return (String) responseBody.get("@microsoft.graph.downloadUrl");
        } else {
            throw new RuntimeException("Failed to get download URL from OneDrive");
        }
    }
    
    @Override
    public boolean deleteFile(Document document) {
        try {
            String url = DELETE_FILE_URL.replace("{fileId}", document.getExternalFileId());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Void> response = restTemplate.exchange(
                url, HttpMethod.DELETE, entity, Void.class
            );
            
            boolean success = response.getStatusCode() == HttpStatus.NO_CONTENT;
            logger.info("OneDrive file deletion {}: {}", success ? "successful" : "failed", document.getExternalFileId());
            return success;
            
        } catch (Exception e) {
            logger.error("Error deleting file from OneDrive: {}", e.getMessage(), e);
            return false;
        }
    }
    
    @Override
    public byte[] downloadFile(Document document) throws Exception {
        String downloadUrl = getDownloadUrl(document);
        
        ResponseEntity<byte[]> response = restTemplate.exchange(
            downloadUrl, HttpMethod.GET, null, byte[].class
        );
        
        if (response.getStatusCode() == HttpStatus.OK) {
            return response.getBody();
        } else {
            throw new RuntimeException("Failed to download file from OneDrive");
        }
    }
    
    @Override
    public boolean fileExists(Document document) {
        try {
            String url = GET_FILE_URL.replace("{fileId}", document.getExternalFileId());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, Map.class
            );
            
            return response.getStatusCode() == HttpStatus.OK;
            
        } catch (Exception e) {
            logger.warn("Error checking file existence on OneDrive: {}", e.getMessage());
            return false;
        }
    }
    
    private String generateUniqueFileName(Document document) {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String fileName = document.getFileName();
        
        // Insert timestamp before file extension
        int lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex != -1) {
            String name = fileName.substring(0, lastDotIndex);
            String extension = fileName.substring(lastDotIndex);
            return String.format("%s_%s%s", name, timestamp, extension);
        } else {
            return String.format("%s_%s", fileName, timestamp);
        }
    }
}
