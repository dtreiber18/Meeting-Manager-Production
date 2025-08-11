package com.g37.meetingmanager.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "action_items", indexes = {
    @Index(columnList = "assigneeId"),
    @Index(columnList = "reporterId"),
    @Index(columnList = "status"),
    @Index(columnList = "priority"),
    @Index(columnList = "dueDate"),
    @Index(columnList = "completed"),
    @Index(columnList = "meetingId")
})
public class ActionItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 500)
    @Column(nullable = false, length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActionItemStatus status = ActionItemStatus.OPEN;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority = Priority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActionItemType type = ActionItemType.TASK;

    private LocalDateTime dueDate;
    private LocalDateTime startDate;
    private LocalDateTime completedAt;

    @Column(nullable = false)
    private Boolean completed = false;

    @Column(nullable = false)
    private Boolean isRecurring = false;

    @Size(max = 50)
    private String recurringPattern; // "weekly", "monthly", etc.

    private Integer estimatedHours;
    private Integer actualHours;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(columnDefinition = "TEXT")
    private String completionNotes;

    @Size(max = 100)
    private String tags; // Comma-separated tags

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    private LocalDateTime lastReminderSent;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id")
    private Meeting meeting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private User assignee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id")
    private User reporter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @OneToMany(mappedBy = "parentActionItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ActionItem> subTasks = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_action_item_id")
    private ActionItem parentActionItem;

    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (completed && completedAt == null) {
            completedAt = LocalDateTime.now();
            status = ActionItemStatus.COMPLETED;
        }
        if (!completed && status == ActionItemStatus.COMPLETED) {
            status = ActionItemStatus.IN_PROGRESS;
            completedAt = null;
        }
    }

    // Constructors
    public ActionItem() {}

    public ActionItem(String title, User assignee, LocalDateTime dueDate) {
        this.title = title;
        this.assignee = assignee;
        this.dueDate = dueDate;
    }

    public ActionItem(String title, String description, User assignee, User reporter, LocalDateTime dueDate, Priority priority) {
        this.title = title;
        this.description = description;
        this.assignee = assignee;
        this.reporter = reporter;
        this.dueDate = dueDate;
        this.priority = priority;
    }

    // Helper methods
    public boolean isOverdue() {
        return dueDate != null && !completed && LocalDateTime.now().isAfter(dueDate);
    }

    public boolean isDueSoon(int days) {
        return dueDate != null && !completed && 
               LocalDateTime.now().plusDays(days).isAfter(dueDate);
    }

    public void markAsCompleted() {
        this.completed = true;
        this.status = ActionItemStatus.COMPLETED;
        this.completedAt = LocalDateTime.now();
    }

    public void markAsInProgress() {
        this.status = ActionItemStatus.IN_PROGRESS;
        this.completed = false;
        this.completedAt = null;
    }

    public int getProgressPercentage() {
        if (completed) return 100;
        
        if (subTasks.isEmpty()) {
            return switch (status) {
                case OPEN -> 0;
                case IN_PROGRESS -> 50;
                case BLOCKED -> 25;
                case COMPLETED -> 100;
                case CANCELLED -> 0;
            };
        }
        
        // Calculate based on subtasks
        long completedSubtasks = subTasks.stream().mapToLong(st -> st.completed ? 1 : 0).sum();
        return (int) ((completedSubtasks * 100) / subTasks.size());
    }

    public boolean hasSubTasks() {
        return !subTasks.isEmpty();
    }

    public void addSubTask(ActionItem subTask) {
        subTasks.add(subTask);
        subTask.setParentActionItem(this);
    }

    public void removeSubTask(ActionItem subTask) {
        subTasks.remove(subTask);
        subTask.setParentActionItem(null);
    }

    // Enums
    public enum ActionItemStatus {
        OPEN,
        IN_PROGRESS,
        BLOCKED,
        COMPLETED,
        CANCELLED
    }

    public enum Priority {
        LOW,
        MEDIUM,
        HIGH,
        URGENT
    }

    public enum ActionItemType {
        TASK,
        FOLLOW_UP,
        DECISION,
        RESEARCH,
        APPROVAL,
        DOCUMENTATION,
        MEETING
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ActionItemStatus getStatus() { return status; }
    public void setStatus(ActionItemStatus status) { this.status = status; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public ActionItemType getType() { return type; }
    public void setType(ActionItemType type) { this.type = type; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public Boolean getCompleted() { return completed; }
    public void setCompleted(Boolean completed) { this.completed = completed; }

    public Boolean getIsRecurring() { return isRecurring; }
    public void setIsRecurring(Boolean isRecurring) { this.isRecurring = isRecurring; }

    public String getRecurringPattern() { return recurringPattern; }
    public void setRecurringPattern(String recurringPattern) { this.recurringPattern = recurringPattern; }

    public Integer getEstimatedHours() { return estimatedHours; }
    public void setEstimatedHours(Integer estimatedHours) { this.estimatedHours = estimatedHours; }

    public Integer getActualHours() { return actualHours; }
    public void setActualHours(Integer actualHours) { this.actualHours = actualHours; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getCompletionNotes() { return completionNotes; }
    public void setCompletionNotes(String completionNotes) { this.completionNotes = completionNotes; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getLastReminderSent() { return lastReminderSent; }
    public void setLastReminderSent(LocalDateTime lastReminderSent) { this.lastReminderSent = lastReminderSent; }

    public Meeting getMeeting() { return meeting; }
    public void setMeeting(Meeting meeting) { this.meeting = meeting; }

    public User getAssignee() { return assignee; }
    public void setAssignee(User assignee) { this.assignee = assignee; }

    public User getReporter() { return reporter; }
    public void setReporter(User reporter) { this.reporter = reporter; }

    public Organization getOrganization() { return organization; }
    public void setOrganization(Organization organization) { this.organization = organization; }

    public List<ActionItem> getSubTasks() { return subTasks; }
    public void setSubTasks(List<ActionItem> subTasks) { this.subTasks = subTasks; }

    public ActionItem getParentActionItem() { return parentActionItem; }
    public void setParentActionItem(ActionItem parentActionItem) { this.parentActionItem = parentActionItem; }

    // Legacy compatibility methods
    public String getAssignedTo() { 
        return assignee != null ? assignee.getFullName() : null;
    }
    
    public void setAssignedTo(String assignedTo) {
        // This is read-only, handled through assignee relationship
    }
}
