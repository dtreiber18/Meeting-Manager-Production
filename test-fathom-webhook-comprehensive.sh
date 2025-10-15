#!/bin/bash

# Comprehensive test script for Fathom webhook with Phase 2 analytics
# This creates realistic test data to demonstrate all advanced analytics features

WEBHOOK_URL="http://localhost:8080/api/webhooks/fathom"
WEBHOOK_SECRET="whsec_CIF5PJABq/URpAIE52gDdFlHBvRebkFT"

# Comprehensive Fathom webhook payload with realistic conversation
PAYLOAD='{
  "title": "Q4 Product Strategy & Budget Planning",
  "meeting_title": "Q4 Product Strategy & Budget Planning",
  "recording_id": 987654321,
  "url": "https://app.fathom.video/share/prod-strategy-q4",
  "share_url": "https://app.fathom.video/share/prod-strategy-q4-abc123",
  "created_at": "2025-10-14T22:00:00Z",
  "scheduled_start_time": "2025-10-14T21:00:00Z",
  "scheduled_end_time": "2025-10-14T22:00:00Z",
  "recording_start_time": "2025-10-14T21:02:00Z",
  "recording_end_time": "2025-10-14T21:52:00Z",
  "calendar_invitees_domains_type": "one_or_more_external",
  "transcript_language": "en",
  "transcript": [
    {
      "speaker": {
        "display_name": "John Smith",
        "matched_calendar_invitee_email": "john.smith@example.com"
      },
      "text": "Good morning everyone. Thanks for joining today. We have a lot to cover in the next hour. Let me start by sharing our Q4 objectives.",
      "timestamp": "00:00:15"
    },
    {
      "speaker": {
        "display_name": "Sarah Johnson",
        "matched_calendar_invitee_email": "sarah@acmecorp.com"
      },
      "text": "Thanks John. Before we dive in, can you clarify the timeline for the product launch?",
      "timestamp": "00:01:45"
    },
    {
      "speaker": {
        "display_name": "John Smith",
        "matched_calendar_invitee_email": "john.smith@example.com"
      },
      "text": "Great question. We decided to move the launch date to November 15th. This gives us more time for testing.",
      "timestamp": "00:02:10"
    },
    {
      "speaker": {
        "display_name": "Mike Chen",
        "matched_calendar_invitee_email": "mike.chen@example.com"
      },
      "text": "That makes sense. I will coordinate with the engineering team to ensure we hit that deadline. What about the budget allocation?",
      "timestamp": "00:02:45"
    },
    {
      "speaker": {
        "display_name": "John Smith",
        "matched_calendar_invitee_email": "john.smith@example.com"
      },
      "text": "Good point Mike. We have approved a budget increase of 20% for Q4. This will cover additional development resources and marketing spend.",
      "timestamp": "00:03:30"
    },
    {
      "speaker": {
        "display_name": "Sarah Johnson",
        "matched_calendar_invitee_email": "sarah@acmecorp.com"
      },
      "text": "Excellent! That budget increase will really help. I am concerned about the pricing strategy though. Have we finalized the enterprise tier pricing?",
      "timestamp": "00:04:15"
    },
    {
      "speaker": {
        "display_name": "Emily Rodriguez",
        "matched_calendar_invitee_email": "emily.rodriguez@example.com"
      },
      "text": "I can address that. We confirmed the pricing at $499 per month for the enterprise plan. We should review this with the sales team next week.",
      "timestamp": "00:05:00"
    },
    {
      "speaker": {
        "display_name": "Mike Chen",
        "matched_calendar_invitee_email": "mike.chen@example.com"
      },
      "text": "That pricing seems competitive. How does it compare to our competitors?",
      "timestamp": "00:06:20"
    },
    {
      "speaker": {
        "display_name": "Emily Rodriguez",
        "matched_calendar_invitee_email": "emily.rodriguez@example.com"
      },
      "text": "Great question. Our analysis shows we are about 15% lower than the market average. This should give us a competitive advantage.",
      "timestamp": "00:07:05"
    },
    {
      "speaker": {
        "display_name": "John Smith",
        "matched_calendar_invitee_email": "john.smith@example.com"
      },
      "text": "Perfect. Let me move on to the product roadmap. We need to prioritize features for the next release. What are the top customer requests?",
      "timestamp": "00:08:30"
    },
    {
      "speaker": {
        "display_name": "Sarah Johnson",
        "matched_calendar_invitee_email": "sarah@acmecorp.com"
      },
      "text": "From our client conversations, the most requested features are advanced analytics, API integrations, and better mobile support.",
      "timestamp": "00:09:15"
    },
    {
      "speaker": {
        "display_name": "Mike Chen",
        "matched_calendar_invitee_email": "mike.chen@example.com"
      },
      "text": "I agree with Sarah. The analytics feature is particularly important. I will schedule a technical planning session for next Monday to scope this out.",
      "timestamp": "00:10:45"
    },
    {
      "speaker": {
        "display_name": "Emily Rodriguez",
        "matched_calendar_invitee_email": "emily.rodriguez@example.com"
      },
      "text": "I think we should also consider the customer feedback on performance. We need to optimize the dashboard load times.",
      "timestamp": "00:12:20"
    },
    {
      "speaker": {
        "display_name": "John Smith",
        "matched_calendar_invitee_email": "john.smith@example.com"
      },
      "text": "Good point Emily. Let me make sure that is on our backlog. We will review the performance metrics in our next sprint planning.",
      "timestamp": "00:13:45"
    },
    {
      "speaker": {
        "display_name": "Sarah Johnson",
        "matched_calendar_invitee_email": "sarah@acmecorp.com"
      },
      "text": "One more thing - can we discuss the partnership with Acme Corp? They are interested in a pilot program.",
      "timestamp": "00:15:30"
    },
    {
      "speaker": {
        "display_name": "John Smith",
        "matched_calendar_invitee_email": "john.smith@example.com"
      },
      "text": "Absolutely. I will send them a proposal by Friday. This could be a significant revenue opportunity for us.",
      "timestamp": "00:16:20"
    },
    {
      "speaker": {
        "display_name": "Mike Chen",
        "matched_calendar_invitee_email": "mike.chen@example.com"
      },
      "text": "Should we include custom integration support in that proposal?",
      "timestamp": "00:17:45"
    },
    {
      "speaker": {
        "display_name": "Emily Rodriguez",
        "matched_calendar_invitee_email": "emily.rodriguez@example.com"
      },
      "text": "Yes, I think custom integrations would be a strong selling point. Let me coordinate with product to define the scope.",
      "timestamp": "00:18:30"
    },
    {
      "speaker": {
        "display_name": "John Smith",
        "matched_calendar_invitee_email": "john.smith@example.com"
      },
      "text": "Great collaboration everyone. To summarize our decisions: launch date is November 15th, budget approved at 20% increase, enterprise pricing confirmed at $499 per month.",
      "timestamp": "00:20:15"
    },
    {
      "speaker": {
        "display_name": "Sarah Johnson",
        "matched_calendar_invitee_email": "sarah@acmecorp.com"
      },
      "text": "Thank you for the clarity. I will communicate these updates to my stakeholders.",
      "timestamp": "00:21:30"
    }
  ],
  "default_summary": {
    "template_name": "Standard Meeting Summary",
    "markdown_formatted": "## Meeting Summary\n\n### Key Decisions\n- **Approved** Product launch date: November 15th\n- **Confirmed** Q4 budget increase of 20%\n- **Finalized** Enterprise tier pricing at $499/month\n\n### Discussion Topics\n\n#### Product Roadmap\n- Advanced analytics feature prioritization\n- API integration requirements\n- Mobile support improvements\n- Dashboard performance optimization\n\n#### Partnerships\n- Acme Corp pilot program opportunity\n- Custom integration offerings\n- Competitive pricing analysis (15% below market average)\n\n### Action Items\n- John to send Acme Corp proposal by Friday\n- Mike to schedule technical planning session for Monday\n- Emily to coordinate custom integration scope with product team\n- Team to review performance metrics in next sprint planning\n\n### Attendees\n- John Smith (Internal - Product Lead)\n- Sarah Johnson (External - Acme Corp)\n- Mike Chen (Internal - Engineering)\n- Emily Rodriguez (Internal - Product Marketing)\n\n### Next Steps\n- Technical planning session scheduled for next Monday\n- Follow-up with Acme Corp after proposal delivery\n- Sprint planning to include performance optimization"
  },
  "action_items": [
    {
      "description": "Send partnership proposal to Acme Corp including custom integration options",
      "user_generated": false,
      "completed": false,
      "recording_timestamp": "00:16:20",
      "recording_playback_url": "https://app.fathom.video/share/prod-strategy-q4?t=980",
      "assignee": {
        "name": "John Smith",
        "email": "john.smith@example.com",
        "team": "Product"
      }
    },
    {
      "description": "Schedule technical planning session for analytics feature - Monday next week",
      "user_generated": false,
      "completed": false,
      "recording_timestamp": "00:10:45",
      "recording_playback_url": "https://app.fathom.video/share/prod-strategy-q4?t=645",
      "assignee": {
        "name": "Mike Chen",
        "email": "mike.chen@example.com",
        "team": "Engineering"
      }
    },
    {
      "description": "Coordinate with product team to define custom integration scope",
      "user_generated": false,
      "completed": false,
      "recording_timestamp": "00:18:30",
      "recording_playback_url": "https://app.fathom.video/share/prod-strategy-q4?t=1110",
      "assignee": {
        "name": "Emily Rodriguez",
        "email": "emily.rodriguez@example.com",
        "team": "Product Marketing"
      }
    },
    {
      "description": "Coordinate with engineering team on November 15th launch deadline",
      "user_generated": true,
      "completed": false,
      "recording_timestamp": "00:02:45",
      "recording_playback_url": "https://app.fathom.video/share/prod-strategy-q4?t=165",
      "assignee": {
        "name": "Mike Chen",
        "email": "mike.chen@example.com",
        "team": "Engineering"
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
    },
    {
      "name": "Mike Chen",
      "matched_speaker_display_name": "Mike Chen",
      "email": "mike.chen@example.com",
      "email_domain": "example.com",
      "is_external": false
    },
    {
      "name": "Emily Rodriguez",
      "matched_speaker_display_name": "Emily Rodriguez",
      "email": "emily.rodriguez@example.com",
      "email_domain": "example.com",
      "is_external": false
    }
  ],
  "recorded_by": {
    "name": "John Smith",
    "email": "john.smith@example.com",
    "email_domain": "example.com",
    "team": "Product"
  },
  "crm_matches": {
    "error": "no CRM connected"
  }
}'

