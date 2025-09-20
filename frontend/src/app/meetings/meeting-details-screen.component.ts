import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Meeting, ActionItem, Participant } from './meeting.model';
import { PendingAction, PendingActionService } from '../services/pending-action.service';
import { AiChatComponent } from '../ai-chat/ai-chat.component';
import { MeetingIntelligencePanelComponent } from '../ai-chat/meeting-intelligence-panel.component';
import { ActionItemSuggestion } from '../services/meeting-ai-assistant.service';

type ParticipantType = 'CLIENT' | 'G37' | 'OTHER';

@Component({
  selector: 'app-meeting-details-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, DragDropModule, AiChatComponent, MeetingIntelligencePanelComponent],
  templateUrl: './meeting-details-screen.component.html',
  styleUrls: ['./meeting-details-screen.component.scss']
})
export class MeetingDetailsScreenComponent implements OnInit {
  @Input() meeting!: Meeting;
  @Output() back = new EventEmitter<void>();
  @Output() meetingUpdate = new EventEmitter<Meeting>();

  isEditing = false; // Global edit mode
  isEditingOverview = false;
  isEditingActionItems = false;
  isAddingParticipant = false;
  
  // Pending Actions properties
  showPendingActions = true;
  isAddingPendingAction = false;
  pendingActions: PendingAction[] = [];
  canManageApprovals = true; // This should be set based on user role
  
  // Enhanced Participant Management Properties
  showClassificationView = true;
  showParticipantFilters = false;
  participantFilter = {
    type: '',
    attendance: '',
    role: '',
    search: ''
  };
  filteredParticipants: Participant[] = [];
  
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
    participantType: 'OTHER',
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

  newPendingAction: Partial<PendingAction> = {
    title: '',
    description: '',
    actionType: 'TASK',
    priority: 'MEDIUM',
    approvalRequired: true,
    dueDate: undefined,
    estimatedHours: undefined
  };

  constructor(private readonly pendingActionService: PendingActionService) {}

  ngOnInit(): void {
    this.editedMeeting = { ...this.meeting };
    this.loadPendingActions();
    this.applyParticipantFilters(); // Initialize participant filters
  }

  /**
   * Load pending actions for the current meeting
   */
  loadPendingActions(): void {
    if (this.meeting?.id) {
      this.pendingActionService.getPendingActionsByMeeting(this.meeting.id).subscribe({
        next: (actions) => {
          this.pendingActions = actions;
        },
        error: (error) => {
          console.error('Error loading pending actions:', error);
          this.pendingActions = [];
        }
      });
    }
  }

  /**
   * Toggle pending actions view
   */
  togglePendingActionsView(): void {
    this.showPendingActions = !this.showPendingActions;
  }

  /**
   * Handle adding a new pending action
   */
  handleAddPendingAction(): void {
    if (!this.newPendingAction.title?.trim() || !this.newPendingAction.description?.trim()) {
      return;
    }

    const title = this.newPendingAction.title.trim();
    const description = this.newPendingAction.description.trim();

    const pendingAction: Omit<PendingAction, 'id'> = {
      meetingId: this.meeting.id,
      title,
      description,
      actionType: this.newPendingAction.actionType || 'TASK',
      status: this.newPendingAction.approvalRequired ? 'PENDING_APPROVAL' : 'NEW',
      priority: this.newPendingAction.priority || 'MEDIUM',
      approvalRequired: this.newPendingAction.approvalRequired || false,
      dueDate: this.newPendingAction.dueDate,
      estimatedHours: this.newPendingAction.estimatedHours,
      organizationId: this.meeting.organization?.id,
      reporterId: 1, // Should be current user ID
      reporterName: 'Current User', // Should be current user name
      reporterEmail: 'user@example.com' // Should be current user email
    };

    this.pendingActionService.createPendingAction(pendingAction).subscribe({
      next: (createdAction) => {
        this.pendingActions.push(createdAction);
        this.resetNewPendingAction();
        this.isAddingPendingAction = false;
      },
      error: (error) => {
        console.error('Error creating pending action:', error);
      }
    });
  }

  /**
   * Cancel adding pending action
   */
  cancelAddPendingAction(): void {
    this.resetNewPendingAction();
    this.isAddingPendingAction = false;
  }

  /**
   * Reset new pending action form
   */
  resetNewPendingAction(): void {
    this.newPendingAction = {
      title: '',
      description: '',
      actionType: 'TASK',
      priority: 'MEDIUM',
      approvalRequired: true,
      dueDate: undefined,
      estimatedHours: undefined
    };
  }

