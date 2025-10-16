import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  organizationName: string;
  roles: string[];
  permissions: string[];
  isActive: boolean;
  azureAdObjectId?: string;
  
  // Extended properties for preferences
  phoneNumber?: string;
  jobTitle?: string;
  department?: string;
  bio?: string;
  language?: string;
  timezone?: string;
  theme?: string;
  dateFormat?: string;
  timeFormat?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
  calendarAuthUrl?: string;
}

export interface TokenRefreshResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Use relative URL to work with Angular proxy in development
  // In production, this will resolve to the production domain
  private readonly API_URL = '/api';
  private readonly TOKEN_KEY = 'mm_auth_token';
  private readonly REFRESH_TOKEN_KEY = 'mm_refresh_token';
  private readonly USER_KEY = 'mm_user';

  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private tokenRefreshTimer: ReturnType<typeof setTimeout> | null = null;
  private isLoginInProgress = false;

  constructor(private readonly http: HttpClient, private readonly router: Router) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const token = this.getStoredToken();
    const user = this.getStoredUser();

    if (token && user && !this.isTokenExpired(token)) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
      this.scheduleTokenRefresh();
      
      console.log('🔄 Authentication restored from storage:', {
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        tokenExpiry: this.getTokenExpiry(token)
      });
    } else if (!this.isLoginInProgress) {
      console.log('🔒 No valid authentication found, redirecting to login');
      this.logout();
    }
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.isLoginInProgress = true;
    
    return this.http
      .post<AuthResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        map((response) => {
          this.handleAuthResponse(response);
          this.isLoginInProgress = false;
          return response;
        }),
        catchError((error) => {
          console.error('Login error:', error);
          this.isLoginInProgress = false;
          return throwError(() => error);
        })
      );
  }

  /**
   * Register new user
   */
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/auth/register`, userData)
      .pipe(
        map((response) => {
          this.handleAuthResponse(response);
          return response;
        }),
        catchError((error) => {
          console.error('Registration error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Azure AD SSO login
   */
  loginWithAzureAD(): void {
    // Redirect to Azure AD login endpoint
    window.location.href = `${this.API_URL}/auth/azure/login`;
  }

  /**
   * Handle Azure AD callback
   */
  handleAzureCallback(code: string, state: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/auth/azure/callback`, {
        code,
        state,
      })
      .pipe(
        map((response) => {
          this.handleAuthResponse(response);
          return response;
        }),
        catchError((error) => {
          console.error('Azure callback error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Refresh authentication token
   */
  refreshToken(): Observable<TokenRefreshResponse> {
    const refreshToken = this.getStoredRefreshToken();

    if (!refreshToken) {
      console.log('🔒 No refresh token available, logging out');
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    console.log('🔄 Refreshing authentication token...');

    return this.http
      .post<TokenRefreshResponse>(`${this.API_URL}/auth/refresh`, {
        refreshToken,
      })
      .pipe(
        map((response) => {
          this.storeTokens(response.token, response.refreshToken);
          this.scheduleTokenRefresh();
          console.log('✅ Token refreshed successfully');
          return response;
        }),
        catchError((error) => {
          console.error('❌ Token refresh failed:', error);
          this.logout();
          return throwError(() => error);
        })
      );
  }

  /**
   * Logout user
   */
  logout(): void {
    const currentUser = this.getCurrentUser();
    
    // Clear stored data
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('mm_calendar_auth_url');

    // Clear subjects
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);

    // Clear refresh timer
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    console.log('🔓 User logged out:', currentUser ? {
      email: currentUser.email,
      name: `${currentUser.firstName} ${currentUser.lastName}`
    } : 'No user was authenticated');

    // Redirect to login
    this.router.navigate(['/auth']);
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Get auth headers for HTTP requests
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getStoredToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  /**
   * Get the current auth token
   */
  getToken(): string | null {
    return this.getStoredToken();
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    return user?.permissions?.includes(permission) || false;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role) || false;
  }

  /**
   * Check if user can access organization resource
   */
  canAccessOrganization(organizationId: string): boolean {
    const user = this.getCurrentUser();
    return user?.organizationId === organizationId;
  }

  /**
   * Get calendar authorization URL for Microsoft Graph integration
   */
  getCalendarAuthUrl(): string | null {
    return localStorage.getItem('mm_calendar_auth_url');
  }

  // Private helper methods

  private handleAuthResponse(response: AuthResponse): void {
    this.storeTokens(response.token, response.refreshToken);
    this.storeUser(response.user);
    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
    this.scheduleTokenRefresh();
    
    console.log('✅ User authenticated:', {
      email: response.user.email,
      name: `${response.user.firstName} ${response.user.lastName}`,
      roles: response.user.roles,
      organizationId: response.user.organizationId
    });

    // Store calendar auth URL if available
    if (response.calendarAuthUrl) {
      localStorage.setItem('mm_calendar_auth_url', response.calendarAuthUrl);
      console.log('📅 Calendar authorization URL available for Outlook integration');
    }
  }

  private storeTokens(token: string, refreshToken: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  private storeUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private getStoredUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return true;
      }

      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) {
        return true;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true; // Consider expired if we can't parse
    }
  }

  private getTokenExpiry(token: string): string {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return 'Invalid token';
      }

      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) {
        return 'No expiry';
      }

      return new Date(payload.exp * 1000).toLocaleString();
    } catch (error) {
      console.error('Error parsing token expiry:', error);
      return 'Error parsing expiry';
    }
  }

  private scheduleTokenRefresh(): void {
    const token = this.getStoredToken();
    if (!token) return;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('Invalid JWT token format');
        return;
      }

      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) {
        console.warn('Token missing expiration claim');
        return;
      }

      const expiryTime = payload.exp * 1000;
      const currentTime = Date.now();
      const refreshTime = expiryTime - currentTime - 5 * 60 * 1000; // Refresh 5 minutes before expiry

      if (refreshTime > 0) {
        this.tokenRefreshTimer = setTimeout(() => {
          this.refreshToken().subscribe();
        }, refreshTime);
      }
    } catch (error) {
      console.error('Error parsing token for refresh scheduling:', error);
      // Clear invalid token
      this.logout();
    }
  }
}
