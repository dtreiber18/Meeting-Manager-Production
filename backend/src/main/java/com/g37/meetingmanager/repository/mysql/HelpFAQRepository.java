package com.g37.meetingmanager.repository.mysql;

import com.g37.meetingmanager.model.HelpFAQ;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Help FAQ operations
 */
@Repository
public interface HelpFAQRepository extends JpaRepository<HelpFAQ, Long> {
    
    /**
     * Find all published FAQs
     */
    List<HelpFAQ> findByIsPublishedTrueOrderBySortOrderAscCreatedAtDesc();
    
    /**
     * Find published FAQs by category
     */
    List<HelpFAQ> findByCategoryAndIsPublishedTrueOrderBySortOrderAscCreatedAtDesc(String category);
    
    /**
     * Find published FAQs by category with pagination
     */
    Page<HelpFAQ> findByCategoryAndIsPublishedTrue(String category, Pageable pageable);
    
    /**
     * Find a published FAQ by ID
     */
    Optional<HelpFAQ> findByIdAndIsPublishedTrue(Long id);
    
    /**
     * Search FAQs by question or answer (published only)
     */
    @Query("SELECT f FROM HelpFAQ f WHERE f.isPublished = true AND " +
           "(LOWER(f.question) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(f.answer) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "ORDER BY f.viewCount DESC, f.helpfulCount DESC, f.createdAt DESC")
    List<HelpFAQ> searchPublishedFAQs(@Param("searchTerm") String searchTerm);
    
    /**
     * Search FAQs by question or answer with pagination
     */
    @Query("SELECT f FROM HelpFAQ f WHERE f.isPublished = true AND " +
           "(LOWER(f.question) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(f.answer) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "ORDER BY f.viewCount DESC, f.helpfulCount DESC, f.createdAt DESC")
    Page<HelpFAQ> searchPublishedFAQs(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    /**
     * Find FAQs by tags
     */
    @Query("SELECT f FROM HelpFAQ f JOIN f.tags t WHERE f.isPublished = true AND " +
           "LOWER(t) LIKE LOWER(CONCAT('%', :tag, '%')) " +
           "ORDER BY f.viewCount DESC, f.helpfulCount DESC, f.createdAt DESC")
    List<HelpFAQ> findByTagsContainingIgnoreCase(@Param("tag") String tag);
    
    /**
     * Get distinct categories of published FAQs
     */
    @Query("SELECT DISTINCT f.category FROM HelpFAQ f WHERE f.isPublished = true ORDER BY f.category")
    List<String> findDistinctCategoriesForPublished();
    
    /**
     * Get most viewed FAQs
     */
    @Query("SELECT f FROM HelpFAQ f WHERE f.isPublished = true ORDER BY f.viewCount DESC, f.helpfulCount DESC, f.createdAt DESC")
    Page<HelpFAQ> findMostViewed(Pageable pageable);
    
    /**
     * Get most helpful FAQs
     */
    @Query("SELECT f FROM HelpFAQ f WHERE f.isPublished = true ORDER BY f.helpfulCount DESC, f.viewCount DESC, f.createdAt DESC")
    Page<HelpFAQ> findMostHelpful(Pageable pageable);
    
    /**
     * Get recently created FAQs
     */
    @Query("SELECT f FROM HelpFAQ f WHERE f.isPublished = true ORDER BY f.createdAt DESC")
    Page<HelpFAQ> findRecentlyCreated(Pageable pageable);
    
    /**
     * Get recently updated FAQs
     */
    @Query("SELECT f FROM HelpFAQ f WHERE f.isPublished = true ORDER BY f.updatedAt DESC")
    Page<HelpFAQ> findRecentlyUpdated(Pageable pageable);
    
    /**
     * Increment view count for a FAQ
     */
    @Modifying
    @Query("UPDATE HelpFAQ f SET f.viewCount = f.viewCount + 1 WHERE f.id = :id")
    void incrementViewCount(@Param("id") Long id);
    
    /**
     * Increment helpful count for a FAQ
     */
    @Modifying
    @Query("UPDATE HelpFAQ f SET f.helpfulCount = f.helpfulCount + 1 WHERE f.id = :id")
    void incrementHelpfulCount(@Param("id") Long id);
    
    /**
     * Increment not helpful count for a FAQ
     */
    @Modifying
    @Query("UPDATE HelpFAQ f SET f.notHelpfulCount = f.notHelpfulCount + 1 WHERE f.id = :id")
    void incrementNotHelpfulCount(@Param("id") Long id);
    
    /**
     * Get FAQs count by category
     */
    @Query("SELECT f.category, COUNT(f) FROM HelpFAQ f WHERE f.isPublished = true GROUP BY f.category")
    List<Object[]> getFAQCountByCategory();
    
    /**
     * Get total view count for all FAQs
     */
    @Query("SELECT COALESCE(SUM(f.viewCount), 0) FROM HelpFAQ f WHERE f.isPublished = true")
    Long getTotalViewCount();
    
    /**
     * Find FAQs created by a specific user
     */
    List<HelpFAQ> findByCreatedByAndIsPublishedTrueOrderByCreatedAtDesc(Long createdBy);
    
    /**
     * Find FAQs by category and tags
     */
    @Query("SELECT f FROM HelpFAQ f JOIN f.tags t WHERE f.isPublished = true AND " +
           "f.category = :category AND LOWER(t) IN :tags " +
           "ORDER BY f.viewCount DESC, f.helpfulCount DESC, f.createdAt DESC")
    List<HelpFAQ> findByCategoryAndTagsIn(@Param("category") String category, @Param("tags") List<String> tags);
    
    /**
     * Get FAQs similar to given FAQ (same category, overlapping tags)
     */
    @Query("SELECT DISTINCT f FROM HelpFAQ f JOIN f.tags t WHERE f.isPublished = true AND " +
           "f.id != :faqId AND (f.category = :category OR LOWER(t) IN :tags) " +
           "ORDER BY f.helpfulCount DESC, f.viewCount DESC")
    List<HelpFAQ> findSimilarFAQs(@Param("faqId") Long faqId, 
                                  @Param("category") String category, 
                                  @Param("tags") List<String> tags, 
                                  Pageable pageable);
    
    /**
     * Count FAQs by category
     */
    long countByCategoryAndIsPublishedTrue(String category);
    
    /**
     * Count total published FAQs
     */
    long countByIsPublishedTrue();
    
    /**
     * Find all categories with FAQ counts
     */
    @Query("SELECT f.category, COUNT(f) FROM HelpFAQ f WHERE f.isPublished = true GROUP BY f.category ORDER BY f.category")
    List<Object[]> findCategoriesWithCounts();
    
    /**
     * Get top helpful FAQs by category
     */
    @Query("SELECT f FROM HelpFAQ f WHERE f.isPublished = true AND f.category = :category " +
           "ORDER BY f.helpfulCount DESC, f.viewCount DESC")
    List<HelpFAQ> findTopHelpfulByCategory(@Param("category") String category, Pageable pageable);
    
    /**
     * Get FAQs with highest helpfulness ratio
     */
    @Query("SELECT f FROM HelpFAQ f WHERE f.isPublished = true AND (f.helpfulCount + f.notHelpfulCount) >= :minVotes " +
           "ORDER BY (CAST(f.helpfulCount AS DOUBLE) / (f.helpfulCount + f.notHelpfulCount)) DESC, f.helpfulCount DESC")
    List<HelpFAQ> findByHighestHelpfulnessRatio(@Param("minVotes") int minVotes, Pageable pageable);
    
    // ===============================
    // Admin-specific Methods
    // ===============================
    
    /**
     * Find FAQs by category and publish status (admin)
     */
    Page<HelpFAQ> findByCategoryAndIsPublished(String category, Boolean isPublished, Pageable pageable);
    
    /**
     * Find FAQs by category (admin)
     */
    Page<HelpFAQ> findByCategory(String category, Pageable pageable);
    
    /**
     * Find FAQs by publish status (admin)
     */
    Page<HelpFAQ> findByIsPublished(Boolean isPublished, Pageable pageable);
}