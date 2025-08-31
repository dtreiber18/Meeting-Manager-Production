package com.g37.meetingmanager.repository.mysql;

import com.g37.meetingmanager.model.Document;
import com.g37.meetingmanager.model.Document.DocumentType;
import com.g37.meetingmanager.model.Document.AccessPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    
    // Find documents by meeting ID
    List<Document> findByMeetingId(Integer meetingId);
    
    // Find documents by meeting ID and document type
    List<Document> findByMeetingIdAndDocumentType(Integer meetingId, DocumentType documentType);
    
    // Find documents by uploaded user
    List<Document> findByUploadedBy(Long uploadedBy);
    
    // Find documents by access permissions
    List<Document> findByAccessPermissions(AccessPermission accessPermissions);
    
    // Find documents uploaded after a certain date
    List<Document> findByUploadDateAfter(LocalDateTime date);
    
    // Find documents by AI processing status
    List<Document> findByAiProcessed(Boolean aiProcessed);
    
    // Find documents by AI indexing status
    List<Document> findByAiIndexed(Boolean aiIndexed);
    
    // Search documents by title (case-insensitive)
    @Query("SELECT d FROM Document d WHERE LOWER(d.title) LIKE LOWER(CONCAT('%', :title, '%'))")
    List<Document> findByTitleContainingIgnoreCase(@Param("title") String title);
    
    // Search documents by description (case-insensitive)
    @Query("SELECT d FROM Document d WHERE LOWER(d.description) LIKE LOWER(CONCAT('%', :description, '%'))")
    List<Document> findByDescriptionContainingIgnoreCase(@Param("description") String description);
    
    // Full text search across title, description, and content
    @Query("SELECT d FROM Document d WHERE " +
           "LOWER(d.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(d.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(d.contentText) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(d.aiSummary) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Document> searchDocuments(@Param("searchTerm") String searchTerm);
    
    // Search documents with filters
    @Query("SELECT d FROM Document d WHERE " +
           "(:meetingId IS NULL OR d.meetingId = :meetingId) AND " +
           "(:documentType IS NULL OR d.documentType = :documentType) AND " +
           "(:accessPermissions IS NULL OR d.accessPermissions = :accessPermissions) AND " +
           "(:uploadedBy IS NULL OR d.uploadedBy = :uploadedBy) AND " +
           "(:searchTerm IS NULL OR " +
           "LOWER(d.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(d.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(d.contentText) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Document> findDocumentsWithFilters(
        @Param("meetingId") Integer meetingId,
        @Param("documentType") DocumentType documentType,
        @Param("accessPermissions") AccessPermission accessPermissions,
        @Param("uploadedBy") Long uploadedBy,
        @Param("searchTerm") String searchTerm
    );
    
    // Find documents by external file ID (for cloud storage integration)
    Optional<Document> findByExternalFileId(String externalFileId);
    
    // Find documents by file name (for duplicate checking)
    List<Document> findByFileName(String fileName);
    
    // Find documents by file type
    List<Document> findByFileType(String fileType);
    
    // Count documents by meeting
    @Query("SELECT COUNT(d) FROM Document d WHERE d.meetingId = :meetingId")
    Long countDocumentsByMeeting(@Param("meetingId") Integer meetingId);
    
    // Count documents by type
    @Query("SELECT COUNT(d) FROM Document d WHERE d.documentType = :documentType")
    Long countDocumentsByType(@Param("documentType") DocumentType documentType);
    
    // Find recent documents (last 30 days)
    @Query("SELECT d FROM Document d WHERE d.uploadDate >= :thirtyDaysAgo ORDER BY d.uploadDate DESC")
    List<Document> findRecentDocuments(@Param("thirtyDaysAgo") LocalDateTime thirtyDaysAgo);
    
    // Find documents that need AI processing
    @Query("SELECT d FROM Document d WHERE d.aiProcessed = false OR d.aiIndexed = false")
    List<Document> findDocumentsNeedingAiProcessing();
    
    // Find documents by tags (JSON search)
    @Query(value = "SELECT * FROM documents WHERE JSON_CONTAINS(tags, JSON_QUOTE(:tag))", nativeQuery = true)
    List<Document> findByTag(@Param("tag") String tag);
    
    // Find documents by AI keywords (JSON search)
    @Query(value = "SELECT * FROM documents WHERE JSON_CONTAINS(ai_keywords, JSON_QUOTE(:keyword))", nativeQuery = true)
    List<Document> findByAiKeyword(@Param("keyword") String keyword);
    
    // Get document statistics
    @Query("SELECT " +
           "COUNT(d) as totalDocs, " +
           "SUM(CASE WHEN d.aiProcessed = true THEN 1 ELSE 0 END) as aiProcessedDocs, " +
           "SUM(CASE WHEN d.aiIndexed = true THEN 1 ELSE 0 END) as aiIndexedDocs, " +
           "SUM(d.fileSize) as totalSize " +
           "FROM Document d")
    Object[] getDocumentStatistics();
    
    // Find documents by meeting and access permissions (for permission checking)
    @Query("SELECT d FROM Document d WHERE d.meetingId = :meetingId AND " +
           "(d.accessPermissions = 'PUBLIC' OR " +
           "d.accessPermissions = 'MEETING_PARTICIPANTS' OR " +
           "d.uploadedBy = :userId)")
    List<Document> findAccessibleDocumentsByMeeting(
        @Param("meetingId") Integer meetingId, 
        @Param("userId") Long userId
    );
}
