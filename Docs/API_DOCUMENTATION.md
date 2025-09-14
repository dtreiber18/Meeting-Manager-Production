# Meeting Manager API Documentation

## 🌐 API Overview

The Meeting Manager backend provides a RESTful API built with Spring Boot 3.x, serving meeting data with full CRUD operations and advanced filtering capabilities.

## 🔧 Base Configuration

### Server Details
- **Base URL**: `http://localhost:8080/api`
- **Framework**: Spring Boot 3.2.8
- **Java Version**: 17
- **Database**: MySQL 8.0 + MongoDB
- **CORS**: Configured for development with wildcard origins

### Environment Setup
```yaml
# application.yml
server:
  servlet:
    context-path: /api
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/meeting_manager
    username: meetingmanager
    password: password
```

## 📋 API Endpoints

### Meetings API

#### Get All Meetings
```http
GET /api/meetings
```

**Response**: Array of Meeting objects with full details

**Example Response**:
```json
[
  {
    "id": "1",
    "subject": "Quarterly Planning Meeting",
    "date": "2024-01-15",
    "time": "10:00 AM",
    "summary": "Strategic planning session for Q1 objectives",
    "details": "Comprehensive review of quarterly goals...",
    "type": "internal-strategic",
    "participants": [
      {
        "id": "1",
        "name": "John Smith",
        "email": "john.smith@company.com",
        "attended": true
      }
    ],
    "actionItems": [
      {
        "id": "1",
        "description": "Finalize budget allocation",
        "assignedTo": "John Smith",
        "dueDate": "2024-01-22",
        "priority": "high",
        "status": "pending"
      }
    ],
    "nextSteps": [
      "Schedule follow-up meetings",
      "Distribute meeting notes"
    ],
    "recordingUrl": null
  }
]
```

#### Get Meeting by ID
```http
GET /api/meetings/{id}
```

**Parameters**:
- `id` (path): Meeting ID

**Response**: Single Meeting object

#### Create New Meeting
```http
POST /api/meetings
Content-Type: application/json
```

**Request Body**: Meeting object (without ID)

#### Update Meeting
```http
PUT /api/meetings/{id}
Content-Type: application/json
```

**Request Body**: Complete Meeting object

#### Delete Meeting
```http
DELETE /api/meetings/{id}
```

### Action Items API

#### Get All Action Items
```http
GET /api/action-items
```

**Query Parameters**:
- `page` (integer): Page number (default: 0)
- `size` (integer): Page size (default: 10)
- `sortBy` (string): Sort field (default: dueDate)
- `sortDir` (string): Sort direction (asc/desc, default: asc)
- `status` (string): Filter by status (OPEN, IN_PROGRESS, BLOCKED, COMPLETED, CANCELLED)
- `priority` (string): Filter by priority (LOW, MEDIUM, HIGH, URGENT)
- `assigneeId` (integer): Filter by assignee user ID
- `overdue` (boolean): Filter overdue items only
- `completed` (boolean): Filter by completion status
- `search` (string): Search in title, description, and notes

**Example Response**:
```json
{
  "content": [
    {
      "id": 1,
      "title": "Draft Q3 OKRs",
      "description": "Create and draft Q3 objectives and key results",
      "status": "OPEN",
      "priority": "HIGH",
      "type": "TASK",
      "dueDate": "2025-08-10T17:00:00",
      "startDate": null,
      "completedAt": null,
      "completed": false,
      "isRecurring": false,
      "recurringPattern": null,
      "estimatedHours": null,
      "actualHours": null,
      "notes": null,
      "completionNotes": null,
      "tags": null,
      "createdAt": "2025-09-03T18:32:39.952427",
      "updatedAt": "2025-09-03T18:32:39.952431",
      "lastReminderSent": null,
      "assignee": null,
      "reporter": null,
      "organization": {
        "id": 1,
        "name": "Sample Company"
      },
      "subTasks": [],
      "parentActionItem": null,
      "progressPercentage": 0,
      "assignedTo": null,
      "overdue": true
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    }
  },
  "totalElements": 4,
  "totalPages": 1,
  "last": true,
  "numberOfElements": 4,
  "first": true,
  "size": 10,
  "number": 0
}
```

#### Get Action Item by ID
```http
GET /api/action-items/{id}
```

