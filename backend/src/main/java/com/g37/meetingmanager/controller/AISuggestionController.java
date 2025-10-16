package com.g37.meetingmanager.controller;

import com.g37.meetingmanager.model.AISuggestion;
import com.g37.meetingmanager.model.AISuggestion.SuggestionStatus;
import com.g37.meetingmanager.model.PendingAction;
import com.g37.meetingmanager.model.PendingAction.Priority;
import com.g37.meetingmanager.repository.mysql.AISuggestionRepository;
import com.g37.meetingmanager.repository.mongodb.PendingActionRepository;
import com.g37.meetingmanager.service.ZohoCRMService;
import com.g37.meetingmanager.service.ClickUpService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AISuggestionController {

    private static final Logger logger = LoggerFactory.getLogger(AISuggestionController.class);

    private final AISuggestionRepository aiSuggestionRepository;
    private final PendingActionRepository pendingActionRepository;

    @Autowired(required = false)
    private ZohoCRMService zohoCRMService;

    @Autowired(required = false)
    private ClickUpService clickUpService;

    public AISuggestionController(AISuggestionRepository aiSuggestionRepository,
                                  PendingActionRepository pendingActionRepository) {
        this.aiSuggestionRepository = aiSuggestionRepository;
        this.pendingActionRepository = pendingActionRepository;
    }

    /**
     * Get all AI suggestions for a specific meeting
     */
    @GetMapping("/meetings/{meetingId}/suggestions")
    public ResponseEntity<List<AISuggestion>> getSuggestionsForMeeting(@PathVariable Long meetingId) {
        try {
            logger.info("Getting AI suggestions for meeting: {}", meetingId);
            List<AISuggestion> suggestions = aiSuggestionRepository.findByMeetingId(meetingId);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            logger.error("Error getting suggestions for meeting {}", meetingId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get pending AI suggestions for a meeting
     */
    @GetMapping("/meetings/{meetingId}/suggestions/pending")
    public ResponseEntity<List<AISuggestion>> getPendingSuggestions(@PathVariable Long meetingId) {
        try {
            logger.info("Getting pending AI suggestions for meeting: {}", meetingId);
            List<AISuggestion> suggestions = aiSuggestionRepository.findPendingSuggestionsByMeetingId(meetingId);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            logger.error("Error getting pending suggestions for meeting {}", meetingId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create a new AI suggestion
     */
    @PostMapping("/meetings/{meetingId}/suggestions")
    public ResponseEntity<AISuggestion> createSuggestion(
            @PathVariable Long meetingId,
            @RequestBody AISuggestion suggestion) {
        try {
            logger.info("Creating AI suggestion for meeting {}: {}", meetingId, suggestion.getTitle());
            suggestion.setMeetingId(meetingId);
            suggestion.setStatus(SuggestionStatus.PENDING);

            AISuggestion saved = aiSuggestionRepository.save(suggestion);
            logger.info("AI suggestion created with ID: {}", saved.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            logger.error("Error creating AI suggestion", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Accept an AI suggestion and convert it to a PendingAction
     */
    @PutMapping("/suggestions/{id}/accept")
    public ResponseEntity<Map<String, Object>> acceptSuggestion(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> payload) {
        try {
            logger.info("Accepting AI suggestion: {}", id);

            Optional<AISuggestion> suggestionOpt = aiSuggestionRepository.findById(id);
            if (suggestionOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            AISuggestion suggestion = suggestionOpt.get();

            // Create PendingAction from the suggestion
            PendingAction action = new PendingAction();
            action.setTitle(suggestion.getTitle());
            action.setDescription(suggestion.getDescription());
            action.setPriority(suggestion.getPriority());
            action.setMeetingId(suggestion.getMeetingId());
            action.setAssigneeEmail(suggestion.getSuggestedAssignee());
            action.setSource(PendingAction.ActionSource.AI_SUGGESTION);
            action.setSourceReferenceId(id.toString());
            action.setStatus(PendingAction.ActionStatus.NEW);

            if (suggestion.getEstimatedHours() != null) {
                action.setEstimatedHours(suggestion.getEstimatedHours().intValue());
            }

            // Save the pending action
            PendingAction savedAction = pendingActionRepository.save(action);
            logger.info("Created PendingAction {} from AI suggestion {}", savedAction.getId(), id);

            // Update suggestion status
            suggestion.setStatus(SuggestionStatus.ACCEPTED);
            suggestion.setAcceptedAt(LocalDateTime.now());
            aiSuggestionRepository.save(suggestion);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Suggestion accepted and converted to action",
                "actionId", savedAction.getId(),
                "suggestionId", id
            ));

        } catch (Exception e) {
            logger.error("Error accepting AI suggestion {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * Dismiss an AI suggestion
     */
    @PutMapping("/suggestions/{id}/dismiss")
    public ResponseEntity<Map<String, Object>> dismissSuggestion(@PathVariable Long id) {
        try {
            logger.info("Dismissing AI suggestion: {}", id);

            Optional<AISuggestion> suggestionOpt = aiSuggestionRepository.findById(id);
            if (suggestionOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            AISuggestion suggestion = suggestionOpt.get();
            suggestion.setStatus(SuggestionStatus.DISMISSED);
            suggestion.setDismissedAt(LocalDateTime.now());
            aiSuggestionRepository.save(suggestion);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Suggestion dismissed",
                "suggestionId", id
            ));

        } catch (Exception e) {
            logger.error("Error dismissing AI suggestion {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * Send suggestion to external system (Zoho CRM or ClickUp)
     */
    @PostMapping("/suggestions/{id}/send")
    public ResponseEntity<Map<String, Object>> sendToSystem(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        try {
            String targetSystem = payload.get("targetSystem");
            logger.info("Sending AI suggestion {} to {}", id, targetSystem);

            Optional<AISuggestion> suggestionOpt = aiSuggestionRepository.findById(id);
            if (suggestionOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            AISuggestion suggestion = suggestionOpt.get();

            // Create PendingAction for tracking
            PendingAction action = new PendingAction();
            action.setTitle(suggestion.getTitle());
            action.setDescription(suggestion.getDescription());
            action.setPriority(suggestion.getPriority());
            action.setMeetingId(suggestion.getMeetingId());
            action.setAssigneeEmail(suggestion.getSuggestedAssignee());
            action.setSource(PendingAction.ActionSource.AI_SUGGESTION);
            action.setSourceReferenceId(id.toString());
            action.setStatus(PendingAction.ActionStatus.NEW);

            // Set target system
            if ("zoho".equalsIgnoreCase(targetSystem)) {
                action.setExternalSystem(PendingAction.ActionManagementSystem.ZOHO_CRM);
            } else if ("clickup".equalsIgnoreCase(targetSystem)) {
                action.setExternalSystem(PendingAction.ActionManagementSystem.CLICKUP);
            }

            suggestion.setTargetSystem(targetSystem);

            if (suggestion.getEstimatedHours() != null) {
                action.setEstimatedHours(suggestion.getEstimatedHours().intValue());
            }

            // Save pending action
            PendingAction savedAction = pendingActionRepository.save(action);
            logger.info("Created PendingAction {} for external system {}", savedAction.getId(), targetSystem);

            // Update suggestion
            suggestion.setStatus(SuggestionStatus.SENT);
            suggestion.setSentAt(LocalDateTime.now());
            suggestion.setSentToSystem(targetSystem);
            aiSuggestionRepository.save(suggestion);

            // Actually send to external system via ZohoCRMService or ClickUpService
            Map<String, Object> externalResult = sendToExternalSystem(savedAction, targetSystem);

            // Store external task ID if created successfully
            if (externalResult.containsKey("id")) {
                savedAction.setExternalTaskId(externalResult.get("id").toString());
                pendingActionRepository.save(savedAction);
                logger.info("✅ Created task in {} with ID: {}", targetSystem, externalResult.get("id"));
            } else if (externalResult.containsKey("error")) {
                logger.warn("⚠️ Failed to create task in {}: {}", targetSystem, externalResult.get("error"));
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Suggestion sent to " + targetSystem,
                "actionId", savedAction.getId(),
                "suggestionId", id,
                "targetSystem", targetSystem,
                "externalResult", externalResult
            ));

        } catch (Exception e) {
            logger.error("Error sending AI suggestion {} to external system", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * Delete an AI suggestion
     */
    @DeleteMapping("/suggestions/{id}")
    public ResponseEntity<Void> deleteSuggestion(@PathVariable Long id) {
        try {
            logger.info("Deleting AI suggestion: {}", id);
            aiSuggestionRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting AI suggestion {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Send PendingAction to external system (Zoho CRM or ClickUp)
     * @param action The PendingAction to send
     * @param targetSystem The target system ("zoho" or "clickup")
     * @return Map containing result with "id" on success or "error" on failure
     */
    private Map<String, Object> sendToExternalSystem(PendingAction action, String targetSystem) {
        try {
            if ("zoho".equalsIgnoreCase(targetSystem)) {
                if (zohoCRMService == null) {
                    logger.warn("ZohoCRMService not available - integration may be disabled");
                    return Map.of("error", "Zoho CRM integration not available");
                }
                // Call Zoho CRM service to create task
                Map<String, Object> result = zohoCRMService.createTask(action, null);
                logger.info("Zoho CRM createTask result: {}", result);
                return result;

            } else if ("clickup".equalsIgnoreCase(targetSystem)) {
                if (clickUpService == null) {
                    logger.warn("ClickUpService not available - integration may be disabled");
                    return Map.of("error", "ClickUp integration not available");
                }
                // Call ClickUp service to create task
                Map<String, Object> result = clickUpService.createTask(action, null);
                logger.info("ClickUp createTask result: {}", result);
                return result;

            } else {
                logger.warn("Unknown target system: {}", targetSystem);
                return Map.of("error", "Unknown target system: " + targetSystem);
            }

        } catch (Exception e) {
            logger.error("Error sending to external system {}: {}", targetSystem, e.getMessage(), e);
            return Map.of("error", e.getMessage());
        }
    }
}
