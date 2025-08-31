package com.g37.meetingmanager.service;

import com.g37.meetingmanager.model.Meeting;
import com.g37.meetingmanager.model.MeetingParticipant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class CalendarIntegrationService {
    
    private static final Logger logger = LoggerFactory.getLogger(CalendarIntegrationService.class);
    
    @Value("${app.microsoft.graph.enabled:false}")
    private boolean graphApiEnabled;
    
    @Value("${app.microsoft.graph.base-url:https://graph.microsoft.com/v1.0}")
    private String graphBaseUrl;
    
    @Value("${app.microsoft.graph.client-id:}")
    private String clientId;
    
    @Value("${app.microsoft.graph.client-secret:}")
    private String clientSecret;
    
    @Value("${app.microsoft.graph.tenant-id:common}")
    private String tenantId;
    
    @Value("${app.microsoft.graph.redirect-uri:http://localhost:4201/auth/callback}")
    private String redirectUri;
    
    @Value("${app.microsoft.graph.login-base-url:https://login.microsoftonline.com}")
    private String loginBaseUrl;
    
    private final RestTemplate restTemplate;
    
    public CalendarIntegrationService() {
        this.restTemplate = new RestTemplate();
    }
    
    /**
     * Creates a calendar event in Microsoft Outlook for the meeting
     */
    public boolean createOutlookCalendarEvent(Meeting meeting, String accessToken) {
        if (!graphApiEnabled) {
            logger.info("Microsoft Graph API is disabled. Meeting created locally only.");
            return false;
        }
        
        if (accessToken == null || accessToken.trim().isEmpty()) {
            logger.warn("No access token provided for Outlook calendar integration");
            return false;
        }
        
        try {
            Map<String, Object> eventData = buildEventData(meeting);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(eventData, headers);
            
            String createEventUrl = graphBaseUrl + "/me/events";
            
            ResponseEntity<Map> response = restTemplate.postForEntity(createEventUrl, request, Map.class);
            
            if (response.getStatusCode() == HttpStatus.CREATED) {
                logger.info("Successfully created Outlook calendar event for meeting: {}", meeting.getTitle());
                return true;
            } else {
                logger.warn("Unexpected response status when creating Outlook event: {}", response.getStatusCode());
                return false;
            }
            
        } catch (HttpClientErrorException e) {
            logger.error("HTTP error creating Outlook calendar event: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            return false;
        } catch (Exception e) {
            logger.error("Error creating Outlook calendar event for meeting: {}", meeting.getTitle(), e);
            return false;
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
            "contentType", "Text",
            "content", meeting.getDescription() != null ? meeting.getDescription() : ""
        ));
        
        // Event timing
        Map<String, Object> start = new HashMap<>();
        start.put("dateTime", formatDateTime(meeting.getStartTime()));
        start.put("timeZone", "UTC");
        eventData.put("start", start);
        
        Map<String, Object> end = new HashMap<>();
        end.put("dateTime", formatDateTime(meeting.getEndTime()));
        end.put("timeZone", "UTC");
        eventData.put("end", end);
        
        // Meeting type and properties
        eventData.put("isOnlineMeeting", true);
        eventData.put("onlineMeetingProvider", "teamsForBusiness");
        
        // Add attendees if participants exist
        if (meeting.getParticipants() != null && !meeting.getParticipants().isEmpty()) {
            List<Map<String, Object>> attendees = new ArrayList<>();
            for (MeetingParticipant participant : meeting.getParticipants()) {
                Map<String, Object> attendee = new HashMap<>();
                attendee.put("emailAddress", Map.of(
                    "address", participant.getUser().getEmail(),
                    "name", participant.getUser().getFirstName() + " " + participant.getUser().getLastName()
                ));
                attendee.put("type", "required");
                attendees.add(attendee);
            }
            eventData.put("attendees", attendees);
        }
        
        // Additional properties
        eventData.put("importance", "normal");
        eventData.put("sensitivity", "normal");
        eventData.put("showAs", "busy");
        
        // Add location if available
        if (meeting.getLocation() != null && !meeting.getLocation().trim().isEmpty()) {
            eventData.put("location", Map.of("displayName", meeting.getLocation()));
        }
        
        // Categories for meeting type
        List<String> categories = new ArrayList<>();
        if (meeting.getMeetingType() != null) {
            categories.add(meeting.getMeetingType().toString().replace("_", " "));
        }
        categories.add("Meeting Manager");
        eventData.put("categories", categories);
        
        return eventData;
    }
    
    /**
     * Formats date/time for Microsoft Graph API
     */
    private String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.atZone(ZoneId.of("UTC"))
            .format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }
    
    /**
     * Updates an existing Outlook calendar event
     */
    public boolean updateOutlookCalendarEvent(Meeting meeting, String eventId, String accessToken) {
        if (!graphApiEnabled || accessToken == null) {
            return false;
        }
        
        try {
            Map<String, Object> eventData = buildEventData(meeting);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(eventData, headers);
            
            String updateEventUrl = graphBaseUrl + "/me/events/" + eventId;
            
            restTemplate.exchange(updateEventUrl, HttpMethod.PATCH, request, Map.class);
            
            logger.info("Successfully updated Outlook calendar event for meeting: {}", meeting.getTitle());
            return true;
            
        } catch (Exception e) {
            logger.error("Error updating Outlook calendar event for meeting: {}", meeting.getTitle(), e);
            return false;
        }
    }
    
    /**
     * Deletes an Outlook calendar event
     */
    public boolean deleteOutlookCalendarEvent(String eventId, String accessToken) {
        if (!graphApiEnabled || accessToken == null) {
            return false;
        }
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            
            HttpEntity<Void> request = new HttpEntity<>(headers);
            
            String deleteEventUrl = graphBaseUrl + "/me/events/" + eventId;
            
            restTemplate.exchange(deleteEventUrl, HttpMethod.DELETE, request, Void.class);
            
            logger.info("Successfully deleted Outlook calendar event: {}", eventId);
            return true;
            
        } catch (Exception e) {
            logger.error("Error deleting Outlook calendar event: {}", eventId, e);
            return false;
        }
    }
    
    /**
     * Gets the Microsoft Graph API authentication URL for calendar access
     */
    public String getAuthUrl() {
        String scope = "https://graph.microsoft.com/Calendars.ReadWrite https://graph.microsoft.com/User.Read";
        String authUrl = loginBaseUrl + "/" + tenantId + "/oauth2/v2.0/authorize" +
            "?client_id=" + clientId +
            "&response_type=code" +
            "&redirect_uri=" + redirectUri +
            "&scope=" + scope +
            "&response_mode=query";
        
        return authUrl;
    }
}
