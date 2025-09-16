package com.g37.meetingmanager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for Support Ticket
 */
public class SupportTicketDTO {
    
    private Long id;
    private String ticketNumber;
    
    @NotBlank(message = "Subject is required")
    @Size(max = 255, message = "Subject must not exceed 255 characters")
    private String subject;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    @NotNull(message = "Priority is required")
    private String priority;
    
    @NotNull(message = "Category is required")
    private String category;
    
    private String status;
    private Long submittedBy;
    private String submittedByName;
    private Long assignedTo;
    private String assignedToName;
    private LocalDateTime resolvedAt;
    private Long resolvedBy;
    private String resolvedByName;
    private String resolutionNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long ageInHours;
    private Long resolutionTimeInHours;
    
    // Default constructor
    public SupportTicketDTO() {}
    
    // Constructor for new tickets
    public SupportTicketDTO(String subject, String description, String priority, String category) {
        this.subject = subject;
        this.description = description;
        this.priority = priority;
        this.category = category;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTicketNumber() {
        return ticketNumber;
    }
    
    public void setTicketNumber(String ticketNumber) {
        this.ticketNumber = ticketNumber;
    }
    
    public String getSubject() {
        return subject;
    }
    
    public void setSubject(String subject) {
        this.subject = subject;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getPriority() {
        return priority;
    }
    
    public void setPriority(String priority) {
        this.priority = priority;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public Long getSubmittedBy() {
        return submittedBy;
    }
    
    public void setSubmittedBy(Long submittedBy) {
        this.submittedBy = submittedBy;
    }
    
    public String getSubmittedByName() {
        return submittedByName;
    }
    
    public void setSubmittedByName(String submittedByName) {
        this.submittedByName = submittedByName;
    }
    
    public Long getAssignedTo() {
        return assignedTo;
    }
    
    public void setAssignedTo(Long assignedTo) {
        this.assignedTo = assignedTo;
    }
    
    public String getAssignedToName() {
        return assignedToName;
    }
    
    public void setAssignedToName(String assignedToName) {
        this.assignedToName = assignedToName;
    }
    
    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }
    
    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }
    
    public Long getResolvedBy() {
        return resolvedBy;
    }
    
    public void setResolvedBy(Long resolvedBy) {
        this.resolvedBy = resolvedBy;
    }
    
    public String getResolvedByName() {
        return resolvedByName;
    }
    
    public void setResolvedByName(String resolvedByName) {
        this.resolvedByName = resolvedByName;
    }
    
    public String getResolutionNotes() {
        return resolutionNotes;
    }
    
    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
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
    
    public Long getAgeInHours() {
        return ageInHours;
    }
    
    public void setAgeInHours(Long ageInHours) {
        this.ageInHours = ageInHours;
    }
    
    public Long getResolutionTimeInHours() {
        return resolutionTimeInHours;
    }
    
    public void setResolutionTimeInHours(Long resolutionTimeInHours) {
        this.resolutionTimeInHours = resolutionTimeInHours;
    }
    
    @Override
    public String toString() {
        return "SupportTicketDTO{" +
                "id=" + id +
                ", ticketNumber='" + ticketNumber + '\'' +
                ", subject='" + subject + '\'' +
                ", priority='" + priority + '\'' +
                ", category='" + category + '\'' +
                ", status='" + status + '\'' +
                ", submittedBy=" + submittedBy +
                ", submittedByName='" + submittedByName + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}