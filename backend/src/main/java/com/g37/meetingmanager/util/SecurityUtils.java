package com.g37.meetingmanager.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * Utility class for security-related operations
 */
public class SecurityUtils {
    
    /**
     * Get the current authenticated user ID
     * @return Current user ID or null if not authenticated
     */
    public static Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        Object principal = authentication.getPrincipal();
        
        // If using custom user details that implement UserDetails and have getId() method
        if (principal instanceof UserDetails) {
            // This assumes your UserDetails implementation has a getId() method
            // You may need to cast to your specific UserDetails implementation
            try {
                // Use reflection to get the ID if available
                return (Long) principal.getClass().getMethod("getId").invoke(principal);
            } catch (Exception e) {
                // Fallback: try to parse from username if it's numeric
                try {
                    return Long.parseLong(((UserDetails) principal).getUsername());
                } catch (NumberFormatException nfe) {
                    return null;
                }
            }
        }
        
        // If principal is just a string (username/ID)
        if (principal instanceof String) {
            try {
                return Long.parseLong((String) principal);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        
        return null;
    }
    
    /**
     * Get the current authenticated username
     * @return Current username or null if not authenticated
     */
    public static String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        Object principal = authentication.getPrincipal();
        
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        }
        
        if (principal instanceof String) {
            return (String) principal;
        }
        
        return null;
    }
    
    /**
     * Check if the current user is authenticated
     * @return true if authenticated, false otherwise
     */
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated() && 
               !"anonymousUser".equals(authentication.getPrincipal());
    }
    
    /**
     * Check if the current user has a specific role
     * @param role Role to check
     * @return true if user has the role, false otherwise
     */
    public static boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + role) || 
                                     authority.getAuthority().equals(role));
    }
    
    /**
     * Check if the current user is a system administrator
     * @return true if user is system admin, false otherwise
     */
    public static boolean isSystemAdmin() {
        return hasRole("SYSTEM_ADMIN");
    }
    
    /**
     * Check if the current user is an organization administrator
     * @return true if user is org admin, false otherwise
     */
    public static boolean isOrgAdmin() {
        return hasRole("ORG_ADMIN");
    }
    
    /**
     * Check if the current user is an assistant or higher
     * @return true if user is assistant or higher, false otherwise
     */
    public static boolean isAssistantOrAbove() {
        return hasRole("SYSTEM_ADMIN") || hasRole("ORG_ADMIN") || hasRole("ASSISTANT");
    }
}