# Fathom Webhook Integration - Troubleshooting Guide

## 🎯 Issue Discovered & Fixed

### Problem
Your Fathom webhooks were being **rejected with 401 Unauthorized** errors.

### Root Cause
**Header name case mismatch:**
- Fathom (via Svix) sends: `Webhook-Signature` (capitalized)
- Your code was expecting: `webhook-signature` (lowercase)
- Spring Boot's `@RequestHeader` is case-sensitive

### Evidence
From ngrok request logs, we found **multiple webhook attempts from Fathom**:
```
User-Agent: Svix-Webhooks/1.77.0
Webhook-Signature: v1,bN2dLyJJff95POm4+ybbcrseBOgd/v3pGU1xF1+l35M=
Content-Length: 202546 (200KB+ of meeting data!)
Status: 401 Unauthorized
```

### Solution Applied
✅ Fixed `FathomWebhookController.java` line 51:
```java
// Before:
@RequestHeader(value = "webhook-signature", required = false) String signature

// After:
@RequestHeader(value = "Webhook-Signature", required = false) String signature
```

---

## 📋 Current Configuration

### Fathom Webhook Settings
**URL:** `https://20a1eda6fe21.ngrok-free.app/api/webhooks/fathom`

**Events Enabled:**
- ✅ Transcript
- ✅ Summary
- ✅ Action items

**Scopes:**
- ✅ My Recordings
- ✅ My Team-Shared Recordings
- ✅ Team Recordings
- ✅ External Recordings

**Webhook Secret:** `whsec_CIF5PJABq/URpAIE52gDdFlHBvRebkFT`

### Backend Configuration
**Environment Variables:**
- `FATHOM_ENABLED=true` ✅
- `FATHOM_WEBHOOK_SECRET=whsec_CIF5PJABq/URpAIE52gDdFlHBvRebkFT` ✅

**ngrok Tunnel:**
- Public URL: `https://20a1eda6fe21.ngrok-free.app`
- Local Port: 8080
- Status: Running ✅

---

## ✅ Verification Tests

### Test 1: Manual Webhook Test
We successfully tested the webhook endpoint with a simulated Fathom payload:

```bash
python3 test-fathom-webhook.py
```

**Result:** ✅ SUCCESS
- Webhook received and validated
- Meeting created in database (ID: 11)
- Appears in API response

### Test 2: Endpoint Accessibility
```bash
curl https://20a1eda6fe21.ngrok-free.app/api/webhooks/fathom/health
```

**Result:** ✅ SUCCESS
```json
{
  "status": "healthy",
  "service": "fathom-webhook",
  "message": "Fathom webhook endpoint is active",
  "version": "1.0"
}
```

---

## 🔄 What Happens Next

### Automatic Retry
Fathom (via Svix) automatically retries failed webhooks using an **exponential backoff strategy**:
- First retry: ~1 minute
- Second retry: ~5 minutes
- Third retry: ~15 minutes
- Continues for up to 3 days

**With the fix deployed, the next retry should succeed!**

### New Meetings
Any new Fathom recordings from now on will be delivered successfully.

---

## 📊 How to Monitor Webhook Delivery

### Option 1: ngrok Web Inspector
Open http://localhost:4040 in your browser to see:
- All incoming webhook requests
- Request/response details
- Payload contents
- Success/failure status

### Option 2: Backend Logs
Watch the backend logs for Fathom webhook processing:
```bash
# Watch backend output
tail -f backend.log | grep -i fathom

# Or check running process logs
# (backend is running in background)
```

Look for these log messages:
```
✅ SUCCESS:
INFO  c.g.m.c.FathomWebhookController - Received Fathom webhook ID: xxx
INFO  c.g.m.c.FathomWebhookController - Fathom webhook signature verified
INFO  c.g.m.service.FathomWebhookService - Created meeting with ID: xxx

❌ FAILURE:
WARN  c.g.m.c.FathomWebhookController - Fathom webhook received without signature
ERROR c.g.m.c.FathomWebhookController - Invalid Fathom webhook signature
```

