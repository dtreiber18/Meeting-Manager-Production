import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Meeting, ActionItem } from '../meetings/meeting.model';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

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

  isEditingOverview = false;
  isEditingActionItems = false;
  editedMeeting!: Meeting;
  newActionItem: Partial<ActionItem> = {
    description: '',
    assignee: undefined,
    dueDate: undefined,
    priority: 'MEDIUM',
    status: 'OPEN'
  };

  ngOnInit() {
    this.editedMeeting = { ...this.meeting };
  }

  handleParticipantToggle(participantName: string) {
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

  handleAddActionItem() {
    // TODO: Implement action item creation with new model structure
    // This functionality is temporarily disabled until the action item creation UI
    // is updated to match the new backend model
    console.log('Action item creation temporarily disabled');
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
