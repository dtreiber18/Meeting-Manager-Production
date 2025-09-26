package com.g37.meetingmanager.controller;

import com.g37.meetingmanager.dto.CreateMeetingRequest;
import com.g37.meetingmanager.model.Meeting;
import com.g37.meetingmanager.model.Organization;
import com.g37.meetingmanager.model.User;
import com.g37.meetingmanager.repository.mysql.MeetingRepository;
import com.g37.meetingmanager.repository.mysql.OrganizationRepository;
import com.g37.meetingmanager.repository.mysql.UserRepository;
import com.g37.meetingmanager.service.CalendarIntegrationService;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/meetings")
@CrossOrigin(origins = "*")
public class MeetingController {
    private static final Logger logger = LoggerFactory.getLogger(MeetingController.class);
    
    private final MeetingRepository meetingRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    
    @Autowired
    private CalendarIntegrationService calendarIntegrationService;

    public MeetingController(MeetingRepository meetingRepository, 
                           UserRepository userRepository,
                           OrganizationRepository organizationRepository) {
        this.meetingRepository = meetingRepository;
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<Meeting> getAllMeetings() {
        return meetingRepository.findAll();
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<Meeting> getMeetingById(@PathVariable Long id) {
        Optional<Meeting> meeting = meetingRepository.findById(id);
        return meeting.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<Meeting> createMeeting(@RequestBody CreateMeetingRequest request,
                                               @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Create a new meeting from the request
            Meeting meeting = new Meeting();
            meeting.setTitle(request.getTitle() != null ? request.getTitle() : "New Meeting");
            meeting.setDescription(request.getDescription() != null ? request.getDescription() : "");
            meeting.setStartTime(request.getStartTime() != null ? 
                request.getStartTime() : LocalDateTime.now().plusDays(1));
            meeting.setEndTime(request.getEndTime() != null ? 
                request.getEndTime() : LocalDateTime.now().plusDays(1).plusHours(1));
            meeting.setMeetingType(request.getMeetingType() != null ? 
                request.getMeetingType() : Meeting.MeetingType.TEAM_MEETING);
            meeting.setStatus(request.getStatus() != null ? 
                request.getStatus() : Meeting.MeetingStatus.SCHEDULED);
            meeting.setPriority(request.getPriority() != null ? 
                request.getPriority() : Meeting.Priority.MEDIUM);
            meeting.setIsRecurring(request.getIsRecurring() != null ? 
                request.getIsRecurring() : false);
            meeting.setIsPublic(request.getIsPublic() != null ? 
                request.getIsPublic() : false);
            meeting.setRequiresApproval(request.getRequiresApproval() != null ? 
                request.getRequiresApproval() : false);
            meeting.setAllowRecording(request.getAllowRecording() != null ? 
                request.getAllowRecording() : true);
            meeting.setAutoTranscription(request.getAutoTranscription() != null ? 
                request.getAutoTranscription() : false);
            meeting.setAiAnalysisEnabled(request.getAiAnalysisEnabled() != null ? 
                request.getAiAnalysisEnabled() : false);
            
            // Set optional fields
            meeting.setAgenda(request.getAgenda());
            meeting.setLocation(request.getLocation());
            meeting.setMeetingLink(request.getMeetingLink());
            
            // Set organizer (default to first user if not specified)
            User defaultUser = userRepository.findAll().stream().findFirst().orElse(null);
            if (defaultUser != null) {
                meeting.setOrganizer(defaultUser);
            }
            
            // Set organization (default to first organization if not specified)
            Organization defaultOrg = organizationRepository.findAll().stream().findFirst().orElse(null);
            if (defaultOrg != null) {
                meeting.setOrganization(defaultOrg);
            }
            
            // Save the meeting to the database first
            Meeting savedMeeting = meetingRepository.save(meeting);
            logger.info("Meeting saved to database: {}", savedMeeting.getTitle());
            
            // Attempt to create Outlook calendar event using the organizer's Graph token
            User organizer = savedMeeting.getOrganizer();
            if (organizer != null && organizer.getGraphAccessToken() != null) {
                boolean calendarEventCreated = calendarIntegrationService.createOutlookCalendarEvent(
                    savedMeeting, 
                    organizer.getGraphAccessToken()
                );
                
                if (calendarEventCreated) {
                    logger.info("Successfully created Outlook calendar event for meeting: {}", savedMeeting.getTitle());
                } else {
                    logger.warn("Failed to create Outlook calendar event for meeting: {}", savedMeeting.getTitle());
                }
            } else {
                logger.info("No Microsoft Graph access token available for organizer. Meeting created locally only: {}", savedMeeting.getTitle());
            }
            
            return ResponseEntity.status(HttpStatus.CREATED).body(savedMeeting);
        } catch (Exception e) {
            logger.error("Error creating meeting", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<Meeting> updateMeeting(@PathVariable Long id, @RequestBody CreateMeetingRequest request) {
        Optional<Meeting> existingMeeting = meetingRepository.findById(id);
        if (existingMeeting.isPresent()) {
            Meeting meeting = existingMeeting.get();
            
            // Update fields
            if (request.getTitle() != null) {
                meeting.setTitle(request.getTitle());
            }
            if (request.getDescription() != null) {
                meeting.setDescription(request.getDescription());
            }
            if (request.getStartTime() != null) {
                meeting.setStartTime(request.getStartTime());
            }
            if (request.getEndTime() != null) {
                meeting.setEndTime(request.getEndTime());
            }
            if (request.getMeetingType() != null) {
                meeting.setMeetingType(request.getMeetingType());
            }
            if (request.getStatus() != null) {
                meeting.setStatus(request.getStatus());
            }
            if (request.getPriority() != null) {
                meeting.setPriority(request.getPriority());
            }
            if (request.getAgenda() != null) {
                meeting.setAgenda(request.getAgenda());
            }
            if (request.getLocation() != null) {
                meeting.setLocation(request.getLocation());
            }
            if (request.getMeetingLink() != null) {
                meeting.setMeetingLink(request.getMeetingLink());
            }
            if (request.getIsRecurring() != null) {
                meeting.setIsRecurring(request.getIsRecurring());
            }
            if (request.getIsPublic() != null) {
                meeting.setIsPublic(request.getIsPublic());
            }
            if (request.getRequiresApproval() != null) {
                meeting.setRequiresApproval(request.getRequiresApproval());
            }
            if (request.getAllowRecording() != null) {
                meeting.setAllowRecording(request.getAllowRecording());
            }
            if (request.getAutoTranscription() != null) {
                meeting.setAutoTranscription(request.getAutoTranscription());
            }
            if (request.getAiAnalysisEnabled() != null) {
                meeting.setAiAnalysisEnabled(request.getAiAnalysisEnabled());
            }
            
            Meeting updatedMeeting = meetingRepository.save(meeting);
            return ResponseEntity.ok(updatedMeeting);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteMeeting(@PathVariable Long id) {
        if (meetingRepository.existsById(id)) {
            meetingRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    /**
     * Get the OAuth authorization URL for Microsoft Graph calendar access
     */
    @GetMapping("/calendar/auth-url")
    public ResponseEntity<String> getCalendarAuthUrl() {
        try {
            String authUrl = calendarIntegrationService.getAuthUrl();
            return ResponseEntity.ok(authUrl);
        } catch (Exception e) {
            logger.error("Error generating calendar auth URL", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Temporary notification endpoint to test if it works via MeetingController
     */
    @GetMapping("/test-notifications")
    public ResponseEntity<List<java.util.Map<String, Object>>> getTestNotifications() {
        logger.info("Testing notifications via MeetingController");
        return ResponseEntity.ok(List.of(
            java.util.Map.of("id", 1, "message", "Test notification from MeetingController", "read", false),
            java.util.Map.of("id", 2, "message", "Another test notification", "read", true)
        ));
    }
}
