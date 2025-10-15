package com.g37.meetingmanager.service;

import com.g37.meetingmanager.model.PendingAction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for integrating with ClickUp
 * Handles API key authentication and task management
 */
@Service
public class ClickUpService {

    private static final Logger logger = LoggerFactory.getLogger(ClickUpService.class);

    @Value("${clickup.enabled:false}")
    private boolean clickUpEnabled;

    @Value("${clickup.api.url:https://api.clickup.com/api/v2}")
    private String clickUpApiUrl;

    @Value("${clickup.api.key:}")
    private String apiKey;

    @Value("${clickup.default.list.id:}")
    private String defaultListId;

    @Value("${clickup.default.space.id:}")
    private String defaultSpaceId;

    private final RestTemplate restTemplate;

    public ClickUpService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Create a task in ClickUp from a PendingAction
     */
    public Map<String, Object> createTask(PendingAction action, String userApiKey) {
        if (!clickUpEnabled) {
            logger.warn("ClickUp integration is disabled");
            return Map.of("error", "ClickUp integration is disabled");
        }

        try {
            // Use user's API key if provided, otherwise use service key
            String key = userApiKey != null ? userApiKey : apiKey;

            // Determine list ID (required for task creation)
            String listId = action.getClickUpListId() != null
                ? action.getClickUpListId()
                : defaultListId;

            if (listId == null || listId.isEmpty()) {
                return Map.of("error", "ClickUp list ID is required");
            }

            String createTaskUrl = clickUpApiUrl + "/list/" + listId + "/task";

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", key);
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Build ClickUp task data
            Map<String, Object> taskData = new HashMap<>();
            taskData.put("name", action.getTitle());
            taskData.put("description", action.getDescription() != null ? action.getDescription() : "");
            taskData.put("status", mapStatusToClickUp(action.getStatus()));
            taskData.put("priority", mapPriorityToClickUp(action.getPriority()));

            // Add due date if available
            if (action.getDueDate() != null) {
                // ClickUp expects Unix timestamp in milliseconds
                long dueDate = action.getDueDate().atZone(java.time.ZoneId.systemDefault())
                    .toInstant().toEpochMilli();
                taskData.put("due_date", dueDate);
            }

            // Add custom fields for Meeting Manager integration
            List<Map<String, Object>> customFields = new ArrayList<>();

            Map<String, Object> actionIdField = new HashMap<>();
            actionIdField.put("id", "meeting_manager_action_id"); // Need to create this custom field in ClickUp
            actionIdField.put("value", action.getId());
            customFields.add(actionIdField);

            if (action.getMeetingId() != null) {
                Map<String, Object> meetingIdField = new HashMap<>();
                meetingIdField.put("id", "meeting_manager_meeting_id");
                meetingIdField.put("value", action.getMeetingId().toString());
                customFields.add(meetingIdField);
            }

            if (!customFields.isEmpty()) {
                taskData.put("custom_fields", customFields);
            }

            // Add assignees if available
            if (action.getAssigneeId() != null) {
                // TODO: Map Meeting Manager user ID to ClickUp user ID
                List<Long> assignees = List.of(action.getAssigneeId());
                taskData.put("assignees", assignees);
            }

            // Add tags
            List<String> tags = new ArrayList<>();
            tags.add("meeting-manager");
            if (action.getSource() != null) {
                tags.add("source-" + action.getSource().name().toLowerCase());
            }
            taskData.put("tags", tags);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(taskData, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                createTaskUrl,
                HttpMethod.POST,
                request,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                logger.info("Successfully created ClickUp task for action: {}", action.getId());
                return responseBody;
            } else {
                logger.error("Failed to create ClickUp task. Status: {}", response.getStatusCode());
                return Map.of("error", "Failed to create task");
            }

        } catch (HttpClientErrorException e) {
            logger.error("HTTP error creating ClickUp task: {} - {}",
                e.getStatusCode(), e.getResponseBodyAsString());
            return Map.of("error", "HTTP error: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Error creating ClickUp task", e);
            return Map.of("error", e.getMessage());
        }
    }

