# IP & Code Protection Implementation Plan

**Version:** 1.0
**Date:** October 15, 2025
**Status:** Planning Phase
**Owner:** G37 Ventures

## Overview

This document outlines comprehensive intellectual property (IP) and code protection strategies for Meeting Manager. The goal is to protect G37 Ventures' proprietary technology, prevent unauthorized use, and ensure compliance with legal requirements while maintaining development velocity and customer trust.

---

## Business Requirements

### Protection Goals
- **Prevent Code Theft**: Make reverse engineering extremely difficult
- **License Enforcement**: Ensure only paying customers can use the software
- **Trade Secret Protection**: Protect proprietary algorithms and business logic
- **Employee Safeguards**: Prevent insider threats and unauthorized code access
- **Audit Trail**: Maintain complete logs of code access and deployments
- **Compliance**: Meet SOC 2, ISO 27001, and GDPR requirements

### Risk Assessment
- **High Risk**: Core AI/ML algorithms, proprietary meeting intelligence logic
- **Medium Risk**: Integration code, database schemas, API designs
- **Low Risk**: UI components, standard CRUD operations, public documentation

---

## Legal Foundation

### 1. Intellectual Property Agreements

#### Employee IP Assignment Agreement

**File**: `legal/EMPLOYEE_IP_ASSIGNMENT.md`

**Key Clauses**:
```
1. ASSIGNMENT OF INVENTIONS
   Employee hereby assigns to G37 Ventures all rights, title, and interest in any
   inventions, discoveries, improvements, software, documentation, or other work
   product created during employment.

2. WORK MADE FOR HIRE
   All work product shall be deemed "work made for hire" under U.S. Copyright Law.

3. DISCLOSURE OBLIGATIONS
   Employee shall promptly disclose all inventions to G37 Ventures.

4. COOPERATION
   Employee agrees to assist G37 Ventures in obtaining patents, copyrights,
   and other protections.

5. NO LICENSE RETENTION
   Employee retains no license or right to use any work product after termination.
```

#### Contractor/Consultant Agreement

**Key Additions**:
- IP ownership vests immediately upon creation
- No source code access after contract ends
- Return all proprietary materials upon termination
- Non-compete clause (if enforceable in jurisdiction)

---

### 2. Non-Disclosure Agreements (NDA)

#### Standard NDA Terms

**File**: `legal/NDA_TEMPLATE.md`

```
1. DEFINITION OF CONFIDENTIAL INFORMATION
   - Source code, algorithms, architecture diagrams
   - Customer data, usage statistics, revenue figures
   - Product roadmaps, feature specifications
   - API keys, credentials, encryption keys
   - Security vulnerabilities, penetration test results

2. OBLIGATIONS
   - Recipient shall not disclose to third parties
   - Use only for authorized business purposes
   - Protect with same care as own confidential info

3. EXCLUSIONS
   - Publicly available information
   - Independently developed information
   - Information received from third party without restriction

4. DURATION
   - Obligations survive for 5 years after disclosure

5. REMEDIES
   - Injunctive relief available
   - Damages include attorney fees
```

#### When NDAs Are Required
- All employees (on hire date)
- All contractors/consultants (before engagement)
- Technology partners with code access
- Beta customers testing unreleased features
- Investors reviewing proprietary metrics

---

### 3. Software Licensing

#### Proprietary Software License

**File**: `LICENSE.txt` (for customers)

```
MEETING MANAGER SOFTWARE LICENSE AGREEMENT

This is a legal agreement between you (Customer) and G37 Ventures LLC.

1. LICENSE GRANT
   Subject to payment of fees, G37 Ventures grants Customer a non-exclusive,
   non-transferable license to use Meeting Manager software.

2. RESTRICTIONS
   Customer shall NOT:
   - Reverse engineer, decompile, or disassemble the software
   - Remove or modify copyright notices
   - Share license keys with unauthorized users
   - Create derivative works
   - Publicly disclose performance benchmarks

3. OWNERSHIP
   G37 Ventures retains all rights, title, and interest in the software.
   Customer owns data created using the software.

4. TERMINATION
   License terminates immediately upon non-payment or breach.
   Customer must cease all use and destroy all copies.

5. WARRANTY DISCLAIMER
   SOFTWARE PROVIDED "AS IS" WITHOUT WARRANTY.

6. LIMITATION OF LIABILITY
   G37 Ventures not liable for indirect, incidental, or consequential damages.
```

