package com.g37.meetingmanager.controller;

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
    
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getNotifications() {
        logger.info("Getting notifications");
        
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
    }
    
    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        logger.info("Getting unread count");
        return ResponseEntity.ok(Map.of("count", 3L));
    }
    
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testEndpoint() {
        logger.info("Notification controller test endpoint called");
        
        return ResponseEntity.ok(Map.of(
            "status", "ok",
            "message", "NotificationController is working properly (mock implementation)",
            "timestamp", java.time.LocalDateTime.now().toString(),
            "unreadCount", 3L,
            "version", "production-mock",
            "note", "This is a temporary mock implementation for production deployment testing"
        ));
    }
}
