package com.g37.meetingmanager.service.impl;

import com.g37.meetingmanager.model.Document;
import com.g37.meetingmanager.service.CloudStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@Service("googleDriveStorageService")
public class GoogleDriveStorageService implements CloudStorageService {
    
    private static final Logger logger = LoggerFactory.getLogger(GoogleDriveStorageService.class);
    
    @Value("${googledrive.client-id:#{null}}")
    private String clientId;
    
    @Value("${googledrive.client-secret:#{null}}")
    private String clientSecret;
    
    @Value("${googledrive.access-token:#{null}}")
    private String accessToken;
    
    @Value("${googledrive.refresh-token:#{null}}")
    private String refreshToken;
    
    private static final String DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";
    private static final String UPLOAD_API_BASE = "https://www.googleapis.com/upload/drive/v3";
    private static final String FILES_URL = DRIVE_API_BASE + "/files";
    private static final String UPLOAD_URL = UPLOAD_API_BASE + "/files?uploadType=multipart";
    private static final String FILE_URL = DRIVE_API_BASE + "/files/{fileId}";
    private static final String DOWNLOAD_URL = DRIVE_API_BASE + "/files/{fileId}?alt=media";
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    @Override
    public CloudUploadResult uploadFile(MultipartFile file, Document document) throws Exception {
        logger.info("Uploading file to Google Drive: {}", file.getOriginalFilename());
        
        if (accessToken == null || accessToken.isEmpty()) {
            throw new RuntimeException("Google Drive access token is not configured");
        }
        
        try {
            String fileName = generateUniqueFileName(document);
            
            // Create metadata
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("name", fileName);
            metadata.put("description", document.getDescription());
            
            // Create multipart request
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            
            // Add metadata part
            HttpHeaders metadataHeaders = new HttpHeaders();
            metadataHeaders.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> metadataEntity = new HttpEntity<>(metadata, metadataHeaders);
            body.add("metadata", metadataEntity);
            
            // Add file part
            HttpHeaders fileHeaders = new HttpHeaders();
            fileHeaders.setContentType(MediaType.parseMediaType(file.getContentType()));
            HttpEntity<byte[]> fileEntity = new HttpEntity<>(file.getBytes(), fileHeaders);
            body.add("file", fileEntity);
            
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                UPLOAD_URL, HttpMethod.POST, requestEntity, Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> responseBody = response.getBody();
                String fileId = (String) responseBody.get("id");
                String name = (String) responseBody.get("name");
                String webViewLink = (String) responseBody.get("webViewLink");
                String webContentLink = (String) responseBody.get("webContentLink");
                
                // Make file publicly viewable (optional - you might want to control this)
                makeFilePublic(fileId);
                
                logger.info("File uploaded successfully to Google Drive: {}", fileId);
                return new CloudUploadResult(fileId, webViewLink, webContentLink, name);
                
            } else {
                throw new RuntimeException("Google Drive upload failed with status: " + response.getStatusCode());
            }
            
        } catch (Exception e) {
            logger.error("Error uploading to Google Drive: {}", e.getMessage(), e);
            throw new RuntimeException("Google Drive upload failed: " + e.getMessage());
        }
    }
    
    private void makeFilePublic(String fileId) {
        try {
            String permissionsUrl = DRIVE_API_BASE + "/files/" + fileId + "/permissions";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> permission = new HashMap<>();
            permission.put("role", "reader");
            permission.put("type", "anyone");
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(permission, headers);
            
            restTemplate.exchange(permissionsUrl, HttpMethod.POST, entity, Map.class);
            
        } catch (Exception e) {
            logger.warn("Could not make Google Drive file public: {}", e.getMessage());
        }
    }
    
    @Override
    public String getDownloadUrl(Document document) throws Exception {
        if (document.getDownloadUrl() != null && !document.getDownloadUrl().isEmpty()) {
            return document.getDownloadUrl();
        }
        
        // For Google Drive, we need to use the direct download URL
        return DOWNLOAD_URL.replace("{fileId}", document.getExternalFileId());
    }
    
    @Override
    public boolean deleteFile(Document document) {
        try {
            String url = FILE_URL.replace("{fileId}", document.getExternalFileId());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Void> response = restTemplate.exchange(
                url, HttpMethod.DELETE, entity, Void.class
            );
            
            boolean success = response.getStatusCode() == HttpStatus.NO_CONTENT;
            logger.info("Google Drive file deletion {}: {}", success ? "successful" : "failed", document.getExternalFileId());
            return success;
            
        } catch (Exception e) {
            logger.error("Error deleting file from Google Drive: {}", e.getMessage(), e);
            return false;
        }
    }
    
    @Override
    public byte[] downloadFile(Document document) throws Exception {
        String downloadUrl = getDownloadUrl(document);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        
        ResponseEntity<byte[]> response = restTemplate.exchange(
            downloadUrl, HttpMethod.GET, entity, byte[].class
        );
        
        if (response.getStatusCode() == HttpStatus.OK) {
            return response.getBody();
        } else {
            throw new RuntimeException("Failed to download file from Google Drive");
        }
    }
    
    @Override
    public boolean fileExists(Document document) {
        try {
            String url = FILE_URL.replace("{fileId}", document.getExternalFileId());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, Map.class
            );
            
            return response.getStatusCode() == HttpStatus.OK;
            
        } catch (Exception e) {
            logger.warn("Error checking file existence on Google Drive: {}", e.getMessage());
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
    
    // Method to refresh access token when it expires
    private void refreshAccessToken() throws Exception {
        if (refreshToken == null || refreshToken.isEmpty()) {
            throw new RuntimeException("No refresh token available");
        }
        
        String tokenUrl = "https://oauth2.googleapis.com/token";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("refresh_token", refreshToken);
        body.add("grant_type", "refresh_token");
        
        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);
        
        ResponseEntity<Map> response = restTemplate.exchange(
            tokenUrl, HttpMethod.POST, entity, Map.class
        );
        
        if (response.getStatusCode() == HttpStatus.OK) {
            Map<String, Object> responseBody = response.getBody();
            this.accessToken = (String) responseBody.get("access_token");
            logger.info("Google Drive access token refreshed successfully");
        } else {
            throw new RuntimeException("Failed to refresh Google Drive access token");
        }
    }
}
