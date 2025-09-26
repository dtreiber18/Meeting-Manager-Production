package com.g37.meetingmanager.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201", "https://dtreiber18.github.io"})
public class NotificationController {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);
    
    private Long getCurrentUserId(HttpServletRequest request) {
        logger.debug("Getting current user ID, using default: 1");
        return 1L;
    }
    
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getNotifications(HttpServletRequest request) {
        try {
            Long userId = getCurrentUserId(request);
            logger.info("Getting notifications for user: {}", userId);
            
            // Return mock notifications for now until database is set up
            List<Map<String, Object>> notifications = List.of(
                Map.of(
                    "id", 1L,
                    "title", "Sample Notification",
                    "message", "This is a sample notification",
                    "type", "SYSTEM_ANNOUNCEMENT",
                    "priority", "NORMAL",
                    "isRead", false,
                    "createdAt", java.time.LocalDateTime.now().toString()
                )
            );
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            logger.error("Error getting notifications", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(HttpServletRequest request) {
        try {
            Long userId = getCurrentUserId(request);
            logger.debug("Getting unread count for user: {}", userId);
            
            // Return mock count for now
            return ResponseEntity.ok(Map.of("count", 3L));
        } catch (Exception e) {
            logger.error("Error getting unread count", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testEndpoint(HttpServletRequest request) {
        logger.info("Notification controller test endpoint called");
        
        try {
            Long userId = getCurrentUserId(request);
            
            return ResponseEntity.ok(Map.of(
                "status", "ok",
                "message", "NotificationController is working properly (mock implementation)",
                "timestamp", java.time.LocalDateTime.now().toString(),
                "userId", userId,
                "unreadCount", 3L,
                "version", "production-mock",
                "note", "This is a temporary mock implementation for production deployment testing"
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
