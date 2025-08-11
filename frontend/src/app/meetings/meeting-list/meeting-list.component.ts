import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MeetingService } from '../meeting.service';
import { Meeting } from '../meeting.model';

@Component({
  selector: 'app-meeting-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule, MatTableModule, MatButtonModule],
  templateUrl: './meeting-list.component.html',
  styleUrl: './meeting-list.component.scss'
})
export class MeetingListComponent {
  meetings: Meeting[] = [];
  loading = true;
  error = '';
  displayedColumns = ['title', 'date', 'actions'];

  constructor(private meetingService: MeetingService) {
    this.meetingService.getMeetings().subscribe({
      next: data => {
        this.meetings = data;
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to load meetings.';
        this.loading = false;
      }
    });
  }
}
