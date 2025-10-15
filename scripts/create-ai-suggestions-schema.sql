-- AI Suggestions Table
-- Stores AI-generated action item suggestions for meetings
-- This replaces the mock data generation with persistent storage

CREATE TABLE IF NOT EXISTS ai_suggestions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    meeting_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    suggested_assignee VARCHAR(255),
    estimated_hours DECIMAL(5,2),
    reasoning TEXT NOT NULL,
    target_system VARCHAR(50), -- 'zoho', 'clickup', null
    status ENUM('PENDING', 'ACCEPTED', 'DISMISSED', 'SENT') NOT NULL DEFAULT 'PENDING',
    accepted_at TIMESTAMP NULL DEFAULT NULL,
    dismissed_at TIMESTAMP NULL DEFAULT NULL,
    sent_at TIMESTAMP NULL DEFAULT NULL,
    sent_to_system VARCHAR(50), -- System it was actually sent to
    external_id VARCHAR(255), -- ID in external system (Zoho/ClickUp)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by_user_id BIGINT,

    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_meeting_id (meeting_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_target_system (target_system),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comments to table and columns for documentation
ALTER TABLE ai_suggestions
  COMMENT = 'Stores AI-generated action item suggestions for meetings';

-- Sample data for testing (optional - remove for production)
-- INSERT INTO ai_suggestions (meeting_id, title, description, priority, suggested_assignee, estimated_hours, reasoning, status)
-- VALUES
--   (1, 'Review Q4 Financial Report', 'Analyze Q4 financial performance and prepare summary for board meeting', 'HIGH', 'john.doe@company.com', 3.5, 'Based on discussion about Q4 results and upcoming board presentation', 'PENDING'),
--   (1, 'Schedule client demo', 'Coordinate with sales team to schedule product demo for Enterprise client', 'URGENT', 'sarah.smith@company.com', 2.0, 'Client expressed interest during meeting and requested immediate follow-up', 'PENDING');
