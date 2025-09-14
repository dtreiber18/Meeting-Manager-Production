package com.g37.meetingmanager.repository.mysql;

import com.g37.meetingmanager.model.Notification;
import com.g37.meetingmanager.model.NotificationType;
import com.g37.meetingmanager.model.NotificationPriority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    /**
     * Find all notifications for a specific user, ordered by creation date (newest first)
     */
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    /**
     * Find notifications for a user with pagination
     */
    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    /**
     * Find unread notifications for a specific user
     */
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
    
    /**
     * Find notifications by user and type
     */
    List<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(Long userId, NotificationType type);
    
    /**
     * Find notifications by user and priority
     */
    List<Notification> findByUserIdAndPriorityOrderByCreatedAtDesc(Long userId, NotificationPriority priority);
    
    /**
     * Find a specific notification for a user
     */
    Optional<Notification> findByIdAndUserId(Long id, Long userId);
    
    /**
     * Count unread notifications for a user
     */
    long countByUserIdAndIsReadFalse(Long userId);
    
    /**
     * Count total notifications for a user
     */
    long countByUserId(Long userId);
    
    /**
     * Mark a specific notification as read
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.updatedAt = :updatedAt WHERE n.id = :id AND n.userId = :userId")
    int markAsRead(@Param("id") Long id, @Param("userId") Long userId, @Param("updatedAt") LocalDateTime updatedAt);
    
    /**
     * Mark all notifications as read for a user
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.updatedAt = :updatedAt WHERE n.userId = :userId AND n.isRead = false")
    int markAllAsRead(@Param("userId") Long userId, @Param("updatedAt") LocalDateTime updatedAt);
    
    /**
     * Delete expired notifications
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.expiresAt IS NOT NULL AND n.expiresAt < :now")
    int deleteExpiredNotifications(@Param("now") LocalDateTime now);
    
    /**
     * Find notifications that will expire soon (for cleanup warnings)
     */
    @Query("SELECT n FROM Notification n WHERE n.expiresAt IS NOT NULL AND n.expiresAt BETWEEN :now AND :threshold")
    List<Notification> findNotificationsExpiringSoon(@Param("now") LocalDateTime now, @Param("threshold") LocalDateTime threshold);
    
    /**
     * Find recent notifications for a user (last N days)
     */
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.createdAt >= :since ORDER BY n.createdAt DESC")
    List<Notification> findRecentNotifications(@Param("userId") Long userId, @Param("since") LocalDateTime since);
    
    /**
     * Find notifications by priority for a user
     */
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.priority IN :priorities ORDER BY n.createdAt DESC")
    List<Notification> findByUserIdAndPriorityIn(@Param("userId") Long userId, @Param("priorities") List<NotificationPriority> priorities);
    
    /**
     * Delete all read notifications older than specified date
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.userId = :userId AND n.isRead = true AND n.updatedAt < :before")
    int deleteOldReadNotifications(@Param("userId") Long userId, @Param("before") LocalDateTime before);
}