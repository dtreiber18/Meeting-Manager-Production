package com.g37.meetingmanager.model;

import com.g37.meetingmanager.model.PendingAction.Priority;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_suggestions", indexes = {
    @Index(columnList = "meetingId"),
    @Index(columnList = "status"),
    @Index(columnList = "priority"),
    @Index(columnList = "targetSystem"),
    @Index(columnList = "createdAt")
})
public class AISuggestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(nullable = false)
    private Long meetingId;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false)
    private String title;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority = Priority.MEDIUM;

    @Size(max = 255)
    private String suggestedAssignee;

    @Column(precision = 5, scale = 2)
    private BigDecimal estimatedHours;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String reasoning;

    @Size(max = 50)
    private String targetSystem; // 'zoho', 'clickup', null

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SuggestionStatus status = SuggestionStatus.PENDING;

    private LocalDateTime acceptedAt;
    private LocalDateTime dismissedAt;
    private LocalDateTime sentAt;

    @Size(max = 50)
    private String sentToSystem; // System it was actually sent to

    @Size(max = 255)
    private String externalId; // ID in external system (Zoho/ClickUp)

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    private Long createdByUserId;

    // Constructors
    public AISuggestion() {}

    public AISuggestion(Long meetingId, String title, String description, Priority priority,
                        String suggestedAssignee, BigDecimal estimatedHours, String reasoning) {
        this.meetingId = meetingId;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.suggestedAssignee = suggestedAssignee;
        this.estimatedHours = estimatedHours;
        this.reasoning = reasoning;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getMeetingId() {
        return meetingId;
    }

    public void setMeetingId(Long meetingId) {
        this.meetingId = meetingId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
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

    public String getSuggestedAssignee() {
        return suggestedAssignee;
    }

    public void setSuggestedAssignee(String suggestedAssignee) {
        this.suggestedAssignee = suggestedAssignee;
    }

    public BigDecimal getEstimatedHours() {
        return estimatedHours;
    }

    public void setEstimatedHours(BigDecimal estimatedHours) {
        this.estimatedHours = estimatedHours;
    }

    public String getReasoning() {
        return reasoning;
    }

    public void setReasoning(String reasoning) {
        this.reasoning = reasoning;
    }

    public String getTargetSystem() {
        return targetSystem;
    }

    public void setTargetSystem(String targetSystem) {
        this.targetSystem = targetSystem;
    }

    public SuggestionStatus getStatus() {
        return status;
    }

    public void setStatus(SuggestionStatus status) {
        this.status = status;
        // Update timestamp based on status
        LocalDateTime now = LocalDateTime.now();
        switch (status) {
            case ACCEPTED:
                this.acceptedAt = now;
                break;
            case DISMISSED:
                this.dismissedAt = now;
                break;
            case SENT:
                this.sentAt = now;
                break;
            default:
                break;
        }
    }

    public LocalDateTime getAcceptedAt() {
        return acceptedAt;
    }

    public void setAcceptedAt(LocalDateTime acceptedAt) {
        this.acceptedAt = acceptedAt;
    }

    public LocalDateTime getDismissedAt() {
        return dismissedAt;
    }

    public void setDismissedAt(LocalDateTime dismissedAt) {
        this.dismissedAt = dismissedAt;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }

    public String getSentToSystem() {
        return sentToSystem;
    }

    public void setSentToSystem(String sentToSystem) {
        this.sentToSystem = sentToSystem;
    }

    public String getExternalId() {
        return externalId;
    }

    public void setExternalId(String externalId) {
        this.externalId = externalId;
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

    public Long getCreatedByUserId() {
        return createdByUserId;
    }

    public void setCreatedByUserId(Long createdByUserId) {
        this.createdByUserId = createdByUserId;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = LocalDateTime.now();
        }
    }

    // Enum for suggestion status
    public enum SuggestionStatus {
        PENDING,    // Waiting for user action
        ACCEPTED,   // User accepted and added as action item
        DISMISSED,  // User dismissed the suggestion
        SENT        // Sent to external system (Zoho/ClickUp)
    }
}
