# Payment System Implementation Plan

**Version:** 1.0
**Date:** October 15, 2025
**Status:** Planning Phase
**Owner:** G37 Ventures

## Overview

This document outlines the complete payment system implementation for Meeting Manager, enabling subscription-based SaaS revenue model with Stripe integration. The system will support trial-to-paid conversions, multiple subscription tiers, billing management, and comprehensive payment tracking.

---

## Business Requirements

### Subscription Model
- **Free Trial**: 14-day full-feature trial (no credit card required)
- **Trial with Card**: 30-day trial with credit card (auto-convert to paid)
- **Monthly Plans**: $49/user/month (1-10 users), $39/user/month (11+ users)
- **Annual Plans**: 20% discount on monthly rate
- **Enterprise**: Custom pricing for 50+ users

### Payment Features
- Credit card processing via Stripe
- Automatic recurring billing
- Invoice generation and delivery
- Failed payment retry logic (dunning)
- Proration for mid-cycle changes
- Self-service billing portal
- Payment method updates
- Billing history and receipts

---

## Architecture Overview

### Technology Stack
- **Payment Gateway**: Stripe
- **Backend**: Spring Boot + Stripe Java SDK
- **Database**: MySQL (subscription/payment data)
- **Frontend**: Angular + Stripe.js
- **Webhooks**: Stripe webhook handling for events

### Key Components
1. **Subscription Management Service** - Handles plan selection, upgrades, downgrades
2. **Payment Processing Service** - Processes payments via Stripe
3. **Invoice Service** - Generates and manages invoices
4. **Dunning Service** - Handles failed payment retries
5. **Billing Portal** - Customer self-service interface
6. **Webhook Handler** - Processes Stripe events

---

## Database Schema

### `subscriptions` Table
```sql
CREATE TABLE subscriptions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    organization_id BIGINT NOT NULL,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255) NOT NULL,
    plan_type ENUM('FREE_TRIAL', 'MONTHLY', 'ANNUAL', 'ENTERPRISE') NOT NULL,
    status ENUM('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'PAUSED') NOT NULL,
    user_count INT NOT NULL,
    price_per_user DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    trial_start_date TIMESTAMP,
    trial_end_date TIMESTAMP,
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);
```

### `payments` Table
```sql
CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    subscription_id BIGINT NOT NULL,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED') NOT NULL,
    payment_method_type VARCHAR(50),
    receipt_url TEXT,
    failure_reason TEXT,
    attempted_at TIMESTAMP NOT NULL,
    succeeded_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
);
```

### `invoices` Table
```sql
CREATE TABLE invoices (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    subscription_id BIGINT NOT NULL,
    stripe_invoice_id VARCHAR(255) UNIQUE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    amount_due DECIMAL(10, 2) NOT NULL,
    amount_paid DECIMAL(10, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('DRAFT', 'OPEN', 'PAID', 'VOID', 'UNCOLLECTIBLE') NOT NULL,
    invoice_pdf_url TEXT,
    hosted_invoice_url TEXT,
    due_date TIMESTAMP NOT NULL,
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
);
```

### `payment_methods` Table
```sql
CREATE TABLE payment_methods (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    organization_id BIGINT NOT NULL,
    stripe_payment_method_id VARCHAR(255) UNIQUE,
    type VARCHAR(50) NOT NULL,
    card_brand VARCHAR(50),
    card_last4 VARCHAR(4),
    card_exp_month INT,
    card_exp_year INT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);
```

### `billing_events` Table
```sql
CREATE TABLE billing_events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    subscription_id BIGINT NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    stripe_event_id VARCHAR(255) UNIQUE,
    event_data JSON,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
);
```

---

## Backend Implementation

### 1. Stripe Configuration Service

**File**: `src/main/java/com/g37/meetingmanager/config/StripeConfig.java`

```java
@Configuration
public class StripeConfig {

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    public String getWebhookSecret() {
        return webhookSecret;
    }
}
```

**Environment Variables** (`.env`):
```bash
STRIPE_API_KEY=sk_live_xxx  # Production key
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx  # For frontend
```

---

### 2. Subscription Service

**File**: `src/main/java/com/g37/meetingmanager/service/SubscriptionService.java`

