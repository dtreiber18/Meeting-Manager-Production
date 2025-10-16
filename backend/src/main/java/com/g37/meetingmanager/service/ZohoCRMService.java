package com.g37.meetingmanager.service;

import com.g37.meetingmanager.model.PendingAction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for integrating with Zoho CRM
 * Handles OAuth2 authentication and task/contact/deal management
 */
@Service
public class ZohoCRMService {

    private static final Logger logger = LoggerFactory.getLogger(ZohoCRMService.class);

    @Value("${zoho.crm.enabled:false}")
    private boolean zohoEnabled;

    @Value("${zoho.crm.api.url:https://www.zohoapis.com/crm/v3}")
    private String zohoApiUrl;

    @Value("${zoho.crm.client.id:}")
    private String clientId;

    @Value("${zoho.crm.client.secret:}")
    private String clientSecret;

    @Value("${zoho.crm.redirect.uri:}")
    private String redirectUri;

    @Value("${zoho.crm.refresh.token:}")
    private String refreshToken;

    private final RestTemplate restTemplate;
    private String accessToken;
    private long tokenExpiryTime = 0;

    public ZohoCRMService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Create a task in Zoho CRM from a PendingAction
     */
    public Map<String, Object> createTask(PendingAction action, String userAccessToken) {
        if (!zohoEnabled) {
            logger.warn("Zoho CRM integration is disabled");
            return Map.of("error", "Zoho CRM integration is disabled");
        }

        try {
            // Use user's access token if provided, otherwise use service token
            String token = userAccessToken != null ? userAccessToken : getAccessToken();

            String createTaskUrl = zohoApiUrl + "/Tasks";

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Build Zoho task data
            Map<String, Object> taskData = new HashMap<>();
            taskData.put("Subject", action.getTitle());
            taskData.put("Description", action.getDescription());
            taskData.put("Status", mapStatusToZoho(action.getStatus()));
            taskData.put("Priority", mapPriorityToZoho(action.getPriority()));

            if (action.getDueDate() != null) {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                taskData.put("Due_Date", action.getDueDate().format(formatter));
            }

            if (action.getAssigneeEmail() != null) {
                // TODO: Look up Zoho user by email
                taskData.put("Owner", Map.of("email", action.getAssigneeEmail()));
            }

            // Add custom fields for Meeting Manager integration
            taskData.put("Meeting_Manager_Action_Id", action.getId());
            if (action.getMeetingId() != null) {
                taskData.put("Meeting_Manager_Meeting_Id", action.getMeetingId());
            }

            Map<String, Object> requestBody = Map.of("data", new Object[]{taskData});

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                createTaskUrl,
                HttpMethod.POST,
                request,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.CREATED ||
                response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> responseBody = response.getBody();
                logger.info("Successfully created Zoho CRM task for action: {}", action.getId());
                return responseBody;
            } else {
                logger.error("Failed to create Zoho CRM task. Status: {}", response.getStatusCode());
                return Map.of("error", "Failed to create task");
            }

        } catch (HttpClientErrorException e) {
            logger.error("HTTP error creating Zoho CRM task: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            return Map.of("error", "HTTP error: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Error creating Zoho CRM task", e);
            return Map.of("error", e.getMessage());
        }
    }

