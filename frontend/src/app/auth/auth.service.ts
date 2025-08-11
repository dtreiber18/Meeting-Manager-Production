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
}

export interface TokenRefreshResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api';
  private readonly TOKEN_KEY = 'mm_auth_token';
  private readonly REFRESH_TOKEN_KEY = 'mm_refresh_token';
  private readonly USER_KEY = 'mm_user';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private tokenRefreshTimer: any;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const token = this.getStoredToken();
    const user = this.getStoredUser();

    if (token && user && !this.isTokenExpired(token)) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
      this.scheduleTokenRefresh();
    } else {
      this.logout();
    }
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        map(response => {
          this.handleAuthResponse(response);
          return response;
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Register new user
   */
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, userData)
      .pipe(
        map(response => {
          this.handleAuthResponse(response);
          return response;
        }),
        catchError(error => {
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
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/azure/callback`, { code, state })
      .pipe(
        map(response => {
          this.handleAuthResponse(response);
          return response;
        }),
        catchError(error => {
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
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<TokenRefreshResponse>(`${this.API_URL}/auth/refresh`, { refreshToken })
      .pipe(
        map(response => {
          this.storeTokens(response.token, response.refreshToken);
          this.scheduleTokenRefresh();
          return response;
        }),
        catchError(error => {
          console.error('Token refresh error:', error);
          this.logout();
          return throwError(() => error);
        })
      );
  }

  /**
   * Logout user
   */
  logout(): void {
    // Clear stored data
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    // Clear subjects
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);

    // Clear refresh timer
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

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

  // Private helper methods

  private handleAuthResponse(response: AuthResponse): void {
    this.storeTokens(response.token, response.refreshToken);
    this.storeUser(response.user);
    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
    this.scheduleTokenRefresh();
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
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  private scheduleTokenRefresh(): void {
    const token = this.getStoredToken();
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000;
      const currentTime = Date.now();
      const refreshTime = expiryTime - currentTime - (5 * 60 * 1000); // Refresh 5 minutes before expiry

      if (refreshTime > 0) {
        this.tokenRefreshTimer = setTimeout(() => {
          this.refreshToken().subscribe();
        }, refreshTime);
      }
    } catch (error) {
      console.error('Error parsing token for refresh scheduling:', error);
    }
  }
}
