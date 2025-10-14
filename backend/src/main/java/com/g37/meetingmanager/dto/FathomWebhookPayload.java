package com.g37.meetingmanager.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for Fathom webhook payload
 * Based on Fathom API documentation: https://docs.fathom.video
 *
 * Webhook event: newMeeting
 * Sent when meeting content is ready (transcript, summary, action items)
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class FathomWebhookPayload {

    private String title;

    @JsonProperty("meeting_title")
    private String meetingTitle;

    @JsonProperty("recording_id")
    private Long recordingId;

    private String url;

    @JsonProperty("share_url")
    private String shareUrl;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("scheduled_start_time")
    private LocalDateTime scheduledStartTime;

    @JsonProperty("scheduled_end_time")
    private LocalDateTime scheduledEndTime;

    @JsonProperty("recording_start_time")
    private LocalDateTime recordingStartTime;

    @JsonProperty("recording_end_time")
    private LocalDateTime recordingEndTime;

    @JsonProperty("calendar_invitees_domains_type")
    private String calendarInviteeDomainsType;

    @JsonProperty("transcript_language")
    private String transcriptLanguage;

    @JsonProperty("transcript")
    private List<TranscriptEntry> transcript;

    @JsonProperty("default_summary")
    private DefaultSummary defaultSummary;

    @JsonProperty("action_items")
    private List<ActionItem> actionItems;

    @JsonProperty("calendar_invitees")
    private List<CalendarInvitee> calendarInvitees;

    @JsonProperty("recorded_by")
    private RecordedBy recordedBy;

    @JsonProperty("crm_matches")
    private CrmMatches crmMatches;

    // Nested classes

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TranscriptEntry {
        private Speaker speaker;
        private String text;
        private String timestamp; // HH:MM:SS format

        public Speaker getSpeaker() { return speaker; }
        public void setSpeaker(Speaker speaker) { this.speaker = speaker; }

        public String getText() { return text; }
        public void setText(String text) { this.text = text; }

        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Speaker {
        @JsonProperty("display_name")
        private String displayName;

        @JsonProperty("matched_calendar_invitee_email")
        private String matchedCalendarInviteeEmail;

        public String getDisplayName() { return displayName; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }

        public String getMatchedCalendarInviteeEmail() { return matchedCalendarInviteeEmail; }
        public void setMatchedCalendarInviteeEmail(String matchedCalendarInviteeEmail) {
            this.matchedCalendarInviteeEmail = matchedCalendarInviteeEmail;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DefaultSummary {
        @JsonProperty("template_name")
        private String templateName;

        @JsonProperty("markdown_formatted")
        private String markdownFormatted;

        public String getTemplateName() { return templateName; }
        public void setTemplateName(String templateName) { this.templateName = templateName; }

        public String getMarkdownFormatted() { return markdownFormatted; }
        public void setMarkdownFormatted(String markdownFormatted) { this.markdownFormatted = markdownFormatted; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ActionItem {
        private String description;

        @JsonProperty("user_generated")
        private Boolean userGenerated;

        private Boolean completed;

        @JsonProperty("recording_timestamp")
        private String recordingTimestamp; // HH:MM:SS format

        @JsonProperty("recording_playback_url")
        private String recordingPlaybackUrl;

        private Assignee assignee;

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Boolean getUserGenerated() { return userGenerated; }
        public void setUserGenerated(Boolean userGenerated) { this.userGenerated = userGenerated; }

        public Boolean getCompleted() { return completed; }
        public void setCompleted(Boolean completed) { this.completed = completed; }

        public String getRecordingTimestamp() { return recordingTimestamp; }
        public void setRecordingTimestamp(String recordingTimestamp) { this.recordingTimestamp = recordingTimestamp; }

        public String getRecordingPlaybackUrl() { return recordingPlaybackUrl; }
        public void setRecordingPlaybackUrl(String recordingPlaybackUrl) { this.recordingPlaybackUrl = recordingPlaybackUrl; }

        public Assignee getAssignee() { return assignee; }
        public void setAssignee(Assignee assignee) { this.assignee = assignee; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Assignee {
        private String name;
        private String email;
        private String team;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getTeam() { return team; }
        public void setTeam(String team) { this.team = team; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CalendarInvitee {
        private String name;

        @JsonProperty("matched_speaker_display_name")
        private String matchedSpeakerDisplayName;

        private String email;

        @JsonProperty("email_domain")
        private String emailDomain;

        @JsonProperty("is_external")
        private Boolean isExternal;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getMatchedSpeakerDisplayName() { return matchedSpeakerDisplayName; }
        public void setMatchedSpeakerDisplayName(String matchedSpeakerDisplayName) {
            this.matchedSpeakerDisplayName = matchedSpeakerDisplayName;
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getEmailDomain() { return emailDomain; }
        public void setEmailDomain(String emailDomain) { this.emailDomain = emailDomain; }

        public Boolean getIsExternal() { return isExternal; }
        public void setIsExternal(Boolean isExternal) { this.isExternal = isExternal; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class RecordedBy {
        private String name;
        private String email;

        @JsonProperty("email_domain")
        private String emailDomain;

        private String team;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getEmailDomain() { return emailDomain; }
        public void setEmailDomain(String emailDomain) { this.emailDomain = emailDomain; }

        public String getTeam() { return team; }
        public void setTeam(String team) { this.team = team; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CrmMatches {
        private List<Contact> contacts;
        private List<Company> companies;
        private List<Deal> deals;
        private String error; // "no CRM connected" if no CRM is linked to Fathom

        public List<Contact> getContacts() { return contacts; }
        public void setContacts(List<Contact> contacts) { this.contacts = contacts; }

        public List<Company> getCompanies() { return companies; }
        public void setCompanies(List<Company> companies) { this.companies = companies; }

        public List<Deal> getDeals() { return deals; }
        public void setDeals(List<Deal> deals) { this.deals = deals; }

        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Contact {
        private String name;
        private String email;

        @JsonProperty("record_url")
        private String recordUrl; // Zoho CRM URL if connected

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getRecordUrl() { return recordUrl; }
        public void setRecordUrl(String recordUrl) { this.recordUrl = recordUrl; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Company {
        private String name;

        @JsonProperty("record_url")
        private String recordUrl;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getRecordUrl() { return recordUrl; }
        public void setRecordUrl(String recordUrl) { this.recordUrl = recordUrl; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Deal {
        private String name;
        private Integer amount;

        @JsonProperty("record_url")
        private String recordUrl;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public Integer getAmount() { return amount; }
        public void setAmount(Integer amount) { this.amount = amount; }

        public String getRecordUrl() { return recordUrl; }
        public void setRecordUrl(String recordUrl) { this.recordUrl = recordUrl; }
    }

    // Main class getters and setters

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMeetingTitle() { return meetingTitle; }
    public void setMeetingTitle(String meetingTitle) { this.meetingTitle = meetingTitle; }

    public Long getRecordingId() { return recordingId; }
    public void setRecordingId(Long recordingId) { this.recordingId = recordingId; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getShareUrl() { return shareUrl; }
    public void setShareUrl(String shareUrl) { this.shareUrl = shareUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getScheduledStartTime() { return scheduledStartTime; }
    public void setScheduledStartTime(LocalDateTime scheduledStartTime) { this.scheduledStartTime = scheduledStartTime; }

    public LocalDateTime getScheduledEndTime() { return scheduledEndTime; }
    public void setScheduledEndTime(LocalDateTime scheduledEndTime) { this.scheduledEndTime = scheduledEndTime; }

    public LocalDateTime getRecordingStartTime() { return recordingStartTime; }
    public void setRecordingStartTime(LocalDateTime recordingStartTime) { this.recordingStartTime = recordingStartTime; }

    public LocalDateTime getRecordingEndTime() { return recordingEndTime; }
    public void setRecordingEndTime(LocalDateTime recordingEndTime) { this.recordingEndTime = recordingEndTime; }

    public String getCalendarInviteeDomainsType() { return calendarInviteeDomainsType; }
    public void setCalendarInviteeDomainsType(String calendarInviteeDomainsType) {
        this.calendarInviteeDomainsType = calendarInviteeDomainsType;
    }

    public String getTranscriptLanguage() { return transcriptLanguage; }
    public void setTranscriptLanguage(String transcriptLanguage) { this.transcriptLanguage = transcriptLanguage; }

    public List<TranscriptEntry> getTranscript() { return transcript; }
    public void setTranscript(List<TranscriptEntry> transcript) { this.transcript = transcript; }

    public DefaultSummary getDefaultSummary() { return defaultSummary; }
    public void setDefaultSummary(DefaultSummary defaultSummary) { this.defaultSummary = defaultSummary; }

    public List<ActionItem> getActionItems() { return actionItems; }
    public void setActionItems(List<ActionItem> actionItems) { this.actionItems = actionItems; }

    public List<CalendarInvitee> getCalendarInvitees() { return calendarInvitees; }
    public void setCalendarInvitees(List<CalendarInvitee> calendarInvitees) { this.calendarInvitees = calendarInvitees; }

    public RecordedBy getRecordedBy() { return recordedBy; }
    public void setRecordedBy(RecordedBy recordedBy) { this.recordedBy = recordedBy; }

    public CrmMatches getCrmMatches() { return crmMatches; }
    public void setCrmMatches(CrmMatches crmMatches) { this.crmMatches = crmMatches; }
}
