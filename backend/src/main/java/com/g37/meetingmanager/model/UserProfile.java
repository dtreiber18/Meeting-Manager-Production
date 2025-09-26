package com.g37.meetingmanager.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.index.Indexed;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "mnm_user_profiles")
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserProfile {
    
    @Id
    private String id; // MongoDB ObjectId
    
    @NotBlank
    @Email
    @Size(max = 255)
    @Field("email")
    @Indexed(unique = true)
    private String email;
    
    @NotBlank
    @Size(max = 100)
    @Field("first_name")
    private String firstName;
    
    @NotBlank
    @Size(max = 100)
    @Field("last_name")
    private String lastName;
    
    @Size(max = 20)
    @Field("phone_number")
    private String phoneNumber;
    
    @Size(max = 100)
    @Field("job_title")
    private String jobTitle;
    
    @Size(max = 100)
    @Field("department")
    private String department;
    
    @Size(max = 255)
    @Field("profile_image_url")
    private String profileImageUrl;
    
    @Size(max = 500)
    @Field("bio")
    private String bio;
    
    @Field("is_active")
    private Boolean isActive = true;
    
    // Notification preferences
    @Field("email_notifications")
    private Boolean emailNotifications = true;
    
    @Field("push_notifications")
    private Boolean pushNotifications = true;
    
    @Field("sms_notifications")
    private Boolean smsNotifications = false;
    
    @Field("meeting_reminders")
    private Boolean meetingReminders = true;
    
    @Field("action_item_reminders")
    private Boolean actionItemReminders = true;
    
    @Field("weekly_digest")
    private Boolean weeklyDigest = true;
    
    // Display preferences
    @Size(max = 50)
    @Field("timezone")
    private String timezone = "UTC";
    
    @Size(max = 10)
    @Field("language")
    private String language = "en";
    
    @Size(max = 20)
    @Field("theme")
    private String theme = "light";
    
    @Size(max = 20)
    @Field("date_format")
    private String dateFormat = "MM/dd/yyyy";
    
    @Size(max = 20)
    @Field("time_format")
    private String timeFormat = "12h";
    
    @Field("dark_mode")
    private Boolean darkMode = false;
    
    @Field("compact_view")
    private Boolean compactView = false;
    
    // Privacy settings
    @Size(max = 20)
    @Field("profile_visibility")
    private String profileVisibility = "organization"; // public, organization, private
    
    @Field("show_online_status")
    private Boolean showOnlineStatus = true;
    
    @Field("allow_direct_messages")
    private Boolean allowDirectMessages = true;
    
    // Integration settings
    @Size(max = 255)
    @Field("azure_ad_object_id")
    @Indexed
    private String azureAdObjectId;
    
    @Size(max = 5000)
    @Field("graph_access_token")
    private String graphAccessToken;
    
    @Size(max = 5000)
    @Field("graph_refresh_token")
    private String graphRefreshToken;
    
    @Field("graph_token_expires_at")
    private LocalDateTime graphTokenExpiresAt;
    
    // References to MySQL entities (for hybrid architecture)
    @Field("mysql_user_id")
    @Indexed
    private Long mysqlUserId;
    
    @Field("organization_id")
    @Indexed
    private Long organizationId;
    
    @Field("organization_name")
    private String organizationName;
    
    @Field("roles")
    private List<String> roles;
    
    @Field("permissions")
    private List<String> permissions;
    
    // Timestamps
    @Field("created_at")
    @Indexed
    private LocalDateTime createdAt;
    
    @Field("updated_at")
    private LocalDateTime updatedAt;
    
    @Field("last_login_at")
    private LocalDateTime lastLoginAt;
    
    @Field("last_profile_update_at")
    private LocalDateTime lastProfileUpdateAt;
    
    // Constructors
    public UserProfile() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public UserProfile(String email, String firstName, String lastName) {
        this();
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
    }
    
    // Helper methods
    public String getFullName() {
        return firstName + " " + lastName;
    }
    
    public String getDisplayName() {
        return getFullName();
    }
    
    public boolean hasRole(String roleName) {
        return roles != null && roles.contains(roleName);
    }
    
    public boolean hasPermission(String permission) {
        return permissions != null && permissions.contains(permission);
    }
    
    public void updateTimestamp() {
        this.updatedAt = LocalDateTime.now();
    }
    
    public void updateProfileTimestamp() {
        this.lastProfileUpdateAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public void recordLogin() {
        this.lastLoginAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    
    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }
    
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public Boolean getEmailNotifications() { return emailNotifications; }
    public void setEmailNotifications(Boolean emailNotifications) { this.emailNotifications = emailNotifications; }
    
    public Boolean getPushNotifications() { return pushNotifications; }
    public void setPushNotifications(Boolean pushNotifications) { this.pushNotifications = pushNotifications; }
    
    public Boolean getSmsNotifications() { return smsNotifications; }
    public void setSmsNotifications(Boolean smsNotifications) { this.smsNotifications = smsNotifications; }
    
    public Boolean getMeetingReminders() { return meetingReminders; }
    public void setMeetingReminders(Boolean meetingReminders) { this.meetingReminders = meetingReminders; }
    
    public Boolean getActionItemReminders() { return actionItemReminders; }
    public void setActionItemReminders(Boolean actionItemReminders) { this.actionItemReminders = actionItemReminders; }
    
    public Boolean getWeeklyDigest() { return weeklyDigest; }
    public void setWeeklyDigest(Boolean weeklyDigest) { this.weeklyDigest = weeklyDigest; }
    
    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }
    
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    
    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }
    
    public String getDateFormat() { return dateFormat; }
    public void setDateFormat(String dateFormat) { this.dateFormat = dateFormat; }
    
    public String getTimeFormat() { return timeFormat; }
    public void setTimeFormat(String timeFormat) { this.timeFormat = timeFormat; }
    
    public Boolean getDarkMode() { return darkMode; }
    public void setDarkMode(Boolean darkMode) { this.darkMode = darkMode; }
    
    public Boolean getCompactView() { return compactView; }
    public void setCompactView(Boolean compactView) { this.compactView = compactView; }
    
    public String getProfileVisibility() { return profileVisibility; }
    public void setProfileVisibility(String profileVisibility) { this.profileVisibility = profileVisibility; }
    
    public Boolean getShowOnlineStatus() { return showOnlineStatus; }
    public void setShowOnlineStatus(Boolean showOnlineStatus) { this.showOnlineStatus = showOnlineStatus; }
    
    public Boolean getAllowDirectMessages() { return allowDirectMessages; }
    public void setAllowDirectMessages(Boolean allowDirectMessages) { this.allowDirectMessages = allowDirectMessages; }
    
    public String getAzureAdObjectId() { return azureAdObjectId; }
    public void setAzureAdObjectId(String azureAdObjectId) { this.azureAdObjectId = azureAdObjectId; }
    
    public String getGraphAccessToken() { return graphAccessToken; }
    public void setGraphAccessToken(String graphAccessToken) { this.graphAccessToken = graphAccessToken; }
    
    public String getGraphRefreshToken() { return graphRefreshToken; }
    public void setGraphRefreshToken(String graphRefreshToken) { this.graphRefreshToken = graphRefreshToken; }
    
    public LocalDateTime getGraphTokenExpiresAt() { return graphTokenExpiresAt; }
    public void setGraphTokenExpiresAt(LocalDateTime graphTokenExpiresAt) { this.graphTokenExpiresAt = graphTokenExpiresAt; }
    
    public Long getMysqlUserId() { return mysqlUserId; }
    public void setMysqlUserId(Long mysqlUserId) { this.mysqlUserId = mysqlUserId; }
    
    public Long getOrganizationId() { return organizationId; }
    public void setOrganizationId(Long organizationId) { this.organizationId = organizationId; }
    
    public String getOrganizationName() { return organizationName; }
    public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }
    
    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
    
    public List<String> getPermissions() { return permissions; }
    public void setPermissions(List<String> permissions) { this.permissions = permissions; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public LocalDateTime getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }
    
    public LocalDateTime getLastProfileUpdateAt() { return lastProfileUpdateAt; }
    public void setLastProfileUpdateAt(LocalDateTime lastProfileUpdateAt) { this.lastProfileUpdateAt = lastProfileUpdateAt; }
}