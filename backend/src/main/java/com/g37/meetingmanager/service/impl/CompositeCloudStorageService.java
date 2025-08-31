package com.g37.meetingmanager.service.impl;

import com.g37.meetingmanager.model.Document;
import com.g37.meetingmanager.model.Document.StorageProvider;
import com.g37.meetingmanager.service.CloudStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@Primary
public class CompositeCloudStorageService implements CloudStorageService {
    
    private static final Logger logger = LoggerFactory.getLogger(CompositeCloudStorageService.class);
    
    @Autowired
    @Qualifier("oneDriveStorageService")
    private CloudStorageService oneDriveService;
    
    @Autowired
    @Qualifier("googleDriveStorageService")
    private CloudStorageService googleDriveService;
    
    @Override
    public CloudUploadResult uploadFile(MultipartFile file, Document document) throws Exception {
        CloudStorageService service = getStorageService(document.getStorageProvider());
        logger.info("Uploading file using {} provider", document.getStorageProvider());
        return service.uploadFile(file, document);
    }
    
    @Override
    public String getDownloadUrl(Document document) throws Exception {
        CloudStorageService service = getStorageService(document.getStorageProvider());
        return service.getDownloadUrl(document);
    }
    
    @Override
    public boolean deleteFile(Document document) {
        try {
            CloudStorageService service = getStorageService(document.getStorageProvider());
            return service.deleteFile(document);
        } catch (Exception e) {
            logger.error("Error deleting file: {}", e.getMessage(), e);
            return false;
        }
    }
    
    @Override
    public byte[] downloadFile(Document document) throws Exception {
        CloudStorageService service = getStorageService(document.getStorageProvider());
        return service.downloadFile(document);
    }
    
    @Override
    public boolean fileExists(Document document) {
        try {
            CloudStorageService service = getStorageService(document.getStorageProvider());
            return service.fileExists(document);
        } catch (Exception e) {
            logger.error("Error checking file existence: {}", e.getMessage(), e);
            return false;
        }
    }
    
    private CloudStorageService getStorageService(StorageProvider provider) {
        switch (provider) {
            case ONEDRIVE:
                return oneDriveService;
            case GOOGLEDRIVE:
                return googleDriveService;
            case LOCAL:
                // For local storage, you might want to implement a local file service
                throw new UnsupportedOperationException("Local storage not implemented yet");
            default:
                throw new IllegalArgumentException("Unsupported storage provider: " + provider);
        }
    }
}
