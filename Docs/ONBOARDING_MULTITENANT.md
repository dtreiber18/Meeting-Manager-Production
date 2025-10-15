# Onboarding & Multi-Tenant Architecture Implementation Plan

**Version:** 1.0
**Date:** October 15, 2025
**Status:** Planning Phase
**Owner:** G37 Ventures

## Overview

This document outlines the complete onboarding flow and multi-tenant architecture for Meeting Manager. The system will support self-service organization onboarding, trial-to-paid conversion, integration setup (Fathom, Outlook, ClickUp, Zoho CRM), and secure data isolation for each customer organization.

---

## Business Requirements

### Onboarding Goals
- **Seamless Experience**: User completes signup to first meeting in < 5 minutes
- **Self-Service**: No manual intervention required for standard setup
- **Flexible Integrations**: Users can enable/disable integrations as needed
- **Trial Conversion**: Smooth path from trial to paid subscription
- **Data Migration**: Import existing meeting data during onboarding

### Multi-Tenancy Requirements
- **Data Isolation**: Complete separation of customer data
- **Tenant-Specific Config**: Each org has custom settings (webhook URLs, API keys)
- **Performance**: Sub-200ms query response times
- **Scalability**: Support 1000+ organizations
- **Security**: Row-level security, encrypted sensitive data

---

## Multi-Tenant Architecture

### Tenant Isolation Strategy: **Shared Database, Tenant-Discriminated Tables**

**Rationale**: Balances cost efficiency with data isolation. All organizations share same database, but every table has `organization_id` foreign key for tenant discrimination.

**Alternatives Considered**:
- ❌ **Separate Databases per Tenant**: Too expensive, complex management
- ❌ **Separate Schemas per Tenant**: Better than separate DBs, but schema management overhead
- ✅ **Shared Database with Row-Level Security**: Cost-effective, simpler to maintain, good performance

---

## Database Schema Updates

### Core Tenant Tables

#### `organizations` Table (Already Exists - Update)
```sql
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS org_slug VARCHAR(100) UNIQUE NOT NULL;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP NULL;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP NULL;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS onboarding_step VARCHAR(50) DEFAULT 'SIGNUP';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS settings JSON;
```

**Onboarding Steps**:
- `SIGNUP` - Email verification pending
- `PROFILE` - Organization details
- `INTEGRATIONS` - Configure Fathom, Outlook, etc.
- `TEAM` - Invite team members
- `BILLING` - Payment setup (for paid plans)
- `COMPLETE` - Onboarding finished

#### `organization_integrations` Table (New)
```sql
CREATE TABLE organization_integrations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    organization_id BIGINT NOT NULL,
    integration_type ENUM('FATHOM', 'OUTLOOK', 'GOOGLE_CALENDAR', 'CLICKUP', 'ZOHO_CRM') NOT NULL,
    is_enabled BOOLEAN DEFAULT FALSE,
    config JSON,  -- Integration-specific configuration
    webhook_url VARCHAR(500),  -- Tenant-specific webhook URL
    webhook_secret VARCHAR(255),  -- Encrypted
    api_key VARCHAR(255),  -- Encrypted
    oauth_token TEXT,  -- Encrypted OAuth token
    refresh_token TEXT,  -- Encrypted refresh token
    token_expires_at TIMESTAMP NULL,
    last_sync_at TIMESTAMP NULL,
    sync_status ENUM('ACTIVE', 'ERROR', 'DISABLED') DEFAULT 'DISABLED',
    error_message TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    UNIQUE KEY unique_org_integration (organization_id, integration_type)
);
```

#### `onboarding_progress` Table (New)
```sql
CREATE TABLE onboarding_progress (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    organization_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    current_step VARCHAR(50) NOT NULL,
    completed_steps JSON,  -- Array of completed step names
    skipped_steps JSON,  -- Array of skipped step names
    progress_percentage INT DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Add `organization_id` to Existing Tables

**All existing tables need tenant discrimination**:

```sql
-- Meetings table (if not already present)
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS organization_id BIGINT NOT NULL;
ALTER TABLE meetings ADD FOREIGN KEY (organization_id) REFERENCES organizations(id);
CREATE INDEX idx_meetings_org ON meetings(organization_id);

