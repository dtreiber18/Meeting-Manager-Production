package com.g37.meetingmanager.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

/**
 * DTO for N8N Operation response
 * Maps to the structure returned by N8N getPendingOperations API
 *
 * Example response from n8n:
 * {
 *   "id": "recPqmKISgLTff13h",
 *   "createdTime": "2025-08-06T19:18:18.000Z",
 *   "event_id": "recaeFlkZr6yAllr1",
 *   "status": "new",
 *   "operation_type": "Contact",
 *   "operation": "{\"FirstName\":\"Amanda\",\"LastName\":\"Foster\",\"Email\":\"afoster@prsolutions.com\",...}",
 *   "created_at": "2025-08-06T19:18:18.212Z",
 *   "updated_at": "2025-08-06T19:18:18.212Z"
 * }
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class N8nOperationDTO {

    private static final Logger logger = LoggerFactory.getLogger(N8nOperationDTO.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();

    private String id;

    @JsonProperty("createdTime")
    private String createdTime;

    @JsonProperty("event_id")
    private String eventId;

    private String status;

    @JsonProperty("operation_type")
    private String operationType;

    // N8N returns this as a JSON string, not an object
    @JsonProperty("operation")
    private Object operationRaw;

    private Map<String, Object> operation;

    @JsonProperty("created_at")
    private String createdAt;

    @JsonProperty("updated_at")
    private String updatedAt;

    // Constructors
    public N8nOperationDTO() {}

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCreatedTime() {
        return createdTime;
    }

    public void setCreatedTime(String createdTime) {
        this.createdTime = createdTime;
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getOperationType() {
        return operationType;
    }

    public void setOperationType(String operationType) {
        this.operationType = operationType;
    }

    public Map<String, Object> getOperation() {
        // Lazy parse the operation JSON string if needed
        if (operation == null && operationRaw != null) {
            try {
                if (operationRaw instanceof String) {
                    // Parse JSON string to Map
                    operation = objectMapper.readValue(
                        (String) operationRaw,
                        new TypeReference<Map<String, Object>>() {}
                    );
                } else if (operationRaw instanceof Map) {
                    // Already a Map
                    operation = (Map<String, Object>) operationRaw;
                }
            } catch (Exception e) {
                logger.error("Failed to parse operation JSON: {}", operationRaw, e);
                operation = new HashMap<>();
            }
        }
        return operation;
    }

    public void setOperation(Map<String, Object> operation) {
        this.operation = operation;
    }

    public void setOperationRaw(Object operationRaw) {
        this.operationRaw = operationRaw;
        this.operation = null; // Reset parsed cache
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    /**
     * Helper method to get a value from the operation map
     */
    public Object getOperationValue(String key) {
        return operation != null ? operation.get(key) : null;
    }

    /**
     * Helper method to get a string value from the operation map
     */
    public String getOperationString(String key) {
        Object value = getOperationValue(key);
        return value != null ? value.toString() : null;
    }
}
