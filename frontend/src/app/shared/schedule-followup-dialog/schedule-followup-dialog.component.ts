import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Meeting } from '../../meetings/meeting.model';
import { MeetingService } from '../../meetings/meeting.service';
import { CalendarService } from '../../services/calendar.service';
import { ParticipantRole } from '../../models/meeting-participant.model';

export interface FollowUpDialogData {
  meeting: Meeting;
}

export interface FollowUpMeeting {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  participants: string[];
  location?: string;
}

@Component({
  selector: 'app-schedule-followup-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title class="flex items-center">
      <mat-icon class="mr-2 text-blue-600">event</mat-icon>
      Schedule Follow-up Meeting
    </h2>

    <mat-dialog-content class="py-4">
      <div class="space-y-4">
        <!-- Original Meeting Info -->
        <div class="bg-blue-50 p-3 rounded-lg mb-4">
          <p class="text-sm font-semibold text-blue-900 mb-1">Follow-up for:</p>
          <p class="text-sm text-blue-700">{{ data.meeting.title }}</p>
        </div>

        <!-- Meeting Title -->
        <mat-form-field class="w-full" appearance="outline">
          <mat-label>Meeting Title</mat-label>
          <input matInput [(ngModel)]="followUpMeeting.title" required>
        </mat-form-field>

        <!-- Meeting Description -->
        <mat-form-field class="w-full" appearance="outline">
          <mat-label>Description</mat-label>
          <textarea matInput
                    [(ngModel)]="followUpMeeting.description"
                    rows="3"
                    placeholder="What will be discussed in this follow-up?"></textarea>
        </mat-form-field>

        <!-- Date and Time -->
        <div class="grid grid-cols-2 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Start Date & Time</mat-label>
            <input matInput
                   type="datetime-local"
                   [(ngModel)]="followUpMeeting.startTime"
                   required>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>End Date & Time</mat-label>
            <input matInput
                   type="datetime-local"
                   [(ngModel)]="followUpMeeting.endTime"
                   required>
          </mat-form-field>
        </div>

        <!-- Location -->
        <mat-form-field class="w-full" appearance="outline">
          <mat-label>Location (Optional)</mat-label>
          <input matInput [(ngModel)]="followUpMeeting.location" placeholder="Meeting room or online link">
        </mat-form-field>

        <!-- Participants -->
        <mat-form-field class="w-full" appearance="outline">
          <mat-label>Participants</mat-label>
          <textarea matInput
                    [(ngModel)]="participantsText"
                    rows="2"
                    placeholder="Enter email addresses separated by commas"></textarea>
          <mat-hint>Email addresses separated by commas</mat-hint>
        </mat-form-field>

        <!-- Calendar Integration Status -->
        <div *ngIf="calendarConnected" class="bg-green-50 p-3 rounded-lg flex items-center">
          <mat-icon class="text-green-600 mr-2">check_circle</mat-icon>
          <span class="text-sm text-green-800">Outlook Calendar connected - meeting will be created in your calendar</span>
        </div>

        <div *ngIf="!calendarConnected" class="bg-amber-50 p-3 rounded-lg">
          <div class="flex items-start">
            <mat-icon class="text-amber-600 mr-2 mt-0.5">warning</mat-icon>
            <div class="flex-1">
              <p class="text-sm text-amber-800 mb-2">Outlook Calendar not connected</p>
              <button mat-stroked-button
                      color="primary"
                      (click)="connectCalendar()"
                      class="text-xs">
                Connect to Outlook
              </button>
            </div>
          </div>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="pb-4">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button
              color="primary"
              (click)="onSchedule()"
              [disabled]="!isValid() || isScheduling">
        <mat-icon *ngIf="isScheduling" class="mr-1 animate-spin">refresh</mat-icon>
        {{ isScheduling ? 'Scheduling...' : 'Schedule Meeting' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 500px;
      max-width: 600px;
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class ScheduleFollowupDialogComponent implements OnInit {
  followUpMeeting: FollowUpMeeting = {
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    participants: []
  };

  participantsText = '';
  calendarConnected = false;
  isScheduling = false;

  constructor(
    public dialogRef: MatDialogRef<ScheduleFollowupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FollowUpDialogData,
    private meetingService: MeetingService,
    private calendarService: CalendarService
  ) {}

  ngOnInit(): void {
    // Pre-populate with follow-up data
    this.followUpMeeting.title = `Follow-up: ${this.data.meeting.title}`;
    this.followUpMeeting.description = `Follow-up meeting for: ${this.data.meeting.title}\n\nTopics to discuss:\n- Review action items from previous meeting\n- Address any outstanding issues\n- Plan next steps`;

    // Set default time (1 week from now, same time)
    const originalStart = new Date(this.data.meeting.startTime);
    const followUpStart = new Date(originalStart);
    followUpStart.setDate(followUpStart.getDate() + 7); // 1 week later

    const followUpEnd = new Date(followUpStart);
    followUpEnd.setHours(followUpEnd.getHours() + 1); // 1 hour duration

    this.followUpMeeting.startTime = this.formatDateTimeLocal(followUpStart);
    this.followUpMeeting.endTime = this.formatDateTimeLocal(followUpEnd);

    // Pre-populate participants from original meeting
    if (this.data.meeting.participants) {
      const emails = this.data.meeting.participants
        .map(p => p.email)
        .filter(email => email)
        .join(', ');
      this.participantsText = emails;
    }

    // Check calendar connection status
    this.checkCalendarStatus();
  }

  /**
   * Format Date object to datetime-local input format
   */
  private formatDateTimeLocal(date: Date): string {
    return date.toISOString().slice(0, 16);
  }

  /**
   * Check if Outlook Calendar is connected
   */
  private checkCalendarStatus(): void {
    this.calendarService.getCalendarStatus().subscribe({
      next: (status) => {
        this.calendarConnected = status.isConnected && !status.isExpired;
      },
      error: (error) => {
        console.error('Error checking calendar status:', error);
        this.calendarConnected = false;
      }
    });
  }

  /**
   * Connect to Outlook Calendar
   */
  async connectCalendar(): Promise<void> {
    try {
      await this.calendarService.connectCalendar();
      // Recheck status after connection attempt
      setTimeout(() => this.checkCalendarStatus(), 2000);
    } catch (error) {
      console.error('Error connecting calendar:', error);
    }
  }

  /**
   * Validate form data
   */
  isValid(): boolean {
    return !!(
      this.followUpMeeting.title &&
      this.followUpMeeting.startTime &&
      this.followUpMeeting.endTime &&
      this.participantsText
    );
  }

  /**
   * Schedule the follow-up meeting
   */
  onSchedule(): void {
    if (!this.isValid()) return;

    this.isScheduling = true;

    // Parse participants
    this.followUpMeeting.participants = this.participantsText
      .split(',')
      .map(email => email.trim())
      .filter(email => email);

    // Create the meeting
    const newMeeting: Partial<Meeting> = {
      title: this.followUpMeeting.title,
      description: this.followUpMeeting.description,
      startTime: this.followUpMeeting.startTime,
      endTime: this.followUpMeeting.endTime,
      location: this.followUpMeeting.location,
      type: this.data.meeting.type || 'TEAM_MEETING',
      priority: 'MEDIUM',
      status: 'SCHEDULED',
      organizer: this.data.meeting.organizer,
      participants: this.followUpMeeting.participants.map(email => ({
        email,
        name: email.split('@')[0],
        role: ParticipantRole.ATTENDEE
      }))
      // Link to original meeting would go here if we had a parentMeetingId field
    };

    // Create meeting in database
    this.meetingService.createMeeting(newMeeting as Meeting).subscribe({
      next: (createdMeeting) => {
        console.log('Follow-up meeting created:', createdMeeting);

        // If calendar is connected, also create in Outlook
        if (this.calendarConnected) {
          this.createOutlookEvent(createdMeeting);
        } else {
          this.isScheduling = false;
          this.dialogRef.close({ success: true, meeting: createdMeeting });
        }
      },
      error: (error) => {
        console.error('Error creating follow-up meeting:', error);
        this.isScheduling = false;
        alert('Error creating follow-up meeting. Please try again.');
      }
    });
  }

  /**
   * Create event in Outlook Calendar via Microsoft Graph
   */
  private createOutlookEvent(meeting: Meeting): void {
    // Call backend endpoint to create Outlook event
    this.meetingService.createOutlookEvent(meeting).subscribe({
      next: (response) => {
        console.log('Outlook event created:', response);
        this.isScheduling = false;
        this.dialogRef.close({
          success: true,
          meeting: meeting,
          outlookEvent: response
        });
      },
      error: (error) => {
        console.error('Error creating Outlook event:', error);
        this.isScheduling = false;
        // Still close dialog with success since DB meeting was created
        this.dialogRef.close({
          success: true,
          meeting: meeting,
          outlookError: true
        });
      }
    });
  }

  /**
   * Cancel and close dialog
   */
  onCancel(): void {
    this.dialogRef.close({ success: false });
  }
}
