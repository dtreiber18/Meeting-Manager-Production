import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MeetingService } from '../meeting.service';
import { Meeting } from '../meeting.model';

@Component({
  selector: 'app-meeting-form',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    HttpClientModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './meeting-form.component.html',
  styleUrl: './meeting-form.component.scss'
})
export class MeetingFormComponent {
  meeting: Partial<Meeting> = {
    title: '',
    description: '',
    type: 'TEAM_MEETING',
    priority: 'MEDIUM',
    status: 'SCHEDULED',
    isRecurring: false,
    isPublic: false,
    requiresApproval: false,
    allowRecording: true,
    autoTranscription: false,
    aiAnalysisEnabled: false
  };
  isEdit = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private meetingService: MeetingService
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.meetingService.getMeeting(id).subscribe(data => this.meeting = data);
    } else {
      // Set default times for new meetings
      const now = new Date();
      const startTime = new Date(now);
      startTime.setHours(now.getHours() + 1, 0, 0, 0); // Next hour
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1); // One hour duration

      this.meeting.startTime = startTime.toISOString().slice(0, 16);
      this.meeting.endTime = endTime.toISOString().slice(0, 16);
    }
  }

  save() {
    console.log('Saving meeting:', this.meeting);
    
    if (this.isEdit && this.meeting.id) {
      this.meetingService.updateMeeting(this.meeting.id, this.meeting as Meeting).subscribe({
        next: (result) => {
          console.log('Meeting updated successfully:', result);
          this.router.navigate(['/meetings', this.meeting.id]);
        },
        error: (error) => {
          console.error('Error updating meeting:', error);
          alert('Failed to update meeting. Please check the console for details.');
        }
      });
    } else {
      this.meetingService.createMeeting(this.meeting as Meeting).subscribe({
        next: (created) => {
          console.log('Meeting created successfully:', created);
          // Navigate back to dashboard after successful creation
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Error creating meeting:', error);
          alert('Failed to create meeting. Please check the console for details.');
        }
      });
    }
  }
}
