package com.g37.meetingmanager.service;

import com.g37.meetingmanager.model.Notification;
import com.g37.meetingmanager.model.NotificationType;
import com.g37.meetingmanager.model.NotificationPriority;
import com.g37.meetingmanager.repository.mysql.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class NotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    /**
     * Get all notifications for a user
     */
    @Transactional(readOnly = true)
    public List<Notification> getNotificationsForUser(Long userId) {
        logger.debug("Getting notifications for user: {}", userId);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    /**
     * Get notifications for a user with pagination
     */
    @Transactional(readOnly = true)
    public Page<Notification> getNotificationsForUser(Long userId, int page, int size) {
        logger.debug("Getting paginated notifications for user: {}, page: {}, size: {}", userId, page, size);
        Pageable pageable = PageRequest.of(page, size);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }
    
    /**
     * Get unread notifications for a user
     */
    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotificationsForUser(Long userId) {
        logger.debug("Getting unread notifications for user: {}", userId);
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }
    
    /**
     * Get a specific notification for a user
     */
    @Transactional(readOnly = true)
    public Optional<Notification> getNotificationForUser(Long notificationId, Long userId) {
        logger.debug("Getting notification {} for user: {}", notificationId, userId);
        return notificationRepository.findByIdAndUserId(notificationId, userId);
    }
    
    /**
     * Count unread notifications for a user
     */
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        logger.debug("Counting unread notifications for user: {}", userId);
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
    
    /**
     * Create a new notification
     */
    public Notification createNotification(Long userId, NotificationType type, String title, 
                                         String message, NotificationPriority priority, 
                                         String actionUrl, String actionText) {
        logger.info("Creating notification for user {}: {}", userId, title);
        
        Notification notification = new Notification(userId, type, title, message, priority, actionUrl, actionText);
        return notificationRepository.save(notification);
    }
    
    /**
     * Create a notification with additional data
     */
    public Notification createNotification(Long userId, NotificationType type, String title, 
                                         String message, NotificationPriority priority, 
                                         String actionUrl, String actionText, String data) {
        logger.info("Creating notification with data for user {}: {}", userId, title);
        
        Notification notification = new Notification(userId, type, title, message, priority, actionUrl, actionText);
        notification.setData(data);
        return notificationRepository.save(notification);
    }
    
    /**
     * Create a notification with expiration
     */
    public Notification createNotificationWithExpiration(Long userId, NotificationType type, String title, 
                                                        String message, NotificationPriority priority, 
                                                        String actionUrl, String actionText, 
                                                        LocalDateTime expiresAt) {
        logger.info("Creating expiring notification for user {}: {} (expires: {})", userId, title, expiresAt);
        
        Notification notification = new Notification(userId, type, title, message, priority, actionUrl, actionText);
        notification.setExpiresAt(expiresAt);
        return notificationRepository.save(notification);
    }
    
    /**
     * Mark a notification as read
     */
    public boolean markAsRead(Long notificationId, Long userId) {
        logger.info("Marking notification {} as read for user {}", notificationId, userId);
        
        int updated = notificationRepository.markAsRead(notificationId, userId, LocalDateTime.now());
        return updated > 0;
    }
    
    /**
     * Mark all notifications as read for a user
     */
    public int markAllAsRead(Long userId) {
        logger.info("Marking all notifications as read for user {}", userId);
        
        return notificationRepository.markAllAsRead(userId, LocalDateTime.now());
    }
    
    /**
     * Delete a notification
     */
    public boolean deleteNotification(Long notificationId, Long userId) {
        logger.info("Deleting notification {} for user {}", notificationId, userId);
        
        Optional<Notification> notification = notificationRepository.findByIdAndUserId(notificationId, userId);
        if (notification.isPresent()) {
            notificationRepository.delete(notification.get());
            return true;
        }
        
        logger.warn("Notification {} not found for user {}", notificationId, userId);
        return false;
    }
    
    /**
     * Delete all read notifications for a user
     */
    public int deleteAllReadNotifications(Long userId) {
        logger.info("Deleting all read notifications for user {}", userId);
        
        LocalDateTime cutoff = LocalDateTime.now().minusDays(30); // Keep recent read notifications
        return notificationRepository.deleteOldReadNotifications(userId, cutoff);
    }
    
    /**
     * Clean up expired notifications
     */
    public int cleanupExpiredNotifications() {
        logger.info("Cleaning up expired notifications");
        
        return notificationRepository.deleteExpiredNotifications(LocalDateTime.now());
    }
    
    /**
     * Create meeting reminder notification
     */
    public Notification createMeetingReminder(Long userId, String meetingTitle, String meetingId, int minutesUntilStart) {
        String title = "Meeting Reminder";
        String message = String.format("Your meeting \"%s\" starts in %d minutes", meetingTitle, minutesUntilStart);
        String actionUrl = "/meetings/" + meetingId;
        String actionText = "Join Meeting";
        
        return createNotification(userId, NotificationType.MEETING_REMINDER, title, message, 
                                NotificationPriority.HIGH, actionUrl, actionText);
    }
    
    /**
     * Create action item due notification
     */
    public Notification createActionItemDue(Long userId, String actionTitle, String actionId, LocalDateTime dueDate) {
        String title = "Action Item Due Soon";
        String message = String.format("Action item \"%s\" is due soon", actionTitle);
        String actionUrl = "/action-items/" + actionId;
        String actionText = "View Details";
        
        return createNotification(userId, NotificationType.ACTION_ITEM_DUE, title, message, 
                                NotificationPriority.NORMAL, actionUrl, actionText);
    }
    
    /**
     * Create meeting invitation notification
     */
    public Notification createMeetingInvitation(Long userId, String meetingTitle, String meetingId, LocalDateTime meetingDate) {
        String title = "Meeting Invitation";
        String message = String.format("You have been invited to \"%s\"", meetingTitle);
        String actionUrl = "/meetings/" + meetingId;
        String actionText = "Respond";
        
        return createNotification(userId, NotificationType.MEETING_INVITATION, title, message, 
                                NotificationPriority.NORMAL, actionUrl, actionText);
    }
    
    /**
     * Create action item assignment notification
     */
    public Notification createActionItemAssignment(Long userId, String actionTitle, String actionId, LocalDateTime dueDate) {
        String title = "New Action Item Assigned";
        String message = String.format("You have been assigned action item \"%s\"", actionTitle);
        String actionUrl = "/action-items/" + actionId;
        String actionText = "View Details";
        
        return createNotification(userId, NotificationType.ACTION_ITEM_ASSIGNED, title, message, 
                                NotificationPriority.NORMAL, actionUrl, actionText);
    }
    
    /**
     * Create action item approval notification
     */
    public Notification createActionItemApproval(Long userId, String actionTitle, String actionId, boolean approved) {
        String title = approved ? "Action Item Approved" : "Action Item Rejected";
        String message = String.format("Action item \"%s\" has been %s", actionTitle, approved ? "approved" : "rejected");
        String actionUrl = "/action-items/" + actionId;
        String actionText = "View Details";
        
        return createNotification(userId, NotificationType.ACTION_ITEM_ASSIGNED, title, message, 
                                NotificationPriority.NORMAL, actionUrl, actionText);
    }

    /**
     * Create action item completed notification
     */
    public Notification createActionItemCompleted(Long userId, String actionTitle, String actionId, String completedBy) {
        String title = "Action Item Completed";
        String message = String.format("Action item \"%s\" has been completed by %s", actionTitle, completedBy);
        String actionUrl = "/action-items/" + actionId;
        String actionText = "View Details";
        
        return createNotification(userId, NotificationType.ACTION_ITEM_COMPLETED, title, message, 
                                NotificationPriority.NORMAL, actionUrl, actionText);
    }

    /**
     * Create system announcement notification
     */
    public Notification createSystemAnnouncement(Long userId, String title, String message) {
        return createNotification(userId, NotificationType.SYSTEM_ANNOUNCEMENT, title, message, 
                                NotificationPriority.NORMAL, null, null);
    }
    
    /**
     * Get recent notifications (last 7 days)
     */
    @Transactional(readOnly = true)
    public List<Notification> getRecentNotifications(Long userId) {
        LocalDateTime since = LocalDateTime.now().minusDays(7);
        return notificationRepository.findRecentNotifications(userId, since);
    }
    
    /**
     * Get notifications by type
     */
    @Transactional(readOnly = true)
    public List<Notification> getNotificationsByType(Long userId, NotificationType type) {
        return notificationRepository.findByUserIdAndTypeOrderByCreatedAtDesc(userId, type);
    }
    
    /**
     * Get high priority notifications
     */
    @Transactional(readOnly = true)
    public List<Notification> getHighPriorityNotifications(Long userId) {
        List<NotificationPriority> highPriorities = List.of(NotificationPriority.HIGH, NotificationPriority.URGENT);
        return notificationRepository.findByUserIdAndPriorityIn(userId, highPriorities);
    }
}