  /**
   * Approve a pending action
   */
  approvePendingAction(pendingAction: PendingAction): void {
    if (!pendingAction.id) return;

    const approvalNotes = prompt('Enter approval notes (optional):');
    if (approvalNotes === null) return; // User cancelled

    this.pendingActionService.approvePendingAction(
      pendingAction.id, 
      1, // Should be current user ID
      approvalNotes || undefined
    ).subscribe({
      next: (updatedAction) => {
        const index = this.pendingActions.findIndex(a => a.id === updatedAction.id);
        if (index !== -1) {
          this.pendingActions[index] = updatedAction;
        }
      },
      error: (error) => {
        console.error('Error approving pending action:', error);
      }
    });
  }

  /**
   * Reject a pending action
   */
  rejectPendingAction(pendingAction: PendingAction): void {
    if (!pendingAction.id) return;

    const rejectionReason = prompt('Enter rejection reason (required):');
    if (!rejectionReason?.trim()) return; // User cancelled or no reason

    this.pendingActionService.rejectPendingAction(
      pendingAction.id, 
      1, // Should be current user ID
      rejectionReason
    ).subscribe({
      next: (updatedAction) => {
        const index = this.pendingActions.findIndex(a => a.id === updatedAction.id);
        if (index !== -1) {
          this.pendingActions[index] = updatedAction;
        }
      },
      error: (error) => {
        console.error('Error rejecting pending action:', error);
      }
    });
  }

  /**
   * Edit a pending action
   */
  editPendingAction(pendingAction: PendingAction): void {
    // Implement edit functionality - could open a modal or inline edit
    console.log('Edit pending action:', pendingAction);
  }

  /**
   * Get pending action border class based on status
   */
  getPendingActionBorderClass(status: PendingAction['status']): string {
    switch (status) {
      case 'NEW': return 'border-blue-200 bg-blue-50';
      case 'PENDING_APPROVAL': return 'border-yellow-200 bg-yellow-50';
      case 'APPROVED': return 'border-green-200 bg-green-50';
      case 'REJECTED': return 'border-red-200 bg-red-50';
      case 'ACTIVE': return 'border-purple-200 bg-purple-50';
      case 'COMPLETE': return 'border-green-300 bg-green-100';
      case 'CANCELLED': return 'border-gray-200 bg-gray-50';
      default: return 'border-gray-200';
    }
  }

  /**
   * Get action type icon
   */
  getActionTypeIcon(actionType: PendingAction['actionType']): string {
    return this.pendingActionService.getActionTypeIcon(actionType);
  }

