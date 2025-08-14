import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
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
  meeting?: Meeting;
  loading = true;
  error: string | null = null;
  meetingId: string | null = null;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private meetingService: MeetingService
  ) {}

  ngOnInit() {
    this.meetingId = this.route.snapshot.paramMap.get('id');
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
    
    this.meetingService.getMeeting(this.meetingId).subscribe({
      next: (data) => {
        this.meeting = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching meeting:', error);
        
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
    });
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