-- Participants table
ALTER TABLE participants ADD COLUMN IF NOT EXISTS organization_id BIGINT NOT NULL;
ALTER TABLE participants ADD FOREIGN KEY (organization_id) REFERENCES organizations(id);
CREATE INDEX idx_participants_org ON participants(organization_id);

-- Documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS organization_id BIGINT NOT NULL;
ALTER TABLE documents ADD FOREIGN KEY (organization_id) REFERENCES organizations(id);
CREATE INDEX idx_documents_org ON documents(organization_id);

-- Pending Actions table (MongoDB - add field to schema)
-- { organizationId: ObjectId, ... }

-- Add to ALL other tables: action_items, meeting_notes, etc.
```

---

## Onboarding Flow

### Step 1: Signup & Email Verification

**Frontend**: `signup.component.ts`

```typescript
export class SignupComponent {
  signupForm = this.fb.group({
    organizationName: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    acceptTerms: [false, Validators.requiredTrue]
  });

  async onSubmit(): Promise<void> {
    if (this.signupForm.invalid) return;

    const signupData = {
      organizationName: this.signupForm.value.organizationName,
      firstName: this.signupForm.value.firstName,
      lastName: this.signupForm.value.lastName,
      email: this.signupForm.value.email,
      password: this.signupForm.value.password
    };

    this.onboardingService.signup(signupData).subscribe({
      next: (response) => {
        // Show email verification message
        this.router.navigate(['/verify-email'], {
          queryParams: { email: signupData.email }
        });
      },
      error: (error) => {
        this.showError(error.message);
      }
    });
  }
}
```

**Backend**: `OnboardingController.java`

```java
@PostMapping("/api/onboarding/signup")
public ResponseEntity<OnboardingResponse> signup(@RequestBody SignupRequest request) {

    // Validate email not already registered
    if (userRepository.existsByEmail(request.getEmail())) {
        throw new BadRequestException("Email already registered");
    }

    // Generate unique org slug
    String orgSlug = generateOrgSlug(request.getOrganizationName());

    // Create organization
    Organization org = new Organization();
    org.setName(request.getOrganizationName());
    org.setOrgSlug(orgSlug);
    org.setTrialStartDate(Instant.now());
    org.setTrialEndDate(Instant.now().plus(14, ChronoUnit.DAYS));
    org.setOnboardingCompleted(false);
    org.setOnboardingStep("SIGNUP");
    org = organizationRepository.save(org);

    // Create user
    User user = new User();
    user.setFirstName(request.getFirstName());
    user.setLastName(request.getLastName());
    user.setEmail(request.getEmail());
    user.setPassword(passwordEncoder.encode(request.getPassword()));
    user.setOrganizationId(org.getId());
    user.setRole(UserRole.ORG_ADMIN);
    user.setEmailVerified(false);
    user = userRepository.save(user);

    // Generate email verification token
    String verificationToken = tokenService.generateEmailVerificationToken(user);

    // Send verification email
    emailService.sendVerificationEmail(user.getEmail(), verificationToken);

    // Create free trial subscription
    subscriptionService.createFreeTrial(org.getId());

    // Create onboarding progress
    OnboardingProgress progress = new OnboardingProgress();
    progress.setOrganizationId(org.getId());
    progress.setUserId(user.getId());
    progress.setCurrentStep("SIGNUP");
    progress.setCompletedSteps(List.of());
    progress.setProgressPercentage(0);
    onboardingProgressRepository.save(progress);

    return ResponseEntity.ok(new OnboardingResponse(org, user, verificationToken));
}
```

---

### Step 2: Organization Profile Setup

**Frontend**: `onboarding-profile.component.ts`

```typescript
export class OnboardingProfileComponent {
  profileForm = this.fb.group({
    industry: ['', Validators.required],
    companySize: ['', Validators.required],
    timezone: ['', Validators.required],
    primaryUseCase: [''],
    phoneNumber: ['']
  });

