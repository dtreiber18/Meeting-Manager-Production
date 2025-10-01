package com.g37.meetingmanager.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.index.Indexed;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "mnm_pending")
@JsonIgnoreProperties(ignoreUnknown = true)
public class PendingAction {
    
    @Id
    private String id; // MongoDB ObjectId
    
    @NotBlank
    @Size(max = 500)
    @Field("title")
    private String title;
    
    @Field("description")
    private String description;
    
    @NotNull
    @Field("status")
    @Indexed
    private ActionStatus status = ActionStatus.NEW;
    
    @NotNull
    @Field("priority")
    @Indexed
    private Priority priority = Priority.MEDIUM;
    
    @Field("action_type")
    private ActionType actionType = ActionType.TASK;
    
    @Field("due_date")
    private LocalDateTime dueDate;
    
    @Field("assignee_id")
    @Indexed
    private Long assigneeId;
    
    @Field("assignee_name")
    private String assigneeName;
    
    @Field("assignee_email")
    private String assigneeEmail;
    
    @Field("reporter_id")
    @Indexed
    private Long reporterId;
    
    @Field("meeting_id")
    @Indexed
    private Long meetingId; // Reference to SQL meeting ID
    
    @Field("meeting_object_id")
    private String meetingObjectId; // MongoDB ObjectId if using MongoDB for meetings
    
    @Field("organization_id")
    @Indexed
    private Long organizationId;
    
    @Field("action_management_systems")
    private List<ActionManagementSystem> actionManagementSystems;
    
    @Field("estimated_hours")
    private Integer estimatedHours;
    
    @Field("actual_hours")
    private Integer actualHours;
    
    @Field("notes")
    private String notes;
    
    @Field("completion_notes")
    private String completionNotes;
    
    @Field("tags")
    private List<String> tags;
    
    @Field("created_at")
    @Indexed
    private LocalDateTime createdAt;
    
    @Field("updated_at")
    private LocalDateTime updatedAt;
    
    @Field("completed_at")
    private LocalDateTime completedAt;
    
    @Field("approved_at")
    private LocalDateTime approvedAt;
    
    @Field("rejected_at")
    private LocalDateTime rejectedAt;
    
    @Field("approved_by_id")
    private Long approvedById;
    
    @Field("rejected_by_id")
    private Long rejectedById;
    
    @Field("approval_notes")
    private String approvalNotes;
    
    @Field("rejection_notes")
    private String rejectionNotes;
    
    @Field("n8n_workflow_status")
    private String n8nWorkflowStatus;
    
    @Field("n8n_execution_id")
    private String n8nExecutionId;
    
    @Field("external_task_id")
    private String externalTaskId; // ID in external system (Jira, Asana, etc.)
    
    @Field("external_system")
    private ActionManagementSystem externalSystem;
    
    // Constructors
    public PendingAction() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public PendingAction(String title, String description, Long meetingId, Long assigneeId) {
        this();
        this.title = title;
        this.description = description;
        this.meetingId = meetingId;
        this.assigneeId = assigneeId;
    }
    
    // Helper methods
    public boolean isOverdue() {
        return dueDate != null && status != ActionStatus.COMPLETE && 
               status != ActionStatus.REJECTED && LocalDateTime.now().isAfter(dueDate);
    }
    
    public boolean isPending() {
        return status == ActionStatus.NEW || status == ActionStatus.ACTIVE;
    }
    
    public boolean isApproved() {
        return approvedAt != null && status == ActionStatus.ACTIVE;
    }
    
    public boolean isRejected() {
        return rejectedAt != null && status == ActionStatus.REJECTED;
    }
    
