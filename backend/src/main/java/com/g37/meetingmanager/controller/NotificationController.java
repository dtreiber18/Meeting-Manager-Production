package com.g37.meetingmanager.controller;

import com.g37.meetingmanager.model.NotificationDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;


import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);

    @PostConstruct
    public void init() {
        logger.warn("⚠️ NotificationController initialized WITHOUT MongoDB - Fallback mode");
    }
    
    @GetMapping
    public ResponseEntity<List<NotificationDocument>> getNotifications(@RequestParam(required = false) String email) {
        logger.info("✅ NotificationController: Getting notifications - Fallback mode");
        logger.warn("MongoDB not available, returning empty notification list");
        return ResponseEntity.ok(Collections.emptyList());
    }
    
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(@RequestParam(required = false) String email) {
        logger.info("✅ NotificationController: Getting unread count - Fallback mode");
        
        logger.warn("MongoDB not available, returning 0 unread count");
        Map<String, Object> response = new HashMap<>();
        response.put("unreadCount", 0);
        response.put("status", "mongodb_disabled");
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> createNotification(@RequestBody NotificationDocument notification) {
        logger.info("✅ NotificationController: Creating notification - Fallback mode");
        
        logger.warn("MongoDB not available, notification not saved");
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Notification feature temporarily unavailable");
        response.put("status", "mongodb_disabled");
        
        return ResponseEntity.accepted().body(response);
    }
    
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable String notificationId) {
        logger.info("✅ NotificationController: Marking notification as read - Fallback mode");
        
        logger.warn("MongoDB not available, cannot mark as read");
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Notification feature temporarily unavailable");
        response.put("status", "mongodb_disabled");
        
        return ResponseEntity.accepted().body(response);
    }
    
    @GetMapping("/system-stats")
    public ResponseEntity<Map<String, Object>> getSystemStats() {
        logger.info("✅ NotificationController: Getting system stats - Fallback mode");
        
        logger.warn("MongoDB not available, returning empty stats");
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalNotifications", 0);
        stats.put("unreadNotifications", 0);
        stats.put("readNotifications", 0);
        stats.put("status", "mongodb_disabled");
        
        return ResponseEntity.ok(stats);
    }
}
