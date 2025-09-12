import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Meeting, ActionItem, Participant } from './meeting.model';

@Component({
  selector: 'app-meeting-details-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './meeting-details-screen.component.html',
  styleUrls: ['./meeting-details-screen.component.scss']
})
export class MeetingDetailsScreenComponent {
  @Input() meeting!: Meeting;
  @Output() back = new EventEmitter<void>();
  @Output() meetingUpdate = new EventEmitter<Meeting>();

  isEditing = false; // Global edit mode
  isEditingOverview = false;
  isEditingActionItems = false;
  isAddingParticipant = false;
  editedMeeting!: Meeting;
  newActionItem: Partial<ActionItem> = {
    title: '',
    description: '',
    assignee: undefined,
    dueDate: undefined,
    priority: 'MEDIUM',
    status: 'OPEN',
    type: 'TASK'
  };
  newParticipant: Partial<Participant> = {
    name: '',
    email: '',
    participantRole: 'ATTENDEE',
    invitationStatus: 'PENDING',
    attendanceStatus: 'PENDING',
    isRequired: false,
    canEdit: false,
    canInviteOthers: false,
    organizer: false,
    presenter: false,
    external: true,
    attended: false,
    internal: false
  };

  ngOnInit(): void {
    this.editedMeeting = { ...this.meeting };
  }

  toggleEditMode(): void {
    console.log('toggleEditMode called, current isEditing:', this.isEditing);
    this.isEditing = !this.isEditing;
    console.log('toggleEditMode finished, new isEditing:', this.isEditing);
    if (!this.isEditing) {
      // When exiting edit mode, also exit all sub-edit modes
      this.isEditingOverview = false;
      this.isEditingActionItems = false;
      this.isAddingParticipant = false;
      // Reset any pending changes
      this.editedMeeting = { ...this.meeting };
    }
  }

  handleParticipantToggle(participantName: string): void {
    const updatedMeeting = { ...this.editedMeeting };
    const attended = updatedMeeting.participants.filter(p => p.attended).map(p => p.name);
    const isAttended = attended.includes(participantName);
    updatedMeeting.participants = updatedMeeting.participants.map(p =>
      p.name === participantName ? { ...p, attended: !isAttended } : p
    );
    this.editedMeeting = updatedMeeting;
    this.meetingUpdate.emit(updatedMeeting);
  }

  handleSaveOverview() {
    this.meetingUpdate.emit(this.editedMeeting);
    this.isEditingOverview = false;
  }

  handleCancelOverview() {
    this.editedMeeting = { ...this.meeting };
    this.isEditingOverview = false;
  }

  handleAddActionItem(): void {
    if (!this.newActionItem.title?.trim() || !this.newActionItem.description?.trim()) {
      return;
    }

    const actionItem: ActionItem = {
      id: Date.now(), // Temporary ID for frontend - backend will assign real ID
      title: this.newActionItem.title!,
      description: this.newActionItem.description!,
      assignee: this.newActionItem.assignee,
      dueDate: this.newActionItem.dueDate || '',
      priority: this.newActionItem.priority || 'MEDIUM',
      status: this.newActionItem.status || 'OPEN',
      type: this.newActionItem.type || 'TASK',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completed: false,
      isRecurring: false,
      estimatedHours: 0,
      actualHours: 0,
      tags: '',
      notes: '',
      organization: {
        id: 1,
        name: 'Default Organization',
        domain: 'example.com',
        timezone: 'UTC',
        isActive: true,
        maxUsers: 100,
        maxMeetings: 1000,
        subscriptionTier: 'BASIC',
        currentUserCount: 0,
        currentMeetingCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      subTasks: [],
      overdue: false,
      progressPercentage: 0
    };

    this.editedMeeting = {
      ...this.editedMeeting,
      actionItems: [...(this.editedMeeting.actionItems || []), actionItem]
    };

    // Reset form
    this.newActionItem = {
      title: '',
      description: '',
      assignee: undefined,
      dueDate: undefined,
      priority: 'MEDIUM',
      status: 'OPEN',
      type: 'TASK'
    };

    this.meetingUpdate.emit(this.editedMeeting);
  }

  handleAddParticipant(): void {
    if (!this.newParticipant.name?.trim() || !this.newParticipant.email?.trim()) {
      return;
    }

    const participant: Participant = {
      id: Date.now(), // Temporary ID for frontend - backend will assign real ID
      name: this.newParticipant.name!,
      email: this.newParticipant.email!,
      participantRole: this.newParticipant.participantRole || 'ATTENDEE',
      invitationStatus: 'PENDING',
      attendanceStatus: 'PENDING',
      isRequired: this.newParticipant.isRequired || false,
      canEdit: this.newParticipant.canEdit || false,
      canInviteOthers: this.newParticipant.canInviteOthers || false,
      organizer: false,
      presenter: false,
      external: true,
      attended: false,
      internal: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      invitedAt: new Date().toISOString()
    };

    this.editedMeeting = {
      ...this.editedMeeting,
      participants: [...(this.editedMeeting.participants || []), participant]
    };

    // Reset form
    this.newParticipant = {
      name: '',
      email: '',
      participantRole: 'ATTENDEE',
      invitationStatus: 'PENDING',
      attendanceStatus: 'PENDING',
      isRequired: false,
      canEdit: false,
      canInviteOthers: false,
      organizer: false,
      presenter: false,
      external: true,
      attended: false,
      internal: false
    };

    this.isAddingParticipant = false;
    this.meetingUpdate.emit(this.editedMeeting);
  }

  cancelAddParticipant(): void {
    this.isAddingParticipant = false;
    this.newParticipant = {
      name: '',
      email: '',
      participantRole: 'ATTENDEE',
      invitationStatus: 'PENDING',
      attendanceStatus: 'PENDING',
      isRequired: false,
      canEdit: false,
      canInviteOthers: false,
      organizer: false,
      presenter: false,
      external: true,
      attended: false,
      internal: false
    };
  }

  handleDeleteActionItem(id: number) {
    const updatedMeeting = {
      ...this.editedMeeting,
      actionItems: this.editedMeeting.actionItems?.filter(item => item.id !== id) || []
    };
    this.editedMeeting = updatedMeeting;
    this.meetingUpdate.emit(updatedMeeting);
  }

  handleUpdateActionItem(id: number, updates: Partial<ActionItem>) {
    const updatedMeeting = {
      ...this.editedMeeting,
      actionItems: this.editedMeeting.actionItems?.map(item =>
        item.id === id ? { ...item, ...updates } : item
      ) || []
    };
    this.editedMeeting = updatedMeeting;
    this.meetingUpdate.emit(updatedMeeting);
  }

  get sortedAttended() {
    return this.editedMeeting.participants.filter(p => p.attended).map(p => p.name).sort();
  }
  get sortedAbsent() {
    return this.editedMeeting.participants.filter(p => !p.attended).map(p => p.name).sort();
  }
  get allParticipants() {
    return this.editedMeeting.participants.map(p => p.name).sort();
  }

  getPriorityColor(priority: string) {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }
  getStatusColor(status: string) {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in-progress': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }
}
