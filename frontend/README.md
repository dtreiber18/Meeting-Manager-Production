# Meeting Manager Frontend

Angular 17+ enterprise meeting management application with Microsoft Calendar integration, professional UI components, and AI-powered features.

## 🚀 Features

### Microsoft Calendar Integration
- **OAuth2 Authentication**: Seamless Microsoft Graph API integration
- **Settings Management**: Professional Calendar Integration tab
- **Real-time Status**: Connection monitoring with user verification
- **Token Security**: Secure token storage with proper error handling
- **Environment Configuration**: Secure environment-based credential management

### Professional UI System
- **Enterprise Design**: Material Design + Tailwind CSS integration
- **Form Enhancement**: Global professional form styling system (400+ lines)
- **Responsive Layout**: Mobile-first design with professional breakpoints
- **Authentication UI**: Professional login/register interface with enterprise styling

### Core Components
- **Settings Component** (900+ lines): Enhanced with Calendar Integration tab
- **AI Chat Assistant**: Context-aware intelligent assistant
- **Meeting Management**: Comprehensive meeting interface with dual-source integration
- **Professional Header**: Enterprise navigation with glass morphism effects

## 🛠 Development Commands

### Development server
```bash
ng serve
# Navigate to http://localhost:4200/
# Automatic reload on file changes
```

### API Proxy Configuration
```bash
# Frontend proxies to backend via proxy.conf.json
# Backend: http://localhost:8080/api
# Proxy: /api/* → http://localhost:8080/api/*
```

### Build Commands

```bash
# Production build
ng build --configuration=production

# Development build
ng build

# Build artifacts stored in dist/ directory
```

## 🧪 Testing

```bash
# Unit tests via Karma
ng test

# End-to-end tests
ng e2e

# Linting
ng lint
```

## 📁 Project Structure

```
src/
├── app/
│   ├── auth/                    # Authentication system
│   │   ├── auth.component.ts    # Professional Material Design login/register UI (600+ lines)
│   │   ├── auth.service.ts      # Complete authentication management (300+ lines)
│   │   ├── auth.guard.ts        # Route protection guard
│   │   └── auth.interceptor.ts  # JWT token interceptor
│   ├── settings/                # Settings management with Calendar Integration
│   │   ├── settings.component.ts     # Enhanced with calendar management (900+ lines)
│   │   ├── settings.component.html   # Professional 4-tab interface with calendar
│   │   └── settings.component.scss   # Professional form styling (300+ lines)
│   ├── services/                # Business services
│   │   ├── calendar.service.ts        # Microsoft Graph API integration (200+ lines)
│   │   ├── chat.service.ts           # AI chat service
│   │   └── meeting.service.ts        # Meeting data service with dual-source support
│   ├── shared/                  # Shared components
│   │   └── header/              # Professional header component
│   │       ├── header.component.ts   # Header logic and navigation
│   │       ├── header.component.html # Professional header template
│   │       └── header.component.scss # Enterprise header styling (500+ lines)
│   └── models/                  # TypeScript models
├── styles/                      # Global styling system
│   ├── form-enhancement.scss    # Professional form enhancement system (400+ lines)
│   └── styles.scss             # Global CSS with Material overrides
└── environments/               # Environment configurations
```

## 🔧 Configuration

### Environment Variables
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: '/api',  // Proxied to backend
  appName: 'Meeting Manager'
};
```

### Proxy Configuration
```json
// proxy.conf.json
{
  "/api/*": {
    "target": "http://localhost:8080",
    "secure": true,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

## 🎨 Styling System

### Professional Form Enhancement
- Global form field styling with floating labels
- Enhanced validation states with animations
- Professional button styling with gradients
- Multiple color variants (primary, success, warning)
- Responsive grid system

### Enterprise UI Components
- Glass morphism effects with backdrop blur
- Professional avatar system with gradient backgrounds
- Enhanced dropdown menus with role badges
- Mobile-first responsive design
- Consistent Material Design integration

## 🔐 Authentication Integration

### JWT Token Management
- Automatic token injection via HTTP interceptor
- Route protection with authentication guards
- Role-based access control (RBAC)
- Secure token storage and refresh

### Calendar Integration
- Microsoft Graph OAuth2 flow
- Settings-based calendar management
- Real-time connection status monitoring
- Professional error handling and user feedback

## 📱 Progressive Web App (PWA)

The application is PWA-ready with:
- Service worker for offline functionality
- App manifest for mobile installation
- Push notification support (planned)
- Responsive design for mobile devices

## 🚀 Deployment

### Docker Build
```bash
# Build frontend container
docker build -t meeting-manager-frontend .

# Run with nginx
docker run -p 80:80 meeting-manager-frontend
```

### Azure Deployment
- Container Apps ready
- Nginx configuration included
- Environment variable support
- Health check endpoints
