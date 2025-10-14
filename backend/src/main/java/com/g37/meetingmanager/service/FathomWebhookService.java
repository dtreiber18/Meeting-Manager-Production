package com.g37.meetingmanager.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.g37.meetingmanager.dto.FathomWebhookPayload;
import com.g37.meetingmanager.model.Meeting;
import com.g37.meetingmanager.model.MeetingParticipant;
import com.g37.meetingmanager.model.PendingAction;
import com.g37.meetingmanager.model.User;
import com.g37.meetingmanager.model.Organization;
import com.g37.meetingmanager.repository.mysql.UserRepository;
import com.g37.meetingmanager.repository.mysql.OrganizationRepository;
import com.g37.meetingmanager.repository.mysql.MeetingRepository;
import com.g37.meetingmanager.repository.mysql.MeetingParticipantRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;

/**
 * Service for processing Fathom webhooks
 * Handles webhook signature verification and meeting data processing
 */
@Service
@ConditionalOnProperty(name = "fathom.enabled", havingValue = "true", matchIfMissing = false)
public class FathomWebhookService {

    private static final Logger logger = LoggerFactory.getLogger(FathomWebhookService.class);

    @Value("${fathom.webhook.secret}")
    private String webhookSecret;

    @Autowired
    private MeetingRepository meetingRepository;

