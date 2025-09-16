-- Help System Seed Data
-- This script populates the help system with comprehensive content

-- Additional Help Articles
INSERT IGNORE INTO help_articles (title, slug, content, summary, category, author, published, featured, display_order) VALUES 

('Managing Meeting Participants', 'managing-participants',
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
</ul>
<h3>Managing During Meetings</h3>
<p>During active meetings, you can:</p>
<ul>
<li>Mute/unmute participants</li>
<li>Manage speaking permissions</li>
<li>Remove disruptive participants</li>
<li>Promote attendees to presenter role</li>
</ul>',
'Learn how to add, manage, and assign roles to meeting participants.',
'User Guide', 'system', TRUE, FALSE, 2),

('Setting Up Calendar Integration', 'calendar-integration',
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
</ol>
<h3>Sync Features</h3>
<ul>
<li><strong>Two-way sync:</strong> Meetings appear in both systems</li>
<li><strong>Automatic updates:</strong> Changes sync across platforms</li>
<li><strong>Conflict detection:</strong> Alerts for scheduling conflicts</li>
<li><strong>Meeting links:</strong> Join links automatically added</li>
</ul>
<h3>Troubleshooting</h3>
<p>If sync issues occur:</p>
<ol>
<li>Check your internet connection</li>
<li>Verify calendar permissions</li>
<li>Re-authenticate your account</li>
<li>Contact support if problems persist</li>
</ol>',
'Step-by-step guide to integrate Meeting Manager with your calendar applications.',
'User Guide', 'system', TRUE, TRUE, 3),

('Using AI-Powered Features', 'ai-features',
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
<li><strong>Follow-up suggestions:</strong> Recommended next steps</li>
</ul>
<h3>Meeting Analytics</h3>
<ul>
<li><strong>Participation metrics:</strong> Speaking time and engagement</li>
<li><strong>Sentiment analysis:</strong> Overall meeting tone</li>
<li><strong>Topic analysis:</strong> Main discussion themes</li>
<li><strong>Efficiency scores:</strong> Meeting productivity ratings</li>
</ul>
<h3>Chat Assistant</h3>
<p>Use the AI chat assistant to:</p>
<ul>
<li>Get quick answers about Meeting Manager features</li>
<li>Generate meeting agendas</li>
<li>Find relevant documents</li>
<li>Schedule follow-up meetings</li>
</ul>',
'Discover how AI enhances your meetings with transcription, smart notes, and analytics.',
'AI Features', 'system', TRUE, TRUE, 4),

('Troubleshooting Common Issues', 'troubleshooting',
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
<h4>Poor Audio Quality</h4>
<ul>
<li>Check internet connection speed</li>
<li>Move closer to WiFi router</li>
<li>Close other applications using bandwidth</li>
<li>Use wired headphones instead of speakers</li>
</ul>
<h3>Connection Problems</h3>
<h4>Cannot Join Meeting</h4>
<ol>
<li>Verify meeting link is correct</li>
<li>Check if meeting has started</li>
<li>Clear browser cache and cookies</li>
<li>Try incognito/private browsing mode</li>
</ol>
<h4>Frequent Disconnections</h4>
<ul>
<li>Check network stability</li>
<li>Switch to mobile data temporarily</li>
<li>Restart router/modem</li>
<li>Contact IT support for network issues</li>
</ul>
<h3>Feature Not Working</h3>
<h4>Screen Sharing Issues</h4>
<ol>
<li>Grant screen sharing permissions</li>
<li>Try sharing specific application window</li>
<li>Update browser to latest version</li>
<li>Check if popup blockers are interfering</li>
</ol>
<h4>Calendar Sync Problems</h4>
<ul>
<li>Re-authenticate calendar connection</li>
<li>Check calendar permissions</li>
<li>Verify sync settings are enabled</li>
<li>Wait 5-10 minutes for sync to complete</li>
</ul>',
'Find solutions to common technical issues and connectivity problems.',
'Troubleshooting', 'system', TRUE, FALSE, 5);

-- Additional FAQs
INSERT IGNORE INTO help_faqs (question, answer, category, author, published, featured, display_order) VALUES 

('What browsers are supported?', 
'Meeting Manager works best on Chrome, Firefox, Safari, and Edge (latest versions). For optimal performance, we recommend Chrome or Firefox with hardware acceleration enabled.',
'Technical', 'system', TRUE, FALSE, 4),

('How many participants can join a meeting?', 
'Meeting capacity depends on your plan: Starter (up to 10), Professional (up to 50), Enterprise (up to 500). Contact sales for larger meeting requirements.',
'Meetings', 'system', TRUE, FALSE, 5),

('Is my data secure and private?', 
'Yes, we use enterprise-grade security including end-to-end encryption, SOC 2 compliance, and GDPR compliance. All data is encrypted at rest and in transit.',
'Security', 'system', TRUE, TRUE, 6),

('Can I record meetings?', 
'Yes, meeting recording is available on Professional and Enterprise plans. Recordings are automatically saved to your account and can be shared with participants.',
'Meetings', 'system', TRUE, FALSE, 7),

('How do I export meeting data?', 
'You can export meeting notes, transcripts, and action items from the meeting details page. Go to Actions > Export and choose your preferred format (PDF, Word, CSV).',
'Data Export', 'system', TRUE, FALSE, 8),

('What mobile apps are available?', 
'Meeting Manager mobile apps are available for iOS and Android. Download from the App Store or Google Play. Mobile apps support joining meetings, viewing notes, and managing action items.',
'Mobile', 'system', TRUE, FALSE, 9),

('How do I set up SSO?', 
'Single Sign-On (SSO) is available for Enterprise customers. Contact your administrator or our support team to configure SAML, OIDC, or Active Directory integration.',
'Authentication', 'system', TRUE, FALSE, 10),

('Can I customize meeting templates?', 
'Yes, you can create custom meeting templates with predefined agendas, participant lists, and settings. Go to Settings > Meeting Templates to create and manage templates.',
'Customization', 'system', TRUE, FALSE, 11),

('What integrations are available?', 
'Meeting Manager integrates with Slack, Microsoft Teams, Jira, Asana, Trello, Salesforce, and many other tools. Check our integrations page for the complete list.',
'Integrations', 'system', TRUE, FALSE, 12),

('How do I contact support?', 
'Submit a support ticket through this help system, email support@meetingmanager.com, or use the live chat feature (available 24/7 for Enterprise customers).',
'Support', 'system', TRUE, TRUE, 13);

-- Sample support tickets for testing (these would normally be created by users)
INSERT IGNORE INTO support_tickets (subject, description, category, priority, status, user_id, user_email) VALUES 
('Cannot access calendar integration', 
'I am unable to connect my Google Calendar to Meeting Manager. When I click the connect button, nothing happens. I have tried different browsers but the issue persists.',
'Calendar', 'HIGH', 'OPEN', 'user123', 'john.doe@company.com'),

('Meeting recordings not saving', 
'My meeting recordings from yesterday are not appearing in my account. The recording indicator was active during the meeting, but I cannot find the files anywhere.',
'Meetings', 'MEDIUM', 'IN_PROGRESS', 'user456', 'jane.smith@company.com'),

('Feature request: Custom branding', 
'Our organization would like to add custom branding to our meeting rooms, including our logo and company colors. Is this possible with our current Enterprise plan?',
'Feature Request', 'LOW', 'OPEN', 'user789', 'admin@enterprise.com');