package com.g37.meetingmanager.controller;

import com.g37.meetingmanager.dto.UserDTO;
import com.g37.meetingmanager.model.User;
import com.g37.meetingmanager.service.AuthService;
import com.g37.meetingmanager.service.JwtService;
import com.g37.meetingmanager.service.MicrosoftGraphOAuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;
    private final JwtService jwtService;
    private final MicrosoftGraphOAuthService microsoftGraphOAuthService;

    @Autowired
    public AuthController(AuthService authService, 
                         JwtService jwtService, 
                         MicrosoftGraphOAuthService microsoftGraphOAuthService) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.microsoftGraphOAuthService = microsoftGraphOAuthService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            log.info("Login attempt for email: {}", request.getEmail());
            
            User user = authService.authenticateUser(request.getEmail(), request.getPassword());
            
            if (user == null || !user.getIsActive()) {
                throw new BadCredentialsException("Invalid credentials or inactive account");
            }

            String token = jwtService.generateToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);

            AuthResponse response = AuthResponse.builder()
                    .user(new UserDTO(user))
                    .token(token)
                    .refreshToken(refreshToken)
                    .expiresIn(jwtService.getExpirationTime())
                    .calendarAuthUrl(microsoftGraphOAuthService.getAuthorizationUrl())
                    .build();

            log.info("Login successful for user: {}", user.getEmail());
            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            log.warn("Login failed for email: {} - {}", request.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
        } catch (Exception e) {
            log.error("Login error for email: {}", request.getEmail(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Login failed. Please try again."));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            log.info("Registration attempt for email: {}", request.getEmail());

            // Check if user already exists
            if (authService.userExists(request.getEmail())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "User with this email already exists"));
            }

            User user = authService.registerUser(request);
            
            String token = jwtService.generateToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);

            AuthResponse response = AuthResponse.builder()
                    .user(new UserDTO(user))
                    .token(token)
                    .refreshToken(refreshToken)
                    .expiresIn(jwtService.getExpirationTime())
                    .build();

            log.info("Registration successful for user: {}", user.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            log.warn("Registration failed for email: {} - {}", request.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Registration error for email: {}", request.getEmail(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Registration failed. Please try again."));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody TokenRefreshRequest request) {
        try {
            log.debug("Token refresh attempt");

            if (!jwtService.isValidRefreshToken(request.getRefreshToken())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid refresh token"));
            }

            String email = jwtService.getEmailFromRefreshToken(request.getRefreshToken());
            User user = authService.findUserByEmail(email);

            if (user == null || !user.getIsActive()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "User not found or inactive"));
            }

            String newToken = jwtService.generateToken(user);
            String newRefreshToken = jwtService.generateRefreshToken(user);

            TokenRefreshResponse response = TokenRefreshResponse.builder()
                    .token(newToken)
                    .refreshToken(newRefreshToken)
                    .expiresIn(jwtService.getExpirationTime())
                    .build();

            log.debug("Token refresh successful for user: {}", user.getEmail());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Token refresh error", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Token refresh failed"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String email = jwtService.getEmailFromToken(token);
            User user = authService.findUserByEmail(email);

            if (user == null || !user.getIsActive()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "User not found or inactive"));
            }

            return ResponseEntity.ok(new UserDTO(user));

        } catch (Exception e) {
            log.error("Get current user error", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid token"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            jwtService.invalidateToken(token);
            
            log.info("User logged out successfully");
            return ResponseEntity.ok(Map.of("message", "Logged out successfully"));

        } catch (Exception e) {
            log.error("Logout error", e);
            return ResponseEntity.ok(Map.of("message", "Logged out"));
        }
    }

    @GetMapping("/azure/login")
    public ResponseEntity<?> azureLogin() {
        try {
            String azureLoginUrl = authService.getAzureLoginUrl();
            return ResponseEntity.ok(Map.of("loginUrl", azureLoginUrl));
        } catch (Exception e) {
            log.error("Azure login URL generation error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Azure login not available"));
        }
    }

    @PostMapping("/azure/callback")
    public ResponseEntity<?> azureCallback(@RequestBody AzureCallbackRequest request) {
        try {
            log.info("Azure callback received");
            
            User user = authService.handleAzureCallback(request.getCode(), request.getState());
            
            String token = jwtService.generateToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);

            AuthResponse response = AuthResponse.builder()
                    .user(new UserDTO(user))
                    .token(token)
                    .refreshToken(refreshToken)
                    .expiresIn(jwtService.getExpirationTime())
                    .build();

            log.info("Azure login successful for user: {}", user.getEmail());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Azure callback error", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Azure authentication failed"));
        }
    }

    // Request/Response DTOs
    public static class LoginRequest {
        private String email;
        private String password;

        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        private String email;
        private String password;
        private String firstName;
        private String lastName;
        private String organizationName;

        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getOrganizationName() { return organizationName; }
        public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }
    }

    public static class TokenRefreshRequest {
        private String refreshToken;

        public String getRefreshToken() { return refreshToken; }
        public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    }

    public static class AzureCallbackRequest {
        private String code;
        private String state;

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getState() { return state; }
        public void setState(String state) { this.state = state; }
    }

    public static class AuthResponse {
        private UserDTO user;
        private String token;
        private String refreshToken;
        private long expiresIn;
        private String calendarAuthUrl;

        public static AuthResponseBuilder builder() {
            return new AuthResponseBuilder();
        }

        // Getters and setters
        public UserDTO getUser() { return user; }
        public void setUser(UserDTO user) { this.user = user; }
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getRefreshToken() { return refreshToken; }
        public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
        public long getExpiresIn() { return expiresIn; }
        public void setExpiresIn(long expiresIn) { this.expiresIn = expiresIn; }
        public String getCalendarAuthUrl() { return calendarAuthUrl; }
        public void setCalendarAuthUrl(String calendarAuthUrl) { this.calendarAuthUrl = calendarAuthUrl; }

        public static class AuthResponseBuilder {
            private UserDTO user;
            private String token;
            private String refreshToken;
            private long expiresIn;
            private String calendarAuthUrl;

            public AuthResponseBuilder user(UserDTO user) { this.user = user; return this; }
            public AuthResponseBuilder token(String token) { this.token = token; return this; }
            public AuthResponseBuilder refreshToken(String refreshToken) { this.refreshToken = refreshToken; return this; }
            public AuthResponseBuilder expiresIn(long expiresIn) { this.expiresIn = expiresIn; return this; }
            public AuthResponseBuilder calendarAuthUrl(String calendarAuthUrl) { this.calendarAuthUrl = calendarAuthUrl; return this; }

            public AuthResponse build() {
                AuthResponse response = new AuthResponse();
                response.setUser(user);
                response.setToken(token);
                response.setRefreshToken(refreshToken);
                response.setExpiresIn(expiresIn);
                response.setCalendarAuthUrl(calendarAuthUrl);
                return response;
            }
        }
    }

    public static class TokenRefreshResponse {
        private String token;
        private String refreshToken;
        private long expiresIn;

        public static TokenRefreshResponseBuilder builder() {
            return new TokenRefreshResponseBuilder();
        }

        // Getters and setters
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getRefreshToken() { return refreshToken; }
        public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
        public long getExpiresIn() { return expiresIn; }
        public void setExpiresIn(long expiresIn) { this.expiresIn = expiresIn; }

        public static class TokenRefreshResponseBuilder {
            private String token;
            private String refreshToken;
            private long expiresIn;

            public TokenRefreshResponseBuilder token(String token) { this.token = token; return this; }
            public TokenRefreshResponseBuilder refreshToken(String refreshToken) { this.refreshToken = refreshToken; return this; }
            public TokenRefreshResponseBuilder expiresIn(long expiresIn) { this.expiresIn = expiresIn; return this; }

            public TokenRefreshResponse build() {
                TokenRefreshResponse response = new TokenRefreshResponse();
                response.setToken(token);
                response.setRefreshToken(refreshToken);
                response.setExpiresIn(expiresIn);
                return response;
            }
        }
    }

    @GetMapping("/calendar/auth-url")
    public ResponseEntity<?> getCalendarAuthUrl() {
        try {
            String authUrl = microsoftGraphOAuthService.getAuthorizationUrl();
            if (authUrl != null) {
                return ResponseEntity.ok(Map.of("authUrl", authUrl));
            } else {
                return ResponseEntity.ok(Map.of("message", "Calendar integration not available"));
            }
        } catch (Exception e) {
            log.error("Error generating calendar auth URL", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to generate calendar authorization URL"));
        }
    }

    @PostMapping("/calendar/callback")
    public ResponseEntity<?> calendarCallback(@RequestBody CalendarCallbackRequest request,
                                             @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String email = jwtService.getEmailFromToken(token);
            User user = authService.findUserByEmail(email);

            if (user == null || !user.getIsActive()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "User not found or inactive"));
            }

            Map<String, Object> tokenResponse = microsoftGraphOAuthService.exchangeCodeForToken(request.getCode());
            
            if (tokenResponse != null) {
                // Store the access token and refresh token for the user
                // You might want to add these fields to your User entity
                String accessToken = (String) tokenResponse.get("access_token");
                String refreshToken = (String) tokenResponse.get("refresh_token");
                
                log.info("Calendar authorization successful for user: {}", user.getEmail());
                return ResponseEntity.ok(Map.of(
                    "message", "Calendar authorization successful",
                    "accessToken", accessToken,
                    "refreshToken", refreshToken
                ));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Failed to exchange authorization code"));
            }

        } catch (Exception e) {
            log.error("Calendar callback error", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Calendar authorization failed"));
        }
    }

    public static class CalendarCallbackRequest {
        private String code;
        
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
    }
}
