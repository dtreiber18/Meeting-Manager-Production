import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, firstValueFrom } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

export interface CalendarStatus {
  isConnected: boolean;
  isExpired: boolean;
  userEmail: string;
  expiresAt?: string;
  error?: string;
}

export interface CalendarAuthResponse {
  authUrl: string;
}

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private readonly API_URL = environment.apiUrl;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  /**
   * Get Microsoft Graph authorization URL
   */
  getAuthUrl(): Observable<CalendarAuthResponse> {
    return this.http.get<CalendarAuthResponse>(`${this.API_URL}/calendar/oauth/auth-url`)
      .pipe(
        catchError(error => {
          console.error('Error getting calendar auth URL:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Handle OAuth callback with authorization code
   */
  handleOAuthCallback(code: string): Observable<CalendarAuthResponse> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    const body = {
      code: code,
      userEmail: currentUser.email
    };

    console.log('Sending OAuth callback request:', body);

    // Get the JWT token headers using AuthService
    const headers = this.authService.getAuthHeaders();

    return this.http.post<CalendarAuthResponse>(`/api/calendar/oauth/callback`, body, { headers }).pipe(
        catchError(error => {
          console.error('Error handling OAuth callback:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get calendar integration status for current user
   */
  getCalendarStatus(): Observable<CalendarStatus> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      // Return a default status instead of throwing an error
      return of({
        isConnected: false,
        isExpired: false,
        userEmail: ''
      });
    }

    // Use text response type to avoid Angular JSON parsing issues
    return this.http.get(`${this.API_URL}/calendar/status?userEmail=${encodeURIComponent(currentUser.email)}`, {
      responseType: 'text'
    })
      .pipe(
        map((response: string) => {
          try {
            return JSON.parse(response) as CalendarStatus;
          } catch (e) {
            console.error('Failed to parse calendar status response:', e);
            throw new Error('Invalid response format');
          }
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error getting calendar status:', error);
          console.log('Error details:', {
            status: error.status,
            statusText: error.statusText,
            error: error.error,
            message: error.message
          });
          
          // If the response has a body but Angular treated it as an error
          if (error.error && typeof error.error === 'string') {
            try {
              const parsed = JSON.parse(error.error) as CalendarStatus;
              console.log('Extracted calendar status from error body:', parsed);
              return of(parsed);
            } catch (parseError) {
              // Log the parse error and fall through to default handling
              console.warn('Could not parse error response as JSON:', parseError);
            }
          }
          
          // Return a default status for any other errors
          return of({
            isConnected: false,
            isExpired: false,
            userEmail: currentUser.email,
            error: error.message || 'Unknown error'
          });
        })
      );
  }

  /**
   * Disconnect calendar integration
   */
  disconnectCalendar(): Observable<void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.delete(`${this.API_URL}/calendar/disconnect`, {
      params: { userEmail: currentUser.email },
      responseType: 'text'
    }).pipe(
      map((response: string) => {
        try {
          return response ? JSON.parse(response) : { success: true };
        } catch (jsonError) {
          // If not valid JSON, treat as success
          console.warn('Response is not valid JSON, treating as success:', jsonError);
          return { success: true };
        }
      }),
      catchError(error => {
        console.error('Error disconnecting calendar:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Open Microsoft Graph authorization window
   */
  async connectCalendar(): Promise<void> {
    try {
      const authResponse = await firstValueFrom(this.getAuthUrl());
      if (authResponse?.authUrl) {
        // Open the authorization URL in a new window
        window.open(authResponse.authUrl, 'calendar-auth', 'width=600,height=600');
        
        // Listen for the callback
        this.listenForCallback();
      }
    } catch (error) {
      console.error('Error connecting calendar:', error);
      throw error;
    }
  }

  /**
   * Listen for OAuth callback from popup window
   */
  private listenForCallback(): void {
    const checkClosed = setInterval(() => {
      // This is a simple approach - in production you'd want a more robust callback handling
      console.log('Listening for calendar authorization callback...');
    }, 1000);

    // Stop checking after 5 minutes
    setTimeout(() => {
      clearInterval(checkClosed);
    }, 300000);
  }
}
