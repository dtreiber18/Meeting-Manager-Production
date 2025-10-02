package com.g37.meetingmanager.service;

import com.g37.meetingmanager.model.AppConfig;
import com.g37.meetingmanager.repository.AppConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class SettingsService {

    @Autowired(required = false)
    private AppConfigRepository appConfigRepository;

    /**
     * Update user profile settings
     */
    public Map<String, Object> updateUserProfile(String email, Map<String, Object> profileData) {
        // For now, we'll just return the updated data
        // In a full implementation, this would update the user profile in the database
        Map<String, Object> updatedProfile = new HashMap<>(profileData);
        updatedProfile.put("updatedAt", LocalDateTime.now());
        return updatedProfile;
    }

    /**
     * Change user password
     */
    public boolean changePassword(String email, String currentPassword, String newPassword) {
        // For now, we'll just return success
        // In a full implementation, this would validate the current password
        // and update it in the database
        return true;
    }

    /**
     * Get source applications configuration
     */
    public List<AppConfig> getSourceApps() {
        try {
            if (appConfigRepository != null) {
                return appConfigRepository.findByType("source");
            }
        } catch (Exception e) {
            // Fall through to default data
        }
        // Return default source apps if repository is not available
        return getDefaultSourceApps();
    }

    /**
     * Get destination applications configuration
     */
    public List<AppConfig> getDestinationApps() {
        try {
            if (appConfigRepository != null) {
                return appConfigRepository.findByType("destination");
            }
        } catch (Exception e) {
            // Fall through to default data
        }
        // Return default destination apps if repository is not available
        return getDefaultDestinationApps();
    }

    /**
     * Save application configuration
     */
    public AppConfig saveAppConfig(AppConfig appConfig) {
        try {
            if (appConfigRepository != null) {
                return appConfigRepository.save(appConfig);
            }
        } catch (Exception e) {
            // Fall through to simulated save
        }
        // For now, just return the config as-is if save fails
        appConfig.setUpdatedAt(LocalDateTime.now());
        return appConfig;
    }

    /**
     * Delete application configuration
     */
    public boolean deleteAppConfig(String id) {
        try {
            if (appConfigRepository != null) {
                appConfigRepository.deleteById(id);
                return true;
            }
        } catch (Exception e) {
            // Fall through to simulated delete
        }
        return false;
    }

    /**
     * Test application connection
     */
    public Map<String, Object> testConnection(AppConfig appConfig) {
        // For now, we'll simulate a connection test
        // In a full implementation, this would actually test the API connection
        boolean success = Math.random() > 0.3; // 70% success rate for demo
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", success);
        result.put("message", success ? 
            "Connection successful!" : 
            "Connection failed. Please check your credentials.");
        
        return result;
    }

    /**
     * Get default source applications for fallback
     */
    private List<AppConfig> getDefaultSourceApps() {
        List<AppConfig> sourceApps = new ArrayList<>();
        
        AppConfig fathom = new AppConfig();
        fathom.setId("1");
        fathom.setName("Fathom.video");
        fathom.setType("source");
        fathom.setConnectionType("api");
        fathom.setApiUrl("https://api.fathom.video/v1");
        fathom.setApiKey("");
        
        Map<String, String> fathomMapping = new HashMap<>();
        fathomMapping.put("meetingDate", "date");
        fathomMapping.put("meetingTime", "start_time");
        fathomMapping.put("meetingSubject", "title");
        fathomMapping.put("meetingParticipants", "participants");
        fathomMapping.put("meetingSummary", "summary");
        fathomMapping.put("meetingActionItems", "action_items");
        fathomMapping.put("meetingNextSteps", "next_steps");
        fathomMapping.put("meetingDetails", "transcript");
        fathomMapping.put("meetingRecording", "recording_url");
        fathomMapping.put("meetingDuration", "duration");
        fathom.setFieldMapping(fathomMapping);
        fathom.setIsActive(true);
        
        AppConfig otter = new AppConfig();
        otter.setId("2");
        otter.setName("Otter.ai");
        otter.setType("source");
        otter.setConnectionType("api");
        otter.setApiUrl("https://otter.ai/forward/api/v1");
        otter.setApiKey("");
        
        Map<String, String> otterMapping = new HashMap<>();
        otterMapping.put("meetingDate", "created_at");
        otterMapping.put("meetingTime", "start_time");
        otterMapping.put("meetingSubject", "title");
        otterMapping.put("meetingParticipants", "speakers");
        otterMapping.put("meetingSummary", "summary");
        otterMapping.put("meetingActionItems", "action_items");
        otterMapping.put("meetingNextSteps", "follow_ups");
        otterMapping.put("meetingDetails", "transcript");
        otterMapping.put("meetingRecording", "audio_url");
        otterMapping.put("meetingDuration", "duration");
        otter.setFieldMapping(otterMapping);
        otter.setIsActive(false);
        
        sourceApps.add(fathom);
        sourceApps.add(otter);
        
        return sourceApps;
    }

    /**
     * Get default destination applications for fallback
     */
    private List<AppConfig> getDefaultDestinationApps() {
        List<AppConfig> destinationApps = new ArrayList<>();
        
        AppConfig googleCalendar = new AppConfig();
        googleCalendar.setId("1");
        googleCalendar.setName("Google Calendar");
        googleCalendar.setType("destination");
        googleCalendar.setConnectionType("api");
        googleCalendar.setApiUrl("https://www.googleapis.com/calendar/v3");
        googleCalendar.setApiKey("");
        
        Map<String, String> gcalMapping = new HashMap<>();
        gcalMapping.put("meetingDate", "start.date");
        gcalMapping.put("meetingTime", "start.dateTime");
        gcalMapping.put("meetingSubject", "summary");
        gcalMapping.put("meetingParticipants", "attendees");
        gcalMapping.put("meetingSummary", "description");
        gcalMapping.put("meetingActionItems", "description");
        gcalMapping.put("meetingNextSteps", "description");
        gcalMapping.put("meetingDetails", "description");
        googleCalendar.setFieldMapping(gcalMapping);
        googleCalendar.setIsActive(true);
        
        AppConfig gmail = new AppConfig();
        gmail.setId("2");
        gmail.setName("Gmail");
        gmail.setType("destination");
        gmail.setConnectionType("api");
        gmail.setApiUrl("https://www.googleapis.com/gmail/v1");
        gmail.setApiKey("");
        
        Map<String, String> gmailMapping = new HashMap<>();
        gmailMapping.put("meetingSubject", "subject");
        gmailMapping.put("meetingParticipants", "to");
        gmailMapping.put("meetingSummary", "body");
        gmailMapping.put("meetingActionItems", "body");
        gmailMapping.put("meetingNextSteps", "body");
        gmailMapping.put("meetingDetails", "body");
        gmailMapping.put("meetingDate", "");
        gmailMapping.put("meetingTime", "");
        gmail.setFieldMapping(gmailMapping);
        gmail.setIsActive(true);
        
        destinationApps.add(googleCalendar);
        destinationApps.add(gmail);
        
        return destinationApps;
    }
}