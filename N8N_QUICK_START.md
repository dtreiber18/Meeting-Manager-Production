# N8N Integration - Quick Start Guide

## ✅ Status: READY TO USE

The N8N integration is **fully configured and operational**. No setup required!

---

## 🚀 Quick Start (3 Steps)

### 1. Start the Application

Both servers are already running:
- ✅ **Backend:** http://localhost:8080
- ✅ **Frontend:** http://localhost:4200

If you need to restart:
```bash
# Backend
./mvnw spring-boot:run -f backend/pom.xml

# Frontend (in another terminal)
cd frontend && npm start
```

### 2. Test N8N Connection

```bash
curl http://localhost:8080/api/pending-actions/n8n/test
```

Expected response:
```json
{
  "status": "available",
  "message": "N8N service is configured and ready",
  "available": true
}
```

### 3. Use in the UI

1. Open http://localhost:4200
2. Navigate to any meeting details page
3. Scroll to "Pending Actions" card
4. Click "**Sync from N8N**" button
5. Operations from N8N will appear in the list!

---

## 📊 What You Can Do

### Fetch Operations from N8N
- Click "Sync from N8N" in any meeting
- Operations are fetched in real-time
- Displays Contact, Task, and Schedule operations

### Approve/Reject Operations
- Click "Approve" or "Reject" on any pending action
- Changes automatically sync back to N8N
- Status updates in both systems

### View N8N Status
- Purple "🔄 N8N" badges show N8N-sourced actions
- Workflow status displays (TRIGGERED, COMPLETED, FAILED)
- Real-time sync status

---

## 🔧 Configuration (Pre-configured)

Located in: `backend/src/main/resources/application.yml`

```yaml
n8n:
  enabled: true  # ✅ Already enabled
  webhook:
    operations-url: https://g37-ventures1.app.n8n.cloud/webhook/operations
    notes-url: https://g37-ventures1.app.n8n.cloud/webhook/notes
```

**No changes needed!** Everything is pre-configured.

---

## 🧪 Test Endpoints

### Test Connectivity
```bash
curl http://localhost:8080/api/pending-actions/n8n/test
```

### Fetch Operations for a Meeting
```bash
curl http://localhost:8080/api/pending-actions/n8n/fetch/6
```

Replace `6` with any meeting ID.

---

## 📚 Full Documentation

For complete details, see:
- **[N8N_API_DOCUMENTATION.md](N8N_API_DOCUMENTATION.md)** - Complete N8N Operations API specification
- **[N8N_INTEGRATION_COMPLETE.md](N8N_INTEGRATION_COMPLETE.md)** - Complete implementation guide
- **README.md** - Latest updates section
- **FEATURES.md** - Feature list with N8N integration details

---

## 🐛 Troubleshooting

### "Failed to sync from N8N"
**Check backend logs:**
```bash
tail -f backend.log | grep -i n8n
```

### No operations returned
This is normal if the meeting has no pending operations in N8N.

### Backend not responding
Restart the backend:
```bash
pkill -f spring-boot && ./mvnw spring-boot:run -f backend/pom.xml
```

---

## ✅ Current Status

- ✅ Backend running on port 8080
- ✅ Frontend running on port 4200
- ✅ N8N integration active and tested
- ✅ Test endpoint confirmed working
- ✅ Fetch endpoint confirmed working
- ✅ Approve/reject sync implemented
- ✅ Documentation complete

**Status: PRODUCTION READY** 🚀
