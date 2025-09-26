package com.g37.meetingmanager.controller;

import com.g37.meetingmanager.model.NotificationDocument;
import com.g37.meetingmanager.repository.mongodb.NotificationMongoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);
    
    @Autowired
    private NotificationMongoRepository notificationRepository;

    public NotificationController() {
        logger.info("NotificationController initialized with MongoDB integration");
    }
    
    @GetMapping
    public ResponseEntity<List<NotificationDocument>> getNotifications(@RequestParam(required = false) String email) {
        logger.info("✅ NotificationController: Getting notifications from MongoDB - NO MOCK DATA");
        
        try {
            List<NotificationDocument> notifications;
            
            if (email != null && !email.trim().isEmpty()) {
                notifications = notificationRepository.findByUserEmailOrderByCreatedAtDesc(email);
                logger.info("✅ Found {} notifications for user email: {}", notifications.size(), email);
            } else {
                notifications = notificationRepository.findAll();
                logger.info("✅ Found {} total notifications from MongoDB", notifications.size());
            }
            
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            logger.error("Error fetching notifications from MongoDB: {}", e.getMessage());
            return ResponseEntity.ok(Collections.emptyList());
        }
    }
    
    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@RequestParam(required = false) String email) {
        logger.info("Getting unread count from MongoDB for email: {}", email);
        
        try {
            long unreadCount;
            
            if (email != null && !email.trim().isEmpty()) {
                unreadCount = notificationRepository.countUnreadByUserEmail(email);
                logger.info("✅ Found {} unread notifications for user: {}", unreadCount, email);
            } else {
                unreadCount = notificationRepository.countUnreadNotifications();
                logger.info("✅ Found {} total unread notifications", unreadCount);
            }
            
            return ResponseEntity.ok(Map.of("count", unreadCount));
        } catch (Exception e) {
            logger.error("Error counting unread notifications: {}", e.getMessage());
            return ResponseEntity.ok(Map.of("count", 0L));
        }
    }
    
    @PostMapping
    public ResponseEntity<NotificationDocument> createNotification(@RequestBody NotificationDocument notification) {
        logger.info("Creating new notification in MongoDB for user: {}", notification.getUserEmail());
        
        try {
            // Set creation time
            notification.setCreatedAt(LocalDateTime.now());
            
            // Save to MongoDB
            NotificationDocument savedNotification = notificationRepository.save(notification);
            logger.info("✅ Created notification with ID: {}", savedNotification.getId());
            
            return ResponseEntity.ok(savedNotification);
        } catch (Exception e) {
            logger.error("Error creating notification: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<NotificationDocument> markAsRead(@PathVariable String notificationId) {
        logger.info("Marking notification as read: {}", notificationId);
        
        try {
            NotificationDocument notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
                
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
            
            NotificationDocument updatedNotification = notificationRepository.save(notification);
            logger.info("✅ Marked notification {} as read", notificationId);
            
            return ResponseEntity.ok(updatedNotification);
        } catch (Exception e) {
            logger.error("Error marking notification as read: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testEndpoint() {
        logger.info("MongoDB notification controller test endpoint called");
        
        try {
            long totalNotifications = notificationRepository.count();
            long unreadNotifications = notificationRepository.countUnreadNotifications();
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "ok");
            response.put("message", "NotificationController MongoDB integration working");
            response.put("timestamp", LocalDateTime.now().toString());
            response.put("totalNotifications", totalNotifications);
            response.put("unreadCount", unreadNotifications);
            response.put("version", "mongodb-integrated");
            response.put("database", "MongoDB");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("MongoDB connection error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of(
                    "status", "error", 
                    "message", "MongoDB connection failed",
                    "error", e.getMessage()
                ));
        }
    }
}
