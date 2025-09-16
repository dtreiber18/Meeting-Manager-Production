package com.g37.meetingmanager.dto;

/**
 * Data Transfer Object for Search Results
 */
public class SearchResultDTO {
    
    private Long id;
    private String title;
    private String snippet;
    private String type; // 'article' or 'faq'
    private String category;
    private Double relevanceScore;
    private String url;
    
    // Default constructor
    public SearchResultDTO() {}
    
    // Constructor for search results
    public SearchResultDTO(Long id, String title, String snippet, String type, String category, Double relevanceScore) {
        this.id = id;
        this.title = title;
        this.snippet = snippet;
        this.type = type;
        this.category = category;
        this.relevanceScore = relevanceScore;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getSnippet() {
        return snippet;
    }
    
    public void setSnippet(String snippet) {
        this.snippet = snippet;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public Double getRelevanceScore() {
        return relevanceScore;
    }
    
    public void setRelevanceScore(Double relevanceScore) {
        this.relevanceScore = relevanceScore;
    }
    
    public String getUrl() {
        return url;
    }
    
    public void setUrl(String url) {
        this.url = url;
    }
    
    @Override
    public String toString() {
        return "SearchResultDTO{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", snippet='" + snippet + '\'' +
                ", type='" + type + '\'' +
                ", category='" + category + '\'' +
                ", relevanceScore=" + relevanceScore +
                '}';
    }
}