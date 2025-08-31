# Meeting Manager - Product Specification

## Overview

The Meeting Manager is a modern, enterprise-grade meeting management application designed for comprehensive meeting lifecycle management. Built with Angular 17+ frontend and Spring Boot 3.x backend, it provides professional meeting management capabilities with AI-powered features and external system integrations.

## System Architecture

### Core Components

```
┌─────────────────┐    ┌──────────────────────┐    ┌─────────────────┐
│ Meeting Manager │───▶│ Calendar Integration │───▶│ External        │
│ Frontend        │    │ (Microsoft Graph)    │    │ Workflows       │
├─────────────────┤    └──────────────────────┘    ├─────────────────┤
│ • Angular 17+   │                                │ • n8n Webhooks  │
│ • Material UI   │    ┌──────────────────────┐    │ • AI Processing │
│ • PWA Ready     │───▶│ Spring Boot Backend  │───▶│ • Cloud Storage │
└─────────────────┘    │ (Java 17+)          │    └─────────────────┘
                       └──────────────────────┘
                                  │
                                  ▼
                       ┌──────────────────────┐
                       │ Database Layer       │
                       │ • MySQL (structured) │
                       │ • MongoDB (documents)│
                       └──────────────────────┘
```

## 1. Microsoft Calendar Integration

**Feature:** Professional Outlook calendar integration with OAuth2 authentication

### Purpose
Seamless integration with Microsoft Outlook calendars for automatic meeting synchronization and enhanced productivity.

### Technical Implementation

#### 1.1 OAuth2 Authentication Flow
- **Provider:** Microsoft Graph API
- **Authentication:** OAuth2 with PKCE flow
- **Scope:** Calendar.ReadWrite, User.Read
- **Token Storage:** Secure database storage with 5000-character capacity

#### 1.2 Settings Integration
- **Location:** Professional Calendar Integration tab in Settings
- **Features:** Connect/disconnect, status monitoring, error handling
- **UI Design:** Material Design with professional styling

#### 1.3 Database Schema Enhancement
```sql
-- Enhanced User entity with calendar integration
ALTER TABLE users 
MODIFY COLUMN graph_access_token VARCHAR(5000),
MODIFY COLUMN graph_refresh_token VARCHAR(5000);
```

