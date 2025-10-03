package com.g37.meetingmanager.controller;

import com.g37.meetingmanager.model.User;
import com.g37.meetingmanager.model.UserProfile;
import com.g37.meetingmanager.model.Role;
import com.g37.meetingmanager.service.AuthService;
import com.g37.meetingmanager.repository.mysql.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import jakarta.annotation.PostConstruct;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    private final AuthService authService;
    private final UserRepository userRepository;

    public UserController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }
    
    @PostConstruct
    public void init() {
        log.info("✅ UserController initialized - MySQL-only mode (MongoDB disabled for production)");
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfile> getUserProfile(
            @RequestParam(required = false) String email,
            Authentication authentication) {
        try {
            log.info("🔍 Profile request - email: {}, auth: {}", email, 
                authentication != null ? authentication.getName() : "null");
            
            String userEmail = email;
            if (userEmail == null && authentication != null) {
                userEmail = authentication.getName();
            }
            
            if (userEmail == null) {
                log.warn("❌ No email provided - returning 400");
                return ResponseEntity.badRequest().build();
            }

            // Get core user data from MySQL
            User mysqlUser = authService.findUserByEmail(userEmail);
            
            if (mysqlUser == null) {
                log.warn("❌ User not found in MySQL: {}", userEmail);
                return ResponseEntity.notFound().build();
            }
            
            log.info("✅ Found MySQL user: {}", userEmail);
            
            // Create response with MySQL data (production mode)
            UserProfile profile = createUserProfileFromMysqlUser(mysqlUser);
            
            return ResponseEntity.ok(profile);

        } catch (Exception e) {
            log.error("❌ Error getting profile: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateUserProfile(
            @RequestBody Map<String, Object> updates,
            Authentication authentication) {
        try {
            String email = (String) updates.get("email");
            if (email == null && authentication != null) {
                email = authentication.getName();
            }
            
            if (email == null) {
                return ResponseEntity.badRequest().build();
            }

            log.info("✅ Profile UPDATE for MySQL user: {}", email);

            // Get the user from MySQL (primary source)
            User mysqlUser = authService.findUserByEmail(email);
            if (mysqlUser == null) {
                log.warn("❌ User not found in MySQL: {}", email);
                return ResponseEntity.notFound().build();
            }

            // Update the user fields
            if (updates.containsKey("firstName")) {
                mysqlUser.setFirstName((String) updates.get("firstName"));
            }
            if (updates.containsKey("lastName")) {
                mysqlUser.setLastName((String) updates.get("lastName"));
            }
            if (updates.containsKey("phoneNumber")) {
                mysqlUser.setPhoneNumber((String) updates.get("phoneNumber"));
            }
            if (updates.containsKey("jobTitle")) {
                mysqlUser.setJobTitle((String) updates.get("jobTitle"));
            }
            if (updates.containsKey("department")) {
                mysqlUser.setDepartment((String) updates.get("department"));
            }
            if (updates.containsKey("bio")) {
                mysqlUser.setBio((String) updates.get("bio"));
            }

            // Save the updated user to the database
            User savedUser = userRepository.save(mysqlUser);

            log.info("✅ Profile saved successfully for MySQL user: {}", email);
            UserProfile updatedProfile = createUserProfileFromMysqlUser(savedUser);
            return ResponseEntity.ok(Map.of(
                "profile", updatedProfile,
                "mode", "production",
                "message", "Profile updated successfully"
            ));

        } catch (Exception e) {
            log.error("❌ Error updating profile: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private UserProfile createUserProfileFromMysqlUser(User mysqlUser) {
        UserProfile profile = new UserProfile();
        profile.setEmail(mysqlUser.getEmail());
        profile.setFirstName(mysqlUser.getFirstName());
        profile.setLastName(mysqlUser.getLastName());
        profile.setPhoneNumber(mysqlUser.getPhoneNumber());
        profile.setJobTitle(mysqlUser.getJobTitle());
        profile.setDepartment(mysqlUser.getDepartment());
        profile.setBio(mysqlUser.getBio());
        profile.setIsActive(mysqlUser.getIsActive());
        profile.setEmailNotifications(mysqlUser.getEmailNotifications());
        profile.setPushNotifications(mysqlUser.getPushNotifications());
        profile.setTimezone(mysqlUser.getTimezone() != null ? mysqlUser.getTimezone() : "UTC");
        profile.setLanguage(mysqlUser.getLanguage() != null ? mysqlUser.getLanguage() : "en");
        profile.setTheme(mysqlUser.getTheme() != null ? mysqlUser.getTheme() : "light");
        profile.setDateFormat(mysqlUser.getDateFormat() != null ? mysqlUser.getDateFormat() : "MM/dd/yyyy");
        profile.setTimeFormat(mysqlUser.getTimeFormat() != null ? mysqlUser.getTimeFormat() : "12h");
        profile.setAzureAdObjectId(mysqlUser.getAzureAdObjectId());
        profile.setMysqlUserId(mysqlUser.getId());
        
        // Set organization info if available
        if (mysqlUser.getOrganization() != null) {
            profile.setOrganizationId(mysqlUser.getOrganization().getId());
            profile.setOrganizationName(mysqlUser.getOrganization().getName());
        }
        
        // Convert roles to string list
        if (mysqlUser.getRoles() != null && !mysqlUser.getRoles().isEmpty()) {
            profile.setRoles(mysqlUser.getRoles().stream()
                .map(Role::getName)
                .toList());
        } else {
            profile.setRoles(Arrays.asList("USER"));
        }
        
        // Set production defaults for extended profile features
        profile.setProfileVisibility("private");
        profile.setShowOnlineStatus(false);
        profile.setAllowDirectMessages(true);
        profile.setSmsNotifications(false);
        profile.setMeetingReminders(true);
        profile.setActionItemReminders(true);
        profile.setWeeklyDigest(false);
        profile.setDarkMode(false);
        profile.setCompactView(false);
        
        return profile;
    }
}