  industries = [
    'Technology', 'Healthcare', 'Finance', 'Retail',
    'Manufacturing', 'Education', 'Consulting', 'Other'
  ];

  companySizes = ['1-10', '11-50', '51-200', '201-500', '501+'];

  async onSubmit(): Promise<void> {
    const profileData = this.profileForm.value;

    this.onboardingService.updateProfile(profileData).subscribe({
      next: () => {
        this.router.navigate(['/onboarding/integrations']);
      },
      error: (error) => this.showError(error.message)
    });
  }

  skip(): void {
    this.onboardingService.skipStep('PROFILE').subscribe(() => {
      this.router.navigate(['/onboarding/integrations']);
    });
  }
}
```

---

### Step 3: Integration Setup

**Frontend**: `onboarding-integrations.component.ts`

```typescript
export class OnboardingIntegrationsComponent implements OnInit {
  integrations: Integration[] = [];

  ngOnInit(): void {
    this.loadIntegrations();
  }

  loadIntegrations(): void {
    this.onboardingService.getAvailableIntegrations().subscribe({
      next: (integrations) => {
        this.integrations = [
          {
            type: 'FATHOM',
            name: 'Fathom Note Taker',
            description: 'Automatically import meeting transcripts and action items',
            icon: '🎤',
            enabled: false,
            requiresConfig: true
          },
          {
            type: 'OUTLOOK',
            name: 'Microsoft Outlook',
            description: 'Sync calendar events and meetings',
            icon: '📧',
            enabled: false,
            requiresConfig: true
          },
          {
            type: 'CLICKUP',
            name: 'ClickUp',
            description: 'Create tasks from action items',
            icon: '✅',
            enabled: false,
            requiresConfig: true
          },
          {
            type: 'ZOHO_CRM',
            name: 'Zoho CRM',
            description: 'Link meeting participants to CRM contacts',
            icon: '📊',
            enabled: false,
            requiresConfig: true
          }
        ];
      }
    });
  }

  configureIntegration(integration: Integration): void {
    switch (integration.type) {
      case 'FATHOM':
        this.configureFathom();
        break;
      case 'OUTLOOK':
        this.configureOutlook();
        break;
      case 'CLICKUP':
        this.configureClickUp();
        break;
      case 'ZOHO_CRM':
        this.configureZohoCRM();
        break;
    }
  }

  configureFathom(): void {
    const dialogRef = this.dialog.open(FathomConfigDialogComponent, {
      width: '600px',
      data: { organizationId: this.organizationId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadIntegrations(); // Reload to show updated status
      }
    });
  }

  continueToNextStep(): void {
    this.router.navigate(['/onboarding/team']);
  }
}
```

**Fathom Configuration Dialog**:

```typescript
export class FathomConfigDialogComponent {
  webhookUrl: string;
  webhookSecret: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private onboardingService: OnboardingService,
    private dialogRef: MatDialogRef<FathomConfigDialogComponent>
  ) {
    // Generate tenant-specific webhook URL
    this.webhookUrl = `${environment.apiUrl}/api/webhooks/fathom?org=${data.organizationSlug}`;
  }

  saveConfiguration(): void {
    const config = {
      integrationType: 'FATHOM',
      webhookUrl: this.webhookUrl,
      webhookSecret: this.webhookSecret,
      enabled: true
    };

    this.onboardingService.saveIntegrationConfig(config).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (error) => {
        alert('Failed to save configuration: ' + error.message);
      }
    });
  }

  copyWebhookUrl(): void {
    navigator.clipboard.writeText(this.webhookUrl);
    // Show toast: "Webhook URL copied!"
  }
}
```

**Backend**: `IntegrationService.java`

```java
@Service
public class IntegrationService {

