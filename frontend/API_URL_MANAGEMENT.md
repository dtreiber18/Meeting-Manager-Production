# API URL Management Guide

## 🚨 IMPORTANT: Preventing the "localhost:4200 vs localhost:8081" Issue

This document explains how to properly manage API URLs in the Meeting Manager application to prevent the recurring issue where API calls go to the wrong server.

## The Problem

Previously, services would use relative URLs like `/api/meetings` which would:
- ✅ Work in production (when frontend and backend are on the same domain)
- ❌ Fail in development (frontend on :4200, backend on :8081)
- ❌ Cause confusion and debugging headaches

## The Solution: Multiple Layers of Protection

### 1. 🔧 Use ApiConfigService (Primary Solution)

**✅ DO THIS:**
```typescript
import { ApiConfigService } from '../core/services/api-config.service';

@Injectable()
export class MyService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {}

  // Method 1: Use predefined endpoints (Recommended)
  getMeetings() {
    return this.http.get(this.apiConfig.endpoints.meetings());
  }

  getMeeting(id: string) {
    return this.http.get(this.apiConfig.endpoints.meeting(id));
  }

  // Method 2: Use getApiUrl() for custom endpoints
  getCustomEndpoint() {
    return this.http.get(this.apiConfig.getApiUrl('custom/endpoint'));
  }
}
```

**❌ NEVER DO THIS:**
```typescript
// These will cause the localhost:4200 vs localhost:8081 issue!
private apiUrl = '/api/meetings';           // ❌ Relative URL
private apiUrl = 'api/meetings';            // ❌ Relative URL
private apiUrl = `${window.location.origin}/api/meetings`; // ❌ Wrong origin
```

### 2. 🛡️ ESLint Protection (Automated Detection)

Our ESLint configuration will automatically catch relative URLs:

```bash
npm run lint  # Will fail if you use relative URLs
npm run lint:fix  # Auto-fix some issues
```

### 3. 🔄 URL Normalization Interceptor (Safety Net)

If a relative URL slips through, the interceptor will:
- Automatically fix it
- Log a warning in console
- Keep the app working while you fix the code

### 4. 🧪 Automated Testing (Continuous Validation)

```bash
npm run test:url-validation  # Test all services use correct URLs
npm run validate-api-urls    # Full validation (lint + tests)
```

## Available API Endpoints

The `ApiConfigService` provides these predefined endpoints:

```typescript
// Meeting endpoints
this.apiConfig.endpoints.meetings()           // GET /api/meetings
this.apiConfig.endpoints.meeting('123')       // GET /api/meetings/123

// User endpoints
this.apiConfig.endpoints.users()              // GET /api/users
this.apiConfig.endpoints.userProfile()        // GET /api/users/profile

// Authentication endpoints
this.apiConfig.endpoints.auth.login()         // POST /api/auth/login
this.apiConfig.endpoints.auth.logout()        // POST /api/auth/logout
this.apiConfig.endpoints.auth.refresh()       // POST /api/auth/refresh

// Notification endpoints
this.apiConfig.endpoints.notifications()      // GET /api/notifications
this.apiConfig.endpoints.notification('456')  // GET /api/notifications/456

// Settings endpoints
this.apiConfig.endpoints.settings()           // GET /api/settings

// Chat endpoints
this.apiConfig.endpoints.chat()               // GET /api/chat
this.apiConfig.endpoints.chatMessage()        // POST /api/chat/message
```

## Adding New Endpoints

### Option 1: Add to ApiConfigService (Recommended for common endpoints)

Edit `frontend/src/app/core/services/api-config.service.ts`:

```typescript
readonly endpoints = {
  // ... existing endpoints ...
  
  // Add your new endpoints here
  actionItems: () => this.getApiUrl('action-items'),
  actionItem: (id: string | number) => this.getApiUrl(`action-items/${id}`),
  
  reports: {
    weekly: () => this.getApiUrl('reports/weekly'),
    monthly: () => this.getApiUrl('reports/monthly'),
  }
};
```

### Option 2: Use getApiUrl() for one-off endpoints

```typescript
// For unique or rarely-used endpoints
someMethod() {
  return this.http.get(this.apiConfig.getApiUrl('unique/endpoint'));
}
```

## Development Workflow

1. **Before creating a new service:**
   ```bash
   npm run validate-api-urls  # Ensure current state is clean
   ```

2. **When creating a service that makes API calls:**
   - Import `ApiConfigService`
   - Use `this.apiConfig.endpoints.xxx()` or `this.apiConfig.getApiUrl()`
   - Never use relative URLs

3. **Before committing:**
   ```bash
   npm run validate-api-urls  # Validate your changes
   ```

4. **In CI/CD pipeline:**
   ```bash
   npm run validate-api-urls  # Automated validation
   ```

## Environment Configuration

The base API URL is configured in:

```typescript
// frontend/src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8081/api',  // Development backend
  // ...
};

// frontend/src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: '/api',  // Production: same origin
  // ...
};
```

## Debugging API Issues

If you're still getting wrong URLs:

1. **Check the console logs:**
   ```
   🔧 ApiConfigService initialized with base URL: http://localhost:8081/api
   🔧 MeetingService using ApiConfigService
   🔗 ApiConfigService.getApiUrl('meetings') → http://localhost:8081/api/meetings
   ```

2. **Verify service configuration:**
   ```bash
   npm run test:url-validation
   ```

3. **Check for relative URLs:**
   ```bash
   npm run lint
   ```

4. **Look for interceptor warnings:**
   ```
   ⚠️ URL Normalization Interceptor: Fixed relative URL
   Original: /api/meetings
   Fixed: http://localhost:8081/api/meetings
   ```

## Quick Reference

| ✅ Good | ❌ Bad |
|---------|--------|
| `this.apiConfig.endpoints.meetings()` | `'/api/meetings'` |
| `this.apiConfig.getApiUrl('users')` | `'api/users'` |
| `this.apiConfig.endpoints.meeting(id)` | `\`/api/meetings/\${id}\`` |

## Testing Your Changes

```bash
# Full validation suite
npm run validate-api-urls

# Individual tests
npm run lint                  # Check for relative URLs
npm run test:url-validation   # Test service configurations
npm run test:headless         # Full test suite
```

## Emergency Fix

If the interceptor isn't working and you need a quick fix:

1. Find the service with the wrong URL
2. Replace relative URL with `this.apiConfig.getApiUrl('endpoint')`
3. Add `ApiConfigService` to constructor
4. Run `npm run validate-api-urls` to confirm fix

---

**Remember:** This multi-layered approach ensures the "localhost:4200 vs localhost:8081" issue can never happen again!