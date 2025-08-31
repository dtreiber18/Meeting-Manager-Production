package com.g37.meetingmanager.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class MicrosoftGraphOAuthService {
    
    private static final Logger logger = LoggerFactory.getLogger(MicrosoftGraphOAuthService.class);
    
    @Value("${app.microsoft.graph.enabled:false}")
    private boolean graphApiEnabled;
    
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
    
    public MicrosoftGraphOAuthService() {
        this.restTemplate = new RestTemplate();
    }
    
    /**
     * Generates the Microsoft Graph authorization URL for calendar access
     */
    public String getAuthorizationUrl() {
        if (!graphApiEnabled) {
            logger.warn("Microsoft Graph API is disabled");
            return null;
        }
        
        String scope = "https://graph.microsoft.com/Calendars.ReadWrite https://graph.microsoft.com/User.Read";
        String state = generateState(); // Add state for security
        
        String authUrl = loginBaseUrl + "/" + tenantId + "/oauth2/v2.0/authorize" +
            "?client_id=" + clientId +
            "&response_type=code" +
            "&redirect_uri=" + redirectUri +
            "&scope=" + scope +
            "&response_mode=query" +
            "&state=" + state;
        
        logger.info("Generated Microsoft Graph authorization URL");
        return authUrl;
    }
    
    /**
     * Exchanges authorization code for access token
     */
    public Map<String, Object> exchangeCodeForToken(String authorizationCode) {
        if (!graphApiEnabled) {
            logger.warn("Microsoft Graph API is disabled");
            return null;
        }
        
        try {
            String tokenUrl = loginBaseUrl + "/" + tenantId + "/oauth2/v2.0/token";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("client_id", clientId);
            body.add("client_secret", clientSecret);
            body.add("code", authorizationCode);
            body.add("grant_type", "authorization_code");
            body.add("redirect_uri", redirectUri);
            body.add("scope", "https://graph.microsoft.com/Calendars.ReadWrite https://graph.microsoft.com/User.Read");
            
            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                tokenUrl, 
                HttpMethod.POST, 
                request, 
                Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> tokenResponse = response.getBody();
                logger.info("Successfully exchanged authorization code for access token");
                return tokenResponse;
            } else {
                logger.error("Failed to exchange authorization code. Status: {}", response.getStatusCode());
                return null;
            }
            
        } catch (Exception e) {
            logger.error("Error exchanging authorization code for token", e);
            return null;
        }
    }
    
    /**
     * Refreshes an expired access token
     */
    public Map<String, Object> refreshToken(String refreshToken) {
        if (!graphApiEnabled) {
            return null;
        }
        
        try {
            String tokenUrl = loginBaseUrl + "/" + tenantId + "/oauth2/v2.0/token";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("client_id", clientId);
            body.add("client_secret", clientSecret);
            body.add("refresh_token", refreshToken);
            body.add("grant_type", "refresh_token");
            body.add("scope", "https://graph.microsoft.com/Calendars.ReadWrite https://graph.microsoft.com/User.Read");
            
            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                tokenUrl, 
                HttpMethod.POST, 
                request, 
                Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK) {
                logger.info("Successfully refreshed access token");
                return response.getBody();
            } else {
                logger.error("Failed to refresh token. Status: {}", response.getStatusCode());
                return null;
            }
            
        } catch (Exception e) {
            logger.error("Error refreshing access token", e);
            return null;
        }
    }
    
    /**
     * Gets user information from Microsoft Graph
     */
    public Map<String, Object> getUserInfo(String accessToken) {
        if (!graphApiEnabled || accessToken == null) {
            return null;
        }
        
        try {
            String userInfoUrl = "https://graph.microsoft.com/v1.0/me";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            
            HttpEntity<Void> request = new HttpEntity<>(headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                userInfoUrl, 
                HttpMethod.GET, 
                request, 
                Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK) {
                logger.info("Successfully retrieved user information");
                return response.getBody();
            } else {
                logger.error("Failed to get user info. Status: {}", response.getStatusCode());
                return null;
            }
            
        } catch (Exception e) {
            logger.error("Error getting user information", e);
            return null;
        }
    }
    
    /**
     * Validates if the access token is still valid
     */
    public boolean validateAccessToken(String accessToken) {
        Map<String, Object> userInfo = getUserInfo(accessToken);
        return userInfo != null;
    }
    
    private String generateState() {
        // Generate a random state parameter for OAuth security
        return java.util.UUID.randomUUID().toString();
    }
    
    public boolean isGraphApiEnabled() {
        return graphApiEnabled;
    }
}
