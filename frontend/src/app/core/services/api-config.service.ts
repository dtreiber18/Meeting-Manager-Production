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
    
    // Get the base API URL from environment, with robust fallback handling
    let apiUrl = environment?.apiUrl;
    
    // Handle various environment loading issues
    if (!apiUrl || apiUrl === '/api') {
      // Default to development backend if environment is not properly loaded
      apiUrl = 'http://localhost:8081/api';
      console.warn('⚠️ ApiConfigService: Environment apiUrl missing or relative, using development default:', apiUrl);
    } else if (!apiUrl.startsWith('http') && !environment?.production) {
      // For development, convert relative URLs to absolute
      apiUrl = 'http://localhost:8081/api';
      console.warn('⚠️ ApiConfigService: Environment apiUrl was relative, converted to:', apiUrl);
    }
    
    this.baseApiUrl = apiUrl;
    console.log('🔧 ApiConfigService initialized with base URL:', this.baseApiUrl);
  }

  private isValidApiUrl(url: string): boolean {
    // Allow relative URLs in production, absolute URLs in development
    if (environment?.production) {
      return true; // In production, relative URLs are okay
    }
    return url.startsWith('http://') || url.startsWith('https://');
  }

  /**
   * Get the complete API URL for a given endpoint
   * @param endpoint - The API endpoint (e.g., 'meetings', 'users/profile')
   * @returns Complete URL (e.g., 'http://localhost:8081/api/meetings')
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
   * @returns Base API URL (e.g., 'http://localhost:8081/api')
   */
  getBaseApiUrl(): string {
    return this.baseApiUrl;
  }

  /**
   * Check if a URL is a relative API URL that should be converted
   * @param url - URL to check
   * @returns true if it's a relative API URL
   */
  isRelativeApiUrl(url: string): boolean {
    return url.startsWith('/api/') || url.startsWith('api/');
  }

  /**
   * Convert a potentially relative URL to a full URL
   * @param url - URL that might be relative
   * @returns Full URL
   */
  normalizeUrl(url: string): string {
    if (this.isRelativeApiUrl(url)) {
      console.warn(`⚠️ Converting relative URL '${url}' to full URL. Consider using getApiUrl() instead.`);
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