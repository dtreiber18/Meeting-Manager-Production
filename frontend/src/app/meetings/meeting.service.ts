
import { Meeting } from './meeting.model';
import { MeetingMapperService } from './meeting-mapper.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiConfigService } from '../core/services/api-config.service';

interface BackendMeeting {
  id: number;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  meetingType?: string;
  status?: string;
  participants?: Array<{
    id: number;
    name: string;
    email: string;
    attended?: boolean;
  }>;
  actionItems?: Array<{
    id: number;
    description: string;
    assignedTo?: string;
    dueDate: string;
    priority?: string;
    status?: string;
  }>;
  nextSteps?: string | string[];
  summary?: string;
  details?: string;
  recordingUrl?: string;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class MeetingService {
  private readonly _meetingsUpdated = new BehaviorSubject<boolean>(false);
  
  // Observable that components can subscribe to for meeting updates
  public meetingsUpdated$ = this._meetingsUpdated.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly mapper: MeetingMapperService,
    private readonly apiConfig: ApiConfigService
  ) {
    console.log('🔧 MeetingService using ApiConfigService');
    console.log('🔧 Meetings endpoint:', this.apiConfig.endpoints.meetings());
  }

  getMeetings(): Observable<Meeting[]> {
    return this.http.get<BackendMeeting[]>(this.apiConfig.endpoints.meetings()).pipe(
      map(backendMeetings => this.mapper.transformMeetingsFromBackend(backendMeetings))
    );
  }

  getMeeting(id: string | number): Observable<Meeting> {
    const fullUrl = this.apiConfig.endpoints.meeting(id);
    console.log('🔧 MeetingService.getMeeting() calling URL:', fullUrl);
    return this.http.get<BackendMeeting>(fullUrl, { 
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).pipe(
      map(backendMeeting => {
        const transformed = this.mapper.transformMeetingFromBackend(backendMeeting);
        console.log('Meeting loaded successfully:', transformed.title);
        return transformed;
      })
    );
  }

  createMeeting(meeting: Meeting): Observable<Meeting> {
    return this.http.post<Meeting>(this.apiConfig.endpoints.meetings(), meeting).pipe(
      tap(() => {
        // Notify subscribers that meetings have been updated
        this._meetingsUpdated.next(true);
      })
    );
  }

  updateMeeting(id: string | number, meeting: Meeting): Observable<Meeting> {
    const backendMeeting = this.mapper.transformMeetingToBackend(meeting);
    return this.http.put<BackendMeeting>(this.apiConfig.endpoints.meeting(id), backendMeeting, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).pipe(
      tap(() => {
        // Notify subscribers that meetings have been updated
        this._meetingsUpdated.next(true);
      }),
      map(backendResponse => this.mapper.transformMeetingFromBackend(backendResponse))
    );
  }

  deleteMeeting(id: string | number): Observable<void> {
    return this.http.delete<void>(this.apiConfig.endpoints.meeting(id)).pipe(
      tap(() => {
        // Notify subscribers that meetings have been updated
        this._meetingsUpdated.next(true);
      })
    );
  }

  // Method to manually trigger refresh
  notifyMeetingsUpdated(): void {
    this._meetingsUpdated.next(true);
  }
}
