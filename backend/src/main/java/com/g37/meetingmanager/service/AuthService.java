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

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

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

    @Value("${azure.ad.client-id:}")
    private String azureClientId;

    @Value("${azure.ad.tenant-id:}")
    private String azureTenantId;

    @Value("${azure.ad.redirect-uri:http://localhost:4200/auth/callback}")
    private String azureRedirectUri;

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
        log.debug("Handling Azure AD callback");
        
        // TODO: Implement Azure AD token exchange and user creation
        // This is a placeholder - in production, you would:
        // 1. Exchange the authorization code for an access token
        // 2. Get user info from Microsoft Graph API
        // 3. Create or update the user in your database
        
        throw new UnsupportedOperationException("Azure AD integration not yet implemented");
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