**Parameters**:
- `id` (path): Action item ID

**Response**: Single ActionItem object

#### Create New Action Item
```http
POST /api/action-items
Content-Type: application/json
```

**Query Parameters**:
- `assigneeId` (integer): User ID to assign the action item to (optional)
- `reporterId` (integer): User ID of the reporter (optional)

**Request Body**:
```json
{
  "title": "Complete quarterly report",
  "description": "Prepare and submit Q3 quarterly business report",
  "priority": "HIGH",
  "type": "TASK",
  "dueDate": "2025-09-30T17:00:00",
  "estimatedHours": 8,
  "notes": "Include all department metrics",
  "tags": "quarterly,report,business"
}
```

#### Update Action Item
```http
PUT /api/action-items/{id}
Content-Type: application/json
```

**Request Body**: Complete ActionItem object

#### Mark Action Item as Completed
```http
PATCH /api/action-items/{id}/complete
Content-Type: application/json
```

**Request Body**:
```json
{
  "completionNotes": "Successfully completed all quarterly objectives"
}
```

#### Mark Action Item as In Progress
```http
PATCH /api/action-items/{id}/in-progress
```

#### Delete Action Item
```http
DELETE /api/action-items/{id}
```

#### Get Action Items by Assignee
```http
GET /api/action-items/assignee/{assigneeId}
```

**Query Parameters**: Same pagination and sorting options as GET /api/action-items

#### Get Action Items by Reporter
```http
GET /api/action-items/reporter/{reporterId}
```

#### Get Overdue Action Items
```http
GET /api/action-items/overdue
```

#### Get Action Items Due Soon
```http
GET /api/action-items/due-soon
```

**Query Parameters**:
- `days` (integer): Number of days to look ahead (default: 7)

#### Search Action Items
```http
GET /api/action-items/search
```

**Query Parameters**:
- `q` (string): Search query for title, description, or notes
- Standard pagination and sorting parameters

#### Get Action Items by Status
```http
GET /api/action-items/status/{status}
```

**Path Parameters**:
- `status`: OPEN, IN_PROGRESS, BLOCKED, COMPLETED, CANCELLED

#### Get Action Items by Priority
```http
GET /api/action-items/priority/{priority}
```

**Path Parameters**:
- `priority`: LOW, MEDIUM, HIGH, URGENT

#### Add Subtask to Action Item
```http
POST /api/action-items/{id}/subtasks
Content-Type: application/json
```

**Query Parameters**:
- `assigneeId` (integer): User ID to assign the subtask to (optional)

**Request Body**: ActionItem object for the subtask

#### Get Action Item Statistics
```http
GET /api/action-items/statistics/{userId}
```

**Response**:
```json
{
  "total": 15,
  "completed": 8,
  "overdue": 3,
  "dueSoon": 2,
  "inProgress": 4,
  "completionRate": 53.33
}
```

### Documents API

#### Upload Document
```http
POST /api/documents/upload
Content-Type: multipart/form-data
Authorization: Bearer {jwt-token}
```

**Form Data Parameters**:
- `file` (file): The document file to upload
- `title` (string): Document title (required)
- `description` (string): Document description (optional)
- `documentType` (string): Document type (AGENDA, MINUTES, PRESENTATION, HANDOUT, ATTACHMENT, OTHER)
- `storageProvider` (string): Storage provider (ONEDRIVE, GOOGLEDRIVE, LOCAL)
- `accessPermissions` (string): Access level (PUBLIC, PRIVATE, RESTRICTED)
- `meetingId` (integer): Associated meeting ID (optional)
- `tags` (string): Comma-separated tags (optional)

**Example Response**:
```json
{
  "id": 1,
  "title": "Q1 Planning Agenda",
  "description": "Quarterly planning meeting agenda",
  "fileName": "q1-agenda.pdf",
  "fileSize": 245760,
  "mimeType": "application/pdf",
  "documentType": "AGENDA",
  "storageProvider": "ONEDRIVE",
  "cloudFileId": "b!abc123...",
  "accessPermissions": "PRIVATE",
  "meetingId": 5,
  "createdBy": "user@example.com",
  "createdAt": "2025-08-14T10:30:00Z",
  "tags": ["planning", "q1", "agenda"],
  "aiIndexed": false
}
```

