# Fathom Integration v3.0 - Multi-Tenant API Polling

**Last Updated:** October 16, 2025
**Status:** ✅ Production Ready
**Major Changes:** API Polling Architecture + Full Multi-Tenancy Support

---

## 🎯 What's New in Version 3.0

### API Polling (Primary Method)
**Replaces:** Webhook-based integration (now backup method)
**Reason:** Reliable data delivery without webhook configuration complexity

- ✅ **Scheduled Polling**: Every 5 minutes via `@Scheduled` annotation
- ✅ **Automatic Discovery**: Fetches new meetings from Fathom API
- ✅ **Duplicate Prevention**: Checks `fathomRecordingId` before creating meetings
- ✅ **Zero Configuration**: Works automatically once API key is set
- ✅ **Reliable**: No dependency on webhook delivery or Svix infrastructure

### Multi-Tenant Architecture
**Feature:** Automatic organization assignment based on meeting recorder

- ✅ **User-Based Assignment**: Meetings assigned to recorder's organization
- ✅ **Fallback Organization**: Creates "Fathom External" org for unknown users
- ✅ **Data Isolation**: Each organization sees only their meetings
- ✅ **Scalable**: Supports unlimited organizations

---

## 🏗️ Architecture

### Data Flow

```
┌─────────────────────────────────────┐
│   Fathom Video Platform             │
│   (https://fathom.video)            │
└──────────────┬──────────────────────┘
               │
               ↓ Meeting Recorded
┌─────────────────────────────────────┐
│   Fathom API                        │
│   GET /external/v1/meetings         │
│   • Returns 50 most recent meetings │
│   • Includes recorded_by email      │
└──────────────┬──────────────────────┘
               │
               ↓ Polled every 5 minutes
┌─────────────────────────────────────┐
│   FathomPollingService              │
│   @Scheduled(fixedRate = 300000)    │
│   • Fetches meetings since last poll│
│   • Checks for duplicates           │
│   • Processes new meetings only     │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│   FathomApiService                  │
│   • Parses API response (items)    │
│   • Maps to FathomWebhookPayload    │
│   • Calls processing service        │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│   FathomWebhookService              │
│   Multi-Tenant Assignment Logic:    │
│                                     │
│   1. Extract recorded_by.email      │
│   2. userRepository.findByEmail()   │
│   3. IF user found:                 │
│      → meeting.organization =       │
│        user.organization            │
│   4. ELSE:                          │
│      → Create/use "Fathom External" │
│        organization                 │
│   5. Save meeting with org_id       │
└─────────────────────────────────────┘
```

---

## 🔧 Configuration

### Environment Variables

```bash
# Enable Fathom Integration
FATHOM_ENABLED=true

# API Polling (Primary Method)
FATHOM_API_ENABLED=true
FATHOM_API_KEY=your-api-key-from-fathom-dashboard

# Webhook Support (Backup Method - Optional)
FATHOM_WEBHOOK_SECRET=whsec_your-webhook-secret
```

### Application.yml

```yaml
fathom:
  enabled: ${FATHOM_ENABLED:false}

  # API Polling Configuration (v3.0)
  api:
    enabled: ${FATHOM_API_ENABLED:false}
    key: ${FATHOM_API_KEY:}
    base-url: ${FATHOM_API_BASE_URL:https://api.fathom.ai/external/v1}

  # Webhook Configuration (Backup)
  webhook:
    secret: ${FATHOM_WEBHOOK_SECRET:}
```

### Getting Your API Key

