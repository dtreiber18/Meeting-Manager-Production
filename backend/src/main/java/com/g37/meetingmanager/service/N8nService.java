package com.g37.meetingmanager.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.g37.meetingmanager.dto.N8nOperationDTO;
import com.g37.meetingmanager.model.PendingAction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for integrating with N8N Operations Manager
 * Handles fetching pending operations and triggering workflows
 */
@Service
@ConditionalOnProperty(name = "n8n.enabled", havingValue = "true", matchIfMissing = false)
public class N8nService {

    private static final Logger logger = LoggerFactory.getLogger(N8nService.class);

    @Value("${n8n.webhook.url:}")
    private String n8nWebhookUrl;

    @Value("${n8n.api.key:}")
    private String n8nApiKey;

    @Value("${n8n.enabled:false}")
    private boolean n8nEnabled;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public N8nService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        logger.info("N8nService initialized");
    }

    /**
     * Check if N8N integration is enabled and configured
     */
    public boolean isN8nAvailable() {
        boolean available = n8nEnabled && n8nWebhookUrl != null && !n8nWebhookUrl.isEmpty();
        if (!available) {
            logger.warn("N8N not available - enabled: {}, webhookUrl configured: {}",
                n8nEnabled, (n8nWebhookUrl != null && !n8nWebhookUrl.isEmpty()));
        }
        return available;
    }

    /**
     * Fetch pending operations from N8N for a specific event
     *
     * @param eventId The event/meeting ID to fetch operations for
     * @return List of N8N operations
     */
    public List<N8nOperationDTO> getPendingOperations(String eventId) {
        if (!isN8nAvailable()) {
            logger.warn("N8N not available, returning empty list");
            return Collections.emptyList();
        }

        try {
            logger.info("Fetching pending operations from N8N for event: {}", eventId);

            // Create request payload
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("action", "get_pending");
            requestBody.put("event_id", eventId);

            // Create headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (n8nApiKey != null && !n8nApiKey.isEmpty()) {
                headers.set("Authorization", "Bearer " + n8nApiKey);
            }

            HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);

            // Make HTTP POST request
            ResponseEntity<String> response = restTemplate.exchange(
                n8nWebhookUrl,
                HttpMethod.POST,
                entity,
                String.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                // Parse response as array of operations
                List<N8nOperationDTO> operations = objectMapper.readValue(
                    response.getBody(),
                    new TypeReference<List<N8nOperationDTO>>() {}
                );

                logger.info("Successfully fetched {} pending operations from N8N", operations.size());
                return operations;
            } else {
                logger.warn("N8N returned non-OK status: {}", response.getStatusCode());
                return Collections.emptyList();
            }

        } catch (Exception e) {
            logger.error("Error fetching pending operations from N8N: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    /**
     * Trigger N8N workflow for an approved pending action
     *
     * @param pendingAction The approved pending action
     * @return true if workflow triggered successfully
     */
    public boolean triggerWorkflow(PendingAction pendingAction) {
        if (!isN8nAvailable()) {
            logger.warn("N8N not available, cannot trigger workflow");
            return false;
        }

        try {
            logger.info("Triggering N8N workflow for action: {} ({})",
                pendingAction.getTitle(), pendingAction.getId());

            // Create request payload with action details
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("action", "execute_operation");
            requestBody.put("operation_id", pendingAction.getId());
            requestBody.put("operation_type", pendingAction.getActionType().name());
            requestBody.put("event_id", pendingAction.getMeetingObjectId() != null
                ? pendingAction.getMeetingObjectId()
                : String.valueOf(pendingAction.getMeetingId()));

            // Add action details
            Map<String, Object> operationDetails = new HashMap<>();
            operationDetails.put("title", pendingAction.getTitle());
            operationDetails.put("description", pendingAction.getDescription());
            operationDetails.put("priority", pendingAction.getPriority().name());
            operationDetails.put("assignee_email", pendingAction.getAssigneeEmail());
            operationDetails.put("assignee_name", pendingAction.getAssigneeName());
            operationDetails.put("due_date", pendingAction.getDueDate() != null
                ? pendingAction.getDueDate().toString()
                : null);
            operationDetails.put("action_management_systems", pendingAction.getActionManagementSystems());

            requestBody.put("operation", operationDetails);

            // Create headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (n8nApiKey != null && !n8nApiKey.isEmpty()) {
                headers.set("Authorization", "Bearer " + n8nApiKey);
            }

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // Make HTTP POST request
            ResponseEntity<String> response = restTemplate.exchange(
                n8nWebhookUrl,
                HttpMethod.POST,
                entity,
                String.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                logger.info("Successfully triggered N8N workflow for action: {}", pendingAction.getId());
                return true;
            } else {
                logger.warn("N8N workflow trigger returned non-OK status: {}", response.getStatusCode());
                return false;
            }

        } catch (Exception e) {
            logger.error("Error triggering N8N workflow: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Convert N8N operation DTO to PendingAction model
     *
     * @param n8nOperation The N8N operation DTO
     * @return PendingAction model object
     */
    public PendingAction convertToPendingAction(N8nOperationDTO n8nOperation) {
        PendingAction pendingAction = new PendingAction();

        // Set basic fields
        pendingAction.setId(n8nOperation.getId());
        pendingAction.setN8nExecutionId(n8nOperation.getId());
        pendingAction.setN8nWorkflowStatus(n8nOperation.getStatus());

        // Map operation type to action type
        String operationType = n8nOperation.getOperationType();
        if (operationType != null) {
            try {
                pendingAction.setActionType(
                    PendingAction.ActionType.valueOf(operationType.toUpperCase().replace(' ', '_'))
                );
            } catch (IllegalArgumentException e) {
                logger.warn("Unknown operation type: {}, defaulting to TASK", operationType);
                pendingAction.setActionType(PendingAction.ActionType.TASK);
            }
        } else {
            pendingAction.setActionType(PendingAction.ActionType.TASK);
        }

        // Map status
        String status = n8nOperation.getStatus();
        if ("new".equalsIgnoreCase(status)) {
            pendingAction.setStatus(PendingAction.ActionStatus.NEW);
        } else if ("active".equalsIgnoreCase(status) || "approved".equalsIgnoreCase(status)) {
            pendingAction.setStatus(PendingAction.ActionStatus.ACTIVE);
        } else if ("complete".equalsIgnoreCase(status) || "completed".equalsIgnoreCase(status)) {
            pendingAction.setStatus(PendingAction.ActionStatus.COMPLETE);
        } else {
            pendingAction.setStatus(PendingAction.ActionStatus.NEW);
        }

        // Extract fields from operation map
        Map<String, Object> operation = n8nOperation.getOperation();
        if (operation != null) {
            // Extract contact information and build title/description
            String firstName = getStringValue(operation, "FirstName");
            String lastName = getStringValue(operation, "LastName");
            String email = getStringValue(operation, "Email");
            String phone = getStringValue(operation, "Phone");
            String role = getStringValue(operation, "Role");
            String company = getStringValue(operation, "Company");

            // Build title from available information
            StringBuilder title = new StringBuilder();
            if (operationType != null && operationType.equalsIgnoreCase("Contact")) {
                title.append("Contact: ");
            }
            if (firstName != null || lastName != null) {
                if (firstName != null) title.append(firstName).append(" ");
                if (lastName != null) title.append(lastName);
            } else if (email != null) {
                title.append(email);
            }
            pendingAction.setTitle(title.toString().trim());

            // Build description
            StringBuilder description = new StringBuilder();
            if (email != null) description.append("Email: ").append(email).append("\n");
            if (phone != null) description.append("Phone: ").append(phone).append("\n");
            if (role != null) description.append("Role: ").append(role).append("\n");
            if (company != null) description.append("Company: ").append(company).append("\n");
            pendingAction.setDescription(description.toString().trim());

            // Set assignee email if available
            if (email != null) {
                pendingAction.setAssigneeEmail(email);
            }
            if (firstName != null || lastName != null) {
                pendingAction.setAssigneeName((firstName != null ? firstName + " " : "") +
                    (lastName != null ? lastName : ""));
            }
        }

        // Parse timestamps
        try {
            if (n8nOperation.getCreatedTime() != null) {
                pendingAction.setCreatedAt(parseN8nDateTime(n8nOperation.getCreatedTime()));
            }
            if (n8nOperation.getCreatedAt() != null) {
                pendingAction.setCreatedAt(parseN8nDateTime(n8nOperation.getCreatedAt()));
            }
            if (n8nOperation.getUpdatedAt() != null) {
                pendingAction.setUpdatedAt(parseN8nDateTime(n8nOperation.getUpdatedAt()));
            }
        } catch (Exception e) {
            logger.warn("Error parsing N8N timestamps: {}", e.getMessage());
        }

        // Set default priority
        pendingAction.setPriority(PendingAction.Priority.MEDIUM);

        return pendingAction;
    }

    /**
     * Helper method to safely get string value from operation map
     */
    private String getStringValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : null;
    }

    /**
     * Parse N8N date-time string to LocalDateTime
     */
    private LocalDateTime parseN8nDateTime(String dateTimeStr) {
        try {
            // N8N format: "2025-08-06T19:18:18.000Z"
            DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
            return LocalDateTime.parse(dateTimeStr.replace("Z", ""), formatter);
        } catch (Exception e) {
            logger.warn("Failed to parse date time: {}", dateTimeStr);
            return LocalDateTime.now();
        }
    }
}
