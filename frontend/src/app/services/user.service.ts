import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService, User } from '../auth/auth.service';
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
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private apiConfig: ApiConfigService
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
      catchError((error: any) => {
        console.error('Error getting user profile:', error);
        
        // If the response has a body but Angular treated it as an error
        if (error.error && typeof error.error === 'string') {
          try {
            const parsed = JSON.parse(error.error) as UserProfile;
            console.log('Extracted user profile from error body:', parsed);
            return of(parsed);
          } catch (e) {
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
      catchError((error: any) => {
        console.error('Error updating user profile:', error);
        
        // If the response has a body but Angular treated it as an error
        if (error.error && typeof error.error === 'string') {
          try {
            const parsed = JSON.parse(error.error) as UserProfile;
            console.log('Extracted updated profile from error body:', parsed);
            return of(parsed);
          } catch (e) {
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
  updateTimezone(timezone: string): Observable<any> {
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
        } catch (e) {
          // If not valid JSON, treat as success
          return { success: true };
        }
      }),
      catchError((error: any) => {
        console.error('Error updating timezone:', error);
        throw error;
      })
    );
  }

  /**
   * Update user language
   */
  updateLanguage(language: string): Observable<any> {
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
        } catch (e) {
          // If not valid JSON, treat as success
          return { success: true };
        }
      }),
      catchError((error: any) => {
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
  }): Observable<any> {
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
        } catch (e) {
          // If not valid JSON, treat as success
          return { success: true };
        }
      }),
      catchError((error: any) => {
        console.error('Error updating notification preferences:', error);
        throw error;
      })
    );
  }
}