```java
@Service
public class SubscriptionService {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    /**
     * Create free trial subscription (no credit card)
     */
    public Subscription createFreeTrial(Long organizationId) {
        Organization org = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new NotFoundException("Organization not found"));

        Subscription subscription = new Subscription();
        subscription.setOrganizationId(organizationId);
        subscription.setPlanType(PlanType.FREE_TRIAL);
        subscription.setStatus(SubscriptionStatus.TRIAL);
        subscription.setUserCount(org.getUserCount());
        subscription.setPricePerUser(BigDecimal.ZERO);
        subscription.setTotalAmount(BigDecimal.ZERO);
        subscription.setTrialStartDate(Instant.now());
        subscription.setTrialEndDate(Instant.now().plus(14, ChronoUnit.DAYS));
        subscription.setCurrentPeriodStart(Instant.now());
        subscription.setCurrentPeriodEnd(Instant.now().plus(14, ChronoUnit.DAYS));

        return subscriptionRepository.save(subscription);
    }

    /**
     * Start paid subscription with Stripe
     */
    public Subscription createPaidSubscription(
        Long organizationId,
        String paymentMethodId,
        PlanType planType
    ) throws StripeException {

        Organization org = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new NotFoundException("Organization not found"));

        // Create Stripe customer
        CustomerCreateParams customerParams = CustomerCreateParams.builder()
            .setEmail(org.getPrimaryEmail())
            .setName(org.getName())
            .setPaymentMethod(paymentMethodId)
            .setInvoiceSettings(
                CustomerCreateParams.InvoiceSettings.builder()
                    .setDefaultPaymentMethod(paymentMethodId)
                    .build()
            )
            .build();

        Customer customer = Customer.create(customerParams);

        // Calculate pricing
        int userCount = org.getUserCount();
        BigDecimal pricePerUser = calculatePricePerUser(userCount, planType);
        BigDecimal totalAmount = pricePerUser.multiply(BigDecimal.valueOf(userCount));

        // Create Stripe subscription
        SubscriptionCreateParams subscriptionParams = SubscriptionCreateParams.builder()
            .setCustomer(customer.getId())
            .addItem(
                SubscriptionCreateParams.Item.builder()
                    .setPrice(getPriceId(planType, userCount))
                    .setQuantity((long) userCount)
                    .build()
            )
            .setTrialPeriodDays(planType == PlanType.TRIAL_WITH_CARD ? 30L : null)
            .setPaymentBehavior(SubscriptionCreateParams.PaymentBehavior.DEFAULT_INCOMPLETE)
            .addAllExpand(List.of("latest_invoice.payment_intent"))
            .build();

        com.stripe.model.Subscription stripeSubscription =
            com.stripe.model.Subscription.create(subscriptionParams);

        // Save to database
        Subscription subscription = new Subscription();
        subscription.setOrganizationId(organizationId);
        subscription.setStripeCustomerId(customer.getId());
        subscription.setStripeSubscriptionId(stripeSubscription.getId());
        subscription.setPlanType(planType);
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setUserCount(userCount);
        subscription.setPricePerUser(pricePerUser);
        subscription.setTotalAmount(totalAmount);
        subscription.setCurrentPeriodStart(
            Instant.ofEpochSecond(stripeSubscription.getCurrentPeriodStart())
        );
        subscription.setCurrentPeriodEnd(
            Instant.ofEpochSecond(stripeSubscription.getCurrentPeriodEnd())
        );

        if (planType == PlanType.TRIAL_WITH_CARD) {
            subscription.setTrialStartDate(Instant.now());
            subscription.setTrialEndDate(Instant.now().plus(30, ChronoUnit.DAYS));
            subscription.setStatus(SubscriptionStatus.TRIAL);
        }

        return subscriptionRepository.save(subscription);
    }

    /**
     * Upgrade subscription (more users or better plan)
     */
    public Subscription upgradeSubscription(
        Long subscriptionId,
        Integer newUserCount
    ) throws StripeException {

        Subscription subscription = subscriptionRepository.findById(subscriptionId)
            .orElseThrow(() -> new NotFoundException("Subscription not found"));

        com.stripe.model.Subscription stripeSubscription =
            com.stripe.model.Subscription.retrieve(subscription.getStripeSubscriptionId());

        // Update quantity (prorated automatically by Stripe)
        SubscriptionUpdateParams updateParams = SubscriptionUpdateParams.builder()
            .addItem(
                SubscriptionUpdateParams.Item.builder()
                    .setId(stripeSubscription.getItems().getData().get(0).getId())
                    .setQuantity((long) newUserCount)
                    .build()
            )
            .setProrationBehavior(SubscriptionUpdateParams.ProrationBehavior.CREATE_PRORATIONS)
            .build();

        stripeSubscription = stripeSubscription.update(updateParams);

        // Update database
        BigDecimal pricePerUser = calculatePricePerUser(newUserCount, subscription.getPlanType());
        subscription.setUserCount(newUserCount);
        subscription.setPricePerUser(pricePerUser);
        subscription.setTotalAmount(pricePerUser.multiply(BigDecimal.valueOf(newUserCount)));

        return subscriptionRepository.save(subscription);
    }

    /**
     * Cancel subscription at period end
     */
    public Subscription cancelSubscription(Long subscriptionId) throws StripeException {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
            .orElseThrow(() -> new NotFoundException("Subscription not found"));

        com.stripe.model.Subscription stripeSubscription =
            com.stripe.model.Subscription.retrieve(subscription.getStripeSubscriptionId());

        SubscriptionUpdateParams params = SubscriptionUpdateParams.builder()
            .setCancelAtPeriodEnd(true)
            .build();

        stripeSubscription.update(params);

        subscription.setCancelAtPeriodEnd(true);
        subscription.setCanceledAt(Instant.now());

        return subscriptionRepository.save(subscription);
    }

    // Helper methods
    private BigDecimal calculatePricePerUser(int userCount, PlanType planType) {
        if (planType == PlanType.FREE_TRIAL) return BigDecimal.ZERO;

        BigDecimal basePrice = userCount <= 10 ?
            new BigDecimal("49.00") : new BigDecimal("39.00");

        if (planType == PlanType.ANNUAL) {
            return basePrice.multiply(new BigDecimal("0.80")); // 20% discount
        }

        return basePrice;
    }

    private String getPriceId(PlanType planType, int userCount) {
        // Return appropriate Stripe Price ID based on plan and user count
        if (userCount <= 10) {
            return planType == PlanType.ANNUAL ?
                "price_annual_small" : "price_monthly_small";
        } else {
            return planType == PlanType.ANNUAL ?
                "price_annual_large" : "price_monthly_large";
        }
    }
}
```

