# n8n Workflow Integration Documentation

## Overview

The Meeting Manager now supports dual-source meeting management, seamlessly integrating meetings from both the native Meeting Manager system and external n8n workflows. This integration provides a unified interface for viewing and managing meetings regardless of their source.

## Architecture

### Integration Points

1. **Meeting List Component** (`frontend/src/app/meetings/meeting-list/`)
   - Displays meetings from both sources with visual distinction
   - Parallel API calls for optimal performance
   - Source-aware routing with query parameters

2. **Meeting Details Component** (`frontend/src/app/meetings/meeting-details/`)
   - Handles meeting details from both sources
   - Multi-tier fallback system for reliable data retrieval
   - Professional error handling without mock data

## API Integration

### n8n Webhook Endpoint
```
URL: https://g37-ventures1.app.n8n.cloud/webhook/operations
Method: POST
Content-Type: application/json
```

### API Actions

#### Get All Events
```json
{
  "action": "get_events"
}
```

**Response Example:**
```json
[
  {
    "id": "recVP1kngd6X3rgxb",
    "createdTime": "2025-08-12T20:23:54.000Z",
    "event_title": "Meeting from 20250115-TestMeeting-Q1ProductLaunchPlanning.md",
    "source_type": "file",
    "source": "20250115-TestMeeting-Q1ProductLaunchPlanning.md",
    "meetingType": "planning",
    "description": "Q1 Product Launch Planning Meeting",
    "attendees": ["john@company.com", "sarah@company.com"],
    "date": "2025-01-15T14:00:00.000Z"
  }
]
```

#### Get Event Details (Attempted)
```json
{
  "action": "get_event_details",
  "event_id": "recVP1kngd6X3rgxb"
}
```

**Note:** This endpoint currently returns `null`, so the system falls back to the list search method.

## Data Flow

### Meeting List Integration

1. **Parallel API Calls**
   ```typescript
   // Meeting Manager API
   this.meetingService.getMeetings().subscribe(...)
   
   // n8n Webhook API
   this.http.post('https://g37-ventures1.app.n8n.cloud/webhook/operations', {
     action: 'get_events'
   }).subscribe(...)
   ```

2. **Data Mapping**
   ```typescript
   // Map n8n meetings to Meeting model
   n8nMeetings = (n8nData || []).map((ev: any) => ({
     ...ev,
     source: 'n8n',
     title: ev.event_title || ev.meetingType || 'n8n Meeting',
     date: ev.date || ev.meetingMetadata?.date || ev.startTime,
     id: ev.id || ev.eventId || ev.meetingId
   }));
   ```

3. **Visual Distinction**
   ```html
   <!-- Meeting Manager meetings show badge -->
   <mat-chip *ngIf="meeting.source === 'mm'" class="source-chip meeting-manager">
     Meeting Manager
   </mat-chip>
   
   <!-- n8n meetings show no badge for clean look -->
   ```

### Meeting Details Integration

1. **Multi-Tier Fallback System**
   ```typescript
   // Tier 1: Try direct details API
   loadN8nMeeting() {
     this.http.post(n8nUrl, { action: 'get_event_details', event_id: id })
   }
   
   // Tier 2: Search in list API
   loadN8nMeetingFromList() {
     this.http.post(n8nUrl, { action: 'get_events' })
     // Find meeting by multiple ID formats
   }
   
   // Tier 3: Professional error handling (no mock data)
   handleN8nDataNotFound() {
     this.error = `Meeting with ID ${id} was not found in n8n`
   }
   ```

2. **Smart ID Matching**
   ```typescript
   meetingData = response.find(meeting => 
     meeting.id === this.meetingId || 
     meeting.id === parseInt(this.meetingId || '0') ||
     meeting.eventId === this.meetingId ||
     meeting.meetingId === this.meetingId
   );
   ```

## User Experience

### Visual Design

- **Meeting Manager meetings**: Display "Meeting Manager" chip badge
- **n8n meetings**: Clean appearance without badge for visual balance
- **Consistent styling**: Both types use the same professional card layout
- **Source-aware navigation**: Query parameters maintain context between views

### Error Handling

- **Connection errors**: "Unable to connect to n8n. Please check your internet connection"
- **Missing meetings**: "Meeting with ID [id] was not found in n8n"
- **Server errors**: "n8n server error. Please try again later"
- **No mock data**: System never creates fake/placeholder meeting objects

### Performance

