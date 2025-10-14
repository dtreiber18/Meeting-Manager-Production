#!/bin/bash

# Test script for Fathom webhook integration
# This script sends a mock Fathom webhook payload to the local endpoint

WEBHOOK_URL="http://localhost:8080/api/webhooks/fathom"
WEBHOOK_SECRET="whsec_CIF5PJABq/URpAIE52gDdFlHBvRebkFT"

# Sample Fathom webhook payload (simplified version)
PAYLOAD='{
  "title": "Test Sales Call with Acme Corp",
  "meeting_title": "Q4 Sales Strategy Meeting",
  "recording_id": 123456789,
  "url": "https://app.fathom.video/share/12345",
  "share_url": "https://app.fathom.video/share/12345-abcd",
  "created_at": "2025-10-14T21:00:00Z",
  "scheduled_start_time": "2025-10-14T20:00:00Z",
  "scheduled_end_time": "2025-10-14T21:00:00Z",
  "recording_start_time": "2025-10-14T20:05:00Z",
  "recording_end_time": "2025-10-14T20:55:00Z",
  "calendar_invitees_domains_type": "one_or_more_external",
  "transcript_language": "en",
  "transcript": [
    {
      "speaker": {
        "display_name": "John Smith",
        "matched_calendar_invitee_email": "john.smith@example.com"
      },
      "text": "Thanks for joining everyone. Let me share the Q4 roadmap.",
      "timestamp": "00:01:30"
    },
    {
      "speaker": {
        "display_name": "Sarah Johnson",
        "matched_calendar_invitee_email": "sarah@acmecorp.com"
      },
      "text": "Sounds great. We are particularly interested in the new features.",
      "timestamp": "00:02:15"
    }
  ],
  "default_summary": {
    "template_name": "Standard Meeting Summary",
    "markdown_formatted": "## Meeting Summary\n\n**Attendees:** John Smith, Sarah Johnson\n\n**Key Discussion Points:**\n- Q4 product roadmap review\n- Feature prioritization for Acme Corp\n- Timeline and deliverables discussion\n\n**Next Steps:**\n- John to send detailed feature specs by Friday\n- Sarah to review pricing proposal\n- Follow-up call scheduled for next week"
  },
  "action_items": [
    {
      "description": "Send detailed feature specifications document to Sarah",
      "user_generated": false,
      "completed": false,
      "recording_timestamp": "00:15:30",
      "recording_playback_url": "https://app.fathom.video/share/12345?t=930",
      "assignee": {
        "name": "John Smith",
        "email": "john.smith@example.com",
        "team": "Sales Engineering"
      }
    },
    {
      "description": "Review and approve pricing proposal for enterprise plan",
      "user_generated": false,
      "completed": false,
      "recording_timestamp": "00:22:45",
      "recording_playback_url": "https://app.fathom.video/share/12345?t=1365",
      "assignee": {
        "name": "Sarah Johnson",
        "email": "sarah@acmecorp.com",
        "team": "Procurement"
      }
    },
    {
      "description": "Schedule follow-up demo for next Wednesday",
      "user_generated": true,
      "completed": false,
      "recording_timestamp": "00:45:20",
      "recording_playback_url": "https://app.fathom.video/share/12345?t=2720",
      "assignee": {
        "name": "John Smith",
        "email": "john.smith@example.com",
        "team": "Sales Engineering"
      }
    }
  ],
  "calendar_invitees": [
    {
      "name": "John Smith",
      "matched_speaker_display_name": "John Smith",
      "email": "john.smith@example.com",
      "email_domain": "example.com",
      "is_external": false
    },
    {
      "name": "Sarah Johnson",
      "matched_speaker_display_name": "Sarah Johnson",
      "email": "sarah@acmecorp.com",
      "email_domain": "acmecorp.com",
      "is_external": true
    }
  ],
  "recorded_by": {
    "name": "John Smith",
    "email": "john.smith@example.com",
    "email_domain": "example.com",
    "team": "Sales Engineering"
  },
  "crm_matches": {
    "error": "no CRM connected"
  }
}'

echo "🧪 Testing Fathom Webhook Integration"
echo "======================================"
echo ""

# Calculate HMAC signature
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" -binary | base64)
SIGNATURE_HEADER="v1,$SIGNATURE"

echo "📝 Payload: $(echo "$PAYLOAD" | jq -c '.' | head -c 100)..."
echo "🔐 Signature: $SIGNATURE_HEADER"
echo ""
echo "📤 Sending webhook to: $WEBHOOK_URL"
echo ""

# Send webhook request
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "webhook-signature: $SIGNATURE_HEADER" \
  -d "$PAYLOAD" \
  "$WEBHOOK_URL")

# Extract HTTP status and body
HTTP_BODY=$(echo "$RESPONSE" | sed -e 's/HTTP_STATUS\:.*//g')
HTTP_STATUS=$(echo "$RESPONSE" | tr -d '\n' | sed -e 's/.*HTTP_STATUS://')

echo "📥 Response:"
echo "   Status: $HTTP_STATUS"
echo "   Body: $HTTP_BODY" | jq '.' 2>/dev/null || echo "   Body: $HTTP_BODY"
echo ""

if [ "$HTTP_STATUS" == "200" ]; then
    echo "✅ Webhook received successfully!"
    echo ""
    echo "🔍 Check the backend logs for processing details:"
    echo "   tail -f backend.log | grep -i fathom"
    echo ""
    echo "📊 Check if meeting was created:"
    echo "   curl -s http://localhost:8080/api/meetings | jq '.[] | select(.title | contains(\"Test Sales Call\"))'"
else
    echo "❌ Webhook failed with status $HTTP_STATUS"
    echo ""
    echo "🔍 Check backend logs:"
    echo "   tail -50 backend.log"
fi
