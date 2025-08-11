import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { User, AppConfig } from '../models/settings.model';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = '/api/settings';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  
  constructor(private http: HttpClient) {
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
    return new Observable(observer => {
      // Simulate API call
      setTimeout(() => {
        const updatedUser = { ...user, updatedAt: new Date() };
        this.currentUserSubject.next(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        observer.next(updatedUser);
        observer.complete();
      }, 500);
    });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<boolean> {
    return new Observable(observer => {
      // Simulate API call
      setTimeout(() => {
        // In real implementation, validate current password
        observer.next(true);
        observer.complete();
      }, 500);
    });
  }

  getSourceApps(): Observable<AppConfig[]> {
    return new Observable(observer => {
      // Simulate API call with sample data
      setTimeout(() => {
        const sourceApps: AppConfig[] = [
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
        observer.next(sourceApps);
        observer.complete();
      }, 300);
    });
  }

  getDestinationApps(): Observable<AppConfig[]> {
    return new Observable(observer => {
      // Simulate API call with sample data
      setTimeout(() => {
        const destinationApps: AppConfig[] = [
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
        observer.next(destinationApps);
        observer.complete();
      }, 300);
    });
  }

  saveAppConfig(app: AppConfig): Observable<AppConfig> {
    return new Observable(observer => {
      // Simulate API call
      setTimeout(() => {
        const savedApp = { ...app, updatedAt: new Date() };
        observer.next(savedApp);
        observer.complete();
      }, 500);
    });
  }

  deleteAppConfig(id: string): Observable<boolean> {
    return new Observable(observer => {
      // Simulate API call
      setTimeout(() => {
        observer.next(true);
        observer.complete();
      }, 300);
    });
  }

  testConnection(app: AppConfig): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      // Simulate API call
      setTimeout(() => {
        const success = Math.random() > 0.3; // 70% success rate for demo
        observer.next({
          success,
          message: success ? 'Connection successful!' : 'Connection failed. Please check your credentials.'
        });
        observer.complete();
      }, 1000);
    });
  }
}
