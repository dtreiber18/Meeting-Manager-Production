import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MeetingService } from '../meeting.service';
import { Meeting } from '../meeting.model';

@Component({
  selector: 'app-meeting-details',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './meeting-details.component.html',
  styleUrl: './meeting-details.component.scss'
})
export class MeetingDetailsComponent implements OnInit {
  meeting?: Meeting & { source?: 'mm' | 'n8n' };
  loading = true;
  error: string | null = null;
  meetingId: string | null = null;
  meetingSource: 'mm' | 'n8n' = 'mm';

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private meetingService: MeetingService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.meetingId = this.route.snapshot.paramMap.get('id');
    this.meetingSource = (this.route.snapshot.queryParamMap.get('source') as 'mm' | 'n8n') || 'mm';
    
    console.log('🔍 Loading meeting details:', { id: this.meetingId, source: this.meetingSource });
    
    if (this.meetingId) {
      this.loadMeeting();
    } else {
      this.error = 'No meeting ID provided';
      this.loading = false;
    }
  }

  loadMeeting() {
    if (!this.meetingId) return;
    
    this.loading = true;
    this.error = null;
    
    if (this.meetingSource === 'n8n') {
      this.loadN8nMeeting();
    } else {
      this.loadMeetingManagerMeeting();
    }
  }

  loadMeetingManagerMeeting() {
    if (!this.meetingId) return;
    
    console.log('📞 Fetching Meeting Manager meeting details...');
    this.meetingService.getMeeting(this.meetingId).subscribe({
      next: (data) => {
        console.log('✅ Meeting Manager meeting details:', data);
        this.meeting = { ...data, source: 'mm' };
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error fetching Meeting Manager meeting:', error);
        this.handleError(error);
      }
    });
  }

  loadN8nMeeting() {
    if (!this.meetingId) return;
    
    console.log('📞 Fetching n8n meeting details for ID:', this.meetingId);
    
    // First try to get individual meeting details
    this.http.post<any>('https://g37-ventures1.app.n8n.cloud/webhook/operations', { 
      action: 'get_event_details', 
      event_id: this.meetingId 
    }).subscribe({
      next: (n8nData) => {
        console.log('✅ n8n meeting details response:', n8nData);
        
        if (n8nData && n8nData !== null && typeof n8nData === 'object') {
          // Successfully got specific meeting details
          this.createN8nMeetingFromData(n8nData);
        } else {
          // API returned null/empty, try to get from list
          console.log('⚠️ n8n returned null, trying to get from list...');
          this.loadN8nMeetingFromList();
        }
      },
      error: (error) => {
        console.error('❌ Error fetching n8n meeting details:', error);
        // Try fallback approach - get from list
        this.loadN8nMeetingFromList();
      }
    });
  }

  loadN8nMeetingFromList() {
    console.log('📞 Fetching n8n meeting from list API...');
    // Get all meetings and find the one we need
    this.http.post<any>('https://g37-ventures1.app.n8n.cloud/webhook/operations', { 
      action: 'get_events'
    }).subscribe({
      next: (response) => {
        console.log('✅ n8n list response for details lookup:', response);
        
        let meetingData = null;
        
        if (response && Array.isArray(response)) {
          // Find the meeting by ID (try multiple ID formats)
          meetingData = response.find(meeting => 
            meeting.id === this.meetingId || 
            meeting.id === parseInt(this.meetingId || '0') ||
            meeting.eventId === this.meetingId ||
            meeting.meetingId === this.meetingId
          );
          console.log('🔍 Found meeting in list:', meetingData);
        } else if (response && response.id === this.meetingId) {
          // Single meeting response
          meetingData = response;
        }
        
        if (meetingData) {
          this.createN8nMeetingFromData(meetingData);
        } else {
          // No real data available - show error instead of mock data
          this.handleN8nDataNotFound();
        }
      },
      error: (error) => {
        console.error('❌ Error fetching n8n meeting list:', error);
        this.handleN8nApiError(error);
      }
    });
  }

  createN8nMeetingFromData(n8nData: any) {
    console.log('✅ Creating n8n meeting from real data:', n8nData);
    this.meeting = {
      id: parseInt(this.meetingId || '0') || 0,
      title: n8nData.title || n8nData.meetingType || 'Untitled n8n Meeting',
      description: n8nData.description || n8nData.summary || '',
      source: 'n8n',
      meetingType: n8nData.meetingType || 'other',
      status: 'completed',
      priority: 'medium',
      isRecurring: false,
      startTime: n8nData.date || n8nData.meetingMetadata?.date || n8nData.startTime || new Date().toISOString(),
      endTime: n8nData.endTime || new Date().toISOString(),
      isPublic: false,
      requiresApproval: false,
      allowRecording: false,
      autoTranscription: false,
      aiAnalysisEnabled: false,
      createdAt: n8nData.createdAt || new Date().toISOString(),
      updatedAt: n8nData.updatedAt || new Date().toISOString(),
      organization: {
        id: 0,
        name: 'n8n External',
        domain: 'n8n.cloud',
        timezone: 'UTC',
        isActive: true,
        maxUsers: 1000,
        maxMeetings: 1000,
        subscriptionTier: 'external',
        currentUserCount: 0,
        currentMeetingCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      organizer: {
        id: 0,
        firstName: 'n8n',
        lastName: 'System',
        email: 'n8n@system.com',
        isActive: true,
        emailNotifications: false,
        pushNotifications: false,
        timezone: 'UTC',
        language: 'en',
        displayName: 'n8n System',
        fullName: 'n8n System',
        roles: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      participants: n8nData.attendees || [],
      actionItems: n8nData.actionItems || [],
      notes: [],
      attachments: [],
      details: n8nData.keyDecisions || n8nData.nextSteps || n8nData.description || 'n8n meeting details',
      durationInMinutes: n8nData.duration || 60,
      upcoming: false,
      inProgress: false,
      subject: n8nData.title || n8nData.meetingType || 'n8n Meeting',
      type: n8nData.meetingType || 'other'
    } as unknown as Meeting & { source: 'n8n' };
    this.loading = false;
  }

  handleN8nDataNotFound() {
    console.error('❌ Meeting not found in n8n data');
    this.error = `Meeting with ID ${this.meetingId} was not found in n8n. It may have been deleted or the ID may be incorrect.`;
    this.loading = false;
  }

  handleN8nApiError(error: any) {
    console.error('❌ n8n API completely unavailable:', error);
    if (error.status === 0) {
      this.error = 'Unable to connect to n8n. Please check your internet connection and try again.';
    } else if (error.status >= 500) {
      this.error = 'n8n server error. Please try again later.';
    } else {
      this.error = `Failed to load meeting from n8n (${error.status}). The meeting data may be temporarily unavailable.`;
    }
    this.loading = false;
  }

  handleError(error: any) {
    if (error.status === 0) {
      this.error = 'Unable to connect to server. Please check your internet connection.';
    } else if (error.status === 404) {
      this.error = `Meeting with ID ${this.meetingId} not found.`;
    } else if (error.status >= 500) {
      this.error = 'Server error. Please try again later.';
    } else {
      this.error = `Failed to load meeting details (${error.status})`;
    }
    this.loading = false;
  }

  retryLoad() {
    this.loadMeeting();
  }

  editMeeting() {
    if (this.meeting?.id) {
      this.router.navigate(['/meetings/edit', this.meeting.id]);
    }
  }

  uploadDocuments() {
    // TODO: Implement document upload functionality
    console.log('Upload documents functionality coming soon');
  }

  formatDateTime(dateTime: string | undefined): string {
    if (!dateTime) return 'Not specified';
    try {
      const date = new Date(dateTime);
      return date.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateTime;
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'Not specified';
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return date;
    }
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }
}
