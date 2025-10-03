# Environment Setup Guide

Complete development environment setup for Meeting Manager - Enterprise Application

## 🎯 Quick Start Checklist

- [ ] Install Node.js 18.x (Angular 17 requirement)
- [ ] Install Java 17+
- [ ] Install Maven 3.6+
- [ ] Install Docker & Docker Compose
- [ ] Install MySQL 8.0 (or use Docker)
- [ ] Install MongoDB 7.0 (or use Docker)
- [ ] Clone repository and install dependencies
- [ ] Configure database connections
- [ ] Start developmen3. **Review API Documentation**
   - Check `docs/API_DOCUMENTATION.md`
   - Test API endpoints with curl or Postman
   - Explore document upload API endpoints

4. **Start Development**
   - Review component architecture in `docs/PREVIOUS_MEETINGS.md`
   - Explore document system in `docs/DOCUMENT_UPLOAD_SYSTEM.md`
   - Explore the codebase structure
   - Begin implementing new featuresnment

## 🛠 Required Tools and Versions

### Core Development Tools

| Tool | Required Version | Current Version | Installation Command |
|------|-----------------|-----------------|---------------------|
| **Node.js** | 18.x (Angular requirement) | 22.17.1 ⚠️ | `brew install node@18` |
| **npm** | 8.x+ | 10.9.2 ✅ | Included with Node.js |
| **Java** | 17+ | 17.0.16 ✅ | `brew install openjdk@17` |
| **Maven** | 3.6+ | 3.9.9 ✅ | `brew install maven` |
| **Docker** | 20.x+ | 27.3.1 ✅ | [Docker Desktop](https://www.docker.com/products/docker-desktop) |
| **Docker Compose** | 2.x+ | v2.30.3 ✅ | Included with Docker Desktop |

### Database Requirements

| Database | Version | Port | Usage |
|----------|---------|------|-------|
| **MySQL** | 8.0+ | 3306 | Primary relational data |
| **MongoDB** | 7.0+ | 27017 | Document storage (future) |

### Frontend Framework

| Framework | Version | Purpose |
|-----------|---------|---------|
| **Angular CLI** | 17.3.17 | Frontend framework |
| **Angular Core** | 17.3.12 | Application core |
| **Angular Material** | 17.3.10 | UI components |
| **PrimeNG** | 17.18.12 | Extended UI components |
| **Tailwind CSS** | 3.4.17 | Utility-first CSS |
| **TypeScript** | 5.4.5 | Type safety |
| **RxJS** | 7.8.2 | Reactive programming |

### Backend Framework

| Framework | Version | Purpose |
|-----------|---------|---------|
| **Spring Boot** | 3.2.8 | Backend framework |
| **Spring Security** | 6.x | Authentication/Authorization |
| **Spring Data JPA** | 3.x | Database abstraction |
| **Spring Data MongoDB** | 4.x | MongoDB integration |
| **MySQL Connector** | 8.x | Database driver |

## 📦 Installation Instructions

### 1. System Prerequisites (macOS)

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install core development tools
brew install node@18 openjdk@17 maven mysql mongodb-community docker
```

### 2. Node.js Version Management

**⚠️ Important**: Angular 17 requires Node.js 18.x, but current system has 22.17.1

```bash
# Option 1: Use nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
nvm alias default 18

# Option 2: Install Node 18 directly
brew uninstall node
brew install node@18
brew link --force node@18

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x+
```

### 3. Java Configuration

```bash
# Set JAVA_HOME for Java 17
echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 17)' >> ~/.zshrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.zshrc
source ~/.zshrc

# Verify Java installation
java --version
javac --version
mvn --version
```

### 4. Database Setup

#### Option A: Docker (Recommended)
```bash
# Start databases using Docker Compose
docker-compose up mysql mongodb -d

# Verify containers are running
docker ps
```

#### Option B: Local Installation
```bash
# MySQL
brew services start mysql
mysql -u root -p -e "CREATE DATABASE meeting_manager;"
mysql -u root -p -e "CREATE USER 'meetingmanager'@'localhost' IDENTIFIED BY 'password';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON meeting_manager.* TO 'meetingmanager'@'localhost';"

# MongoDB
brew services start mongodb-community
mongosh --eval "use meeting_manager"
```

## 🚀 Project Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd Meeting-Manager-Production
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies and compile
mvn clean compile

# Run tests (optional)
mvn test

# Package application
mvn package -DskipTests

# Start the backend
mvn spring-boot:run
```

**Backend will be available at:** `http://localhost:8080`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
# OR with proxy configuration
ng serve --proxy-config proxy.conf.json
```

**Frontend will be available at:** `http://localhost:4200`

### 4. Full Stack with Docker

