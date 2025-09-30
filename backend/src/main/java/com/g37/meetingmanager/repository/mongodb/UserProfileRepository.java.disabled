package com.g37.meetingmanager.repository.mongodb;

import com.g37.meetingmanager.model.UserProfile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserProfileRepository extends MongoRepository<UserProfile, String> {
    
    Optional<UserProfile> findByEmail(String email);
    
    Optional<UserProfile> findByAzureAdObjectId(String azureAdObjectId);
    
    Optional<UserProfile> findByMysqlUserId(Long mysqlUserId);
    
    List<UserProfile> findByOrganizationId(Long organizationId);
    
    List<UserProfile> findByIsActiveTrue();
    
    List<UserProfile> findByOrganizationIdAndIsActiveTrue(Long organizationId);
    
    @Query("{'roles': ?0}")
    List<UserProfile> findByRole(String role);
    
    @Query("{'permissions': ?0}")
    List<UserProfile> findByPermission(String permission);
    
    @Query("{'organization_id': ?0, 'is_active': true}")
    List<UserProfile> findActiveUsersByOrganization(Long organizationId);
    
    @Query("{'email_notifications': true, 'is_active': true}")
    List<UserProfile> findUsersWithEmailNotificationsEnabled();
    
    @Query("{'push_notifications': true, 'is_active': true}")
    List<UserProfile> findUsersWithPushNotificationsEnabled();
    
    @Query("{'meeting_reminders': true, 'is_active': true}")
    List<UserProfile> findUsersWithMeetingRemindersEnabled();
    
    @Query("{'action_item_reminders': true, 'is_active': true}")
    List<UserProfile> findUsersWithActionItemRemindersEnabled();
    
    @Query("{'weekly_digest': true, 'is_active': true}")
    List<UserProfile> findUsersWithWeeklyDigestEnabled();
    
    @Query("{'last_login_at': {$gte: ?0}}")
    List<UserProfile> findUsersLoggedInSince(LocalDateTime since);
    
    @Query("{'last_profile_update_at': {$gte: ?0}}")
    List<UserProfile> findUsersWithProfileUpdatedSince(LocalDateTime since);
    
    @Query("{'theme': ?0}")
    List<UserProfile> findByTheme(String theme);
    
    @Query("{'timezone': ?0}")
    List<UserProfile> findByTimezone(String timezone);
    
    @Query("{'language': ?0}")
    List<UserProfile> findByLanguage(String language);
    
    // Aggregation queries for analytics
    @Query(value = "{'organization_id': ?0}", count = true)
    long countByOrganizationId(Long organizationId);
    
    @Query(value = "{'organization_id': ?0, 'is_active': true}", count = true)
    long countActiveUsersByOrganizationId(Long organizationId);
    
    @Query(value = "{'theme': 'dark'}", count = true)
    long countUsersWithDarkMode();
    
    @Query(value = "{'email_notifications': true}", count = true)
    long countUsersWithEmailNotifications();
}