package com.g37.meetingmanager.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "documents")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Document {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "meeting_id")
    private Integer meetingId;
    
    @NotBlank(message = "Document title is required")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @NotBlank(message = "File name is required")
    @Size(max = 255, message = "File name cannot exceed 255 characters")
    @Column(name = "file_name", nullable = false)
    private String fileName;
    
    @NotBlank(message = "File type is required")
    @Size(max = 50, message = "File type cannot exceed 50 characters")
    @Column(name = "file_type", nullable = false)
    private String fileType;
    
    @Column(name = "file_size")
    private Long fileSize;
    
    @Size(max = 100, message = "MIME type cannot exceed 100 characters")
    @Column(name = "mime_type")
    private String mimeType;
    
    @NotNull(message = "Storage provider is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "storage_provider", nullable = false)
    private StorageProvider storageProvider;
    
    @Size(max = 255, message = "External file ID cannot exceed 255 characters")
    @Column(name = "external_file_id")
    private String externalFileId;
    
    @Column(name = "external_url", columnDefinition = "TEXT")
    private String externalUrl;
    
    @Column(name = "download_url", columnDefinition = "TEXT")
    private String downloadUrl;
    
    @NotNull(message = "Document type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false)
    private DocumentType documentType = DocumentType.OTHER;
    
    @Column(name = "tags", columnDefinition = "JSON")
    private String tags; // JSON array of tags
    
    @NotNull(message = "Access permissions are required")
    @Enumerated(EnumType.STRING)
    @Column(name = "access_permissions", nullable = false)
    private AccessPermission accessPermissions = AccessPermission.MEETING_PARTICIPANTS;
    
    @Column(name = "uploaded_by")
    private Long uploadedBy;
    
    @Column(name = "ai_processed")
    private Boolean aiProcessed = false;
    
    @Column(name = "ai_indexed")
    private Boolean aiIndexed = false;
    
    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary;
    
    @Column(name = "ai_keywords", columnDefinition = "JSON")
    private String aiKeywords; // JSON array of AI-extracted keywords
    
    @Column(name = "content_text", columnDefinition = "LONGTEXT")
    private String contentText;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Column(name = "upload_date", nullable = false, updatable = false)
    private LocalDateTime uploadDate = LocalDateTime.now();
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Column(name = "last_modified")
    private LocalDateTime lastModified = LocalDateTime.now();
    
    // Enums
    public enum StorageProvider {
        ONEDRIVE, GOOGLEDRIVE, LOCAL
    }
    
    public enum DocumentType {
        AGENDA, MINUTES, PRESENTATION, REPORT, NOTES, ATTACHMENT, OTHER
    }
    
    public enum AccessPermission {
        PUBLIC, MEETING_PARTICIPANTS, RESTRICTED, PRIVATE
    }
    
    // Constructors
    public Document() {}
    
    public Document(String title, String fileName, String fileType, StorageProvider storageProvider, DocumentType documentType) {
        this.title = title;
        this.fileName = fileName;
        this.fileType = fileType;
        this.storageProvider = storageProvider;
        this.documentType = documentType;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Integer getMeetingId() { return meetingId; }
    public void setMeetingId(Integer meetingId) { this.meetingId = meetingId; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    
    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }
    
    public StorageProvider getStorageProvider() { return storageProvider; }
    public void setStorageProvider(StorageProvider storageProvider) { this.storageProvider = storageProvider; }
    
    public String getExternalFileId() { return externalFileId; }
    public void setExternalFileId(String externalFileId) { this.externalFileId = externalFileId; }
    
    public String getExternalUrl() { return externalUrl; }
    public void setExternalUrl(String externalUrl) { this.externalUrl = externalUrl; }
    
    public String getDownloadUrl() { return downloadUrl; }
    public void setDownloadUrl(String downloadUrl) { this.downloadUrl = downloadUrl; }
    
    public DocumentType getDocumentType() { return documentType; }
    public void setDocumentType(DocumentType documentType) { this.documentType = documentType; }
    
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
    
    public AccessPermission getAccessPermissions() { return accessPermissions; }
    public void setAccessPermissions(AccessPermission accessPermissions) { this.accessPermissions = accessPermissions; }
    
    public Long getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(Long uploadedBy) { this.uploadedBy = uploadedBy; }
    
    public Boolean getAiProcessed() { return aiProcessed; }
    public void setAiProcessed(Boolean aiProcessed) { this.aiProcessed = aiProcessed; }
    
    public Boolean getAiIndexed() { return aiIndexed; }
    public void setAiIndexed(Boolean aiIndexed) { this.aiIndexed = aiIndexed; }
    
    public String getAiSummary() { return aiSummary; }
    public void setAiSummary(String aiSummary) { this.aiSummary = aiSummary; }
    
    public String getAiKeywords() { return aiKeywords; }
    public void setAiKeywords(String aiKeywords) { this.aiKeywords = aiKeywords; }
    
    public String getContentText() { return contentText; }
    public void setContentText(String contentText) { this.contentText = contentText; }
    
    public LocalDateTime getUploadDate() { return uploadDate; }
    public void setUploadDate(LocalDateTime uploadDate) { this.uploadDate = uploadDate; }
    
    public LocalDateTime getLastModified() { return lastModified; }
    public void setLastModified(LocalDateTime lastModified) { this.lastModified = lastModified; }
    
    @PreUpdate
    public void preUpdate() {
        this.lastModified = LocalDateTime.now();
    }
    
    @PrePersist
    public void prePersist() {
        if (this.uploadDate == null) {
            this.uploadDate = LocalDateTime.now();
        }
        if (this.lastModified == null) {
            this.lastModified = LocalDateTime.now();
        }
    }
}
