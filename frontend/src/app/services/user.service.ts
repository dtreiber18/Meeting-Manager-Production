import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { ApiConfigService } from '../core/services/api-config.service';

export interface UserProfile {
  id: number;
  email: string;
  displayName: string;
  timezone: string;
  language: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  calendarSync: boolean;
  meetingReminders: boolean;
  darkMode: boolean;
  compactView: boolean;
  // Display preferences
  theme?: string;
  dateFormat?: string;
  timeFormat?: string;
  // Personal information  
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  jobTitle?: string;
  department?: string;
  bio?: string;
  // Notification preferences
  pushNotifications?: boolean;
  actionItemReminders?: boolean;
  weeklyDigest?: boolean;
  // Privacy settings
  profileVisibility?: string;
  showOnlineStatus?: boolean;
  allowDirectMessages?: boolean;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
    private readonly apiConfig: ApiConfigService
  ) {
    console.log('🔧 UserService using ApiConfigService');
  }

  /**
   * Get user profile
   */
  getUserProfile(): Observable<UserProfile | null> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return of(null);
    }

    return this.http.get(`${this.apiConfig.endpoints.userProfile()}`, {
      params: { email: currentUser.email },
      responseType: 'text'
    }).pipe(
      map((response: string) => {
        try {
          return JSON.parse(response) as UserProfile;
        } catch (e) {
          console.error('Failed to parse user profile response:', e);
          throw new Error('Invalid response format');
        }
      }),
      catchError((error: unknown) => {
        console.error('Error getting user profile:', error);
        
        // Type guard for HTTP error response
        const httpError = error as { error?: string };
        
        // If the response has a body but Angular treated it as an error
        if (httpError.error && typeof httpError.error === 'string') {
          try {
            const parsed = JSON.parse(httpError.error) as UserProfile;
            console.log('Extracted user profile from error body:', parsed);
            return of(parsed);
          } catch (parseError) {
            console.error('Failed to parse error response:', parseError);
            // Fall through to default handling
          }
        }
        
        // Return a default profile for any other errors
        return of({
          id: 0,
          email: currentUser.email,
          displayName: `${currentUser.firstName} ${currentUser.lastName}`,
          timezone: 'UTC',
          language: 'en',
          emailNotifications: true,
          smsNotifications: false,
          calendarSync: false,
          meetingReminders: true,
          darkMode: false,
          compactView: false
        });
      })
    );
  }

  /**
   * Update user profile
   */
  updateUserProfile(profile: Partial<UserProfile>): Observable<UserProfile> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Create request body with email included (backend expects this)
    const requestBody = {
      ...profile,
      email: currentUser.email // Backend expects email in body, not query params
    };

    return this.http.put(`${this.apiConfig.endpoints.userProfile()}`, requestBody, {
      responseType: 'text'
    }).pipe(
      map((response: string) => {
        try {
          return JSON.parse(response) as UserProfile;
        } catch (e) {
          console.error('Failed to parse update profile response:', e);
          throw new Error('Invalid response format');
        }
      }),
      catchError((error: unknown) => {
        console.error('Error updating user profile:', error);
        
        // Type guard for HTTP error response
        const httpError = error as { error?: string };
        
        // If the response has a body but Angular treated it as an error
        if (httpError.error && typeof httpError.error === 'string') {
          try {
            const parsed = JSON.parse(httpError.error) as UserProfile;
            console.log('Extracted updated profile from error body:', parsed);
            return of(parsed);
          } catch (parseError) {
            console.error('Failed to parse error response:', parseError);
            // Fall through to error throwing
          }
        }
        
        throw error;
      })
    );
  }

  /**
   * Update user timezone
   */
  updateTimezone(timezone: string): Observable<ApiResponse> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    return this.http.put(`${this.apiConfig.endpoints.userTimezone()}`, { timezone }, {
      params: { email: currentUser.email },
      responseType: 'text'
    }).pipe(
      map((response: string) => {
        try {
          return response ? JSON.parse(response) : { success: true };
        } catch (parseError) {
          console.error('Failed to parse timezone response:', parseError);
          // If not valid JSON, treat as success
          return { success: true };
        }
      }),
      catchError((error: unknown) => {
        console.error('Error updating timezone:', error);
        throw error;
      })
    );
  }

  /**
   * Update user language
   */
  updateLanguage(language: string): Observable<ApiResponse> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    return this.http.put(`${this.apiConfig.endpoints.userLanguage()}`, { language }, {
      params: { email: currentUser.email },
      responseType: 'text'
    }).pipe(
      map((response: string) => {
        try {
          return response ? JSON.parse(response) : { success: true };
        } catch (parseError) {
          console.error('Failed to parse language response:', parseError);
          // If not valid JSON, treat as success
          return { success: true };
        }
      }),
      catchError((error: unknown) => {
        console.error('Error updating language:', error);
        throw error;
      })
    );
  }

  /**
   * Update notification preferences
   */
  updateNotificationPreferences(preferences: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    meetingReminders?: boolean;
  }): Observable<ApiResponse> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Create request body with email included (backend expects this)
    const requestBody = {
      ...preferences,
      email: currentUser.email // Backend expects email in body, not query params
    };

    return this.http.put(`${this.apiConfig.endpoints.userProfile()}`, requestBody, {
      responseType: 'text'
    }).pipe(
      map((response: string) => {
        try {
          return response ? JSON.parse(response) : { success: true };
        } catch (parseError) {
          console.error('Failed to parse notification preferences response:', parseError);
          // If not valid JSON, treat as success
          return { success: true };
        }
      }),
      catchError((error: unknown) => {
        console.error('Error updating notification preferences:', error);
        throw error;
      })
    );
  }
}