```bash
# Build and start all services
docker-compose up --build

# Access applications
# Frontend: http://localhost:4200
# Backend API: http://localhost:8080/api
# MySQL: localhost:3306
# MongoDB: localhost:27018
```

## ⚙️ Configuration Files

### Frontend Configuration

#### `frontend/proxy.conf.json`
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

#### `frontend/angular.json` (Development Server)
```json
"serve": {
  "builder": "@angular-devkit/build-angular:dev-server",
  "options": {
    "proxyConfig": "proxy.conf.json"
  }
}
```

### Backend Configuration

#### `backend/src/main/resources/application.yml`
```yaml
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
  
  data:
    mongodb:
      uri: mongodb://localhost:27017/meeting_manager

server:
  port: 8080
```

### Database Configuration

#### MySQL Connection Test
```bash
mysql -u meetingmanager -ppassword -D meeting_manager -e "SELECT 'Connection successful' as status;"
```

#### Sample Data
The application includes a `DataSeeder` that automatically creates:
- 3 sample meetings (Quarterly Planning, Product Launch, Team Retrospective)
- Sample participants for each meeting
- Sample action items

## 🔧 Development Commands

### Backend Commands
```bash
# Compile and run
mvn clean compile
mvn spring-boot:run

# Run tests
mvn test

# Package application
mvn package -DskipTests

# Run packaged JAR
java -jar target/meeting-manager-backend-1.0.0.jar
```

### Frontend Commands
```bash
# Development server
npm start
ng serve
ng serve --proxy-config proxy.conf.json

# Build for production
npm run build
ng build --configuration production

# Run tests
npm test
ng test

# Linting
ng lint
```

### Docker Commands
```bash
# Start all services
docker-compose up --build

# Start only databases
docker-compose up mysql mongodb -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Clean up
docker-compose down -v --remove-orphans
```

## 🧪 Verification Steps

### 1. Backend Verification
```bash
# Test database connection
curl -s http://localhost:8080/api/meetings

# Expected response: JSON array with 3 sample meetings
```

### 2. Frontend Verification
```bash
# Access application in browser
open http://localhost:4200

# Navigate to Previous Meetings
# URL should show: http://localhost:4200/meetings/previous
```

### 3. Integration Test
```bash
# Test API through frontend proxy
curl -s http://localhost:4200/api/meetings

# Should return same data as direct backend call
```

## 🔍 Troubleshooting

### Common Issues

#### Node.js Version Mismatch
**Problem**: Angular shows "Node version not supported"
**Solution**: 
```bash
nvm use 18  # Switch to Node 18
npm install  # Reinstall dependencies
```

#### Database Connection Failed
**Problem**: Backend can't connect to MySQL
**Solution**:
```bash
# Check MySQL is running
brew services list | grep mysql
# OR
docker ps | grep mysql

# Test connection manually
mysql -u meetingmanager -ppassword -D meeting_manager
```

#### Port Already in Use
**Problem**: Port 8080 or 4200 already in use
**Solution**:
```bash
# Kill processes on port 8080
lsof -ti:8080 | xargs kill -9

# Kill processes on port 4200  
lsof -ti:4200 | xargs kill -9
```

#### CORS Issues
**Problem**: Frontend can't access backend API
**Solution**: Ensure proxy configuration is set up correctly in `proxy.conf.json`

### Log Locations

- **Backend Logs**: Console output from `mvn spring-boot:run`
- **Frontend Logs**: Browser console and terminal output from `ng serve`
- **Docker Logs**: `docker-compose logs -f [service-name]`

## ☁️ Cloud Storage Configuration

The document upload system supports OneDrive and Google Drive integration. Configure these services for full functionality.

### OneDrive Configuration

1. **Azure App Registration**
   ```bash
   # Set environment variables in backend
   ONEDRIVE_CLIENT_ID=your-client-id
   ONEDRIVE_CLIENT_SECRET=your-client-secret
   ONEDRIVE_REDIRECT_URI=http://localhost:8080/auth/onedrive/callback
   ```

2. **Required Permissions**
   - `Files.ReadWrite`
   - `Files.ReadWrite.All`
   - `offline_access`

3. **Configuration Properties**
   ```yaml
   # backend/src/main/resources/application.yml
   cloud-storage:
     onedrive:
       client-id: ${ONEDRIVE_CLIENT_ID}
       client-secret: ${ONEDRIVE_CLIENT_SECRET}
       redirect-uri: ${ONEDRIVE_REDIRECT_URI}
       scope: "Files.ReadWrite Files.ReadWrite.All offline_access"
   ```

### Google Drive Configuration

1. **Google Cloud Console Setup**
   ```bash
   # Set environment variables in backend
   GOOGLE_DRIVE_CLIENT_ID=your-client-id
   GOOGLE_DRIVE_CLIENT_SECRET=your-client-secret
   GOOGLE_DRIVE_REDIRECT_URI=http://localhost:8080/auth/googledrive/callback
   ```

