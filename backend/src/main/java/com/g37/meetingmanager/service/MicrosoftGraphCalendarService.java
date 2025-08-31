package com.g37.meetingmanager.service;

import com.g37.meetingmanager.model.Meeting;
import com.g37.meetingmanager.model.MeetingParticipant;
import com.g37.meetingmanager.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MicrosoftGraphCalendarService {
    
    private static final Logger logger = LoggerFactory.getLogger(MicrosoftGraphCalendarService.class);
    
    @Value("${app.microsoft.graph.enabled:false}")
    private boolean graphApiEnabled;
    
    private final RestTemplate restTemplate;
    
    public MicrosoftGraphCalendarService() {
        this.restTemplate = new RestTemplate();
    }
    
    /**
     * Creates a calendar event in Microsoft Outlook
     */
    public Map<String, Object> createCalendarEvent(Meeting meeting, String accessToken) {
        if (!graphApiEnabled || accessToken == null) {
            logger.warn("Microsoft Graph API is disabled or no access token provided");
            return null;
        }
        
        try {
            String createEventUrl = "https://graph.microsoft.com/v1.0/me/events";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> eventData = buildEventData(meeting);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(eventData, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                createEventUrl, 
                HttpMethod.POST, 
                request, 
                Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.CREATED) {
                Map<String, Object> eventResponse = response.getBody();
                logger.info("Successfully created calendar event in Outlook: {}", eventResponse.get("id"));
                return eventResponse;
            } else {
                logger.error("Failed to create calendar event. Status: {}", response.getStatusCode());
                return null;
            }
            
        } catch (Exception e) {
            logger.error("Error creating calendar event in Outlook", e);
            return null;
        }
    }
    
    /**
     * Updates an existing calendar event in Microsoft Outlook
     */
    public Map<String, Object> updateCalendarEvent(Meeting meeting, String eventId, String accessToken) {
        if (!graphApiEnabled || accessToken == null || eventId == null) {
            logger.warn("Microsoft Graph API is disabled, no access token, or no event ID provided");
            return null;
        }
        
        try {
            String updateEventUrl = "https://graph.microsoft.com/v1.0/me/events/" + eventId;
            
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> eventData = buildEventData(meeting);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(eventData, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                updateEventUrl, 
                HttpMethod.PATCH, 
                request, 
                Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> eventResponse = response.getBody();
                logger.info("Successfully updated calendar event in Outlook: {}", eventId);
                return eventResponse;
            } else {
                logger.error("Failed to update calendar event. Status: {}", response.getStatusCode());
                return null;
            }
            
        } catch (Exception e) {
            logger.error("Error updating calendar event in Outlook", e);
            return null;
        }
    }
    
    /**
     * Deletes a calendar event from Microsoft Outlook
     */
    public boolean deleteCalendarEvent(String eventId, String accessToken) {
        if (!graphApiEnabled || accessToken == null || eventId == null) {
            logger.warn("Microsoft Graph API is disabled, no access token, or no event ID provided");
            return false;
        }
        
        try {
            String deleteEventUrl = "https://graph.microsoft.com/v1.0/me/events/" + eventId;
            
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            
            HttpEntity<Void> request = new HttpEntity<>(headers);
            
            ResponseEntity<Void> response = restTemplate.exchange(
                deleteEventUrl, 
                HttpMethod.DELETE, 
                request, 
                Void.class
            );
            
            if (response.getStatusCode() == HttpStatus.NO_CONTENT) {
                logger.info("Successfully deleted calendar event from Outlook: {}", eventId);
                return true;
            } else {
                logger.error("Failed to delete calendar event. Status: {}", response.getStatusCode());
                return false;
            }
            
        } catch (Exception e) {
            logger.error("Error deleting calendar event from Outlook", e);
            return false;
        }
    }
    
    /**
     * Retrieves calendar events from Microsoft Outlook
     */
    public List<Map<String, Object>> getCalendarEvents(String accessToken, int days) {
        if (!graphApiEnabled || accessToken == null) {
            logger.warn("Microsoft Graph API is disabled or no access token provided");
            return Collections.emptyList();
        }
        
        try {
            // Get events for the next specified number of days
            String startDateTime = DateTimeFormatter.ISO_INSTANT.format(
                java.time.Instant.now().atZone(ZoneId.systemDefault())
            );
            String endDateTime = DateTimeFormatter.ISO_INSTANT.format(
                java.time.Instant.now().plusSeconds(days * 24 * 60 * 60).atZone(ZoneId.systemDefault())
            );
            
            String getEventsUrl = String.format(
                "https://graph.microsoft.com/v1.0/me/events?$filter=start/dateTime ge '%s' and end/dateTime le '%s'&$orderby=start/dateTime",
                startDateTime, endDateTime
            );
            
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            
            HttpEntity<Void> request = new HttpEntity<>(headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                getEventsUrl, 
                HttpMethod.GET, 
                request, 
                Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> responseBody = response.getBody();
                List<Map<String, Object>> events = (List<Map<String, Object>>) responseBody.get("value");
                logger.info("Successfully retrieved {} calendar events from Outlook", events.size());
                return events;
            } else {
                logger.error("Failed to retrieve calendar events. Status: {}", response.getStatusCode());
                return Collections.emptyList();
            }
            
        } catch (Exception e) {
            logger.error("Error retrieving calendar events from Outlook", e);
            return Collections.emptyList();
        }
    }
    
    /**
     * Builds the event data structure for Microsoft Graph API
     */
    private Map<String, Object> buildEventData(Meeting meeting) {
        Map<String, Object> eventData = new HashMap<>();
        
        // Basic event information
        eventData.put("subject", meeting.getTitle());
        eventData.put("body", Map.of(
            "contentType", "HTML",
            "content", buildEventDescription(meeting)
        ));
        
        // Date and time
        DateTimeFormatter formatter = DateTimeFormatter.ISO_OFFSET_DATE_TIME;
        eventData.put("start", Map.of(
            "dateTime", meeting.getStartTime().format(formatter),
            "timeZone", ZoneId.systemDefault().toString()
        ));
        eventData.put("end", Map.of(
            "dateTime", meeting.getEndTime().format(formatter),
            "timeZone", ZoneId.systemDefault().toString()
        ));
        
        // Location
        if (meeting.getLocation() != null && !meeting.getLocation().trim().isEmpty()) {
            eventData.put("location", Map.of(
                "displayName", meeting.getLocation()
            ));
        }
        
        // Attendees
        List<Map<String, Object>> attendees = new ArrayList<>();
        if (meeting.getParticipants() != null) {
            for (MeetingParticipant participant : meeting.getParticipants()) {
                User user = participant.getUser();
                if (user != null && user.getEmail() != null) {
                    attendees.add(Map.of(
                        "emailAddress", Map.of(
                            "address", user.getEmail(),
                            "name", user.getFirstName() + " " + user.getLastName()
                        ),
                        "type", mapParticipantRole(participant.getParticipantRole())
                    ));
                }
            }
        }
        eventData.put("attendees", attendees);
        
        // Meeting details
        boolean isVirtual = meeting.getMeetingLink() != null && !meeting.getMeetingLink().trim().isEmpty();
        eventData.put("isOnlineMeeting", isVirtual);
        if (isVirtual) {
            eventData.put("onlineMeetingProvider", "teamsForBusiness");
        }
        
        // Categories/Tags
        List<String> categories = new ArrayList<>();
        categories.add("Meeting Manager");
        if (meeting.getMeetingType() != null) {
            categories.add(meeting.getMeetingType().toString());
        }
        eventData.put("categories", categories);
        
        return eventData;
    }
    
    /**
     * Builds the event description with meeting details
     */
    private String buildEventDescription(Meeting meeting) {
        StringBuilder description = new StringBuilder();
        
        if (meeting.getDescription() != null && !meeting.getDescription().trim().isEmpty()) {
            description.append("<p>").append(meeting.getDescription()).append("</p>");
        }
        
        if (meeting.getAgenda() != null && !meeting.getAgenda().trim().isEmpty()) {
            description.append("<h3>Agenda:</h3>");
            description.append("<p>").append(meeting.getAgenda()).append("</p>");
        }
        
        description.append("<hr>");
        description.append("<p><small>Created with Meeting Manager</small></p>");
        
        return description.toString();
    }
    
    /**
     * Maps internal participant roles to Microsoft Graph attendee types
     */
    private String mapParticipantRole(MeetingParticipant.ParticipantRole role) {
        switch (role) {
            case ORGANIZER:
                return "required";
            case PRESENTER:
                return "required";
            case ATTENDEE:
                return "required";
            case OPTIONAL:
                return "optional";
            case OBSERVER:
                return "optional";
            default:
                return "required";
        }
    }
    
    public boolean isGraphApiEnabled() {
        return graphApiEnabled;
    }
}
