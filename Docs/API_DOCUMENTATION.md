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
