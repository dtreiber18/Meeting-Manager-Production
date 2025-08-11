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

## 🚀 AI Features

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
│   │   │   ├── services/     # Business services
│   │   │   ├── models/       # TypeScript models
│   │   │   └── guards/       # Route guards
│   │   └── assets/           # Static assets
│   ├── Dockerfile
│   └── nginx.conf
├── backend/                  # Spring Boot application
│   ├── src/main/java/com/g37/meetingmanager/
│   │   ├── controller/       # REST controllers
│   │   ├── service/          # Business logic
│   │   ├── repository/       # Data access
│   │   │   ├── mysql/        # MySQL repositories
│   │   │   └── mongodb/      # MongoDB repositories
│   │   ├── model/            # Entity models
│   │   └── config/           # Configuration
│   ├── Dockerfile
│   └── pom.xml
├── infrastructure/           # Azure infrastructure
│   ├── bicep/                # Bicep templates
│   └── terraform/            # Terraform (alternative)
├── .github/workflows/        # CI/CD pipelines
├── docker-compose.yml        # Local development
└── azure.yaml               # Azure deployment config
```

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
    // Creates 3 sample meetings with participants and action items
    // - Quarterly Planning (Aug 1, 2025)
    // - Product Launch (Aug 5, 2025)
    // - Team Retrospective (Aug 8, 2025)
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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is proprietary to G37 Enterprise.

## 🆘 Support

For support and questions, contact the G37 development team.