2. **Required Scopes**
   - `https://www.googleapis.com/auth/drive.file`
   - `https://www.googleapis.com/auth/drive`

3. **Configuration Properties**
   ```yaml
   # backend/src/main/resources/application.yml
   cloud-storage:
     googledrive:
       client-id: ${GOOGLE_DRIVE_CLIENT_ID}
       client-secret: ${GOOGLE_DRIVE_CLIENT_SECRET}
       redirect-uri: ${GOOGLE_DRIVE_REDIRECT_URI}
       scope: "https://www.googleapis.com/auth/drive.file"
   ```

### Environment Variables Setup

```bash
# Create .env file in backend directory
cd backend
cat > .env << EOF
ONEDRIVE_CLIENT_ID=your-onedrive-client-id
ONEDRIVE_CLIENT_SECRET=your-onedrive-client-secret
ONEDRIVE_REDIRECT_URI=http://localhost:8080/auth/onedrive/callback

GOOGLE_DRIVE_CLIENT_ID=your-google-client-id
GOOGLE_DRIVE_CLIENT_SECRET=your-google-client-secret
GOOGLE_DRIVE_REDIRECT_URI=http://localhost:8080/auth/googledrive/callback

# N8N Integration (Optional)
N8N_ENABLED=false
N8N_WEBHOOK_URL=
N8N_API_KEY=
EOF

# Load environment variables
source .env
```

## 🔄 N8N Operations Integration (Optional)

The application supports integration with N8N Operations Manager for automated pending action workflows.

### N8N Configuration

1. **Enable N8N Integration**
   ```yaml
   # backend/src/main/resources/application.yml
   n8n:
     enabled: ${N8N_ENABLED:false}
     webhook:
       url: ${N8N_WEBHOOK_URL:}
     api:
       key: ${N8N_API_KEY:}
   ```

2. **Environment Variables**
   ```bash
   # Enable N8N integration
   N8N_ENABLED=true

   # N8N webhook URL for Operations Manager workflow
   N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/pending-operations

   # Optional: API key for N8N authentication
   N8N_API_KEY=your-n8n-api-key
   ```

3. **N8N Workflow Setup**
   - Create an N8N workflow with a webhook trigger
   - Configure webhook to accept POST requests with JSON body
   - Expected request format:
     ```json
     {
       "action": "get_pending",
       "event_id": "meeting-id"
     }
     ```
   - Response format:
     ```json
     [
       {
         "id": "operation-id",
         "createdTime": "2025-10-03T10:00:00Z",
         "event_id": "meeting-id",
         "status": "pending",
         "operation_type": "Contact",
         "operation": {
           "FirstName": "John",
           "LastName": "Doe",
           "Email": "john.doe@example.com",
           "Phone": "555-1234",
           "Role": "Developer",
           "Company": "Tech Corp"
         }
       }
     ]
     ```

4. **Features When Enabled**
   - **Auto-Sync**: Scheduled job runs every 15 minutes to fetch pending operations from N8N
   - **Manual Sync**: "Sync from N8N" button in meeting details UI
   - **Bulk Operations**: Approve/reject multiple pending actions at once
   - **N8N Indicators**: Visual badges show which actions came from N8N
   - **Workflow Status**: Real-time status tracking (TRIGGERED, COMPLETED, FAILED)

5. **Disabling N8N (Default)**
   ```bash
   # Set to false or omit to disable N8N integration
   N8N_ENABLED=false
   ```
   - Application runs normally without N8N
   - Pending actions can still be created manually
   - No scheduler or N8N-specific features active

## 🚀 Next Steps

After successful environment setup:

1. **Explore the Previous Meetings Component**
   - Navigate to `http://localhost:4200/meetings/previous`
   - Test search functionality
   - Try different filter combinations

2. **Test Document Upload System**
   - Navigate to `http://localhost:4200/meetings/previous`
   - Click "Upload Documents" button
   - Test file upload functionality
   - Verify document listing and search

3. **Review API Documentation**
   - Check `docs/API_DOCUMENTATION.md`
   - Test API endpoints with curl or Postman

3. **Start Development**
   - Review component architecture in `docs/PREVIOUS_MEETINGS.md`
   - Explore the codebase structure
   - Begin implementing new features

## 📚 Additional Resources

- **Angular Documentation**: https://angular.io/docs
- **Spring Boot Documentation**: https://spring.io/projects/spring-boot
- **Project Documentation**: `docs/README.md`
- **API Reference**: `docs/API_DOCUMENTATION.md`
- **Component Guide**: `docs/PREVIOUS_MEETINGS.md`

---

**Last Updated**: August 11, 2025  
**Environment Status**: Development Ready ✅  
**Next Action**: Begin feature development or deployment setup
