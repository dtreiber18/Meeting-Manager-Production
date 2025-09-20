import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { ApiConfigService } from '../core/services/api-config.service';

export interface UserProfile {
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  preferences?: Record<string, unknown>;
}

export interface UserProfileUpdate {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  preferences?: Record<string, unknown>;
}

@Injectable({
  providedIn: 'root'
})
export class UserTestService {

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
    private readonly apiConfig: ApiConfigService
  ) {}

  /**
   * Get current user profile with detailed debugging
   */
  getCurrentUserProfile(): Observable<UserProfile> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const url = `${this.apiConfig.getApiUrl('users/profile')}?email=${encodeURIComponent(currentUser.email)}`;
    console.log('Making user profile request to:', url);

    return this.http.get(url, { responseType: 'text' }).pipe(
      map((responseText: string) => {
        console.log('Raw response text:', responseText);
        try {
          const response = JSON.parse(responseText);
          console.log('Parsed response:', response);
          return response as UserProfile;
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          console.error('Response text was:', responseText);
          throw parseError;
        }
      }),
      catchError((error: unknown) => {
        console.error('Error getting user profile:', error);
        console.log('Error details:', error);
        
        throw error;
      })
    );
  }

  /**
   * Update user profile with debugging
   */
  updateUserProfile(updates: UserProfileUpdate): Observable<UserProfile> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const body = {
      ...updates,
      email: currentUser.email
    };

    console.log('Updating user profile with:', body);

    return this.http.put<UserProfile>(this.apiConfig.getApiUrl('users/profile'), body).pipe(
      catchError(error => {
        console.error('Error updating user profile:', error);
        throw error;
      })
    );
  }
}
