

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ButtonModule } from 'primeng/button';
import { HomeScreenComponent } from './home-screen/home-screen.component';
import { MeetingService } from './meetings/meeting.service';
import { Meeting, FilterConfig } from './meetings/meeting.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ButtonModule,
    HomeScreenComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Meeting Manager - Enterprise Application';

  meetings: Meeting[] = [];
  searchQuery = '';
  filterConfig: FilterConfig = {
    dateRange: { start: '', end: '' },
    meetingType: [],
    participants: [],
    hasActionItems: false,
    hasRecording: false
  };

  constructor(private meetingService: MeetingService) {
    this.loadMeetings();
  }

  loadMeetings() {
    this.meetingService.getMeetings().subscribe({
      next: data => {
        this.meetings = data;
      },
      error: err => {
        // handle error if needed
      }
    });
  }

  onViewAllMeetings() {
    // Navigate to meetings list or handle as needed
    // Example: this.router.navigate(['/meetings']);
  }

  onMeetingSelect(meeting: Meeting) {
    // Navigate to meeting details or handle as needed
    // Example: this.router.navigate(['/meetings', meeting.id]);
  }

  onSearchChange(query: string) {
    this.searchQuery = query;
  }

  onFilterChange(config: FilterConfig) {
    this.filterConfig = config;
  }
}
