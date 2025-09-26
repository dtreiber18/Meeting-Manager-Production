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
    
    this.baseApiUrl = this.determineApiUrl();
    console.log('🔧 ApiConfigService initialized with base URL:', this.baseApiUrl);
  }

  private determineApiUrl(): string {
    // Detect if we're in a test environment
    const isTestEnvironment = this.isTestEnvironment();
    
    // Get the base API URL from environment
    let apiUrl = environment?.apiUrl;
    
    if (!apiUrl) {
      return this.handleMissingApiUrl(isTestEnvironment);
    }
    
    if (apiUrl === '/api' && !environment?.production) {
      return this.handleDevApiUrl(isTestEnvironment);
    }
    
    if (!apiUrl.startsWith('http') && environment?.production) {
      console.error('❌ ApiConfigService: Production environment has relative apiUrl, this may not work properly');
    }
    
    return apiUrl;
  }

  private isTestEnvironment(): boolean {
    const global = globalThis as unknown as Record<string, unknown>;
    const win = typeof window !== 'undefined' ? window as unknown as Record<string, unknown> : null;
    
    return typeof global['jasmine'] !== 'undefined' || 
           typeof global['jest'] !== 'undefined' ||
           (win !== null && typeof win['__karma__'] !== 'undefined');
  }

  private handleMissingApiUrl(isTestEnvironment: boolean): string {
    if (environment?.production) {
      console.error('❌ ApiConfigService: No apiUrl configured for production!');
      return '/api'; // Fallback to relative
    } else {
      const url = isTestEnvironment ? '/api' : 'http://localhost:8081/api';
      console.log('✅ ApiConfigService: Using direct backend URL for development testing');
      return url;
    }
  }

  private handleDevApiUrl(isTestEnvironment: boolean): string {
    const url = isTestEnvironment ? '/api' : 'http://localhost:8081/api';
    const message = isTestEnvironment ? 
                   '🧪 ApiConfigService: Using relative URLs for testing' : 
                   '✅ ApiConfigService: Using direct backend URL for development testing';
    console.log(message);
    return url;
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
    
    // Notification endpoints (temporarily routed through MeetingController while debugging controller registration)
    notifications: () => this.getApiUrl('meetings/notifications'),
    notification: (id: string) => this.getApiUrl(`meetings/notifications/${id}`),
    notificationsUnreadCount: () => this.getApiUrl('meetings/notifications/unread/count'),
    
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