---

## Technical Protection Measures

### 1. Code Obfuscation

#### Java Backend Obfuscation (ProGuard)

**File**: `proguard-rules.pro`

```proguard
# Keep entry points
-keep public class com.g37.meetingmanager.MeetingManagerApplication {
    public static void main(java.lang.String[]);
}

# Keep REST controllers (Spring needs them)
-keep @org.springframework.web.bind.annotation.RestController class * {
    public *;
}

# Keep entities (Hibernate needs them)
-keep @javax.persistence.Entity class * {
    *;
}

# Obfuscate everything else
-repackageclasses 'com.g37.obfuscated'
-allowaccessmodification
-overloadaggressively

# Remove debugging info
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
}

# String encryption
-obfuscatedictionary dictionary.txt
-classobfuscationdictionary dictionary.txt
-packageobfuscationdictionary dictionary.txt

# Control flow obfuscation
-optimizations !code/simplification/arithmetic,!field/*,!class/merging/*
-optimizationpasses 5
```

**Build Integration** (`pom.xml`):

```xml
<plugin>
    <groupId>com.github.wvengen</groupId>
    <artifactId>proguard-maven-plugin</artifactId>
    <version>2.6.0</version>
    <executions>
        <execution>
            <phase>package</phase>
            <goals>
                <goal>proguard</goal>
            </goals>
        </execution>
    </executions>
    <configuration>
        <proguardInclude>${basedir}/proguard-rules.pro</proguardInclude>
        <libs>
            <lib>${java.home}/jmods/java.base.jmod</lib>
        </libs>
        <injar>classes</injar>
        <outjar>${project.build.finalName}-obfuscated.jar</outjar>
    </configuration>
</plugin>
```

---

#### Frontend Obfuscation (Terser + webpack-obfuscator)

**File**: `angular.json` (production build config)

```json
{
  "configurations": {
    "production": {
      "optimization": {
        "scripts": {
          "minimize": true,
          "obfuscate": true
        }
      },
      "buildOptimizer": true,
      "sourceMap": false
    }
  }
}
```

**File**: `webpack.config.js` (if using custom webpack)

```javascript
const JavaScriptObfuscator = require('webpack-obfuscator');

module.exports = {
  plugins: [
    new JavaScriptObfuscator({
      rotateStringArray: true,
      stringArray: true,
      stringArrayThreshold: 0.75,
      transformObjectKeys: true,
      unicodeEscapeSequence: true,
      identifierNamesGenerator: 'hexadecimal',
      renameGlobals: false,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.4,
      debugProtection: false, // Can break legitimate debugging
      disableConsoleOutput: true, // Remove console.log
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.75,
      splitStrings: true,
      splitStringsChunkLength: 10
    }, [
      'excluded_bundle_name.js' // Exclude vendor bundles
    ])
  ]
};
```

**NPM Script**:

```json
{
  "scripts": {
    "build:protected": "ng build --configuration production && node scripts/obfuscate-build.js"
  }
}
```

---

### 2. License Key System

#### License Key Generation Service

**File**: `LicenseKeyService.java`