    @Autowired(required = false)
    private PendingActionService pendingActionService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private MeetingParticipantRepository meetingParticipantRepository;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Verify Fathom webhook signature using HMAC SHA-256
     * Based on Fathom API documentation
     *
     * Signature format: "v1,BASE64_SIGNATURE" or "v1,SIG1 SIG2 SIG3"
     *
     * @param signatureHeader The webhook-signature header value
     * @param rawBody The raw request body (before JSON parsing)
     * @return true if signature is valid
     */
    public boolean verifyWebhookSignature(String signatureHeader, String rawBody) {
        if (webhookSecret == null || webhookSecret.isEmpty()) {
            logger.warn("Fathom webhook secret not configured - skipping signature verification");
            return true; // Allow webhooks if secret not configured (development mode)
        }

        try {
            // Parse signature header: "v1,BASE64_SIGNATURE"
            String[] parts = signatureHeader.split(",", 2);
            if (parts.length != 2) {
                logger.warn("Invalid Fathom signature header format: {}", signatureHeader);
                return false;
            }

            String version = parts[0]; // "v1"
            String signatureBlock = parts[1];

            if (!"v1".equals(version)) {
                logger.warn("Unknown Fathom webhook signature version: {}", version);
                return false;
            }

            // Calculate expected signature using HMAC SHA-256
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(
                webhookSecret.getBytes(StandardCharsets.UTF_8),
                "HmacSHA256"
            );
            mac.init(secretKey);

            byte[] hash = mac.doFinal(rawBody.getBytes(StandardCharsets.UTF_8));
            String expectedSignature = Base64.getEncoder().encodeToString(hash);

            // Signature block may contain multiple space-delimited signatures
            // Match if ANY signature matches (supports signature rotation)
            String[] providedSignatures = signatureBlock.split(" ");

            boolean verified = Arrays.asList(providedSignatures).contains(expectedSignature);

            if (!verified) {
                logger.warn("Fathom webhook signature verification FAILED");
                logger.debug("Expected: {}, Provided: {}", expectedSignature, signatureBlock);
            } else {
                logger.debug("Fathom webhook signature verified successfully");
            }

            return verified;

        } catch (Exception e) {
            logger.error("Error verifying Fathom webhook signature: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Process webhook asynchronously to avoid blocking Fathom's webhook delivery
     * Returns 200 OK immediately to Fathom, processes in background
     *
     * @param webhookId Unique webhook message ID
     * @param rawPayload Raw JSON payload from Fathom
     */
    @Async
    public void processWebhookAsync(String webhookId, String rawPayload) {
        try {
            logger.info("Processing Fathom webhook ID: {}", webhookId);

            // Parse JSON payload
            FathomWebhookPayload payload = objectMapper.readValue(
                rawPayload,
                FathomWebhookPayload.class
            );

            logger.info("Parsed Fathom meeting: '{}' (Recording ID: {})",
                payload.getTitle(), payload.getRecordingId());

            // 1. Create Meeting record
            Meeting meeting = createMeetingFromFathom(payload);
            logger.info("Created meeting with ID: {} from Fathom recording {}",
                meeting.getId(), payload.getRecordingId());

            // 2. Extract and create PendingActions from action_items
            if (payload.getActionItems() != null && !payload.getActionItems().isEmpty()) {
                List<PendingAction> actions = extractActionItems(payload, meeting.getId());
                logger.info("Created {} pending actions from Fathom meeting", actions.size());
            } else {
                logger.info("No action items found in Fathom meeting");
            }

            // 3. Extract CRM contacts (if available)
            extractCRMContacts(payload, meeting.getId());

            logger.info("Successfully processed Fathom webhook ID: {}", webhookId);

        } catch (Exception e) {
            logger.error("Error processing Fathom webhook ID {}: {}", webhookId, e.getMessage(), e);
        }
    }

    /**
     * Create Meeting entity from Fathom webhook payload
     *
     * @param payload Fathom webhook payload
     * @return Created Meeting entity
     */
    private Meeting createMeetingFromFathom(FathomWebhookPayload payload) {
        Meeting meeting = new Meeting();

        // Basic meeting information
        meeting.setTitle(payload.getTitle() != null ? payload.getTitle() : payload.getMeetingTitle());
        meeting.setStartTime(payload.getScheduledStartTime() != null
            ? payload.getScheduledStartTime()
            : payload.getRecordingStartTime());
        meeting.setEndTime(payload.getScheduledEndTime() != null
            ? payload.getScheduledEndTime()
            : payload.getRecordingEndTime());

        // Fathom-specific fields
        meeting.setRecordingUrl(payload.getUrl());
        meeting.setSource(Meeting.MeetingSource.FATHOM);
        meeting.setSourceType(Meeting.SourceType.EXTERNAL_SYSTEM);
        meeting.setStatus(Meeting.MeetingStatus.COMPLETED); // Fathom only sends completed meetings

        // Store Fathom summary
        if (payload.getDefaultSummary() != null) {
            meeting.setSummary(payload.getDefaultSummary().getMarkdownFormatted());
        }

        // Store transcript URL for linking
        meeting.setTranscriptUrl(payload.getShareUrl());

        // Determine meeting type based on invitees
        if ("only_internal".equals(payload.getCalendarInviteeDomainsType())) {
            meeting.setMeetingType(Meeting.MeetingType.TEAM_MEETING);
        } else if ("one_or_more_external".equals(payload.getCalendarInviteeDomainsType())) {
            meeting.setMeetingType(Meeting.MeetingType.CLIENT_MEETING);
        } else {
            meeting.setMeetingType(Meeting.MeetingType.GENERAL);
        }

        // Set organizer from recordedBy
        if (payload.getRecordedBy() != null && payload.getRecordedBy().getEmail() != null) {
            Optional<User> organizer = userRepository.findByEmail(payload.getRecordedBy().getEmail());
            if (organizer.isPresent()) {
                meeting.setOrganizer(organizer.get());
                meeting.setOrganization(organizer.get().getOrganization());
            } else {
                // Create default organizer/organization for Fathom meetings
                setDefaultOrganizerAndOrganization(meeting);
            }
        } else {
            setDefaultOrganizerAndOrganization(meeting);
        }

        // Create MeetingParticipant records from Fathom calendar invitees
        if (payload.getCalendarInvitees() != null && !payload.getCalendarInvitees().isEmpty()) {
            createMeetingParticipants(meeting, payload.getCalendarInvitees());
        }

        // TODO: Store full transcript in MongoDB for searchability

        return meetingRepository.save(meeting);
    }

    /**
     * Set default organizer and organization for Fathom meetings
     * when user is not found in the system
     */
    private void setDefaultOrganizerAndOrganization(Meeting meeting) {
        // Try to find or create a default "Fathom External" organization
        Optional<Organization> fathomOrg = organizationRepository.findByName("Fathom External");
        Organization org;

        if (fathomOrg.isPresent()) {
            org = fathomOrg.get();
        } else {
            // Create default organization for external Fathom meetings
            org = new Organization();
            org.setName("Fathom External");
            org.setDomain("fathom.video");
            org.setIsActive(true);
            org = organizationRepository.save(org);
            logger.info("Created default organization for Fathom meetings: {}", org.getId());
        }

        meeting.setOrganization(org);

        // Try to find or create a default Fathom system user
        Optional<User> fathomUser = userRepository.findByEmail("fathom@system.local");
        User user;

        if (fathomUser.isPresent()) {
            user = fathomUser.get();
        } else {
            user = new User();
            user.setEmail("fathom@system.local");
            user.setFirstName("Fathom");
            user.setLastName("System");
            user.setOrganization(org);
            user.setIsActive(true);
            user.setPasswordHash(""); // No password for system user
            user = userRepository.save(user);
            logger.info("Created default user for Fathom meetings: {}", user.getId());
        }

        meeting.setOrganizer(user);
    }

    /**
     * Create MeetingParticipant records from Fathom calendar invitees
     * Marks external participants appropriately (user == null)
     *
     * @param meeting The meeting to add participants to
     * @param calendarInvitees List of Fathom calendar invitees
     */
    private void createMeetingParticipants(Meeting meeting, List<FathomWebhookPayload.CalendarInvitee> calendarInvitees) {
        logger.info("Creating {} participants for meeting {}", calendarInvitees.size(), meeting.getId());

        for (FathomWebhookPayload.CalendarInvitee invitee : calendarInvitees) {
            MeetingParticipant participant = new MeetingParticipant();
            participant.setMeeting(meeting);
            participant.setEmail(invitee.getEmail());
            participant.setName(invitee.getName());

            // Try to find existing user by email
            Optional<User> existingUser = userRepository.findByEmail(invitee.getEmail());

            if (existingUser.isPresent()) {
                // Internal participant - link to user
                participant.setUser(existingUser.get());
                participant.setParticipantRole(MeetingParticipant.ParticipantRole.ATTENDEE);
                logger.debug("Linked participant {} to existing user", invitee.getEmail());
            } else {
                // External participant - user remains null (this makes isExternal() return true)
                participant.setUser(null);
                participant.setParticipantRole(MeetingParticipant.ParticipantRole.ATTENDEE);
                logger.debug("Created external participant: {}", invitee.getEmail());
            }

            // Set attendance based on speaker match (if they spoke, they attended)
            if (invitee.getMatchedSpeakerDisplayName() != null) {
                participant.setAttendanceStatus(MeetingParticipant.AttendanceStatus.PRESENT);
                participant.setInvitationStatus(MeetingParticipant.InvitationStatus.ACCEPTED);
            } else {
                participant.setAttendanceStatus(MeetingParticipant.AttendanceStatus.UNKNOWN);
                participant.setInvitationStatus(MeetingParticipant.InvitationStatus.NO_RESPONSE);
            }

            // Save participant
            meetingParticipantRepository.save(participant);
        }

        logger.info("Created {} participants for Fathom meeting", calendarInvitees.size());
    }

    /**
     * Extract action items from Fathom webhook and create PendingActions
     *
     * @param payload Fathom webhook payload
     * @param meetingId ID of created meeting
     * @return List of created PendingActions
     */
    private List<PendingAction> extractActionItems(FathomWebhookPayload payload, Long meetingId) {
        List<PendingAction> actions = new ArrayList<>();

        if (pendingActionService == null) {
            logger.warn("PendingActionService not available (MongoDB may be disabled)");
            return actions;
        }

        for (FathomWebhookPayload.ActionItem item : payload.getActionItems()) {
            PendingAction action = new PendingAction();

            action.setTitle(item.getDescription());
            action.setDescription(item.getDescription());
            action.setMeetingId(meetingId);
            action.setActionType(PendingAction.ActionType.TASK);
            action.setStatus(PendingAction.ActionStatus.NEW); // Requires user approval
            action.setPriority(PendingAction.Priority.MEDIUM);

            // Set assignee from Fathom data
            if (item.getAssignee() != null) {
                action.setAssigneeEmail(item.getAssignee().getEmail());
                action.setAssigneeName(item.getAssignee().getName());

                // Try to find user ID by email
                if (item.getAssignee().getEmail() != null) {
                    Optional<User> assignee = userRepository.findByEmail(item.getAssignee().getEmail());
                    if (assignee.isPresent()) {
                        action.setAssigneeId(assignee.get().getId());
                    }
                }
            }

            // Store link to exact recording timestamp
            StringBuilder notes = new StringBuilder();
            if (item.getRecordingPlaybackUrl() != null) {
                notes.append("Recording: ").append(item.getRecordingPlaybackUrl());
            }
            if (item.getRecordingTimestamp() != null) {
                if (notes.length() > 0) notes.append("\n");
                notes.append("Timestamp: ").append(item.getRecordingTimestamp());
            }
            if (notes.length() > 0) {
                action.setNotes(notes.toString());
            }

            // Mark as from Fathom (use recording ID as execution ID)
            action.setN8nExecutionId("fathom_" + payload.getRecordingId());
            action.setN8nWorkflowStatus("fathom_webhook");

            // Save to MongoDB
            try {
                action = pendingActionService.createPendingAction(action);
                actions.add(action);
                logger.debug("Created pending action: {} for meeting {}", action.getTitle(), meetingId);
            } catch (Exception e) {
                logger.error("Error creating pending action: {}", e.getMessage(), e);
            }
        }

        return actions;
    }

    /**
     * Extract CRM contacts from Fathom webhook data
     * Handles both Zoho CRM matches (if Fathom has CRM connected)
     * and calendar invitees (fallback)
     *
     * @param payload Fathom webhook payload
     * @param meetingId ID of created meeting
     */
    private void extractCRMContacts(FathomWebhookPayload payload, Long meetingId) {
        // Check if Fathom has CRM connected and returned matches
        if (payload.getCrmMatches() != null && payload.getCrmMatches().getError() == null) {
            processZohoCRMMatches(payload.getCrmMatches(), meetingId);
        } else {
            // No CRM in Fathom - extract contacts from calendar invitees
            extractContactsFromInvitees(payload.getCalendarInvitees(), meetingId);
        }
    }

    /**
     * Process CRM matches from Fathom (Zoho CRM if connected)
     */
    private void processZohoCRMMatches(FathomWebhookPayload.CrmMatches crmMatches, Long meetingId) {
        int contactCount = crmMatches.getContacts() != null ? crmMatches.getContacts().size() : 0;
        int companyCount = crmMatches.getCompanies() != null ? crmMatches.getCompanies().size() : 0;
        int dealCount = crmMatches.getDeals() != null ? crmMatches.getDeals().size() : 0;

        logger.info("Processing Zoho CRM matches for meeting {}: {} contacts, {} companies, {} deals",
            meetingId, contactCount, companyCount, dealCount);

        // TODO: Create PendingActions for CRM sync operations
        // TODO: Store CRM record URLs for quick access
        // TODO: Link deals to meetings for tracking
    }

    /**
     * Extract external contacts from calendar invitees
     * for potential CRM sync
     */
    private void extractContactsFromInvitees(List<FathomWebhookPayload.CalendarInvitee> invitees, Long meetingId) {
        if (invitees == null || invitees.isEmpty()) {
            logger.debug("No calendar invitees to process for meeting {}", meetingId);
            return;
        }

        long externalCount = invitees.stream()
            .filter(inv -> inv.getIsExternal() != null && inv.getIsExternal())
            .count();

        logger.info("Found {} external contacts in meeting {} for potential CRM sync", externalCount, meetingId);

        // TODO: Create ContactCandidate records for CRM sync approval
        // TODO: Create PendingActions for contact creation
    }
}
