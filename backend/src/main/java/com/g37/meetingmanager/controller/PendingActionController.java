package com.g37.meetingmanager.controller;

import com.g37.meetingmanager.dto.N8nOperationDTO;
import com.g37.meetingmanager.model.PendingAction;
import com.g37.meetingmanager.service.N8nService;
import com.g37.meetingmanager.service.PendingActionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pending-actions")
@CrossOrigin(origins = "*")
@ConditionalOnProperty(name = "spring.data.mongodb.uri", matchIfMissing = false)
public class PendingActionController {

    private static final Logger logger = LoggerFactory.getLogger(PendingActionController.class);

    @Autowired(required = false)
    private N8nService n8nService;

    @Autowired(required = false)
    private PendingActionService pendingActionService;

    public PendingActionController() {
        logger.info("PendingActionController initialized - MongoDB-enabled implementation");
    }
    
    @GetMapping("/meeting/{meetingId}")
    public ResponseEntity<List<PendingAction>> getPendingActionsByMeeting(@PathVariable Long meetingId) {
        logger.info("Getting pending actions for meeting ID: {}", meetingId);

        if (pendingActionService == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<PendingAction> pendingActions = pendingActionService.getPendingActionsByMeeting(meetingId);
        return ResponseEntity.ok(pendingActions);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PendingAction> getPendingActionById(@PathVariable String id) {
        logger.info("Getting pending action with ID: {}", id);

        if (pendingActionService == null) {
            return ResponseEntity.notFound().build();
        }

        return pendingActionService.getPendingActionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/assignee/{assigneeId}")
    public ResponseEntity<List<Map<String, Object>>> getPendingActionsByAssignee(@PathVariable Long assigneeId) {
        logger.info("Getting pending actions for assignee ID: {}", assigneeId);
        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Map<String, Object>>> getPendingActionsByStatus(@PathVariable String status) {
        logger.info("Getting pending actions with status: {}", status);
        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<Map<String, Object>>> getOverduePendingActions() {
        logger.info("Getting overdue pending actions");
        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/due-soon")
    public ResponseEntity<List<Map<String, Object>>> getPendingActionsDueSoon(@RequestParam(defaultValue = "7") int days) {
        logger.info("Getting pending actions due within {} days", days);
        return ResponseEntity.ok(Collections.emptyList());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createPendingAction(@RequestBody Map<String, Object> pendingAction) {
        logger.info("Creating pending action: {}", pendingAction.get("title"));
        Map<String, Object> response = Map.of(
            "message", "Pending action creation - MongoDB service integration pending",
            "status", "accepted"
        );
        return ResponseEntity.accepted().body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updatePendingAction(@PathVariable String id, @RequestBody Map<String, Object> actionDetails) {
        logger.info("Updating pending action with ID: {}", id);
        Map<String, Object> response = Map.of(
            "message", "Pending action update - MongoDB service integration pending",
            "status", "accepted"
        );
        return ResponseEntity.accepted().body(response);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<PendingAction> approvePendingAction(
            @PathVariable String id,
            @RequestParam Long approvedById,
            @RequestParam(required = false) String notes) {
        logger.info("Approving pending action {} by user {}", id, approvedById);

        if (pendingActionService == null) {
            return ResponseEntity.status(503).build();
        }

        try {
            PendingAction approved = pendingActionService.approvePendingAction(id, approvedById, notes);
            return ResponseEntity.ok(approved);
        } catch (Exception e) {
            logger.error("Error approving pending action", e);
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<PendingAction> rejectPendingAction(
            @PathVariable String id,
            @RequestParam Long rejectedById,
            @RequestParam(required = false) String notes) {
        logger.info("Rejecting pending action {} by user {}", id, rejectedById);

        if (pendingActionService == null) {
            return ResponseEntity.status(503).build();
        }

        try {
            PendingAction rejected = pendingActionService.rejectPendingAction(id, rejectedById, notes);
            return ResponseEntity.ok(rejected);
        } catch (Exception e) {
            logger.error("Error rejecting pending action", e);
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<Map<String, Object>> completePendingAction(
            @PathVariable String id, 
            @RequestParam(required = false) String completionNotes) {
        logger.info("Completing pending action {}", id);
        Map<String, Object> response = Map.of(
            "message", "Pending action completion - MongoDB service integration pending",
            "status", "accepted"
        );
        return ResponseEntity.accepted().body(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deletePendingAction(@PathVariable String id) {
        logger.info("Deleting pending action with ID: {}", id);
        Map<String, Object> response = Map.of(
            "message", "Pending action deletion - MongoDB service integration pending",
            "status", "accepted"
        );
        return ResponseEntity.accepted().body(response);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getPendingActions(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long organizationId,
            @RequestParam(required = false) List<String> statuses,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        logger.info("Getting pending actions with pagination");
        Map<String, Object> response = Map.of(
            "content", Collections.emptyList(),
            "totalElements", 0,
            "totalPages", 0,
            "size", size,
            "number", page
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> searchPendingActions(
            @RequestParam String searchText,
            @RequestParam(required = false) Long organizationId) {
        logger.info("Searching pending actions with text: {}", searchText);
        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/statistics/{userId}")
    public ResponseEntity<Map<String, Object>> getStatistics(@PathVariable Long userId) {
        logger.info("Getting pending action statistics for user: {}", userId);
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

    @PostMapping("/from-meeting/{meetingId}")
    public ResponseEntity<Map<String, Object>> createPendingActionsFromMeeting(
            @PathVariable Long meetingId,
            @RequestParam Long reporterId) {
        logger.info("Creating pending actions from meeting {} by user {}", meetingId, reporterId);
        Map<String, Object> response = Map.of(
            "message", "Feature not yet implemented - MongoDB service integration pending",
            "status", "not_implemented"
        );
        return ResponseEntity.accepted().body(response);
    }

    @PostMapping("/bulk/approve")
    public ResponseEntity<List<PendingAction>> bulkApprovePendingActions(
            @RequestBody List<String> ids,
            @RequestParam Long approvedById,
            @RequestParam(required = false) String notes) {
        logger.info("Bulk approving {} pending actions by user {}", ids.size(), approvedById);

        if (pendingActionService == null) {
            return ResponseEntity.status(503).build();
        }

        try {
            List<PendingAction> approved = pendingActionService.bulkApprovePendingActions(ids, approvedById, notes);
            return ResponseEntity.ok(approved);
        } catch (Exception e) {
            logger.error("Error bulk approving pending actions", e);
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/bulk/reject")
    public ResponseEntity<List<PendingAction>> bulkRejectPendingActions(
            @RequestBody List<String> ids,
            @RequestParam Long rejectedById,
            @RequestParam(required = false) String notes) {
        logger.info("Bulk rejecting {} pending actions by user {}", ids.size(), rejectedById);

        if (pendingActionService == null) {
            return ResponseEntity.status(503).build();
        }

        try {
            List<PendingAction> rejected = pendingActionService.bulkRejectPendingActions(ids, rejectedById, notes);
            return ResponseEntity.ok(rejected);
        } catch (Exception e) {
            logger.error("Error bulk rejecting pending actions", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testEndpoint() {
        logger.info("Pending action controller test endpoint called");

        return ResponseEntity.ok(Map.of(
            "status", "ok",
            "message", "PendingActionController is working - MongoDB-enabled but service integration pending",
            "timestamp", LocalDateTime.now().toString(),
            "mongoEnabled", "true",
            "serviceStatus", "pending"
        ));
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