```java
@Service
public class LicenseKeyService {

    private static final String PRIVATE_KEY_PATH = "/secure/keys/license_private.pem";
    private static final String PUBLIC_KEY_PATH = "/secure/keys/license_public.pem";

    @Autowired
    private OrganizationRepository organizationRepository;

    /**
     * Generate signed license key for organization
     */
    public String generateLicenseKey(Long organizationId) throws Exception {
        Organization org = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new NotFoundException("Organization not found"));

        // Create license data
        LicenseData licenseData = new LicenseData();
        licenseData.setOrganizationId(organizationId);
        licenseData.setOrgSlug(org.getOrgSlug());
        licenseData.setMaxUsers(org.getMaxUsers());
        licenseData.setIssuedAt(Instant.now());
        licenseData.setExpiresAt(calculateExpirationDate(org));
        licenseData.setFeatures(org.getEnabledFeatures());

        // Serialize to JSON
        String licenseJson = objectMapper.writeValueAsString(licenseData);

        // Sign with RSA private key
        String signature = signLicenseData(licenseJson);

        // Combine data + signature
        LicenseKey licenseKey = new LicenseKey(licenseJson, signature);

        // Encode as Base64
        String encoded = Base64.getEncoder().encodeToString(
            objectMapper.writeValueAsBytes(licenseKey)
        );

        return encoded;
    }

    /**
     * Verify license key signature
     */
    public LicenseData verifyLicenseKey(String encodedKey) throws Exception {
        // Decode Base64
        byte[] decoded = Base64.getDecoder().decode(encodedKey);
        LicenseKey licenseKey = objectMapper.readValue(decoded, LicenseKey.class);

        // Verify signature with RSA public key
        if (!verifySignature(licenseKey.getData(), licenseKey.getSignature())) {
            throw new SecurityException("Invalid license signature");
        }

        // Parse license data
        LicenseData licenseData = objectMapper.readValue(
            licenseKey.getData(),
            LicenseData.class
        );

        // Check expiration
        if (licenseData.getExpiresAt().isBefore(Instant.now())) {
            throw new SecurityException("License expired");
        }

        return licenseData;
    }

    private String signLicenseData(String data) throws Exception {
        PrivateKey privateKey = loadPrivateKey(PRIVATE_KEY_PATH);

        Signature signature = Signature.getInstance("SHA256withRSA");
        signature.initSign(privateKey);
        signature.update(data.getBytes(StandardCharsets.UTF_8));

        byte[] signatureBytes = signature.sign();
        return Base64.getEncoder().encodeToString(signatureBytes);
    }

    private boolean verifySignature(String data, String signatureStr) throws Exception {
        PublicKey publicKey = loadPublicKey(PUBLIC_KEY_PATH);

        Signature signature = Signature.getInstance("SHA256withRSA");
        signature.initVerify(publicKey);
        signature.update(data.getBytes(StandardCharsets.UTF_8));

        byte[] signatureBytes = Base64.getDecoder().decode(signatureStr);
        return signature.verify(signatureBytes);
    }

    private Instant calculateExpirationDate(Organization org) {
        Subscription subscription = subscriptionRepository
            .findByOrganizationId(org.getId())
            .orElseThrow();

        return subscription.getCurrentPeriodEnd();
    }
}
```

#### License Validation Filter

**File**: `LicenseValidationFilter.java`

```java
@Component
public class LicenseValidationFilter extends OncePerRequestFilter {

    @Autowired
    private LicenseKeyService licenseKeyService;

    @Autowired
    private RedisTemplate<String, LicenseData> redisTemplate;

    private static final String LICENSE_CACHE_PREFIX = "license:";
    private static final long CACHE_TTL_HOURS = 6;

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {

        // Skip license check for public endpoints
        if (isPublicEndpoint(request.getRequestURI())) {
            filterChain.doFilter(request, response);
            return;
        }

        // Get organization from tenant context
        Long organizationId = TenantContext.getCurrentTenant();

        if (organizationId == null) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("Unauthorized: No tenant context");
            return;
        }

        try {
            // Check license validity (with caching)
            LicenseData licenseData = validateLicense(organizationId);

            // Store in request attribute for controllers to access
            request.setAttribute("licenseData", licenseData);

            filterChain.doFilter(request, response);

        } catch (SecurityException e) {
            log.error("License validation failed for org {}: {}", organizationId, e.getMessage());
            response.setStatus(HttpStatus.FORBIDDEN.value());
            response.getWriter().write("License validation failed: " + e.getMessage());
        }
    }

    private LicenseData validateLicense(Long organizationId) throws SecurityException {
        // Check Redis cache first
        String cacheKey = LICENSE_CACHE_PREFIX + organizationId;
        LicenseData cached = redisTemplate.opsForValue().get(cacheKey);

        if (cached != null) {
            return cached;
        }

        // Load from database
        Organization org = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new SecurityException("Organization not found"));

        if (org.getLicenseKey() == null) {
            throw new SecurityException("No license key configured");
        }

        // Verify license key
        LicenseData licenseData;
        try {
            licenseData = licenseKeyService.verifyLicenseKey(org.getLicenseKey());
        } catch (Exception e) {
            throw new SecurityException("Invalid license key", e);
        }

        // Cache for 6 hours
        redisTemplate.opsForValue().set(cacheKey, licenseData, CACHE_TTL_HOURS, TimeUnit.HOURS);

        return licenseData;
    }

    private boolean isPublicEndpoint(String uri) {
        return uri.startsWith("/api/public/") ||
               uri.equals("/api/onboarding/signup") ||
               uri.equals("/api/auth/login");
    }
}
```

---

### 3. Runtime Integrity Verification

#### JAR Signature Verification

**File**: `JarIntegrityService.java`

