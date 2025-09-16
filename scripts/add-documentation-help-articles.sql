-- Add comprehensive help articles based on project documentation
INSERT INTO help_articles (title, content, category, description, created_by, created_at, updated_at, is_published, view_count, sort_order) VALUES 

-- API Documentation Article
('Advanced API Documentation', 
'The Meeting Manager REST API provides comprehensive endpoints for managing meetings, action items, and documents with enterprise-grade features and security.

## API Overview

The Meeting Manager backend serves a RESTful API built on Spring Boot 3.x with MySQL and MongoDB integration. All endpoints follow REST conventions with proper HTTP status codes and JSON responses.

### Base URL
- Development: http://localhost:8080/api
- Production: https://your-domain.com/api

### Authentication
Most endpoints require JWT authentication. Include the Bearer token in the Authorization header:
```
Authorization: Bearer your-jwt-token
```

## Meeting Management

### Get All Meetings
**GET /api/meetings**

Returns paginated list of meetings with full participant and action item details.

### Meeting Creation
**POST /api/meetings**

Create new meetings with the following required fields:
- subject (string): Meeting title
- date (string): Meeting date in YYYY-MM-DD format
- type (string): Meeting type classification

### Action Items API

**GET /api/action-items**

Advanced filtering with query parameters:
- status: Filter by OPEN, IN_PROGRESS, COMPLETED, etc.
- priority: Filter by LOW, MEDIUM, HIGH, URGENT
- assigneeId: Filter by assigned user
- overdue: Boolean filter for overdue items
- search: Text search across title and description

**POST /api/action-items**

Create action items with optional assignee and reporter parameters.

### Document Management

**POST /api/documents/upload**

Multipart form upload supporting:
- Multiple file types (PDF, Word, images)
- Cloud storage integration (OneDrive, Google Drive)
- Access permission controls
- Meeting association
- Tag-based organization

**GET /api/documents/search**

Powerful search capabilities:
- Full-text content search
- Metadata filtering
- Date range queries
- Tag-based filtering

## Error Handling

The API returns standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

Error responses include detailed messages and timestamps for debugging.

## Rate Limiting

API endpoints are rate-limited to ensure system stability:
- Standard endpoints: 100 requests per minute
- Upload endpoints: 10 requests per minute
- Search endpoints: 50 requests per minute

## Best Practices

1. **Pagination**: Always use pagination for list endpoints
2. **Filtering**: Apply appropriate filters to reduce response size
3. **Caching**: Implement client-side caching for frequently accessed data
4. **Error Handling**: Always handle potential API errors gracefully
5. **Authentication**: Secure JWT token storage and renewal

For complete API reference including request/response examples, see the full API documentation.',
'technical', 
'Complete guide to the Meeting Manager REST API with endpoints, authentication, and best practices', 
1, NOW(), NOW(), 1, 0, 6),

