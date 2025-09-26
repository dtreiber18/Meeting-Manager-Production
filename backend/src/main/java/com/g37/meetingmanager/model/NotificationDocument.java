package com.g37.meetingmanager.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.index.Indexed;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "mnm_notifications")
@JsonIgnoreProperties(ignoreUnknown = true)
public class NotificationDocument {
    
    @Id
    private String id; // MongoDB ObjectId
    
    @NotBlank
    @Field("user_id")
    @Indexed
    private String userId;
    
    @Size(max = 255)
    @Field("user_email")
    @Indexed
    private String userEmail;
    
    @NotNull
    @Field("type")
    @Indexed
    private NotificationType type;
    
    @NotBlank
    @Size(max = 255)
    @Field("title")
    private String title;
    
    @NotBlank
    @Size(max = 1000)
    @Field("message")
    private String message;
    
    @Field("data")
    private Map<String, Object> data;
    
    @Field("is_read")
    @Indexed
    private Boolean isRead = false;
    
    @Field("created_at")
    @Indexed
    private LocalDateTime createdAt;
    
    @Field("updated_at")
    private LocalDateTime updatedAt;
    
    @Field("expires_at")
    @Indexed
    private LocalDateTime expiresAt;
    
    @NotNull
    @Field("priority")
    @Indexed
    private NotificationPriority priority = NotificationPriority.NORMAL;
    
    @Size(max = 500)
    @Field("action_url")
    private String actionUrl;
    
    @Size(max = 100)
    @Field("action_text")
    private String actionText;
    
    @Field("organization_id")
    @Indexed
    private Long organizationId;
    
    @Field("meeting_id")
    @Indexed
    private Long meetingId;
    
    @Field("action_item_id")
    @Indexed
    private String actionItemId;
    
    @Field("read_at")
    private LocalDateTime readAt;
    
    @Field("delivered_at")
    private LocalDateTime deliveredAt;
    
    @Field("email_sent")
    private Boolean emailSent = false;
    
    @Field("push_sent")
    private Boolean pushSent = false;
    
    @Field("sms_sent")
    private Boolean smsSent = false;
    
    // Constructors
    public NotificationDocument() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public NotificationDocument(String userId, NotificationType type, String title, String message) {
        this();
        this.userId = userId;
        this.type = type;
        this.title = title;
        this.message = message;
    }
    
    // Helper methods
    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }
    
    public void markAsRead() {
        this.isRead = true;
        this.readAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public void markAsDelivered() {
        this.deliveredAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public void updateTimestamp() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Enums
    public enum NotificationType {
        MEETING_REMINDER,
        MEETING_INVITATION,
        MEETING_UPDATED,
        MEETING_CANCELLED,
        ACTION_ITEM_ASSIGNED,
        ACTION_ITEM_DUE,
        ACTION_ITEM_OVERDUE,
        SYSTEM_ANNOUNCEMENT,
        USER_MENTION,
        DOCUMENT_SHARED,
        WEEKLY_DIGEST,
        CALENDAR_SYNC_ERROR,
        PROFILE_UPDATED,
        PASSWORD_CHANGED,
        LOGIN_ALERT
    }
    
    public enum NotificationPriority {
        LOW,
        NORMAL,
        HIGH,
        URGENT
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    
    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public Map<String, Object> getData() { return data; }
    public void setData(Map<String, Object> data) { this.data = data; }
    
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    
    public NotificationPriority getPriority() { return priority; }
    public void setPriority(NotificationPriority priority) { this.priority = priority; }
    
    public String getActionUrl() { return actionUrl; }
    public void setActionUrl(String actionUrl) { this.actionUrl = actionUrl; }
    
    public String getActionText() { return actionText; }
    public void setActionText(String actionText) { this.actionText = actionText; }
    
    public Long getOrganizationId() { return organizationId; }
    public void setOrganizationId(Long organizationId) { this.organizationId = organizationId; }
    
    public Long getMeetingId() { return meetingId; }
    public void setMeetingId(Long meetingId) { this.meetingId = meetingId; }
    
    public String getActionItemId() { return actionItemId; }
    public void setActionItemId(String actionItemId) { this.actionItemId = actionItemId; }
    
    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }
    
    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(LocalDateTime deliveredAt) { this.deliveredAt = deliveredAt; }
    
    public Boolean getEmailSent() { return emailSent; }
    public void setEmailSent(Boolean emailSent) { this.emailSent = emailSent; }
    
    public Boolean getPushSent() { return pushSent; }
    public void setPushSent(Boolean pushSent) { this.pushSent = pushSent; }
    
    public Boolean getSmsSent() { return smsSent; }
    public void setSmsSent(Boolean smsSent) { this.smsSent = smsSent; }
}