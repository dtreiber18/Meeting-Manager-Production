# Quick Reference - Development Environment

Essential commands and configurations for Meeting Manager development.

## 🚀 Quick Start (30 seconds)

```bash
# 1. Start databases
docker-compose up mysql mongodb -d

# 2. Start backend (in terminal 1)
cd backend && mvn spring-boot:run

# 3. Start frontend (in terminal 2)  
cd frontend && npm start

# 4. Open application
open http://localhost:4200
```

## ⚠️ Important Version Requirements

| Tool | Required | Current | Status |
|------|----------|---------|--------|
| Node.js | 18.x | 22.17.1 | ❌ **Must downgrade** |
| Java | 17+ | 17.0.16 | ✅ |
| Maven | 3.6+ | 3.9.9 | ✅ |

### Fix Node.js Version

```bash
# Using nvm (recommended)
nvm install 18
nvm use 18
nvm alias default 18

# Verify
node --version  # Should show v18.x.x
```

## 🔧 Common Development Commands

### Backend Development
```bash
# Quick restart
cd backend
mvn clean compile && mvn spring-boot:run

# With tests
mvn clean test && mvn spring-boot:run

# Package and run JAR
mvn package -DskipTests
java -jar target/meeting-manager-backend-1.0.0.jar
```

### Frontend Development
```bash
# Development server with proxy
cd frontend
npm start

# Alternative start command
ng serve --proxy-config proxy.conf.json

# Production build
npm run build
```

### Document Upload Operations
```bash
# Test document upload API
curl -X POST http://localhost:8080/api/documents/upload \
  -F "file=@example.pdf" \
  -F "description=Test document" \
  -F "meetingId=1" \
  -F "storageType=onedrive"

# Search documents
curl "http://localhost:8080/api/documents/search?query=meeting&type=pdf"

# List meeting documents
curl "http://localhost:8080/api/documents/meeting/1"
```

### Database Operations
```bash
# Test MySQL connection
mysql -u meetingmanager -ppassword -D meeting_manager -e "SELECT 'Connected' as status;"

# Check sample data
curl -s http://localhost:8080/api/meetings | jq .

# Verify document storage
curl -s http://localhost:8080/api/documents | jq .

# Reset database (Docker)
docker-compose down -v && docker-compose up mysql mongodb -d
```

## 🐛 Troubleshooting Quick Fixes

### Port Conflicts
```bash
# Kill processes on common ports
lsof -ti:8080 | xargs kill -9  # Backend
lsof -ti:4200 | xargs kill -9  # Frontend
lsof -ti:3306 | xargs kill -9  # MySQL
```

### Database Issues
```bash
# Restart MySQL container
docker-compose restart mysql

# Check container status
docker-compose ps

# View database logs
docker-compose logs mysql
```

### CORS/API Issues
```bash
# Verify proxy configuration exists
cat frontend/proxy.conf.json

# Test API directly
curl -s http://localhost:8080/api/meetings

# Test document endpoints
curl -s http://localhost:8080/api/documents

# Test through proxy
curl -s http://localhost:4200/api/meetings
```

### Document Upload Issues
```bash
# Check file upload directory permissions
ls -la backend/uploads/

# Verify cloud storage configuration
grep -r "onedrive\|googledrive" backend/src/main/resources/

# Test document service
curl -X GET http://localhost:8080/api/documents/health
```

## 📱 Application URLs

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8080/api
- **Previous Meetings**: http://localhost:4200/meetings/previous
- **Document Upload**: http://localhost:4200/meetings (via upload button)
- **API Test**: http://localhost:8080/api/meetings
- **Document API**: http://localhost:8080/api/documents

## 🔍 Verification Checklist

- [ ] Node.js version is 18.x
- [ ] Backend starts without errors
- [ ] Frontend serves at localhost:4200
- [ ] API returns 3 sample meetings
- [ ] Previous Meetings page loads
- [ ] Search and filters work
- [ ] Document upload button appears on dashboard
- [ ] Document upload dialog opens and functions
- [ ] Documents API returns empty list initially

## 📚 Documentation Quick Links

- **Full Setup Guide**: [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)
- **Component Docs**: [PREVIOUS_MEETINGS.md](./PREVIOUS_MEETINGS.md)
- **API Reference**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Document System**: [DOCUMENT_UPLOAD_SYSTEM.md](./DOCUMENT_UPLOAD_SYSTEM.md)
- **Project Overview**: [README.md](../README.md)

---

💡 **Pro Tip**: Keep this file open in a separate tab for quick reference during development!
