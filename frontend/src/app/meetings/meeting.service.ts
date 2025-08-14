
import { Meeting } from './meeting.model';
import { MeetingMapperService } from './meeting-mapper.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class MeetingService {
  private apiUrl = '/api/meetings';

  constructor(
    private http: HttpClient,
    private mapper: MeetingMapperService
  ) {
    // In production, check if we need to use a different backend URL
    if (window.location.hostname.includes('azurecontainerapps.io')) {
      // Use the backend container app URL in production with /api prefix
      this.apiUrl = 'https://ca-backend-jq7rzfkj24zqy.mangoriver-904fd974.eastus.azurecontainerapps.io/api/meetings';
    }
  }

  getMeetings(): Observable<Meeting[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(backendMeetings => this.mapper.transformMeetingsFromBackend(backendMeetings))
    );
  }

  getMeeting(id: string | number): Observable<Meeting> {
    return this.http.get<Meeting>(`${this.apiUrl}/${id}`);
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
