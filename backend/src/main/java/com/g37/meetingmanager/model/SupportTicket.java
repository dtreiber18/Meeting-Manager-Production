package com.g37.meetingmanager.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Entity representing a support ticket in the system
 */
@Entity
@Table(name = "support_tickets")
public class SupportTicket {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Ticket number is required")
    @Size(max = 20, message = "Ticket number must not exceed 20 characters")
    @Column(name = "ticket_number", nullable = false, unique = true)
    private String ticketNumber;
    
    @NotBlank(message = "Subject is required")
    @Size(max = 255, message = "Subject must not exceed 255 characters")
    @Column(nullable = false)
    private String subject;
    
    @NotBlank(message = "Description is required")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
    
    @NotNull(message = "Priority is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;
    
    @NotNull(message = "Category is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;
    
    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.OPEN;
    
    @NotNull
    @Column(name = "submitted_by", nullable = false)
    private Long submittedBy;
    
    @Column(name = "assigned_to")
    private Long assignedTo;
    
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
    
    @Column(name = "resolved_by")
    private Long resolvedBy;
    
    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Enums
    public enum Priority {
        LOW, MEDIUM, HIGH, URGENT
    }
    
    public enum Category {
        TECHNICAL, ACCOUNT, BILLING, FEATURE, OTHER
    }
    
    public enum Status {
        OPEN, IN_PROGRESS, WAITING_FOR_CUSTOMER, RESOLVED, CLOSED, CANCELLED
    }
    
    // Default constructor
    public SupportTicket() {}
    
    // Constructor for creating new tickets
    public SupportTicket(String subject, String description, Priority priority, Category category, Long submittedBy) {
        this.subject = subject;
        this.description = description;
        this.priority = priority;
        this.category = category;
        this.submittedBy = submittedBy;
        this.status = Status.OPEN;
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
    
    public Priority getPriority() {
        return priority;
    }
    
    public void setPriority(Priority priority) {
        this.priority = priority;
    }
    
    public Category getCategory() {
        return category;
    }
    
    public void setCategory(Category category) {
        this.category = category;
    }
    
    public Status getStatus() {
        return status;
    }
    
    public void setStatus(Status status) {
        this.status = status;
    }
    
    public Long getSubmittedBy() {
        return submittedBy;
    }
    
    public void setSubmittedBy(Long submittedBy) {
        this.submittedBy = submittedBy;
    }
    
    public Long getAssignedTo() {
        return assignedTo;
    }
    
    public void setAssignedTo(Long assignedTo) {
        this.assignedTo = assignedTo;
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
    
    /**
     * Mark ticket as resolved
     */
    public void markAsResolved(Long resolvedBy, String resolutionNotes) {
        this.status = Status.RESOLVED;
        this.resolvedAt = LocalDateTime.now();
        this.resolvedBy = resolvedBy;
        this.resolutionNotes = resolutionNotes;
    }
    
    /**
     * Check if ticket is open
     */
    public boolean isOpen() {
        return status == Status.OPEN || status == Status.IN_PROGRESS || status == Status.WAITING_FOR_CUSTOMER;
    }
    
    /**
     * Check if ticket is resolved
     */
    public boolean isResolved() {
        return status == Status.RESOLVED || status == Status.CLOSED;
    }
    
    /**
     * Get age of ticket in hours
     */
    public long getAgeInHours() {
        return java.time.Duration.between(createdAt, LocalDateTime.now()).toHours();
    }
    
    /**
     * Get resolution time in hours (if resolved)
     */
    public Long getResolutionTimeInHours() {
        if (resolvedAt == null) return null;
        return java.time.Duration.between(createdAt, resolvedAt).toHours();
    }
    
    @Override
    public String toString() {
        return "SupportTicket{" +
                "id=" + id +
                ", ticketNumber='" + ticketNumber + '\'' +
                ", subject='" + subject + '\'' +
                ", priority=" + priority +
                ", category=" + category +
                ", status=" + status +
                ", submittedBy=" + submittedBy +
                ", assignedTo=" + assignedTo +
                ", createdAt=" + createdAt +
                ", resolvedAt=" + resolvedAt +
                '}';
    }
}