# Meeting Manager - Enterprise Application

A modern, enterprise-grade meeting management application built with Angular 17+ frontend and Spring Boot 3.x backend, designed for Azure deployment with AI-powered features.

## 🏗️ Architecture

### Frontend
- **Angular 17+** with TypeScript
- **Angular Material** + **PrimeNG** for enterprise UI components
- **Progressive Web App (PWA)** capabilities
- **Responsive design** for desktop and mobile

### Backend
- **Spring Boot 3.x** with Java 17+
- **Spring Security** with Azure AD B2C integration
- **Dual Database Strategy**:
  - **MySQL** for structured data (users, meetings metadata)
  - **MongoDB** for document data (meeting content, AI analysis)

### Cloud Infrastructure (Azure)
- **Azure Container Apps** for hosting
- **Azure Container Registry** for images
- **Azure Key Vault** for secrets management
- **Azure OpenAI** for AI features
- **Azure Cognitive Services** for text analysis
- **Application Insights** for monitoring

## 🚀 Features

### Current Features (Implemented ✅)
- **AI Chat Assistant** - Intelligent contextual assistant
  - Floating chat button accessible on all pages
  - Context-aware responses based on current page/route
  - Material Design chat interface with real-time messaging
  - Contextual welcome messages for different app sections
  - Typing indicators and smooth animations
  - Mobile-responsive design with proper breakpoints
- **Settings Management** - Complete configuration interface
  - Account settings with user profile management
  - Integration source configuration (Google Calendar, Outlook, Zoom)
  - Destination settings for meeting outputs and notifications
  - Material Design tabs with reactive forms and toggle switches
- **Enterprise Database Schema** - Complete enterprise-grade data model
  - **10 Comprehensive Entity Models**: User, Organization, Role, Permission, Meeting, MeetingParticipant, ActionItem, MeetingRoom, MeetingNote, MeetingAttachment
  - **Multi-tenancy Support**: Organization-based data isolation with subscription tiers
  - **RBAC System**: Full role-based access control with fine-grained permissions
  - **Advanced Meeting Management**: Meeting types, priorities, recurrence patterns, lifecycle tracking
  - **Professional Participant Management**: Roles, invitation status, attendance tracking
  - **Enhanced Action Items**: Sub-tasks, progress tracking, assignments, due dates
  - **Meeting Resource Management**: Room booking, equipment, capacity management
  - **Document Management**: File attachments with metadata and access controls
  - **Audit Trail Support**: CreatedAt/UpdatedAt timestamps across all entities
- **Backend & Database** - Fully operational Spring Boot API
  - Complete REST API with working endpoints (GET /api/meetings)
  - Dual database connectivity (MySQL + MongoDB) verified
  - Enterprise sample data with realistic organization, users, meetings, participants, and action items
  - CORS configuration for frontend-backend communication
  - All 9 repository interfaces with custom query methods
  - DataSeeder with comprehensive sample data population
- **Enterprise UI Foundation** - Angular Material + PrimeNG components
  - Tailwind CSS for utility-first styling
  - Responsive design for desktop and mobile
  - Navigation system with working route integration

