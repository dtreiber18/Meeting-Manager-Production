# Microsoft Calendar Integration Setup Guide

## The Issue
Your calendar integration is failing because the Microsoft App Registration credentials are not properly configured.

## What You Need To Do

### 1. Create Microsoft App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Fill in:
   - **Name**: Meeting Manager Calendar Integration
   - **Supported account types**: Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI**: 
     - Platform: Web
     - URL: `http://localhost:4200/auth/callback`

### 2. Configure API Permissions

1. In your app registration, go to **API permissions**
2. Click **Add a permission** → **Microsoft Graph** → **Delegated permissions**
3. Add these permissions:
   - `Calendars.ReadWrite`
   - `User.Read`
4. Click **Grant admin consent** (if you're an admin)

### 3. Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Add description: "Meeting Manager Secret"
4. Set expiration: 12 months
5. **Copy the secret value immediately** (you won't see it again)

### 4. Update Configuration

Update `/backend/src/main/resources/application.yml`:

```yaml
app:
  microsoft:
    graph:
      enabled: true
      client-id: YOUR_CLIENT_ID_FROM_STEP_1
      client-secret: YOUR_CLIENT_SECRET_FROM_STEP_3
      tenant-id: YOUR_TENANT_ID_OR_common
      redirect-uri: http://localhost:4200/auth/callback
```

### 5. Test the Integration

1. Restart the backend: `./mvnw spring-boot:run -f backend/pom.xml`
2. Navigate to: `http://localhost:4200/calendar-setup`
3. Click "Connect Outlook Calendar"
4. Complete Microsoft OAuth flow
5. Create a meeting to test sync

## Current Status

- ✅ Frontend UI components are working
- ✅ Backend OAuth infrastructure is ready
- ❌ Microsoft App Registration needs real credentials
- ❌ API permissions need to be granted

## Error You're Seeing

The error "Failed to exchange authorization code for tokens" occurs because Microsoft is rejecting the token exchange request due to invalid credentials or missing permissions.

## Quick Test

You can verify your credentials work by testing the auth URL generation:

```bash
curl http://localhost:8080/api/calendar/oauth/auth-url
```

If this returns a valid Microsoft login URL, your client-id and basic config are correct.
