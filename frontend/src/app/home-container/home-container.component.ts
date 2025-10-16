import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HomeScreenComponent } from '../home-screen/home-screen.component';
import { MeetingService } from '../meetings/meeting.service';
import { Meeting, FilterConfig } from '../meetings/meeting.model';
import { Subject, takeUntil } from 'rxjs';

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
export class HomeContainerComponent implements OnDestroy {
  meetings: Meeting[] = [];
  searchQuery = '';
  filterConfig: FilterConfig = {
    dateRange: { start: '', end: '' },
    meetingType: [],
    participants: [],
    hasActionItems: false,
    hasRecording: false
  };

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly meetingService: MeetingService,
    private readonly router: Router
  ) {
    this.loadMeetings();
    
    // Subscribe to meeting updates
    this.meetingService.meetingsUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((updated) => {
        if (updated) {
          console.log('Meetings updated, refreshing list...');
          this.loadMeetings();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMeetings() {
    console.log('🔄 HomeContainer: Loading meetings...');
    this.meetingService.getMeetings().subscribe({
      next: data => {
        console.log('✅ HomeContainer: Received meetings from service:', data.length);
        console.log('📋 First meeting:', data[0]);
        this.meetings = data;
      },
      error: err => {
        console.error('❌ HomeContainer: Error loading meetings:', err);
      }
    });
  }

  onViewAllMeetings() {
    this.router.navigate(['/meetings/previous']);
  }

  onMeetingSelect(meeting: Meeting) {
    this.router.navigate(['/meetings', meeting.id]);
  }

  onSearchChange(query: string) {
    this.searchQuery = query;
  }

  onFilterChange(config: FilterConfig) {
    this.filterConfig = config;
  }
}
