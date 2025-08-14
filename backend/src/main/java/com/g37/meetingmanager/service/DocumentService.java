package com.g37.meetingmanager.service;

import com.g37.meetingmanager.model.Document;
import com.g37.meetingmanager.model.Document.DocumentType;
import com.g37.meetingmanager.model.Document.AccessPermission;
import com.g37.meetingmanager.model.Document.StorageProvider;
import com.g37.meetingmanager.repository.DocumentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class DocumentService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentService.class);

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private CloudStorageService cloudStorageService;

    // CRUD Operations
    public Document saveDocument(Document document) {
        logger.info("Saving document: {}", document.getTitle());
        return documentRepository.save(document);
    }

    public Optional<Document> findById(Long id) {
        return documentRepository.findById(id);
    }

    public List<Document> findAll() {
        return documentRepository.findAll();
    }

    public void deleteDocument(Long id) {
        logger.info("Deleting document with ID: {}", id);
        Optional<Document> document = documentRepository.findById(id);
        if (document.isPresent()) {
            // Also delete from cloud storage
            cloudStorageService.deleteFile(document.get());
            documentRepository.deleteById(id);
        } else {
            throw new RuntimeException("Document not found with ID: " + id);
        }
    }

    // Meeting-related operations
    public List<Document> findDocumentsByMeeting(Integer meetingId) {
        return documentRepository.findByMeetingId(meetingId);
    }

    public List<Document> findDocumentsByMeetingAndType(Integer meetingId, DocumentType documentType) {
        return documentRepository.findByMeetingIdAndDocumentType(meetingId, documentType);
    }

    public List<Document> findAccessibleDocumentsByMeeting(Integer meetingId, Long userId) {
        return documentRepository.findAccessibleDocumentsByMeeting(meetingId, userId);
    }

    // User-related operations
    public List<Document> findDocumentsByUser(Long userId) {
        return documentRepository.findByUploadedBy(userId);
    }

    // Search operations
    public List<Document> searchDocuments(String searchTerm) {
        logger.info("Searching documents with term: {}", searchTerm);
        return documentRepository.searchDocuments(searchTerm);
    }

    public List<Document> searchDocumentsWithFilters(
            Integer meetingId,
            DocumentType documentType,
            AccessPermission accessPermissions,
            Long uploadedBy,
            String searchTerm) {

        logger.info("Searching documents with filters - Meeting: {}, Type: {}, Access: {}, User: {}, Term: {}",
                meetingId, documentType, accessPermissions, uploadedBy, searchTerm);

        return documentRepository.findDocumentsWithFilters(
                meetingId, documentType, accessPermissions, uploadedBy, searchTerm);
    }

    public List<Document> findByTag(String tag) {
        return documentRepository.findByTag(tag);
    }

    public List<Document> findByAiKeyword(String keyword) {
        return documentRepository.findByAiKeyword(keyword);
    }

    // File upload operations
    public Document uploadDocument(
            MultipartFile file, 
            Integer meetingId,
            String title,
            String description,
            DocumentType documentType,
            AccessPermission accessPermissions,
            StorageProvider storageProvider,
            Long uploadedBy,
            String tags) {        logger.info("Uploading document: {} to {}", file.getOriginalFilename(), storageProvider);

        try {
            // Create document entity
            Document document = new Document();
            document.setMeetingId(meetingId);
            document.setTitle(title != null ? title : file.getOriginalFilename());
            document.setDescription(description);
            document.setFileName(file.getOriginalFilename());
            document.setFileType(getFileExtension(file.getOriginalFilename()));
            document.setFileSize(file.getSize());
            document.setMimeType(file.getContentType());
            document.setStorageProvider(storageProvider);
            document.setDocumentType(documentType);
            document.setAccessPermissions(accessPermissions);
            document.setUploadedBy(uploadedBy);
            document.setTags(tags);
            document.setUploadDate(LocalDateTime.now());

            // Upload to cloud storage
            CloudStorageService.CloudUploadResult uploadResult
                    = cloudStorageService.uploadFile(file, document);

            // Update document with cloud storage information
            document.setExternalFileId(uploadResult.getFileId());
            document.setExternalUrl(uploadResult.getFileUrl());
            document.setDownloadUrl(uploadResult.getDownloadUrl());

            // Save to database
            Document savedDocument = documentRepository.save(document);

            // Queue for AI processing (async)
            queueForAiProcessing(savedDocument);

            logger.info("Document uploaded successfully: {}", savedDocument.getId());
            return savedDocument;

        } catch (Exception e) {
            logger.error("Error uploading document: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload document: " + e.getMessage());
        }
    }

    // AI processing operations
    public void queueForAiProcessing(Document document) {
        logger.info("Queuing document for AI processing: {}", document.getId());
        // This would typically send to a message queue or trigger async processing
        // For now, we'll mark it as pending
        document.setAiProcessed(false);
        document.setAiIndexed(false);
        documentRepository.save(document);
    }

    public List<Document> findDocumentsNeedingAiProcessing() {
        return documentRepository.findDocumentsNeedingAiProcessing();
    }

    public Document updateAiProcessingStatus(Long documentId, String aiSummary, String aiKeywords, String contentText) {
        Optional<Document> optionalDocument = documentRepository.findById(documentId);
        if (optionalDocument.isPresent()) {
            Document document = optionalDocument.get();
            document.setAiSummary(aiSummary);
            document.setAiKeywords(aiKeywords);
            document.setContentText(contentText);
            document.setAiProcessed(true);
            document.setAiIndexed(true);
            document.setLastModified(LocalDateTime.now());

            return documentRepository.save(document);
        } else {
            throw new RuntimeException("Document not found with ID: " + documentId);
        }
    }

    // Statistics and reporting
    public DocumentStatistics getDocumentStatistics() {
        Object[] stats = documentRepository.getDocumentStatistics();
        if (stats != null && stats.length > 0) {
            return new DocumentStatistics(
                    ((Number) stats[0]).longValue(), // totalDocs
                    ((Number) stats[1]).longValue(), // aiProcessedDocs
                    ((Number) stats[2]).longValue(), // aiIndexedDocs
                    ((Number) stats[3]).longValue() // totalSize
            );
        }
        return new DocumentStatistics(0L, 0L, 0L, 0L);
    }

    public Long countDocumentsByMeeting(Integer meetingId) {
        return documentRepository.countDocumentsByMeeting(meetingId);
    }

    public Long countDocumentsByType(DocumentType documentType) {
        return documentRepository.countDocumentsByType(documentType);
    }

    public List<Document> findRecentDocuments() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        return documentRepository.findRecentDocuments(thirtyDaysAgo);
    }

    // Utility methods
    private String getFileExtension(String fileName) {
        if (fileName == null || fileName.lastIndexOf('.') == -1) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
    }

    public boolean hasAccessToDocument(Document document, Long userId) {
        // Check access permissions
        switch (document.getAccessPermissions()) {
            case PUBLIC:
                return true;
            case PRIVATE:
                return document.getUploadedBy().equals(userId);
            case MEETING_PARTICIPANTS:
                // Would need to check if user is a participant in the meeting
                // For now, allow access if user uploaded it
                return document.getUploadedBy().equals(userId);
            case RESTRICTED:
                // Would need additional permission checking logic
                return document.getUploadedBy().equals(userId);
            default:
                return false;
        }
    }

    // Inner class for statistics
    public static class DocumentStatistics {

        private final Long totalDocuments;
        private final Long aiProcessedDocuments;
        private final Long aiIndexedDocuments;
        private final Long totalSizeBytes;

        public DocumentStatistics(Long totalDocuments, Long aiProcessedDocuments, Long aiIndexedDocuments, Long totalSizeBytes) {
            this.totalDocuments = totalDocuments;
            this.aiProcessedDocuments = aiProcessedDocuments;
            this.aiIndexedDocuments = aiIndexedDocuments;
            this.totalSizeBytes = totalSizeBytes;
        }

        // Getters
        public Long getTotalDocuments() {
            return totalDocuments;
        }

        public Long getAiProcessedDocuments() {
            return aiProcessedDocuments;
        }

        public Long getAiIndexedDocuments() {
            return aiIndexedDocuments;
        }

        public Long getTotalSizeBytes() {
            return totalSizeBytes;
        }

        public String getTotalSizeFormatted() {
            if (totalSizeBytes == null || totalSizeBytes == 0) {
                return "0 B";
            }

            String[] units = {"B", "KB", "MB", "GB", "TB"};
            int unitIndex = 0;
            double size = totalSizeBytes.doubleValue();

            while (size >= 1024 && unitIndex < units.length - 1) {
                size /= 1024;
                unitIndex++;
            }

            return String.format("%.1f %s", size, units[unitIndex]);
        }
    }
}
