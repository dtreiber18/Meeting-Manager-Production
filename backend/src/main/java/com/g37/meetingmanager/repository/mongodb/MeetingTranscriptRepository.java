package com.g37.meetingmanager.repository.mongodb;

import com.g37.meetingmanager.model.MeetingTranscript;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * MongoDB repository for meeting transcripts
 * Enables full-text search and efficient storage of large transcript data
 */
@Repository
@ConditionalOnProperty(name = "spring.data.mongodb.uri")
public interface MeetingTranscriptRepository extends MongoRepository<MeetingTranscript, String> {

    /**
     * Find transcript by SQL meeting ID
     */
    Optional<MeetingTranscript> findByMeetingId(Long meetingId);

    /**
     * Find transcript by Fathom recording ID
     */
    Optional<MeetingTranscript> findByFathomRecordingId(String fathomRecordingId);

    /**
     * Find all transcripts for an organization (multi-tenant isolation)
     */
    List<MeetingTranscript> findByOrganizationId(Long organizationId);

    /**
     * Check if transcript exists for meeting
     */
    boolean existsByMeetingId(Long meetingId);
}