    @Autowired
    private OrganizationIntegrationRepository integrationRepository;

    @Autowired
    private EncryptionService encryptionService;

    public OrganizationIntegration saveIntegrationConfig(
        Long organizationId,
        IntegrationType type,
        IntegrationConfig config
    ) {
        OrganizationIntegration integration = integrationRepository
            .findByOrganizationIdAndIntegrationType(organizationId, type)
            .orElse(new OrganizationIntegration());

        integration.setOrganizationId(organizationId);
        integration.setIntegrationType(type);
        integration.setIsEnabled(config.isEnabled());
        integration.setWebhookUrl(config.getWebhookUrl());

        // Encrypt sensitive data
        if (config.getWebhookSecret() != null) {
            String encrypted = encryptionService.encrypt(config.getWebhookSecret());
            integration.setWebhookSecret(encrypted);
        }

        if (config.getApiKey() != null) {
            String encrypted = encryptionService.encrypt(config.getApiKey());
            integration.setApiKey(encrypted);
        }

        integration.setSyncStatus(SyncStatus.ACTIVE);
        integration.setConfig(config.toJson());

        return integrationRepository.save(integration);
    }

    public String getDecryptedWebhookSecret(Long organizationId, IntegrationType type) {
        OrganizationIntegration integration = integrationRepository
            .findByOrganizationIdAndIntegrationType(organizationId, type)
            .orElseThrow(() -> new NotFoundException("Integration not configured"));

        return encryptionService.decrypt(integration.getWebhookSecret());
    }
}
```

---

### Step 4: Team Invitation

**Frontend**: `onboarding-team.component.ts`

```typescript
export class OnboardingTeamComponent {
  inviteForm = this.fb.group({
    emails: this.fb.array([
      this.fb.control('', Validators.email)
    ])
  });

  get emailControls() {
    return (this.inviteForm.get('emails') as FormArray).controls;
  }

  addEmailField(): void {
    (this.inviteForm.get('emails') as FormArray).push(
      this.fb.control('', Validators.email)
    );
  }

  removeEmailField(index: number): void {
    (this.inviteForm.get('emails') as FormArray).removeAt(index);
  }

  sendInvites(): void {
    const emails = this.inviteForm.value.emails.filter(e => e && e.trim());

    if (emails.length === 0) {
      this.skip();
      return;
    }

    this.onboardingService.inviteTeamMembers(emails).subscribe({
      next: () => {
        this.router.navigate(['/onboarding/billing']);
      },
      error: (error) => this.showError(error.message)
    });
  }

  skip(): void {
    this.router.navigate(['/onboarding/billing']);
  }
}
```

**Backend**: `TeamInvitationService.java`

```java
@Service
public class TeamInvitationService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    public void inviteTeamMembers(Long organizationId, List<String> emails) {
        Organization org = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new NotFoundException("Organization not found"));

        for (String email : emails) {
            // Check if user already exists
            if (userRepository.existsByEmail(email)) {
                continue; // Skip already registered emails
            }

            // Generate invitation token
            String inviteToken = UUID.randomUUID().toString();

            // Create pending user record
            User user = new User();
            user.setEmail(email);
            user.setOrganizationId(organizationId);
            user.setRole(UserRole.USER);
            user.setEmailVerified(false);
            user.setInviteToken(inviteToken);
            userRepository.save(user);

            // Send invitation email
            Map<String, Object> templateData = new HashMap<>();
            templateData.put("organizationName", org.getName());
            templateData.put("inviteLink",
                "https://app.meetingmanager.com/accept-invite?token=" + inviteToken);

            emailService.sendTemplateEmail(
                email,
                "You've been invited to " + org.getName(),
                "team-invitation",
                templateData
            );
        }
    }
}
```

---

### Step 5: Billing Setup (Paid Plans Only)

**Frontend**: `onboarding-billing.component.ts`

```typescript
export class OnboardingBillingComponent implements OnInit {
  subscription?: Subscription;
  selectedPlan: 'MONTHLY' | 'ANNUAL' = 'MONTHLY';
  userCount: number = 5;

