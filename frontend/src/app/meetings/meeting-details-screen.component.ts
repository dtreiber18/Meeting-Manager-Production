import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Meeting, ActionItem } from './meeting.model';
import { Participant, ParticipantType, ParticipantRole, InvitationStatus, AttendanceStatus } from '../models/meeting-participant.model';
import { MeetingService } from './meeting.service';
import { PendingAction, PendingActionService } from '../services/pending-action.service';

import { MeetingIntelligencePanelComponent } from '../ai-chat/meeting-intelligence-panel.component';
import { ActionItemSuggestion } from '../services/meeting-ai-assistant.service';
import { environment } from '../../environments/environment';
import { ModalService } from '../shared/modal/modal.service';
import { ModalContainerComponent } from '../shared/modal/modal-container/modal-container.component';
import { ToastService } from '../shared/services/toast.service';


interface N8nEventData {
  id?: string;
  title?: string;
  start?: string;
  end?: string;
  description?: string;
  [key: string]: unknown;
}

// Extended types for editing functionality
interface EditablePendingAction extends PendingAction {
  editing?: boolean;
}

interface EditableActionItem extends ActionItem {
  editing?: boolean;
}

interface EditableMeeting extends Meeting {
  actionItems: EditableActionItem[];
}

@Component({
  selector: 'app-meeting-details-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, DragDropModule, MeetingIntelligencePanelComponent, HttpClientModule, ModalContainerComponent],
  templateUrl: './meeting-details-screen.component.html',
  styleUrls: ['./meeting-details-screen.component.scss']
})
export class MeetingDetailsScreenComponent implements OnInit {
  // Make enums available to template
  ParticipantType = ParticipantType;
  ParticipantRole = ParticipantRole;
  InvitationStatus = InvitationStatus;
  AttendanceStatus = AttendanceStatus;

  meeting?: Meeting & { source?: 'mm' | 'n8n' | 'fathom' };
  loading = true;
  error: string | null = null;
  meetingId: string | null = null;
  meetingSource: 'mm' | 'n8n' = 'mm';

  isEditing = false; // Global edit mode
  isEditingOverview = false;
  isEditingActionItems = false;
  isAddingParticipant = false;
  
  // Card collapse/expand state
  cardState = {
    header: { collapsed: true, editing: false },
    participants: { collapsed: true, editing: false },
    overview: { collapsed: true, editing: false },
    recording: { collapsed: true, editing: false },
    pendingActions: { collapsed: true, editing: false },
    actionItems: { collapsed: true, editing: false }
  };
  
  // Pending Actions properties
  showPendingActions = true;
  isAddingPendingAction = false;
  pendingActions: EditablePendingAction[] = [];
  canManageApprovals = true; // This should be set based on user role
  selectedPendingActionIds: string[] = [];
  isSyncingFromN8n = false;
  n8nAvailable = false;
  
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
  
  editingParticipantId: number | null = null;
  editingParticipant: Partial<Participant> = {};
  
  editedMeeting!: EditableMeeting;
  
  newActionItem: Partial<ActionItem> = {
    title: '',
    description: '',
    assignee: undefined,
    dueDate: undefined,
    priority: 'MEDIUM',
    status: 'OPEN',
    type: 'TASK',
    assignedTo: ''
  };
  
  newParticipant: Partial<Participant> = {
    name: '',
    email: '',
    role: ParticipantRole.ATTENDEE,
    type: ParticipantType.OTHER,
    invitationStatus: InvitationStatus.PENDING,
    attendanceStatus: AttendanceStatus.UNKNOWN,
    isRequired: false,
    canEdit: false,
    canInviteOthers: false,
    attended: false
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

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly meetingService: MeetingService,
    private readonly http: HttpClient,
    private readonly modalService: ModalService,
    private readonly dialog: MatDialog,
    private readonly pendingActionService: PendingActionService,
    private readonly toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.meetingId = this.route.snapshot.paramMap.get('id');
    this.meetingSource = (this.route.snapshot.queryParamMap.get('source') as 'mm' | 'n8n') || 'mm';
    
    console.log('🔍 Loading meeting details:', { id: this.meetingId, source: this.meetingSource });
    
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
    
    if (this.meetingSource === 'n8n') {
      this.loadN8nMeeting();
    } else {
      this.loadMeetingManagerMeeting();
    }
  }

