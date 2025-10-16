package com.g37.meetingmanager.service;

import com.g37.meetingmanager.dto.FathomWebhookPayload;
import com.g37.meetingmanager.model.Meeting;
import com.g37.meetingmanager.repository.mysql.MeetingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Scheduled service that polls Fathom API for new recordings
 */
@Service
@ConditionalOnProperty(name = "fathom.api.enabled", havingValue = "true")
public class FathomPollingService {
    private static final Logger logger = LoggerFactory.getLogger(FathomPollingService.class);
    
    @Autowired(required = false)
    private FathomApiService fathomApiService;
    
    @Autowired
    private MeetingRepository meetingRepository;
    
    private LocalDateTime lastPollTime = LocalDateTime.now().minusDays(7); // Start with last 7 days
    
    /**
     * Poll Fathom API every 5 minutes for new recordings
     */
    @Scheduled(fixedRate = 300000, initialDelay = 10000) // 5 minutes = 300000ms, start after 10 seconds
    public void pollForNewRecordings() {
        if (fathomApiService == null) {
            logger.debug("FathomApiService not available - skipping poll");
            return;
        }
        
        try {
            logger.info("🔄 Polling Fathom API for new recordings since {}", lastPollTime);
            
            List<FathomWebhookPayload> recordings = fathomApiService.fetchRecordingsSince(lastPollTime);
            
            if (recordings.isEmpty()) {
                logger.info("No new recordings found");
                lastPollTime = LocalDateTime.now();
                return;
            }
            
            logger.info("Found {} recordings to process", recordings.size());
            int processed = 0;
            int skipped = 0;
            
            for (FathomWebhookPayload recording : recordings) {
                // Check if recording already exists
                String recordingId = recording.getRecordingId() != null ?
                    recording.getRecordingId().toString() : null;

                if (recordingId != null) {
                    Optional<Meeting> existing = meetingRepository.findByFathomRecordingId(recordingId);
                    if (existing.isPresent()) {
                        // Check if existing meeting is missing data that the recording now has
                        Meeting existingMeeting = existing.get();
                        boolean needsUpdate = false;

                        // Check if transcript/summary data is now available
                        if (existingMeeting.getTranscript() == null && recording.getTranscript() != null && !recording.getTranscript().isEmpty()) {
                            logger.info("📝 Transcript now available for recording {}, updating meeting", recordingId);
                            needsUpdate = true;
                        }
                        if (existingMeeting.getFathomSummary() == null && recording.getSummary() != null && !recording.getSummary().isEmpty()) {
                            logger.info("📋 Summary now available for recording {}, updating meeting", recordingId);
                            needsUpdate = true;
                        }

                        if (!needsUpdate) {
                            logger.debug("Recording {} already exists with complete data, skipping", recordingId);
                            skipped++;
                            continue;
                        }

                        // Update existing meeting with new data
                        logger.info("🔄 Updating existing meeting {} with new data from Fathom", existingMeeting.getId());
                    }
                }

                // Process recording (create new or update existing)
                fathomApiService.processRecording(recording);
                processed++;
            }
            
            logger.info("✅ Polling complete: {} processed, {} skipped", processed, skipped);
            lastPollTime = LocalDateTime.now();
            
        } catch (Exception e) {
            logger.error("❌ Error during Fathom API polling", e);
        }
    }
}