echo "🧪 Testing Fathom Webhook Integration - COMPREHENSIVE TEST"
echo "==========================================================="
echo ""
echo "📊 This test includes:"
echo "   ✓ 20+ transcript entries with realistic conversation"
echo "   ✓ 4 participants (3 internal, 1 external)"
echo "   ✓ Multiple questions for engagement analysis"
echo "   ✓ Various speaking patterns for balance analysis"
echo "   ✓ Rich summary with decisions, topics, action items"
echo "   ✓ Keywords for TF-IDF extraction"
echo ""

# Calculate HMAC signature
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" -binary | base64)
SIGNATURE_HEADER="v1,$SIGNATURE"

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
echo "   Body:"
echo "$HTTP_BODY" | jq '.' 2>/dev/null || echo "$HTTP_BODY"
echo ""

if [ "$HTTP_STATUS" == "200" ]; then
    echo "✅ Webhook received successfully!"
    echo ""
    echo "🎯 Phase 2 Analytics Features to Verify:"
    echo "   ✓ Participant Engagement (4 participants with different speaking patterns)"
    echo "   ✓ Keyword Extraction (budget, product, pricing, analytics, etc.)"
    echo "   ✓ AI-Detected Action Items (I will send..., should schedule...)"
    echo "   ✓ Topic Evolution (strategy → roadmap → partnerships → decisions)"
    echo "   ✓ Decision Extraction (3 major decisions made)"
    echo "   ✓ External Contact Detection (Sarah Johnson from Acme Corp)"
    echo ""
    echo "📊 View the meeting in UI:"
    echo "   Open: http://localhost:4200/meetings"
    echo "   Look for: 'Q4 Product Strategy & Budget Planning'"
    echo ""
    echo "🔍 Or check via API:"
    echo "   curl -s http://localhost:8080/api/meetings | jq '.[] | select(.title | contains(\"Q4 Product\"))'"
else
    echo "❌ Webhook failed with status $HTTP_STATUS"
    echo ""
    echo "Check backend console for errors"
fi
