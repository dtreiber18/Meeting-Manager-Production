# Settings Component Documentation

## Overview

The Settings component provides a comprehensive configuration interface for users to manage their Meeting Manager preferences. Built with Angular Material and reactive forms, it offers a professional, enterprise-grade user experience.

## Component Structure

### Location
- **Path**: `frontend/src/app/simple-settings/`
- **Route**: `/settings`
- **Navigation**: Accessible from the main navigation menu

### Files
- `simple-settings.component.ts` - Component logic and reactive forms
- `simple-settings.component.html` - Material Design template
- `simple-settings.component.scss` - Component-specific styling

## Features

### Three-Tab Interface

#### 1. Account Tab
- User profile management
- Display name and email configuration
- Avatar/profile picture settings
- **Timezone preferences** - Full IANA timezone support (Americas, Europe, Asia, etc.)
- Account preferences

#### 2. Sources Tab
- **Google Calendar Integration**
  - Toggle to enable/disable synchronization
  - Authentication status indicator
  - Sync frequency settings

- **Microsoft Outlook Integration**
  - Office 365 calendar connectivity
  - Exchange server configuration
  - Meeting invitation handling

- **Zoom Integration**
  - Automatic meeting link generation
  - Recording preferences
  - Participant management

#### 3. Destinations Tab
- **Email Notifications**
  - Meeting summaries and action items
  - Reminder preferences
  - Distribution list management

- **Slack Integration**
  - Channel posting for meeting updates
  - Direct message notifications
  - Bot integration settings

- **Microsoft Teams Integration**
  - Team channel notifications
  - Meeting recording storage
  - Collaboration settings

## Technical Implementation

### Reactive Forms
```typescript
export class SimpleSettingsComponent implements OnInit {
  settingsForm!: FormGroup;

  ngOnInit() {
    this.settingsForm = this.fb.group({
      // Account settings
      displayName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      
      // Integration toggles
      googleCalendarEnabled: [false],
      outlookEnabled: [false],
      zoomEnabled: [false],
      emailNotifications: [true],
      slackIntegration: [false],
      teamsIntegration: [false]
    });
  }
}
```

### Material Design Components
- **MatTabsModule**: Three-tab navigation interface
- **MatFormFieldModule**: Input fields with floating labels
- **MatInputModule**: Text inputs for user data
- **MatSlideToggleModule**: Toggle switches for integrations
- **MatButtonModule**: Action buttons (Save, Cancel, Reset)
- **MatIconModule**: Material icons for visual enhancement

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Adaptive layout for tablet and desktop screens
- Touch-friendly controls for mobile devices
- Consistent spacing and typography

## User Experience

### Visual Design
- Clean, professional interface following Material Design principles
- Consistent color scheme with primary/accent colors
- Proper spacing and visual hierarchy
- Loading states and success/error feedback

### Accessibility
- ARIA labels for screen readers
- Keyboard navigation support
- High contrast color combinations
- Focus indicators for interactive elements

### Form Validation
- Real-time validation with error messages
- Required field indicators
- Email format validation
- **Timezone validation** - Supports full IANA timezone names (up to 50 characters)
- Form state management (dirty, valid, touched)

## Integration Points

### Backend API (Planned)
- `POST /api/settings` - Save user preferences
- `GET /api/settings` - Retrieve current settings
- `PUT /api/settings` - Update specific settings
- `POST /api/integrations/connect` - Connect external services

### Service Layer
```typescript
@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = '/api/settings';

  saveSettings(settings: UserSettings): Observable<UserSettings> {
    return this.http.post<UserSettings>(this.apiUrl, settings);
  }

  getSettings(): Observable<UserSettings> {
    return this.http.get<UserSettings>(this.apiUrl);
  }
}
```

## Security Considerations

### Data Protection
- Sensitive data (OAuth tokens) stored securely
- HTTPS enforcement for all API calls
- Input sanitization and validation
- CSRF protection

### Authentication
- Azure AD B2C integration ready
- JWT token-based authentication
- Role-based access control (RBAC)
- Session management

## Testing Strategy

### Unit Tests
- Component initialization and form creation
- Validation logic and error handling
- User interaction simulations
- Service integration mocking

### Integration Tests
- End-to-end user workflows
- API endpoint connectivity
- External service integration
- Cross-browser compatibility

## Deployment Notes

### Environment Configuration
- API endpoints configurable per environment
- Feature flags for integration toggles
- Error logging and monitoring
- Performance optimization

### Monitoring
- User interaction analytics
- Form completion rates
- Error tracking and reporting
- Performance metrics

## Future Enhancements

### Planned Features
- Import/export settings functionality
- Team-wide setting templates
- Advanced notification rules
- Custom integration webhooks
- Multi-language support

### AI Integration
- Smart default configurations
- Usage pattern analysis
- Personalized recommendations
- Automated optimization suggestions

## Development Status

### Current State ✅
- Complete component implementation
- Working reactive forms
- Material Design integration
- Navigation and routing
- Responsive design
- **Timezone preferences** - Fully functional with IANA timezone support

### Next Steps
- Backend API integration
- External service authentication
- Form persistence
- Error handling enhancement
- Performance optimization