### Option 3: Database
Check for new meetings from Fathom:
```bash
mysql -u${DB_USERNAME} -p${DB_PASSWORD} -D meeting_manager -e \
  "SELECT id, title, source, fathom_recording_id, created_at
   FROM meetings
   WHERE source = 'FATHOM'
   ORDER BY created_at DESC
   LIMIT 10;"
```

### Option 4: Application UI
Refresh your browser at http://localhost:4200 to see new meetings appear!

---

## 🔧 Forcing Fathom to Resend a Webhook

Unfortunately, Fathom doesn't provide a "Resend Webhook" button in their UI. You have these options:

### Option 1: Wait for Automatic Retry
The failed webhooks will automatically retry within minutes.

### Option 2: Re-save Webhook Configuration
1. Go to Fathom Settings → Webhooks
2. Click "Edit" on your webhook
3. Make a small change (e.g., toggle a scope off and back on)
4. Click "Save"
5. This may trigger a test webhook

### Option 3: Create a Test Recording
1. Start a quick Fathom recording (even just 30 seconds)
2. End the recording
3. Wait for Fathom to process it
4. Webhook will be sent automatically

### Option 4: Contact Fathom Support
Ask them to manually trigger a webhook resend for your account.

---

## 🚨 Troubleshooting

### Issue: ngrok URL Changed
If you restart ngrok, the public URL will change. You'll need to:
1. Get new URL: `curl -s http://localhost:4040/api/tunnels | python3 -c "import sys, json; print(json.load(sys.stdin)['tunnels'][0]['public_url'])"`
2. Update Fathom webhook settings with new URL

### Issue: Still Getting 401 Errors
Check that:
- Backend has been restarted with the fix
- Environment variable `FATHOM_WEBHOOK_SECRET` matches Fathom's secret
- The webhook URL in Fathom exactly matches your ngrok URL

### Issue: Webhooks Received but Meetings Not Created
Check backend logs for processing errors:
```bash
tail -f backend.log | grep -i "error\|exception"
```

### Issue: Meetings Created but Not Showing in UI
1. Check the API directly: `curl http://localhost:8080/api/meetings | grep -i fathom`
2. Clear browser cache and refresh
3. Check browser console for JavaScript errors

---

## 📝 Webhook Payload Structure

For reference, here's what Fathom sends (via Svix):

```json
{
  "title": "Meeting Title",
  "recording_id": 123456789,
  "url": "https://app.fathom.video/share/xxx",
  "share_url": "https://app.fathom.video/share/xxx",
  "scheduled_start_time": "2025-10-15T14:00:00Z",
  "scheduled_end_time": "2025-10-15T15:00:00Z",
  "transcript": [
    {
      "speaker": {
        "display_name": "John Doe",
        "matched_calendar_invitee_email": "john@example.com"
      },
      "text": "Meeting transcript...",
      "timestamp": "00:05:30"
    }
  ],
  "default_summary": {
    "markdown_formatted": "## Summary\\n\\nKey points..."
  },
  "action_items": [
    {
      "description": "Follow up on proposal",
      "assignee": {
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "recording_timestamp": "00:10:15"
    }
  ],
  "calendar_invitees": [...]
}
```

---

## 🎉 Success Indicators

You'll know everything is working when:

1. ✅ ngrok inspector shows HTTP 200 responses for `/api/webhooks/fathom`
2. ✅ Backend logs show "Successfully processed Fathom webhook"
3. ✅ Database has new meetings with `source = 'FATHOM'`
4. ✅ UI displays the meetings with Fathom badge/indicator
5. ✅ Meeting details show transcript, summary, and action items

---

## 📞 Need Help?

If you continue to experience issues:

1. Check ngrok inspector: http://localhost:4040
2. Review backend logs for errors
3. Verify environment variables are set correctly
4. Test with the manual test script: `python3 test-fathom-webhook.py`
5. Contact Fathom support for webhook delivery issues

---

**Last Updated:** October 15, 2025
**Status:** ✅ Fixed and ready for webhook delivery
**Next Action:** Wait for Fathom to retry failed webhooks or record a new test meeting
