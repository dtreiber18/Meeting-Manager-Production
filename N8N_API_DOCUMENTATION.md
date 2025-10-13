# Operations API Documentation

## Overview

This document describes the API endpoints for the Meeting Minutes AI system. The system has two primary webhooks for different purposes.

---

## Operations Management API

**Base URL:** `POST https://g37-ventures1.app.n8n.cloud/webhook/operations`

This webhook handles all operations related to managing events and their pending operations (contacts, tasks, schedules).

### getEvents

Returns a list of all events with pending items.

#### Request Body:
```json
{ "action": "get_events" }
```

#### Response:
```json
[
    {
        "id": "recaeFlkZr6yAllr1",
        "createdTime": "2025-08-06T14:41:59.000Z",
        "event_title": "Meeting from 20250115-TestMeeting-Q1ProductLaunchPlanning.md",
        "source_type": "file",
        "source": "20250115-TestMeeting-Q1ProductLaunchPlanning.md",
        "event_date": "2025-01-15T00:00:00.000Z",
        "status": "processing"
    }
]
```

---

### getPendingOperations

Returns all pending operations for a specific event.

#### Request Body:
```json
{
  "action": "get_pending",
  "event_id": "recaeFlkZr6yAllr1"
}
```

#### Response:
```json
[
    {
        "id": "recPqmKISgLTff13h",
        "createdTime": "2025-08-06T19:18:18.000Z",
        "event_id": "recaeFlkZr6yAllr1",
        "status": "new",
        "operation_type": "Contact",
        "operation": "{\"FirstName\":\"Amanda\",\"LastName\":\"Foster\",\"Email\":\"afoster@prsolutions.com\",\"Phone\":null,\"Role\":\"PR Contact\",\"Company\":\"PR Solutions\",\"Address1\":null,\"Address2\":null,\"City\":null,\"State\":null,\"Zip\":null,\"LastMeeting\":\"2025-01-15\",\"LastMeetingType\":\"project\"}",
        "created_at": "2025-08-06T19:18:18.212Z",
        "updated_at": "2025-08-06T19:18:18.212Z"
    }
]
```

---

### updateOperation

Updates an operation's data and/or status.

#### Request Body:
```json
{
  "action": "update_operation",
  "operation_id": "recck3RYEcTXZTWzd",
  "operation": "{\"FirstName\":\"Dave\",\"LastName\":\"Johnson\",\"Email\":\"djohnson@northstar.com\",\"Phone\":null,\"Role\":null,\"Company\":\"Northstar Industries\",\"Address1\":null,\"Address2\":null,\"City\":null,\"State\":null,\"Zip\":null,\"LastMeeting\":\"2025-01-15\",\"LastMeetingType\":\"project\"}",
  "status": "approved"
}
```

#### Response:
```json
[
    {
        "id": "recck3RYEcTXZTWzd",
        "createdTime": "2025-08-06T19:18:18.000Z",
        "fields": {
            "event_id": "recaeFlkZr6yAllr1",
            "status": "approved",
            "operation_type": "Contact",
            "operation": "{\"FirstName\":\"Dave\",\"LastName\":\"Johnson\",\"Email\":\"djohnson@northstar.com\",\"Phone\":null,\"Role\":null,\"Company\":\"Northstar Industries\",\"Address1\":null,\"Address2\":null,\"City\":null,\"State\":null,\"Zip\":null,\"LastMeeting\":\"2025-01-15\",\"LastMeetingType\":\"project\"}",
            "created_at": "2025-08-06T19:18:18.350Z",
            "updated_at": "2025-08-07T12:22:30.653Z"
        }
    }
]
```

---

### approveOperation

Quick approve an operation without other changes.

#### Request Body:
```json
{
  "action": "approve_operation",
  "operation_id": "recck3RYEcTXZTWzd"
}
```

