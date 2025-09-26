package com.g37.meetingmanager.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);

    public NotificationController() {
        logger.info("NotificationController initialized");
    }
    
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getNotifications() {
        logger.info("Getting notifications");
        
        // Return empty list for now until database/service is implemented
        // This prevents errors in the frontend
        List<Map<String, Object>> notifications = Collections.emptyList();
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
// Trigger fresh deployment after GitHub Actions infrastructure issue
