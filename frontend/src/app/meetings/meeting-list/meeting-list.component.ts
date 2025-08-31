import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MeetingService } from '../meeting.service';
import { Meeting } from '../meeting.model';
import { environment } from '../../../environments/environment';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-meeting-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule, MatTableModule, MatButtonModule, MatChipsModule],
  templateUrl: './meeting-list.component.html',
  styleUrl: './meeting-list.component.scss'
})
export class MeetingListComponent implements OnDestroy {
  meetings: (Meeting & { source?: 'mm' | 'n8n' })[] = [];
  loading = true;
  error = '';
  displayedColumns = ['title', 'date', 'actions'];

  private destroy$ = new Subject<void>();

  constructor(private meetingService: MeetingService, private http: HttpClient) {
    this.loadMeetings();
    
    // Subscribe to meeting updates
    this.meetingService.meetingsUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((updated) => {
        if (updated) {
          console.log('Meetings updated, refreshing meeting list...');
          this.loadMeetings();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMeetings() {
    console.log('🚀 Starting to load meetings from both sources...');
    this.loading = true;
    let mmMeetings: (Meeting & { source?: 'mm' })[] = [];
    let n8nMeetings: (Meeting & { source?: 'n8n' })[] = [];
    let mmCompleted = false;
    let n8nCompleted = false;

    // Function to finalize results when both calls complete
    const finalizeMeetings = () => {
      if (mmCompleted && n8nCompleted) {
        console.log('✅ Both API calls completed. MM meetings:', mmMeetings.length, 'n8n meetings:', n8nMeetings.length);
        // Merge and sort
        this.meetings = [...mmMeetings, ...n8nMeetings].sort((a, b) => {
          const dateA = new Date(a.date || a.startTime || a.createdAt).getTime();
          const dateB = new Date(b.date || b.startTime || b.createdAt).getTime();
          return dateB - dateA;
        });
        this.loading = false;
      }
    };

    // Call Meeting Manager backend (independent of n8n)
    console.log('📞 Calling Meeting Manager backend...');
    this.meetingService.getMeetings().subscribe({
      next: (data: Meeting[]) => {
        console.log('✅ Meeting Manager response:', data);
        mmMeetings = data.map((m: Meeting) => ({ ...m, source: 'mm' }));
        mmCompleted = true;
        finalizeMeetings();
      },
      error: (err: any) => {
        console.log('❌ Meeting Manager backend unavailable:', err);
        mmCompleted = true;
        finalizeMeetings();
      }
    });

    // Call n8n API (independent of Meeting Manager)
    // n8n API call - only if environment enables it
    if (environment.enableN8nIntegration && environment.n8nWebhookUrl) {
      console.log('📞 Calling n8n webhook...');
      this.http.post<any[]>(environment.n8nWebhookUrl, { action: 'get_events' }).subscribe({
      next: (n8nData: any[]) => {
        console.log('✅ n8n response:', n8nData);
        // Map n8n meetings to Meeting model as best as possible
        n8nMeetings = (n8nData || []).map((ev: any) => ({
          ...ev,
          source: 'n8n',
          // fallback for missing fields
          title: ev.title || ev.meetingType || 'n8n Meeting',
          date: ev.date || ev.meetingMetadata?.date || ev.startTime,
          id: ev.id || ev.eventId || ev.meetingId || Math.random().toString(36).substring(2, 10)
        }));
        n8nCompleted = true;
        finalizeMeetings();
      },
      error: (err: any) => {
        console.log('❌ n8n API error:', err);
        this.error = 'Only meetings created locally (within the tool) are currently visible due to lost connection.';
        n8nCompleted = true;
        finalizeMeetings();
      }
    });
    } else {
      console.log('⚠️ n8n integration disabled or URL not configured');
      n8nCompleted = true;
      finalizeMeetings();
    }
  }
}
