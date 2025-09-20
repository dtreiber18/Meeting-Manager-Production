package com.g37.meetingmanager.controller;

import com.g37.meetingmanager.model.User;
import com.g37.meetingmanager.repository.mysql.UserRepository;
import com.g37.meetingmanager.service.MicrosoftGraphOAuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/calendar-oauth")
@CrossOrigin(origins = "*")
public class CalendarOAuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(CalendarOAuthController.class);
    
    @Autowired
    private MicrosoftGraphOAuthService graphOAuthService;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Handle Microsoft Graph OAuth callback
     */
    @PostMapping("/oauth/callback")
    public ResponseEntity<Map<String, Object>> handleOAuthCallback(
            @RequestBody Map<String, String> request) {
        
        try {
            String code = request.get("code");
            String userEmail = request.get("userEmail"); // We'll need to pass this from frontend
            
            if (code == null || userEmail == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Missing authorization code or user email"));
            }
            
            // Exchange code for tokens
            Map<String, Object> tokenResponse = graphOAuthService.exchangeCodeForToken(code);
            
            if (tokenResponse == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to exchange authorization code for tokens"));
            }
            
            // Find the user and store the tokens
            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "User not found"));
            }
            
            User user = userOpt.get();
            user.setGraphAccessToken((String) tokenResponse.get("access_token"));
            user.setGraphRefreshToken((String) tokenResponse.get("refresh_token"));
            
            // Calculate token expiry
            Integer expiresIn = (Integer) tokenResponse.get("expires_in");
            if (expiresIn != null) {
                user.setGraphTokenExpiresAt(LocalDateTime.now().plusSeconds(expiresIn));
            }
            
            userRepository.save(user);
            
            logger.info("Successfully stored Microsoft Graph tokens for user: {}", userEmail);
            
            return ResponseEntity.ok(Map.of(
                "message", "Calendar integration enabled successfully",
                "userEmail", userEmail
            ));
            
        } catch (Exception e) {
            logger.error("Error handling OAuth callback", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error"));
        }
    }
    
    /**
     * Get the Microsoft Graph authorization URL
     */
    @GetMapping("/oauth/auth-url")
    public ResponseEntity<Map<String, String>> getAuthUrl() {
        try {
            String authUrl = graphOAuthService.getAuthorizationUrl();
            
            if (authUrl == null) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "Microsoft Graph API is not enabled"));
            }
            
            return ResponseEntity.ok(Map.of("authUrl", authUrl));
            
        } catch (Exception e) {
            logger.error("Error getting authorization URL", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to generate authorization URL"));
        }
    }
    
    /**
     * Check calendar integration status for a user
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getCalendarStatus(@RequestParam String userEmail) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "User not found"));
            }
            
            User user = userOpt.get();
            boolean isConnected = user.getGraphAccessToken() != null;
            boolean isExpired = false;
            
            if (isConnected && user.getGraphTokenExpiresAt() != null) {
                isExpired = LocalDateTime.now().isAfter(user.getGraphTokenExpiresAt());
            }
            
            Map<String, Object> status = new HashMap<>();
            status.put("isConnected", isConnected);
            status.put("isExpired", isExpired);
            status.put("userEmail", userEmail);
            
            if (user.getGraphTokenExpiresAt() != null) {
                status.put("expiresAt", user.getGraphTokenExpiresAt().toString());
            }
            
            return ResponseEntity.ok(status);
            
        } catch (Exception e) {
            logger.error("Error checking calendar status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to check calendar status"));
        }
    }
    
    /**
     * Disconnect calendar integration for a user
     */
    @DeleteMapping("/disconnect")
    public ResponseEntity<Map<String, String>> disconnectCalendar(@RequestParam String userEmail) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "User not found"));
            }
            
            User user = userOpt.get();
            user.setGraphAccessToken(null);
            user.setGraphRefreshToken(null);
            user.setGraphTokenExpiresAt(null);
            
            userRepository.save(user);
            
            logger.info("Disconnected calendar integration for user: {}", userEmail);
            
            return ResponseEntity.ok(Map.of(
                "message", "Calendar integration disconnected successfully",
                "userEmail", userEmail
            ));
            
        } catch (Exception e) {
            logger.error("Error disconnecting calendar", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to disconnect calendar"));
        }
    }
}