---

### 3. Payment Processing Service

**File**: `src/main/java/com/g37/meetingmanager/service/PaymentService.java`

```java
@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentMethodRepository paymentMethodRepository;

    /**
     * Add payment method to customer
     */
    public PaymentMethod addPaymentMethod(
        Long organizationId,
        String stripePaymentMethodId
    ) throws StripeException {

        Organization org = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new NotFoundException("Organization not found"));

        Subscription subscription = subscriptionRepository
            .findByOrganizationId(organizationId)
            .orElseThrow(() -> new NotFoundException("Subscription not found"));

        // Attach payment method to customer
        com.stripe.model.PaymentMethod stripePaymentMethod =
            com.stripe.model.PaymentMethod.retrieve(stripePaymentMethodId);

        PaymentMethodAttachParams attachParams = PaymentMethodAttachParams.builder()
            .setCustomer(subscription.getStripeCustomerId())
            .build();

        stripePaymentMethod.attach(attachParams);

        // Set as default
        CustomerUpdateParams customerParams = CustomerUpdateParams.builder()
            .setInvoiceSettings(
                CustomerUpdateParams.InvoiceSettings.builder()
                    .setDefaultPaymentMethod(stripePaymentMethodId)
                    .build()
            )
            .build();

        Customer.retrieve(subscription.getStripeCustomerId()).update(customerParams);

        // Save to database
        PaymentMethod paymentMethod = new PaymentMethod();
        paymentMethod.setOrganizationId(organizationId);
        paymentMethod.setStripePaymentMethodId(stripePaymentMethodId);
        paymentMethod.setType(stripePaymentMethod.getType());

        if ("card".equals(stripePaymentMethod.getType())) {
            paymentMethod.setCardBrand(stripePaymentMethod.getCard().getBrand());
            paymentMethod.setCardLast4(stripePaymentMethod.getCard().getLast4());
            paymentMethod.setCardExpMonth(stripePaymentMethod.getCard().getExpMonth().intValue());
            paymentMethod.setCardExpYear(stripePaymentMethod.getCard().getExpYear().intValue());
        }

        paymentMethod.setIsDefault(true);

        // Mark other payment methods as not default
        paymentMethodRepository.findByOrganizationId(organizationId)
            .forEach(pm -> {
                pm.setIsDefault(false);
                paymentMethodRepository.save(pm);
            });

        return paymentMethodRepository.save(paymentMethod);
    }

    /**
     * Process manual payment (for invoices)
     */
    public Payment processPayment(Long invoiceId) throws StripeException {
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));

        com.stripe.model.Invoice stripeInvoice =
            com.stripe.model.Invoice.retrieve(invoice.getStripeInvoiceId());

        stripeInvoice = stripeInvoice.pay();

        Payment payment = new Payment();
        payment.setSubscriptionId(invoice.getSubscriptionId());
        payment.setStripePaymentIntentId(stripeInvoice.getPaymentIntent());
        payment.setAmount(invoice.getAmountDue());
        payment.setCurrency("USD");
        payment.setStatus(PaymentStatus.SUCCEEDED);
        payment.setAttemptedAt(Instant.now());
        payment.setSucceededAt(Instant.now());

        invoice.setStatus(InvoiceStatus.PAID);
        invoice.setAmountPaid(invoice.getAmountDue());
        invoice.setPaidAt(Instant.now());
        invoiceRepository.save(invoice);

        return paymentRepository.save(payment);
    }
}
```

