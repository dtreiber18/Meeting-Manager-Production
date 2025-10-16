package com.g37.meetingmanager.service;

import com.g37.meetingmanager.controller.AuthController.RegisterRequest;
import com.g37.meetingmanager.model.Organization;
import com.g37.meetingmanager.model.Role;
import com.g37.meetingmanager.model.User;
import com.g37.meetingmanager.repository.mysql.OrganizationRepository;
import com.g37.meetingmanager.repository.mysql.RoleRepository;
import com.g37.meetingmanager.repository.mysql.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.Map;

@Service
@Transactional
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.microsoft.graph.client-id:}")
    private String azureClientId;

    @Value("${app.microsoft.graph.client-secret:}")
    private String azureClientSecret;

    @Value("${app.microsoft.graph.tenant-id:}")
    private String azureTenantId;

    @Value("${app.microsoft.graph.redirect-uri:http://localhost:4200/auth/callback}")
    private String azureRedirectUri;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Authenticate user with email and password
     */
    public User authenticateUser(String email, String password) {
        log.debug("Authenticating user with email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        if (!user.getIsActive()) {
            throw new BadCredentialsException("Account is inactive");
        }

        // Update last login time
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("User authenticated successfully: {}", email);
        return user;
    }

    /**
     * Register new user
     */
    public User registerUser(RegisterRequest request) {
        log.debug("Registering new user with email: {}", request.getEmail());

        // Validate email doesn't already exist
        if (userExists(request.getEmail())) {
            throw new IllegalArgumentException("User with this email already exists");
        }

        // Get or create organization
        Organization organization = getOrCreateOrganization(request.getOrganizationName(), request.getEmail());

        // Get default user role
        Role userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new IllegalStateException("Default USER role not found"));

        // Create new user
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setOrganization(organization);
        user.setIsActive(true);
        user.setEmailNotifications(true);
        user.setPushNotifications(true);
        user.setTimezone("UTC");
        user.setLanguage("en");
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        // Assign default role
        Set<Role> roles = new HashSet<>();
        roles.add(userRole);
        user.setRoles(roles);

        User savedUser = userRepository.save(user);
        log.info("User registered successfully: {}", savedUser.getEmail());

        return savedUser;
    }

    /**
     * Find user by email
     */
    public User findUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    /**
     * Check if user exists by email
     */
    public boolean userExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    /**
     * Handle Azure AD callback and create/update user
     */
    public User handleAzureCallback(String code, String state) {
        log.debug("Handling Azure AD callback with code");

        try {
            // Step 1: Exchange authorization code for access token
            String accessToken = exchangeCodeForToken(code);

            // Step 2: Get user info from Microsoft Graph API
            Map<String, Object> userInfo = getUserInfoFromGraph(accessToken);

            // Step 3: Create or update the user in the database
            User user = createOrUpdateUserFromAzure(userInfo);

            log.info("Successfully authenticated Azure AD user: {}", user.getEmail());
            return user;

        } catch (Exception e) {
            log.error("Error handling Azure AD callback: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to authenticate with Azure AD: " + e.getMessage(), e);
        }
    }

    /**
     * Exchange authorization code for access token
     */
    private String exchangeCodeForToken(String code) {
        String tokenUrl = String.format(
            "https://login.microsoftonline.com/%s/oauth2/v2.0/token",
            azureTenantId
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", azureClientId);
        body.add("client_secret", azureClientSecret);
        body.add("code", code);
        body.add("redirect_uri", azureRedirectUri);
        body.add("grant_type", "authorization_code");
        body.add("scope", "openid profile email User.Read");

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, request, Map.class);
            Map<String, Object> tokenResponse = response.getBody();

            if (tokenResponse == null || !tokenResponse.containsKey("access_token")) {
                throw new RuntimeException("No access token in response");
            }

            return (String) tokenResponse.get("access_token");

        } catch (Exception e) {
            log.error("Failed to exchange code for token: {}", e.getMessage(), e);
            throw new RuntimeException("Token exchange failed: " + e.getMessage(), e);
        }
    }

    /**
     * Get user information from Microsoft Graph API
     */
    private Map<String, Object> getUserInfoFromGraph(String accessToken) {
        String graphUrl = "https://graph.microsoft.com/v1.0/me";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                graphUrl,
                HttpMethod.GET,
                request,
                Map.class
            );

            Map<String, Object> userInfo = response.getBody();

            if (userInfo == null) {
                throw new RuntimeException("No user info in response");
            }

            log.debug("Retrieved user info from Microsoft Graph: {}", userInfo.get("mail"));
            return userInfo;

        } catch (Exception e) {
            log.error("Failed to get user info from Graph API: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve user info: " + e.getMessage(), e);
        }
    }

    /**
     * Create or update user from Azure AD user info
     */
    private User createOrUpdateUserFromAzure(Map<String, Object> userInfo) {
        String email = (String) userInfo.get("mail");
        if (email == null || email.isEmpty()) {
            email = (String) userInfo.get("userPrincipalName");
        }

        if (email == null || email.isEmpty()) {
            throw new RuntimeException("No email found in Azure AD user info");
        }

        String displayName = (String) userInfo.get("displayName");
        String givenName = (String) userInfo.get("givenName");
        String surname = (String) userInfo.get("surname");

        // Check if user already exists
        Optional<User> existingUser = userRepository.findByEmail(email);

        if (existingUser.isPresent()) {
            // Update existing user
            User user = existingUser.get();
            user.setLastLoginAt(java.time.LocalDateTime.now());

            // Update profile if names changed
            if (givenName != null) {
                user.setFirstName(givenName);
            }
            if (surname != null) {
                user.setLastName(surname);
            }

            log.info("Updated existing user from Azure AD: {}", email);
            return userRepository.save(user);
        }

        // Create new user
        User newUser = new User();
        newUser.setEmail(email);
        newUser.setFirstName(givenName != null ? givenName : email.split("@")[0]);
        newUser.setLastName(surname != null ? surname : "");
        newUser.setIsActive(true);
        newUser.setCreatedAt(java.time.LocalDateTime.now());
        newUser.setUpdatedAt(java.time.LocalDateTime.now());
        newUser.setLastLoginAt(java.time.LocalDateTime.now());

        // Set a random password (won't be used for Azure AD auth)
        newUser.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));

        // Get or create organization based on email domain
        String domain = extractDomainFromEmail(email);
        Organization organization = getOrCreateOrganization(domain + " Organization", email);
        newUser.setOrganization(organization);

        // Assign default USER role
        Optional<Role> userRole = roleRepository.findByName("USER");
        if (userRole.isPresent()) {
            Set<Role> roles = new HashSet<>();
            roles.add(userRole.get());
            newUser.setRoles(roles);
        }

        User savedUser = userRepository.save(newUser);
        log.info("Created new user from Azure AD: {} in organization: {}",
            email, organization.getName());

        return savedUser;
    }

    /**
     * Get Azure AD login URL
     */
    public String getAzureLoginUrl() {
        if (azureClientId.isEmpty() || azureTenantId.isEmpty()) {
            throw new IllegalStateException("Azure AD configuration not found");
        }

        String state = UUID.randomUUID().toString();
        String scope = "openid profile email";

        return String.format(
                "https://login.microsoftonline.com/%s/oauth2/v2.0/authorize?" +
                        "client_id=%s&response_type=code&redirect_uri=%s&scope=%s&state=%s",
                azureTenantId, azureClientId, azureRedirectUri, scope, state
        );
    }

    /**
     * Get or create organization for user registration
     */
    private Organization getOrCreateOrganization(String organizationName, String userEmail) {
        // If organization name is provided, try to find it
        if (organizationName != null && !organizationName.trim().isEmpty()) {
            Optional<Organization> existingOrg = organizationRepository.findByName(organizationName.trim());
            if (existingOrg.isPresent()) {
                return existingOrg.get();
            }
        }

        // Create new organization
        String orgName = (organizationName != null && !organizationName.trim().isEmpty()) 
                ? organizationName.trim() 
                : extractDomainFromEmail(userEmail) + " Organization";

        Organization organization = new Organization();
        organization.setName(orgName);
        organization.setDescription("Organization created during user registration");
        organization.setTimezone("UTC");
        organization.setIsActive(true);
        organization.setMaxUsers(100);
        organization.setMaxMeetings(1000);
        organization.setSubscriptionTier(Organization.SubscriptionTier.BASIC);
        organization.setCreatedAt(LocalDateTime.now());
        organization.setUpdatedAt(LocalDateTime.now());

        return organizationRepository.save(organization);
    }

    /**
     * Extract domain from email address
     */
    private String extractDomainFromEmail(String email) {
        int atIndex = email.indexOf('@');
        if (atIndex > 0 && atIndex < email.length() - 1) {
            String domain = email.substring(atIndex + 1);
            int dotIndex = domain.indexOf('.');
            if (dotIndex > 0) {
                return domain.substring(0, dotIndex);
            }
            return domain;
        }
        return "Company";
    }
}
