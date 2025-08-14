package com.g37.meetingmanager.service;

import com.g37.meetingmanager.model.Document;
import org.springframework.web.multipart.MultipartFile;

public interface CloudStorageService {
    
    CloudUploadResult uploadFile(MultipartFile file, Document document) throws Exception;
    
    String getDownloadUrl(Document document) throws Exception;
    
    boolean deleteFile(Document document);
    
    byte[] downloadFile(Document document) throws Exception;
    
    boolean fileExists(Document document);
    
    // Result class for upload operations
    class CloudUploadResult {
        private final String fileId;
        private final String fileUrl;
        private final String downloadUrl;
        private final String fileName;
        
        public CloudUploadResult(String fileId, String fileUrl, String downloadUrl, String fileName) {
            this.fileId = fileId;
            this.fileUrl = fileUrl;
            this.downloadUrl = downloadUrl;
            this.fileName = fileName;
        }
        
        public String getFileId() { return fileId; }
        public String getFileUrl() { return fileUrl; }
        public String getDownloadUrl() { return downloadUrl; }
        public String getFileName() { return fileName; }
    }
}