#### Response:
```json
[
    {
        "id": "recck3RYEcTXZTWzd",
        "createdTime": "2025-08-06T19:18:18.000Z",
        "fields": {
            "event_id": "recaeFlkZr6yAllr1",
            "status": "approved",
            "operation_type": "Contact",
            "operation": "{\"FirstName\":\"Dave\",\"LastName\":\"Johnson\",\"Email\":\"djohnson@northstar.com\",\"Phone\":null,\"Role\":null,\"Company\":\"Northstar Industries\",\"Address1\":null,\"Address2\":null,\"City\":null,\"State\":null,\"Zip\":null,\"LastMeeting\":\"2025-01-15\",\"LastMeetingType\":\"project\"}",
            "created_at": "2025-08-06T19:18:18.350Z",
            "updated_at": "2025-08-06T20:20:53.609Z"
        }
    }
]
```

---

### rejectOperation

Quick reject an operation.

#### Request Body:
```json
{
  "action": "reject_operation",
  "operation_id": "recck3RYEcTXZTWzd"
}
```

#### Response:
```json
[
    {
        "id": "recck3RYEcTXZTWzd",
        "createdTime": "2025-08-06T19:18:18.000Z",
        "fields": {
            "event_id": "recaeFlkZr6yAllr1",
            "status": "rejected",
            "operation_type": "Contact",
            "operation": "{\"FirstName\":\"Dave\",\"LastName\":\"Johnson\",\"Email\":\"djohnson@northstar.com\",\"Phone\":null,\"Role\":null,\"Company\":\"Northstar Industries\",\"Address1\":null,\"Address2\":null,\"City\":null,\"State\":null,\"Zip\":null,\"LastMeeting\":\"2025-01-15\",\"LastMeetingType\":\"project\"}",
            "created_at": "2025-08-06T19:18:18.350Z",
            "updated_at": "2025-08-06T20:20:53.609Z"
        }
    }
]
```

---

## Meeting Notes Processing API

**Base URL:** `POST https://g37-ventures1.app.n8n.cloud/webhook/notes`

This webhook processes meeting notes content and extracts actionable information. Used by the client application when uploading meeting transcripts.

### processMeetingNotes

Processes meeting notes from the client application with an existing event_id. Extracts contacts, tasks, and calendar items from the meeting content.

#### Request Body:
```json
{
  "event_id": "recaeFlkZr6yAllr1",
  "data": "# Q1 Product Launch Planning Meeting\n**Date:** January 15, 2025...",
  "sourceType": "upload",
  "sourceInfo": "ClientApp-Upload-2025-10-05.txt"
}
```

#### Request Parameters:
- **event_id** (required): The Airtable record ID of the event to associate with this meeting. Format: `rec###########`
- **data** (required): The meeting notes content in markdown or plain text format
- **sourceType** (optional): Type of source - "upload", "file", "email" (defaults to "upload")
- **sourceInfo** (optional): Description of the source document or origin

#### Response:
```json
{
  "processedAt": "2025-10-05T22:45:30.123Z",
  "meetingType": "project",
  "results": {
    "contactsProcessed": 3,
    "calendarItemsProcessed": 2,
    "tasksProcessed": 5
  },
  "status": "completed"
}
```

#### Response Fields:
- **processedAt**: ISO 8601 timestamp of when processing completed
- **meetingType**: Classified meeting type ("sales", "project", "standup", "client_onboarding", "vendor_evaluation", "other")
- **results**: Summary of extracted and processed items
  - **contactsProcessed**: Number of contact records created/updated
  - **calendarItemsProcessed**: Number of calendar events created
  - **tasksProcessed**: Number of tasks created
- **status**: Processing status ("completed", "partial", "failed")

#### Error Response:
```json
{
  "error": true,
  "message": "Missing required field: event_id",
  "code": 400
}
```

#### Usage Notes:
- This endpoint is designed for client applications that have already created an event record
- The event_id links all extracted information (contacts, tasks, schedules) to the source meeting event
- Meeting content can be up to ~5000 words for optimal processing
- Processing typically completes within 30-60 seconds

---

## Common Data Structures

### Operation Types

The `operation_type` field can contain one of the following values:

- **Contact** - Creates a new contact record
- **Task** - Creates a new task assignment
- **Schedule** - Creates a new calendar event

---

### Operation Status Values

The `status` field can contain one of the following values:

- **new** - Operation was just created and needs review
- **approved** - Operation has been approved and can be executed
- **rejected** - Operation has been rejected and will not be executed
- **completed** - Operation has been executed successfully

