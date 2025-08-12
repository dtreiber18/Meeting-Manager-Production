package com.g37.meetingmanager.dto;

import com.g37.meetingmanager.model.Meeting;
import java.time.LocalDateTime;

public class CreateMeetingRequest {
    private String title;
    private String description;
    private String agenda;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Meeting.MeetingType meetingType;
    private Meeting.MeetingStatus status;
    private Meeting.Priority priority;
    private String location;
    private String meetingLink;
    private Boolean isRecurring;
    private Boolean isPublic;
    private Boolean requiresApproval;
    private Boolean allowRecording;
    private Boolean autoTranscription;
    private Boolean aiAnalysisEnabled;
    
    // Default constructor
    public CreateMeetingRequest() {}
    
    // Getters and setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getAgenda() { return agenda; }
    public void setAgenda(String agenda) { this.agenda = agenda; }
    
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    
    public Meeting.MeetingType getMeetingType() { return meetingType; }
    public void setMeetingType(Meeting.MeetingType meetingType) { this.meetingType = meetingType; }
    
    public Meeting.MeetingStatus getStatus() { return status; }
    public void setStatus(Meeting.MeetingStatus status) { this.status = status; }
    
    public Meeting.Priority getPriority() { return priority; }
    public void setPriority(Meeting.Priority priority) { this.priority = priority; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }
    
    public Boolean getIsRecurring() { return isRecurring; }
    public void setIsRecurring(Boolean isRecurring) { this.isRecurring = isRecurring; }
    
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
}