```java
@Service
public class JarIntegrityService {

    private static final String EXPECTED_SIGNATURE_HASH = "SHA256:abcd1234...";

    @PostConstruct
    public void verifyJarIntegrity() {
        try {
            String jarPath = getJarPath();
            String actualHash = calculateJarHash(jarPath);

            if (!EXPECTED_SIGNATURE_HASH.equals(actualHash)) {
                log.error("JAR integrity check FAILED! Possible tampering detected.");
                // Send alert to security team
                securityAlertService.sendTamperingAlert(jarPath, actualHash);

                // Optional: Exit application
                System.exit(1);
            }

            log.info("JAR integrity verified successfully");

        } catch (Exception e) {
            log.error("Failed to verify JAR integrity", e);
        }
    }

    private String getJarPath() {
        return this.getClass()
            .getProtectionDomain()
            .getCodeSource()
            .getLocation()
            .getPath();
    }

    private String calculateJarHash(String jarPath) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");

        try (FileInputStream fis = new FileInputStream(jarPath)) {
            byte[] buffer = new byte[8192];
            int bytesRead;

            while ((bytesRead = fis.read(buffer)) != -1) {
                digest.update(buffer, 0, bytesRead);
            }
        }

        byte[] hashBytes = digest.digest();
        return "SHA256:" + bytesToHex(hashBytes);
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
```

---

### 4. API Rate Limiting & Abuse Detection

#### Rate Limiting Configuration

**File**: `RateLimitConfig.java`

```java
@Configuration
public class RateLimitConfig {

    @Bean
    public Bucket createBucketForOrganization(Long organizationId) {
        // 1000 requests per minute per organization
        Bandwidth limit = Bandwidth.classic(1000, Refill.intervally(1000, Duration.ofMinutes(1)));

        return Bucket.builder()
            .addLimit(limit)
            .build();
    }

    @Bean
    public RateLimitInterceptor rateLimitInterceptor() {
        return new RateLimitInterceptor();
    }
}
```

**File**: `RateLimitInterceptor.java`

```java
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    @Autowired
    private Map<Long, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    public boolean preHandle(
        HttpServletRequest request,
        HttpServletResponse response,
        Object handler
    ) throws Exception {

        Long organizationId = TenantContext.getCurrentTenant();

        if (organizationId == null) {
            return true; // Skip for unauthenticated requests
        }

        Bucket bucket = buckets.computeIfAbsent(organizationId, this::createBucket);

        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {
            response.addHeader("X-Rate-Limit-Remaining", String.valueOf(probe.getRemainingTokens()));
            return true;
        } else {
            response.setStatus(429); // Too Many Requests
            response.addHeader("X-Rate-Limit-Retry-After-Seconds",
                String.valueOf(probe.getNanosToWaitForRefill() / 1_000_000_000));
            response.getWriter().write("Rate limit exceeded");
            return false;
        }
    }

    private Bucket createBucket(Long organizationId) {
        Bandwidth limit = Bandwidth.classic(1000, Refill.intervally(1000, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }
}
```

---

### 5. Code Watermarking

#### Unique Identifier Injection

**Build-time Script**: `scripts/inject-watermark.sh`

```bash
#!/bin/bash

# Generate unique build watermark
BUILD_ID=$(uuidgen)
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
GIT_COMMIT=$(git rev-parse HEAD)

# Inject watermark into source
cat > src/main/java/com/g37/meetingmanager/Watermark.java << EOF
package com.g37.meetingmanager;

public class Watermark {
    // DO NOT MODIFY - This class is auto-generated
    private static final String BUILD_ID = "$BUILD_ID";
    private static final String BUILD_DATE = "$BUILD_DATE";
    private static final String GIT_COMMIT = "$GIT_COMMIT";
    private static final String ORGANIZATION = "G37 Ventures LLC";

    public static String getBuildId() { return BUILD_ID; }
    public static String getBuildDate() { return BUILD_DATE; }
    public static String getGitCommit() { return GIT_COMMIT; }
}
EOF

echo "Watermark injected: $BUILD_ID"
```

**Usage in Code**:

```java
@RestController
@RequestMapping("/api/system")
public class SystemInfoController {

    @GetMapping("/version")
    public Map<String, String> getVersion() {
        Map<String, String> info = new HashMap<>();
        info.put("buildId", Watermark.getBuildId());
        info.put("buildDate", Watermark.getBuildDate());
        info.put("version", "3.8.0");
        return info;
    }
}
```