    public void approve(Long approvedById, String notes) {
        this.status = ActionStatus.ACTIVE;
        this.approvedAt = LocalDateTime.now();
        this.approvedById = approvedById;
        this.approvalNotes = notes;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void reject(Long rejectedById, String notes) {
        this.status = ActionStatus.REJECTED;
        this.rejectedAt = LocalDateTime.now();
        this.rejectedById = rejectedById;
        this.rejectionNotes = notes;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void complete(String completionNotes) {
        this.status = ActionStatus.COMPLETE;
        this.completedAt = LocalDateTime.now();
        this.completionNotes = completionNotes;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void updateTimestamp() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Enums
    public enum ActionStatus {
        NEW,        // Initial state when action item is created
        ACTIVE,     // Approved and ready to work on
        COMPLETE,   // Task completed
        REJECTED    // Rejected and won't be worked on
    }
    
    public enum Priority {
        LOW,
        MEDIUM,
        HIGH,
        URGENT
    }
    
    public enum ActionType {
        TASK,
        FOLLOW_UP,
        DECISION,
        RESEARCH,
        APPROVAL,
        DOCUMENTATION,
        MEETING,
        SCHEDULE_MEETING,
        UPDATE_CRM,
        SEND_EMAIL
    }
    
    public enum ActionManagementSystem {
        TODOLIST,
        ANASA,
        JIRA,
        NOTION,
        CLICKUP
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public ActionStatus getStatus() { return status; }
    public void setStatus(ActionStatus status) { this.status = status; }
    
    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }
    
    public ActionType getActionType() { return actionType; }
    public void setActionType(ActionType actionType) { this.actionType = actionType; }
    
    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
    
    public Long getAssigneeId() { return assigneeId; }
    public void setAssigneeId(Long assigneeId) { this.assigneeId = assigneeId; }
    
    public String getAssigneeName() { return assigneeName; }
    public void setAssigneeName(String assigneeName) { this.assigneeName = assigneeName; }
    
    public String getAssigneeEmail() { return assigneeEmail; }
    public void setAssigneeEmail(String assigneeEmail) { this.assigneeEmail = assigneeEmail; }
    
    public Long getReporterId() { return reporterId; }
    public void setReporterId(Long reporterId) { this.reporterId = reporterId; }
    
    public Long getMeetingId() { return meetingId; }
    public void setMeetingId(Long meetingId) { this.meetingId = meetingId; }
    
    public String getMeetingObjectId() { return meetingObjectId; }
    public void setMeetingObjectId(String meetingObjectId) { this.meetingObjectId = meetingObjectId; }
    
    public Long getOrganizationId() { return organizationId; }
    public void setOrganizationId(Long organizationId) { this.organizationId = organizationId; }
    
    public List<ActionManagementSystem> getActionManagementSystems() { return actionManagementSystems; }
    public void setActionManagementSystems(List<ActionManagementSystem> actionManagementSystems) { 
        this.actionManagementSystems = actionManagementSystems; 
    }
    
    public Integer getEstimatedHours() { return estimatedHours; }
    public void setEstimatedHours(Integer estimatedHours) { this.estimatedHours = estimatedHours; }
    
    public Integer getActualHours() { return actualHours; }
    public void setActualHours(Integer actualHours) { this.actualHours = actualHours; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public String getCompletionNotes() { return completionNotes; }
    public void setCompletionNotes(String completionNotes) { this.completionNotes = completionNotes; }
    
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    
    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
    
    public LocalDateTime getRejectedAt() { return rejectedAt; }
    public void setRejectedAt(LocalDateTime rejectedAt) { this.rejectedAt = rejectedAt; }
    
    public Long getApprovedById() { return approvedById; }
    public void setApprovedById(Long approvedById) { this.approvedById = approvedById; }
    
    public Long getRejectedById() { return rejectedById; }
    public void setRejectedById(Long rejectedById) { this.rejectedById = rejectedById; }
    
    public String getApprovalNotes() { return approvalNotes; }
    public void setApprovalNotes(String approvalNotes) { this.approvalNotes = approvalNotes; }
    
    public String getRejectionNotes() { return rejectionNotes; }
    public void setRejectionNotes(String rejectionNotes) { this.rejectionNotes = rejectionNotes; }
    
    public String getN8nWorkflowStatus() { return n8nWorkflowStatus; }
    public void setN8nWorkflowStatus(String n8nWorkflowStatus) { this.n8nWorkflowStatus = n8nWorkflowStatus; }
    
    public String getN8nExecutionId() { return n8nExecutionId; }
    public void setN8nExecutionId(String n8nExecutionId) { this.n8nExecutionId = n8nExecutionId; }
    
    public String getExternalTaskId() { return externalTaskId; }
    public void setExternalTaskId(String externalTaskId) { this.externalTaskId = externalTaskId; }
    
    public ActionManagementSystem getExternalSystem() { return externalSystem; }
    public void setExternalSystem(ActionManagementSystem externalSystem) { this.externalSystem = externalSystem; }
}