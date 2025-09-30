package com.g37.meetingmanager.controller;

import com.g37.meetingmanager.model.User;
import com.g37.meetingmanager.model.UserProfile;
import com.g37.meetingmanager.model.Role;
import com.g37.meetingmanager.service.AuthService;
import com.g37.meetingmanager.repository.mongodb.UserProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import jakarta.annotation.PostConstruct;
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
    }
    
    @PostConstruct
    public void init() {
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

            // Always try to get core user data from MySQL first
            User mysqlUser = authService.findUserByEmail(userEmail);
            
            if (mysqlUser == null) {
                log.warn("❌ User not found in MySQL: {}", userEmail);
                return ResponseEntity.notFound().build();
            }
            
            log.info("✅ Found MySQL user: {}", userEmail);
            
            // Create response with MySQL data as primary source
            UserProfile profile = createUserProfileFromMysqlUser(mysqlUser);
            
            // Try to enhance with MongoDB extended profile data if available
            if (userProfileRepository != null) {
                try {
                    Optional<UserProfile> mongoProfile = userProfileRepository.findByEmail(userEmail);
                    if (mongoProfile.isPresent()) {
                        log.info("✅ Enhanced with MongoDB profile data: {}", userEmail);
                        // Merge MongoDB extended fields into MySQL-based profile
                        mergeMongoProfileData(profile, mongoProfile.get());
                    }
                } catch (Exception e) {
                    log.warn("⚠️ MongoDB unavailable for profile enhancement: {}", e.getMessage());
                }
            }
            
            return ResponseEntity.ok(profile);

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

            log.info("✅ Profile UPDATE for MySQL user: {}", email);

            // Always get the user from MySQL first (primary source)
            User mysqlUser = authService.findUserByEmail(email);
            if (mysqlUser == null) {
                log.warn("❌ User not found in MySQL: {}", email);
                return ResponseEntity.notFound().build();
            }

            // Try to update MongoDB extended profile if available
            if (userProfileRepository != null) {
                try {
                    Optional<UserProfile> profileOpt = userProfileRepository.findByEmail(email);
                    UserProfile profile;
                    
                    if (profileOpt.isPresent()) {
                        profile = profileOpt.get();
                        log.info("✅ Found existing MongoDB profile for update: {}", email);
                    } else {
                        // Create new extended profile if doesn't exist
                        profile = createUserProfileFromMysqlUser(mysqlUser);
                        log.info("✅ Creating new MongoDB extended profile: {}", email);
                    }

                    updateUserProfileFields(profile, updates);
                    profile.updateProfileTimestamp();
                    UserProfile savedProfile = userProfileRepository.save(profile);
                    
                    log.info("✅ Extended profile updated in MongoDB: {}", email);
                    return ResponseEntity.ok(savedProfile);
                } catch (Exception e) {
                    log.warn("⚠️ MongoDB update failed, returning MySQL data: {}", e.getMessage());
                }
            }

            // Fallback: Return MySQL user data even if MongoDB update failed
            log.info("✅ Returning MySQL user profile (MongoDB unavailable): {}", email);
            UserProfile fallbackProfile = createUserProfileFromMysqlUser(mysqlUser);
            return ResponseEntity.ok(Map.of(
                "profile", fallbackProfile,
                "fallback", true,
                "message", "Extended profile features temporarily unavailable",
                "updatesReceived", updates
            ));

        } catch (Exception e) {
            log.error("❌ Error updating profile: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private void mergeMongoProfileData(UserProfile baseProfile, UserProfile mongoProfile) {
        // Only merge non-core fields that are MongoDB-specific extensions
        if (mongoProfile.getBio() != null) {
            baseProfile.setBio(mongoProfile.getBio());
        }
        if (mongoProfile.getProfileVisibility() != null) {
            baseProfile.setProfileVisibility(mongoProfile.getProfileVisibility());
        }
        if (mongoProfile.getShowOnlineStatus() != null) {
            baseProfile.setShowOnlineStatus(mongoProfile.getShowOnlineStatus());
        }
        if (mongoProfile.getAllowDirectMessages() != null) {
            baseProfile.setAllowDirectMessages(mongoProfile.getAllowDirectMessages());
        }
        if (mongoProfile.getSmsNotifications() != null) {
            baseProfile.setSmsNotifications(mongoProfile.getSmsNotifications());
        }
        if (mongoProfile.getActionItemReminders() != null) {
            baseProfile.setActionItemReminders(mongoProfile.getActionItemReminders());
        }
        if (mongoProfile.getWeeklyDigest() != null) {
            baseProfile.setWeeklyDigest(mongoProfile.getWeeklyDigest());
        }
        if (mongoProfile.getDarkMode() != null) {
            baseProfile.setDarkMode(mongoProfile.getDarkMode());
        }
        if (mongoProfile.getCompactView() != null) {
            baseProfile.setCompactView(mongoProfile.getCompactView());
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
