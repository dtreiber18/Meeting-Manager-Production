# N8N Integration - Implementation Complete

## ✅ Status: READY TO USE

The N8N integration is **fully implemented and configured**. The system is pre-configured with the correct webhook URLs and is ready to use immediately.

---

## 🏗️ Architecture

```
Frontend (Angular)
  └─> Backend API (Spring Boot)
      ├─> N8N Operations Webhook
      │   └─> https://g37-ventures1.app.n8n.cloud/webhook/operations
      │       ├─> getEvents - Get all meetings with pending operations
      │       ├─> getPendingOperations - Get pending ops for a meeting
      │       ├─> approveOperation - Approve a pending operation
      │       ├─> rejectOperation - Reject a pending operation
      │       └─> updateOperation - Update operation data/status
      │
      └─> N8N Notes Webhook
          └─> https://g37-ventures1.app.n8n.cloud/webhook/notes
              └─> processMeetingNotes - Process meeting transcript
```

---

## 📋 What's Implemented

### Backend (Java/Spring Boot)

#### **1. N8nService** ([N8nService.java](backend/src/main/java/com/g37/meetingmanager/service/N8nService.java))

**Core Methods:**
- `getPendingOperations(eventId)` - Fetch all pending operations for a meeting
- `getEvents()` - Get all events/meetings from N8N
- `approveOperation(operationId)` - Approve an operation in N8N
- `rejectOperation(operationId)` - Reject an operation in N8N
- `updateOperation(operationId, data, status)` - Update operation data
- `convertToPendingAction(n8nOperation)` - Convert N8N format to internal model
- `isN8nAvailable()` - Check if N8N is configured and reachable

**API Request Format:**
```json
POST https://g37-ventures1.app.n8n.cloud/webhook/operations
{
  "action": "get_pending",
  "event_id": "recaeFlkZr6yAllr1"
}
```

**Supported Actions:**
- `get_events`
- `get_pending`
- `approve_operation`
- `reject_operation`
- `update_operation`

#### **2. PendingActionController** ([PendingActionController.java](backend/src/main/java/com/g37/meetingmanager/controller/PendingActionController.java))

**Endpoints:**

**GET /api/pending-actions/n8n/fetch/{eventId}**
- Fetches pending operations from N8N for a specific meeting
- Converts N8N format to PendingAction models
- Returns list with count

**GET /api/pending-actions/n8n/test**
- Tests N8N connectivity
- Returns availability status

**POST /api/pending-actions/{id}/approve**
- Approves a pending action locally
- Syncs approval to N8N automatically
- Uses n8nExecutionId to match operations

**POST /api/pending-actions/{id}/reject**
- Rejects a pending action locally
- Syncs rejection to N8N automatically
- Uses n8nExecutionId to match operations

#### **3. N8nOperationDTO** ([N8nOperationDTO.java](backend/src/main/java/com/g37/meetingmanager/dto/N8nOperationDTO.java))

Maps N8N response format:
```json
{
  "id": "recPqmKISgLTff13h",
  "createdTime": "2025-08-06T19:18:18.000Z",
  "event_id": "recaeFlkZr6yAllr1",
  "status": "new",
  "operation_type": "Contact",
  "operation": "{\"FirstName\":\"Amanda\",\"LastName\":\"Foster\",...}",
  "created_at": "2025-08-06T19:18:18.212Z",
  "updated_at": "2025-08-06T19:18:18.212Z"
}
```

**Key Feature:** Automatically parses the nested JSON string in the `operation` field.

### Frontend (Angular)

#### **1. PendingActionService** ([pending-action.service.ts:313](frontend/src/app/services/pending-action.service.ts#L313))

**Methods:**
```typescript
fetchFromN8n(eventId: string): Observable<{
  status: string;
  message: string;
  count?: number;
  operations: PendingAction[];
}>

testN8nConnection(): Observable<{
  status: string;
  message: string;
  available: boolean;
}>
```

#### **2. Meeting Details Component** ([meeting-details-screen.component.ts:534](frontend/src/app/meetings/meeting-details-screen.component.ts#L534))

**UI Features:**
- "Sync from N8N" button in Pending Actions card
- Displays synced operations in the list
- Toast notifications for success/failure
- Handles N8N unavailable gracefully

**Method:**
```typescript
syncFromN8n(): void {
  // Fetches operations from N8N
  // Adds to pending actions list
  // Shows success/error messages
}
```

---

## ⚙️ Configuration

### Current Configuration ([application.yml:138-144](backend/src/main/resources/application.yml#L138-L144))

