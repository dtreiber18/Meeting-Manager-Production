
import { Meeting } from './meeting.model';
import { MeetingMapperService } from './meeting-mapper.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

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
  private apiUrl = '/api/meetings';
  private _meetingsUpdated = new BehaviorSubject<boolean>(false);
  
  // Observable that components can subscribe to for meeting updates
  public meetingsUpdated$ = this._meetingsUpdated.asObservable();

  constructor(
    private http: HttpClient,
    private mapper: MeetingMapperService
  ) {
    // Use local backend for development (proxied through angular dev server)
    // Use production backend for deployed environments
    if (window.location.hostname.includes('azurecontainerapps.io')) {
      // Use the backend container app URL in production with /api prefix
      this.apiUrl = 'https://ca-backend-jq7rzfkj24zqy.mangoriver-904fd974.eastus.azurecontainerapps.io/api/meetings';
    } else {
      // Use local backend through Angular proxy for development
      this.apiUrl = '/api/meetings';
    }
  }

  getMeetings(): Observable<Meeting[]> {
    return this.http.get<BackendMeeting[]>(this.apiUrl).pipe(
      map(backendMeetings => this.mapper.transformMeetingsFromBackend(backendMeetings))
    );
  }

  getMeeting(id: string | number): Observable<Meeting> {
    return this.http.get<BackendMeeting>(`${this.apiUrl}/${id}`, { 
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
    return this.http.post<Meeting>(this.apiUrl, meeting).pipe(
      tap(() => {
        // Notify subscribers that meetings have been updated
        this._meetingsUpdated.next(true);
      })
    );
  }

  updateMeeting(id: string | number, meeting: Meeting): Observable<Meeting> {
    return this.http.put<Meeting>(`${this.apiUrl}/${id}`, meeting).pipe(
      tap(() => {
        // Notify subscribers that meetings have been updated
        this._meetingsUpdated.next(true);
      })
    );
  }

  deleteMeeting(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
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
