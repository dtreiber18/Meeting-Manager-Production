import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { Meeting, FilterConfig } from '../meeting.model';
import { MeetingService } from '../meeting.service';

type ViewMode = 'grid' | 'list';

@Component({
  selector: 'app-previous-meetings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './previous-meetings.component.html',
  styleUrls: ['./previous-meetings.component.scss']
})
export class PreviousMeetingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  
  meetings: Meeting[] = [];
  filteredMeetings: Meeting[] = [];
  searchQuery = '';
  viewMode: ViewMode = 'grid';
  isLoading = false;
  error: string | null = null;
  
  filterConfig: FilterConfig = {
    dateRange: { start: '', end: '' },
    meetingType: [],
    participants: [],
    hasActionItems: false,
    hasRecording: false
  };

  allMeetingTypes: string[] = [];
  allParticipants: string[] = [];

  constructor(
    private meetingService: MeetingService,
    private router: Router
  ) {
    // Setup search debouncing
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.searchQuery = query;
      this.applyFilters();
    });
  }

  ngOnInit(): void {
    this.loadMeetings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMeetings(): void {
    this.isLoading = true;
    this.error = null;
    
    this.meetingService.getMeetings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (meetings) => {
          this.meetings = meetings;
          this.setupFilterOptions();
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading meetings:', error);
          this.error = 'Failed to load meetings. Please try again.';
          this.isLoading = false;
        }
      });
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  onMeetingSelect(meeting: Meeting): void {
    this.router.navigate(['/meetings', meeting.id]);
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
  }

  formatMeetingType(type: string): string {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  getMeetingTypeColor(type: string): string {
    if (type.startsWith('external')) return 'bg-blue-100 text-blue-800';
    if (type.startsWith('internal')) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  }

  formatDate(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  }

  private setupFilterOptions(): void {
    // Extract unique meeting types
    this.allMeetingTypes = [...new Set(this.meetings.map(m => m.type))].sort();
    
    // Extract unique participants
    const participantSet = new Set<string>();
    this.meetings.forEach(meeting => {
      meeting.participants.forEach(p => participantSet.add(p.name));
    });
    this.allParticipants = Array.from(participantSet).sort();
  }

  private applyFilters(): void {
    let filtered = [...this.meetings];

    // Search query filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(meeting => {
        return (
          meeting.subject.toLowerCase().includes(query) ||
          (meeting.summary && meeting.summary.toLowerCase().includes(query)) ||
          (meeting.details && meeting.details.toLowerCase().includes(query)) ||
          meeting.participants.some(p => 
            p.name.toLowerCase().includes(query) || 
            p.email.toLowerCase().includes(query)
          ) ||
          meeting.actionItems.some(ai => 
            ai.description.toLowerCase().includes(query) || 
            ai.assignedTo.toLowerCase().includes(query)
          ) ||
          meeting.nextSteps.some(step => step.toLowerCase().includes(query)) ||
          this.formatMeetingType(meeting.type).toLowerCase().includes(query)
        );
      });
    }

    // Date range filter
    if (this.filterConfig.dateRange?.start && this.filterConfig.dateRange?.end) {
      const startDate = new Date(this.filterConfig.dateRange.start);
      const endDate = new Date(this.filterConfig.dateRange.end);
      filtered = filtered.filter(meeting => {
        const meetingDate = new Date(meeting.date);
        return meetingDate >= startDate && meetingDate <= endDate;
      });
    }

    // Meeting type filter
    if (this.filterConfig.meetingType && this.filterConfig.meetingType.length > 0) {
      filtered = filtered.filter(meeting => 
        this.filterConfig.meetingType!.includes(meeting.type)
      );
    }

    // Participants filter
    if (this.filterConfig.participants && this.filterConfig.participants.length > 0) {
      filtered = filtered.filter(meeting =>
        this.filterConfig.participants!.some(participantName =>
          meeting.participants.some(p => 
            p.name.toLowerCase().includes(participantName.toLowerCase())
          )
        )
      );
    }

    // Action items filter
    if (this.filterConfig.hasActionItems) {
      filtered = filtered.filter(meeting => meeting.actionItems.length > 0);
    }

    // Recording filter
    if (this.filterConfig.hasRecording) {
      filtered = filtered.filter(meeting => meeting.recordingUrl);
    }

    // Sort by date (newest first)
    this.filteredMeetings = filtered.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  onFilterChange(key: keyof FilterConfig, value: any): void {
    this.filterConfig = { ...this.filterConfig, [key]: value };
    this.applyFilters();
  }

  clearFilters(): void {
    this.filterConfig = {
      dateRange: { start: '', end: '' },
      meetingType: [],
      participants: [],
      hasActionItems: false,
      hasRecording: false
    };
    this.searchQuery = '';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchQuery ||
      (this.filterConfig.dateRange?.start || this.filterConfig.dateRange?.end) ||
      (this.filterConfig.meetingType && this.filterConfig.meetingType.length > 0) ||
      (this.filterConfig.participants && this.filterConfig.participants.length > 0) ||
      this.filterConfig.hasActionItems ||
      this.filterConfig.hasRecording
    );
  }

  onMeetingTypeSelectionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedTypes = Array.from(target.selectedOptions, option => option.value);
    this.onFilterChange('meetingType', selectedTypes);
  }

  onParticipantSelectionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedParticipants = Array.from(target.selectedOptions, option => option.value);
    this.onFilterChange('participants', selectedParticipants);
  }

  trackByMeetingId(index: number, meeting: Meeting): string {
    return meeting.id;
  }
}
