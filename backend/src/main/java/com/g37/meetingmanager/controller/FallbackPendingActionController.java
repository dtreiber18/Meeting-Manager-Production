package com.g37.meetingmanager.controller;

import com.g37.meetingmanager.dto.N8nOperationDTO;
import com.g37.meetingmanager.model.PendingAction;
import com.g37.meetingmanager.service.N8nService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pending-actions")
@ConditionalOnProperty(name = "spring.data.mongodb.uri", havingValue = "false", matchIfMissing = true)
@CrossOrigin(origins = {"http://localhost:4200", "https://dougtreiber.github.io"})
public class FallbackPendingActionController {

    private static final Logger logger = LoggerFactory.getLogger(FallbackPendingActionController.class);

    @Autowired(required = false)
    private N8nService n8nService;

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

    /**
     * Fetch pending operations from N8N for a specific event/meeting
     */
    @GetMapping("/n8n/fetch/{eventId}")
    public ResponseEntity<Map<String, Object>> fetchFromN8n(@PathVariable String eventId) {
        logger.info("Fetching pending operations from N8N for event: {}", eventId);

        if (n8nService == null || !n8nService.isN8nAvailable()) {
            return ResponseEntity.ok(Map.of(
                "status", "unavailable",
                "message", "N8N service is not enabled or configured",
                "operations", Collections.emptyList()
            ));
        }

        try {
            // Fetch operations from N8N
            List<N8nOperationDTO> n8nOperations = n8nService.getPendingOperations(eventId);

            // Convert to PendingAction models
            List<PendingAction> pendingActions = n8nOperations.stream()
                .map(n8nService::convertToPendingAction)
                .collect(Collectors.toList());

            logger.info("Successfully fetched {} operations from N8N", pendingActions.size());

            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Fetched pending operations from N8N",
                "count", pendingActions.size(),
                "operations", pendingActions
            ));

        } catch (Exception e) {
            logger.error("Error fetching operations from N8N: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "status", "error",
                "message", "Failed to fetch operations from N8N: " + e.getMessage(),
                "operations", Collections.emptyList()
            ));
        }
    }

    /**
     * Test N8N connectivity
     */
    @GetMapping("/n8n/test")
    public ResponseEntity<Map<String, Object>> testN8nConnection() {
        logger.info("Testing N8N connection");

        if (n8nService == null) {
            return ResponseEntity.ok(Map.of(
                "status", "not_configured",
                "message", "N8N service bean not found",
                "available", false
            ));
        }

        boolean available = n8nService.isN8nAvailable();

        return ResponseEntity.ok(Map.of(
            "status", available ? "available" : "unavailable",
            "message", available
                ? "N8N service is configured and ready"
                : "N8N service is not properly configured",
            "available", available
        ));
    }
}