### Planned AI Features
- **Meeting Transcription** with Azure Speech Services
- **Action Item Extraction** with Azure OpenAI
- **Content Analysis** with Azure Text Analytics
- **Document Processing** with Form Recognizer
- **Intelligent Search** with Cognitive Search
- **N8N AI Agents Integration** for workflow automation

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+
- Java 17+
- Maven 3.6+
- Docker & Docker Compose
- Azure CLI (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd meeting-manager
   ```

2. **Start the databases**
   ```bash
   docker-compose up mysql mongodb -d
   ```

3. **Run the backend**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

4. **Run the frontend**
   ```bash
   cd frontend
   npm install
   ng serve
   ```

5. **Access the application**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:8080/api

### Docker Development

```bash
docker-compose up --build
```

## 📁 Project Structure

```
meeting-manager/
├── frontend/                 # Angular 17+ application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/   # UI components
│   │   │   ├── ai-chat/      # AI Chat Assistant component
│   │   │   │   └── ai-chat.component.ts    # Contextual AI assistant
│   │   │   ├── models/       # TypeScript models
│   │   │   │   └── chat.model.ts           # Chat interfaces and types
│   │   │   ├── services/     # Business services
│   │   │   │   ├── chat.service.ts         # AI chat service
│   │   │   │   └── meeting.service.ts      # Meeting data service
│   │   │   ├── meetings/     # Meeting-related components
│   │   │   │   └── previous-meetings/      # Previous Meetings component
│   │   │   │       ├── previous-meetings.component.ts
│   │   │   │       ├── previous-meetings.component.html
│   │   │   │       └── previous-meetings.component.scss
│   │   │   └── guards/       # Route guards
│   │   └── assets/           # Static assets
│   ├── Dockerfile
│   └── nginx.conf
├── backend/                  # Spring Boot application
│   ├── src/main/java/com/g37/meetingmanager/
│   │   ├── controller/       # REST controllers
│   │   │   └── MeetingController.java
│   │   ├── service/          # Business logic
│   │   │   └── MeetingService.java
│   │   ├── repository/       # Data access
│   │   │   ├── mysql/        # MySQL repositories
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── OrganizationRepository.java
│   │   │   │   ├── RoleRepository.java
│   │   │   │   ├── PermissionRepository.java
│   │   │   │   ├── MeetingRepository.java
│   │   │   │   ├── MeetingParticipantRepository.java
│   │   │   │   ├── ActionItemRepository.java
│   │   │   │   ├── MeetingRoomRepository.java
│   │   │   │   ├── MeetingNoteRepository.java
│   │   │   │   └── MeetingAttachmentRepository.java
│   │   │   └── mongodb/      # MongoDB repositories
│   │   ├── model/            # Entity models
│   │   │   ├── User.java                    # Enterprise user model with Azure AD integration
│   │   │   ├── Organization.java            # Multi-tenant organization management
│   │   │   ├── Role.java                    # RBAC role definitions
│   │   │   ├── Permission.java              # Fine-grained permissions
│   │   │   ├── Meeting.java                 # Enhanced meeting model with types and priorities
│   │   │   ├── MeetingParticipant.java      # Professional participant management
│   │   │   ├── ActionItem.java              # Advanced action items with sub-tasks
│   │   │   ├── MeetingRoom.java             # Meeting room booking and management
│   │   │   ├── MeetingNote.java             # Meeting documentation and notes
│   │   │   └── MeetingAttachment.java       # File attachment management
│   │   ├── config/           # Configuration
│   │   │   ├── CorsConfig.java
│   │   │   └── DataSeeder.java
│   │   └── dto/              # Data Transfer Objects
│   ├── Dockerfile
│   └── pom.xml
├── infrastructure/           # Azure infrastructure
│   ├── bicep/                # Bicep templates
│   └── terraform/            # Terraform (alternative)
├── docs/                     # Documentation
│   ├── README.md             # Documentation index
│   ├── SETUP_COMPLETE.md     # Development setup guide
│   ├── PREVIOUS_MEETINGS.md  # Previous Meetings component docs
│   └── API_DOCUMENTATION.md  # Backend API reference
├── .github/workflows/        # CI/CD pipelines
├── docker-compose.yml        # Local development
└── azure.yaml               # Azure deployment config
```

## 📋 Component Architecture

### AI Chat Assistant

The AI Chat Assistant (`frontend/src/app/ai-chat/`) provides an intelligent, context-aware chat interface available throughout the application:

#### Key Features
- **Context-Aware Responses**: Adapts AI responses based on current page/route (home, meetings, detail, settings)
- **Floating Interface**: Non-intrusive floating action button with expandable chat window
- **Real-time Messaging**: Instant message sending with typing indicators and loading states
- **Material Design**: Consistent UI using Angular Material components with smooth animations
- **Mobile Responsive**: Optimized for both desktop and mobile experiences
- **Route Integration**: Automatically detects page context through router event monitoring

#### Technical Implementation
```typescript
// Router-based context detection
private updatePageTypeFromRoute(url: string): void {
  if (url === '/' || url === '/home') {
    this.currentPageType = 'home';
  } else if (url.includes('/meetings')) {
    this.currentPageType = url.includes('/meetings/') ? 'detail' : 'meetings';
  } else if (url.includes('/settings')) {
    this.currentPageType = 'settings';
  }
}

// Contextual AI responses
generateAIResponse(message: string, pageType: PageType): Observable<string> {
  return this.getContextualResponse(message, pageType).pipe(
    delay(1500 + Math.random() * 1000) // Simulate processing
  );
}
```

#### Chat Service Features
```typescript
// Contextual welcome messages
getContextualWelcome(pageType: PageType): string {
  switch (pageType) {
    case 'home': return "Hi! I'm here to help you navigate your dashboard...";
    case 'meetings': return "Welcome to the meetings section! I can help you...";
    case 'detail': return "I can help you understand this meeting's details...";
    case 'settings': return "Let me help you configure your settings...";
  }
}

// Intelligent response matching
private getContextualResponse(message: string, pageType: PageType): Observable<string> {
  // Smart keyword matching with page-specific responses
  // Handles queries about navigation, features, and functionality
}
```

#### Global Integration
- **App Component**: Included in `app.component.html` outside router-outlet for global availability
- **Router Tracking**: Monitors `NavigationEnd` events to update context automatically
- **Performance**: OnPush change detection and trackBy functions for optimal rendering
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support

### Previous Meetings Component

The Previous Meetings component (`frontend/src/app/meetings/previous-meetings/`) provides a comprehensive interface for browsing historical meetings:

#### Key Features
- **Real-time Search**: 300ms debounced search across meeting titles, descriptions, and participants
- **Advanced Filtering**: Filter by date range, meeting type, and participant names
- **Dual View Modes**: Toggle between grid and list layouts
- **Performance Optimized**: Uses trackBy functions and OnPush change detection
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: ARIA labels and keyboard navigation support

#### Technical Implementation
```typescript
// Component uses RxJS for reactive search
private searchSubject = new Subject<string>();

ngOnInit() {
  this.searchSubject.pipe(
    debounceTime(300),
    distinctUntilChanged()
  ).subscribe(() => this.applyFilters());
}

// Performance optimization with trackBy
trackByMeetingId(index: number, meeting: Meeting): number {
  return meeting.id;
}
```

#### API Integration
The component integrates with the backend through the `MeetingService`:
- **GET /api/meetings** - Retrieves all meetings with participants and action items
- **CORS Configuration** - Development-ready with wildcard origins
- **Error Handling** - Comprehensive error states and user feedback

#### Routing Integration
- **Route**: `/meetings/previous`
- **Navigation**: Accessible from home page "All Meetings" buttons
- **Lazy Loading**: Component loaded on-demand for performance

## 🔧 Configuration

### Backend Configuration

#### Database Setup
```yaml
# MySQL Configuration (application.yml)
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/meeting_manager
    username: meetingmanager
    password: password
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
    database-platform: org.hibernate.dialect.MySQL8Dialect
    show-sql: true

# MongoDB Configuration
  data:
    mongodb:
      uri: mongodb://localhost:27017/meeting_manager
```

#### CORS Configuration
```java
// Configured for development with wildcard origins
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOriginPatterns("*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH")
                        .allowedHeaders("*")
                        .exposedHeaders("*")
                        .allowCredentials(false)
                        .maxAge(3600);
            }
        };
    }
}
```

#### JSON Serialization
```java
// Circular reference prevention with @JsonIgnore
@Entity
public class Participant {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id")
    @JsonIgnore  // Prevents circular reference in JSON serialization
    private Meeting meeting;
}
```

### Frontend Configuration

#### Proxy Configuration (proxy.conf.json)
```json
{
  "/api/*": {
    "target": "http://localhost:8080",
    "secure": true,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

#### Angular Configuration (angular.json)
```json
{
  "serve": {
    "builder": "@angular-devkit/build-angular:dev-server",
    "options": {
      "proxyConfig": "proxy.conf.json"
    }
  }
}
```

#### Meeting Service Configuration
```typescript
// MeetingService with relative URLs for proxy forwarding
@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  private apiUrl = '/api/meetings'; // Proxied to backend

  getMeetings(): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(this.apiUrl);
  }
}
```

### Environment Variables

#### Frontend
- `API_URL` - Backend API endpoint (production)

#### Backend
- `DB_USERNAME` - MySQL username (meetingmanager)
- `DB_PASSWORD` - MySQL password
- `DB_URL` - MySQL connection URL
- `MONGODB_URI` - MongoDB connection string
- `AZURE_OPENAI_ENDPOINT` - Azure OpenAI endpoint
- `AZURE_OPENAI_API_KEY` - Azure OpenAI API key
- `AZURE_TEXT_ANALYTICS_ENDPOINT` - Text Analytics endpoint
- `AZURE_TEXT_ANALYTICS_API_KEY` - Text Analytics API key
- `JWT_SECRET` - JWT signing secret

### Sample Data Configuration

The application includes a `DataSeeder` component that automatically populates the database with sample meetings on startup:

```java
@Component
public class DataSeeder implements CommandLineRunner {
    // Creates comprehensive sample data including:
    // - Acme Corporation organization with ENTERPRISE subscription
    // - 3 users (John Doe - Product Manager, Jane Smith - Developer, Bob Johnson - Designer)
    // - RBAC system with Admin, Manager, and User roles
    // - 3 detailed meetings with different types and priorities:
    //   * Quarterly Planning (PLANNING, HIGH priority)
    //   * Product Launch (PRESENTATION, MEDIUM priority) 
    //   * Team Retrospective (RETROSPECTIVE, LOW priority)
    // - Meeting participants with roles and invitation status
    // - 4 action items with sub-tasks, assignments, and progress tracking
}
```

## 🚢 Deployment

### Azure Container Apps

1. **Login to Azure**
   ```bash
   az login
   ```

2. **Deploy infrastructure**
   ```bash
   az deployment sub create \
     --location eastus \
     --template-file infrastructure/bicep/main.bicep \
     --parameters environmentName=production
   ```

3. **Deploy applications**
   ```bash
   az containerapp up \
     --name meeting-manager \
     --resource-group rg-meeting-manager-production \
     --environment meeting-manager-env
   ```

### CI/CD Pipeline

The project includes a comprehensive GitHub Actions pipeline that:
- Builds and tests both frontend and backend
- Runs security scans with SonarQube and OWASP ZAP
- Builds and pushes Docker images
- Deploys to Azure Container Apps

## 🔒 Security

- **Azure AD B2C** authentication with RBAC
- **JWT tokens** for API authentication
- **HTTPS** enforcement
- **CORS** configuration
- **Security headers** via nginx
- **Vulnerability scanning** with OWASP ZAP
- **Code quality** monitoring with SonarQube

## 📊 Monitoring

- **Application Insights** for telemetry
- **Azure Monitor** for infrastructure monitoring
- **Log Analytics** for centralized logging
- **Custom metrics** and dashboards
- **Health checks** and alerts

## 🧪 Testing

### Frontend
```bash
cd frontend
npm test              # Unit tests
npm run test:e2e      # End-to-end tests
npm run lint          # Linting
```

### Backend
```bash
cd backend
mvn test              # Unit tests
mvn verify            # Integration tests
mvn spotbugs:check    # Static analysis
```

## 📈 Scalability

- **Horizontal scaling** with Azure Container Apps
- **Database sharding** strategy for MySQL
- **MongoDB replica sets** for high availability
- **CDN integration** for static assets
- **Caching layers** with Redis (planned)

## 🔧 Git Repository Setup

### Initial Setup Complete ✅

The project has been initialized with Git and is ready for GitHub:

```bash
# Repository initialized with comprehensive .gitignore
# Initial commit includes all working code
git log --oneline  # View commit history
```

### GitHub Repository Setup

1. **Create GitHub Repository**:
   ```bash
   # Option 1: Using GitHub CLI (recommended)
   gh repo create Meeting-Manager-Production --public --description "Enterprise Meeting Manager - Angular + Spring Boot"
   
   # Option 2: Create manually on GitHub.com then:
   git remote add origin https://github.com/YOUR_USERNAME/Meeting-Manager-Production.git
   ```

2. **Push to GitHub**:
   ```bash
   git branch -M main
   git push -u origin main
   ```

### GitHub Actions CI/CD Setup

The project includes a complete CI/CD pipeline in `.github/workflows/ci-cd.yml`:

#### Required GitHub Secrets

Set these in GitHub → Settings → Secrets and variables → Actions:

```bash
# Azure Container Registry
AZURE_CONTAINER_REGISTRY     # e.g., meetingmanager.azurecr.io
AZURE_REGISTRY_USERNAME      # ACR username
AZURE_REGISTRY_PASSWORD      # ACR password

# Azure Deployment
AZURE_CREDENTIALS           # Service principal JSON
AZURE_RESOURCE_GROUP        # Production resource group
AZURE_RESOURCE_GROUP_DEV    # Development resource group

# SonarQube (optional)
SONAR_TOKEN                 # SonarQube authentication token
SONAR_HOST_URL             # SonarQube server URL

# Health Check URLs
BACKEND_URL                 # Production backend URL
FRONTEND_URL               # Production frontend URL
```

#### Required GitHub Variables

Set these in GitHub → Settings → Secrets and variables → Actions → Variables:

```bash
AZURE_CONTAINER_REGISTRY    # e.g., meetingmanager.azurecr.io
AZURE_RESOURCE_GROUP        # Production resource group name
```

#### Pipeline Features

- ✅ **Frontend Build**: Node.js 18, npm install, lint, test, build
- ✅ **Backend Build**: Java 17, Maven compile, test, package
- ✅ **Security Scanning**: Trivy vulnerability scanner, OWASP ZAP
- ✅ **Code Quality**: SonarQube analysis
- ✅ **Docker Build**: Multi-stage builds for frontend/backend
- ✅ **Azure Deployment**: Container Apps with blue-green deployment
- ✅ **Health Checks**: Automated post-deployment verification

#### Workflow Triggers

```yaml
# Automatic triggers
on:
  push:
    branches: [ main, develop ]    # Full pipeline
  pull_request:
    branches: [ main ]             # Build + test only
```

### Development Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create pull request
git push origin feature/new-feature
# Then create PR on GitHub - triggers CI pipeline

# After PR approval and merge to main:
# - Full CI/CD pipeline runs
# - Docker images built and pushed
# - Deployment to Azure Container Apps
# - Health checks verify deployment
```

### Monitoring and Alerts

After deployment, monitor your application:

- **Application Insights**: Real-time performance monitoring
- **Azure Monitor**: Infrastructure and container metrics
- **GitHub Actions**: Build/deployment status and history
- **SonarQube**: Code quality and security analysis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting locally
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Create a Pull Request

## 📄 License

This project is proprietary to G37 Enterprise.

## 🆘 Support

For support and questions, contact the G37 development team.