---

## Error Responses

All endpoints return standard error responses:

```json
{
  "error": true,
  "message": "Descriptive error message",
  "code": 400
}
```

### Common Error Codes:
- **400** - Bad Request (missing or invalid parameters)
- **404** - Resource Not Found (event or operation doesn't exist)
- **500** - Internal Server Error (processing failure)

---

## Notes

- All timestamps are in ISO 8601 format
- The `operation` field in operations contains JSON-encoded data specific to each operation type
- Event IDs and Operation IDs are Airtable record IDs (format: `rec###########`)
- The actual response format depends on how Airtable returns data through N8N
- All API communications use HTTPS/TLS encryption

---

## Integration with Meeting Manager

### How Meeting Manager Uses These APIs

#### 1. Fetching Pending Operations
```
User Action: Click "Sync from N8N" in Meeting Details
↓
Frontend → Backend: GET /api/pending-actions/n8n/fetch/{meetingId}
↓
Backend → N8N: POST https://g37-ventures1.app.n8n.cloud/webhook/operations
  Body: {"action": "get_pending", "event_id": "{meetingId}"}
↓
N8N Returns: Array of pending operations
↓
Backend Processes: Converts N8nOperationDTO to PendingAction models
↓
Frontend Displays: Shows operations in Pending Actions card
```

#### 2. Approving an Operation
```
User Action: Click "Approve" on a pending action
↓
Frontend → Backend: POST /api/pending-actions/{id}/approve
↓
Backend: Updates local status to APPROVED
↓
Backend → N8N: POST https://g37-ventures1.app.n8n.cloud/webhook/operations
  Body: {"action": "approve_operation", "operation_id": "{n8nExecutionId}"}
↓
N8N Updates: Changes status to "approved" in Airtable
↓
Frontend: Shows success notification
```

#### 3. Rejecting an Operation
```
User Action: Click "Reject" on a pending action
↓
Frontend → Backend: POST /api/pending-actions/{id}/reject
↓
Backend: Updates local status to REJECTED
↓
Backend → N8N: POST https://g37-ventures1.app.n8n.cloud/webhook/operations
  Body: {"action": "reject_operation", "operation_id": "{n8nExecutionId}"}
↓
N8N Updates: Changes status to "rejected" in Airtable
↓
Frontend: Shows success notification
```

---

## Testing the API

### Test with curl

**Get all events:**
```bash
curl -X POST https://g37-ventures1.app.n8n.cloud/webhook/operations \
  -H "Content-Type: application/json" \
  -d '{"action":"get_events"}'
```

**Get pending operations for an event:**
```bash
curl -X POST https://g37-ventures1.app.n8n.cloud/webhook/operations \
  -H "Content-Type: application/json" \
  -d '{"action":"get_pending","event_id":"recaeFlkZr6yAllr1"}'
```

**Approve an operation:**
```bash
curl -X POST https://g37-ventures1.app.n8n.cloud/webhook/operations \
  -H "Content-Type: application/json" \
  -d '{"action":"approve_operation","operation_id":"recPqmKISgLTff13h"}'
```

**Reject an operation:**
```bash
curl -X POST https://g37-ventures1.app.n8n.cloud/webhook/operations \
  -H "Content-Type: application/json" \
  -d '{"action":"reject_operation","operation_id":"recPqmKISgLTff13h"}'
```

**Update an operation:**
```bash
curl -X POST https://g37-ventures1.app.n8n.cloud/webhook/operations \
  -H "Content-Type: application/json" \
  -d '{
    "action":"update_operation",
    "operation_id":"recPqmKISgLTff13h",
    "operation":"{\"FirstName\":\"Updated\",\"LastName\":\"Name\"}",
    "status":"approved"
  }'
```

---

## See Also

- **[N8N_INTEGRATION_COMPLETE.md](N8N_INTEGRATION_COMPLETE.md)** - Complete implementation guide
- **[N8N_QUICK_START.md](N8N_QUICK_START.md)** - Quick start guide
- **Backend Implementation:** `backend/src/main/java/com/g37/meetingmanager/service/N8nService.java`
- **Frontend Integration:** `frontend/src/app/services/pending-action.service.ts`