#### Get All Documents
```http
GET /api/documents
Authorization: Bearer {jwt-token}
```

**Query Parameters**:
- `page` (integer): Page number (default: 0)
- `size` (integer): Page size (default: 20)
- `sortBy` (string): Sort field (default: createdAt)
- `sortDir` (string): Sort direction (asc/desc, default: desc)

#### Get Document by ID
```http
GET /api/documents/{id}
Authorization: Bearer {jwt-token}
```

#### Get Documents by Meeting
```http
GET /api/documents/meeting/{meetingId}
Authorization: Bearer {jwt-token}
```

#### Search Documents
```http
GET /api/documents/search
Authorization: Bearer {jwt-token}
```

**Query Parameters**:
- `query` (string): Search term for title, description, or content
- `type` (string): Filter by document type
- `provider` (string): Filter by storage provider
- `tags` (string): Filter by tags (comma-separated)
- `meetingId` (integer): Filter by meeting association
- `startDate` (string): Filter by creation date (ISO format)
- `endDate` (string): Filter by creation date (ISO format)

**Example Response**:
```json
{
  "content": [
    {
      "id": 1,
      "title": "Q1 Planning Agenda",
      "description": "Quarterly planning meeting agenda",
      "documentType": "AGENDA",
      "storageProvider": "ONEDRIVE",
      "meetingId": 5,
      "createdAt": "2025-08-14T10:30:00Z",
      "tags": ["planning", "q1", "agenda"]
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "size": 20,
  "number": 0
}
```

#### Download Document
```http
GET /api/documents/{id}/download
Authorization: Bearer {jwt-token}
```

**Response**: Binary file data with appropriate Content-Type header

#### Update Document Metadata
```http
PUT /api/documents/{id}
Content-Type: application/json
Authorization: Bearer {jwt-token}
```

**Request Body**:
```json
{
  "title": "Updated Document Title",
  "description": "Updated description",
  "documentType": "MINUTES",
  "accessPermissions": "PUBLIC",
  "tags": ["updated", "tags"]
}
```

#### Delete Document
```http
DELETE /api/documents/{id}
Authorization: Bearer {jwt-token}
```

## 📊 Data Models

### Meeting Entity
```typescript
interface Meeting {
  id: string;
  subject: string;
  title?: string;
  date: string;
  time?: string;
  summary?: string;
  details?: string;
  type: string;
  participants: Participant[];
  actionItems: ActionItem[];
  nextSteps: string[];
  isJustCompleted?: boolean;
  recordingUrl?: string;
}
```

### Participant Entity
```typescript
interface Participant {
  id: string;
  name: string;
  email: string;
  attended?: boolean;
}
```

### ActionItem Entity
```typescript
interface ActionItem {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  priority?: 'high' | 'medium' | 'low';
  status?: 'pending' | 'in-progress' | 'completed';
}
```

### ActionItem Entity
```typescript
interface ActionItem {
  id: number;
  title: string;
  description?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  type: 'TASK' | 'FOLLOW_UP' | 'DECISION' | 'RESEARCH' | 'APPROVAL' | 'DOCUMENTATION' | 'MEETING';
  dueDate?: string;
  startDate?: string;
  completedAt?: string;
  completed: boolean;
  isRecurring: boolean;
  recurringPattern?: string;
  estimatedHours?: number;
  actualHours?: number;
  notes?: string;
  completionNotes?: string;
  tags?: string;
  createdAt: string;
  updatedAt: string;
  lastReminderSent?: string;
  assignee?: User;
  reporter?: User;
  organization?: Organization;
  subTasks: ActionItem[];
  parentActionItem?: ActionItem;
  progressPercentage: number;
  assignedTo?: string;
  overdue: boolean;
}
```

### Document
```typescript
interface Document {
  id?: number;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  fileType: string;
  description?: string;
  tags?: string[];
  uploadDate: string;
  storageType: 'onedrive' | 'googledrive';
  storageId: string;
  storagePath: string;
  meetingId?: number;
  isPublic: boolean;
  aiProcessed: boolean;
  aiMetadata?: {
    extractedText?: string;
    summary?: string;
    keywords?: string[];
    documentType?: string;
    confidence?: number;
  };
  createdAt: string;
  updatedAt: string;
}
```

## 🗄 Database Schema

