package com.g37.meetingmanager.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;

/**
 * DTO for N8N Operation response
 * Maps to the structure returned by N8N getPendingOperations API
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class N8nOperationDTO {

    private String id;

    @JsonProperty("createdTime")
    private String createdTime;

    @JsonProperty("event_id")
    private String eventId;

    private String status;

    @JsonProperty("operation_type")
    private String operationType;

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
        return operation;
    }

    public void setOperation(Map<String, Object> operation) {
        this.operation = operation;
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
