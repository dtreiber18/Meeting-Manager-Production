import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User, AppConfig } from '../models/settings.model';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly API_URL = `${environment.apiUrl}/api/settings`;
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  
  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {
    console.log('🔧 SettingsService API_URL:', this.API_URL);
    this.loadCurrentUser();
  }

  get currentUser$(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private loadCurrentUser(): void {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }

  updateUser(user: User): Observable<User> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    return this.http.put<User>(`${this.API_URL}/user-profile`, {
      ...user,
      email: currentUser.email
    }).pipe(
      map((updatedUser: User) => {
        this.currentUserSubject.next(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        return updatedUser;
      }),
      catchError((error) => {
        console.error('Error updating user profile:', error);
        // Fallback: update local state for better UX
        const updatedUser = { ...user, updatedAt: new Date() };
        this.currentUserSubject.next(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        throw error;
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<boolean> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    return this.http.put<{ success: boolean }>(`${this.API_URL}/password`, {
      email: currentUser.email,
      currentPassword,
      newPassword
    }).pipe(
      map(response => response.success),
      catchError((error) => {
        console.error('Error changing password:', error);
        throw error;
      })
    );
  }

  getSourceApps(): Observable<AppConfig[]> {
    return this.http.get<AppConfig[]>(`${this.API_URL}/source-apps`).pipe(
      catchError((error) => {
        console.error('Error fetching source apps:', error);
        // Fallback data for development/demo purposes
        const fallbackApps: AppConfig[] = [
          {
            id: '1',
            name: 'Fathom.video',
            type: 'source',
            connectionType: 'api',
            apiUrl: 'https://api.fathom.video/v1',
            apiKey: '',
            fieldMapping: {
              meetingDate: 'date',
              meetingTime: 'start_time',
              meetingSubject: 'title',
              meetingParticipants: 'participants',
              meetingSummary: 'summary',
              meetingActionItems: 'action_items',
              meetingNextSteps: 'next_steps',
              meetingDetails: 'transcript',
              meetingRecording: 'recording_url',
              meetingDuration: 'duration'
            },
            isActive: true
          },
          {
            id: '2',
            name: 'Otter.ai',
            type: 'source',
            connectionType: 'api',
            apiUrl: 'https://otter.ai/forward/api/v1',
            apiKey: '',
            fieldMapping: {
              meetingDate: 'created_at',
              meetingTime: 'start_time',
              meetingSubject: 'title',
              meetingParticipants: 'speakers',
              meetingSummary: 'summary',
              meetingActionItems: 'action_items',
              meetingNextSteps: 'follow_ups',
              meetingDetails: 'transcript',
              meetingRecording: 'audio_url',
              meetingDuration: 'duration'
            },
            isActive: false
          }
        ];
        return of(fallbackApps);
      })
    );
  }

  getDestinationApps(): Observable<AppConfig[]> {
    return this.http.get<AppConfig[]>(`${this.API_URL}/destination-apps`).pipe(
      catchError((error) => {
        console.error('Error fetching destination apps:', error);
        // Fallback data for development/demo purposes
        const fallbackApps: AppConfig[] = [
          {
            id: '1',
            name: 'Google Calendar',
            type: 'destination',
            connectionType: 'api',
            apiUrl: 'https://www.googleapis.com/calendar/v3',
            apiKey: '',
            fieldMapping: {
              meetingDate: 'start.date',
              meetingTime: 'start.dateTime',
              meetingSubject: 'summary',
              meetingParticipants: 'attendees',
              meetingSummary: 'description',
              meetingActionItems: 'description',
              meetingNextSteps: 'description',
              meetingDetails: 'description'
            },
            isActive: true
          },
          {
            id: '2',
            name: 'Gmail',
            type: 'destination',
            connectionType: 'api',
            apiUrl: 'https://www.googleapis.com/gmail/v1',
            apiKey: '',
            fieldMapping: {
              meetingSubject: 'subject',
              meetingParticipants: 'to',
              meetingSummary: 'body',
              meetingActionItems: 'body',
              meetingNextSteps: 'body',
              meetingDetails: 'body',
              meetingDate: '',
              meetingTime: ''
            },
            isActive: true
          }
        ];
        return of(fallbackApps);
      })
    );
  }

  saveAppConfig(app: AppConfig): Observable<AppConfig> {
    return this.http.post<AppConfig>(`${this.API_URL}/app-configs`, app).pipe(
      catchError((error) => {
        console.error('Error saving app config:', error);
        throw error;
      })
    );
  }

  deleteAppConfig(id: string): Observable<boolean> {
    return this.http.delete<{ success: boolean }>(`${this.API_URL}/app-configs/${id}`).pipe(
      map(response => response.success),
      catchError((error) => {
        console.error('Error deleting app config:', error);
        throw error;
      })
    );
  }

  testConnection(app: AppConfig): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.API_URL}/test-connection`, app).pipe(
      catchError((error) => {
        console.error('Error testing connection:', error);
        return of({
          success: false,
          message: 'Connection failed. Please check your credentials and try again.'
        });
      })
    );
  }
}
