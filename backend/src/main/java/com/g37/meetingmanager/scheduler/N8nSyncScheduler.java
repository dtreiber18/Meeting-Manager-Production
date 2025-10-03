package com.g37.meetingmanager.scheduler;

import com.g37.meetingmanager.dto.N8nOperationDTO;
import com.g37.meetingmanager.model.PendingAction;
import com.g37.meetingmanager.repository.mysql.MeetingRepository;
import com.g37.meetingmanager.service.N8nService;
import com.g37.meetingmanager.service.PendingActionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduler for automatically syncing pending operations from N8N
 * Only runs when both N8N and MongoDB are enabled
 */
@Component
@ConditionalOnProperty(
        value = {"n8n.enabled", "spring.data.mongodb.uri"},
        havingValue = "true",
        matchIfMissing = false
)
public class N8nSyncScheduler {

    private static final Logger logger = LoggerFactory.getLogger(N8nSyncScheduler.class);

    @Autowired(required = false)
    private N8nService n8nService;

    @Autowired(required = false)
    private PendingActionService pendingActionService;

    @Autowired
    private MeetingRepository meetingRepository;

    /**
     * Sync pending operations from N8N for recent meetings
     * Runs every 15 minutes
     */
    @Scheduled(fixedRate = 900000) // 15 minutes in milliseconds
    public void syncPendingOperationsFromN8n() {
        if (n8nService == null || !n8nService.isN8nAvailable()) {
            logger.debug("N8N service not available, skipping auto-sync");
            return;
        }

        if (pendingActionService == null) {
            logger.debug("PendingActionService not available, skipping auto-sync");
            return;
        }

        try {
            logger.info("Starting auto-sync of pending operations from N8N");

            // Get recent meetings (e.g., meetings in the last 30 days)
            LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
            List<Long> recentMeetingIds = meetingRepository.findAll().stream()
                    .filter(meeting -> meeting.getStartTime() != null &&
                            meeting.getStartTime().isAfter(thirtyDaysAgo))
                    .map(meeting -> meeting.getId())
                    .toList();

            int totalSynced = 0;

            // Sync pending operations for each recent meeting
            for (Long meetingId : recentMeetingIds) {
                try {
                    List<N8nOperationDTO> n8nOperations = n8nService.getPendingOperations(meetingId.toString());

                    // Check if we already have these operations in the database
                    List<PendingAction> existingActions = pendingActionService.getPendingActionsByMeeting(meetingId);

                    for (N8nOperationDTO n8nOp : n8nOperations) {
                        // Check if operation already exists (by n8nExecutionId or unique identifiers)
                        boolean exists = existingActions.stream()
                                .anyMatch(existing ->
                                        existing.getN8nExecutionId() != null &&
                                                existing.getN8nExecutionId().equals(n8nOp.getId())
                                );

                        if (!exists) {
                            // Convert and create new pending action
                            PendingAction newAction = n8nService.convertToPendingAction(n8nOp);
                            newAction.setMeetingId(meetingId);
                            pendingActionService.createPendingAction(newAction);
                            totalSynced++;
                            logger.debug("Synced new pending action from N8N for meeting {}: {}",
                                    meetingId, newAction.getTitle());
                        }
                    }
                } catch (Exception e) {
                    logger.error("Error syncing pending operations for meeting {}: {}",
                            meetingId, e.getMessage());
                }
            }

            logger.info("Completed auto-sync from N8N: {} new pending actions synced across {} meetings",
                    totalSynced, recentMeetingIds.size());

        } catch (Exception e) {
            logger.error("Error during N8N auto-sync", e);
        }
    }

    /**
     * Initial sync on application startup (runs 1 minute after startup)
     */
    @Scheduled(initialDelay = 60000, fixedRate = Long.MAX_VALUE)
    public void initialSync() {
        logger.info("Running initial N8N sync on application startup");
        syncPendingOperationsFromN8n();
    }
}
