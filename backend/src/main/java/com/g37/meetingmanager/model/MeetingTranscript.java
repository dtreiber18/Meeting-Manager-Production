package com.g37.meetingmanager.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.TextIndexed;

import java.time.LocalDateTime;
import java.util.List;

/**
 * MongoDB document for storing full meeting transcripts
 * Enables full-text search across meeting content
 */
@Document(collection = "mnm_transcripts")
@JsonIgnoreProperties(ignoreUnknown = true)
public class MeetingTranscript {

    @Id
    private String id; // MongoDB ObjectId

    @Field("meeting_id")
    @Indexed(unique = true)
    private Long meetingId; // Reference to SQL meeting ID

    @Field("organization_id")
    @Indexed
    private Long organizationId; // For multi-tenant data isolation

    @Field("fathom_recording_id")
    @Indexed
    private String fathomRecordingId;

    @Field("fathom_recording_url")
    private String fathomRecordingUrl;

    @Field("fathom_share_url")
    private String fathomShareUrl;

    // Full transcript text - searchable
    @Field("transcript_text")
    @TextIndexed
    private String transcriptText;

    // Structured transcript with timestamps
    @Field("transcript_segments")
    private List<TranscriptSegment> transcriptSegments;

    // Summary from Fathom AI
    @Field("summary")
    @TextIndexed
    private String summary;

    // Key topics/tags
    @Field("topics")
    private List<String> topics;

    // Meeting duration in seconds
    @Field("duration_seconds")
    private Integer durationSeconds;

    // Metadata
    @Field("created_at")
    @Indexed
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;

    /**
     * Individual segment of transcript with timestamp
     */
    public static class TranscriptSegment {
        private String speaker;
        private String text;
        private String timestamp; // HH:MM:SS format from Fathom

        public TranscriptSegment() {}

        public TranscriptSegment(String speaker, String text, String timestamp) {
            this.speaker = speaker;
            this.text = text;
            this.timestamp = timestamp;
        }

        public String getSpeaker() { return speaker; }
        public void setSpeaker(String speaker) { this.speaker = speaker; }

        public String getText() { return text; }
        public void setText(String text) { this.text = text; }

        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Long getMeetingId() { return meetingId; }
    public void setMeetingId(Long meetingId) { this.meetingId = meetingId; }

    public Long getOrganizationId() { return organizationId; }
    public void setOrganizationId(Long organizationId) { this.organizationId = organizationId; }

    public String getFathomRecordingId() { return fathomRecordingId; }
    public void setFathomRecordingId(String fathomRecordingId) { this.fathomRecordingId = fathomRecordingId; }

    public String getFathomRecordingUrl() { return fathomRecordingUrl; }
    public void setFathomRecordingUrl(String fathomRecordingUrl) { this.fathomRecordingUrl = fathomRecordingUrl; }

    public String getFathomShareUrl() { return fathomShareUrl; }
    public void setFathomShareUrl(String fathomShareUrl) { this.fathomShareUrl = fathomShareUrl; }

    public String getTranscriptText() { return transcriptText; }
    public void setTranscriptText(String transcriptText) { this.transcriptText = transcriptText; }

    public List<TranscriptSegment> getTranscriptSegments() { return transcriptSegments; }
    public void setTranscriptSegments(List<TranscriptSegment> transcriptSegments) { this.transcriptSegments = transcriptSegments; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public List<String> getTopics() { return topics; }
    public void setTopics(List<String> topics) { this.topics = topics; }

    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