### MySQL Tables

#### meetings
```sql
CREATE TABLE meetings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  subject VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  date DATE NOT NULL,
  time VARCHAR(50),
  summary TEXT,
  details TEXT,
  type VARCHAR(100) NOT NULL,
  next_steps JSON,
  is_just_completed BOOLEAN DEFAULT FALSE,
  recording_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### participants
```sql
CREATE TABLE participants (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  attended BOOLEAN DEFAULT FALSE,
  meeting_id BIGINT,
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
);
```

#### action_items
```sql
CREATE TABLE action_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  description TEXT NOT NULL,
  assigned_to VARCHAR(255) NOT NULL,
  due_date DATE NOT NULL,
  priority ENUM('high', 'medium', 'low') DEFAULT 'medium',
  status ENUM('pending', 'in-progress', 'completed') DEFAULT 'pending',
  meeting_id BIGINT,
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
);
```

#### documents
```sql
CREATE TABLE documents (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  original_file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  description TEXT,
  tags JSON,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  storage_type ENUM('onedrive', 'googledrive') NOT NULL,
  storage_id VARCHAR(500) NOT NULL,
  storage_path VARCHAR(1000) NOT NULL,
  meeting_id BIGINT,
  is_public BOOLEAN DEFAULT FALSE,
  ai_processed BOOLEAN DEFAULT FALSE,
  ai_metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE SET NULL
);
```

## 🔒 Security Configuration

### CORS Setup
```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOriginPatterns("*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .exposedHeaders("*")
                        .allowCredentials(false)
                        .maxAge(3600);
            }
        };
    }
}
```

### Security Configuration
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/**").permitAll()
                .anyRequest().authenticated()
            );
        return http.build();
    }
}
```

## 📝 Sample Data

### Seeded Meetings
The application includes a DataSeeder that creates 3 sample meetings:

1. **Quarterly Planning Meeting**
   - Type: internal-strategic
   - Participants: 5
   - Action Items: 3

2. **Product Launch Review**
   - Type: external-client
   - Participants: 4
   - Action Items: 4

3. **Team Retrospective**
   - Type: internal-team
   - Participants: 6
   - Action Items: 2

## 🧪 Testing the API

### Using cURL
```bash
# Get all meetings
curl -X GET http://localhost:8080/api/meetings

# Get specific meeting
curl -X GET http://localhost:8080/api/meetings/1

# Create new meeting
curl -X POST http://localhost:8080/api/meetings \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "New Meeting",
    "date": "2024-01-20",
    "time": "2:00 PM",
    "type": "internal-team",
    "participants": [],
    "actionItems": [],
    "nextSteps": []
  }'
```

### Using HTTPie
```bash
# Get all meetings
http GET localhost:8080/api/meetings

# Create new meeting
http POST localhost:8080/api/meetings \
  subject="New Meeting" \
  date="2024-01-20" \
  type="internal-team"
```

## 🔍 Error Handling

### Standard HTTP Status Codes
- **200 OK**: Successful GET, PUT requests
- **201 Created**: Successful POST requests
- **204 No Content**: Successful DELETE requests
- **400 Bad Request**: Invalid request data
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side errors

### Error Response Format
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid meeting data",
  "path": "/api/meetings"
}
```

## 📈 Performance Considerations

### Database Optimization
- **Indexes** on frequently queried fields (date, type, participant names)
- **Connection pooling** with HikariCP
- **Lazy loading** for related entities
- **Query optimization** for complex filtering

### Caching Strategy
- **Application-level caching** for frequently accessed meetings
- **Database query caching** for repeated filter operations
- **CDN integration** for static assets and recordings

## 🚀 Deployment

### Docker Configuration
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/meeting-manager-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### Environment Variables
```bash
SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/meeting_manager
SPRING_DATASOURCE_USERNAME=meetingmanager
SPRING_DATASOURCE_PASSWORD=password
SPRING_DATA_MONGODB_URI=mongodb://mongodb:27017/meeting_manager
```

---

**✅ Status**: Fully implemented and production-ready  
**🔗 Frontend Integration**: Compatible with Angular Previous Meetings component  
**📊 Data**: MySQL for relational data, MongoDB ready for document storage  
**🛡 Security**: CORS-enabled for development, production-ready security configuration
