import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Meeting, FilterConfig, Participant, ActionItem } from '../meetings/meeting.model';
import { MatDialog } from '@angular/material/dialog';

import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';

// Import document-related components
import { DocumentUploadDialogComponent } from '../shared/document-upload-dialog/document-upload-dialog.component';
import { DocumentService } from '../services/document.service';

@Component({
  selector: 'app-home-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    ButtonModule,
    DatePipe
  ],
  templateUrl: './home-screen.component.html',
  styleUrls: ['./home-screen.component.scss']
})
export class HomeScreenComponent implements OnInit {
  @Input() meetings: Meeting[] = [];
  @Input() searchQuery = '';
  @Input() filterConfig!: FilterConfig;
  @Output() viewAllMeetings = new EventEmitter<void>();
  @Output() meetingSelect = new EventEmitter<Meeting>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<FilterConfig>();

  showFilters = false;
  expandedMeeting: string | null = null;
  localFilterConfig!: FilterConfig;

  constructor(
    private dialog: MatDialog,
    private documentService: DocumentService
  ) {}

  ngOnInit() {
    this.localFilterConfig = { ...this.filterConfig };
  }

  formatMeetingType(type: string): string {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  getMeetingTypeColor(type: string): string {
    if (type.startsWith('external')) return 'bg-blue-100 text-blue-800';
    if (type.startsWith('internal')) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  }

  get justCompletedMeeting(): Meeting | undefined {
    return this.meetings.find(m => m.isJustCompleted);
  }

  applyFilters(meetingList: Meeting[]): Meeting[] {
    const query = this.searchQuery.toLowerCase().trim();
    return meetingList.filter((meeting: Meeting) => {
      // Search query filter - only apply if there's actually a search query
      if (query) {
        const matchesSearch = (
          (meeting.title && meeting.title.toLowerCase().includes(query)) ||
          (meeting.subject && meeting.subject.toLowerCase().includes(query)) ||
          (meeting.summary && meeting.summary.toLowerCase().includes(query)) ||
          (meeting.description && meeting.description.toLowerCase().includes(query)) ||
          meeting.participants.some((p: Participant) => 
            p.name.toLowerCase().includes(query) || 
            (p.email && p.email.toLowerCase().includes(query))
          ) ||
          meeting.actionItems.some((ai: ActionItem) => 
            ai.description.toLowerCase().includes(query) || 
            (ai.title && ai.title.toLowerCase().includes(query)) ||
            (ai.assignee?.firstName && ai.assignee.firstName.toLowerCase().includes(query)) ||
            (ai.assignedTo && ai.assignedTo.toLowerCase().includes(query))
          ) ||
          (meeting.nextSteps && meeting.nextSteps.toLowerCase().includes(query)) ||
          (meeting.details && meeting.details.toLowerCase().includes(query)) ||
          this.formatMeetingType(meeting.meetingType || meeting.type).toLowerCase().includes(query)
        );
        if (!matchesSearch) return false;
      }
      // Date range filter
      if (this.localFilterConfig.dateRange?.start && this.localFilterConfig.dateRange?.end) {
        const meetingDate = new Date(meeting.startTime);
        const startDate = new Date(this.localFilterConfig.dateRange.start ?? '');
        const endDate = new Date(this.localFilterConfig.dateRange.end ?? '');
        if (meetingDate < startDate || meetingDate > endDate) return false;
      }
      // Meeting type filter
      if ((this.localFilterConfig.meetingType ?? []).length > 0) {
        if (!(this.localFilterConfig.meetingType ?? []).includes(meeting.meetingType)) return false;
      }
      // Participants filter
      if ((this.localFilterConfig.participants ?? []).length > 0) {
        const hasParticipant = (this.localFilterConfig.participants ?? []).some((participantName: string) =>
          meeting.participants.some((p: Participant) => p.name.toLowerCase().includes(participantName.toLowerCase()))
        );
        if (!hasParticipant) return false;
      }
      // Action items filter
      if (this.localFilterConfig.hasActionItems === true && meeting.actionItems.length === 0) {
        return false;
      }
      // Recording filter
      if (this.localFilterConfig.hasRecording === true && !meeting.recordingUrl) {
        return false;
      }
      return true;
    });
  }

  get filteredMeetings(): Meeting[] {
    return this.applyFilters(this.meetings);
  }

  get recentMeetings(): Meeting[] {
    // Only show recent meetings when no search is active
    if (!this.searchQuery.trim() && !this.hasActiveFilters()) {
      return this.meetings
        .filter(m => !m.isJustCompleted)
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .slice(0, 5);
    }
    return [];
  }

  get searchResultMeetings(): Meeting[] {
    // Only return filtered meetings if there's an actual search query or active filters
    if (this.searchQuery.trim() || this.hasActiveFilters()) {
      return this.filteredMeetings.filter(m => !m.isJustCompleted);
    }
    return [];
  }

  hasActiveFilters(): boolean {
    return !!(
      (this.localFilterConfig?.dateRange?.start || this.localFilterConfig?.dateRange?.end) ||
      (this.localFilterConfig?.meetingType && this.localFilterConfig.meetingType.length > 0) ||
      (this.localFilterConfig?.participants && this.localFilterConfig.participants.length > 0) ||
      this.localFilterConfig?.hasActionItems ||
      this.localFilterConfig?.hasRecording
    );
  }

  handleFilterChange(key: keyof FilterConfig, value: any) {
    // Avoid object spread in template, do it here
    const dateRange = {
      start: this.localFilterConfig.dateRange?.start ?? '',
      end: this.localFilterConfig.dateRange?.end ?? ''
    };
    const newConfig: FilterConfig = {
      dateRange,
      meetingType: [...(this.localFilterConfig.meetingType ?? [])],
      participants: [...(this.localFilterConfig.participants ?? [])],
      hasActionItems: this.localFilterConfig.hasActionItems,
      hasRecording: this.localFilterConfig.hasRecording
    };
    if (key === 'dateRange') {
      newConfig.dateRange = {
        start: value.start ?? '',
        end: value.end ?? ''
      };
    } else {
      (newConfig as any)[key] = value;
    }
    this.localFilterConfig = newConfig;
    this.filterChange.emit(newConfig);
  }

  setDateRangeStart(start: string) {
    const dateRange = { ...this.localFilterConfig.dateRange, start };
    this.handleFilterChange('dateRange', dateRange);
  }

  setDateRangeEnd(end: string) {
    const dateRange = { ...this.localFilterConfig.dateRange, end };
    this.handleFilterChange('dateRange', dateRange);
  }

  get nonJustCompletedMeetings(): Meeting[] {
    return this.searchResultMeetings;
  }

  clearFilters() {
    const emptyConfig: FilterConfig = {
      dateRange: { start: '', end: '' },
      meetingType: [],
      participants: [],
      hasActionItems: false,
      hasRecording: false
    };
    this.localFilterConfig = emptyConfig;
    this.filterChange.emit(emptyConfig);
    this.searchChange.emit('');
  }

  getAllParticipants(): string[] {
    const participants = new Set<string>();
    this.meetings.forEach((meeting: Meeting) => {
      meeting.participants.forEach((p: Participant) => participants.add(p.name));
    });
    return Array.from(participants).sort();
  }

  getAllMeetingTypes(): string[] {
    const types = new Set(this.meetings.map(m => m.meetingType));
    return Array.from(types).sort();
  }

  onSearchInput(value: string) {
    this.searchChange.emit(value);
  }

  onMeetingClick(meeting: Meeting) {
    this.meetingSelect.emit(meeting);
  }

  onViewAllMeetingsClick() {
    this.viewAllMeetings.emit();
  }

  // Document upload functionality
  onUploadDocument() {
    const dialogRef = this.dialog.open(DocumentUploadDialogComponent, {
      width: '600px',
      maxHeight: '90vh',
      data: {
        meetingId: null // For general document upload not tied to a specific meeting
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Document uploaded successfully:', result);
        // Could refresh document list or show success message
      }
    });
  }

  // Create meeting functionality
  onCreateMeeting() {
    // For now, just show an alert - this would navigate to create meeting form
    alert('Create Meeting feature - this would navigate to the meeting creation form.');
  }
}
