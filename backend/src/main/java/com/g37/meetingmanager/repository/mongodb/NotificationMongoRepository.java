package com.g37.meetingmanager.repository.mongodb;

import com.g37.meetingmanager.model.NotificationDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository("mongoNotificationRepository")
public interface NotificationMongoRepository extends MongoRepository<NotificationDocument, String> {
    
    List<NotificationDocument> findByUserIdOrderByCreatedAtDesc(String userId);
    
    List<NotificationDocument> findByUserEmailOrderByCreatedAtDesc(String userEmail);
    
    List<NotificationDocument> findByUserIdAndIsReadOrderByCreatedAtDesc(String userId, Boolean isRead);
    
    List<NotificationDocument> findByUserEmailAndIsReadOrderByCreatedAtDesc(String userEmail, Boolean isRead);
    
    @Query("{'user_id': ?0, 'is_read': false}")
    List<NotificationDocument> findUnreadByUserId(String userId);
    
    @Query("{'user_email': ?0, 'is_read': false}")
    List<NotificationDocument> findUnreadByUserEmail(String userEmail);
    
    @Query(value = "{'user_id': ?0, 'is_read': false}", count = true)
    long countUnreadByUserId(String userId);
    
    @Query(value = "{'user_email': ?0, 'is_read': false}", count = true)
    long countUnreadByUserEmail(String userEmail);
    
    List<NotificationDocument> findByOrganizationIdOrderByCreatedAtDesc(Long organizationId);
    
    List<NotificationDocument> findByTypeOrderByCreatedAtDesc(NotificationDocument.NotificationType type);
    
    List<NotificationDocument> findByPriorityOrderByCreatedAtDesc(NotificationDocument.NotificationPriority priority);
    
    @Query("{'expires_at': {$lt: ?0}}")
    List<NotificationDocument> findExpiredNotifications(LocalDateTime now);
    
    @Query("{'created_at': {$gte: ?0, $lt: ?1}}")
    List<NotificationDocument> findNotificationsBetweenDates(LocalDateTime start, LocalDateTime end);
    
    @Query("{'user_id': ?0, 'created_at': {$gte: ?1}}")
    List<NotificationDocument> findByUserIdSince(String userId, LocalDateTime since);
    
    @Query("{'user_email': ?0, 'created_at': {$gte: ?1}}")
    List<NotificationDocument> findByUserEmailSince(String userEmail, LocalDateTime since);
    
    @Query("{'meeting_id': ?0}")
    List<NotificationDocument> findByMeetingId(Long meetingId);
    
    @Query("{'action_item_id': ?0}")
    List<NotificationDocument> findByActionItemId(String actionItemId);
    
    // Analytics queries
    @Query(value = "{'type': ?0}", count = true)
    long countByType(NotificationDocument.NotificationType type);
    
    @Query(value = "{'priority': ?0}", count = true)
    long countByPriority(NotificationDocument.NotificationPriority priority);
    
    @Query(value = "{'is_read': true}", count = true)
    long countReadNotifications();
    
    @Query(value = "{'is_read': false}", count = true)
    long countUnreadNotifications();
    
    @Query(value = "{'email_sent': true}", count = true)
    long countEmailsSent();
    
    @Query(value = "{'push_sent': true}", count = true)
    long countPushNotificationsSent();
}