  ngOnInit(): void {
    this.onboardingService.getCurrentSubscription().subscribe({
      next: (subscription) => {
        this.subscription = subscription;

        // If already on trial, show upgrade options
        if (subscription.planType === 'FREE_TRIAL') {
          // Show plan selection
        } else {
          // Already paid - skip this step
          this.completeOnboarding();
        }
      }
    });
  }

  calculatePrice(): number {
    const pricePerUser = this.userCount <= 10 ? 49 : 39;
    const monthlyTotal = pricePerUser * this.userCount;

    return this.selectedPlan === 'ANNUAL' ?
      monthlyTotal * 12 * 0.8 : // 20% discount
      monthlyTotal;
  }

  async subscribeToPaidPlan(): Promise<void> {
    // Open payment method dialog
    const dialogRef = this.dialog.open(PaymentMethodDialogComponent, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(async (paymentMethodId) => {
      if (!paymentMethodId) return;

      this.billingService.createPaidSubscription({
        planType: this.selectedPlan,
        userCount: this.userCount,
        paymentMethodId: paymentMethodId
      }).subscribe({
        next: () => {
          this.completeOnboarding();
        },
        error: (error) => {
          alert('Payment failed: ' + error.message);
        }
      });
    });
  }

  continueTrial(): void {
    // User chooses to stay on trial
    this.completeOnboarding();
  }

  completeOnboarding(): void {
    this.onboardingService.completeOnboarding().subscribe(() => {
      this.router.navigate(['/dashboard']);
    });
  }
}
```

---

### Step 6: Onboarding Complete

**Backend**: Mark onboarding as complete

```java
@PostMapping("/api/onboarding/complete")
public ResponseEntity<Void> completeOnboarding(@AuthenticationPrincipal User user) {
    Organization org = organizationRepository.findById(user.getOrganizationId())
        .orElseThrow(() -> new NotFoundException("Organization not found"));

    org.setOnboardingCompleted(true);
    org.setOnboardingStep("COMPLETE");
    organizationRepository.save(org);

    OnboardingProgress progress = onboardingProgressRepository
        .findByOrganizationId(org.getId())
        .orElseThrow();

    progress.setCurrentStep("COMPLETE");
    progress.setProgressPercentage(100);
    progress.setCompletedAt(Instant.now());
    onboardingProgressRepository.save(progress);

    return ResponseEntity.ok().build();
}
```

---

## Multi-Tenant Webhook Routing

### Webhook URL Pattern

Each organization gets a unique webhook URL with their org slug:

```
https://app.meetingmanager.com/api/webhooks/fathom?org=acme-corp
https://app.meetingmanager.com/api/webhooks/fathom?org=techstartup
```

### Webhook Controller Updates

**File**: `FathomWebhookController.java`

```java
@RestController
@RequestMapping("/api/webhooks/fathom")
public class FathomWebhookController {

    @Autowired
    private IntegrationService integrationService;