---

### 4. Dunning Service (Failed Payment Retries)

**File**: `src/main/java/com/g37/meetingmanager/service/DunningService.java`

```java
@Service
public class DunningService {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private EmailService emailService;

    /**
     * Handle failed payment - retry logic
     */
    @Scheduled(cron = "0 0 9 * * *") // Run daily at 9 AM
    public void retryFailedPayments() {
        List<Subscription> pastDueSubscriptions =
            subscriptionRepository.findByStatus(SubscriptionStatus.PAST_DUE);

        pastDueSubscriptions.forEach(subscription -> {
            try {
                retryPayment(subscription);
            } catch (Exception e) {
                log.error("Failed to retry payment for subscription {}",
                    subscription.getId(), e);
            }
        });
    }

    private void retryPayment(Subscription subscription) throws StripeException {
        com.stripe.model.Subscription stripeSubscription =
            com.stripe.model.Subscription.retrieve(subscription.getStripeSubscriptionId());

        // Get latest invoice
        String latestInvoiceId = stripeSubscription.getLatestInvoice();
        com.stripe.model.Invoice invoice =
            com.stripe.model.Invoice.retrieve(latestInvoiceId);

        if ("open".equals(invoice.getStatus())) {
            // Retry payment
            invoice = invoice.pay();

            if ("paid".equals(invoice.getStatus())) {
                subscription.setStatus(SubscriptionStatus.ACTIVE);
                subscriptionRepository.save(subscription);

                emailService.sendPaymentSuccessEmail(subscription);
            } else {
                // Send dunning email
                sendDunningEmail(subscription);
            }
        }
    }

    private void sendDunningEmail(Subscription subscription) {
        Organization org = organizationRepository.findById(subscription.getOrganizationId())
            .orElse(null);

        if (org == null) return;

        Map<String, Object> templateData = new HashMap<>();
        templateData.put("organizationName", org.getName());
        templateData.put("amount", subscription.getTotalAmount());
        templateData.put("retryDate", calculateNextRetryDate());
        templateData.put("updatePaymentUrl",
            "https://app.meetingmanager.com/billing/payment-methods");

        emailService.sendTemplateEmail(
            org.getPrimaryEmail(),
            "Action Required: Payment Failed",
            "payment-failed",
            templateData
        );
    }

    private Instant calculateNextRetryDate() {
        return Instant.now().plus(3, ChronoUnit.DAYS);
    }
}
```

