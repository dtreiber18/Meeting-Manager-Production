package com.g37.meetingmanager.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pending-actions")
@CrossOrigin(origins = "*")
@ConditionalOnProperty(name = "spring.data.mongodb.uri", matchIfMissing = false)
public class PendingActionController {
    
    private static final Logger logger = LoggerFactory.getLogger(PendingActionController.class);

    public PendingActionController() {
        logger.info("PendingActionController initialized - basic implementation to prevent 404 errors");
    }
    
    @GetMapping("/meeting/{meetingId}")
    public ResponseEntity<List<Map<String, Object>>> getPendingActionsByMeeting(@PathVariable Long meetingId) {
        logger.info("Getting pending actions for meeting ID: {}", meetingId);
        
        // Return empty list for now - this prevents the 404 error
        List<Map<String, Object>> pendingActions = Collections.emptyList();
        
        return ResponseEntity.ok(pendingActions);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getPendingActionById(@PathVariable String id) {
        logger.info("Getting pending action with ID: {}", id);
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testEndpoint() {
        logger.info("Pending action controller test endpoint called");
        
        return ResponseEntity.ok(Map.of(
            "status", "ok",
            "message", "PendingActionController is working - basic implementation",
            "timestamp", LocalDateTime.now().toString()
        ));
    }
}
