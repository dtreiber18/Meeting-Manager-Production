package com.g37.meetingmanager.controller;

import com.g37.meetingmanager.model.Document;
import com.g37.meetingmanager.model.Document.DocumentType;
import com.g37.meetingmanager.model.Document.AccessPermission;
import com.g37.meetingmanager.model.Document.StorageProvider;
import com.g37.meetingmanager.service.DocumentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
public class DocumentController {
    
    private static final Logger logger = LoggerFactory.getLogger(DocumentController.class);
    
    @Autowired
    private DocumentService documentService;
    
    // Upload document
    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "meetingId", required = false) Integer meetingId,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "documentType", defaultValue = "OTHER") DocumentType documentType,
            @RequestParam(value = "accessPermissions", defaultValue = "MEETING_PARTICIPANTS") AccessPermission accessPermissions,
            @RequestParam(value = "storageProvider", defaultValue = "ONEDRIVE") StorageProvider storageProvider,
            @RequestParam(value = "uploadedBy", required = false) Long uploadedBy,
            @RequestParam(value = "tags", required = false) String tags) {
        
        try {
            logger.info("Uploading document: {} for meeting: {}", file.getOriginalFilename(), meetingId);
            
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }
            
            // Set default title if not provided
            if (title == null || title.trim().isEmpty()) {
                title = file.getOriginalFilename();
            }
            
            Document document = documentService.uploadDocument(
                file, meetingId, title, description, documentType, 
                accessPermissions, storageProvider, uploadedBy, tags
            );
            
            return ResponseEntity.ok(document);
            
        } catch (Exception e) {
            logger.error("Error uploading document: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to upload document: " + e.getMessage());
        }
    }
    
    // Get all documents
    @GetMapping
    public ResponseEntity<List<Document>> getAllDocuments() {
        try {
            List<Document> documents = documentService.findAll();
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            logger.error("Error fetching documents: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get document by ID
    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocumentById(@PathVariable Long id) {
        try {
            Optional<Document> document = documentService.findById(id);
            return document.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            logger.error("Error fetching document {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get documents by meeting
    @GetMapping("/meeting/{meetingId}")
    public ResponseEntity<List<Document>> getDocumentsByMeeting(@PathVariable Integer meetingId) {
        try {
            List<Document> documents = documentService.findDocumentsByMeeting(meetingId);
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            logger.error("Error fetching documents for meeting {}: {}", meetingId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get accessible documents by meeting (considering permissions)
    @GetMapping("/meeting/{meetingId}/accessible")
    public ResponseEntity<List<Document>> getAccessibleDocumentsByMeeting(
            @PathVariable Integer meetingId,
            @RequestParam Long userId) {
        try {
            List<Document> documents = documentService.findAccessibleDocumentsByMeeting(meetingId, userId);
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            logger.error("Error fetching accessible documents for meeting {} and user {}: {}", 
                        meetingId, userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get documents by user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Document>> getDocumentsByUser(@PathVariable Long userId) {
        try {
            List<Document> documents = documentService.findDocumentsByUser(userId);
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            logger.error("Error fetching documents for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Search documents
    @GetMapping("/search")
    public ResponseEntity<List<Document>> searchDocuments(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Integer meetingId,
            @RequestParam(required = false) DocumentType documentType,
            @RequestParam(required = false) AccessPermission accessPermissions,
            @RequestParam(required = false) Long uploadedBy) {
        
        try {
            List<Document> documents;
            
            if (searchTerm != null || meetingId != null || documentType != null || 
                accessPermissions != null || uploadedBy != null) {
                // Use filtered search
                documents = documentService.searchDocumentsWithFilters(
                    meetingId, documentType, accessPermissions, uploadedBy, searchTerm
                );
            } else {
                // Return all documents if no filters
                documents = documentService.findAll();
            }
            
            return ResponseEntity.ok(documents);
            
        } catch (Exception e) {
            logger.error("Error searching documents: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Search by tag
    @GetMapping("/tag/{tag}")
    public ResponseEntity<List<Document>> getDocumentsByTag(@PathVariable String tag) {
        try {
            List<Document> documents = documentService.findByTag(tag);
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            logger.error("Error fetching documents by tag {}: {}", tag, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Update document
    @PutMapping("/{id}")
    public ResponseEntity<Document> updateDocument(
            @PathVariable Long id, 
            @Valid @RequestBody Document document) {
        try {
            Optional<Document> existingDocument = documentService.findById(id);
            if (existingDocument.isPresent()) {
                document.setId(id);
                Document updatedDocument = documentService.saveDocument(document);
                return ResponseEntity.ok(updatedDocument);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error updating document {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Delete document
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        try {
            documentService.deleteDocument(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting document {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Download document
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long id) {
        try {
            Optional<Document> optionalDocument = documentService.findById(id);
            if (optionalDocument.isPresent()) {
                Document document = optionalDocument.get();
                
                // This would use CloudStorageService to download the actual file
                // For now, return a redirect to the external URL
                return ResponseEntity.status(HttpStatus.FOUND)
                    .header(HttpHeaders.LOCATION, document.getExternalUrl())
                    .build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error downloading document {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get document statistics
    @GetMapping("/statistics")
    public ResponseEntity<DocumentService.DocumentStatistics> getDocumentStatistics() {
        try {
            DocumentService.DocumentStatistics stats = documentService.getDocumentStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error fetching document statistics: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get recent documents
    @GetMapping("/recent")
    public ResponseEntity<List<Document>> getRecentDocuments() {
        try {
            List<Document> documents = documentService.findRecentDocuments();
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            logger.error("Error fetching recent documents: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get documents needing AI processing
    @GetMapping("/ai/pending")
    public ResponseEntity<List<Document>> getDocumentsNeedingAiProcessing() {
        try {
            List<Document> documents = documentService.findDocumentsNeedingAiProcessing();
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            logger.error("Error fetching documents needing AI processing: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Update AI processing status
    @PutMapping("/{id}/ai-processing")
    public ResponseEntity<Document> updateAiProcessingStatus(
            @PathVariable Long id,
            @RequestParam(required = false) String aiSummary,
            @RequestParam(required = false) String aiKeywords,
            @RequestParam(required = false) String contentText) {
        
        try {
            Document document = documentService.updateAiProcessingStatus(id, aiSummary, aiKeywords, contentText);
            return ResponseEntity.ok(document);
        } catch (Exception e) {
            logger.error("Error updating AI processing status for document {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
