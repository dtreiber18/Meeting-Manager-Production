# Fathom Integration Documentation

**Meeting Manager + Fathom Note-Taking App Integration**

Version: 2.0 (Phase 2 Complete)
Last Updated: October 14, 2025
Status: ✅ Production Ready (Phase 2: Advanced Analytics)

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Features](#features)
4. [Configuration](#configuration)
5. [API Reference](#api-reference)
6. [Data Models](#data-models)
7. [Intelligence & Analytics](#intelligence--analytics)
8. [Workflow Integration](#workflow-integration)
9. [Troubleshooting](#troubleshooting)
10. [Development Guide](#development-guide)

---

## Overview

### What is Fathom?

Fathom is an AI-powered meeting note-taking assistant that automatically:
- Records and transcribes meetings
- Generates AI summaries
- Extracts action items with assignments
- Provides timestamped playback

### Why Integrate?

Meeting Manager + Fathom Integration provides:

✅ **Automated Meeting Capture** - Meetings auto-import from Fathom
✅ **AI-Powered Intelligence** - Decisions, topics, speaker analytics
✅ **Action Item Tracking** - Timestamped tasks with recording links
✅ **External Contact Detection** - Auto-flag external participants
✅ **Workflow Automation** - Trigger N8N workflows from meeting events
✅ **CRM Enrichment** - Match contacts to Zoho/Salesforce (coming soon)

### Architecture

```
Fathom Meeting Recording
   ↓ (webhook when processing complete)
Meeting Manager Backend
   ├─ Webhook Signature Verification (HMAC SHA-256)
   ├─ Meeting Creation (source: FATHOM)
   ├─ Participant Creation (external flagging)
   ├─ Action Item Extraction (timestamps + recording links)
   └─ AI Intelligence Analysis
      ├─ Decision Extraction
      ├─ Topic Identification
      ├─ Speaker Balance Analysis
      └─ Effectiveness Scoring
   ↓
Meeting Manager Frontend
   ├─ Recording & Transcript Card
   ├─ Fathom AI Insights Panel
   ├─ Timestamped Action Items
   └─ External Contact Badges
```

---

## Quick Start

### Prerequisites

- Meeting Manager backend running
- Fathom account with webhook access
- MongoDB for pending actions (optional but recommended)

### 1. Configure Environment Variables

```bash
# .env file
FATHOM_ENABLED=true
FATHOM_WEBHOOK_SECRET=whsec_your_secret_from_fathom_settings
```

### 2. Configure Fathom Webhook

In your Fathom settings:

1. Navigate to **Settings** → **Webhooks**
2. Add new webhook endpoint:
   ```
   https://your-domain.com/api/webhooks/fathom
   ```
3. Copy the **Webhook Secret** to your `.env` file
4. Enable event: `newMeeting`
5. Save

### 3. Test the Integration

```bash
# Health check
curl http://localhost:8080/api/webhooks/fathom/health

# Expected response:
{
  "status": "healthy",
  "message": "Fathom webhook endpoint is active",
  "version": "1.0",
  "service": "fathom-webhook"
}
```

### 4. Verify First Meeting

After your next Fathom-recorded meeting:

1. Check backend logs:
   ```bash
   tail -f backend.log | grep -i fathom
   ```

2. View meeting in Meeting Manager:
   - Should see 🎤 "Imported from Fathom" badge
   - Action items with 🎥 "Play Recording" buttons
   - Full transcript and AI summary

---

## Features

### 1. Automatic Meeting Import

**What Fathom Sends:**
- Meeting title and participants
- Full transcript with speaker attribution
- AI-generated summary (markdown formatted)
- Action items with assignees and timestamps
- Recording URL with timestamp playback links

**What Meeting Manager Creates:**
- Meeting record (source: FATHOM, status: COMPLETED)
- Participant records (external contacts auto-flagged)
- Pending actions (approval workflow)
- Intelligence analysis (decisions, topics, speaker balance)

### 2. Recording Playback Integration

Every action item from Fathom includes:

```
🎥 Play Recording  ⏱️ 00:15:30
```

Clicking opens Fathom recording at the exact timestamp where the action was discussed.

**Example:**
```
Action: "Send pricing proposal to Sarah"
Recording: https://app.fathom.video/share/12345?t=930
```

User clicks → Fathom opens at 15:30 mark → Hears full context

### 3. AI Intelligence Analysis

Meeting Manager adds intelligence on top of Fathom's AI:

#### Decision Extraction
Parses Fathom summary for:
- "decided to", "agreed", "approved", "confirmed"
- Bolded items in markdown
- Items under "Decisions" section

**Example Output:**
```
✅ 3 Decisions Made:
- Approved Q4 budget increase of 15%
- Decided to launch product beta by Nov 1st
- Agreed to weekly check-ins every Monday
```

#### Topic Identification
Extracts key topics from:
- Section headers (## Topic Name)
- Capitalized phrases (Product Launch, Q4 Strategy)
- Frequency analysis (terms mentioned 2+ times)

**Example Output:**
```
🏷️ Key Topics:
- Product Launch
- Q4 Budget
- Sales Strategy
- Customer Feedback
- Team Expansion
```

#### Speaker Balance Analytics
Analyzes Fathom transcript to calculate:
- Speaking time per participant (% of total)
- Contribution count (how many times they spoke)
- Dominant speakers (>40% talk time)
- Silent participants (0 contributions)

**Example Output:**
```
👥 Speaker Balance:
John Smith    ████████████░░░░ 40% (12 contributions)
Sarah Johnson ███████░░░░░░░░░ 35% (8 contributions)
Mike Chen     █████░░░░░░░░░░░ 25% (6 contributions)

⚠️ John Smith dominated the conversation (40%)
```

#### Effectiveness Scoring
Calculates meeting quality (1-10) based on:
- Decision count
- Action item assignment rate
- Speaker balance
- Topic coverage vs agenda

**Example Output:**
```
Fathom-Enhanced Effectiveness: 8.5/10

✅ Strengths:
- 3 clear decisions made
- Action items clearly assigned
- Balanced participation

💡 Improvements:
- Consider shorter meeting duration
```

### 3.1 Phase 2: Advanced Analytics 🆕

**NEW in Version 2.0** - Sophisticated analytics that complement Fathom's AI:

#### Participant Engagement Analytics

Detailed engagement analysis for each participant:

**Metrics Tracked:**
- Individual engagement score (1-10 scale)
- Speaking time percentage
- Contribution count (number of times they spoke)
- Questions asked (indicates active listening)
- Average contribution length (concise vs verbose)

**Engagement Scoring Algorithm:**
- Baseline: 5 points
- Ideal speaking range (15-35%): +2 points
- Questions asked: +0.5 per question (max +2)
- Multiple contributions (10+): +1 point
- Under-participating (<10%): -2 points

**Example Output:**
```
👥 Participant Engagement (high engagement)

John Smith       Score: 8.5/10
  (15 contributions, 3 questions)

Sarah Johnson    Score: 7.2/10
  (12 contributions, 2 questions)

Mike Chen        Score: 4.8/10
  (4 contributions, 0 questions)

💡 Recommendations:
- Directly invite Mike Chen to share their thoughts
- Encourage more questions and discussion
```

#### Advanced Keyword Extraction

Uses TF-IDF-like algorithm to extract most relevant keywords:

**Algorithm:**
1. Tokenize transcript text
2. Remove stop words (60+ common words)
3. Calculate term frequency
4. Compute relevance score: `(count / totalWords) * log(totalWords / count)`
5. Sort by relevance and return top 20

**Example Output:**
```
🏷️ Most Relevant Keywords (Phase 2)
budget (15)    product (12)    launch (10)
pricing (8)    timeline (7)    customers (6)
strategy (5)   revenue (5)     competition (4)
```

#### AI-Detected Action Items from Transcript

Pattern-based action item detection:

**High Confidence Patterns:**
- "I will...", "I'll...", "Let me..."
- "I can...", "I'm going to..."

**Medium Confidence Patterns:**
- "We should...", "We need to..."
- "TODO", "Action item", "Next step"
- "Follow up", "By [date]..."

**Example Output:**
```
🎯 AI-Detected Action Items (5 found)

[HIGH] John Smith @ 15:30
"I'll send the pricing proposal by Friday"

[HIGH] Sarah Johnson @ 22:45
"Let me schedule the demo with the client"

[MEDIUM] Mike Chen @ 35:20
"We should review the budget before next quarter"
```

#### Topic Evolution Analysis

Shows how conversation topics changed over time:

**Algorithm:**
1. Divide transcript into 4 time segments
2. Extract keywords from each segment
3. Track topic progression
4. Identify when key discussions occurred

**Example Output:**
```
📊 Topic Evolution (Phase 2)

Segment 1 (0:00 - 12:30)
budget, planning, timeline, resources

Segment 2 (12:30 - 25:00)
product, launch, marketing, pricing

Segment 3 (25:00 - 37:30)
customers, feedback, competition, strategy

Segment 4 (37:30 - 50:00)
action, items, next, steps, deadlines
```

**Philosophy: "Augment, Don't Duplicate"**
- Phase 2 analytics complement Fathom's AI (not replace it)
- All processing done client-side (no external API calls)
- Focuses on insights Fathom doesn't provide:
  - Engagement scoring
  - Keyword relevance (vs just frequency)
  - Topic flow over time
  - Pattern-based action detection

### 4. External Contact Detection

Fathom provides `isExternal` flag for each participant.

**Meeting Manager automatically:**
- Creates participant records
- Flags external contacts (user == null)
- Displays 🌐 External badge in UI
- Prepares for CRM matching

**Use Case:**
Sales team meets with prospect → External contact auto-flagged → CRM sync workflow triggered → Contact created in Zoho

### 5. Workflow Automation

**Auto-triggered workflows based on Fathom events:**

| Fathom Event | Trigger | Action |
|--------------|---------|--------|
| Urgent action item detected | Priority == URGENT | Create approval workflow |
| External participant absent | isExternal && !attended | Send recording + summary email |
| Decision made | Decision detected | Broadcast to affected teams |
| Action item assigned | Assignee set | Create reminder workflow |
| Meeting with external contacts | isExternal present | Trigger CRM sync |

---

## Configuration

### Application.yml

```yaml
fathom:
  enabled: ${FATHOM_ENABLED:false}  # Set to 'true' to enable
  webhook:
    secret: ${FATHOM_WEBHOOK_SECRET:}  # HMAC SHA-256 secret from Fathom
```

### Environment Variables

```bash
# Required
FATHOM_ENABLED=true
FATHOM_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Optional (defaults shown)
FATHOM_WEBHOOK_TIMEOUT=30000  # milliseconds
FATHOM_MAX_RETRY_ATTEMPTS=3
```

### Conditional Activation

The Fathom integration uses Spring's `@ConditionalOnProperty`:

```java
@ConditionalOnProperty(
    name = "fathom.enabled",
    havingValue = "true",
    matchIfMissing = false
)
```

**Meaning:**
- If `FATHOM_ENABLED=true` → Integration active
- If `FATHOM_ENABLED=false` or not set → Integration disabled
- No performance impact when disabled

---

## API Reference

### Webhook Endpoint

#### Receive Fathom Webhook

```http
POST /api/webhooks/fathom
Content-Type: application/json
webhook-signature: v1,<HMAC-SHA256-signature>

{
  "title": "Meeting Title",
  "meeting_title": "Full Meeting Title",
  "recording_id": 123456789,
  "url": "https://app.fathom.video/share/xxxxx",
  "transcript": [...],
  "default_summary": {...},
  "action_items": [...],
  "calendar_invitees": [...]
}
```

**Request Headers:**
- `Content-Type`: Must be `application/json`
- `webhook-signature`: Format: `v1,<base64-encoded-HMAC>`

**Response (200 OK):**
```json
{
  "webhook_id": "uuid-here",
  "status": "received",
  "message": "Webhook received and queued for processing"
}
```

**Response (400 Bad Request):**
```json
{
  "webhook_id": "uuid-here",
  "status": "error",
  "message": "Invalid signature"
}
```

**Signature Verification:**

```java
// HMAC SHA-256 signature calculation
String signature = HMAC_SHA256(webhookSecret, rawPayload);
String expected = "v1," + Base64.encode(signature);

if (!provided.equals(expected)) {
    throw new SecurityException("Invalid signature");
}
```

#### Health Check

```http
GET /api/webhooks/fathom/health
```

**Response:**
```json
{
  "status": "healthy",
  "message": "Fathom webhook endpoint is active",
  "version": "1.0",
  "service": "fathom-webhook"
}
```

---

## Data Models

### Fathom Webhook Payload

```typescript
interface FathomWebhookPayload {
  title: string;
  meeting_title: string;
  recording_id: number;
  url: string;  // Recording playback URL
  share_url: string;
  created_at: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  calendar_invitees_domains_type: 'only_internal' | 'one_or_more_external';
  transcript_language: string;

  transcript: TranscriptEntry[];
  default_summary: Summary;
  action_items: ActionItem[];
  calendar_invitees: CalendarInvitee[];
  recorded_by: RecordedBy;
  crm_matches?: CrmMatches;
}

interface TranscriptEntry {
  speaker: {
    display_name: string;
    matched_calendar_invitee_email: string;
  };
  text: string;
  timestamp: string;  // Format: "HH:MM:SS"
}

interface ActionItem {
  description: string;
  user_generated: boolean;
  completed: boolean;
  recording_timestamp: string;  // "HH:MM:SS"
  recording_playback_url: string;  // Deep link with ?t=seconds
  assignee: {
    name: string;
    email: string;
    team: string;
  };
}

interface CalendarInvitee {
  name: string;
  email: string;
  email_domain: string;
  is_external: boolean;
  matched_speaker_display_name?: string;
}
```

### Meeting Manager Models

#### Meeting (Enhanced with Fathom)

```typescript
interface Meeting {
  // Standard fields
  id: number;
  title: string;
  startTime: Date;
  endTime: Date;
  status: 'COMPLETED';  // Fathom meetings are always completed

  // Fathom-specific fields
  source: 'FATHOM';
  recordingUrl: string;  // Fathom recording link
  transcriptUrl: string;  // Fathom share URL
  fathomRecordingId?: string;
  fathomSummary?: string;  // AI summary markdown
  transcript?: string;
  transcriptEntries?: TranscriptEntry[];

  // Relations
  participants: MeetingParticipant[];
  actionItems: ActionItem[];
}
```

#### Participant (with External Flagging)

```typescript
interface MeetingParticipant {
  id: number;
  email: string;
  name: string;
  user?: User | null;  // null for external participants
  participantRole: 'ATTENDEE' | 'ORGANIZER' | 'PRESENTER';
  attendanceStatus: 'PRESENT' | 'ABSENT' | 'UNKNOWN';

  // CRM Integration (future)
  isExternal?: boolean;  // Computed: user == null
  crmContactId?: string;
  crmSource?: 'zoho' | 'salesforce' | 'hubspot';
}
```

#### Pending Action (from Fathom)

```typescript
interface PendingAction {
  title: string;
  description: string;
  status: 'NEW' | 'APPROVED' | 'REJECTED';
  priority: 'MEDIUM';
  action_type: 'TASK';
  assignee_name: string;
  assignee_email: string;
  meeting_id: number;
  notes: string;  // Contains recording link + timestamp
  n8n_workflow_status: 'fathom_webhook';
  n8n_execution_id: string;  // Format: "fathom_{recording_id}"
}
```

---

## Intelligence & Analytics

### FathomIntelligenceService

Client-side service for analyzing Fathom data.

#### Decision Extraction

```typescript
extractDecisions(fathomSummary: string): string[]
```

**Algorithm:**
1. Split summary into lines
2. Check each line for decision keywords
3. Identify bolded items (`**text**`)
4. Extract items under "Decisions" section
5. Return unique decisions (max 8)

**Keywords:**
- decision, decided, agreed, approved, confirmed
- resolved, conclusion, determined, committed to

**Example:**
```typescript
const summary = `
## Decisions
- **Approved** Q4 budget increase
- Agreed to launch by Nov 1st
`;

const decisions = service.extractDecisions(summary);
// Returns: ["Approved Q4 budget increase", "Agreed to launch by Nov 1st"]
```

#### Topic Extraction

```typescript
extractTopics(fathomSummary: string, meetingTitle?: string): string[]
```

**Algorithm:**
1. Extract section headers (`## Topic`)
2. Find capitalized multi-word phrases
3. Frequency analysis (appears 2+ times)
4. Add meeting title keywords
5. Return top 10 topics

**Example:**
```typescript
const summary = `
## Product Launch
Discussed Product Launch timeline...
Product Launch scheduled for Q4...
`;

const topics = service.extractTopics(summary, "Q4 Product Launch Planning");
// Returns: ["Product Launch", "Q4", "Planning"]
```

#### Speaker Balance Analysis

```typescript
analyzeSpeakerBalance(transcript: TranscriptEntry[]): SpeakerAnalysis
```

**Algorithm:**
1. Calculate word count per participant
2. Estimate speaking time (150 words/min)
3. Calculate percentages
4. Flag dominant speakers (>40%)
5. Check if balanced (all 5-40%)

**Output:**
```typescript
{
  balanced: false,
  speakers: [
    {
      speaker: "John Smith",
      contributionCount: 12,
      estimatedTime: 240,  // seconds
      percentage: 40,
      wordCount: 600
    }
  ],
  dominantSpeaker: {
    speaker: "John Smith",
    percentage: 40
  }
}
```

#### Effectiveness Scoring

```typescript
analyzeMeetingEffectiveness(meeting: Meeting): EffectivenessAnalysis
```

**Scoring Factors:**
- Decision count (+1 per decision)
- Action item assignment rate (+1 if >80%)
- Speaker balance (+1 if balanced)
- Topic coverage (+0.5 if well-structured)
- Duration vs outcomes (-1 if >60min with <3 actions)

**Score Range:** 1-10

#### Phase 2: Advanced Analytics Methods 🆕

**NEW in Version 2.0** - Additional service methods for sophisticated analysis:

##### analyzeParticipantEngagement()

```typescript
analyzeParticipantEngagement(meeting: Meeting): {
  participants: ParticipantEngagement[];
  overallEngagement: 'high' | 'medium' | 'low';
  silentParticipants: string[];
  dominantSpeakers: string[];
  recommendations: string[];
}
```

**Algorithm:**
1. Analyze each transcript entry
2. Count contributions, questions, word count per speaker
3. Calculate speaking time using 150 words/min estimate
4. Compute engagement scores (1-10)
5. Generate recommendations

**Engagement Score Formula:**
```
Base score: 5
+ Speaking in ideal range (15-35%): +2
+ Questions asked: +0.5 per question (max +2)
+ High contribution count (10+): +1
- Under-participating (<10%): -2
- Over-dominating (>40%): penalty applied
```

##### extractKeywords()

```typescript
extractKeywords(transcript: TranscriptEntry[]): {
  word: string;
  count: number;
  relevance: number;
}[]
```

**TF-IDF Algorithm:**
1. Combine all transcript text
2. Tokenize and filter stop words (60+ common words)
3. Calculate term frequency (TF)
4. Calculate inverse document frequency (IDF)
5. Compute relevance: `(TF) * log(totalWords / count)`
6. Return top 20 keywords sorted by relevance

**Stop Words Excluded:**
- Common: the, is, at, and, or, but, in, with, to, of, for
- Pronouns: I, you, he, she, they, we
- Verbs: be, was, were, have, has, had, do, does
- And 40+ more...

##### extractActionItemsFromTranscript()

```typescript
extractActionItemsFromTranscript(transcript: TranscriptEntry[]): {
  description: string;
  speaker: string;
  timestamp: number;
  confidence: 'high' | 'medium' | 'low';
}[]
```

**Pattern Detection:**

**High Confidence Patterns:**
- `/i will/i` → "I will send the proposal"
- `/i'll/i` → "I'll follow up tomorrow"
- `/let me/i` → "Let me schedule that meeting"
- `/i can/i` → "I can review the doc"
- `/i'm going to/i` → "I'm going to call them"

**Medium Confidence Patterns:**
- `/we should/i` → "We should discuss this further"
- `/we need to/i` → "We need to finalize pricing"
- `/todo/i` → "TODO: Send the contract"
- `/action item/i` → "Action item: Review budget"
- `/follow up/i` → "Follow up with Sarah next week"
- `/by [date]/i` → "Submit proposal by Friday"

**Returns:** Array of detected action items with speaker attribution and timestamp

##### analyzeTopicEvolution()

```typescript
analyzeTopicEvolution(transcript: TranscriptEntry[]): {
  timeSegment: string;
  topics: string[];
  keywords: string[];
}[]
```

**Algorithm:**
1. Divide transcript into 4 equal time segments
2. For each segment:
   - Extract keywords using TF-IDF
   - Identify top 5 keywords
   - Format timestamp range (MM:SS format)
3. Return chronological topic progression

**Use Case:** Understand meeting flow, identify when key topics were discussed, detect topic drift

**Example:**
```typescript
const evolution = service.analyzeTopicEvolution(meeting.transcriptEntries);
// Returns:
[
  {
    timeSegment: "0:00 - 12:30",
    topics: ["budget", "planning", "timeline"],
    keywords: ["budget", "planning", "timeline", "resources", "Q4"]
  },
  {
    timeSegment: "12:30 - 25:00",
    topics: ["product", "launch", "marketing"],
    keywords: ["product", "launch", "marketing", "pricing", "customers"]
  },
  // ... 2 more segments
]
```

---

## Workflow Integration

### N8N Workflow Triggers

Fathom events can trigger N8N workflows.

#### Example: Notify Absent Stakeholders

**Trigger:** External participant absent from meeting

```json
{
  "event": "fathom_meeting_completed",
  "meeting_id": 123,
  "absent_external_contacts": [
    {
      "name": "Sarah Johnson",
      "email": "sarah@client.com",
      "is_external": true
    }
  ],
  "recording_url": "https://app.fathom.video/share/xxxxx",
  "summary": "Meeting summary here..."
}
```

**N8N Workflow:**
1. Receive webhook from Meeting Manager
2. For each absent external contact:
   - Send email with recording link
   - Include AI summary
   - Add to CRM follow-up list
3. Log notification in Meeting Manager

#### Example: Urgent Action Approval

**Trigger:** Fathom detects urgent action item

```json
{
  "event": "urgent_action_detected",
  "action_item": {
    "description": "Approve $100k budget increase",
    "assignee": "John Smith",
    "priority": "URGENT",
    "recording_timestamp": "00:23:45"
  },
  "meeting_id": 123
}
```

**N8N Workflow:**
1. Create approval request
2. Notify manager via Slack
3. Send email with recording link
4. Wait for approval
5. Update action item status

---

## Troubleshooting

### Webhook Not Received

**Symptom:** Fathom sends webhook but nothing happens

**Checks:**
1. Verify `FATHOM_ENABLED=true` in `.env`
2. Check backend logs:
   ```bash
   tail -f backend.log | grep -i fathom
   ```
3. Test health endpoint:
   ```bash
   curl http://localhost:8080/api/webhooks/fathom/health
   ```
4. Verify webhook signature matches secret

**Solution:**
```bash
# Restart backend with Fathom enabled
FATHOM_ENABLED=true ./start-backend-with-fathom.sh
```

### Invalid Signature Error

**Symptom:** `400 Bad Request - Invalid signature`

**Cause:** Webhook secret mismatch

**Solution:**
1. Get secret from Fathom settings
2. Update `.env`:
   ```bash
   FATHOM_WEBHOOK_SECRET=whsec_correct_secret_here
   ```
3. Restart backend

### Meetings Not Creating

**Symptom:** Webhook received but no meeting created

**Check logs:**
```bash
grep "Creating meeting\|ERROR" backend.log | tail -20
```

**Common issues:**
- Database connection failed
- Missing organization/user
- Duplicate meeting (already exists)

### Participants Not Showing

**Symptom:** Meeting created but participants empty

**Current Status:** Known issue - participants created before meeting save

**Workaround:** Participants will be added in next release

**Fix in progress:**
```java
// Save meeting first to get ID
Meeting savedMeeting = meetingRepository.save(meeting);

// Then create participants
createMeetingParticipants(savedMeeting, invitees);
```

---

## Development Guide

### Adding New Intelligence Features

#### Step 1: Update FathomIntelligenceService

```typescript
// frontend/src/app/services/fathom-intelligence.service.ts

export class FathomIntelligenceService {

  /**
   * Your new analysis method
   */
  analyzeNewFeature(fathomData: any): AnalysisResult {
    // Implementation here
    return result;
  }
}
```

#### Step 2: Update Intelligence Panel

```typescript
// meeting-intelligence-panel.component.ts

analyzeFathomData(): void {
  // Call your new method
  this.newFeature = this.fathomService.analyzeNewFeature(this.meeting);
}
```

#### Step 3: Add UI Template

```html
<!-- meeting-intelligence-panel.component.ts template -->
<div *ngIf="newFeature" class="new-feature-section">
  <h4>🆕 Your New Feature</h4>
  <p>{{ newFeature }}</p>
</div>
```

### Testing Webhooks Locally

Use the provided test script:

```bash
./test-fathom-webhook.sh
```

**Script features:**
- Generates HMAC signature automatically
- Sends mock Fathom payload
- Verifies response
- Shows how to check results

**Customize payload:**
```bash
# Edit test-fathom-webhook.sh
PAYLOAD='{
  "title": "Your Custom Meeting",
  // ... your test data
}'
```

### Backend Development

#### Adding Webhook Processing

```java
// FathomWebhookService.java

private void processNewFeature(FathomWebhookPayload payload) {
    // Your processing logic
    logger.info("Processing new feature from Fathom");

    // Extract data
    var data = payload.getSomeField();

    // Save to database
    repository.save(entity);

    // Trigger workflow
    n8nService.trigger("new-feature-detected", data);
}
```

#### Adding New Endpoints

```java
@RestController
@RequestMapping("/api/fathom")
public class FathomController {

    @GetMapping("/intelligence/{meetingId}")
    public ResponseEntity<IntelligenceData> getIntelligence(
        @PathVariable Long meetingId
    ) {
        var intelligence = fathomService.analyze(meetingId);
        return ResponseEntity.ok(intelligence);
    }
}
```

---

## Related Documentation

- [AI Intelligence Framework Design](docs/AI-Intelligence-Framework-Design.md)
- [N8N API Documentation](N8N_API_DOCUMENTATION.md)
- [Features Overview](FEATURES.md)
- [Changelog](CHANGELOG.md)

---

## Support

**Issues:** https://github.com/your-org/meeting-manager/issues
**Fathom Docs:** https://docs.fathom.video
**Contact:** support@your-domain.com

---

**Last Updated:** October 14, 2025
**Version:** 1.0.0
**Status:** ✅ Production Ready
