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
- [ ] Start development environment

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

## 🚀 Next Steps

After successful environment setup:

1. **Explore the Previous Meetings Component**
   - Navigate to `http://localhost:4200/meetings/previous`
   - Test search functionality
   - Try different filter combinations

2. **Review API Documentation**
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
