-- Production Help System Seed Data
-- This script populates the help system with production-ready content matching the JPA entity structure

-- Clear existing data to avoid duplicates
DELETE FROM help_article_tags;
DELETE FROM help_articles;

-- Reset auto-increment
ALTER TABLE help_articles AUTO_INCREMENT = 1;

-- Insert production help articles
INSERT INTO help_articles (title, description, content, category, view_count, is_published, sort_order, created_by, created_at, updated_at) VALUES 

('Getting Started with Meeting Manager', 
'Complete guide to setting up and using Meeting Manager for the first time',
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
'getting-started', 0, TRUE, 1, 1, NOW(), NOW()),

('Managing Meeting Participants', 
'Learn how to add, manage, and assign roles to meeting participants',
'<h2>Managing Meeting Participants</h2>
<p>Effectively managing participants is crucial for successful meetings.</p>
<h3>Adding Participants</h3>
<p>You can add participants in several ways:</p>
<ul>
<li><strong>Email Address:</strong> Enter email addresses directly</li>
<li><strong>Organization Directory:</strong> Select from your company directory</li>
<li><strong>Meeting Groups:</strong> Add pre-defined groups of people</li>
</ul>
<h3>Participant Roles</h3>
<ul>
<li><strong>Organizer:</strong> Full control over meeting settings</li>
<li><strong>Presenter:</strong> Can share screen and present materials</li>
<li><strong>Attendee:</strong> Standard participant access</li>
<li><strong>Observer:</strong> View-only access</li>
</ul>',
'user-guide', 0, TRUE, 2, 1, NOW(), NOW()),

('Setting Up Calendar Integration', 
'Step-by-step guide to integrate Meeting Manager with your calendar applications',
'<h2>Calendar Integration Setup</h2>
<p>Connect Meeting Manager with your existing calendar systems for seamless scheduling.</p>
<h3>Supported Calendars</h3>
<ul>
<li>Microsoft Outlook (Office 365 and Outlook.com)</li>
<li>Google Calendar</li>
<li>Apple iCloud Calendar</li>
</ul>
<h3>Setup Process</h3>
<ol>
<li>Navigate to <strong>Settings > Calendar Integration</strong></li>
<li>Click "Connect" next to your calendar provider</li>
<li>Follow the authentication prompts</li>
<li>Select which calendars to sync</li>
<li>Choose sync frequency (real-time recommended)</li>
</ol>',
'user-guide', 0, TRUE, 3, 1, NOW(), NOW()),

('Using AI-Powered Features', 
'Discover how AI enhances your meetings with transcription, smart notes, and analytics',
'<h2>AI-Powered Meeting Features</h2>
<p>Meeting Manager includes advanced AI capabilities to enhance your meeting experience.</p>
<h3>Automated Transcription</h3>
<ul>
<li><strong>Real-time transcription:</strong> Live captions during meetings</li>
<li><strong>Multi-language support:</strong> Transcription in 40+ languages</li>
<li><strong>Speaker identification:</strong> Automatic speaker labeling</li>
<li><strong>Searchable transcripts:</strong> Find specific discussions quickly</li>
</ul>
<h3>Smart Meeting Notes</h3>
<ul>
<li><strong>Auto-generated summaries:</strong> Key points extracted automatically</li>
<li><strong>Action item detection:</strong> AI identifies tasks and assignments</li>
<li><strong>Decision tracking:</strong> Important decisions highlighted</li>
</ul>',
'ai-features', 0, TRUE, 4, 1, NOW(), NOW()),

('Troubleshooting Common Issues', 
'Find solutions to common technical issues and connectivity problems',
'<h2>Troubleshooting Guide</h2>
<p>Solutions to common problems you might encounter.</p>
<h3>Audio/Video Issues</h3>
<h4>No Audio or Video</h4>
<ol>
<li>Check device permissions in browser settings</li>
<li>Ensure microphone/camera are not muted</li>
<li>Try refreshing the browser</li>
<li>Test with different browser or device</li>
</ol>
<h3>Connection Problems</h3>
<h4>Cannot Join Meeting</h4>
<ol>
<li>Verify meeting link is correct</li>
<li>Check if meeting has started</li>
<li>Clear browser cache and cookies</li>
<li>Try incognito/private browsing mode</li>
</ol>',
'troubleshooting', 0, TRUE, 5, 1, NOW(), NOW());

-- Check if help_faqs table exists and insert data
SELECT 'Seeding FAQ data...' as '';

-- Clear and seed FAQ data
DELETE FROM help_faq_tags;
DELETE FROM help_faqs;
ALTER TABLE help_faqs AUTO_INCREMENT = 1;

INSERT INTO help_faqs (question, answer, category, view_count, is_published, sort_order, created_by, created_at, updated_at) VALUES 

('How do I schedule a meeting?', 
'To schedule a meeting: 1) Click the "+" button on your dashboard, 2) Fill in meeting details like title, date, and time, 3) Add participants by email, 4) Set the agenda items, 5) Click "Create Meeting" to send invitations.',
'Meetings', 0, TRUE, 1, 1, NOW(), NOW()),

('Can I integrate with my existing calendar?', 
'Yes! Meeting Manager supports integration with Microsoft Outlook and Google Calendar. Go to Settings > Calendar Integration to connect your accounts.',
'Calendar', 0, TRUE, 2, 1, NOW(), NOW()),

('How do I track action items?', 
'Action items are automatically created from meeting notes or can be manually added. Navigate to the Action Items section to view, assign, and track progress. You can set due dates, priorities, and receive notifications.',
'Action Items', 0, TRUE, 3, 1, NOW(), NOW()),

('What browsers are supported?', 
'Meeting Manager works best on Chrome, Firefox, Safari, and Edge (latest versions). For optimal performance, we recommend Chrome or Firefox with hardware acceleration enabled.',
'Technical', 0, TRUE, 4, 1, NOW(), NOW()),

('Is my data secure and private?', 
'Yes, we use enterprise-grade security including end-to-end encryption, SOC 2 compliance, and GDPR compliance. All data is encrypted at rest and in transit.',
'Security', 0, TRUE, 5, 1, NOW(), NOW());

SELECT 'Help system data seeded successfully!' as '';