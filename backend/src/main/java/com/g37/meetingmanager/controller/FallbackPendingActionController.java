package com.g37.meetingmanager.controller;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pending-actions")
@ConditionalOnProperty(name = "spring.data.mongodb.uri", havingValue = "false", matchIfMissing = true)
@CrossOrigin(origins = {"http://localhost:4200", "https://dougtreiber.github.io"})
public class FallbackPendingActionController {

    /**
     * Fallback endpoint for getting pending actions when MongoDB is not available
     */
    @GetMapping
    public ResponseEntity<List<Object>> getPendingActions() {
        // Return empty list when MongoDB is not available
        return ResponseEntity.ok(Collections.emptyList());
    }

    /**
     * Fallback endpoint for getting pending actions by meeting ID
     */
    @GetMapping("/meeting/{meetingId}")
    public ResponseEntity<List<Object>> getPendingActionsByMeeting(@PathVariable Long meetingId) {
        return ResponseEntity.ok(Collections.emptyList());
    }

    /**
     * Fallback endpoint for getting pending actions by assignee
     */
    @GetMapping("/assignee/{assigneeId}")
    public ResponseEntity<List<Object>> getPendingActionsByAssignee(@PathVariable Long assigneeId) {
        return ResponseEntity.ok(Collections.emptyList());
    }

    /**
     * Fallback endpoint for getting pending action statistics
     */
    @GetMapping("/statistics/{userId}")
    public ResponseEntity<Map<String, Object>> getStatistics(@PathVariable Long userId) {
        Map<String, Object> stats = Map.of(
            "total", 0,
            "pending", 0,
            "active", 0,
            "completed", 0,
            "rejected", 0,
            "overdue", 0,
            "completionRate", 0.0,
            "approvalRate", 0.0
        );
        return ResponseEntity.ok(stats);
    }

    /**
     * Fallback endpoint for creating pending actions
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createPendingAction(@RequestBody Object pendingAction) {
        Map<String, Object> response = Map.of(
            "message", "Pending actions feature is temporarily unavailable",
            "status", "mongo_disabled"
        );
        return ResponseEntity.accepted().body(response);
    }

    /**
     * Fallback endpoint for updating pending actions
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updatePendingAction(
            @PathVariable String id, 
            @RequestBody Object actionDetails) {
        Map<String, Object> response = Map.of(
            "message", "Pending actions feature is temporarily unavailable",
            "status", "mongo_disabled"
        );
        return ResponseEntity.accepted().body(response);
    }

    /**
     * Fallback endpoint for deleting pending actions
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deletePendingAction(@PathVariable String id) {
        Map<String, Object> response = Map.of(
            "message", "Pending actions feature is temporarily unavailable",
            "status", "mongo_disabled"
        );
        return ResponseEntity.accepted().body(response);
    }
}