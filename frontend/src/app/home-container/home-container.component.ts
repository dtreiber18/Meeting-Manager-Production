import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeScreenComponent } from '../home-screen/home-screen.component';
import { MeetingService } from '../meetings/meeting.service';
import { Meeting, FilterConfig } from '../meetings/meeting.model';

@Component({
  selector: 'app-home-container',
  standalone: true,
  imports: [CommonModule, HomeScreenComponent],
  template: `
    <app-home-screen
      [meetings]="meetings"
      [searchQuery]="searchQuery"
      [filterConfig]="filterConfig"
      (viewAllMeetings)="onViewAllMeetings()"
      (meetingSelect)="onMeetingSelect($event)"
      (searchChange)="onSearchChange($event)"
      (filterChange)="onFilterChange($event)"
    ></app-home-screen>
  `
})
export class HomeContainerComponent {
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
    // Optionally navigate or handle event
  }

  onMeetingSelect(meeting: Meeting) {
    // Optionally navigate or handle event
  }

  onSearchChange(query: string) {
    this.searchQuery = query;
  }

  onFilterChange(config: FilterConfig) {
    this.filterConfig = config;
  }
}
