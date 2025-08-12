package com.g37.meetingmanager.controller;

import com.g37.meetingmanager.dto.CreateMeetingRequest;
import com.g37.meetingmanager.model.Meeting;
import com.g37.meetingmanager.model.Organization;
import com.g37.meetingmanager.model.User;
import com.g37.meetingmanager.repository.mysql.MeetingRepository;
import com.g37.meetingmanager.repository.mysql.OrganizationRepository;
import com.g37.meetingmanager.repository.mysql.UserRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/meetings")
@CrossOrigin(origins = "*")
public class MeetingController {
    private final MeetingRepository meetingRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;

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
    public ResponseEntity<Meeting> createMeeting(@RequestBody CreateMeetingRequest request) {
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
            
            Meeting savedMeeting = meetingRepository.save(meeting);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedMeeting);
        } catch (Exception e) {
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
}
