package com.g37.meetingmanager.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = {"http://localhost:4200", "https://dtreiber18.github.io"})
public class NotificationController {

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getNotifications(Authentication authentication) {
        List<Map<String, Object>> notifications = new ArrayList<>();
        
        // Sample notifications for testing
        Map<String, Object> notification1 = new HashMap<>();
        notification1.put("id", 1);
        notification1.put("type", "meeting");
        notification1.put("title", "Upcoming Meeting");
        notification1.put("message", "You have a team meeting in 30 minutes");
        notification1.put("timestamp", LocalDateTime.now().minusMinutes(5).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        notification1.put("read", false);
        notification1.put("priority", "high");
        notifications.add(notification1);

        Map<String, Object> notification2 = new HashMap<>();
        notification2.put("id", 2);
        notification2.put("type", "action_item");
        notification2.put("title", "Action Item Due");
        notification2.put("message", "Review quarterly reports - Due today");
        notification2.put("timestamp", LocalDateTime.now().minusHours(2).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        notification2.put("read", false);
        notification2.put("priority", "medium");
        notifications.add(notification2);

        Map<String, Object> notification3 = new HashMap<>();
        notification3.put("id", 3);
        notification3.put("type", "system");
        notification3.put("title", "System Update");
        notification3.put("message", "Your preferences have been updated successfully");
        notification3.put("timestamp", LocalDateTime.now().minusHours(1).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        notification3.put("read", true);
        notification3.put("priority", "low");
        notifications.add(notification3);

        return ResponseEntity.ok(notifications);
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable Long id, Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", id);
        response.put("read", true);
        response.put("message", "Notification marked as read");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<Map<String, Object>> markAllAsRead(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "All notifications marked as read");
        response.put("count", 3);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("unreadCount", 2);
        response.put("totalCount", 3);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/test")
    public ResponseEntity<Map<String, Object>> createTestNotification(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", System.currentTimeMillis());
        response.put("type", payload.getOrDefault("type", "test"));
        response.put("title", payload.getOrDefault("title", "Test Notification"));
        response.put("message", payload.getOrDefault("message", "This is a test notification"));
        response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        response.put("read", false);
        response.put("priority", payload.getOrDefault("priority", "medium"));
        response.put("status", "created");
        return ResponseEntity.ok(response);
    }
}