```yaml
n8n:
  enabled: true  # ✅ ENABLED by default
  webhook:
    operations-url: https://g37-ventures1.app.n8n.cloud/webhook/operations
    notes-url: https://g37-ventures1.app.n8n.cloud/webhook/notes
  api:
    key: ""  # Optional - not required for these webhooks
```

**No configuration changes needed!** The system is pre-configured with the correct URLs.

### Environment Variables (Optional Override)

If you need to change the URLs:
```bash
export N8N_ENABLED=true
export N8N_OPERATIONS_WEBHOOK_URL=https://your-custom-url.com/webhook/operations
export N8N_NOTES_WEBHOOK_URL=https://your-custom-url.com/webhook/notes
export N8N_API_KEY=your-api-key  # If needed
```

---

## 🧪 Testing

### 1. Test Backend Connectivity

**Test if N8N is reachable:**
```bash
curl http://localhost:8080/api/pending-actions/n8n/test
```

**Expected Response (Success):**
```json
{
  "status": "available",
  "message": "N8N service is configured and ready",
  "available": true
}
```

### 2. Fetch Pending Operations

**Get operations for a meeting:**
```bash
curl http://localhost:8080/api/pending-actions/n8n/fetch/recaeFlkZr6yAllr1
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Fetched pending operations from N8N",
  "count": 1,
  "operations": [
    {
      "id": "recPqmKISgLTff13h",
      "title": "Contact: Amanda Foster",
      "description": "Email: afoster@prsolutions.com\nRole: PR Contact\nCompany: PR Solutions",
      "actionType": "CONTACT",
      "status": "NEW",
      "priority": "MEDIUM",
      "n8nExecutionId": "recPqmKISgLTff13h"
    }
  ]
}
```

### 3. Test in UI

1. **Start the backend:**
   ```bash
   ./mvnw spring-boot:run -f backend/pom.xml
   ```

2. **Start the frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. **Navigate to a meeting:**
   - Go to `http://localhost:4200/meetings/{meetingId}`
   - Find the "Pending Actions" section
   - Click "Sync from N8N"

4. **Expected Results:**
   - Success toast: "Synced X operations from N8N"
   - Operations appear in the pending actions list
   - Each operation shows type, status, and details

### 4. Test Approve/Reject Sync

1. **Approve a pending action** in the UI
2. **Check backend logs:**
   ```
   Successfully approved operation in N8N: recPqmKISgLTff13h
   ```
3. **Verify in N8N** that the status changed to "approved"

---

## 🔄 Data Flow

### **Scenario 1: Syncing Operations from N8N**

```
1. User clicks "Sync from N8N" button
   └─> Frontend calls: GET /api/pending-actions/n8n/fetch/{eventId}

2. Backend sends to N8N:
   POST https://g37-ventures1.app.n8n.cloud/webhook/operations
   Body: {"action": "get_pending", "event_id": "{eventId}"}

3. N8N returns array of operations:
   [{id, event_id, status, operation_type, operation, ...}]

4. Backend converts to PendingAction models:
   - Parses operation JSON string
   - Maps to internal format
   - Extracts contact/task details

5. Frontend displays operations:
   - Shows in pending actions list
   - Each operation is actionable (approve/reject)
```

### **Scenario 2: Approving an Operation**

```
1. User clicks "Approve" on a pending action
   └─> Frontend calls: POST /api/pending-actions/{id}/approve

2. Backend approves locally:
   - Updates status to APPROVED in database
   - Records approval timestamp and user

3. Backend syncs to N8N (if n8nExecutionId exists):
   POST https://g37-ventures1.app.n8n.cloud/webhook/operations
   Body: {"action": "approve_operation", "operation_id": "{n8nExecutionId}"}

4. N8N updates operation:
   - Changes status to "approved"
   - Triggers downstream workflows (if configured)

5. Frontend shows success:
   - Toast notification
   - Updated operation status
```

---

## 📊 N8N Operation Types

The system handles these operation types:

| N8N Type | Internal Type | Description |
|----------|---------------|-------------|
| `Contact` | `CONTACT` | Create or update contact record |
| `Task` | `TASK` | Create task assignment |
| `Schedule` | `SCHEDULE` | Create calendar event |

---

## 🔐 Security

### **Authentication**
- The configured webhooks don't require API keys
- Optional `N8N_API_KEY` can be set if needed
- All communication uses HTTPS (TLS)

### **Data Validation**
- Backend validates all incoming N8N data
- Malformed JSON in `operation` field is handled gracefully
- Unknown operation types default to `TASK`

### **Error Handling**
- Network failures return empty results (no crashes)
- Parsing errors are logged but don't stop processing
- Sync failures to N8N are logged but don't block local operations

---

## 📝 Operation Field Mapping

### **Contact Operations**

