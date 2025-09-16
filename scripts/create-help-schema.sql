-- Help System Database Schema Migration
-- This script creates tables for help articles, FAQs, and support tickets

-- Create help_articles table
CREATE TABLE help_articles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content LONGTEXT NOT NULL,
    summary TEXT,
    category VARCHAR(100) NOT NULL,
    tags VARCHAR(500),
    author VARCHAR(100) NOT NULL,
    published BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    view_count BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_help_articles_category (category),
    INDEX idx_help_articles_published (published),
    INDEX idx_help_articles_featured (featured),
    INDEX idx_help_articles_author (author),
    INDEX idx_help_articles_slug (slug),
    INDEX idx_help_articles_display_order (display_order),
    INDEX idx_help_articles_view_count (view_count),
    INDEX idx_help_articles_created_at (created_at),
    
    -- Full-text search indexes
    FULLTEXT INDEX ft_help_articles_title (title),
    FULLTEXT INDEX ft_help_articles_content (content),
    FULLTEXT INDEX ft_help_articles_title_content (title, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create help_faqs table
CREATE TABLE help_faqs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question VARCHAR(500) NOT NULL,
    answer LONGTEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    tags VARCHAR(500),
    author VARCHAR(100) NOT NULL,
    published BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    view_count BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_help_faqs_category (category),
    INDEX idx_help_faqs_published (published),
    INDEX idx_help_faqs_featured (featured),
    INDEX idx_help_faqs_author (author),
    INDEX idx_help_faqs_display_order (display_order),
    INDEX idx_help_faqs_view_count (view_count),
    INDEX idx_help_faqs_created_at (created_at),
    
    -- Full-text search indexes
    FULLTEXT INDEX ft_help_faqs_question (question),
    FULLTEXT INDEX ft_help_faqs_answer (answer),
    FULLTEXT INDEX ft_help_faqs_question_answer (question, answer)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create support_tickets table
CREATE TABLE support_tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    description LONGTEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    user_id VARCHAR(100) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    response LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    
    -- Indexes for performance
    INDEX idx_support_tickets_user_id (user_id),
    INDEX idx_support_tickets_user_email (user_email),
    INDEX idx_support_tickets_category (category),
    INDEX idx_support_tickets_priority (priority),
    INDEX idx_support_tickets_status (status),
    INDEX idx_support_tickets_created_at (created_at),
    INDEX idx_support_tickets_resolved_at (resolved_at),
    INDEX idx_support_tickets_user_status (user_id, status),
    
    -- Full-text search indexes
    FULLTEXT INDEX ft_support_tickets_subject (subject),
    FULLTEXT INDEX ft_support_tickets_description (description),
    FULLTEXT INDEX ft_support_tickets_subject_description (subject, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key constraints if user table exists
-- ALTER TABLE support_tickets ADD CONSTRAINT fk_support_tickets_user_id 
-- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create views for common queries
CREATE VIEW v_published_help_articles AS
SELECT 
    id, title, slug, content, summary, category, tags, author, 
    featured, display_order, view_count, created_at, updated_at
FROM help_articles 
WHERE published = TRUE
ORDER BY display_order ASC, created_at DESC;

CREATE VIEW v_published_help_faqs AS
SELECT 
    id, question, answer, category, tags, author,
    featured, display_order, view_count, created_at, updated_at
FROM help_faqs 
WHERE published = TRUE
ORDER BY display_order ASC, created_at DESC;

CREATE VIEW v_open_support_tickets AS
SELECT 
    id, subject, description, category, priority, status,
    user_id, user_email, created_at, updated_at
FROM support_tickets 
WHERE status IN ('OPEN', 'IN_PROGRESS')
ORDER BY 
    CASE priority 
        WHEN 'URGENT' THEN 1
        WHEN 'HIGH' THEN 2
        WHEN 'MEDIUM' THEN 3
        WHEN 'LOW' THEN 4
    END,
    created_at ASC;

-- Insert initial help categories
INSERT IGNORE INTO help_articles (title, slug, content, summary, category, author, published, featured, display_order) VALUES 
('Getting Started with Meeting Manager', 'getting-started', 
'<h2>Welcome to Meeting Manager</h2>
<p>Meeting Manager is a comprehensive platform for organizing, tracking, and managing your meetings effectively.</p>
<h3>Quick Start Guide</h3>
<ol>
<li><strong>Create Your First Meeting:</strong> Click the "+" button on the dashboard to schedule a new meeting.</li>
<li><strong>Invite Participants:</strong> Add team members by email or select from your organization.</li>
<li><strong>Set Agenda:</strong> Create agenda items to keep your meeting focused and productive.</li>
<li><strong>Track Action Items:</strong> Assign tasks and track progress after the meeting.</li>
</ol>
<h3>Key Features</h3>
<ul>
<li>Calendar integration with Outlook and Google Calendar</li>
<li>Real-time collaboration during meetings</li>
<li>Automated meeting notes and transcription</li>
<li>Action item tracking and follow-up</li>
<li>Document sharing and management</li>
</ul>', 
'Learn how to get started with Meeting Manager and schedule your first meeting.',
'Getting Started', 'system', TRUE, TRUE, 1);

INSERT IGNORE INTO help_faqs (question, answer, category, author, published, featured, display_order) VALUES 
('How do I schedule a meeting?', 
'To schedule a meeting: 1) Click the "+" button on your dashboard, 2) Fill in meeting details like title, date, and time, 3) Add participants by email, 4) Set the agenda items, 5) Click "Create Meeting" to send invitations.',
'Meetings', 'system', TRUE, TRUE, 1),

('Can I integrate with my existing calendar?', 
'Yes! Meeting Manager supports integration with Microsoft Outlook and Google Calendar. Go to Settings > Calendar Integration to connect your accounts.',
'Calendar', 'system', TRUE, TRUE, 2),

('How do I track action items?', 
'Action items are automatically created from meeting notes or can be manually added. Navigate to the Action Items section to view, assign, and track progress. You can set due dates, priorities, and receive notifications.',
'Action Items', 'system', TRUE, TRUE, 3);