---

### 5. Stripe Webhook Handler

**File**: `src/main/java/com/g37/meetingmanager/controller/StripeWebhookController.java`

```java
@RestController
@RequestMapping("/api/webhooks/stripe")
public class StripeWebhookController {

    @Autowired
    private StripeConfig stripeConfig;

    @Autowired
    private SubscriptionService subscriptionService;

    @Autowired
    private BillingEventRepository billingEventRepository;

    @PostMapping
    public ResponseEntity<String> handleWebhook(
        @RequestBody String payload,
        @RequestHeader("Stripe-Signature") String sigHeader
    ) {

        Event event;

        try {
            event = Webhook.constructEvent(
                payload,
                sigHeader,
                stripeConfig.getWebhookSecret()
            );
        } catch (SignatureVerificationException e) {
            log.error("Invalid Stripe signature", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        }

        // Log event
        logBillingEvent(event);

        // Handle event type
        switch (event.getType()) {
            case "customer.subscription.created":
                handleSubscriptionCreated(event);
                break;

            case "customer.subscription.updated":
                handleSubscriptionUpdated(event);
                break;

            case "customer.subscription.deleted":
                handleSubscriptionDeleted(event);
                break;

            case "invoice.payment_succeeded":
                handleInvoicePaymentSucceeded(event);
                break;

            case "invoice.payment_failed":
                handleInvoicePaymentFailed(event);
                break;

            case "customer.subscription.trial_will_end":
                handleTrialWillEnd(event);
                break;

            default:
                log.info("Unhandled event type: {}", event.getType());
        }

        return ResponseEntity.ok("Webhook received");
    }

    private void handleSubscriptionUpdated(Event event) {
        com.stripe.model.Subscription stripeSubscription =
            (com.stripe.model.Subscription) event.getDataObjectDeserializer()
                .getObject().orElse(null);

        if (stripeSubscription == null) return;

        Subscription subscription = subscriptionRepository
            .findByStripeSubscriptionId(stripeSubscription.getId())
            .orElse(null);

        if (subscription != null) {
            subscription.setStatus(mapStripeStatus(stripeSubscription.getStatus()));
            subscription.setCurrentPeriodEnd(
                Instant.ofEpochSecond(stripeSubscription.getCurrentPeriodEnd())
            );
            subscriptionRepository.save(subscription);
        }
    }

    private void handleInvoicePaymentFailed(Event event) {
        com.stripe.model.Invoice invoice =
            (com.stripe.model.Invoice) event.getDataObjectDeserializer()
                .getObject().orElse(null);

        if (invoice == null) return;

        // Update subscription status to PAST_DUE
        Subscription subscription = subscriptionRepository
            .findByStripeCustomerId(invoice.getCustomer())
            .orElse(null);

        if (subscription != null) {
            subscription.setStatus(SubscriptionStatus.PAST_DUE);
            subscriptionRepository.save(subscription);

            // Trigger dunning process
            dunningService.sendDunningEmail(subscription);
        }
    }

    private void logBillingEvent(Event event) {
        BillingEvent billingEvent = new BillingEvent();
        billingEvent.setEventType(event.getType());
        billingEvent.setStripeEventId(event.getId());
        billingEvent.setEventData(event.getData().toJson());
        billingEvent.setProcessed(true);
        billingEventRepository.save(billingEvent);
    }

    private SubscriptionStatus mapStripeStatus(String stripeStatus) {
        return switch (stripeStatus) {
            case "active" -> SubscriptionStatus.ACTIVE;
            case "past_due" -> SubscriptionStatus.PAST_DUE;
            case "canceled" -> SubscriptionStatus.CANCELED;
            case "trialing" -> SubscriptionStatus.TRIAL;
            default -> SubscriptionStatus.ACTIVE;
        };
    }
}
```

---

## Frontend Implementation

### 1. Billing Component

**File**: `frontend/src/app/billing/billing.component.ts`