---

## Employee & Contractor Access Controls

### 1. Source Code Access Management

#### GitHub Repository Access Policy

**File**: `ACCESS_CONTROL_POLICY.md`

```
# Source Code Access Levels

## Level 1: Full Access (CTO, Lead Engineers)
- Read/write access to all repositories
- Admin permissions
- Can approve pull requests
- Access to production secrets

## Level 2: Developer Access (Engineers)
- Read/write to assigned repositories
- Cannot merge to main/production branches
- No access to production secrets
- Cannot modify CI/CD pipelines

## Level 3: Read-Only Access (QA, Product Managers)
- Read-only access to repositories
- Can view issues and PRs
- Cannot clone or download source

## Level 4: No Access (Sales, Marketing, External)
- No repository access
- Access via demo environment only

# Access Request Process
1. Submit request to CTO via Jira ticket
2. Business justification required
3. Time-limited access (90 days default)
4. Quarterly access reviews
5. Revoke immediately upon departure

# Audit Requirements
- Log all repository access events
- Review access logs monthly
- Alert on suspicious activity (after-hours downloads, bulk clones)
```

#### GitHub Branch Protection Rules

```yaml
# .github/branch-protection.yml

main:
  - require_pull_request_reviews:
      required_approving_review_count: 2
      dismiss_stale_reviews: true
      require_code_owner_reviews: true
  - require_status_checks:
      strict: true
      contexts:
        - "build"
        - "test"
        - "security-scan"
  - enforce_admins: true
  - restrictions:
      users: ["cto", "lead-engineer"]
      teams: ["senior-engineers"]

production:
  - require_pull_request_reviews:
      required_approving_review_count: 3
  - require_status_checks:
      strict: true
  - restrict_pushes:
      users: ["cto"]
```

---

### 2. Secrets Management

#### AWS Secrets Manager Integration

**File**: `SecretsConfig.java`

```java
@Configuration
public class SecretsConfig {

    @Value("${aws.region}")
    private String awsRegion;

    @Bean
    public AWSSecretsManager secretsManager() {
        return AWSSecretsManagerClientBuilder.standard()
            .withRegion(awsRegion)
            .build();
    }

    @Bean
    public String getStripeApiKey() {
        return getSecret("meeting-manager/stripe-api-key");
    }

    @Bean
    public String getFathomWebhookSecret() {
        return getSecret("meeting-manager/fathom-webhook-secret");
    }

    private String getSecret(String secretName) {
        GetSecretValueRequest request = new GetSecretValueRequest()
            .withSecretId(secretName);

        GetSecretValueResult result = secretsManager().getSecretValue(request);

        return result.getSecretString();
    }
}
```

**Secret Rotation Policy**:
- Rotate API keys every 90 days
- Rotate database passwords every 180 days
- Rotate webhook secrets annually
- Emergency rotation within 1 hour of suspected compromise

---

### 3. Audit Logging

#### Security Event Logger

**File**: `SecurityAuditService.java`

```java
@Service
public class SecurityAuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void logCodeAccess(User user, String repository, String action) {
        AuditLog log = new AuditLog();
        log.setEventType("CODE_ACCESS");
        log.setUserId(user.getId());
        log.setUserEmail(user.getEmail());
        log.setAction(action); // CLONE, PULL, DOWNLOAD, VIEW
        log.setResourceType("REPOSITORY");
        log.setResourceId(repository);
        log.setIpAddress(getCurrentIpAddress());
        log.setTimestamp(Instant.now());
        log.setSeverity("INFO");

        auditLogRepository.save(log);

        // Alert on suspicious patterns
        if (isSuspiciousActivity(user, action)) {
            securityAlertService.sendAlert(
                "Suspicious code access detected",
                log
            );
        }
    }

    private boolean isSuspiciousActivity(User user, String action) {
        // Detect bulk downloads
        long recentDownloads = auditLogRepository.countByUserIdAndActionAndTimestampAfter(
            user.getId(),
            "DOWNLOAD",
            Instant.now().minus(1, ChronoUnit.HOURS)
        );

        if (recentDownloads > 10) {
            return true;
        }

        // Detect after-hours access
        int hourOfDay = LocalDateTime.now().getHour();
        if (hourOfDay < 6 || hourOfDay > 22) {
            return true;
        }

        // Detect access from unusual location
        String currentIp = getCurrentIpAddress();
        List<String> recentIps = auditLogRepository.getRecentIpAddresses(user.getId(), 30);

        if (!recentIps.contains(currentIp)) {
            return true; // New IP address
        }

        return false;
    }

    public void logDeployment(User user, String environment, String version) {
        AuditLog log = new AuditLog();
        log.setEventType("DEPLOYMENT");
        log.setUserId(user.getId());
        log.setAction("DEPLOY");
        log.setResourceType("ENVIRONMENT");
        log.setResourceId(environment);
        log.setMetadata(Map.of("version", version));
        log.setSeverity("HIGH");

        auditLogRepository.save(log);
    }

    public void logDataExport(User user, Long organizationId, int recordCount) {
        AuditLog log = new AuditLog();
        log.setEventType("DATA_EXPORT");
        log.setUserId(user.getId());
        log.setAction("EXPORT");
        log.setResourceType("ORGANIZATION_DATA");
        log.setResourceId(String.valueOf(organizationId));
        log.setMetadata(Map.of("recordCount", recordCount));
        log.setSeverity("HIGH");

        auditLogRepository.save(log);

        // Alert on large exports
        if (recordCount > 10000) {
            securityAlertService.sendAlert("Large data export detected", log);
        }
    }
}
```

