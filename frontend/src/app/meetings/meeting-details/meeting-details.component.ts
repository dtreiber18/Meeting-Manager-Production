import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MeetingService } from '../meeting.service';
import { Meeting, Participant, ActionItem } from '../meeting.model';
import { environment } from '../../../environments/environment';
import { ModalService } from '../../shared/modal/modal.service';
import { ModalContainerComponent } from '../../shared/modal/modal-container/modal-container.component';
import { ParticipantEditModalComponent } from '../../shared/modal/participant-edit-modal/participant-edit-modal.component';
import { MeetingEditModalComponent } from '../../shared/modal/meeting-edit-modal/meeting-edit-modal.component';
import { DocumentUploadDialogComponent } from '../../shared/document-upload-dialog/document-upload-dialog.component';

interface N8nEventData {
  id?: string;
  title?: string;
  start?: string;
  end?: string;
  description?: string;
  [key: string]: unknown;
}

@Component({
  selector: 'app-meeting-details',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ModalContainerComponent],
  templateUrl: './meeting-details.component.html',
  styleUrl: './meeting-details.component.scss'
})
export class MeetingDetailsComponent implements OnInit {
  meeting?: Meeting & { source?: 'mm' | 'n8n' };
  loading = true;
  error: string | null = null;
  meetingId: string | null = null;
  meetingSource: 'mm' | 'n8n' = 'mm';
  isEditing = false; // Add edit mode state

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly meetingService: MeetingService,
    private readonly http: HttpClient,
    private readonly modalService: ModalService,
    private readonly dialog: MatDialog
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
    this.http.post<N8nEventData>(environment.n8nWebhookUrl, { 
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
    this.http.post<N8nEventData[]>(environment.n8nWebhookUrl, { 
      action: 'get_events'
    }).subscribe({
      next: (response) => {
        console.log('✅ n8n list response for details lookup:', response);
        
        let meetingData = null;
        
        if (response && Array.isArray(response)) {
          // Find the meeting by ID (try multiple ID formats)
          const meetingIdNum = parseInt(this.meetingId || '0');
          meetingData = response.find(meeting => {
            // Check different possible ID fields from the response
            const meetingId = meeting?.id;
            return (
              (typeof meetingId === 'number' && meetingId === meetingIdNum) ||
              (typeof meetingId === 'string' && meetingId === this.meetingId) ||
              (meeting as Record<string, string>)['eventId'] === this.meetingId ||
              (meeting as Record<string, string>)['meetingId'] === this.meetingId
            );
          });
          console.log('🔍 Found meeting in list:', meetingData);
        } else if (response && (response as Record<string, string>)['id'] === this.meetingId) {
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

  createN8nMeetingFromData(n8nData: Record<string, unknown>) {
    console.log('✅ Creating n8n meeting from real data:', n8nData);
    this.meeting = {
      id: parseInt(this.meetingId || '0') || 0,
      title: (n8nData['title'] || n8nData['meetingType'] || 'Untitled n8n Meeting') as string,
      description: (n8nData['description'] || n8nData['summary'] || '') as string,
      source: 'n8n',
      meetingType: (n8nData['meetingType'] || 'other') as string,
      status: 'completed',
      priority: 'medium',
      isRecurring: false,
      startTime: (n8nData['date'] || (n8nData['meetingMetadata'] as Record<string, unknown>)?.['date'] || n8nData['startTime'] || new Date().toISOString()) as string,
      endTime: (n8nData['endTime'] || new Date().toISOString()) as string,
      isPublic: false,
      requiresApproval: false,
      allowRecording: false,
      autoTranscription: false,
      aiAnalysisEnabled: false,
      createdAt: (n8nData['createdAt'] || new Date().toISOString()) as string,
      updatedAt: (n8nData['updatedAt'] || new Date().toISOString()) as string,
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
      participants: (n8nData['attendees'] || []) as Participant[],
      actionItems: (n8nData['actionItems'] || []) as ActionItem[],
      notes: [],
      attachments: [],
      details: (n8nData['keyDecisions'] || n8nData['nextSteps'] || n8nData['description'] || 'n8n meeting details') as string,
      durationInMinutes: (n8nData['duration'] || 60) as number,
      upcoming: false,
      inProgress: false,
      subject: (n8nData['title'] || n8nData['meetingType'] || 'n8n Meeting') as string,
      type: (n8nData['meetingType'] || 'other') as string
    } as unknown as Meeting & { source: 'n8n' };
    this.loading = false;
  }

  handleN8nDataNotFound() {
    console.error('❌ Meeting not found in n8n data');
    this.error = `Meeting with ID ${this.meetingId} was not found in n8n. It may have been deleted or the ID may be incorrect.`;
    this.loading = false;
  }

  handleN8nApiError(error: unknown) {
    console.error('❌ n8n API completely unavailable:', error);
    
    const httpError = error as {status?: number};
    
    if (httpError.status === 0) {
      this.error = 'Unable to connect to n8n. Please check your internet connection and try again.';
    } else if (httpError.status && httpError.status >= 500) {
      this.error = 'n8n server error. Please try again later.';
    } else {
      this.error = `Failed to load meeting from n8n (${httpError.status || 'unknown'}). The meeting data may be temporarily unavailable.`;
    }
    this.loading = false;
  }

  handleError(error: unknown) {
    const httpError = error as {status?: number};
    
    if (httpError.status === 0) {
      this.error = 'Unable to connect to server. Please check your internet connection.';
    } else if (httpError.status === 404) {
      this.error = `Meeting with ID ${this.meetingId} not found.`;
    } else if (httpError.status && httpError.status >= 500) {
      this.error = 'Server error. Please try again later.';
    } else {
      this.error = `Failed to load meeting details (${httpError.status || 'unknown'})`;
    }
    this.loading = false;
  }

  retryLoad() {
    this.loadMeeting();
  }

  editMeeting(event?: Event) {
    // Toggle edit mode instead of navigating away
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.isEditing = !this.isEditing;
    console.log('Edit mode toggled:', this.isEditing);
  }

  uploadDocuments() {
    const dialogRef = this.dialog.open(DocumentUploadDialogComponent, {
      width: '600px',
      maxHeight: '90vh',
      data: {
        meetingId: this.meeting?.id,
        preselectedMeeting: this.meeting ? {
          id: this.meeting.id,
          subject: this.meeting.title || this.meeting.subject || 'Meeting',
          date: this.meeting.startTime
        } : undefined
      }
    });

    dialogRef.afterClosed().subscribe((result: unknown) => {
      if (result) {
        console.log('Document uploaded successfully for meeting:', this.meeting?.id, result);
        // Could refresh meeting details or show success message
        // You might want to add the uploaded document to the meeting's attachments list
        if (this.meeting) {
          if (!this.meeting.attachments) {
            this.meeting.attachments = [];
          }
          this.meeting.attachments.push(result as {name: string; url: string});
        }
      }
    });
  }

  addParticipant() {
    // Add participant functionality - opens modal/form
    console.log('Add participant functionality - will open modal/form');
    // For now, show a simple prompt
    const name = prompt('Enter participant name:');
    const email = prompt('Enter participant email:');
    
    if (name && email && this.meeting) {
      if (!this.meeting.participants) {
        this.meeting.participants = [];
      }
      
      const newParticipant = {
        id: Date.now(), // Temporary ID
        email: email,
        name: name,
        participantRole: 'Attendee',
        invitationStatus: 'pending',
        attendanceStatus: 'pending',
        isRequired: false,
        canEdit: false,
        canInviteOthers: false,
        attendanceDurationMinutes: 0,
        invitedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        internal: true,
        external: false,
        organizer: false,
        presenter: false,
        attended: false,
        participantType: 'OTHER' as const
      };
      
      this.meeting.participants.push(newParticipant);
      console.log('Added participant:', newParticipant);
    }
  }

  removeParticipant(participant: Participant) {
    if (this.meeting && this.meeting.participants) {
      const index = this.meeting.participants.indexOf(participant);
      if (index > -1) {
        this.meeting.participants.splice(index, 1);
        console.log('Removed participant:', participant);
      }
    }
  }

  addActionItem() {
    // Add action item functionality - opens modal/form
    console.log('Add action item functionality - will open modal/form');
    // For now, show a simple prompt
    const title = prompt('Enter action item title:');
    const assignee = prompt('Enter assignee name:');
    
    if (title && this.meeting) {
      if (!this.meeting.actionItems) {
        this.meeting.actionItems = [];
      }
      
      const newActionItem = {
        id: Date.now(), // Temporary ID
        title: title,
        description: title,
        status: 'pending',
        priority: 'medium',
        type: 'task',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        completed: false,
        isRecurring: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        organization: this.meeting.organization,
        subTasks: [],
        overdue: false,
        progressPercentage: 0,
        assignedTo: assignee || undefined
      };
      
      this.meeting.actionItems.push(newActionItem);
      console.log('Added action item:', newActionItem);
    }
  }

  removeActionItem(actionItem: ActionItem) {
    if (this.meeting && this.meeting.actionItems) {
      const index = this.meeting.actionItems.indexOf(actionItem);
      if (index > -1) {
        this.meeting.actionItems.splice(index, 1);
        console.log('Removed action item:', actionItem);
      }
    }
  }

  async editParticipant(participant: Participant) {
    try {
      const result = await this.modalService.openModal({
        title: 'Edit Participant',
        component: ParticipantEditModalComponent,
        data: { 
          participant: participant,
          onSave: (updatedParticipant: Participant) => this.updateParticipant(updatedParticipant)
        },
        width: '500px'
      });

      if (result.action === 'save' && result.data) {
        this.updateParticipant(result.data.participant);
      }
    } catch (error) {
      console.error('Error opening participant edit modal:', error);
    }
  }

  updateParticipant(updatedParticipant: Participant) {
    if (this.meeting && this.meeting.participants) {
      const index = this.meeting.participants.findIndex(p => p.id === updatedParticipant.id);
      if (index > -1) {
        this.meeting.participants[index] = updatedParticipant;
        console.log('Updated participant:', updatedParticipant);
      }
    }
  }

  async editMeetingField(field: 'description' | 'summary' | 'nextSteps') {
    try {
      const result = await this.modalService.openModal({
        title: `Edit ${this.getFieldDisplayName(field)}`,
        component: MeetingEditModalComponent,
        data: { 
          meeting: this.meeting,
          field: field,
          onSave: (fieldName: string, value: string) => this.updateMeetingField(fieldName, value)
        },
        width: '600px'
      });

      if (result.action === 'save' && result.data?.field && result.data?.meeting) {
        const fieldValue = (result.data.meeting as unknown as Record<string, unknown>)[result.data.field] as string;
        this.updateMeetingField(result.data.field, fieldValue);
      }
    } catch (error) {
      console.error('Error opening meeting edit modal:', error);
    }
  }

  updateMeetingField(field: string, value: string) {
    if (this.meeting) {
      (this.meeting as unknown as Record<string, unknown>)[field] = value;
      this.meeting.updatedAt = new Date().toISOString();
      console.log(`Updated meeting ${field}:`, value);
    }
  }

  getFieldDisplayName(field: string): string {
    switch (field) {
      case 'description': return 'Description';
      case 'summary': return 'Meeting Summary';
      case 'nextSteps': return 'Next Steps';
      default: return 'Field';
    }
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
