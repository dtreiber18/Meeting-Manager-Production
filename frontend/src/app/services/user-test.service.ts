import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { ApiConfigService } from '../core/services/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class UserTestService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private apiConfig: ApiConfigService
  ) {}

  /**
   * Get current user profile with detailed debugging
   */
  getCurrentUserProfile(): Observable<any> {
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
          return response;
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          console.error('Response text was:', responseText);
          throw parseError;
        }
      }),
      catchError((error: any) => {
        console.error('Error getting user profile:', error);
        console.log('Error details:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.message,
          url: error.url
        });
        
        throw error;
      })
    );
  }

  /**
   * Update user profile with debugging
   */
  updateUserProfile(updates: any): Observable<any> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const body = {
      ...updates,
      email: currentUser.email
    };

    console.log('Updating user profile with:', body);

    return this.http.put(this.apiConfig.getApiUrl('users/profile'), body).pipe(
      catchError(error => {
        console.error('Error updating user profile:', error);
        throw error;
      })
    );
  }
}
