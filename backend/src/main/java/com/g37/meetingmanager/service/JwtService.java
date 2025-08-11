package com.g37.meetingmanager.service;

import com.g37.meetingmanager.model.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    private final SecretKey jwtSecret;
    private final long jwtExpiration;
    private final long refreshTokenExpiration;
    
    // In-memory token blacklist (in production, use Redis or database)
    private final Set<String> tokenBlacklist = ConcurrentHashMap.newKeySet();

    public JwtService(
            @Value("${app.jwt.secret:mySecretKey12345678901234567890123456789012345678901234567890}") String secret,
            @Value("${app.jwt.expiration:86400000}") long expiration
    ) {
        this.jwtSecret = Keys.hmacShaKeyFor(secret.getBytes());
        this.jwtExpiration = expiration; // 24 hours
        this.refreshTokenExpiration = expiration * 7; // 7 days
    }

    /**
     * Generate JWT token for user authentication
     */
    public String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("email", user.getEmail());
        claims.put("organizationId", user.getOrganization().getId());
        claims.put("roles", user.getRoles().stream().map(role -> role.getName()).collect(Collectors.toList()));
        claims.put("permissions", user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(permission -> permission.getName())
                .distinct()
                .collect(Collectors.toList()));

        return Jwts.builder()
                .claims(claims)
                .subject(user.getEmail())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(jwtSecret)
                .compact();
    }

    /**
     * Generate refresh token
     */
    public String generateRefreshToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshTokenExpiration);

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("type", "refresh");

        return Jwts.builder()
                .claims(claims)
                .subject(user.getEmail())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(jwtSecret)
                .compact();
    }

    /**
     * Get email from JWT token
     */
    public String getEmailFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.getSubject();
    }

    /**
     * Get email from refresh token
     */
    public String getEmailFromRefreshToken(String refreshToken) {
        Claims claims = getClaimsFromToken(refreshToken);
        return claims.getSubject();
    }

    /**
     * Get user ID from token
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return Long.valueOf(claims.get("userId").toString());
    }

    /**
     * Get organization ID from token
     */
    public Long getOrganizationIdFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return Long.valueOf(claims.get("organizationId").toString());
    }

    /**
     * Validate JWT token
     */
    public boolean validateToken(String token) {
        try {
            if (tokenBlacklist.contains(token)) {
                log.debug("Token is blacklisted");
                return false;
            }

            Claims claims = getClaimsFromToken(token);
            return !isTokenExpired(claims);
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Validate refresh token
     */
    public boolean isValidRefreshToken(String refreshToken) {
        try {
            if (tokenBlacklist.contains(refreshToken)) {
                return false;
            }

            Claims claims = getClaimsFromToken(refreshToken);
            String tokenType = (String) claims.get("type");
            return "refresh".equals(tokenType) && !isTokenExpired(claims);
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Invalid refresh token: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Invalidate token (add to blacklist)
     */
    public void invalidateToken(String token) {
        tokenBlacklist.add(token);
    }

    /**
     * Get token expiration time
     */
    public long getExpirationTime() {
        return jwtExpiration;
    }

    /**
     * Check if token is expired
     */
    public boolean isTokenExpired(String token) {
        try {
            Claims claims = getClaimsFromToken(token);
            return isTokenExpired(claims);
        } catch (JwtException | IllegalArgumentException e) {
            return true;
        }
    }

    /**
     * Get user roles from token
     */
    @SuppressWarnings("unchecked")
    public java.util.List<String> getRolesFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return (java.util.List<String>) claims.get("roles");
    }

    /**
     * Get user permissions from token
     */
    @SuppressWarnings("unchecked")
    public java.util.List<String> getPermissionsFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return (java.util.List<String>) claims.get("permissions");
    }

    /**
     * Check if user has specific permission
     */
    public boolean hasPermission(String token, String permission) {
        java.util.List<String> permissions = getPermissionsFromToken(token);
        return permissions != null && permissions.contains(permission);
    }

    /**
     * Check if user has specific role
     */
    public boolean hasRole(String token, String role) {
        java.util.List<String> roles = getRolesFromToken(token);
        return roles != null && roles.contains(role);
    }

    // Private helper methods

    private Claims getClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(jwtSecret)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private boolean isTokenExpired(Claims claims) {
        Date expiration = claims.getExpiration();
        return expiration.before(new Date());
    }
}
