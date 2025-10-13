package com.g37.meetingmanager.repository.mysql;

import com.g37.meetingmanager.entity.mysql.SearchAnalytics;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Search Analytics operations
 */
@Repository
public interface SearchAnalyticsRepository extends JpaRepository<SearchAnalytics, Long> {

    /**
     * Find existing search analytics entry by search term
     */
    Optional<SearchAnalytics> findBySearchTerm(String searchTerm);

    /**
     * Get most popular search terms ordered by search count
     */
    @Query("SELECT s FROM SearchAnalytics s ORDER BY s.searchCount DESC, s.lastSearched DESC")
    List<SearchAnalytics> findTopSearchTerms(Pageable pageable);

    /**
     * Get search terms ordered by search count (top N)
     */
    @Query("SELECT s FROM SearchAnalytics s ORDER BY s.searchCount DESC, s.lastSearched DESC")
    List<SearchAnalytics> findMostSearchedTerms(Pageable pageable);

    /**
     * Get recent search terms (last 30 days)
     */
    @Query("SELECT s FROM SearchAnalytics s WHERE s.lastSearched >= :thirtyDaysAgo ORDER BY s.lastSearched DESC")
    List<SearchAnalytics> findRecentSearches(@Param("thirtyDaysAgo") LocalDateTime thirtyDaysAgo);

    /**
     * Get search terms by user
     */
    @Query("SELECT s FROM SearchAnalytics s WHERE s.userId = :userId ORDER BY s.lastSearched DESC")
    List<SearchAnalytics> findByUserId(@Param("userId") Long userId);

    /**
     * Get total search count
     */
    @Query("SELECT SUM(s.searchCount) FROM SearchAnalytics s")
    Long getTotalSearchCount();

    /**
     * Get unique search terms count
     */
    @Query("SELECT COUNT(DISTINCT s.searchTerm) FROM SearchAnalytics s")
    Long getUniqueSearchTermsCount();

    /**
     * Get search analytics for a specific period
     */
    @Query("SELECT s FROM SearchAnalytics s WHERE s.lastSearched BETWEEN :startDate AND :endDate ORDER BY s.searchCount DESC")
    List<SearchAnalytics> findSearchesBetweenDates(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Find searches with no results (helps identify content gaps)
     */
    @Query("SELECT s FROM SearchAnalytics s WHERE s.resultsCount = 0 ORDER BY s.searchCount DESC")
    List<SearchAnalytics> findSearchesWithNoResults();
}