import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Centralized API configuration service that provides consistent URL management
 * across the entire application. This prevents the common issue of services
 * using relative URLs that point to the wrong server.
 * 
 * ALL services should use this service instead of hardcoding URLs.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private readonly baseApiUrl: string;
  
  constructor() {
    // Debug environment loading
    console.log('🔧 Environment object:', environment);
    console.log('🔧 Environment.production:', environment?.production);
    console.log('🔧 Environment.apiUrl:', environment?.apiUrl);
    
    // Get the base API URL from environment
    let apiUrl = environment?.apiUrl;
    
    // Handle environment loading issues with proper dev/prod logic
    if (!apiUrl) {
      if (environment?.production) {
        // Production should have an explicit API URL
        console.error('❌ ApiConfigService: No apiUrl configured for production!');
        apiUrl = '/api'; // Fallback to relative
      } else {
        // Development: use relative URL for proxy
        apiUrl = '/api';
        console.log('✅ ApiConfigService: Using relative URL for development proxy');
      }
    } else if (apiUrl === '/api' && !environment?.production) {
      // This is correct for development - keep the relative URL for proxy
      console.log('✅ ApiConfigService: Using relative URL for development proxy');
    } else if (!apiUrl.startsWith('http') && environment?.production) {
      // Production with relative URL is problematic
      console.error('❌ ApiConfigService: Production environment has relative apiUrl, this may not work properly');
    }
    
    this.baseApiUrl = apiUrl;
    console.log('🔧 ApiConfigService initialized with base URL:', this.baseApiUrl);
  }

  private isValidApiUrl(url: string): boolean {
    // In development, relative URLs are correct (handled by proxy)
    // In production, we need absolute URLs
    if (environment?.production) {
      return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
    } else {
      return true; // In development, any URL format is acceptable
    }
  }

  /**
   * Get the complete API URL for a given endpoint
   * @param endpoint - The API endpoint (e.g., 'meetings', 'users/profile')
   * @returns Complete URL (e.g., '/api/meetings' in dev, full URL in prod)
   */
  getApiUrl(endpoint: string): string {
    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    const fullUrl = `${this.baseApiUrl}/${cleanEndpoint}`;
    
    console.log(`🔗 ApiConfigService.getApiUrl('${endpoint}') → ${fullUrl}`);
    return fullUrl;
  }

  /**
   * Get the base API URL
   * @returns Base API URL (e.g., '/api' in dev, full URL in prod)
   */
  getBaseApiUrl(): string {
    return this.baseApiUrl;
  }

  /**
   * Check if a URL is a relative API URL that should be converted
   * @param url - URL to check
   * @returns true if it's a relative API URL that needs conversion
   */
  isRelativeApiUrl(url: string): boolean {
    // In development, we WANT relative URLs (for proxy), so don't flag them for conversion
    if (!environment?.production) {
      return false; // In development, keep relative URLs as-is
    }
    // In production, relative URLs might need to be converted to absolute
    return url.startsWith('/api/') || url.startsWith('api/');
  }

  /**
   * Convert a potentially relative URL to a full URL
   * @param url - URL that might be relative
   * @returns Full URL
   */
  normalizeUrl(url: string): string {
    if (this.isRelativeApiUrl(url)) {
      console.warn(`⚠️ Converting relative URL '${url}' to full URL. This should only happen in production.`);
      const endpoint = url.replace(/^\/api\//, '').replace(/^api\//, '');
      return this.getApiUrl(endpoint);
    }
    return url;
  }

  /**
   * Predefined endpoint getters for common API endpoints
   * This makes it even easier for developers to use the right URLs
   */
  readonly endpoints = {
    // Meeting endpoints
    meetings: () => this.getApiUrl('meetings'),
    meeting: (id: string | number) => this.getApiUrl(`meetings/${id}`),
    
    // User endpoints
    users: () => this.getApiUrl('users'),
    userProfile: () => this.getApiUrl('users/profile'),
    userTimezone: () => this.getApiUrl('users/timezone'),
    userLanguage: () => this.getApiUrl('users/language'),
    
    // Authentication endpoints
    auth: {
      login: () => this.getApiUrl('auth/login'),
      logout: () => this.getApiUrl('auth/logout'),
      refresh: () => this.getApiUrl('auth/refresh'),
    },
    
    // Notification endpoints
    notifications: () => this.getApiUrl('notifications'),
    notification: (id: string) => this.getApiUrl(`notifications/${id}`),
    
    // Settings endpoints
    settings: () => this.getApiUrl('settings'),
    
    // Chat endpoints
    chat: () => this.getApiUrl('chat'),
    chatMessage: () => this.getApiUrl('chat/message'),
    
    // Action items endpoints
    actionItems: () => this.getApiUrl('action-items'),
    actionItem: (id: string | number) => this.getApiUrl(`action-items/${id}`),
  };

  /**
   * Development helper to log all available endpoints
   */
  logAvailableEndpoints(): void {
    console.group('🔗 Available API Endpoints:');
    console.log('Base URL:', this.getBaseApiUrl());
    console.log('Meetings:', this.endpoints.meetings());
    console.log('User Profile:', this.endpoints.userProfile());
    console.log('Notifications:', this.endpoints.notifications());
    console.log('Settings:', this.endpoints.settings());
    console.log('Chat:', this.endpoints.chat());
    console.groupEnd();
  }
}