    @PostMapping
    public ResponseEntity<String> handleFathomWebhook(
        @RequestParam("org") String orgSlug,
        @RequestBody String payload,
        @RequestHeader("X-Fathom-Signature") String signature
    ) {

        // Look up organization by slug
        Organization org = organizationRepository.findByOrgSlug(orgSlug)
            .orElseThrow(() -> new NotFoundException("Organization not found: " + orgSlug));

        // Get organization-specific webhook secret
        OrganizationIntegration integration = integrationService
            .getIntegration(org.getId(), IntegrationType.FATHOM);

        if (!integration.getIsEnabled()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Fathom integration disabled for this organization");
        }

        String webhookSecret = integrationService.getDecryptedWebhookSecret(
            org.getId(),
            IntegrationType.FATHOM
        );

        // Verify signature with org-specific secret
        if (!verifySignature(payload, signature, webhookSecret)) {
            log.warn("Invalid Fathom signature for org: {}", orgSlug);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Invalid signature");
        }

        // Process webhook with tenant context
        FathomWebhookPayload webhookData = parsePayload(payload);
        fathomService.processWebhook(org.getId(), webhookData);

        return ResponseEntity.ok("Webhook processed");
    }
}
```

---

## Tenant Context Injection

### Spring Security Tenant Filter

**File**: `TenantContextFilter.java`

```java
@Component
public class TenantContextFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {

        // Get authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth != null && auth.isAuthenticated()) {
            User user = (User) auth.getPrincipal();

            // Set tenant context
            TenantContext.setCurrentTenant(user.getOrganizationId());
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
```

**File**: `TenantContext.java`

```java
public class TenantContext {
    private static final ThreadLocal<Long> currentTenant = new ThreadLocal<>();

    public static void setCurrentTenant(Long organizationId) {
        currentTenant.set(organizationId);
    }

    public static Long getCurrentTenant() {
        return currentTenant.get();
    }

    public static void clear() {
        currentTenant.remove();
    }
}
```

### Repository Tenant Filtering

**Base Repository with Tenant Discrimination**:

```java
public interface TenantAwareRepository<T, ID> extends JpaRepository<T, ID> {

    @Override
    @Query("SELECT e FROM #{#entityName} e WHERE e.organizationId = :#{T(TenantContext).getCurrentTenant()}")
    List<T> findAll();

    @Query("SELECT e FROM #{#entityName} e WHERE e.id = :id AND e.organizationId = :#{T(TenantContext).getCurrentTenant()}")
    Optional<T> findById(@Param("id") ID id);
}
```

**Usage**:

```java
public interface MeetingRepository extends TenantAwareRepository<Meeting, Long> {
    // All queries automatically filtered by organizationId
    List<Meeting> findByStartTimeBetween(Instant start, Instant end);
}
```

---

## Data Migration During Onboarding

### Import Existing Data

**Frontend**: Upload CSV/Excel with existing meetings

```typescript
export class DataImportComponent {
  fileToUpload: File | null = null;

  onFileSelected(event: any): void {
    this.fileToUpload = event.target.files[0];
  }