    /**
     * Update a task in ClickUp
     */
    public Map<String, Object> updateTask(String taskId, Map<String, Object> updates, String userApiKey) {
        if (!clickUpEnabled) {
            logger.warn("ClickUp integration is disabled");
            return Map.of("error", "ClickUp integration is disabled");
        }

        try {
            String key = userApiKey != null ? userApiKey : apiKey;
            String updateTaskUrl = clickUpApiUrl + "/task/" + taskId;

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", key);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(updates, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                updateTaskUrl,
                HttpMethod.PUT,
                request,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                logger.info("Successfully updated ClickUp task: {}", taskId);
                return response.getBody();
            } else {
                logger.error("Failed to update ClickUp task. Status: {}", response.getStatusCode());
                return Map.of("error", "Failed to update task");
            }

        } catch (Exception e) {
            logger.error("Error updating ClickUp task", e);
            return Map.of("error", e.getMessage());
        }
    }

    /**
     * Get ClickUp workspaces (teams) for the authenticated user
     */
    public Map<String, Object> getWorkspaces(String userApiKey) {
        if (!clickUpEnabled) {
            return Map.of("error", "ClickUp integration is disabled");
        }

        try {
            String key = userApiKey != null ? userApiKey : apiKey;
            String workspacesUrl = clickUpApiUrl + "/team";

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", key);

            HttpEntity<String> request = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                workspacesUrl,
                HttpMethod.GET,
                request,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            } else {
                return Map.of("error", "Failed to get workspaces");
            }

        } catch (Exception e) {
            logger.error("Error getting ClickUp workspaces", e);
            return Map.of("error", e.getMessage());
        }
    }

    /**
     * Get ClickUp spaces for a workspace
     */
    public Map<String, Object> getSpaces(String workspaceId, String userApiKey) {
        if (!clickUpEnabled) {
            return Map.of("error", "ClickUp integration is disabled");
        }

        try {
            String key = userApiKey != null ? userApiKey : apiKey;
            String spacesUrl = clickUpApiUrl + "/team/" + workspaceId + "/space";

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", key);

            HttpEntity<String> request = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                spacesUrl,
                HttpMethod.GET,
                request,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            } else {
                return Map.of("error", "Failed to get spaces");
            }

        } catch (Exception e) {
            logger.error("Error getting ClickUp spaces", e);
            return Map.of("error", e.getMessage());
        }
    }

    /**
     * Get ClickUp lists for a space
     */
    public Map<String, Object> getLists(String spaceId, String userApiKey) {
        if (!clickUpEnabled) {
            return Map.of("error", "ClickUp integration is disabled");
        }

        try {
            String key = userApiKey != null ? userApiKey : apiKey;
            String listsUrl = clickUpApiUrl + "/space/" + spaceId + "/list";

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", key);

            HttpEntity<String> request = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                listsUrl,
                HttpMethod.GET,
                request,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            } else {
                return Map.of("error", "Failed to get lists");
            }

        } catch (Exception e) {
            logger.error("Error getting ClickUp lists", e);
            return Map.of("error", e.getMessage());
        }
    }

    /**
     * Map PendingAction status to ClickUp status
     */
    private String mapStatusToClickUp(PendingAction.ActionStatus status) {
        if (status == null) return "to do";

        switch (status) {
            case NEW:
                return "to do";
            case ACTIVE:
                return "in progress";
            case COMPLETE:
                return "complete";
            case REJECTED:
                return "closed";
            default:
                return "to do";
        }
    }

    /**
     * Map PendingAction priority to ClickUp priority (1-4, where 1 is urgent)
     */
    private Integer mapPriorityToClickUp(PendingAction.Priority priority) {
        if (priority == null) return 3; // Normal

        switch (priority) {
            case URGENT:
                return 1; // Urgent
            case HIGH:
                return 2; // High
            case MEDIUM:
                return 3; // Normal
            case LOW:
                return 4; // Low
            default:
                return 3;
        }
    }

    public boolean isEnabled() {
        return clickUpEnabled;
    }
}
