#!/usr/bin/env python3
"""
Test script to manually send a Fathom webhook payload to your local server
This simulates what Fathom would send when a meeting is processed
"""

import requests
import json
import hmac
import hashlib
import base64
from datetime import datetime, timedelta

# Configuration
WEBHOOK_URL = "http://localhost:8080/api/webhooks/fathom"
WEBHOOK_SECRET = "whsec_CIF5PJABq/URpAIE52gDdFlHBvRebkFT"

# Sample Fathom webhook payload (based on your actual meeting structure)
payload = {
    "title": "Test Meeting from Script",
    "meeting_title": "Test Meeting from Script",
    "recording_id": 999888777,
    "url": "https://app.fathom.video/share/test-recording-xyz",
    "share_url": "https://app.fathom.video/share/test-recording-xyz",
    "created_at": datetime.now().isoformat(),
    "scheduled_start_time": (datetime.now() - timedelta(hours=1)).isoformat(),
    "scheduled_end_time": datetime.now().isoformat(),
    "recording_start_time": (datetime.now() - timedelta(hours=1)).isoformat(),
    "recording_end_time": datetime.now().isoformat(),
    "calendar_invitees_domains_type": "INTERNAL",
    "transcript_language": "en",
    "transcript": [
        {
            "speaker": {
                "display_name": "John Doe",
                "matched_calendar_invitee_email": "john@example.com"
            },
            "text": "Welcome to today's meeting. Let's discuss the project status.",
            "timestamp": "00:00:15"
        },
        {
            "speaker": {
                "display_name": "Jane Smith",
                "matched_calendar_invitee_email": "jane@example.com"
            },
            "text": "Thanks John. The project is on track and we should meet our deadline.",
            "timestamp": "00:01:30"
        }
    ],
    "default_summary": {
        "template_name": "default",
        "markdown_formatted": "## Meeting Summary\\n\\n### Key Points\\n- Project is on track\\n- Deadline will be met\\n- Next steps identified\\n\\n### Decisions\\n- Approved budget increase\\n- Confirmed timeline"
    },
    "action_items": [
        {
            "description": "Send project update to stakeholders",
            "user_generated": False,
            "completed": False,
            "recording_timestamp": "00:05:30",
            "recording_playback_url": "https://app.fathom.video/share/test-recording-xyz?timestamp=330",
            "assignee": {
                "name": "John Doe",
                "email": "john@example.com"
            }
        },
        {
            "description": "Review budget proposal by Friday",
            "user_generated": False,
            "completed": False,
            "recording_timestamp": "00:08:15",
            "recording_playback_url": "https://app.fathom.video/share/test-recording-xyz?timestamp=495",
            "assignee": {
                "name": "Jane Smith",
                "email": "jane@example.com"
            }
        }
    ],
    "calendar_invitees": [
        {
            "email": "john@example.com",
            "name": "John Doe",
            "organizer": True,
            "optional": False,
            "response_status": "accepted"
        },
        {
            "email": "jane@example.com",
            "name": "Jane Smith",
            "organizer": False,
            "optional": False,
            "response_status": "accepted"
        }
    ],
    "recorded_by": {
        "name": "John Doe",
        "email": "john@example.com"
    }
}

def generate_svix_signature(payload_str, webhook_id, timestamp, secret):
    """Generate Svix HMAC SHA-256 signature (used by Fathom)"""
    # Svix signs: webhook_id + "." + timestamp + "." + body
    # Secret should not include the "whsec_" prefix
    secret_for_signing = secret[7:] if secret.startswith("whsec_") else secret

    # Construct the signed content
    signed_content = f"{webhook_id}.{timestamp}.{payload_str}"

    # Calculate HMAC SHA-256
    signature = hmac.new(
        secret_for_signing.encode('utf-8'),
        signed_content.encode('utf-8'),
        hashlib.sha256
    ).digest()

    # Base64 encode the signature
    signature_b64 = base64.b64encode(signature).decode('utf-8')

    # Return in Svix format: "v1,SIGNATURE"
    return f"v1,{signature_b64}"

def test_webhook():
    """Send test webhook to local server"""

    # Convert payload to JSON string
    payload_json = json.dumps(payload, indent=2)

    # Generate Svix headers
    webhook_id = f"msg_test_{int(datetime.now().timestamp())}"
    webhook_timestamp = str(int(datetime.now().timestamp()))

    # Generate Svix signature
    signature = generate_svix_signature(payload_json, webhook_id, webhook_timestamp, WEBHOOK_SECRET)

    # Prepare headers (Svix format)
    headers = {
        'Content-Type': 'application/json',
        'Webhook-Signature': signature,
        'Webhook-Id': webhook_id,
        'Webhook-Timestamp': webhook_timestamp,
        'User-Agent': 'Svix-Webhooks/1.77.0 (test)'
    }

    print("=" * 80)
    print("🧪 Testing Fathom Webhook (Svix Format)")
    print("=" * 80)
    print(f"\n📍 Webhook URL: {WEBHOOK_URL}")
    print(f"\n🔑 Svix Headers:")
    print(f"   - Webhook-Signature: {signature}")
    print(f"   - Webhook-Id: {webhook_id}")
    print(f"   - Webhook-Timestamp: {webhook_timestamp}")
    print(f"\n📦 Payload Preview:")
    print(f"   - Title: {payload['title']}")
    print(f"   - Recording ID: {payload['recording_id']}")
    print(f"   - Transcript Entries: {len(payload['transcript'])}")
    print(f"   - Action Items: {len(payload['action_items'])}")
    print(f"   - Participants: {len(payload['calendar_invitees'])}")
    print("\n" + "=" * 80)
    print("📤 Sending webhook with Svix signature...")
    print("=" * 80 + "\n")

    try:
        # Send POST request
        response = requests.post(
            WEBHOOK_URL,
            headers=headers,
            data=payload_json,
            timeout=10
        )

        print(f"✅ Response Status: {response.status_code}")
        print(f"📄 Response Body:")
        print(json.dumps(response.json(), indent=2))

        if response.status_code == 200:
            print("\n" + "=" * 80)
            print("✅ SUCCESS! Webhook accepted")
            print("=" * 80)
            print("\n💡 Next Steps:")
            print("   1. Check your backend logs for processing messages")
            print("   2. Query the database to verify the meeting was created:")
            print("      mysql> SELECT id, title, source, fathom_recording_id FROM meetings ORDER BY id DESC LIMIT 1;")
            print("   3. Refresh your browser at http://localhost:4200 to see the new meeting")
        else:
            print(f"\n❌ FAILED with status {response.status_code}")

    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Could not connect to backend server")
        print("   Make sure the backend is running on http://localhost:8080")
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")

if __name__ == "__main__":
    test_webhook()