**N8N Format:**
```json
{
  "operation": "{\"FirstName\":\"Amanda\",\"LastName\":\"Foster\",\"Email\":\"afoster@prsolutions.com\",\"Phone\":null,\"Role\":\"PR Contact\",\"Company\":\"PR Solutions\"}"
}
```

**Converted to:**
```json
{
  "title": "Contact: Amanda Foster",
  "description": "Email: afoster@prsolutions.com\nRole: PR Contact\nCompany: PR Solutions",
  "assigneeEmail": "afoster@prsolutions.com",
  "assigneeName": "Amanda Foster"
}
```

### **Task Operations**

**N8N Format:**
```json
{
  "operation": "{\"TaskTitle\":\"Follow up on proposal\",\"DueDate\":\"2025-01-20\",\"AssignedTo\":\"john@example.com\"}"
}
```

**Converted to:**
```json
{
  "title": "Task: Follow up on proposal",
  "dueDate": "2025-01-20",
  "assigneeEmail": "john@example.com"
}
```

---

## 🚀 Ready to Use!

The system is **fully configured and ready**. No additional setup needed!

### **Quick Start:**

1. **Start backend:**
   ```bash
   ./mvnw spring-boot:run -f backend/pom.xml
   ```

2. **Start frontend:**
   ```bash
   cd frontend && npm start
   ```

3. **Test connectivity:**
   ```bash
   curl http://localhost:8080/api/pending-actions/n8n/test
   ```

4. **Use in UI:**
   - Open meeting details
   - Click "Sync from N8N"
   - Approve/reject operations

---

## 📚 API Reference

> **📖 Complete N8N Operations API Specification**
> For detailed N8N webhook API documentation (all actions, request/response formats, operation types, and curl examples), see:
> **[N8N_API_DOCUMENTATION.md](N8N_API_DOCUMENTATION.md)**

### **Backend Endpoints**

#### **Test N8N Connection**
```
GET /api/pending-actions/n8n/test
Response: {status, message, available}
```

#### **Fetch Pending Operations**
```
GET /api/pending-actions/n8n/fetch/{eventId}
Response: {status, message, count, operations[]}
```

#### **Approve Pending Action**
```
POST /api/pending-actions/{id}/approve
Params: approvedById, notes (optional)
Auto-syncs to N8N if n8nExecutionId exists
```

#### **Reject Pending Action**
```
POST /api/pending-actions/{id}/reject
Params: rejectedById, notes (optional)
Auto-syncs to N8N if n8nExecutionId exists
```

### **N8N API Actions**

All actions POST to: `https://g37-ventures1.app.n8n.cloud/webhook/operations`

**Get Events:**
```json
{"action": "get_events"}
```

**Get Pending Operations:**
```json
{"action": "get_pending", "event_id": "recXXXXXXXXXXXXX"}
```

**Approve Operation:**
```json
{"action": "approve_operation", "operation_id": "recXXXXXXXXXXXXX"}
```

**Reject Operation:**
```json
{"action": "reject_operation", "operation_id": "recXXXXXXXXXXXXX"}
```

**Update Operation:**
```json
{
  "action": "update_operation",
  "operation_id": "recXXXXXXXXXXXXX",
  "operation": "{...JSON data...}",
  "status": "approved"
}
```

---

## 🐛 Troubleshooting

### **Issue: "N8N service is not enabled or configured"**

**Check configuration:**
```bash
grep -A 5 "^n8n:" backend/src/main/resources/application.yml
```

Should show `enabled: true` and webhook URLs.

### **Issue: "Failed to sync from N8N"**

**Check N8N connectivity:**
```bash
curl -X POST https://g37-ventures1.app.n8n.cloud/webhook/operations \
  -H "Content-Type: application/json" \
  -d '{"action":"get_events"}'
```

**Check backend logs:**
```bash
tail -f backend/logs/application.log | grep -i n8n
```

### **Issue: Operations not appearing**

1. **Verify event_id exists in N8N:**
   ```bash
   curl -X POST https://g37-ventures1.app.n8n.cloud/webhook/operations \
     -H "Content-Type: application/json" \
     -d '{"action":"get_events"}'
   ```

2. **Check the event_id in the response**

3. **Use that event_id to fetch operations:**
   ```bash
   curl http://localhost:8080/api/pending-actions/n8n/fetch/{event_id}
   ```

---

## ✅ Summary

- ✅ **N8N Integration: COMPLETE**
- ✅ **Configuration: PRE-CONFIGURED**
- ✅ **Backend Compiled: SUCCESS**
- ✅ **Webhooks: READY**
- ✅ **UI Integration: COMPLETE**
- ✅ **Approve/Reject Sync: IMPLEMENTED**

**Status: PRODUCTION READY** 🚀
