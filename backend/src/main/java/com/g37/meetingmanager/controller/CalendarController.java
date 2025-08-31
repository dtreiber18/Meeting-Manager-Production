package com.g37.meetingmanager.controller;

import com.g37.meetingmanager.model.User;
import com.g37.meetingmanager.service.AuthService;
import com.g37.meetingmanager.service.MicrosoftGraphOAuthService;
import com.g37.meetingmanager.repository.mysql.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/calendar")
@CrossOrigin(origins = "*")
public class CalendarController {

    private static final Logger log = LoggerFactory.getLogger(CalendarController.class);

    private final AuthService authService;
    private final MicrosoftGraphOAuthService microsoftGraphOAuthService;
    private final UserRepository userRepository;

    @Autowired
    public CalendarController(AuthService authService, 
                             MicrosoftGraphOAuthService microsoftGraphOAuthService,
                             UserRepository userRepository) {
        this.authService = authService;
        this.microsoftGraphOAuthService = microsoftGraphOAuthService;
        this.userRepository = userRepository;
    }

    /**
     * Get calendar integration status for the current user
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getCalendarStatus(
            @RequestParam(required = false) String userEmail,
            Authentication authentication) {
        try {
            log.info("Calendar status requested for email: {}", userEmail);
            
            String email = userEmail;
            if (email == null && authentication != null) {
                email = authentication.getName();
            }
            
            if (email == null) {
                log.warn("No email provided in calendar status request");
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email parameter is required"));
            }

            User user = authService.findUserByEmail(email);

            Map<String, Object> response = new HashMap<>();
            
            if (user == null) {
                log.warn("User not found for email: {}", email);
                response.put("isConnected", false);
                response.put("isExpired", false);
                response.put("userEmail", email);
                response.put("error", "User not found");
                return ResponseEntity.ok(response);
            }

            boolean isConnected = user.getGraphAccessToken() != null && !user.getGraphAccessToken().isEmpty();
            boolean isExpired = false;
            
            if (isConnected && user.getGraphTokenExpiresAt() != null) {
                isExpired = user.getGraphTokenExpiresAt().isBefore(LocalDateTime.now());
                log.debug("Token expires at: {}, Current time: {}, Is expired: {}", 
                    user.getGraphTokenExpiresAt(), LocalDateTime.now(), isExpired);
            }

            response.put("isConnected", isConnected);
            response.put("isExpired", isExpired);
            response.put("userEmail", email);
            
            if (user.getGraphTokenExpiresAt() != null) {
                response.put("expiresAt", user.getGraphTokenExpiresAt().toString());
            }

            log.info("Calendar status for {}: connected={}, expired={}", email, isConnected, isExpired);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error getting calendar status: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Get Microsoft Graph authorization URL
     */
    @GetMapping("/oauth/auth-url")
    public ResponseEntity<Map<String, String>> getAuthUrl() {
        try {
            String authUrl = microsoftGraphOAuthService.getAuthorizationUrl();
            log.info("Generated Microsoft Graph authorization URL");
            
            Map<String, String> response = new HashMap<>();
            response.put("authUrl", authUrl);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error generating authorization URL: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to generate authorization URL"));
        }
    }

    /**
     * Handle OAuth callback with authorization code
     */
    @PostMapping("/oauth/callback")
    public ResponseEntity<Map<String, Object>> handleOAuthCallback(@RequestBody Map<String, String> request) {
        try {
            String code = request.get("code");
            String userEmail = request.get("userEmail");
            
            log.info("Processing OAuth callback for user: {}", userEmail);
            
            if (code == null || userEmail == null) {
                log.warn("Missing required parameters in OAuth callback");
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Missing authorization code or user email"));
            }

            User user = authService.findUserByEmail(userEmail);
                
            if (user == null) {
                log.warn("User not found for OAuth callback: {}", userEmail);
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "User not found"));
            }

            // Exchange code for tokens
            Map<String, Object> tokenResponse = microsoftGraphOAuthService.exchangeCodeForToken(code);
            if (tokenResponse == null) {
                log.error("Failed to exchange authorization code for tokens");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to exchange authorization code"));
            }
            
            // Store tokens in user record
            user.setGraphAccessToken((String) tokenResponse.get("access_token"));
            user.setGraphRefreshToken((String) tokenResponse.get("refresh_token"));
            
            // Calculate expiration time (tokens typically expire in 1 hour)
            Object expiresInObj = tokenResponse.get("expires_in");
            if (expiresInObj != null) {
                long expirationSeconds = Long.parseLong(expiresInObj.toString());
                user.setGraphTokenExpiresAt(LocalDateTime.now().plusSeconds(expirationSeconds));
            }
            
            userRepository.save(user);
            
            log.info("Successfully stored Graph tokens for user: {}", userEmail);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Calendar integration successful");
            response.put("isConnected", true);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error processing OAuth callback: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to process OAuth callback: " + e.getMessage()));
        }
    }

    /**
     * Disconnect calendar integration
     */
    @DeleteMapping("/disconnect")
    public ResponseEntity<Map<String, Object>> disconnectCalendar(
            @RequestParam String userEmail) {
        try {
            log.info("Disconnecting calendar for user: {}", userEmail);
            
            User user = authService.findUserByEmail(userEmail);
                
            if (user == null) {
                log.warn("User not found for calendar disconnect: {}", userEmail);
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "User not found"));
            }

            // Clear Graph tokens
            user.setGraphAccessToken(null);
            user.setGraphRefreshToken(null);
            user.setGraphTokenExpiresAt(null);
            
            userRepository.save(user);
            
            log.info("Successfully disconnected calendar for user: {}", userEmail);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Calendar disconnected successfully");
            response.put("isConnected", false);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error disconnecting calendar: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to disconnect calendar: " + e.getMessage()));
        }
    }
}