### Integration Features
- ✅ **Microsoft Graph OAuth2**: Production-ready authorization flow
- ✅ **Settings UI**: Professional calendar management interface
- ✅ **Token Management**: Secure storage with enhanced field sizes
- ✅ **Real-time Status**: Connection monitoring with user verification
- ✅ **Error Handling**: Graceful authentication failure management
}
```

## 2. Task Manager Workflow

**Workflow ID:** `ix42N3IgLbnIQlCg`

### Purpose
Processes action items extracted from meetings, creates task records in Airtable, and sends assignment notifications.

### Key Features
- **Batch Processing:** Handles multiple action items from single meeting
- **Date Intelligence:** Converts relative dates ("this week", "Friday") to specific dates
- **Priority Assessment:** Automatically infers task priority from context
- **Email Notifications:** Sends assignment emails to task owners
- **Unassigned Handling:** Routes unassigned tasks to specified email

### Airtable Schema
```json
{
  "Email": "assignee@company.com",
  "DateAssigned": "2025-01-15T10:00:00Z",
  "Description": "Task description",
  "DateDue": "2025-01-19T00:00:00Z", 
  "Status": "new|in progress|completed|rejected",
  "Priority": "critical|high|medium|low"
}
```

### AI Processing Logic
- **Owner Matching:** Maps task owners to attendee email addresses
- **Deadline Parsing:** Contextual date conversion based on meeting date
- **Status Management:** Defaults to "new" with override capability
- **Validation:** Ensures all required fields are populated

## 3. Contact Manager Workflow  

**Workflow ID:** `viVKauxWYSycliGZ`

### Purpose
Manages contact information extracted from meetings, creates/updates contact records, and maintains CRM data.

### Contact Sources
- **Meeting Attendees:** Internal and external participants
- **Referenced Contacts:** People mentioned in meeting content
- **Stakeholders:** External parties relevant to discussed topics

### Required Fields
- FirstName (required)
- LastName (required)  
- Email (required)

### Optional Fields
- Phone, Company, Role, Address1, Address2, City, State, Zip
- Source, LastMeeting, LastMeetingType

### Processing Features
- **Duplicate Prevention:** Email-based deduplication
- **Batch Creation:** Processes multiple contacts simultaneously
- **Source Tracking:** Maintains record of meeting source
- **Notification System:** Emails for new contact creation

## 4. Schedule Manager Workflow

**Workflow ID:** `eM8m1R0x15nqqpug`

### Purpose
Processes follow-up meetings identified in meeting analysis and creates calendar events.

### Event Processing
- **Scheduled Meetings:** Creates calendar events for meetings with specific dates/times
- **Needs Scheduling:** Identifies meetings requiring coordination
- **Attendee Management:** Includes relevant participants based on meeting context

### Calendar Integration
- **Google Calendar:** Primary calendar system
- **Event Notifications:** Automatic invitations to attendees
- **Meeting Types:** Supports various meeting categories

## 5. Input Trigger Workflows

### 5.1 Google Drive Monitor
**Workflow ID:** `4iciHs1M2tbCJPEs`

#### Features
- **Folder Monitoring:** Watches designated Google Drive folder
- **File Processing:** Downloads and extracts text content
- **Format Support:** Markdown files (.md) with extensibility for other formats
- **File Management:** Moves processed files to appropriate folders (Processed/Failed)

#### Processing Flow
```
Google Drive Trigger → HTTP Request Download → Extract Text Content → Meeting Notes Manager
```

### 5.2 Email Monitor  
**Workflow ID:** `U3VLnwhz3R2cqrp4`

#### Features
- **Inbox Monitoring:** Watches for unread emails
- **Content Extraction:** Processes email body text
- **Label Management:** Applies processing status labels
- **Automated Filing:** Removes processed emails from inbox

## 6. Executive Assistant Interface

**Workflow ID:** `ADFlgFKpj1zFrrDb`

### Purpose
Provides conversational interface for querying and managing the system through natural language commands.

### Capabilities
- **Task Queries:** Search and filter tasks
- **Contact Lookup:** Find contact information
- **Meeting Scheduling:** Create calendar events
- **System Integration:** Access to all sub-workflow functions

### Chat Interface
- **Memory Management:** Maintains conversation context
- **Tool Integration:** Direct access to all manager workflows
- **Natural Language:** Processes commands in plain English

## Technical Specifications

### AI Model Configuration
- **Provider:** Anthropic Claude
- **Model:** claude-sonnet-4-20250514
- **Max Tokens:** 8192 (recommended for complex meetings)
- **Temperature:** Default (balanced creativity/consistency)

### Database Integration
- **Primary Storage:** Airtable
- **Tables:** Tasks, Contacts, Debug logs
- **API Integration:** REST API with OAuth2 authentication

### Email System
- **Provider:** Gmail
- **Authentication:** OAuth2
- **Capabilities:** Send notifications, monitor inbox, label management

### Error Handling
- **Graceful Degradation:** System continues operating with partial failures
- **Debug Logging:** Comprehensive error tracking and debugging
- **Retry Mechanisms:** Automatic retry for transient failures

## Data Flow Examples

### Example 1: Complete Meeting Processing
```
1. Meeting file uploaded to Google Drive
2. Trigger detects new file
3. HTTP Request downloads content
4. Meeting Notes Manager analyzes content
5. Extracts: 9 action items, 5 attendees, 2 external contacts, 5 follow-up meetings
6. Routes to appropriate managers:
   - Task Manager: Creates 9 tasks, sends 9 notification emails
   - Contact Manager: Creates/updates 7 contact records
   - Schedule Manager: Creates 3 calendar events, identifies 2 for manual scheduling
```

### Example 2: Email-based Processing
```
1. Meeting summary email received
2. Email Monitor extracts content
3. Processes through Meeting Notes Manager
4. Routes extracted information to sub-workflows
5. Applies email labels and removes from inbox
```

## Configuration Requirements

### Credentials Needed
- **Google Drive OAuth2:** File access and management
- **Gmail OAuth2:** Email processing and notifications  
- **Google Calendar OAuth2:** Event creation and management
- **Anthropic API Key:** Claude AI processing
- **Airtable API Token:** Database operations

### Webhook Configuration
- **Executive Assistant:** Public webhook for chat interface
- **Trigger Workflows:** Internal webhook connections

## Performance Characteristics

### Processing Capacity
- **Meeting Length:** Handles meetings up to ~5000 words
- **Action Items:** Processes 10-15 action items per meeting typically
- **Response Time:** 30-60 seconds for complete processing
- **Concurrency:** Parallel processing of contacts, tasks, and calendar items

### Scalability Considerations
- **Token Limits:** Claude API rate limiting for large meetings
- **Airtable Limits:** API rate limits for bulk operations
- **File Size:** Text extraction limits for very large documents

## Security & Privacy

### Data Handling
- **In-Transit:** All API communications encrypted (HTTPS/TLS)
- **At-Rest:** Data stored in respective service providers (Airtable, Google)
- **Access Control:** OAuth2 authentication for all integrations

### Privacy Considerations
- **Meeting Content:** Processed by Anthropic Claude (review data policies)
- **Contact Information:** Stored in Airtable with access controls
- **Email Content:** Processed through Gmail with appropriate permissions

## Future Enhancements

### Planned Features
- **Multi-Format Support:** PDF, Word document processing
- **Advanced Calendar Integration:** Conflict detection, smart scheduling
- **Reporting Dashboard:** Analytics on meeting patterns, task completion
- **Integration Expansion:** Slack, Microsoft Teams, Zoom

### Extensibility
- **Custom Workflows:** Template for adding new input sources  
- **AI Model Flexibility:** Configurable for different AI providers
- **Database Options:** Extensible beyond Airtable to other systems