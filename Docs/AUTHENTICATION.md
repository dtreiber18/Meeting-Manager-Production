# Authentication System Documentation

## Overview

The Meeting Manager application includes a comprehensive authentication system built with JWT tokens, role-based access control (RBAC), and Azure AD integration support. This document outlines the complete authentication architecture and implementation details.

## Architecture

### Frontend (Angular 17+)
- **AuthService**: Complete authentication state management
- **AuthComponent**: Material Design login/register interface  
- **AuthGuard**: Route protection for authenticated users
- **AuthInterceptor**: Automatic JWT token injection

### Backend (Spring Boot 3.2.8)
- **AuthController**: RESTful authentication endpoints
- **JwtService**: JWT token generation and validation
- **SecurityConfig**: Spring Security configuration with BCrypt
- **RBAC System**: Role and Permission entities

## Frontend Implementation

### AuthService (`frontend/src/app/auth/auth.service.ts`)

**Key Features (300+ lines):**
```typescript
class AuthService {
  // Authentication operations
  login(email: string, password: string): Observable<AuthResponse>
  register(user: RegisterRequest): Observable<AuthResponse>
  logout(): void
  
  // Token management
  getToken(): string | null
  refreshToken(): Observable<AuthResponse>
  isTokenExpired(): boolean
  
  // User state
  isAuthenticated(): boolean
  getCurrentUser(): Observable<User | null>
  
  // Authorization
  hasRole(role: string): boolean
  hasPermission(permission: string): boolean
  
  // Azure AD integration
  loginWithAzureAD(): void
  handleAzureCallback(code: string): Observable<AuthResponse>
}
```

**Implementation Details:**
- **Reactive State Management**: Uses BehaviorSubject for user state
- **Token Storage**: Secure localStorage with automatic cleanup
- **Error Handling**: Comprehensive error responses with user-friendly messages
- **Role Checking**: Client-side permission validation
- **Token Refresh**: Automatic token renewal before expiration

### AuthComponent (`frontend/src/app/auth/auth.component.ts`)

**Material Design Interface (250+ lines):**
```typescript
class AuthComponent {
  // Form management
  loginForm: FormGroup
  registerForm: FormGroup
  
  // UI state
  isLoading = false
  selectedTab = 0 // 0 = Login, 1 = Register
  
  // Validation
  emailValidators = [Validators.required, Validators.email]
  passwordValidators = [Validators.required, Validators.minLength(8)]
  
  // Actions
  onLogin(): void
  onRegister(): void
  onAzureLogin(): void
}
```

**Features:**
- **Tabbed Interface**: Switch between Login/Register
- **Form Validation**: Real-time validation with error messages
- **Loading States**: Visual feedback during authentication
- **Azure AD Button**: Enterprise SSO integration
- **Responsive Design**: Mobile-optimized layout

### AuthGuard (`frontend/src/app/auth/auth.guard.ts`)

**Route Protection:**
```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }
    
    // Store attempted URL for redirect after login
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }
}
```

### AuthInterceptor (`frontend/src/app/auth/auth.interceptor.ts`)

**Automatic Token Injection:**
```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  if (token && !authService.isTokenExpired()) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }
  
  return next(req);
};
```

## Backend Implementation

### AuthController (`backend/src/main/java/.../controller/AuthController.java`)

**REST Endpoints (400+ lines):**
```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request)
    
    @PostMapping("/register") 
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request)
    
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody RefreshRequest request)
    
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String token)
    
    @GetMapping("/profile")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserResponse> getProfile()
    
    @PostMapping("/azure-callback")
    public ResponseEntity<AuthResponse> azureCallback(@RequestBody AzureCallbackRequest request)
}
```

**Features:**
- **Comprehensive Validation**: Input validation with custom error messages
- **Security Annotations**: Method-level security with @PreAuthorize
- **Exception Handling**: Global error handling with detailed responses
- **Logging**: Security event logging for audit trails

### JwtService (`backend/src/main/java/.../service/JwtService.java`)