```typescript
@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss']
})
export class BillingComponent implements OnInit {
  subscription?: Subscription;
  paymentMethods: PaymentMethod[] = [];
  invoices: Invoice[] = [];
  loading = true;

  constructor(
    private billingService: BillingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBillingData();
  }

  loadBillingData(): void {
    forkJoin({
      subscription: this.billingService.getCurrentSubscription(),
      paymentMethods: this.billingService.getPaymentMethods(),
      invoices: this.billingService.getInvoices()
    }).subscribe({
      next: (data) => {
        this.subscription = data.subscription;
        this.paymentMethods = data.paymentMethods;
        this.invoices = data.invoices;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading billing data:', error);
        this.loading = false;
      }
    });
  }

  openUpgradeDialog(): void {
    // Open dialog to upgrade subscription
  }

  openPaymentMethodDialog(): void {
    // Open Stripe payment element
  }

  cancelSubscription(): void {
    if (!confirm('Cancel subscription? You will retain access until the end of your billing period.')) {
      return;
    }

    this.billingService.cancelSubscription().subscribe({
      next: () => {
        alert('Subscription canceled successfully');
        this.loadBillingData();
      },
      error: (error) => {
        console.error('Error canceling subscription:', error);
        alert('Failed to cancel subscription');
      }
    });
  }
}
```

### 2. Payment Method Dialog

**File**: `frontend/src/app/billing/payment-method-dialog.component.ts`

```typescript
@Component({
  selector: 'app-payment-method-dialog',
  template: `
    <h2 mat-dialog-title>Add Payment Method</h2>
    <mat-dialog-content>
      <div id="payment-element"></div>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="cancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="processing">
        {{ processing ? 'Processing...' : 'Add Payment Method' }}
      </button>
    </mat-dialog-actions>
  `
})
export class PaymentMethodDialogComponent implements OnInit {
  stripe: any;
  elements: any;
  paymentElement: any;
  processing = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PaymentMethodDialogComponent>,
    private billingService: BillingService
  ) {}

  async ngOnInit(): Promise<void> {
    // Load Stripe.js
    this.stripe = await loadStripe(environment.stripePublishableKey);

    // Create setup intent
    const { clientSecret } = await this.billingService.createSetupIntent().toPromise();

    // Initialize Stripe Elements
    this.elements = this.stripe.elements({ clientSecret });
    this.paymentElement = this.elements.create('payment');
    this.paymentElement.mount('#payment-element');
  }

  async submit(): Promise<void> {
    this.processing = true;

    const { error } = await this.stripe.confirmSetup({
      elements: this.elements,
      confirmParams: {
        return_url: window.location.origin + '/billing/complete',
      },
      redirect: 'if_required'
    });

    if (error) {
      alert(error.message);
      this.processing = false;
    } else {
      this.dialogRef.close(true);
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
```

---

## Implementation Tasks

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Stripe account and obtain API keys
- [ ] Create database tables (subscriptions, payments, invoices, payment_methods)
- [ ] Implement Stripe configuration in backend
- [ ] Create basic subscription and payment models
- [ ] Set up webhook endpoint and verify signature validation

### Phase 2: Core Subscription Management (Week 3-4)
- [ ] Implement SubscriptionService (create, update, cancel)
- [ ] Build PaymentService (add payment method, process payments)
- [ ] Create subscription management API endpoints
- [ ] Implement proration logic for mid-cycle changes
- [ ] Build invoice generation system

### Phase 3: Webhook Integration (Week 5)
- [ ] Implement all webhook event handlers
- [ ] Create BillingEvent logging system
- [ ] Test webhook delivery with Stripe CLI
- [ ] Implement idempotency for webhook processing
- [ ] Set up webhook monitoring and alerting

### Phase 4: Dunning & Recovery (Week 6)
- [ ] Build DunningService with retry logic
- [ ] Create email templates for payment failures
- [ ] Implement scheduled task for retry attempts
- [ ] Build grace period and suspension logic
- [ ] Create customer notification system

### Phase 5: Frontend Billing Portal (Week 7-8)
- [ ] Create billing dashboard component
- [ ] Build payment method management UI
- [ ] Implement Stripe Payment Element integration
- [ ] Create invoice history view with download
- [ ] Build subscription upgrade/downgrade flow
- [ ] Add cancellation workflow with confirmation

