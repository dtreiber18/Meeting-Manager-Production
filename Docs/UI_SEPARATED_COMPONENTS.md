# Separated UI Components - Profile/Preferences/Calendar Settings

## Overview

As of September 2025, the Meeting Manager has implemented a complete UI restructuring that replaces the previous single tabbed preferences page with three dedicated, professional components. This separation improves user experience, reduces cognitive load, and provides clear navigation paths for different user concerns.

## New Component Architecture

### 1. Profile Component (`/profile`)

**File**: `frontend/src/app/profile/profile.component.ts`
**Route**: `/profile`
**Purpose**: Personal information and account management

#### Features
- **Personal Information Form**: Name, email, phone, job title, department, bio
- **Account Details**: User ID, organization info, role display
- **Professional Validation**: Reactive forms with Material Design validation
- **Read-Only Fields**: Email and organization information display
- **Responsive Design**: Mobile-optimized layout with proper breakpoints

#### Form Fields
```typescript
// Personal Information Section
- firstName: string (required, max 50 chars)
- lastName: string (required, max 50 chars) 
- phoneNumber: string (optional, phone validation)
- jobTitle: string (optional, max 100 chars)
- department: string (optional, max 100 chars)
- bio: string (optional, max 500 chars, textarea)

// Account Information (Read-Only)
- email: string (from currentUser)
- organizationName: string (from currentUser)
- roles: string[] (badge display)
```

#### Navigation Access
- Header dropdown → "My Profile"
- Direct URL: `/profile`

### 2. Preferences Component (`/preferences`)

**File**: `frontend/src/app/preferences/preferences.component.ts`
**Route**: `/preferences`
**Purpose**: Application settings and user preferences

#### Features
- **Theme Management**: Light/Dark theme selection with backend persistence
- **Notification Preferences**: Email, push, action items, weekly digest controls
- **Privacy Settings**: Profile visibility, online status, direct messages
- **Display Preferences**: Date format, time format, language, timezone
- **Backend Integration**: All settings persist to User entity via UserService

#### Settings Categories
```typescript
// Display Preferences
- theme: 'light' | 'dark' (persists to backend)
- dateFormat: string ('MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd')
- timeFormat: '12h' | '24h'
- language: string (dropdown selection)
- timezone: string (timezone picker)

// Notification Preferences  
- emailNotifications: boolean
- pushNotifications: boolean
- actionItemReminders: boolean
- weeklyDigest: boolean

// Privacy Settings
- profileVisibility: 'public' | 'organization' | 'private'
- showOnlineStatus: boolean
- allowDirectMessages: boolean
```

#### Navigation Access
- Header dropdown → "Preferences"
- Direct URL: `/preferences`

### 3. Calendar Settings Component (`/calendar-settings`)

**File**: `frontend/src/app/calendar-settings/calendar-settings.component.ts`
**Route**: `/calendar-settings`
**Purpose**: Calendar integration and meeting preferences

#### Features
- **Microsoft Graph Integration**: OAuth2 connection management
- **Working Hours Configuration**: Daily work schedule setup
- **Meeting Default Preferences**: Default duration, location, notification settings
- **Calendar Sync Controls**: Enable/disable calendar synchronization
- **Professional Interface**: Clean Material Design with proper form validation

#### Settings Categories
```typescript
// Calendar Integration
- calendarSync: boolean (enable/disable)
- microsoftGraphConnected: boolean (read-only status)
- defaultCalendar: string (calendar selection)

// Working Hours
- workingHours: {
    monday: { start: string, end: string, enabled: boolean }
    tuesday: { start: string, end: string, enabled: boolean }
    // ... for each day of week
  }

// Meeting Defaults
- defaultMeetingDuration: number (15, 30, 45, 60 minutes)
- defaultLocation: string
- defaultNotificationTime: number (5, 10, 15, 30 minutes before)
- autoAcceptMeetings: boolean
```

#### Navigation Access
- Header dropdown → "Calendar Settings"
- Direct URL: `/calendar-settings`

## Technical Implementation

### Routing Configuration

**File**: `frontend/src/app/app.routes.ts`

```typescript
// New dedicated routes
{
  path: 'profile',
  loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent),
  canActivate: [authGuard]
},
{
  path: 'preferences', 
  loadComponent: () => import('./preferences/preferences.component').then(m => m.PreferencesComponent),
  canActivate: [authGuard]
},
{
  path: 'calendar-settings',
  loadComponent: () => import('./calendar-settings/calendar-settings.component').then(m => m.CalendarSettingsComponent),
  canActivate: [authGuard]
}
```

### Navigation Updates

**File**: `frontend/src/app/shared/header/header.component.html`

```html
<!-- Updated dropdown menu -->
<mat-menu #userMenu="matMenu" class="user-menu">
  <button mat-menu-item routerLink="/profile">
    <mat-icon>person</mat-icon>
    <span>My Profile</span>
  </button>
  <button mat-menu-item routerLink="/preferences">
    <mat-icon>settings</mat-icon>
    <span>Preferences</span>
  </button>
  <button mat-menu-item routerLink="/calendar-settings">
    <mat-icon>calendar_today</mat-icon>
    <span>Calendar Settings</span>
  </button>
  <mat-divider></mat-divider>
  <button mat-menu-item (click)="logout()">
    <mat-icon>logout</mat-icon>
    <span>Logout</span>
  </button>
</mat-menu>
```