  uploadFile(): void {
    if (!this.fileToUpload) return;

    const formData = new FormData();
    formData.append('file', this.fileToUpload);

    this.onboardingService.importMeetingData(formData).subscribe({
      next: (result) => {
        alert(`Imported ${result.count} meetings successfully`);
        this.router.navigate(['/onboarding/complete']);
      },
      error: (error) => {
        alert('Import failed: ' + error.message);
      }
    });
  }
}
```

**Backend**: Parse and import data

```java
@PostMapping("/api/onboarding/import-meetings")
public ResponseEntity<ImportResult> importMeetings(
    @RequestParam("file") MultipartFile file,
    @AuthenticationPrincipal User user
) throws IOException {

    List<Meeting> meetings = new ArrayList<>();

    try (BufferedReader reader = new BufferedReader(
        new InputStreamReader(file.getInputStream()))) {

        CSVParser parser = CSVFormat.DEFAULT.withFirstRecordAsHeader()
            .parse(reader);

        for (CSVRecord record : parser) {
            Meeting meeting = new Meeting();
            meeting.setOrganizationId(user.getOrganizationId()); // Tenant context
            meeting.setTitle(record.get("Title"));
            meeting.setStartTime(parseDateTime(record.get("Start Time")));
            meeting.setEndTime(parseDateTime(record.get("End Time")));
            // ... parse other fields

            meetings.add(meeting);
        }
    }

    meetingRepository.saveAll(meetings);

    return ResponseEntity.ok(new ImportResult(meetings.size()));
}
```

---

## Implementation Tasks

### Phase 1: Multi-Tenant Foundation (Week 1-2)
- [ ] Add `organization_id` to all existing tables
- [ ] Create migration scripts with tenant discrimination
- [ ] Implement TenantContext filter
- [ ] Update all repositories with tenant filtering
- [ ] Add `org_slug` to organizations table
- [ ] Test data isolation between tenants

### Phase 2: Onboarding Flow - Signup (Week 3)
- [ ] Build signup component with form validation
- [ ] Implement email verification flow
- [ ] Create organization and user during signup
- [ ] Generate unique org slugs
- [ ] Create free trial subscription automatically
- [ ] Send welcome email

### Phase 3: Onboarding Flow - Profile & Integrations (Week 4-5)
- [ ] Build organization profile setup component
- [ ] Create organization_integrations table
- [ ] Implement integration configuration dialogs (Fathom, Outlook, ClickUp, Zoho)
- [ ] Generate tenant-specific webhook URLs
- [ ] Build encryption service for API keys/secrets
- [ ] Test webhook routing with org parameter

### Phase 4: Onboarding Flow - Team & Billing (Week 6)
- [ ] Build team invitation component
- [ ] Implement team invitation email system
- [ ] Create accept-invite flow for new users
- [ ] Build billing step with plan selection
- [ ] Integrate with payment system (see PAYMENT_SYSTEM.md)
- [ ] Implement onboarding completion logic

### Phase 5: Data Migration & Import (Week 7)
- [ ] Build CSV/Excel import component
- [ ] Implement meeting data parser
- [ ] Add participant import support
- [ ] Create data validation and error reporting
- [ ] Test import with large datasets

### Phase 6: Onboarding Progress Tracking (Week 8)
- [ ] Create onboarding_progress table
- [ ] Build progress sidebar component
- [ ] Implement step completion tracking
- [ ] Add "skip step" functionality
- [ ] Create resume onboarding feature

### Phase 7: Testing & Optimization (Week 9-10)
- [ ] End-to-end testing of complete onboarding flow
- [ ] Test tenant data isolation thoroughly
- [ ] Load test with 100+ concurrent onboarding sessions
- [ ] Verify webhook routing under load
- [ ] Test trial-to-paid conversion flows
- [ ] Security audit of tenant discrimination

---

## Security Considerations

### Tenant Isolation
- **Row-Level Security**: Every query must filter by `organization_id`
- **API Authorization**: Verify user belongs to requested resource's tenant
- **Webhook Validation**: Verify org slug matches configured integration

### Sensitive Data Protection
- **Encryption at Rest**: Encrypt API keys, webhook secrets, OAuth tokens
- **Encryption in Transit**: HTTPS for all API calls
- **Key Rotation**: Support rotating webhook secrets without downtime

### Access Control
- **Onboarding Admin Only**: Only org admin can configure integrations
- **Team Invitations**: Verify inviter has permission to invite
- **Billing Access**: Restrict billing operations to org admin

---

## Monitoring & Alerts

### Key Metrics
- Onboarding completion rate (target: >70%)
- Time to first meeting (target: <5 minutes)
- Integration configuration success rate
- Trial-to-paid conversion rate
- Tenant query performance (target: <200ms)

### Alert Conditions
- Onboarding abandonment spike
- Failed integration configurations
- Webhook routing errors
- Slow queries with tenant filter
- Cross-tenant data leak attempts

---

## Resources

- [Multi-Tenancy Patterns](https://docs.microsoft.com/en-us/azure/architecture/patterns/multitenancy)
- [SaaS Onboarding Best Practices](https://www.appcues.com/blog/saas-onboarding-best-practices)
- [Stripe Customer Portal](https://stripe.com/docs/billing/subscriptions/customer-portal)

---

**Document Status**: Draft - Pending Review
**Next Review Date**: TBD
**Approval Required From**: CTO, Product Manager