---

## Deployment Protection

### 1. Secure Build Pipeline

#### GitHub Actions Workflow

**File**: `.github/workflows/secure-build.yml`

```yaml
name: Secure Build & Deploy

on:
  push:
    branches: [main, production]

env:
  AWS_REGION: us-east-1

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run SAST (Static Application Security Testing)
        uses: github/codeql-action/analyze@v2

      - name: Dependency vulnerability scan
        run: |
          mvn dependency-check:check
          npm audit --production

      - name: Secret scanning
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
          head: HEAD

  build:
    needs: security-scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'

      - name: Inject watermark
        run: ./scripts/inject-watermark.sh

      - name: Build backend with obfuscation
        run: mvn clean package -Pobfuscate

      - name: Build frontend with obfuscation
        run: |
          cd frontend
          npm ci
          npm run build:protected

      - name: Calculate JAR hash
        run: |
          JAR_HASH=$(sha256sum target/*.jar | cut -d' ' -f1)
          echo "JAR_HASH=SHA256:$JAR_HASH" >> $GITHUB_ENV

      - name: Sign artifacts
        run: |
          gpg --import ${{ secrets.GPG_PRIVATE_KEY }}
          gpg --detach-sign target/*.jar

      - name: Upload artifacts to S3
        run: |
          aws s3 cp target/*.jar s3://meeting-manager-builds/${{ github.sha }}/
          aws s3 cp target/*.jar.sig s3://meeting-manager-builds/${{ github.sha }}/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Download artifacts from S3
        run: |
          aws s3 cp s3://meeting-manager-builds/${{ github.sha }}/ ./artifacts/ --recursive

      - name: Verify artifact signature
        run: |
          gpg --import ${{ secrets.GPG_PUBLIC_KEY }}
          gpg --verify artifacts/*.jar.sig artifacts/*.jar

      - name: Deploy to Azure
        run: |
          az webapp deploy --name meeting-manager-prod \
            --resource-group prod-rg \
            --src-path artifacts/*.jar

      - name: Verify deployment
        run: |
          curl https://app.meetingmanager.com/api/system/version
```

---

### 2. Production Environment Hardening

#### Azure App Service Configuration

**File**: `azure-app-settings.json`

```json
{
  "properties": {
    "httpsOnly": true,
    "minTlsVersion": "1.2",
    "ftpsState": "Disabled",
    "http20Enabled": true,
    "clientAffinityEnabled": false,
    "alwaysOn": true,
    "ipSecurityRestrictions": [
      {
        "ipAddress": "52.12.34.56/32",
        "action": "Allow",
        "priority": 100,
        "name": "Allow Office IP"
      },
      {
        "ipAddress": "0.0.0.0/0",
        "action": "Deny",
        "priority": 200,
        "name": "Deny All Others"
      }
    ],
    "siteConfig": {
      "appSettings": [
        {
          "name": "JAVA_OPTS",
          "value": "-Dfile.encoding=UTF-8 -Djava.security.egd=file:/dev/./urandom"
        },
        {
          "name": "WEBSITES_ENABLE_APP_SERVICE_STORAGE",
          "value": "false"
        }
      ]
    }
  }
}
```

