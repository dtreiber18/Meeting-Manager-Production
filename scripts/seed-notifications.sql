-- Seed notification data for testing
-- First, clear existing notifications to avoid duplicates
DELETE FROM notifications;

-- Reset auto-increment
ALTER TABLE notifications AUTO_INCREMENT = 1;

-- Insert comprehensive notification test data
INSERT INTO notifications (user_id, type, title, message, priority, action_url, action_text, is_read, created_at) VALUES
-- Recent unread notifications
(1, 'MEETING_REMINDER', 'Meeting Reminder', 'Your meeting "Weekly Team Sync" starts in 15 minutes', 'HIGH', '/meetings/1', 'Join Meeting', false, NOW()),
(1, 'ACTION_ITEM_DUE', 'Action Item Due Tomorrow', 'Action item "Update project documentation" is due tomorrow', 'NORMAL', '/meetings/2', 'View Details', false, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(1, 'ACTION_ITEM_OVERDUE', 'Action Item Overdue', 'Action item "Review budget proposal" is now overdue', 'URGENT', '/action-items/1', 'View Item', false, DATE_SUB(NOW(), INTERVAL 1 HOUR)),

-- Recent read notifications  
(1, 'MEETING_INVITATION', 'Meeting Invitation', 'You have been invited to "Q4 Planning Session" on Friday, 2:00 PM', 'NORMAL', '/meetings/3', 'Respond', true, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(1, 'SYSTEM_ANNOUNCEMENT', 'System Update', 'Your preferences have been updated successfully', 'LOW', null, null, true, DATE_SUB(NOW(), INTERVAL 3 HOUR)),

-- Older notifications
(1, 'DOCUMENT_SHARED', 'Document Shared', 'New document "Q3 Report.pdf" has been shared with you', 'NORMAL', '/documents/1', 'View Document', false, DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(1, 'USER_MENTION', 'You were mentioned', 'John Smith mentioned you in a comment on "Project Alpha"', 'NORMAL', '/meetings/4', 'View Comment', false, DATE_SUB(NOW(), INTERVAL 8 HOUR)),
(1, 'MEETING_UPDATED', 'Meeting Updated', 'The meeting "Sprint Planning" has been rescheduled to next Tuesday', 'NORMAL', '/meetings/5', 'View Changes', true, DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(1, 'WEEKLY_DIGEST', 'Weekly Summary', 'Your weekly meeting summary is ready for review', 'LOW', '/reports/weekly', 'View Report', true, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 'MEETING_CANCELLED', 'Meeting Cancelled', 'The meeting "Client Demo" scheduled for tomorrow has been cancelled', 'NORMAL', '/meetings/6', 'View Details', true, DATE_SUB(NOW(), INTERVAL 2 DAY));

-- Notifications for user 2 (Admin User) as well
INSERT INTO notifications (user_id, type, title, message, priority, action_url, action_text, is_read, created_at) VALUES
(2, 'SYSTEM_ANNOUNCEMENT', 'System Maintenance', 'Scheduled maintenance will occur this weekend', 'HIGH', '/admin/maintenance', 'View Schedule', false, DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
(2, 'ACTION_ITEM_ASSIGNED', 'New Action Item', 'You have been assigned: "Prepare Q4 budget proposal"', 'NORMAL', '/action-items/2', 'View Task', false, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(2, 'MEETING_REMINDER', 'Board Meeting Reminder', 'Board meeting starts in 30 minutes', 'URGENT', '/meetings/7', 'Join Meeting', false, DATE_SUB(NOW(), INTERVAL 5 MINUTE));

SELECT 'Notification test data seeded successfully' as status;