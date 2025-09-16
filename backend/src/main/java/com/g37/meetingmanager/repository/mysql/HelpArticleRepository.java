package com.g37.meetingmanager.repository.mysql;

import com.g37.meetingmanager.model.HelpArticle;
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
 * Repository interface for Help Article operations
 */
@Repository
public interface HelpArticleRepository extends JpaRepository<HelpArticle, Long> {
    
    /**
     * Find all published articles
     */
    List<HelpArticle> findByIsPublishedTrueOrderBySortOrderAscCreatedAtDesc();
    
    /**
     * Find published articles by category
     */
    List<HelpArticle> findByCategoryAndIsPublishedTrueOrderBySortOrderAscCreatedAtDesc(String category);
    
    /**
     * Find published articles by category with pagination
     */
    Page<HelpArticle> findByCategoryAndIsPublishedTrue(String category, Pageable pageable);
    
    /**
     * Find a published article by ID
     */
    Optional<HelpArticle> findByIdAndIsPublishedTrue(Long id);
    
    /**
     * Search articles by title or content (published only)
     */
    @Query("SELECT a FROM HelpArticle a WHERE a.isPublished = true AND " +
           "(LOWER(a.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.content) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "ORDER BY a.viewCount DESC, a.createdAt DESC")
    List<HelpArticle> searchPublishedArticles(@Param("searchTerm") String searchTerm);
    
    /**
     * Search articles by title, description, or content with pagination
     */
    @Query("SELECT a FROM HelpArticle a WHERE a.isPublished = true AND " +
           "(LOWER(a.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.content) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "ORDER BY a.viewCount DESC, a.createdAt DESC")
    Page<HelpArticle> searchPublishedArticles(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    /**
     * Find articles by tags
     */
    @Query("SELECT a FROM HelpArticle a JOIN a.tags t WHERE a.isPublished = true AND " +
           "LOWER(t) LIKE LOWER(CONCAT('%', :tag, '%')) " +
           "ORDER BY a.viewCount DESC, a.createdAt DESC")
    List<HelpArticle> findByTagsContainingIgnoreCase(@Param("tag") String tag);
    
    /**
     * Get distinct categories of published articles
     */
    @Query("SELECT DISTINCT a.category FROM HelpArticle a WHERE a.isPublished = true ORDER BY a.category")
    List<String> findDistinctCategoriesForPublished();
    
    /**
     * Get most viewed articles
     */
    @Query("SELECT a FROM HelpArticle a WHERE a.isPublished = true ORDER BY a.viewCount DESC, a.createdAt DESC")
    Page<HelpArticle> findMostViewed(Pageable pageable);
    
    /**
     * Get recently created articles
     */
    @Query("SELECT a FROM HelpArticle a WHERE a.isPublished = true ORDER BY a.createdAt DESC")
    Page<HelpArticle> findRecentlyCreated(Pageable pageable);
    
    /**
     * Get recently updated articles
     */
    @Query("SELECT a FROM HelpArticle a WHERE a.isPublished = true ORDER BY a.updatedAt DESC")
    Page<HelpArticle> findRecentlyUpdated(Pageable pageable);
    
    /**
     * Increment view count for an article
     */
    @Modifying
    @Query("UPDATE HelpArticle a SET a.viewCount = a.viewCount + 1 WHERE a.id = :id")
    void incrementViewCount(@Param("id") Long id);
    
    /**
     * Get articles count by category
     */
    @Query("SELECT a.category, COUNT(a) FROM HelpArticle a WHERE a.isPublished = true GROUP BY a.category")
    List<Object[]> getArticleCountByCategory();
    
    /**
     * Get total view count for all articles
     */
    @Query("SELECT COALESCE(SUM(a.viewCount), 0) FROM HelpArticle a WHERE a.isPublished = true")
    Long getTotalViewCount();
    
    /**
     * Find articles created by a specific user
     */
    List<HelpArticle> findByCreatedByAndIsPublishedTrueOrderByCreatedAtDesc(Long createdBy);
    
    /**
     * Find articles by category and tags
     */
    @Query("SELECT a FROM HelpArticle a JOIN a.tags t WHERE a.isPublished = true AND " +
           "a.category = :category AND LOWER(t) IN :tags " +
           "ORDER BY a.viewCount DESC, a.createdAt DESC")
    List<HelpArticle> findByCategoryAndTagsIn(@Param("category") String category, @Param("tags") List<String> tags);
    
    /**
     * Get articles similar to given article (same category, overlapping tags)
     */
    @Query("SELECT DISTINCT a FROM HelpArticle a JOIN a.tags t WHERE a.isPublished = true AND " +
           "a.id != :articleId AND (a.category = :category OR LOWER(t) IN :tags) " +
           "ORDER BY a.viewCount DESC")
    List<HelpArticle> findSimilarArticles(@Param("articleId") Long articleId, 
                                         @Param("category") String category, 
                                         @Param("tags") List<String> tags, 
                                         Pageable pageable);
    
    /**
     * Count articles by category
     */
    long countByCategoryAndIsPublishedTrue(String category);
    
    /**
     * Count total published articles
     */
    long countByIsPublishedTrue();
    
    /**
     * Find all categories with article counts
     */
    @Query("SELECT a.category, COUNT(a) FROM HelpArticle a WHERE a.isPublished = true GROUP BY a.category ORDER BY a.category")
    List<Object[]> findCategoriesWithCounts();
    
    // ===============================
    // Admin-specific Methods
    // ===============================
    
    /**
     * Find articles by category and publish status (admin)
     */
    Page<HelpArticle> findByCategoryAndIsPublished(String category, Boolean isPublished, Pageable pageable);
    
    /**
     * Find articles by category (admin)
     */
    Page<HelpArticle> findByCategory(String category, Pageable pageable);
    
    /**
     * Find articles by publish status (admin)
     */
    Page<HelpArticle> findByIsPublished(Boolean isPublished, Pageable pageable);
}