    /**
     * Update contact in Zoho CRM with meeting notes
     */
    public Map<String, Object> updateContactWithMeetingNotes(
            String contactId,
            String meetingNotes,
            String userAccessToken) {
        if (!zohoEnabled) {
            logger.warn("Zoho CRM integration is disabled");
            return Map.of("error", "Zoho CRM integration is disabled");
        }

        try {
            String token = userAccessToken != null ? userAccessToken : getAccessToken();
            String updateContactUrl = zohoApiUrl + "/Contacts/" + contactId;

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> contactData = new HashMap<>();
            contactData.put("Description", meetingNotes);
            // Add custom field for last meeting notes
            contactData.put("Last_Meeting_Notes", meetingNotes);

            Map<String, Object> requestBody = Map.of("data", new Object[]{contactData});

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                updateContactUrl,
                HttpMethod.PUT,
                request,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                logger.info("Successfully updated Zoho CRM contact: {}", contactId);
                return response.getBody();
            } else {
                logger.error("Failed to update Zoho CRM contact. Status: {}", response.getStatusCode());
                return Map.of("error", "Failed to update contact");
            }

        } catch (Exception e) {
            logger.error("Error updating Zoho CRM contact", e);
            return Map.of("error", e.getMessage());
        }
    }

    /**
     * Get Zoho access token using refresh token
     */
    private String getAccessToken() throws Exception {
        // Check if token is still valid
        if (accessToken != null && System.currentTimeMillis() < tokenExpiryTime) {
            return accessToken;
        }

        // Refresh the access token
        String tokenUrl = "https://accounts.zoho.com/oauth/v2/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        String body = String.format(
            "refresh_token=%s&client_id=%s&client_secret=%s&grant_type=refresh_token",
            refreshToken, clientId, clientSecret
        );

        HttpEntity<String> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                tokenUrl,
                HttpMethod.POST,
                request,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> tokenData = response.getBody();
                this.accessToken = (String) tokenData.get("access_token");

                // Token expires in 1 hour, set expiry time
                int expiresIn = tokenData.containsKey("expires_in")
                    ? ((Number) tokenData.get("expires_in")).intValue()
                    : 3600;
                this.tokenExpiryTime = System.currentTimeMillis() + (expiresIn * 1000L);

                logger.info("Successfully refreshed Zoho access token");
                return this.accessToken;
            } else {
                throw new Exception("Failed to refresh Zoho access token");
            }
        } catch (Exception e) {
            logger.error("Error refreshing Zoho access token", e);
            throw new Exception("Failed to get Zoho access token: " + e.getMessage());
        }
    }

    /**
     * Map PendingAction status to Zoho task status
     */
    private String mapStatusToZoho(PendingAction.ActionStatus status) {
        if (status == null) return "Not Started";

        switch (status) {
            case NEW:
                return "Not Started";
            case ACTIVE:
                return "In Progress";
            case COMPLETE:
                return "Completed";
            case REJECTED:
                return "Deferred";
            default:
                return "Not Started";
        }
    }

    /**
     * Map PendingAction priority to Zoho task priority
     */
    private String mapPriorityToZoho(PendingAction.Priority priority) {
        if (priority == null) return "Normal";

        switch (priority) {
            case URGENT:
                return "Highest";
            case HIGH:
                return "High";
            case MEDIUM:
                return "Normal";
            case LOW:
                return "Low";
            default:
                return "Normal";
        }
    }

    /**
     * Get authorization URL for OAuth2 flow
     */
    public String getAuthorizationUrl(String state) {
        String authUrl = "https://accounts.zoho.com/oauth/v2/auth";
        return String.format(
            "%s?response_type=code&client_id=%s&scope=ZohoCRM.modules.ALL,ZohoCRM.settings.ALL&redirect_uri=%s&access_type=offline&state=%s",
            authUrl, clientId, redirectUri, state
        );
    }

    /**
     * Exchange authorization code for tokens
     */
    public Map<String, Object> exchangeCodeForTokens(String code) {
        String tokenUrl = "https://accounts.zoho.com/oauth/v2/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        String body = String.format(
            "code=%s&client_id=%s&client_secret=%s&redirect_uri=%s&grant_type=authorization_code",
            code, clientId, clientSecret, redirectUri
        );

        HttpEntity<String> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                tokenUrl,
                HttpMethod.POST,
                request,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                logger.info("Successfully exchanged code for Zoho tokens");
                return response.getBody();
            } else {
                logger.error("Failed to exchange code for tokens. Status: {}", response.getStatusCode());
                return Map.of("error", "Failed to exchange code");
            }
        } catch (Exception e) {
            logger.error("Error exchanging code for Zoho tokens", e);
            return Map.of("error", e.getMessage());
        }
    }

    public boolean isEnabled() {
        return zohoEnabled;
    }
}