-- Product Features Article
('Product Features and Capabilities', 
'Meeting Manager is an enterprise-grade application that transforms how organizations handle meeting management, from planning to follow-up execution.

## Core Features

### Meeting Lifecycle Management
Comprehensive meeting management from initial planning through post-meeting execution:

**Pre-Meeting**
- Calendar integration with Microsoft Outlook
- Automated meeting invitations
- Agenda creation and distribution
- Document upload and sharing
- Participant management

**During Meeting**
- Real-time note taking
- Action item tracking
- Recording integration
- Document access and sharing

**Post-Meeting**
- Automated meeting summaries
- Action item distribution
- Follow-up scheduling
- Progress tracking and reporting

### AI-Powered Features

**Intelligent Analysis**
- Automatic action item extraction from meeting notes
- Meeting summary generation
- Participant sentiment analysis
- Key decision point identification

**Smart Automation**
- Task creation and assignment
- Calendar event scheduling
- Email notifications and reminders
- Contact management updates

### Microsoft Graph Integration

Seamless integration with Microsoft 365 ecosystem:
- **OAuth2 Authentication**: Secure connection to Microsoft services
- **Calendar Sync**: Bi-directional calendar synchronization
- **Contact Integration**: Access to organizational directory
- **Document Sharing**: OneDrive and SharePoint integration

### Advanced Task Management

**Comprehensive Tracking**
- Priority-based organization (LOW, MEDIUM, HIGH, URGENT)
- Status progression (OPEN → IN_PROGRESS → COMPLETED)
- Due date management with overdue notifications
- Assignee and reporter tracking

**Smart Features**
- Subtask creation and management
- Progress percentage tracking
- Time estimation and actual hours logging
- Recurring task patterns
- Tag-based organization

**Reporting and Analytics**
- Individual and team completion rates
- Overdue item identification
- Performance metrics and trends
- Workload distribution analysis

### Document Management System

**Multi-Provider Support**
- OneDrive integration
- Google Drive connectivity
- Local storage options
- Hybrid cloud strategies

**Advanced Organization**
- Document type categorization (AGENDA, MINUTES, PRESENTATION)
- Tag-based classification
- Full-text search capabilities
- Meeting association and context

**AI Document Processing**
- Automatic content extraction
- Summary generation
- Keyword identification
- Document type detection

### Workflow Automation

**n8n Integration**
Powerful workflow automation through n8n platform:

**Task Manager Workflow**
- Automatic task creation from meeting analysis
- Intelligent assignee mapping
- Due date calculation and conversion
- Priority assessment and assignment
- Email notification automation

**Contact Manager Workflow**
- Contact extraction from meeting participants
- CRM integration and updates
- Duplicate prevention and management
- Source tracking and attribution

**Schedule Manager Workflow**
- Follow-up meeting identification
- Calendar event creation
- Attendee invitation management
- Meeting type classification

### Security and Compliance

**Authentication and Authorization**
- JWT-based authentication
- Role-based access control (RBAC)
- Azure AD B2C integration
- Multi-factor authentication support

**Data Protection**
- Encryption in transit and at rest
- GDPR compliance features
- Data retention policies
- Audit trail maintenance

**Enterprise Security**
- Azure Security Center integration
- Key Vault for secrets management
- Managed Identity authentication
- Network security controls

### User Experience

**Modern Interface**
- Angular 17+ with Material Design
- Responsive design for all devices
- Progressive Web App (PWA) capabilities
- Intuitive navigation and workflows

**Accessibility**
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

**Performance**
- Lazy loading for optimal performance
- Offline capability for essential features
- Real-time updates and notifications
- Optimized mobile experience

### Integration Ecosystem

**Calendar Systems**
- Microsoft Outlook
- Google Calendar
- Exchange Server
- Office 365

**Communication Platforms**
- Microsoft Teams
- Slack
- Zoom
- WebEx

**Storage Solutions**
- OneDrive
- SharePoint
- Google Drive
- Local storage

**CRM Integration**
- Airtable
- Salesforce
- HubSpot
- Custom CRM systems

### Scalability and Performance

**Architecture**
- Microservices-based design
- Horizontal scaling capabilities
- Load balancing and failover
- Database optimization

**Cloud-Native**
- Azure Container Apps deployment
- Auto-scaling based on demand
- Geographic distribution
- Disaster recovery planning

Meeting Manager provides a complete solution for modern organizations seeking to maximize meeting effectiveness and follow-through execution.',
'general', 
'Comprehensive overview of Meeting Manager features, AI capabilities, integrations, and enterprise functionality', 
1, NOW(), NOW(), 1, 0, 7),

