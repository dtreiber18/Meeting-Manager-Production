package com.g37.meetingmanager.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "meetings", indexes = {
    @Index(columnList = "organizationId"),
    @Index(columnList = "organizerId"),
    @Index(columnList = "startTime"),
    @Index(columnList = "status"),
    @Index(columnList = "meetingType"),
    @Index(columnList = "isRecurring"),
    @Index(columnList = "createdAt")
})
public class Meeting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false)
    private String title;

    @Size(max = 1000)
    private String description;

    @Size(max = 2000)
    private String agenda;

    @Size(max = 2000)
    private String summary;

    @Size(max = 2000)
    private String keyDecisions;

    @Size(max = 2000)
    private String nextSteps;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime startTime;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MeetingType meetingType = MeetingType.GENERAL;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MeetingStatus status = MeetingStatus.SCHEDULED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority = Priority.MEDIUM;

    @Column(nullable = false)
    private Boolean isRecurring = false;

    @Size(max = 100)
    private String recurrencePattern; // "DAILY", "WEEKLY", "MONTHLY", etc.

    private LocalDateTime recurrenceEndDate;

    @Size(max = 255)
    private String location;

    @Size(max = 500)
    private String meetingLink;

    @Size(max = 500)
    private String recordingUrl;

    @Size(max = 500)
    private String transcriptUrl;

    @Column(nullable = false)
    private Boolean isPublic = false;

    @Column(nullable = false)
    private Boolean requiresApproval = false;

    @Column(nullable = false)
    private Boolean allowRecording = true;

    @Column(nullable = false)
    private Boolean autoTranscription = false;

    @Column(nullable = false)
    private Boolean aiAnalysisEnabled = false;

    @Size(max = 1000)
    private String aiInsights; // JSON string for AI analysis results

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "meetings", "users"})
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "organizedMeetings", "participatedMeetings", "actionItems"})
    private User organizer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_room_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "meetings"})
    private MeetingRoom meetingRoom;

    @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<MeetingParticipant> participants;

    @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ActionItem> actionItems;

    @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<MeetingNote> notes;

    @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<MeetingAttachment> attachments;

    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public Meeting() {}

    public Meeting(String title, LocalDateTime startTime, LocalDateTime endTime, User organizer, Organization organization) {
        this.title = title;
        this.startTime = startTime;
        this.endTime = endTime;
        this.organizer = organizer;
        this.organization = organization;
    }

    // Helper methods
    public long getDurationInMinutes() {
        return java.time.Duration.between(startTime, endTime).toMinutes();
    }

    public boolean isUpcoming() {
        return startTime.isAfter(LocalDateTime.now()) && status == MeetingStatus.SCHEDULED;
    }

    public boolean isInProgress() {
        LocalDateTime now = LocalDateTime.now();
        return now.isAfter(startTime) && now.isBefore(endTime) && status == MeetingStatus.IN_PROGRESS;
    }

    public boolean hasEnded() {
        return endTime.isBefore(LocalDateTime.now()) || status == MeetingStatus.COMPLETED;
    }

    // Enums
    public enum MeetingType {
        GENERAL,
        STANDUP,
        ONE_ON_ONE,
        TEAM_MEETING,
        CLIENT_MEETING,
        BOARD_MEETING,
        PLANNING,
        RETROSPECTIVE,
        INTERVIEW,
        TRAINING,
        PRESENTATION,
        WORKSHOP
    }

    public enum MeetingStatus {
        SCHEDULED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED,
        POSTPONED,
        PENDING_APPROVAL
    }

    public enum Priority {
        LOW,
        MEDIUM,
        HIGH,
        URGENT
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAgenda() { return agenda; }
    public void setAgenda(String agenda) { this.agenda = agenda; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getKeyDecisions() { return keyDecisions; }
    public void setKeyDecisions(String keyDecisions) { this.keyDecisions = keyDecisions; }

    public String getNextSteps() { return nextSteps; }
    public void setNextSteps(String nextSteps) { this.nextSteps = nextSteps; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public MeetingType getMeetingType() { return meetingType; }
    public void setMeetingType(MeetingType meetingType) { this.meetingType = meetingType; }

    public MeetingStatus getStatus() { return status; }
    public void setStatus(MeetingStatus status) { this.status = status; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public Boolean getIsRecurring() { return isRecurring; }
    public void setIsRecurring(Boolean isRecurring) { this.isRecurring = isRecurring; }

    public String getRecurrencePattern() { return recurrencePattern; }
    public void setRecurrencePattern(String recurrencePattern) { this.recurrencePattern = recurrencePattern; }

    public LocalDateTime getRecurrenceEndDate() { return recurrenceEndDate; }
    public void setRecurrenceEndDate(LocalDateTime recurrenceEndDate) { this.recurrenceEndDate = recurrenceEndDate; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public String getRecordingUrl() { return recordingUrl; }
    public void setRecordingUrl(String recordingUrl) { this.recordingUrl = recordingUrl; }

    public String getTranscriptUrl() { return transcriptUrl; }
    public void setTranscriptUrl(String transcriptUrl) { this.transcriptUrl = transcriptUrl; }

    public Boolean getIsPublic() { return isPublic; }
    public void setIsPublic(Boolean isPublic) { this.isPublic = isPublic; }

    public Boolean getRequiresApproval() { return requiresApproval; }
    public void setRequiresApproval(Boolean requiresApproval) { this.requiresApproval = requiresApproval; }

    public Boolean getAllowRecording() { return allowRecording; }
    public void setAllowRecording(Boolean allowRecording) { this.allowRecording = allowRecording; }

    public Boolean getAutoTranscription() { return autoTranscription; }
    public void setAutoTranscription(Boolean autoTranscription) { this.autoTranscription = autoTranscription; }

    public Boolean getAiAnalysisEnabled() { return aiAnalysisEnabled; }
    public void setAiAnalysisEnabled(Boolean aiAnalysisEnabled) { this.aiAnalysisEnabled = aiAnalysisEnabled; }

    public String getAiInsights() { return aiInsights; }
    public void setAiInsights(String aiInsights) { this.aiInsights = aiInsights; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Organization getOrganization() { return organization; }
    public void setOrganization(Organization organization) { this.organization = organization; }

    public User getOrganizer() { return organizer; }
    public void setOrganizer(User organizer) { this.organizer = organizer; }

    public MeetingRoom getMeetingRoom() { return meetingRoom; }
    public void setMeetingRoom(MeetingRoom meetingRoom) { this.meetingRoom = meetingRoom; }

    public List<MeetingParticipant> getParticipants() { return participants; }
    public void setParticipants(List<MeetingParticipant> participants) { this.participants = participants; }

    public List<ActionItem> getActionItems() { return actionItems; }
    public void setActionItems(List<ActionItem> actionItems) { this.actionItems = actionItems; }

    public List<MeetingNote> getNotes() { return notes; }
    public void setNotes(List<MeetingNote> notes) { this.notes = notes; }

    public List<MeetingAttachment> getAttachments() { return attachments; }
    public void setAttachments(List<MeetingAttachment> attachments) { this.attachments = attachments; }

    // Legacy getters for backward compatibility
    public String getSubject() { return title; }
    public void setSubject(String subject) { this.title = subject; }

    public String getDetails() { return description; }
    public void setDetails(String details) { this.description = details; }

    public String getType() { return meetingType != null ? meetingType.name() : null; }
    public void setType(String type) { 
        if (type != null) {
            try {
                this.meetingType = MeetingType.valueOf(type.toUpperCase());
            } catch (IllegalArgumentException e) {
                this.meetingType = MeetingType.GENERAL;
            }
        }
    }
}
