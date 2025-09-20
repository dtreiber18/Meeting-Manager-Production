import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, lastValueFrom } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { ApiConfigService } from '../core/services/api-config.service';

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

export interface OAuthCallbackResponse {
  success: boolean;
  message?: string;
}

export interface DisconnectResponse {
  success: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
    private readonly apiConfig: ApiConfigService
  ) {}

  /**
   * Get Microsoft Graph authorization URL
   */
  getAuthUrl(): Observable<CalendarAuthResponse> {
    return this.http.get<CalendarAuthResponse>(this.apiConfig.getApiUrl('calendar/oauth/auth-url'))
      .pipe(
        catchError(error => {
          console.error('Error getting calendar auth URL:', error);
          throw error;
        })
      );
  }

  /**
   * Handle OAuth callback with authorization code
   */
  handleOAuthCallback(code: string): Observable<OAuthCallbackResponse> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const body = {
      code: code,
      userEmail: currentUser.email
    };

    console.log('Sending OAuth callback request:', body);

    // Get the JWT token headers using AuthService
    const headers = this.authService.getAuthHeaders();

    return this.http.post<OAuthCallbackResponse>(this.apiConfig.getApiUrl('calendar/oauth/callback'), body, { headers })
      .pipe(
        catchError(error => {
          console.error('Error handling OAuth callback:', error);
          throw error;
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

    const url = `${this.apiConfig.getApiUrl('calendar/status')}?userEmail=${encodeURIComponent(currentUser.email)}`;
    console.log('Making calendar status request to:', url);

    return this.http.get(url, { responseType: 'text' }).pipe(
      map((responseText: string) => {
        console.log('Raw response text:', responseText);
        try {
          const response = JSON.parse(responseText);
          console.log('Parsed response:', response);
          return response as CalendarStatus;
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          console.error('Response text was:', responseText);
          throw parseError;
        }
      }),
      catchError((error: unknown) => {
        console.error('Error getting calendar status:', error);
        console.log('Error details:', error);
        
        // Return a default status for any errors
        return of({
          isConnected: false,
          isExpired: false,
          userEmail: currentUser.email,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      })
    );
  }

  /**
   * Disconnect calendar integration
   */
  disconnectCalendar(): Observable<DisconnectResponse> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    return this.http.delete<DisconnectResponse>(this.apiConfig.getApiUrl('calendar/disconnect'), {
      params: { userEmail: currentUser.email }
    }).pipe(
      catchError(error => {
        console.error('Error disconnecting calendar:', error);
        throw error;
      })
    );
  }

  /**
   * Open Microsoft Graph authorization window
   */
  async connectCalendar(): Promise<void> {
    try {
      const authResponse = await lastValueFrom(this.getAuthUrl());
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
