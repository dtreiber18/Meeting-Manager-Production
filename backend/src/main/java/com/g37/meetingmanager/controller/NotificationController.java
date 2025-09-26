package com.g37.meetingmanager.controller;

import com.g37.meetingmanager.model.Notification;
import com.g37.meetingmanager.model.NotificationType;
import com.g37.meetingmanager.model.NotificationPriority;
import com.g37.meetingmanager.service.NotificationService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201", "https://dtreiber18.github.io"})
public class NotificationController {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * Get current user ID from JWT token (simplified for demo)
     */
    private Long getCurrentUserId(HttpServletRequest request) {
        // For demo purposes, return user ID 1
        // In production, extract from JWT token
        logger.debug("Getting current user ID, returning default: 1");
        return 1L;
    }
    
    /**
     * Get all notifications for the current user
     */
    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(HttpServletRequest request) {
        try {
            Long userId = getCurrentUserId(request);
            logger.info("Getting notifications for user: {}", userId);
            
            List<Notification> notifications = notificationService.getNotificationsForUser(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            logger.error("Error getting notifications", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Simple test endpoint to verify controller is working
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> testEndpoint() {
        logger.info("Test endpoint called successfully");
        return ResponseEntity.ok(Map.of(
            "status", "ok",
            "message", "NotificationController is working",
            "timestamp", java.time.LocalDateTime.now().toString()
        ));
    }
    
    /**
     * Get unread notification count
     */
    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(HttpServletRequest request) {
        try {
            Long userId = getCurrentUserId(request);
            logger.debug("Getting unread count for user: {}", userId);
            
            long count = notificationService.getUnreadCount(userId);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            logger.error("Error getting unread count", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Mark a notification as read
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<Map<String, String>> markAsRead(@PathVariable Long id, HttpServletRequest request) {
        try {
            Long userId = getCurrentUserId(request);
            logger.info("Marking notification {} as read for user: {}", id, userId);
            
            boolean updated = notificationService.markAsRead(id, userId);
            if (updated) {
                return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error marking notification as read", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to mark notification as read"));
        }
    }
    
    /**
     * Mark all notifications as read
     */
    @PatchMapping("/mark-all-read")
    public ResponseEntity<Map<String, Object>> markAllAsRead(HttpServletRequest request) {
        try {
            Long userId = getCurrentUserId(request);
            logger.info("Marking all notifications as read for user: {}", userId);
            
            int updated = notificationService.markAllAsRead(userId);
            return ResponseEntity.ok(Map.of(
                "message", "All notifications marked as read",
                "updated", updated
            ));
        } catch (Exception e) {
            logger.error("Error marking all notifications as read", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to mark notifications as read"));
        }
    }
    
    /**
     * Delete a notification
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteNotification(@PathVariable Long id, HttpServletRequest request) {
        try {
            Long userId = getCurrentUserId(request);
            logger.info("Deleting notification {} for user: {}", id, userId);
            
            boolean deleted = notificationService.deleteNotification(id, userId);
            if (deleted) {
                return ResponseEntity.ok(Map.of("message", "Notification deleted successfully"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error deleting notification", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete notification"));
        }
    }
    
    /**
     * Create a new notification (for testing/demo purposes)
     */
    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody CreateNotificationRequest request, HttpServletRequest httpRequest) {
        try {
            Long currentUserId = getCurrentUserId(httpRequest);
            logger.info("Creating notification for user {} by user: {}", request.getUserId(), currentUserId);
            
            // For demo purposes, allow creating notifications for yourself
            Long targetUserId = request.getUserId() != null ? request.getUserId() : currentUserId;
            
            Notification notification = notificationService.createNotification(
                targetUserId,
                request.getType(),
                request.getTitle(),
                request.getMessage(),
                request.getPriority() != null ? request.getPriority() : NotificationPriority.NORMAL,
                request.getActionUrl(),
                request.getActionText()
            );
            
            return ResponseEntity.status(HttpStatus.CREATED).body(notification);
        } catch (Exception e) {
            logger.error("Error creating notification", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Request class for creating notifications
     */
    public static class CreateNotificationRequest {
        private Long userId;
        private NotificationType type;
        private String title;
        private String message;
        private NotificationPriority priority;
        private String actionUrl;
        private String actionText;
        
        // Getters and setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        
        public NotificationType getType() { return type; }
        public void setType(NotificationType type) { this.type = type; }
        
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public NotificationPriority getPriority() { return priority; }
        public void setPriority(NotificationPriority priority) { this.priority = priority; }
        
        public String getActionUrl() { return actionUrl; }
        public void setActionUrl(String actionUrl) { this.actionUrl = actionUrl; }
        
        public String getActionText() { return actionText; }
        public void setActionText(String actionText) { this.actionText = actionText; }
    }
}
