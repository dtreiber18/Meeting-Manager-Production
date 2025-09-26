package com.g37.meetingmanager.controller;

import com.g37.meetingmanager.model.User;
import com.g37.meetingmanager.model.UserProfile;
import com.g37.meetingmanager.service.AuthService;
import com.g37.meetingmanager.repository.mongodb.UserProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    private final AuthService authService;
    private final UserProfileRepository userProfileRepository;

    public UserController(AuthService authService, @Autowired(required = false) UserProfileRepository userProfileRepository) {
        this.authService = authService;
        this.userProfileRepository = userProfileRepository;
        
        if (userProfileRepository != null) {
            log.info("✅ UserController initialized - MONGODB INTEGRATION CONFIRMED");
        } else {
            log.warn("⚠️ UserController initialized WITHOUT MongoDB - Fallback mode");
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(
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

            // Check if MongoDB is available
            if (userProfileRepository == null) {
                log.warn("⚠️ MongoDB unavailable - returning fallback user profile for: {}", userEmail);
                
                // Try to get user data from MySQL
                User mysqlUser = authService.findUserByEmail(userEmail);
                
                UserProfile fallbackProfile = new UserProfile();
                if (mysqlUser != null) {
                    fallbackProfile.setEmail(mysqlUser.getEmail());
                    fallbackProfile.setFirstName(mysqlUser.getFirstName());
                    fallbackProfile.setLastName(mysqlUser.getLastName());
                } else {
                    fallbackProfile.setEmail(userEmail);
                    fallbackProfile.setFirstName("User");
                    fallbackProfile.setLastName("Profile");
                }
                
                // Set safe defaults
                fallbackProfile.setIsActive(true);
                fallbackProfile.setEmailNotifications(true);
                fallbackProfile.setPushNotifications(false);
                fallbackProfile.setTimezone("UTC");
                fallbackProfile.setLanguage("en");
                fallbackProfile.setTheme("light");
                fallbackProfile.setRoles(Arrays.asList("USER"));
                
                return ResponseEntity.ok(Map.of(
                    "profile", fallbackProfile,
                    "fallback", true,
                    "message", "Profile service temporarily unavailable - showing basic profile"
                ));
            }

            // MongoDB is available - normal operation
            log.info("✅ MONGODB Profile request - MONGODB INTEGRATION ACTIVE");
            
            // First try to find existing MongoDB UserProfile
            Optional<UserProfile> existingProfile = userProfileRepository.findByEmail(userEmail);
            
            if (existingProfile.isPresent()) {
                log.info("✅ Found MongoDB profile: {} - MONGODB INTEGRATION ACTIVE", userEmail);
                return ResponseEntity.ok(existingProfile.get());
            }
            
            // If not found in MongoDB, check MySQL user and create MongoDB profile
            User mysqlUser = authService.findUserByEmail(userEmail);
            
            if (mysqlUser != null) {
                log.info("✅ Found MySQL user, creating MongoDB profile: {}", userEmail);
                UserProfile newProfile = createUserProfileFromMysqlUser(mysqlUser);
                UserProfile savedProfile = userProfileRepository.save(newProfile);
                
                log.info("✅ Created new MongoDB profile: {} - MONGODB INTEGRATION ACTIVE", userEmail);
                return ResponseEntity.ok(savedProfile);
            }
            
            // Create a minimal profile for the user if not found anywhere
            log.warn("❌ User not found in MySQL or MongoDB: {} - creating minimal profile", userEmail);
            UserProfile minimalProfile = new UserProfile();
            minimalProfile.setEmail(userEmail);
            minimalProfile.setFirstName("User");
            minimalProfile.setLastName("Profile");
            minimalProfile.setIsActive(true);
            minimalProfile.setEmailNotifications(true);
            minimalProfile.setPushNotifications(true);
            minimalProfile.setTimezone("UTC");
            minimalProfile.setLanguage("en");
            minimalProfile.setTheme("light");
            minimalProfile.setRoles(Arrays.asList("USER"));
            
            UserProfile savedMinimalProfile = userProfileRepository.save(minimalProfile);
            log.info("✅ Created minimal MongoDB profile: {} - MONGODB INTEGRATION ACTIVE", userEmail);
            return ResponseEntity.ok(savedMinimalProfile);

        } catch (Exception e) {
            log.error("❌ Error getting profile: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateUserProfile(
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

            // Check if MongoDB is available
            if (userProfileRepository == null) {
                log.warn("⚠️ MongoDB unavailable - profile update not saved for: {}", email);
                
                return ResponseEntity.ok(Map.of(
                    "success", false,
                    "fallback", true,
                    "message", "Profile updates cannot be saved - service temporarily unavailable",
                    "received", updates
                ));
            }

            log.info("✅ MONGODB Profile UPDATE - DATABASE WRITE OPERATION");

            // Find or create MongoDB profile
            Optional<UserProfile> profileOpt = userProfileRepository.findByEmail(email);
            UserProfile profile;
            
            if (profileOpt.isPresent()) {
                profile = profileOpt.get();
                log.info("✅ Found existing MongoDB profile for update: {}", email);
            } else {
                // Create new profile if doesn't exist
                profile = new UserProfile();
                profile.setEmail(email);
                profile.setFirstName("User");
                profile.setLastName("Profile");
                profile.setIsActive(true);
                profile.setRoles(Arrays.asList("USER"));
                log.info("✅ Creating new MongoDB profile for update: {}", email);
            }

            updateUserProfileFields(profile, updates);
            profile.updateProfileTimestamp();
            UserProfile savedProfile = userProfileRepository.save(profile);
            
            log.info("✅ Profile updated - SAVED TO MONGODB: {}", email);
            return ResponseEntity.ok(savedProfile);

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
                .map(role -> role.getName())
                .toList());
        } else {
            profile.setRoles(Arrays.asList("USER"));
        }
        
        return profile;
    }
    
    private void updateUserProfileFields(UserProfile profile, Map<String, Object> updates) {
        log.info("✅ Updating {} fields - MONGODB OPERATION", updates.size());
        
        if (updates.containsKey("firstName")) {
            profile.setFirstName((String) updates.get("firstName"));
        }
        if (updates.containsKey("lastName")) {
            profile.setLastName((String) updates.get("lastName"));
        }
        if (updates.containsKey("phoneNumber")) {
            profile.setPhoneNumber((String) updates.get("phoneNumber"));
        }
        if (updates.containsKey("jobTitle")) {
            profile.setJobTitle((String) updates.get("jobTitle"));
        }
        if (updates.containsKey("department")) {
            profile.setDepartment((String) updates.get("department"));
        }
        if (updates.containsKey("bio")) {
            profile.setBio((String) updates.get("bio"));
        }
        if (updates.containsKey("language")) {
            profile.setLanguage((String) updates.get("language"));
        }
        if (updates.containsKey("timezone")) {
            profile.setTimezone((String) updates.get("timezone"));
        }
        if (updates.containsKey("theme")) {
            profile.setTheme((String) updates.get("theme"));
        }
        if (updates.containsKey("dateFormat")) {
            profile.setDateFormat((String) updates.get("dateFormat"));
        }
        if (updates.containsKey("timeFormat")) {
            profile.setTimeFormat((String) updates.get("timeFormat"));
        }
        if (updates.containsKey("emailNotifications")) {
            profile.setEmailNotifications((Boolean) updates.get("emailNotifications"));
        }
        if (updates.containsKey("pushNotifications")) {
            profile.setPushNotifications((Boolean) updates.get("pushNotifications"));
        }
        if (updates.containsKey("smsNotifications")) {
            profile.setSmsNotifications((Boolean) updates.get("smsNotifications"));
        }
        if (updates.containsKey("meetingReminders")) {
            profile.setMeetingReminders((Boolean) updates.get("meetingReminders"));
        }
        if (updates.containsKey("actionItemReminders")) {
            profile.setActionItemReminders((Boolean) updates.get("actionItemReminders"));
        }
        if (updates.containsKey("weeklyDigest")) {
            profile.setWeeklyDigest((Boolean) updates.get("weeklyDigest"));
        }
        if (updates.containsKey("darkMode")) {
            profile.setDarkMode((Boolean) updates.get("darkMode"));
        }
        if (updates.containsKey("compactView")) {
            profile.setCompactView((Boolean) updates.get("compactView"));
        }
        if (updates.containsKey("profileVisibility")) {
            profile.setProfileVisibility((String) updates.get("profileVisibility"));
        }
        if (updates.containsKey("showOnlineStatus")) {
            profile.setShowOnlineStatus((Boolean) updates.get("showOnlineStatus"));
        }
        if (updates.containsKey("allowDirectMessages")) {
            profile.setAllowDirectMessages((Boolean) updates.get("allowDirectMessages"));
        }
    }
}
