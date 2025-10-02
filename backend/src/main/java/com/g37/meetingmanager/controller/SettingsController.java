package com.g37.meetingmanager.controller;

import com.g37.meetingmanager.model.AppConfig;
import com.g37.meetingmanager.service.SettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"})
public class SettingsController {

    @Autowired
    private SettingsService settingsService;

    /**
     * Update user profile settings
     */
    @PutMapping("/user-profile")
    public ResponseEntity<?> updateUserProfile(@RequestBody Map<String, Object> profileData) {
        try {
            String email = (String) profileData.get("email");
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body("Email is required");
            }

            Map<String, Object> updatedProfile = settingsService.updateUserProfile(email, profileData);
            return ResponseEntity.ok(updatedProfile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating user profile: " + e.getMessage());
        }
    }

    /**
     * Change user password
     */
    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> passwordData) {
        try {
            String email = passwordData.get("email");
            String currentPassword = passwordData.get("currentPassword");
            String newPassword = passwordData.get("newPassword");

            if (email == null || currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body("Email, current password, and new password are required");
            }

            boolean success = settingsService.changePassword(email, currentPassword, newPassword);
            return ResponseEntity.ok(Map.of("success", success));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error changing password: " + e.getMessage());
        }
    }

    /**
     * Get source applications configuration
     */
    @GetMapping("/source-apps")
    public ResponseEntity<List<AppConfig>> getSourceApps() {
        try {
            List<AppConfig> sourceApps = settingsService.getSourceApps();
            return ResponseEntity.ok(sourceApps);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    /**
     * Get destination applications configuration
     */
    @GetMapping("/destination-apps")
    public ResponseEntity<List<AppConfig>> getDestinationApps() {
        try {
            List<AppConfig> destinationApps = settingsService.getDestinationApps();
            return ResponseEntity.ok(destinationApps);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    /**
     * Save application configuration
     */
    @PostMapping("/app-configs")
    public ResponseEntity<AppConfig> saveAppConfig(@RequestBody AppConfig appConfig) {
        try {
            AppConfig savedConfig = settingsService.saveAppConfig(appConfig);
            return ResponseEntity.ok(savedConfig);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    /**
     * Delete application configuration
     */
    @DeleteMapping("/app-configs/{id}")
    public ResponseEntity<?> deleteAppConfig(@PathVariable String id) {
        try {
            boolean success = settingsService.deleteAppConfig(id);
            return ResponseEntity.ok(Map.of("success", success));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false));
        }
    }

    /**
     * Test application connection
     */
    @PostMapping("/test-connection")
    public ResponseEntity<Map<String, Object>> testConnection(@RequestBody AppConfig appConfig) {
        try {
            Map<String, Object> result = settingsService.testConnection(appConfig);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "success", false,
                "message", "Connection failed: " + e.getMessage()
            ));
        }
    }
}