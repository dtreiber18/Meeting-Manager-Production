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

### Database Operations
```bash
# Test MySQL connection
mysql -u meetingmanager -ppassword -D meeting_manager -e "SELECT 'Connected' as status;"

# Check sample data
curl -s http://localhost:8080/api/meetings | jq .

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

# Test through proxy
curl -s http://localhost:4200/api/meetings
```

## 📱 Application URLs

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8080/api
- **Previous Meetings**: http://localhost:4200/meetings/previous
- **API Test**: http://localhost:8080/api/meetings

## 🔍 Verification Checklist

- [ ] Node.js version is 18.x
- [ ] Backend starts without errors
- [ ] Frontend serves at localhost:4200
- [ ] API returns 3 sample meetings
- [ ] Previous Meetings page loads
- [ ] Search and filters work

## 📚 Documentation Quick Links

- **Full Setup Guide**: [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)
- **Component Docs**: [PREVIOUS_MEETINGS.md](./PREVIOUS_MEETINGS.md)
- **API Reference**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Project Overview**: [README.md](../README.md)

---

💡 **Pro Tip**: Keep this file open in a separate tab for quick reference during development!