---

## Implementation Tasks

### Phase 1: Legal Foundation (Week 1-2)
- [ ] Draft Employee IP Assignment Agreement
- [ ] Create Contractor Agreement template
- [ ] Draft Standard NDA template
- [ ] Create Software License Agreement
- [ ] Review with legal counsel
- [ ] Implement signing workflow (DocuSign/HelloSign)

### Phase 2: Code Obfuscation (Week 3-4)
- [ ] Set up ProGuard for Java backend
- [ ] Configure Terser + webpack-obfuscator for frontend
- [ ] Test obfuscated builds thoroughly
- [ ] Create obfuscation verification tests
- [ ] Document build process

### Phase 3: License Key System (Week 5-6)
- [ ] Generate RSA key pair for license signing
- [ ] Implement LicenseKeyService (generation & validation)
- [ ] Create LicenseValidationFilter
- [ ] Add license key to organizations table
- [ ] Build license management admin UI
- [ ] Test license expiration handling

### Phase 4: Runtime Protection (Week 7)
- [ ] Implement JAR integrity verification
- [ ] Add code watermarking to build process
- [ ] Create security alert system
- [ ] Test tampering detection

### Phase 5: Access Controls (Week 8-9)
- [ ] Document access control policy
- [ ] Configure GitHub branch protections
- [ ] Implement AWS Secrets Manager integration
- [ ] Set up secret rotation automation
- [ ] Create access audit logging system

### Phase 6: API Security (Week 10)
- [ ] Implement rate limiting with Bucket4j
- [ ] Add abuse detection algorithms
- [ ] Create IP allowlist/blocklist system
- [ ] Test rate limiting under load

### Phase 7: Deployment Security (Week 11)
- [ ] Create secure build pipeline (GitHub Actions)
- [ ] Implement artifact signing
- [ ] Set up SAST/DAST scanning
- [ ] Configure Azure App Service hardening
- [ ] Test deployment verification

### Phase 8: Documentation & Training (Week 12)
- [ ] Create security runbook
- [ ] Document incident response procedures
- [ ] Train engineering team on security practices
- [ ] Conduct security awareness training for all employees
- [ ] Create IP protection onboarding checklist

---

## Monitoring & Alerts

### Key Security Metrics
- Failed license validation attempts
- JAR integrity check failures
- Rate limit violations
- Suspicious code access patterns
- Large data exports
- Deployment to production

### Alert Conditions
- Multiple failed license validations from same org
- JAR hash mismatch detected
- After-hours code access by contractor
- Rate limit exceeded by 10x
- Data export exceeds 10,000 records
- Deployment without required approvals

---

## Incident Response Plan

### Code Theft Suspected

1. **Immediate Actions** (Within 1 hour)
   - Revoke all access for suspected individual
   - Change all API keys, webhooks, database passwords
   - Enable enhanced audit logging
   - Notify legal counsel

2. **Investigation** (Within 24 hours)
   - Review audit logs for suspicious activity
   - Check for unauthorized code downloads/clones
   - Identify what code/data may have been accessed
   - Document timeline of events

3. **Containment** (Within 48 hours)
   - Invalidate affected license keys
   - Rotate all secrets accessed by individual
   - Review all recent deployments for backdoors
   - Scan for unauthorized API keys

4. **Legal Action** (Within 1 week)
   - Send cease & desist letter
   - File lawsuit if warranted
   - Request injunctive relief

---

## Compliance Checklist

### SOC 2 Type II Requirements
- [ ] Access controls documented and enforced
- [ ] Audit logging for all privileged actions
- [ ] Secret rotation policy implemented
- [ ] Incident response plan documented
- [ ] Regular security training for employees

### ISO 27001 Requirements
- [ ] Information security policy
- [ ] Risk assessment completed
- [ ] Asset inventory maintained
- [ ] Access control policy
- [ ] Cryptography policy

### GDPR Requirements
- [ ] Data encryption at rest and in transit
- [ ] Right to be forgotten implemented
- [ ] Data processing agreements with vendors
- [ ] Privacy impact assessment

---

## Resources

- [OWASP Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
- [ProGuard Documentation](https://www.guardsquare.com/manual/home)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [AWS Secrets Manager Guide](https://docs.aws.amazon.com/secretsmanager/)

---

**Document Status**: Draft - Pending Legal Review
**Next Review Date**: TBD
**Approval Required From**: CTO, Legal Counsel, CEO
