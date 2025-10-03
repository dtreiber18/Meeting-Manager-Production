# N8N Pending Operations Integration

**Version**: 3.4.0
**Date**: October 3, 2025
**Status**: Production Ready

Complete guide for integrating Meeting Manager with N8N Operations Manager for automated pending action workflows.

---

## 📋 Overview

The N8N Pending Operations integration enables automated management of pending actions by connecting Meeting Manager with N8N Operations Manager workflows.

### Key Features

- ✅ **Automated Synchronization**: Scheduled jobs fetch pending operations every 15 minutes
- ✅ **Manual Sync**: One-click synchronization from the UI
- ✅ **Bulk Operations**: Approve/reject multiple pending actions simultaneously
- ✅ **Visual Indicators**: Clear badges showing N8N-sourced actions and workflow status
- ✅ **Graceful Fallback**: Application functions normally when N8N is disabled

---

## ⚙️ Configuration

### Environment Variables

```bash
# Enable N8N integration
N8N_ENABLED=true

# N8N webhook URL for Operations Manager
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/pending-operations

# Optional: API key for N8N authentication
N8N_API_KEY=your-api-key-here
```

### application.yml

```yaml
# N8N Integration Configuration
n8n:
  enabled: ${N8N_ENABLED:false}
  webhook:
    url: ${N8N_WEBHOOK_URL:}
  api:
    key: ${N8N_API_KEY:}
```

---

## 📡 API Specification

### Request Format

**POST** to N8N webhook URL

```json
{
  "action": "get_pending",
  "event_id": "12345"
}
```

### Response Format

```json
[
  {
    "id": "op_67890",
    "createdTime": "2025-10-03T14:30:00Z",
    "event_id": "12345",
    "status": "pending",
    "operation_type": "Contact",
    "operation": {
      "FirstName": "Jane",
      "LastName": "Smith",
      "Email": "jane.smith@example.com",
      "Phone": "+1-555-0123",
      "Role": "Product Manager",
      "Company": "Acme Corp"
    }
  }
]
```

---

## 🎨 User Interface

### Sync from N8N Button

**Location**: Meeting Details → Pending Actions Card Header

- Purple button with "🔄 Sync from N8N" text
- Shows loading state "⏳ Syncing..." during operation
- Displays success toast with count of synced operations
- Error toast shown if sync fails

### Bulk Operations

**Selection**:
- Checkboxes appear on each pending action in edit mode
- Click to select/deselect individual actions
- Selection count displayed on bulk action buttons

**Bulk Approve**:
- Green button "✅ Approve Selected (N)"
- Optional approval notes prompt
- Updates all selected actions

**Bulk Reject**:
- Red button "❌ Reject Selected (N)"
- Required rejection reason prompt
- Updates all selected actions

### Status Indicators

**N8N Origin Badge**:
- Purple badge "🔄 N8N"
- Shows when action came from N8N

**Workflow Status Badge**:
- **TRIGGERED**: Blue badge
- **COMPLETED**: Green badge
- **FAILED**: Red badge

---

## ⏰ Auto-Sync Scheduler

### Configuration

- **Frequency**: Every 15 minutes (900,000 ms)
- **Initial Delay**: 60 seconds after startup
- **Scope**: Meetings from last 30 days

### Behavior

1. Fetches pending operations from N8N for recent meetings
2. Checks for existing operations by `n8nExecutionId`
3. Creates new pending actions for operations not yet synced
4. Logs summary of synced operations

---

## 🔧 Troubleshooting

### "N8N service is not enabled or configured"

**Solution**: Set environment variables and restart backend
```bash
export N8N_ENABLED=true
export N8N_WEBHOOK_URL=https://your-n8n.com/webhook
cd backend && ../mvnw spring-boot:run
```

### Auto-Sync Not Running

**Check**:
1. `@EnableScheduling` present in `MeetingManagerApplication.java`
2. Both `n8n.enabled=true` and MongoDB URI are set
3. Enable debug logging to see scheduler activity

### Duplicate Operations

**Verify**:
- N8N returns consistent `id` values in responses
- `n8nExecutionId` field is being saved properly
- Duplicate detection logic is functioning

---

## 📚 Technical Details

### Backend Components

- **N8nService**: Core integration service with REST API communication
- **N8nOperationDTO**: Data transfer object for N8N API responses
- **N8nSyncScheduler**: Automated scheduler with duplicate prevention
- **PendingActionService**: MongoDB persistence with N8N workflow triggering
- **PendingActionController**: REST endpoints for N8N operations

### Frontend Components

- **pending-action.service.ts**: N8N API integration methods
- **meeting-details-screen.component.ts**: UI logic for sync and bulk operations
- **meeting-details-screen.component.html**: UI template with buttons and badges

---

## 📖 Related Documentation

- [Main README](../README.md)
- [Environment Setup](ENVIRONMENT_SETUP.md)
- [Features List](../FEATURES.md)
- [Changelog](../CHANGELOG.md)
- [N8N Meeting Integration](N8N_INTEGRATION.md)

---

**For detailed troubleshooting, API specifications, and advanced configuration, see the full documentation in the Docs folder.**