-- System Architecture Article
('System Architecture and Technical Design', 
'Meeting Manager follows modern enterprise architecture patterns with cloud-native design principles for scalability, security, and maintainability.

## Architecture Overview

The system implements a distributed microservices architecture with clear separation of concerns:

```
Frontend (Angular 17+) ←→ API Gateway ←→ Backend Services (Spring Boot)
                                              ↓
                                          Database Layer
                                      (MySQL + MongoDB)
                                              ↓
                                        Cloud Services
                                     (Azure + Integration)
```

### Frontend Architecture

**Angular 17+ Framework**
- Standalone components for modularity
- Signal-based reactivity
- Tree-shakable bundles
- Progressive Web App capabilities

**Component Structure**
```
src/app/
├── auth/           # Authentication components
├── meetings/       # Meeting management
├── ai-chat/        # AI assistant interface
├── settings/       # User preferences
├── shared/         # Reusable components
└── services/       # Business logic services
```

**State Management**
- Angular Services for business logic
- Observables for reactive data flow
- Local storage for offline capability
- Session management for user state

**UI Framework**
- Angular Material for consistent design
- PrimeNG for advanced components
- Custom SCSS for branding
- Responsive design with CSS Grid/Flexbox

### Backend Architecture

**Spring Boot 3.x Foundation**
- Java 17+ with modern language features
- Spring Security for authentication
- Spring Data JPA for database access
- Spring Web for REST API endpoints

**Layered Architecture**
```
Controller Layer    # REST endpoints and request handling
     ↓
Service Layer       # Business logic and orchestration
     ↓
Repository Layer    # Data access and persistence
     ↓
Entity Layer        # Domain models and relationships
```

**Key Components**
- **Controllers**: REST API endpoints with proper HTTP semantics
- **Services**: Business logic with transaction management
- **Repositories**: JPA repositories with custom queries
- **Entities**: JPA entities with proper relationships
- **DTOs**: Data transfer objects for API responses
- **Mappers**: Entity-DTO conversion logic

### Database Design

**Hybrid Database Strategy**
- **MySQL**: Structured relational data
- **MongoDB**: Document storage and search

**MySQL Schema**
```sql
Tables:
├── users              # User accounts and profiles
├── organizations      # Multi-tenant organization data
├── meetings           # Core meeting information
├── participants       # Meeting attendees
├── action_items       # Tasks and follow-ups
├── documents          # File metadata
├── help_articles      # Help system content
└── audit_logs         # System activity tracking
```

**MongoDB Collections**
```javascript
Collections:
├── meeting_content    # Full meeting transcripts
├── ai_analysis        # AI processing results
├── search_index       # Full-text search data
└── document_content   # Binary file storage
```

### Cloud Infrastructure

**Azure Container Apps**
- Serverless container hosting
- Automatic scaling based on demand
- Zero-downtime deployments
- Built-in load balancing

**Supporting Services**
```
Azure Services:
├── Container Registry     # Docker image storage
├── Key Vault             # Secrets management
├── Application Insights   # Monitoring and telemetry
├── Storage Account       # File and blob storage
├── Cognitive Services    # AI and ML capabilities
└── Active Directory B2C  # Identity management
```

### Security Architecture

**Authentication Flow**
1. User login → Azure AD B2C
2. Token validation → JWT verification
3. Role assignment → RBAC enforcement
4. API access → Secured endpoints

**Security Layers**
- **Network**: Azure Security Groups and firewalls
- **Application**: Spring Security with JWT
- **Data**: Encryption at rest and in transit
- **Identity**: Azure AD B2C with MFA

**Data Protection**
- TLS 1.3 for all communications
- AES-256 encryption for stored data
- Key rotation and management
- Audit logging for compliance

### Integration Architecture

**Microsoft Graph Integration**
- OAuth2 authentication flow
- Calendar API for meeting sync
- User profile integration
- File storage connectivity

**AI Services Integration**
```
AI Pipeline:
Input → Text Processing → Claude Analysis → Result Processing → Storage
```

**Workflow Automation (n8n)**
- Event-driven architecture
- Webhook-based communication
- Parallel processing capabilities
- Error handling and retry logic

### API Design

**RESTful Principles**
- Resource-based URLs
- HTTP verb semantics
- Stateless communication
- HATEOAS for discoverability

**API Structure**
```
Endpoint Pattern:
/api/{version}/{resource}/{id?}/{action?}

Examples:
├── GET /api/v1/meetings
├── POST /api/v1/meetings
├── GET /api/v1/meetings/123
├── PUT /api/v1/meetings/123
├── POST /api/v1/action-items
└── PATCH /api/v1/action-items/456/complete
```

**Response Format**
```json
{
  "data": { /* response payload */ },
  "meta": {
    "timestamp": "2025-01-15T10:00:00Z",
    "version": "1.0",
    "pagination": { /* if applicable */ }
  },
  "links": { /* HATEOAS links */ }
}
```

### Performance Optimization

**Frontend Optimization**
- Lazy loading for route-based code splitting
- OnPush change detection strategy
- Virtual scrolling for large lists
- Service worker for offline caching

**Backend Optimization**
- Connection pooling with HikariCP
- JPA query optimization
- Redis caching layer
- Async processing for heavy operations

**Database Optimization**
- Proper indexing strategy
- Query optimization
- Connection pooling
- Read replicas for scaling

### Monitoring and Observability

**Application Monitoring**
- Azure Application Insights
- Custom metrics and dashboards
- Performance counters
- User behavior analytics

**Logging Strategy**
- Structured logging (JSON format)
- Correlation IDs for request tracing
- Log levels and filtering
- Centralized log aggregation

**Health Checks**
- Application health endpoints
- Database connectivity checks
- External service monitoring
- Automated alerting

### Deployment Strategy

**CI/CD Pipeline**
```
GitHub Actions Workflow:
Code Push → Tests → Build → Security Scan → Deploy → Monitor
```

**Environment Strategy**
- Development: Local Docker Compose
- Staging: Azure Container Apps
- Production: Azure Container Apps with scaling

**Blue-Green Deployment**
- Zero-downtime deployments
- Automatic rollback capabilities
- Health check validation
- Traffic shifting strategies

### Scalability Considerations

**Horizontal Scaling**
- Stateless application design
- Load balancing across instances
- Database read replicas
- CDN for static assets

**Vertical Scaling**
- Container resource limits
- JVM tuning parameters
- Database performance optimization
- Memory and CPU monitoring

**Auto-scaling Triggers**
- CPU utilization > 70%
- Memory usage > 80%
- Request queue depth
- Response time thresholds

This architecture provides a solid foundation for enterprise-scale meeting management with modern development practices and cloud-native principles.',
'technical', 
'Comprehensive technical architecture overview covering frontend, backend, database, cloud infrastructure, and scalability design', 
1, NOW(), NOW(), 1, 0, 8);