- **Independent API calls**: Meeting Manager and n8n calls run in parallel
- **Error isolation**: Failure in one source doesn't affect the other
- **Optimized rendering**: Only updates UI when both sources complete

## Technical Implementation

### Frontend Components

#### Meeting List Service Integration
```typescript
// Parallel API pattern
let mmCompleted = false;
let n8nCompleted = false;

const finalizeMeetings = () => {
  if (mmCompleted && n8nCompleted) {
    this.meetings = [...mmMeetings, ...n8nMeetings]
      .sort((a, b) => new Date(b.date || b.startTime || 0).getTime() - 
                      new Date(a.date || a.startTime || 0).getTime());
    this.loading = false;
  }
};
```

#### Source-Aware Routing
```typescript
// Meeting list navigation
navigateToDetails(meeting: any) {
  this.router.navigate(['/meetings', meeting.id], {
    queryParams: { source: meeting.source }
  });
}

// Meeting details initialization
ngOnInit() {
  this.meetingSource = this.route.snapshot.queryParams['source'] || 'mm';
}
```

### Data Models

#### Extended Meeting Interface
```typescript
interface Meeting {
  // ... existing Meeting properties
  source?: 'mm' | 'n8n';  // Source identifier
}
```

#### n8n Data Mapping
```typescript
// Organization and organizer defaults for n8n meetings
organization: {
  id: 0,
  name: 'n8n External',
  domain: 'n8n.cloud',
  // ... other required fields
}

organizer: {
  id: 0,
  firstName: 'n8n',
  lastName: 'System',
  email: 'n8n@system.com',
  // ... other required fields
}
```

## Testing

### Console Logging
The integration includes comprehensive console logging for debugging:

```javascript
✅ Meeting Manager response: 9 meetings
✅ n8n response: [{…}]
📞 Fetching n8n meeting details for ID: recVP1kngd6X3rgxb
✅ n8n list response for details lookup: [{…}]
🔍 Found meeting in list: {id: 'recVP1kngd6X3rgxb', ...}
✅ Creating n8n meeting from real data: {id: 'recVP1kngd6X3rgxb', ...}
```

### Verification Steps

1. **Open browser to http://localhost:4200**
2. **Verify meeting list shows both sources**
   - 9 meetings with "Meeting Manager" badges
   - 1 meeting without badge (from n8n)
3. **Click on n8n meeting**
   - Should load meeting details successfully
   - URL should include `?source=n8n`
   - Console should show successful data retrieval
4. **Test error scenarios**
   - Disconnect internet to test connection errors
   - Use invalid meeting ID to test not found errors

## Future Enhancements

### Potential Improvements

1. **Real-time Updates**: WebSocket integration for live n8n data updates
2. **Bidirectional Sync**: Ability to create/edit meetings in n8n from Meeting Manager
3. **Advanced Filtering**: Source-specific filtering options
4. **Batch Operations**: Bulk actions across both sources
5. **Caching Strategy**: Local caching for improved performance
6. **OAuth Integration**: Secure authentication with n8n workflows

### API Enhancements

1. **Individual Meeting Details**: If n8n implements `get_event_details` endpoint
2. **Meeting Creation**: POST endpoint for creating meetings in n8n
3. **Meeting Updates**: PUT/PATCH endpoints for meeting modifications
4. **Webhook Notifications**: Real-time updates when n8n meetings change

## Security Considerations

- **HTTPS Only**: All n8n API calls use secure HTTPS connections
- **Error Information**: Sensitive information not exposed in error messages
- **Input Validation**: Meeting IDs validated before API calls
- **CORS Handling**: Proper cross-origin request handling

## Troubleshooting

### Common Issues

1. **n8n API Unreachable**
   - Check internet connection
   - Verify n8n webhook URL accessibility
   - Review browser console for CORS errors

2. **Meeting Details Not Loading**
   - Verify meeting exists in n8n list API response
   - Check meeting ID format and encoding
   - Review console logs for API response details

3. **Performance Issues**
   - Monitor parallel API call completion
   - Check for network timeout issues
   - Verify optimal rendering with proper change detection

### Debug Commands

```bash
# Check n8n API connectivity
curl -X POST https://g37-ventures1.app.n8n.cloud/webhook/operations \
  -H "Content-Type: application/json" \
  -d '{"action": "get_events"}'

# Monitor frontend logs
# Open browser developer console and filter by "n8n" or "Meeting Manager"
```