**JWT Token Management (200+ lines):**
```java
@Service
public class JwtService {
    private final String secretKey;
    private final long expirationTime;
    private final Set<String> blacklistedTokens;
    
    // Token operations
    public String generateToken(User user)
    public Claims getClaimsFromToken(String token)
    public boolean validateToken(String token)
    public boolean isTokenExpired(String token)
    
    // User extraction
    public String getUserEmailFromToken(String token)
    public Set<String> getRolesFromToken(String token)
    public Set<String> getPermissionsFromToken(String token)
    
    // Security
    public void blacklistToken(String token)
    public boolean isTokenBlacklisted(String token)
}
```

**Security Features:**
- **HMAC-SHA256 Signing**: Secure token signing with 256-bit keys
- **Claims Validation**: Comprehensive token validation
- **Token Blacklisting**: Logout token invalidation
- **Expiration Handling**: Automatic token expiry checking

### SecurityConfig (`backend/src/main/java/.../config/SecurityConfig.java`)

**Spring Security Configuration:**
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/actuator/health").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // Strong encryption
    }
}
```

## Database Schema

### Enhanced User Model

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    @Size(min = 60, max = 60) // BCrypt hash length
    private String passwordHash;
    
    @Column(nullable = false)
    private String firstName;
    
    @Column(nullable = false)
    private String lastName;
    
    // RBAC relationships
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles")
    private Set<Role> roles = new HashSet<>();
    
    // Azure AD integration
    private String azureObjectId;
    private String azureTenantId;
    
    // Audit fields
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

### RBAC System

**Role Entity:**
```java
@Entity
@Table(name = "roles")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String name; // USER, ADMIN, MANAGER
    
    private String description;
    
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "role_permissions")
    private Set<Permission> permissions = new HashSet<>();
}
```

**Permission Entity:**
```java
@Entity
@Table(name = "permissions")
public class Permission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String name; // READ, WRITE, DELETE, ADMIN
    
    private String description;
    private String resource; // Optional resource specification
}
```

## Configuration

### Application Properties

```yaml
app:
  jwt:
    secret: ${JWT_SECRET:super-secure-jwt-secret-key-that-is-at-least-256-bits-long-for-proper-security}
    expiration: ${JWT_EXPIRATION:86400000} # 24 hours
  
  cors:
    allowed-origins: ${CORS_ALLOWED_ORIGINS:http://localhost:4200,http://localhost:4202}

spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: ${AZURE_AD_ISSUER_URI:https://login.microsoftonline.com/your-tenant-id/v2.0}
          audiences: ${AZURE_AD_CLIENT_ID:your-client-id}
```

### Angular Routes Configuration

```typescript
const routes: Routes = [
  // Public routes
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: AuthComponent },
  { path: 'register', component: AuthComponent },
  
  // Protected routes
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'meetings', 
    component: MeetingsComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'settings', 
    component: SettingsComponent,
    canActivate: [AuthGuard]
  }
];
```

## Security Features

### Password Security
- **BCrypt Hashing**: Industry-standard password hashing with salt
- **Strength Requirements**: Minimum 8 characters with complexity rules
- **Hash Storage**: 60-character BCrypt hashes stored securely

### JWT Security
- **HMAC-SHA256**: Secure token signing algorithm
- **256-bit Keys**: Minimum key length for security compliance
- **Short Expiration**: 24-hour token lifetime with refresh capability
- **Token Blacklisting**: Logout invalidation for enhanced security

### Authorization
- **Role-Based Access**: USER and ADMIN roles with different permissions
- **Permission System**: Fine-grained permissions (READ, WRITE, DELETE, ADMIN)
- **Method Security**: Backend endpoint protection with @PreAuthorize
- **Route Guards**: Frontend route protection with AuthGuard

### Azure AD Integration
- **OAuth2 Configuration**: Ready for Azure AD B2C integration
- **SSO Support**: Single sign-on for enterprise environments
- **Hybrid Authentication**: Support for both local and Azure AD accounts

## API Reference

### Authentication Endpoints

#### POST /api/auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["USER"]
  },
  "expiresIn": 86400000
}
```

#### POST /api/auth/register
**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "organizationId": 1
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "email": "newuser@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "roles": ["USER"]
  }
}
```

#### POST /api/auth/refresh
**Request:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response:**
```json
{
  "token": "new_jwt_token_here",
  "refreshToken": "new_refresh_token_here",
  "expiresIn": 86400000
}
```

#### POST /api/auth/logout
**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "message": "Successfully logged out"
}
```