  loadMeetingManagerMeeting() {
    if (!this.meetingId) return;
    
    console.log('📞 Fetching Meeting Manager meeting details...');
    this.meetingService.getMeeting(this.meetingId).subscribe({
      next: (data) => {
        console.log('✅ Meeting Manager meeting details:', data);
        this.meeting = { ...data, source: 'mm' };
        this.initializeEditedMeeting();
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error fetching Meeting Manager meeting:', error);
        this.handleError(error);
      }
    });
  }

  loadN8nMeeting() {
    if (!this.meetingId) return;
    
    console.log('📞 Fetching n8n meeting details for ID:', this.meetingId);
    
    // First try to get individual meeting details
    this.http.post<N8nEventData>(environment.n8nWebhookUrl, { 
      action: 'get_event_details', 
      event_id: this.meetingId 
    }).subscribe({
      next: (n8nData) => {
        console.log('✅ n8n meeting details response:', n8nData);
        
        if (n8nData && n8nData !== null && typeof n8nData === 'object') {
          // Successfully got specific meeting details
          this.createN8nMeetingFromData(n8nData);
        } else {
          // API returned null/empty, try to get from list
          console.log('⚠️ n8n returned null, trying to get from list...');
          this.loadN8nMeetingFromList();
        }
      },
      error: (error) => {
        console.error('❌ Error fetching n8n meeting details:', error);
        // Try fallback approach - get from list
        this.loadN8nMeetingFromList();
      }
    });
  }

  loadN8nMeetingFromList() {
    console.log('📞 Fetching n8n meeting from list API...');
    // Get all meetings and find the one we need
    this.http.post<N8nEventData[]>(environment.n8nWebhookUrl, { 
      action: 'get_events'
    }).subscribe({
      next: (response) => {
        console.log('✅ n8n list response for details lookup:', response);
        
        let meetingData = null;
        
        if (response && Array.isArray(response)) {
          // Find the meeting by ID (try multiple ID formats)
          const meetingIdNum = parseInt(this.meetingId || '0');
          meetingData = response.find(meeting => {
            // Check different possible ID fields from the response
            const meetingId = meeting?.id;
            return (
              (typeof meetingId === 'number' && meetingId === meetingIdNum) ||
              (typeof meetingId === 'string' && meetingId === this.meetingId) ||
              (meeting as Record<string, string>)['eventId'] === this.meetingId ||
              (meeting as Record<string, string>)['meetingId'] === this.meetingId
            );
          });
          console.log('🔍 Found meeting in list:', meetingData);
        } else if (response && (response as Record<string, string>)['id'] === this.meetingId) {
          // Single meeting response
          meetingData = response;
        }
        
        if (meetingData) {
          this.createN8nMeetingFromData(meetingData);
        } else {
          // No real data available - show error instead of mock data
          this.handleN8nDataNotFound();
        }
      },
      error: (error) => {
        console.error('❌ Error fetching n8n meeting list:', error);
        this.handleN8nApiError(error);
      }
    });
  }

