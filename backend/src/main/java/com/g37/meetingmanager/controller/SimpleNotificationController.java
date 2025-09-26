package com.g37.meetingmanager.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Simplified NotificationController for debugging controller registration issues
 */
@RestController
@RequestMapping("/api/simple-notifications")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201", "https://dtreiber18.github.io"})
public class SimpleNotificationController {
    
    private static final Logger logger = LoggerFactory.getLogger(SimpleNotificationController.class);
    
    /**
     * Simple test endpoint to verify controller registration
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testEndpoint() {
        logger.info("SimpleNotificationController test endpoint called successfully");
        return ResponseEntity.ok(Map.of(
            "status", "success",
            "message", "SimpleNotificationController is working perfectly!",
            "timestamp", java.time.LocalDateTime.now().toString(),
            "controller", "SimpleNotificationController"
        ));
    }
    
    /**
     * Mock notifications endpoint
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotifications() {
        logger.info("SimpleNotificationController getNotifications called");
        return ResponseEntity.ok(Map.of(
            "message", "Mock notifications endpoint working", 
            "notifications", List.of(),
            "count", 0
        ));
    }
}