
import { Meeting } from './meeting.model';
import { MeetingMapperService } from './meeting-mapper.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
  private apiUrl = 'https://ca-backend-jq7rzfkj24zqy.mangoriver-904fd974.eastus.azurecontainerapps.io/api/meetings';

  constructor(
    private http: HttpClient,
    private mapper: MeetingMapperService
  ) {
    // For local development, we'll use the production backend directly
    // In production, check if we need to use a different backend URL
    if (window.location.hostname.includes('azurecontainerapps.io')) {
      // Use the backend container app URL in production with /api prefix
      this.apiUrl = 'https://ca-backend-jq7rzfkj24zqy.mangoriver-904fd974.eastus.azurecontainerapps.io/api/meetings';
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
    return this.http.post<Meeting>(this.apiUrl, meeting);
  }

  updateMeeting(id: string | number, meeting: Meeting): Observable<Meeting> {
    return this.http.put<Meeting>(`${this.apiUrl}/${id}`, meeting);
  }

  deleteMeeting(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