  createN8nMeetingFromData(n8nData: Record<string, unknown>) {
    console.log('✅ Creating n8n meeting from real data:', n8nData);
    this.meeting = {
      id: parseInt(this.meetingId || '0') || 0,
      title: (n8nData['title'] || n8nData['meetingType'] || 'Untitled n8n Meeting') as string,
      description: (n8nData['description'] || n8nData['summary'] || '') as string,
      source: 'n8n',
      meetingType: (n8nData['meetingType'] || 'other') as string,
      status: 'completed',
      priority: 'medium',
      isRecurring: false,
      startTime: (n8nData['date'] || (n8nData['meetingMetadata'] as Record<string, unknown>)?.['date'] || n8nData['startTime'] || new Date().toISOString()) as string,
      endTime: (n8nData['endTime'] || new Date().toISOString()) as string,
      isPublic: false,
      requiresApproval: false,
      allowRecording: false,
      autoTranscription: false,
      aiAnalysisEnabled: false,
      createdAt: (n8nData['createdAt'] || new Date().toISOString()) as string,
      updatedAt: (n8nData['updatedAt'] || new Date().toISOString()) as string,
      organization: {
        id: 0,
        name: 'n8n External',
        domain: 'n8n.cloud',
        timezone: 'UTC',
        isActive: true,
        maxUsers: 1000,
        maxMeetings: 1000,
        subscriptionTier: 'external',
        currentUserCount: 0,
        currentMeetingCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      organizer: {
        id: 0,
        firstName: 'n8n',
        lastName: 'System',
        email: 'n8n@system.com',
        isActive: true,
        emailNotifications: false,
        pushNotifications: false,
        timezone: 'UTC',
        language: 'en',
        displayName: 'n8n System',
        fullName: 'n8n System',
        roles: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      participants: (n8nData['attendees'] || []) as Participant[],
      actionItems: (n8nData['actionItems'] || []) as ActionItem[],
      notes: [],
      attachments: [],
      details: (n8nData['keyDecisions'] || n8nData['nextSteps'] || n8nData['description'] || 'n8n meeting details') as string,
      durationInMinutes: (n8nData['duration'] || 60) as number,
      upcoming: false,
      inProgress: false,
      subject: (n8nData['title'] || n8nData['meetingType'] || 'n8n Meeting') as string,
      type: (n8nData['meetingType'] || 'other') as string
    } as unknown as Meeting & { source: 'n8n' };
    this.initializeEditedMeeting();
    this.loading = false;
  }

  handleN8nDataNotFound() {
    console.error('❌ Meeting not found in n8n data');
    this.error = `Meeting with ID ${this.meetingId} was not found in n8n. It may have been deleted or the ID may be incorrect.`;
    this.loading = false;
  }

  handleN8nApiError(error: unknown) {
    console.error('❌ n8n API completely unavailable:', error);
    
    const httpError = error as {status?: number};
    
    if (httpError.status === 0) {
      this.error = 'Unable to connect to n8n. Please check your internet connection and try again.';
    } else if (httpError.status && httpError.status >= 500) {
      this.error = 'n8n server error. Please try again later.';
    } else {
      this.error = `Failed to load meeting from n8n (${httpError.status || 'unknown'}). The meeting data may be temporarily unavailable.`;
    }
    this.loading = false;
  }

  handleError(error: unknown) {
    const httpError = error as {status?: number};
    
    if (httpError.status === 0) {
      this.error = 'Unable to connect to server. Please check your internet connection.';
    } else if (httpError.status === 404) {
      this.error = `Meeting with ID ${this.meetingId} not found.`;
    } else if (httpError.status && httpError.status >= 500) {
      this.error = 'Server error. Please try again later.';
    } else {
      this.error = `Failed to load meeting details (${httpError.status || 'unknown'})`;
    }
    this.loading = false;
  }

  retryLoad() {
    this.loadMeeting();
  }

  initializeEditedMeeting(): void {
    if (this.meeting) {
      this.editedMeeting = { ...this.meeting } as EditableMeeting;
      this.loadPendingActions();
      this.applyParticipantFilters();
    }
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
      meetingId: this.meeting?.id || 0,
      title,
      description,
      actionType: this.newPendingAction.actionType || 'TASK',
      status: this.newPendingAction.approvalRequired ? 'PENDING_APPROVAL' : 'NEW',
      priority: this.newPendingAction.priority || 'MEDIUM',
      approvalRequired: this.newPendingAction.approvalRequired || false,
      dueDate: this.newPendingAction.dueDate,
      estimatedHours: this.newPendingAction.estimatedHours,
      organizationId: this.meeting?.organization?.id || 0,
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
   * N8N Integration Methods
   */

  /**
   * Sync pending operations from N8N
   */
  syncFromN8n(): void {
    if (!this.meetingId) {
      this.toastService.showError('Meeting ID not available');
      return;
    }

    this.isSyncingFromN8n = true;
    this.pendingActionService.fetchFromN8n(this.meetingId.toString()).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          // Add new operations to the list
          this.pendingActions.push(...response.operations);
          this.toastService.showSuccess(`Synced ${response.count} operations from N8N`);
        } else if (response.status === 'unavailable') {
          this.toastService.showWarning('N8N service is not enabled or configured');
        } else {
          this.toastService.showWarning(response.message);
        }
        this.isSyncingFromN8n = false;
      },
      error: (error) => {
        console.error('Error syncing from N8N:', error);
        this.toastService.showError('Failed to sync from N8N');
        this.isSyncingFromN8n = false;
      }
    });
  }

  /**
   * Test N8N connection and update availability status
   */
  testN8nConnection(): void {
    this.pendingActionService.testN8nConnection().subscribe({
      next: (response) => {
        this.n8nAvailable = response.available;
        if (response.available) {
          this.toastService.showSuccess('N8N service is available');
        } else {
          this.toastService.showWarning('N8N service is not configured');
        }
      },
      error: (error) => {
        console.error('Error testing N8N connection:', error);
        this.n8nAvailable = false;
        this.toastService.showError('Failed to test N8N connection');
      }
    });
  }

  /**
   * Toggle selection of a pending action for bulk operations
   */
  togglePendingActionSelection(actionId: string): void {
    const index = this.selectedPendingActionIds.indexOf(actionId);
    if (index > -1) {
      this.selectedPendingActionIds.splice(index, 1);
    } else {
      this.selectedPendingActionIds.push(actionId);
    }
  }

  /**
   * Check if a pending action is selected
   */
  isPendingActionSelected(actionId: string): boolean {
    return this.selectedPendingActionIds.includes(actionId);
  }

  /**
   * Select or deselect all pending actions
   */
  toggleAllPendingActions(): void {
    if (this.selectedPendingActionIds.length === this.pendingActions.length) {
      this.selectedPendingActionIds = [];
    } else {
      this.selectedPendingActionIds = this.pendingActions
        .filter(a => a.id)
        .map(a => a.id!);
    }
  }

  /**
   * Bulk approve selected pending actions
   */
  bulkApprovePendingActions(): void {
    if (this.selectedPendingActionIds.length === 0) {
      this.toastService.showWarning('No pending actions selected');
      return;
    }

    const approvalNotes = prompt('Enter approval notes (optional):');
    if (approvalNotes === null) return; // User cancelled

    this.pendingActionService.bulkApprovePendingActions(
      this.selectedPendingActionIds,
      1, // Should be current user ID
      approvalNotes || undefined
    ).subscribe({
      next: (updatedActions) => {
        // Update the pending actions list
        updatedActions.forEach(updatedAction => {
          const index = this.pendingActions.findIndex(a => a.id === updatedAction.id);
          if (index !== -1) {
            this.pendingActions[index] = updatedAction;
          }
        });
        this.toastService.showSuccess(`Approved ${updatedActions.length} pending actions`);
        this.selectedPendingActionIds = [];
      },
      error: (error) => {
        console.error('Error bulk approving pending actions:', error);
        this.toastService.showError('Failed to approve selected actions');
      }
    });
  }

  /**
   * Bulk reject selected pending actions
   */
  bulkRejectPendingActions(): void {
    if (this.selectedPendingActionIds.length === 0) {
      this.toastService.showWarning('No pending actions selected');
      return;
    }

    const rejectionReason = prompt('Enter rejection reason (required):');
    if (!rejectionReason?.trim()) return; // User cancelled or no reason

    this.pendingActionService.bulkRejectPendingActions(
      this.selectedPendingActionIds,
      1, // Should be current user ID
      rejectionReason
    ).subscribe({
      next: (updatedActions) => {
        // Update the pending actions list
        updatedActions.forEach(updatedAction => {
          const index = this.pendingActions.findIndex(a => a.id === updatedAction.id);
          if (index !== -1) {
            this.pendingActions[index] = updatedAction;
          }
        });
        this.toastService.showSuccess(`Rejected ${updatedActions.length} pending actions`);
        this.selectedPendingActionIds = [];
      },
      error: (error) => {
        console.error('Error bulk rejecting pending actions:', error);
        this.toastService.showError('Failed to reject selected actions');
      }
    });
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
    // Handle pending action priorities (uppercase)
    if (['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) {
      switch (priority) {
        case 'LOW': return 'text-green-600 bg-green-50';
        case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
        case 'HIGH': return 'text-orange-600 bg-orange-50';
        case 'URGENT': return 'text-red-600 bg-red-50';
        default: return 'text-gray-600 bg-gray-50';
      }
    }
    
    // Handle regular action item priorities (lowercase - legacy)
    switch (priority.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'urgent': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }

  /**
   * Enter edit mode - makes all sections editable
   */
  enterEditMode(): void {
    console.log('Entering edit mode');
    this.isEditing = true;
    // Make a deep copy for editing
    if (this.meeting && this.meeting.id !== undefined) {
      this.editedMeeting = JSON.parse(JSON.stringify(this.meeting)) as EditableMeeting;
    }
  }

  /**
   * Cancel edit mode - discard all changes
   */
  cancelEditMode(): void {
    console.log('Canceling edit mode');
    this.isEditing = false;
    // Exit all sub-edit modes
    this.isEditingOverview = false;
    this.isEditingActionItems = false;
    this.isAddingParticipant = false;
    this.isAddingPendingAction = false;
    this.showParticipantFilters = false;
    // Reset any pending changes
    if (this.meeting && this.meeting.id !== undefined) {
      this.editedMeeting = JSON.parse(JSON.stringify(this.meeting)) as EditableMeeting;
    }
    // Clear any pending action selections
    this.selectedPendingActionIds = [];
    // Reset all card editing states
    Object.keys(this.cardState).forEach(key => {
      this.cardState[key as keyof typeof this.cardState].editing = false;
    });
  }

  /**
   * Save all changes across all sections
   */
  saveAllChanges(): void {
    console.log('Saving all changes');
    if (!this.meeting || !this.meeting.id) {
      this.toastService.showError('No meeting to save');
      return;
    }

    // Use the existing updateMeeting method which handles everything
    this.updateMeeting();

    // Exit edit mode after save is triggered
    // Note: updateMeeting() already handles the reload and success toast
    this.isEditing = false;
  }

  // Toggle collapse/expand for individual cards
  toggleCardCollapse(cardName: keyof typeof this.cardState): void {
    this.cardState[cardName].collapsed = !this.cardState[cardName].collapsed;
  }

  // Toggle edit mode for individual cards
  toggleCardEdit(cardName: keyof typeof this.cardState): void {
    if (this.isEditing) {
      this.cardState[cardName].editing = !this.cardState[cardName].editing;
    }
  }

  // Save changes for individual cards
  saveCard(cardName: keyof typeof this.cardState): void {
    console.log(`Saving ${cardName} card`);
    
    // Save logic for different card types
    switch (cardName) {
      case 'header':
        // Header changes are automatically saved via two-way binding
        break;
      case 'overview':
        // Overview changes are automatically saved via two-way binding
        break;
      case 'participants':
        // Save any participant that is currently being edited
        if (this.editingParticipantId) {
          this.saveParticipantEdit();
        }
        // Update the meeting via service
        this.updateMeeting();
        break;
      case 'pendingActions':
        // Pending action changes are handled by their dedicated service
        break;
      case 'actionItems':
        // Action item changes are automatically saved via two-way binding
        break;
    }
    
    this.cardState[cardName].editing = false;
  }

  // Cancel editing for individual cards
  cancelCardEdit(cardName: keyof typeof this.cardState): void {
    this.cardState[cardName].editing = false;
    
    // Reset form data to original values
    switch (cardName) {
      case 'header':
        // Reset header data if needed (would require storing original values)
        break;
      case 'overview':
        // Reset overview data if needed (would require storing original values)
        break;
      case 'participants':
        // Reset participant data if needed
        break;
      case 'pendingActions':
        // Reset pending action data if needed
        break;
      case 'actionItems':
        // Reset action item data if needed
        break;
    }
    
    console.log(`Cancelling ${cardName} card edit`);
  }

  handleParticipantToggle(participantName: string): void {
    if (!this.editedMeeting.participants) return;
    
    const attended = this.editedMeeting.participants.filter(p => p.attended).map(p => p.name);
    const isAttended = attended.includes(participantName);
    this.editedMeeting.participants = this.editedMeeting.participants.map(p =>
      p.name === participantName ? { ...p, attended: !isAttended } : p
    );
  }

  handleSaveOverview() {
    // In a real implementation, you might want to save to the server here
    this.isEditingOverview = false;
  }

  handleCancelOverview() {
    if (this.meeting && this.meeting.id !== undefined) {
      this.editedMeeting = { ...this.meeting } as EditableMeeting;
    }
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
      assignedTo: this.newActionItem.assignedTo || '',
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

    this.resetNewActionItem();
    this.isEditingActionItems = false;
  }

  resetNewActionItem(): void {
    this.newActionItem = {
      title: '',
      description: '',
      assignee: undefined,
      dueDate: undefined,
      priority: 'MEDIUM',
      status: 'OPEN',
      type: 'TASK',
      assignedTo: ''
    };
  }

  handleAddParticipant(): void {
    if (!this.newParticipant.name?.trim() || !this.newParticipant.email?.trim()) {
      console.log('Missing required fields - name or email');
      return;
    }

    const name = this.newParticipant.name.trim();
    const email = this.newParticipant.email.trim();

    const participant: Participant = {
      id: Date.now(), // Temporary ID for frontend - backend will assign real ID
      name,
      email,
      role: this.newParticipant.role || ParticipantRole.ATTENDEE,
      type: this.newParticipant.type || ParticipantType.OTHER,
      invitationStatus: InvitationStatus.PENDING,
      attendanceStatus: AttendanceStatus.UNKNOWN,
      isRequired: this.newParticipant.isRequired || false,
      canEdit: this.newParticipant.canEdit || false,
      canInviteOthers: this.newParticipant.canInviteOthers || false,
      attended: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('Adding participant:', participant);

    this.editedMeeting = {
      ...this.editedMeeting,
      participants: [...(this.editedMeeting.participants || []), participant]
    };

    console.log('Updated participants list:', this.editedMeeting.participants);

    // Reset form
    this.newParticipant = {
      name: '',
      email: '',
      role: ParticipantRole.ATTENDEE,
      type: ParticipantType.OTHER,
      invitationStatus: InvitationStatus.PENDING,
      attendanceStatus: AttendanceStatus.UNKNOWN,
      isRequired: false,
      canEdit: false,
      canInviteOthers: false,
      attended: false
    };

    this.isAddingParticipant = false;

    // Save the updated meeting to the backend
    console.log('Calling updateMeeting...');
    this.updateMeeting();
  }

  cancelAddParticipant(): void {
    this.isAddingParticipant = false;
    this.newParticipant = {
      name: '',
      email: '',
      role: ParticipantRole.ATTENDEE,
      type: ParticipantType.OTHER,
      invitationStatus: InvitationStatus.PENDING,
      attendanceStatus: AttendanceStatus.UNKNOWN,
      isRequired: false,
      canEdit: false,
      canInviteOthers: false,
      attended: false
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
      filtered = filtered.filter(p => p.type === this.participantFilter.type);
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
      filtered = filtered.filter(p => p.role === this.participantFilter.role);
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
    return participants.filter(p => (p.type || ParticipantType.OTHER) === type);
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
      participant.type = targetType;
      
      // Update the participant in the main list
      const participantIndex = this.editedMeeting.participants.findIndex(p => p.id === participant.id);
      if (participantIndex !== -1) {
        this.editedMeeting.participants[participantIndex] = { ...participant };
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
    this.editedMeeting.participants = this.editedMeeting.participants.map(p =>
      p.id === participant.id ? { ...p, attended: !p.attended } : p
    );
    
    // Refresh filters if active
    if (this.showParticipantFilters) {
      this.applyParticipantFilters();
    }
  }

  /**
   * Edit participant details
   */
  editParticipant(participant: Participant): void {
    this.editingParticipantId = participant.id || null;
    this.editingParticipant = { ...participant };
    console.log('Editing participant:', participant);
  }

  /**
   * Save participant edits
   */
  saveParticipantEdit(): void {
    if (this.editingParticipantId && this.editingParticipant) {
      const participantIndex = this.editedMeeting.participants.findIndex(p => p.id === this.editingParticipantId);
      if (participantIndex !== -1) {
        // Update the participant with the edited values
        this.editedMeeting.participants[participantIndex] = {
          ...this.editedMeeting.participants[participantIndex],
          ...this.editingParticipant,
          updatedAt: new Date().toISOString()
        };
        
        // Refresh filters if active
        if (this.showParticipantFilters) {
          this.applyParticipantFilters();
        }
      }
    }
    
    // Reset editing state
    this.editingParticipantId = null;
    this.editingParticipant = {};
    console.log('Participant edit saved');
  }

  /**
   * Cancel participant editing
   */
  cancelParticipantEdit(): void {
    this.editingParticipantId = null;
    this.editingParticipant = {};
    console.log('Participant edit cancelled');
  }

  /**
   * Check if a participant is currently being edited
   */
  isEditingParticipant(participantId: number | undefined): boolean {
    return this.editingParticipantId === participantId;
  }

  /**
   * Remove participant from meeting
   */
  removeParticipant(participant: Participant): void {
    if (confirm(`Are you sure you want to remove ${participant.name} from this meeting?`)) {
      this.editedMeeting.participants = this.editedMeeting.participants.filter(p => p.id !== participant.id);
      
      // Refresh filters if active
      if (this.showParticipantFilters) {
        this.applyParticipantFilters();
      }
    }
  }

  /**
   * Update the meeting via the backend service
   */
  updateMeeting(): void {
    if (!this.meetingId) {
      console.error('Cannot update meeting: no meeting ID');
      return;
    }

    const meetingToUpdate = { ...this.editedMeeting };
    console.log('Sending meeting update to backend:', meetingToUpdate);
    console.log('Number of participants to update:', meetingToUpdate.participants?.length || 0);
    
    this.meetingService.updateMeeting(this.meetingId, meetingToUpdate).subscribe({
      next: (updatedMeeting) => {
        console.log('Meeting updated successfully:', updatedMeeting);
        console.log('Updated meeting participants:', updatedMeeting.participants?.length || 0);

        // Show success toast
        this.toastService.showSuccess('Meeting updated successfully');

        // Reload the meeting to get fresh data from the server
        this.loadMeeting();
      },
      error: (error) => {
        console.error('Error updating meeting:', error);

        // Show error toast with details
        const errorMessage = error?.error?.message || error?.message || 'Failed to update meeting';
        this.toastService.showError(`Error: ${errorMessage}`);
      }
    });
  }

  handleDeleteActionItem(id: number) {
    this.editedMeeting = {
      ...this.editedMeeting,
      actionItems: this.editedMeeting.actionItems?.filter(item => item.id !== id) || []
    };
  }

  handleUpdateActionItem(id: number, updates: Partial<ActionItem>) {
    this.editedMeeting = {
      ...this.editedMeeting,
      actionItems: this.editedMeeting.actionItems?.map(item =>
        item.id === id ? { ...item, ...updates } : item
      ) || []
    };
  }

  handleDeletePendingAction(id: string) {
    if (id) {
      this.pendingActionService.deletePendingAction(id).subscribe({
        next: () => {
          this.pendingActions = this.pendingActions.filter(action => action.id !== id);
        },
        error: (error) => {
          console.error('Error deleting pending action:', error);
        }
      });
    }
  }

  toggleActionItemStatus(item: ActionItem) {
    const newStatus = (item.status === 'completed' || item.status === 'COMPLETED') ? 'OPEN' : 'COMPLETED';
    this.handleUpdateActionItem(item.id, { status: newStatus });
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
    this.editedMeeting = {
      ...this.editedMeeting,
      actionItems: [...(this.editedMeeting.actionItems || []), actionItem]
    };
  }

  // Utility methods for template
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

  // Edit functionality for pending actions
  private originalPendingActions: { [id: string]: EditablePendingAction } = {};

  startEditPendingAction(action: EditablePendingAction): void {
    if (action.id) {
      // Store original values
      this.originalPendingActions[action.id] = { ...action };
      // Enable editing mode
      action.editing = true;
    }
  }

  saveEditPendingAction(action: EditablePendingAction): void {
    if (!action.title?.trim() || !action.description?.trim()) {
      alert('Title and description are required.');
      return;
    }

    if (action.id) {
      // Update the action via service
      this.pendingActionService.updatePendingAction(action.id, {
        title: action.title,
        description: action.description,
        assigneeName: action.assigneeName,
        dueDate: action.dueDate,
        priority: action.priority
      }).subscribe({
        next: (updatedAction) => {
          console.log('Pending action updated successfully', updatedAction);
          // Remove original backup
          if (action.id) {
            delete this.originalPendingActions[action.id];
          }
          // Disable editing mode
          action.editing = false;
        },
        error: (error) => {
          console.error('Error updating pending action:', error);
          alert('Failed to update pending action. Please try again.');
        }
      });
    }
  }

  cancelEditPendingAction(action: EditablePendingAction): void {
    if (action.id && this.originalPendingActions[action.id]) {
      // Restore original values
      const original = this.originalPendingActions[action.id];
      action.title = original.title;
      action.description = original.description;
      action.assigneeName = original.assigneeName;
      action.dueDate = original.dueDate;
      action.priority = original.priority;
      
      // Clean up
      delete this.originalPendingActions[action.id];
    }
    // Disable editing mode
    action.editing = false;
  }

  // Edit functionality for action items
  private originalActionItems: { [id: number]: EditableActionItem } = {};

  startEditActionItem(item: EditableActionItem): void {
    // Store original values
    this.originalActionItems[item.id] = { ...item };
    // Enable editing mode
    item.editing = true;
  }

  saveEditActionItem(item: EditableActionItem): void {
    if (!item.title?.trim() && !item.description?.trim()) {
      alert('Either title or description is required.');
      return;
    }

    // Update the item locally (you might want to call a service here)
    console.log('Action item updated:', item);
    
    // Remove original backup
    delete this.originalActionItems[item.id];
    // Disable editing mode
    item.editing = false;
    
    // If you have an action item service, call it here:
    // this.actionItemService.updateActionItem(item.id, item).subscribe(...)
  }

  cancelEditActionItem(item: EditableActionItem): void {
    if (this.originalActionItems[item.id]) {
      // Restore original values
      const original = this.originalActionItems[item.id];
      item.title = original.title;
      item.description = original.description;
      item.assignedTo = original.assignedTo;
      item.dueDate = original.dueDate;
      item.priority = original.priority;

      // Clean up
      delete this.originalActionItems[item.id];
    }
    // Disable editing mode
    item.editing = false;
  }

  /**
   * Fathom Integration Helper Methods
   */

  /**
   * Extract Fathom recording link from pending action notes
   */
  getFathomRecordingLink(action: PendingAction): string | null {
    if (!action.notes) return null;
    const match = action.notes.match(/Recording: (https:\/\/app\.fathom\.video\/[^\s\n]+)/);
    return match ? match[1] : null;
  }

  /**
   * Extract timestamp from pending action notes
   */
  getFathomTimestamp(action: PendingAction): string | null {
    if (!action.notes) return null;
    const match = action.notes.match(/Timestamp: (\d{2}:\d{2}:\d{2})/);
    return match ? match[1] : null;
  }

  /**
   * Check if pending action is from Fathom
   */
  isFathomAction(action: PendingAction): boolean {
    return !!action.n8nExecutionId && action.n8nExecutionId.startsWith('fathom_');
  }

  /**
   * Open Fathom recording at specific timestamp
   */
  playFathomRecording(action: PendingAction): void {
    const recordingLink = this.getFathomRecordingLink(action);
    if (recordingLink) {
      window.open(recordingLink, '_blank');
    }
  }

  /**
   * Format timestamp for transcript display
   */
  formatTranscriptTimestamp(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Check if meeting is from Fathom
   * Checks multiple indicators: source field, recordingUrl pattern, or fathomRecordingId
   */
  isFathomMeeting(): boolean {
    if (!this.meeting) return false;

    // Check if explicitly marked as fathom
    if (this.meeting.source === 'fathom') return true;

    // Check if has fathomRecordingId
    if (this.meeting.fathomRecordingId) return true;

    // Check if has fathomRecordingUrl
    if (this.meeting.fathomRecordingUrl) return true;

    // Check if regular recordingUrl is from Fathom
    if (this.meeting.recordingUrl && this.meeting.recordingUrl.includes('fathom.video')) {
      return true;
    }

    // Check if any pending actions are from Fathom
    const hasFathomActions = this.pendingActions.some(action => this.isFathomAction(action));
    if (hasFathomActions) return true;

    return false;
  }

  /**
   * Get Fathom recording URL for the meeting
   * Checks multiple possible locations for the recording URL
   */
  getFathomRecordingUrl(): string | null {
    if (!this.meeting) return null;

    // Check explicit fathomRecordingUrl first
    if (this.meeting.fathomRecordingUrl) {
      return this.meeting.fathomRecordingUrl;
    }

    // Check regular recordingUrl if it's from Fathom
    if (this.meeting.recordingUrl && this.meeting.recordingUrl.includes('fathom.video')) {
      return this.meeting.recordingUrl;
    }

    return null;
  }
}