### Backend Integration

#### Theme Persistence Fix

**Issue**: Theme settings were not persisting because backend User entity lacked theme-related fields.

**Solution**: Enhanced User entity with theme support:

```java
// User.java - Added theme fields
@Column(length = 50)
private String theme = "light";

@Column(length = 20) 
private String dateFormat = "MM/dd/yyyy";

@Column(length = 10)
private String timeFormat = "12h";

// Getters and setters...
```

**UserDTO.java** - Updated constructor and fields:
```java
public UserDTO(User user) {
    // ... existing fields
    this.theme = user.getTheme();
    this.dateFormat = user.getDateFormat(); 
    this.timeFormat = user.getTimeFormat();
}
```

**UserController.java** - Enhanced updateUserFields method:
```java
@PutMapping("/profile")
public ResponseEntity<?> updateUserFields(@RequestBody Map<String, Object> fields) {
    // ... existing logic
    if (fields.containsKey("theme")) {
        user.setTheme((String) fields.get("theme"));
    }
    if (fields.containsKey("dateFormat")) {
        user.setDateFormat((String) fields.get("dateFormat"));
    }
    if (fields.containsKey("timeFormat")) {
        user.setTimeFormat((String) fields.get("timeFormat"));
    }
}
```

### Service Integration

#### UserService Enhancement

**File**: `frontend/src/app/services/user.service.ts`

The UserService has been enhanced to support the new separated components:

```typescript
// Profile updates
updateUserProfile(profile: Partial<UserProfile>): Observable<UserProfile>

// Preference updates  
updateNotificationPreferences(preferences: NotificationPreferences): Observable<any>

// Theme persistence
updateTheme(theme: string): Observable<any>
```

## Benefits of Separation

### User Experience Improvements

1. **Clear Navigation**: Users understand exactly where to find specific settings
2. **Reduced Cognitive Load**: Each page focuses on a single concern
3. **Improved Mobile Experience**: Smaller, focused pages work better on mobile
4. **Better Accessibility**: Clearer page structure improves screen reader navigation

### Technical Benefits

1. **Lazy Loading**: Each component loads only when needed
2. **Code Organization**: Cleaner separation of concerns in codebase
3. **Maintainability**: Easier to maintain and update individual components
4. **Performance**: Smaller bundle sizes for each route

### Professional UI/UX

1. **Enterprise Standards**: Matches enterprise application navigation patterns
2. **Material Design Compliance**: Proper Material Design component usage
3. **Consistent Styling**: Unified styling system across all components
4. **Responsive Design**: Mobile-first approach with proper breakpoints

## Migration from Tabbed Interface

### Previous Structure (Deprecated)
- Single Settings component with Material tabs
- All preferences grouped in one interface
- Tabbed navigation within single page

### New Structure (Current)
- Three dedicated components with focused purposes
- Header dropdown navigation to dedicated pages
- Each component optimized for its specific use case

### Backward Compatibility
- Legacy routes still work during transition period
- Gradual migration path for existing users
- No data loss during UI restructuring

## Testing

### Component Testing
```bash
# Run tests for new components
ng test --include="**/profile/**"
ng test --include="**/preferences/**" 
ng test --include="**/calendar-settings/**"
```

### E2E Testing
```bash
# Test navigation flow
ng e2e --spec="navigation.e2e.ts"
```

### Manual Testing Checklist
- [ ] Profile page loads and displays user information
- [ ] Preferences page theme selection persists to backend
- [ ] Calendar settings page loads without errors
- [ ] Header dropdown navigation works correctly
- [ ] All forms validate properly
- [ ] Mobile responsive design works on all pages
- [ ] Theme changes apply immediately across application

## Future Enhancements

### Planned Improvements
1. **Profile Photo Upload**: Add avatar image upload functionality
2. **Advanced Privacy Controls**: Granular privacy settings
3. **Calendar Integration Expansion**: Support for Google Calendar and other providers
4. **Notification Preferences**: More granular notification controls
5. **Accessibility Enhancements**: Additional ARIA support and keyboard navigation

### Technical Roadmap
1. **Component State Management**: Consider NgRx for complex state
2. **Form Validation Enhancement**: Custom validators for enterprise requirements
3. **API Integration**: Enhanced backend APIs for additional preferences
4. **Internationalization**: Multi-language support for all components
5. **Performance Optimization**: Further lazy loading and bundle optimization

## Conclusion

The separated UI components represent a significant improvement in user experience and technical architecture. The clear separation of Profile, Preferences, and Calendar Settings provides users with intuitive navigation while maintaining enterprise-grade functionality and professional design standards.

This restructuring sets the foundation for future enhancements and demonstrates the Meeting Manager's commitment to professional, user-centered design.