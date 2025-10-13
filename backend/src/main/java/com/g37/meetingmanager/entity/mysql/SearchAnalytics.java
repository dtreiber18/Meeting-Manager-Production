package com.g37.meetingmanager.entity.mysql;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity representing search analytics tracking
 */
@Entity
@Table(name = "search_analytics")
public class SearchAnalytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "search_term", nullable = false, length = 500)
    private String searchTerm;

    @Column(name = "search_count", nullable = false)
    private Long searchCount = 1L;

    @Column(name = "first_searched", nullable = false)
    private LocalDateTime firstSearched;

    @Column(name = "last_searched", nullable = false)
    private LocalDateTime lastSearched;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "results_count")
    private Integer resultsCount;

    // Default constructor
    public SearchAnalytics() {
        LocalDateTime now = LocalDateTime.now();
        this.firstSearched = now;
        this.lastSearched = now;
    }

    // Constructor with search term
    public SearchAnalytics(String searchTerm, Long userId, Integer resultsCount) {
        this();
        this.searchTerm = searchTerm;
        this.userId = userId;
        this.resultsCount = resultsCount;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSearchTerm() {
        return searchTerm;
    }

    public void setSearchTerm(String searchTerm) {
        this.searchTerm = searchTerm;
    }

    public Long getSearchCount() {
        return searchCount;
    }

    public void setSearchCount(Long searchCount) {
        this.searchCount = searchCount;
    }

    public LocalDateTime getFirstSearched() {
        return firstSearched;
    }

    public void setFirstSearched(LocalDateTime firstSearched) {
        this.firstSearched = firstSearched;
    }

    public LocalDateTime getLastSearched() {
        return lastSearched;
    }

    public void setLastSearched(LocalDateTime lastSearched) {
        this.lastSearched = lastSearched;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Integer getResultsCount() {
        return resultsCount;
    }

    public void setResultsCount(Integer resultsCount) {
        this.resultsCount = resultsCount;
    }

    // Helper method to increment search count
    public void incrementSearchCount() {
        this.searchCount++;
        this.lastSearched = LocalDateTime.now();
    }

    @Override
    public String toString() {
        return "SearchAnalytics{" +
                "id=" + id +
                ", searchTerm='" + searchTerm + '\'' +
                ", searchCount=" + searchCount +
                ", firstSearched=" + firstSearched +
                ", lastSearched=" + lastSearched +
                ", userId=" + userId +
                ", resultsCount=" + resultsCount +
                '}';
    }
}