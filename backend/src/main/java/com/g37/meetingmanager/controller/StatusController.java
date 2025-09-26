package com.g37.meetingmanager.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/status")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201", "https://dtreiber18.github.io"})
public class StatusController {
    
    private static final Logger logger = LoggerFactory.getLogger(StatusController.class);
    
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testStatus() {
        logger.info("Status controller test endpoint called");
        
        return ResponseEntity.ok(Map.of(
            "status", "active",
            "message", "Backend is running successfully",
            "timestamp", java.time.LocalDateTime.now().toString(),
            "version", "1.0.0",
            "deployment", "production"
        ));
    }
}