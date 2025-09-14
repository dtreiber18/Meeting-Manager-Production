-- Create notifications table
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data TEXT,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NULL,
    priority VARCHAR(20) DEFAULT 'NORMAL' NOT NULL,
    action_url VARCHAR(500) NULL,
    action_text VARCHAR(100) NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_user_unread (user_id, is_read),
    INDEX idx_created_at (created_at),
    INDEX idx_expires_at (expires_at),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample notifications for testing
INSERT INTO notifications (user_id, type, title, message, priority, action_url, action_text, is_read) VALUES
-- User 1 notifications
(1, 'MEETING_REMINDER', 'Meeting Reminder', 'Your meeting "Weekly Team Sync" starts in 15 minutes', 'HIGH', '/meetings/1', 'Join Meeting', false),
(1, 'ACTION_ITEM_DUE', 'Action Item Due Tomorrow', 'Action item "Update project documentation" is due tomorrow', 'NORMAL', '/meetings/2', 'View Details', false),
(1, 'MEETING_INVITATION', 'Meeting Invitation', 'You have been invited to "Q4 Planning Session" on Friday, 2:00 PM', 'NORMAL', '/meetings/3', 'Respond', true),
(1, 'SYSTEM_ANNOUNCEMENT', 'System Update', 'Your preferences have been updated successfully', 'LOW', null, null, false),
(1, 'DOCUMENT_SHARED', 'Document Shared', 'New document "Q3 Report.pdf" has been shared with you', 'NORMAL', '/documents/1', 'View Document', false);

-- Add a few more for demonstration
INSERT INTO notifications (user_id, type, title, message, priority, action_url, action_text, is_read, created_at) VALUES
(1, 'ACTION_ITEM_OVERDUE', 'Action Item Overdue', 'Action item "Review budget proposal" is now overdue', 'URGENT', '/action-items/1', 'View Item', false, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(1, 'USER_MENTION', 'You were mentioned', 'John Smith mentioned you in a comment on "Project Alpha"', 'NORMAL', '/meetings/4', 'View Comment', false, DATE_SUB(NOW(), INTERVAL 2 HOURS)),
(1, 'WEEKLY_DIGEST', 'Weekly Summary', 'Your weekly meeting summary is ready for review', 'LOW', '/reports/weekly', 'View Report', true, DATE_SUB(NOW(), INTERVAL 1 DAY));