### Phase 6: Trial-to-Paid Conversion (Week 9)
- [ ] Implement free trial signup flow
- [ ] Build trial-with-card conversion logic
- [ ] Create trial expiration notifications (7 days, 3 days, 1 day, expiration)
- [ ] Build seamless conversion process
- [ ] Add trial extension capability for support team

### Phase 7: Reporting & Analytics (Week 10)
- [ ] Build MRR (Monthly Recurring Revenue) tracking
- [ ] Create churn rate calculations
- [ ] Implement payment success/failure metrics
- [ ] Build subscription analytics dashboard for admins
- [ ] Add export functionality for accounting

### Phase 8: Testing & Launch (Week 11-12)
- [ ] End-to-end testing of all payment flows
- [ ] Test failed payment scenarios and dunning
- [ ] Verify webhook reliability under load
- [ ] Conduct security audit of payment handling
- [ ] Load test payment processing
- [ ] Create runbook for payment issues
- [ ] Train support team on billing operations
- [ ] Soft launch with beta customers
- [ ] Full production launch

---

## Testing Strategy

### Unit Tests
- Subscription creation with various plans
- Payment processing success/failure scenarios
- Proration calculations for upgrades/downgrades
- Webhook signature verification
- Invoice generation accuracy

### Integration Tests
- Stripe API integration (create customer, subscription, payment)
- Webhook event processing end-to-end
- Payment method addition and updates
- Subscription lifecycle (trial → active → canceled)

### Manual Testing Checklist
- [ ] Sign up for free trial (no card)
- [ ] Sign up for trial with card
- [ ] Add payment method after trial starts
- [ ] Convert trial to paid subscription
- [ ] Upgrade user count mid-cycle (verify proration)
- [ ] Downgrade user count mid-cycle
- [ ] Update payment method
- [ ] Simulate failed payment (test card)
- [ ] Verify dunning emails sent
- [ ] Cancel subscription (verify access until period end)
- [ ] Download invoice PDF
- [ ] Test webhook delivery and processing

---

## Security Considerations

1. **API Key Protection**
   - Never expose Stripe secret keys in frontend
   - Use environment variables for all keys
   - Rotate keys periodically

2. **Webhook Security**
   - Always verify webhook signatures
   - Use HTTPS for webhook endpoint
   - Implement rate limiting on webhook endpoint

3. **Payment Data**
   - Never store raw credit card numbers
   - Only store Stripe tokens/IDs
   - Log payment events for audit trail

4. **Access Control**
   - Only organization admins can manage billing
   - Require re-authentication for sensitive operations
   - Log all billing changes

---

## Monitoring & Alerts

### Key Metrics to Track
- Payment success rate (target: >98%)
- Failed payment rate
- Subscription churn rate
- Trial conversion rate (target: >20%)
- Average revenue per user (ARPU)
- Monthly recurring revenue (MRR)

### Alert Conditions
- Payment success rate drops below 95%
- Webhook processing failures
- Stripe API errors exceed threshold
- Subscription cancellations spike
- Invoice generation failures

---

## Support Runbook

### Common Issues

**Failed Payment**
1. Check payment method validity in Stripe dashboard
2. Verify customer has sufficient funds
3. Review billing_events table for webhook delivery
4. Manually retry payment if needed
5. Contact customer to update payment method

**Subscription Not Active**
1. Check subscription status in database
2. Verify Stripe subscription status matches
3. Review recent webhook events
4. Check for failed payments
5. Manually sync subscription if needed

**Invoice Not Generated**
1. Check Stripe invoice in dashboard
2. Verify webhook for `invoice.created` received
3. Manually trigger invoice generation if needed
4. Check invoice table for records

---

## Future Enhancements

- **Multi-currency support** (EUR, GBP, AUD)
- **Usage-based billing** (per-meeting pricing)
- **Team billing** (multiple payment methods per org)
- **Referral program** (credit for referrals)
- **Annual prepay discount** (save 2 months)
- **Add-ons** (extra storage, premium features)
- **Partner/reseller billing** (wholesale pricing)

---

## Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Billing Best Practices](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Webhook Guide](https://stripe.com/docs/webhooks)
- [Stripe Testing Cards](https://stripe.com/docs/testing)

---

**Document Status**: Draft - Pending Review
**Next Review Date**: TBD
**Approval Required From**: CTO, CFO
