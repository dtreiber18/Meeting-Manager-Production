package com.g37.meetingmanager.controller;

import com.g37.meetingmanager.model.Notification;
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
    
    private Long getCurrentUserId(HttpServletRequest request) {
        logger.debug("Getting current user ID, using default: 1");
        return 1L;
    }
    
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
    
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testEndpoint(HttpServletRequest request) {
        logger.info("Notification controller test endpoint called");
        
        try {
            Long userId = getCurrentUserId(request);
            long notificationCount = notificationService.getUnreadCount(userId);
            
            return ResponseEntity.ok(Map.of(
                "status", "ok",
                "message", "NotificationController is working properly",
                "timestamp", java.time.LocalDateTime.now().toString(),
                "userId", userId,
                "unreadCount", notificationCount,
                "version", "production"
            ));
        } catch (Exception e) {
            logger.error("Error in test endpoint", e);
            return ResponseEntity.ok(Map.of(
                "status", "error",
                "message", "Controller working but service may have issues: " + e.getMessage(),
                "timestamp", java.time.LocalDateTime.now().toString()
            ));
        }
    }
}
