package com.g37.meetingmanager.controller;

import com.g37.meetingmanager.model.User;
import com.g37.meetingmanager.service.AuthService;
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
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    private final AuthService authService;
    private final UserRepository userRepository;

    @Autowired
    public UserController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    /**
     * Get current user profile
     */
    @GetMapping("/profile")
    public ResponseEntity<User> getUserProfile(
            @RequestParam(required = false) String email,
            Authentication authentication) {
        try {
            String userEmail = email;
            if (userEmail == null && authentication != null) {
                userEmail = authentication.getName();
            }
            
            if (userEmail == null) {
                log.warn("No email provided in profile request");
                return ResponseEntity.badRequest().build();
            }

            User user = authService.findUserByEmail(userEmail);
            
            if (user == null) {
                log.warn("User not found for email: {}", userEmail);
                return ResponseEntity.notFound().build();
            }

            log.info("Retrieved profile for user: {}", userEmail);
            return ResponseEntity.ok(user);

        } catch (Exception e) {
            log.error("Error getting user profile: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update user profile
     */
    @PutMapping("/profile")
    public ResponseEntity<User> updateUserProfile(
            @RequestBody Map<String, Object> updates,
            Authentication authentication) {
        try {
            String email = (String) updates.get("email");
            if (email == null && authentication != null) {
                email = authentication.getName();
            }
            
            if (email == null) {
                log.warn("No email provided in profile update request");
                return ResponseEntity.badRequest().build();
            }

            User user = authService.findUserByEmail(email);
            
            if (user == null) {
                log.warn("User not found for email: {}", email);
                return ResponseEntity.notFound().build();
            }

            // Update user fields
            updateUserFields(user, updates);
            user.setUpdatedAt(LocalDateTime.now());
            
            User savedUser = userRepository.save(user);
            
            log.info("Updated profile for user: {}", email);
            return ResponseEntity.ok(savedUser);

        } catch (Exception e) {
            log.error("Error updating user profile: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update user timezone
     */
    @PutMapping("/timezone")
    public ResponseEntity<Map<String, Object>> updateTimezone(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            String email = request.get("email");
            String timezone = request.get("timezone");
            
            if (email == null && authentication != null) {
                email = authentication.getName();
            }
            
            if (email == null || timezone == null) {
                log.warn("Missing email or timezone in timezone update request");
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Email and timezone are required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            User user = authService.findUserByEmail(email);
            
            if (user == null) {
                log.warn("User not found for email: {}", email);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "User not found");
                return ResponseEntity.notFound().build();
            }

            user.setTimezone(timezone);
            user.setUpdatedAt(LocalDateTime.now());
            
            userRepository.save(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Timezone updated successfully");
            response.put("timezone", timezone);
            
            log.info("Updated timezone for user {}: {}", email, timezone);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error updating timezone: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Update user language
     */
    @PutMapping("/language")
    public ResponseEntity<Map<String, Object>> updateLanguage(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            String email = request.get("email");
            String language = request.get("language");
            
            if (email == null && authentication != null) {
                email = authentication.getName();
            }
            
            if (email == null || language == null) {
                log.warn("Missing email or language in language update request");
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Email and language are required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            User user = authService.findUserByEmail(email);
            
            if (user == null) {
                log.warn("User not found for email: {}", email);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "User not found");
                return ResponseEntity.notFound().build();
            }

            user.setLanguage(language);
            user.setUpdatedAt(LocalDateTime.now());
            
            userRepository.save(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Language updated successfully");
            response.put("language", language);
            
            log.info("Updated language for user {}: {}", email, language);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error updating language: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    private void updateUserFields(User user, Map<String, Object> updates) {
        if (updates.containsKey("firstName")) {
            user.setFirstName((String) updates.get("firstName"));
        }
        if (updates.containsKey("lastName")) {
            user.setLastName((String) updates.get("lastName"));
        }
        if (updates.containsKey("phoneNumber")) {
            user.setPhoneNumber((String) updates.get("phoneNumber"));
        }
        if (updates.containsKey("jobTitle")) {
            user.setJobTitle((String) updates.get("jobTitle"));
        }
        if (updates.containsKey("department")) {
            user.setDepartment((String) updates.get("department"));
        }
        if (updates.containsKey("bio")) {
            user.setBio((String) updates.get("bio"));
        }
        if (updates.containsKey("language")) {
            user.setLanguage((String) updates.get("language"));
        }
        if (updates.containsKey("timezone")) {
            user.setTimezone((String) updates.get("timezone"));
        }
        if (updates.containsKey("theme")) {
            user.setTheme((String) updates.get("theme"));
        }
        if (updates.containsKey("dateFormat")) {
            user.setDateFormat((String) updates.get("dateFormat"));
        }
        if (updates.containsKey("timeFormat")) {
            user.setTimeFormat((String) updates.get("timeFormat"));
        }
        if (updates.containsKey("emailNotifications")) {
            user.setEmailNotifications((Boolean) updates.get("emailNotifications"));
        }
        if (updates.containsKey("pushNotifications")) {
            user.setPushNotifications((Boolean) updates.get("pushNotifications"));
        }
    }
}