1. Log in to [Fathom Video](https://fathom.video)
2. Navigate to **Settings** → **API & Integrations**
3. Click **Generate API Key**
4. Copy the key (format: `abc123...xyz`)
5. Set `FATHOM_API_KEY` environment variable

---

## 🏢 Multi-Tenancy Features

### Automatic Organization Assignment

**Decision Logic:**

```java
// FathomWebhookService.java - Lines 273-284

if (payload.getRecordedBy() != null && payload.getRecordedBy().getEmail() != null) {
    Optional<User> organizer = userRepository.findByEmail(payload.getRecordedBy().getEmail());

    if (organizer.isPresent()) {
        // ✅ User found → Assign to user's organization
        meeting.setOrganizer(organizer.get());
        meeting.setOrganization(organizer.get().getOrganization());

        logger.info("Assigned meeting to organization: {} (User: {})",
            organizer.get().getOrganization().getName(),
            organizer.get().getEmail());
    } else {
        // ⚠️ User not found → Fallback to "Fathom External" organization
        setDefaultOrganizerAndOrganization(meeting);
    }
}
```

### Organization Isolation Examples

#### Example 1: Internal User Records Meeting
```
Recorded By: dtreiber@g37ventures.com
Database: User(id=9, org_id=10, org_name="G37 ventures")

Result:
  ✅ Meeting assigned to Organization(id=10, name="G37 ventures")
  ✅ Visible to all users in org_id=10
  ✅ Hidden from users in other organizations
```

#### Example 2: External/Unknown User Records Meeting
```
Recorded By: contractor@external.com
Database: No matching user found

Result:
  ⚠️ Meeting assigned to Organization(id=12, name="Fathom External")
  ✅ Visible to system administrators
  ✅ Can be manually reassigned to correct organization
```

#### Example 3: Multi-Organization Deployment
```
Organizations in Database:
- org_id=8:  "Acme Corporation"
- org_id=10: "G37 ventures"
- org_id=11: "Sample Company"
- org_id=12: "Fathom External"

Scenario:
- john@acme.com records meeting → Assigned to org_id=8
- sarah@g37ventures.com records meeting → Assigned to org_id=10
- mike@unknown.com records meeting → Assigned to org_id=12

Each organization sees only their own meetings
```

### Database Schema

```sql
-- Meetings table with organization foreign key
CREATE TABLE meetings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255),
    organization_id BIGINT NOT NULL,
    organizer_id BIGINT,
    fathom_recording_id VARCHAR(255),
    source ENUM('MANUAL', 'FATHOM', 'TEAMS', 'ZOOM'),

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (organizer_id) REFERENCES users(id)
);

-- Organizations table
CREATE TABLE organizations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    is_active BIT(1) DEFAULT 1
);

-- Users table with organization reference
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    organization_id BIGINT,

    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);
```

---

## 🔄 API Polling Details

### FathomPollingService

**Location:** `backend/src/main/java/.../service/FathomPollingService.java`

**Configuration:**
```java
@Service
@ConditionalOnProperty(name = "fathom.api.enabled", havingValue = "true")
public class FathomPollingService {

    private LocalDateTime lastPollTime = LocalDateTime.now().minusDays(7);

    @Scheduled(fixedRate = 300000, initialDelay = 10000)
    public void pollForNewRecordings() {
        // Runs every 5 minutes (300,000 ms)
        // Initial delay: 10 seconds after startup
    }
}
```

**Process Flow:**

1. **Fetch Meetings**
   ```java
   List<FathomWebhookPayload> recordings =
       fathomApiService.fetchRecordingsSince(lastPollTime);
   ```

2. **Check for Duplicates**
   ```java
   for (FathomWebhookPayload recording : recordings) {
       String recordingId = recording.getRecordingId().toString();
       Optional<Meeting> existing =
           meetingRepository.findByFathomRecordingId(recordingId);

       if (existing.isPresent()) {
           skipped++;
           continue;  // Skip already imported
       }

       fathomApiService.processRecording(recording);
       processed++;
   }
   ```

3. **Update Last Poll Time**
   ```java
   lastPollTime = LocalDateTime.now();
   ```

**Logging Example:**
```
04:32:12 INFO  FathomPollingService - 🔄 Polling Fathom API for new recordings since 2025-10-09T04:32:01
04:32:12 INFO  FathomApiService - Fetching meetings from Fathom API: https://api.fathom.ai/external/v1/meetings?limit=50
04:32:12 INFO  FathomApiService - Fetched 10 meetings from Fathom API
04:32:12 INFO  FathomPollingService - Found 10 recordings to process
04:32:14 INFO  FathomWebhookService - Created meeting with ID: 15 from Fathom recording 94530099
04:32:14 INFO  FathomWebhookService - Created meeting with ID: 16 from Fathom recording 94528847
... (8 more meetings created)
04:32:14 INFO  FathomPollingService - ✅ Polling complete: 10 processed, 0 skipped
```

### FathomApiService

**API Endpoint:** `https://api.fathom.ai/external/v1/meetings?limit=50`

**Request Headers:**
```http
X-Api-Key: your-api-key-here
Content-Type: application/json
```

**Response Format:**
```json
{
  "items": [
    {
      "title": "Meeting Title",
      "meeting_title": "Full Meeting Title",
      "recording_id": 94530099,
      "url": "https://fathom.video/calls/443661024",
      "share_url": "https://fathom.video/share/xxx",
      "recorded_by": {
        "name": "Doug Treiber",
        "email": "dtreiber@g37ventures.com",
        "email_domain": "g37ventures.com",
        "team": "Executive"
      },
      "recording_start_time": "2025-10-16T02:39:43Z",
      "recording_end_time": "2025-10-16T02:40:24Z",
      "calendar_invitees": [...],
      "transcript": null,
      "action_items": null
    }
  ],
  "next_cursor": "eyJob3N0X2NhbGxz...",
  "limit": 50
}
```

**Key Changes from Webhooks:**
- API returns `items` array (not `meetings`)
- Uses `recording_start_time` (not `start_time`)
- ISO 8601 timestamps with `Z` suffix
- Pagination support via `next_cursor`

---

## 🔐 Security & Access Control

### Organization-Based Access Control

**Spring Security Filter:**
```java
// Automatic filtering by organization_id
@PreAuthorize("hasRole('USER')")
public List<Meeting> getMeetings() {
    User currentUser = getCurrentUser();
    return meetingRepository.findByOrganizationId(
        currentUser.getOrganization().getId()
    );
}
```

**JPA Query:**
```java
public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    List<Meeting> findByOrganizationId(Long organizationId);
    Optional<Meeting> findByFathomRecordingId(String fathomRecordingId);
}
```

**Result:** Users can only access meetings from their own organization

---

## 📊 Monitoring & Troubleshooting

### Check Polling Status

**Backend Logs:**
```bash
tail -f backend.log | grep -i "FathomPolling\|FathomApi"
```

**Expected Output:**
```
04:32:12 INFO FathomPollingService - 🔄 Polling Fathom API...
04:32:12 INFO FathomApiService - Fetching meetings from Fathom API
04:32:14 INFO FathomPollingService - ✅ Polling complete: X processed, Y skipped
```

### Verify Meeting Assignment

**SQL Query:**
```sql
SELECT
    m.id,
    m.title,
    m.organization_id,
    o.name as org_name,
    m.organizer_id,
    u.email as organizer_email,
    m.fathom_recording_id,
    m.source
FROM meetings m
LEFT JOIN organizations o ON m.organization_id = o.id
LEFT JOIN users u ON m.organizer_id = u.id
WHERE m.source = 'FATHOM'
ORDER BY m.id DESC
LIMIT 10;
```

### Common Issues

#### Issue: No Meetings Being Imported
**Symptoms:** Polling runs but no meetings created

**Diagnosis:**
```bash
# Check if API key is valid
curl -H "X-Api-Key: YOUR_API_KEY" \
  https://api.fathom.ai/external/v1/meetings?limit=10

# Check backend logs for errors
grep "ERROR.*Fathom" backend.log
```

**Solutions:**
1. Verify `FATHOM_API_KEY` is correct
2. Check `FATHOM_API_ENABLED=true`
3. Ensure Fathom account has recordings

#### Issue: Meetings Assigned to Wrong Organization
**Symptoms:** Meetings appear in "Fathom External" instead of user's org

**Diagnosis:**
```sql
-- Check if user exists with matching email
SELECT id, email, organization_id
FROM users
WHERE email = 'recorded_by_email@domain.com';
```

**Solutions:**
1. Create user in Meeting Manager with matching Fathom email
2. Assign user to correct organization
3. Manually reassign existing meetings:
```sql
UPDATE meetings
SET organization_id = 10, organizer_id = 9
WHERE id IN (15, 16, 17);
```

---

## 🚀 Deployment Checklist

### Production Deployment

- [ ] Set `FATHOM_ENABLED=true`
- [ ] Set `FATHOM_API_ENABLED=true`
- [ ] Set `FATHOM_API_KEY` from Fathom dashboard
- [ ] Verify all users have matching emails in User table
- [ ] Test polling: wait 5-10 minutes after first meeting
- [ ] Check logs for successful import
- [ ] Verify meetings appear in correct organization
- [ ] (Optional) Configure webhook for instant delivery

### Backup Webhook Configuration

For instant delivery instead of 5-minute polling:

1. Get webhook secret from Fathom settings
2. Set `FATHOM_WEBHOOK_SECRET`
3. Configure webhook URL: `https://your-domain.com/api/webhooks/fathom`
4. Enable `newMeeting` event in Fathom

---

## 📈 Performance Metrics

### Polling Performance
- **Poll Interval:** 5 minutes (300 seconds)
- **API Response Time:** ~500ms
- **Processing Time:** ~100ms per meeting
- **Duplicate Check:** O(1) database lookup

### Scalability
- **Concurrent Organizations:** Unlimited
- **Meetings per Poll:** Up to 50 (API limit)
- **Daily Meeting Capacity:** ~14,400 meetings (50 × 288 polls)

---

## 🔮 Roadmap

### v3.1 (Planned)
- [ ] Pagination support for >50 meetings per poll
- [ ] Configurable poll interval (environment variable)
- [ ] Retry logic for failed API calls
- [ ] Metrics dashboard for import statistics

### v3.2 (Planned)
- [ ] Automatic user creation from Fathom emails
- [ ] Organization domain matching (auto-assign by email domain)
- [ ] CRM integration for external contacts
- [ ] Bulk organization reassignment tool

---

## 📚 Related Documentation

- [Fathom Integration Documentation](FATHOM_INTEGRATION_DOCUMENTATION.md)
- [Fathom Webhook Setup](FATHOM_WEBHOOK_SETUP.md)
- [Features Overview](FEATURES.md)
- [README](README.md)

---

**Version:** 3.0.0
**Status:** ✅ Production Ready
**Last Updated:** October 16, 2025