## Testing

### Frontend Tests
```bash
cd frontend
npm test                    # Unit tests for AuthService, AuthComponent
npm run test:e2e           # E2E authentication flow tests
```

### Backend Tests
```bash
cd backend
mvn test -Dtest=AuthControllerTest    # Authentication endpoint tests
mvn test -Dtest=JwtServiceTest        # JWT token tests
mvn test -Dtest=SecurityConfigTest    # Security configuration tests
```

## Deployment

### Environment Variables

**Required for Production:**
```bash
# JWT Configuration
JWT_SECRET=your-256-bit-secret-key-here
JWT_EXPIRATION=86400000

# Database
DB_USERNAME=meetingmanager
DB_PASSWORD=secure-password
DB_URL=jdbc:mysql://mysql-host:3306/meeting_manager

# Azure AD (Optional)
AZURE_AD_ISSUER_URI=https://login.microsoftonline.com/tenant-id/v2.0
AZURE_AD_CLIENT_ID=your-azure-app-client-id

# CORS
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Docker Configuration

**Backend Dockerfile:**
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/meeting-manager-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

## Troubleshooting

### Common Issues

**JWT Token Too Short Error:**
```
The specified key byte array is 152 bits which is not secure enough
```
**Solution:** Ensure JWT_SECRET is at least 32 characters (256 bits)

**CORS Errors:**
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:** Configure CORS_ALLOWED_ORIGINS environment variable

**Registration Fails:**
```
Registration failed. Please try again.
```
**Solution:** Check database connectivity and ensure Organization exists

### Debugging

**Enable Debug Logging:**
```yaml
logging:
  level:
    com.g37.meetingmanager: DEBUG
    org.springframework.security: DEBUG
```

**Check JWT Token:**
```bash
# Decode JWT token (header.payload.signature)
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." | cut -d. -f2 | base64 -d
```

## Security Considerations

### Production Recommendations

1. **Environment Variables**: Never commit secrets to version control
2. **HTTPS Only**: Force HTTPS in production environments
3. **Token Rotation**: Implement regular token rotation
4. **Rate Limiting**: Add rate limiting to authentication endpoints
5. **Audit Logging**: Log all authentication events
6. **Password Policies**: Enforce strong password requirements
7. **Session Management**: Implement proper session timeout
8. **Multi-Factor Authentication**: Consider MFA for enhanced security

### Security Headers

```java
// Add to SecurityConfig
http.headers(headers -> headers
    .frameOptions().deny()
    .contentTypeOptions().and()
    .httpStrictTransportSecurity(hstsConfig -> hstsConfig
        .maxAgeInSeconds(31536000)
        .includeSubdomains(true)
    )
);
```

## Migration Guide

### From Previous Versions

If upgrading from a version without authentication:

1. **Database Migration**: Run schema updates to add User, Role, Permission tables
2. **Environment Setup**: Configure JWT_SECRET and other authentication variables
3. **Route Updates**: Add AuthGuard to protected routes
4. **Component Updates**: Update components to use AuthService for user state

### Azure AD Migration

To enable Azure AD integration:

1. **Register Application**: Register app in Azure AD B2C
2. **Configure Endpoints**: Set AZURE_AD_ISSUER_URI and AZURE_AD_CLIENT_ID
3. **Update Frontend**: Enable Azure login button in AuthComponent
4. **Test Integration**: Verify SSO flow works correctly

## Support

For authentication-related issues:

1. Check this documentation first
2. Verify environment variables are set correctly
3. Check application logs for specific error messages
4. Test authentication endpoints manually with curl/Postman
5. Contact the development team with specific error details

## References

- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [JWT.io](https://jwt.io/) - JWT token debugging
- [Angular Material](https://material.angular.io/) - UI components
- [BCrypt](https://en.wikipedia.org/wiki/Bcrypt) - Password hashing
- [Azure AD B2C](https://docs.microsoft.com/en-us/azure/active-directory-b2c/) - Enterprise SSO
