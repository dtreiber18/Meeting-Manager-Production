package com.g37.meetingmanager.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Entity representing a FAQ (Frequently Asked Question) in the system
 */
@Entity
@Table(name = "help_faqs")
public class HelpFAQ {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Question is required")
    @Size(max = 500, message = "Question must not exceed 500 characters")
    @Column(nullable = false, length = 500)
    private String question;
    
    @NotBlank(message = "Answer is required")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String answer;
    
    @NotBlank(message = "Category is required")
    @Size(max = 100, message = "Category must not exceed 100 characters")
    @Column(nullable = false)
    private String category;
    
    @ElementCollection
    @CollectionTable(name = "help_faq_tags", joinColumns = @JoinColumn(name = "faq_id"))
    @Column(name = "tag")
    private List<String> tags;
    
    @Column(name = "view_count", nullable = false, columnDefinition = "INTEGER DEFAULT 0")
    private Integer viewCount = 0;
    
    @Column(name = "is_published", nullable = false, columnDefinition = "BOOLEAN DEFAULT true")
    private Boolean isPublished = true;
    
    @Column(name = "sort_order", nullable = false, columnDefinition = "INTEGER DEFAULT 0")
    private Integer sortOrder = 0;
    
    @Column(name = "helpful_count", nullable = false, columnDefinition = "INTEGER DEFAULT 0")
    private Integer helpfulCount = 0;
    
    @Column(name = "not_helpful_count", nullable = false, columnDefinition = "INTEGER DEFAULT 0")
    private Integer notHelpfulCount = 0;
    
    @NotNull
    @Column(name = "created_by", nullable = false)
    private Long createdBy;
    
    @Column(name = "updated_by")
    private Long updatedBy;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Default constructor
    public HelpFAQ() {}
    
    // Constructor for creating new FAQs
    public HelpFAQ(String question, String answer, String category, Long createdBy) {
        this.question = question;
        this.answer = answer;
        this.category = category;
        this.createdBy = createdBy;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getQuestion() {
        return question;
    }
    
    public void setQuestion(String question) {
        this.question = question;
    }
    
    public String getAnswer() {
        return answer;
    }
    
    public void setAnswer(String answer) {
        this.answer = answer;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public List<String> getTags() {
        return tags;
    }
    
    public void setTags(List<String> tags) {
        this.tags = tags;
    }
    
    public Integer getViewCount() {
        return viewCount;
    }
    
    public void setViewCount(Integer viewCount) {
        this.viewCount = viewCount;
    }
    
    public Boolean getIsPublished() {
        return isPublished;
    }
    
    public void setIsPublished(Boolean isPublished) {
        this.isPublished = isPublished;
    }
    
    public Integer getSortOrder() {
        return sortOrder;
    }
    
    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
    
    public Integer getHelpfulCount() {
        return helpfulCount;
    }
    
    public void setHelpfulCount(Integer helpfulCount) {
        this.helpfulCount = helpfulCount;
    }
    
    public Integer getNotHelpfulCount() {
        return notHelpfulCount;
    }
    
    public void setNotHelpfulCount(Integer notHelpfulCount) {
        this.notHelpfulCount = notHelpfulCount;
    }
    
    public Long getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }
    
    public Long getUpdatedBy() {
        return updatedBy;
    }
    
    public void setUpdatedBy(Long updatedBy) {
        this.updatedBy = updatedBy;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    /**
     * Increment view count
     */
    public void incrementViewCount() {
        this.viewCount = (this.viewCount == null ? 0 : this.viewCount) + 1;
    }
    
    /**
     * Mark as helpful
     */
    public void markAsHelpful() {
        this.helpfulCount = (this.helpfulCount == null ? 0 : this.helpfulCount) + 1;
    }
    
    /**
     * Mark as not helpful
     */
    public void markAsNotHelpful() {
        this.notHelpfulCount = (this.notHelpfulCount == null ? 0 : this.notHelpfulCount) + 1;
    }
    
    /**
     * Calculate helpfulness ratio
     */
    public double getHelpfulnessRatio() {
        int total = (helpfulCount == null ? 0 : helpfulCount) + (notHelpfulCount == null ? 0 : notHelpfulCount);
        if (total == 0) return 0.0;
        return (double) (helpfulCount == null ? 0 : helpfulCount) / total;
    }
    
    @Override
    public String toString() {
        return "HelpFAQ{" +
                "id=" + id +
                ", question='" + question + '\'' +
                ", answer='" + answer + '\'' +
                ", category='" + category + '\'' +
                ", tags=" + tags +
                ", viewCount=" + viewCount +
                ", isPublished=" + isPublished +
                ", sortOrder=" + sortOrder +
                ", helpfulCount=" + helpfulCount +
                ", notHelpfulCount=" + notHelpfulCount +
                ", createdBy=" + createdBy +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}