  /**
   * Get status color class for both action items and pending actions
   */
  getStatusColor(status: string): string {
    // Handle pending action statuses
    if (['NEW', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'ACTIVE', 'COMPLETE', 'CANCELLED'].includes(status)) {
      return this.pendingActionService.getStatusColor(status as PendingAction['status']);
    }
    
    // Handle regular action item statuses
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in-progress': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }

  /**
   * Get priority color class for both action items and pending actions
   */
  getPriorityColor(priority: string): string {
    // Handle pending action priorities
    if (['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) {
      return this.pendingActionService.getPriorityColor(priority as PendingAction['priority']);
    }
    
    // Handle regular action item priorities
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
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
      this.isAddingPendingAction = false;
      this.showParticipantFilters = false;
      // Reset any pending changes
      this.editedMeeting = { ...this.meeting };
      this.loadPendingActions(); // Reload pending actions
      this.applyParticipantFilters(); // Refresh participant filters
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

    const title = this.newActionItem.title.trim();
    const description = this.newActionItem.description.trim();

    const actionItem: ActionItem = {
      id: Date.now(), // Temporary ID for frontend - backend will assign real ID
      title,
      description,
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

    const name = this.newParticipant.name.trim();
    const email = this.newParticipant.email.trim();

    const participant: Participant = {
      id: Date.now(), // Temporary ID for frontend - backend will assign real ID
      name,
      email,
      participantRole: this.newParticipant.participantRole || 'ATTENDEE',
      participantType: this.newParticipant.participantType || 'OTHER',
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
      participantType: 'OTHER',
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
      participantType: 'OTHER',
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

  /**
   * Enhanced Participant Management Methods
   */
  
  /**
   * Toggle participant classification view
   */
  toggleParticipantClassificationView(): void {
    this.showClassificationView = !this.showClassificationView;
  }

  /**
   * Toggle participant filters
   */
  toggleParticipantFilters(): void {
    this.showParticipantFilters = !this.showParticipantFilters;
    if (!this.showParticipantFilters) {
      // Reset filters when hiding
      this.participantFilter = {
        type: '',
        attendance: '',
        role: '',
        search: ''
      };
      this.applyParticipantFilters();
    }
  }

  /**
   * Apply participant filters
   */
  applyParticipantFilters(): void {
    let filtered = [...this.editedMeeting.participants];

    // Apply type filter
    if (this.participantFilter.type) {
      filtered = filtered.filter(p => p.participantType === this.participantFilter.type);
    }

    // Apply attendance filter
    if (this.participantFilter.attendance) {
      switch (this.participantFilter.attendance) {
        case 'attended':
          filtered = filtered.filter(p => p.attended);
          break;
        case 'absent':
          filtered = filtered.filter(p => !p.attended);
          break;
        case 'required':
          filtered = filtered.filter(p => p.isRequired);
          break;
      }
    }

    // Apply role filter
    if (this.participantFilter.role) {
      filtered = filtered.filter(p => p.participantRole === this.participantFilter.role);
    }

    // Apply search filter
    if (this.participantFilter.search) {
      const search = this.participantFilter.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.email.toLowerCase().includes(search) ||
        p.organization?.toLowerCase().includes(search) ||
        p.title?.toLowerCase().includes(search)
      );
    }

    this.filteredParticipants = filtered;
  }

  /**
   * Get participants by type for classification view
   */
  getParticipantsByType(type: ParticipantType): Participant[] {
    const participants = this.filteredParticipants.length > 0 ? this.filteredParticipants : this.editedMeeting.participants;
    return participants.filter(p => (p.participantType || 'OTHER') === type);
  }

  /**
   * Get attendance statistics for a participant type
   */
  getAttendanceStats(type: ParticipantType): { attended: number; absent: number } {
    const participants = this.getParticipantsByType(type);
    return {
      attended: participants.filter(p => p.attended).length,
      absent: participants.filter(p => !p.attended).length
    };
  }

  /**
   * Handle drag and drop for participant reorganization
   */
  onParticipantDrop(event: CdkDragDrop<Participant[]>, targetType: ParticipantType): void {
    if (event.previousContainer === event.container) {
      // Reorder within the same container
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Move between containers (change participant type)
      const participant = event.previousContainer.data[event.previousIndex];
      participant.participantType = targetType;
      
      // Update the participant in the main list
      const participantIndex = this.editedMeeting.participants.findIndex(p => p.id === participant.id);
      if (participantIndex !== -1) {
        this.editedMeeting.participants[participantIndex] = { ...participant };
        this.meetingUpdate.emit(this.editedMeeting);
      }
      
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  /**
   * Toggle participant attendance status
   */
  toggleParticipantAttendance(participant: Participant): void {
    const updatedMeeting = { ...this.editedMeeting };
    updatedMeeting.participants = updatedMeeting.participants.map(p =>
      p.id === participant.id ? { ...p, attended: !p.attended } : p
    );
    this.editedMeeting = updatedMeeting;
    this.meetingUpdate.emit(updatedMeeting);
    
    // Refresh filters if active
    if (this.showParticipantFilters) {
      this.applyParticipantFilters();
    }
  }

  /**
   * Edit participant details
   */
  editParticipant(participant: Participant): void {
    // Implementation stub: Open participant editing modal or inline editing
    console.log('Edit participant:', participant);
    // This functionality would open a modal with detailed participant information
    // including organization, title, contact details, etc.
    // For now, this is a placeholder implementation
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
    return this.editedMeeting.participants.filter(p => p.attended).map(p => p.name).sort((a, b) => a.localeCompare(b));
  }
  get sortedAbsent() {
    return this.editedMeeting.participants.filter(p => !p.attended).map(p => p.name).sort((a, b) => a.localeCompare(b));
  }
  get allParticipants() {
    return this.editedMeeting.participants.map(p => p.name).sort((a, b) => a.localeCompare(b));
  }

  /**
   * Handle AI suggested action item
   */
  handleSuggestedActionItem(suggestion: ActionItemSuggestion): void {
    const newActionItem: ActionItem = {
      id: Date.now(),
      title: suggestion.title,
      description: suggestion.description,
      assignee: undefined,
      dueDate: '',
      priority: suggestion.priority,
      status: 'OPEN',
      type: 'TASK',
      completed: false,
      isRecurring: false,
      estimatedHours: suggestion.estimatedHours,
      notes: `AI Generated: ${suggestion.reasoning}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      organization: {
        id: 1,
        name: 'G37',
        domain: 'g37.com',
        timezone: 'UTC',
        isActive: true,
        maxUsers: 100,
        maxMeetings: 1000,
        subscriptionTier: 'enterprise',
        currentUserCount: 10,
        currentMeetingCount: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      subTasks: [],
      overdue: false,
      progressPercentage: 0
    };

    this.addSuggestedActionItem(newActionItem);
  }

  /**
   * Handle follow-up scheduling
   */
  handleFollowUpScheduled(): void {
    // This would integrate with calendar system
    console.log('Follow-up meeting scheduled for:', this.editedMeeting.title);
    // Here you would call a service to schedule the follow-up
  }

  private addSuggestedActionItem(actionItem: ActionItem): void {
    const updatedMeeting = {
      ...this.editedMeeting,
      actionItems: [...(this.editedMeeting.actionItems || []), actionItem]
    };
    this.editedMeeting = updatedMeeting;
    this.meetingUpdate.emit(updatedMeeting);
  }
}
