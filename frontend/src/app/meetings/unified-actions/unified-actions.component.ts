import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Meeting } from '../meeting.model';
import { ActionsService, UnifiedAction } from '../../services/actions.service';

@Component({
  selector: 'app-unified-actions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 class="text-base font-semibold text-gray-900">
          Actions
          <span class="text-sm text-gray-500 font-normal ml-2">
            ({{ getActionCount() }} total, {{ getPendingCount() }} pending approval)
          </span>
        </h3>
        <div class="flex items-center space-x-2">
          <!-- Sync from N8N -->
          <button
            type="button"
            (click)="syncFromN8n()"
            [disabled]="isSyncing"
            class="px-3 py-1.5 text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-md transition-colors disabled:opacity-50 flex items-center space-x-1">
            <mat-icon class="w-4 h-4">sync</mat-icon>
            <span>{{ isSyncing ? 'Syncing...' : 'Sync from N8N' }}</span>
          </button>

          <!-- Add Action -->
          <button
            type="button"
            (click)="startAddingAction()"
            [disabled]="isAddingAction"
            class="px-3 py-1.5 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition-colors disabled:opacity-50 flex items-center space-x-1">
            <mat-icon class="w-4 h-4">add</mat-icon>
            <span>Add Action</span>
          </button>

          <!-- Collapse/Expand -->
          <button
            type="button"
            (click)="toggleCollapse()"
            class="p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <mat-icon>{{ collapsed ? 'expand_more' : 'expand_less' }}</mat-icon>
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-4" [hidden]="collapsed">

        <!-- Add New Action Form -->
        <div *ngIf="isAddingAction" class="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 class="text-sm font-semibold text-blue-900 mb-3">Add New Action</h4>

          <div class="space-y-3">
            <!-- Title -->
            <mat-form-field class="w-full" appearance="outline">
              <mat-label>Title</mat-label>
              <input matInput [(ngModel)]="newAction.title" placeholder="Action title" required>
            </mat-form-field>

            <!-- Description -->
            <mat-form-field class="w-full" appearance="outline">
              <mat-label>Description</mat-label>
              <textarea matInput [(ngModel)]="newAction.description" rows="2" placeholder="Description"></textarea>
            </mat-form-field>

            <!-- Action Type & Priority -->
            <div class="grid grid-cols-2 gap-3">
              <mat-form-field appearance="outline">
                <mat-label>Action Type</mat-label>
                <mat-select [(ngModel)]="newAction.actionType">
                  <mat-option value="TASK">Task</mat-option>
                  <mat-option value="FOLLOW_UP">Follow-up</mat-option>
                  <mat-option value="DECISION">Decision</mat-option>
                  <mat-option value="RESEARCH">Research</mat-option>
                  <mat-option value="APPROVAL">Approval</mat-option>
                  <mat-option value="DOCUMENTATION">Documentation</mat-option>
                  <mat-option value="MEETING">Meeting (General)</mat-option>
                  <mat-option value="SCHEDULE_MEETING">Schedule Meeting</mat-option>
                  <mat-option value="UPDATE_CRM">Update CRM</mat-option>
                  <mat-option value="SEND_EMAIL">Send Email</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Priority</mat-label>
                <mat-select [(ngModel)]="newAction.priority">
                  <mat-option value="LOW">Low</mat-option>
                  <mat-option value="MEDIUM">Medium</mat-option>
                  <mat-option value="HIGH">High</mat-option>
                  <mat-option value="URGENT">Urgent</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Target System -->
            <mat-form-field class="w-full" appearance="outline">
              <mat-label>Send To / Manage In</mat-label>
              <mat-select [(ngModel)]="newAction.targetSystem">
                <mat-option value="MEETING_MANAGER">Meeting Manager (Internal)</mat-option>
                <mat-option value="ZOHO_CRM">Zoho CRM</mat-option>
                <mat-option value="CLICKUP">ClickUp</mat-option>
                <mat-option value="N8N_AGENT">n8n Agent (Automation)</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Assignee & Due Date -->
            <div class="grid grid-cols-2 gap-3">
              <mat-form-field appearance="outline">
                <mat-label>Assignee Email</mat-label>
                <input matInput [(ngModel)]="newAction.assigneeEmail" type="email" placeholder="user@example.com">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Due Date</mat-label>
                <input matInput [(ngModel)]="newAction.dueDate" type="datetime-local">
              </mat-form-field>
            </div>

            <!-- Actions -->
            <div class="flex justify-end space-x-2">
              <button mat-button (click)="cancelAddingAction()">Cancel</button>
              <button mat-raised-button color="primary" (click)="saveNewAction()" [disabled]="!newAction.title">
                Save Action
              </button>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="mb-4 flex items-center space-x-3">
          <mat-form-field class="w-48" appearance="outline">
            <mat-label>Filter by Source</mat-label>
            <mat-select [(ngModel)]="filterSource" (ngModelChange)="applyFilters()">
              <mat-option value="ALL">All Sources</mat-option>
              <mat-option value="MANUAL">Manual</mat-option>
              <mat-option value="FATHOM">Fathom</mat-option>
              <mat-option value="AI_SUGGESTION">AI Suggestions</mat-option>
              <mat-option value="N8N">n8n</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field class="w-48" appearance="outline">
            <mat-label>Filter by Status</mat-label>
            <mat-select [(ngModel)]="filterStatus" (ngModelChange)="applyFilters()">
              <mat-option value="ALL">All Statuses</mat-option>
              <mat-option value="NEW">New (Pending Approval)</mat-option>
              <mat-option value="ACTIVE">Active</mat-option>
              <mat-option value="COMPLETE">Complete</mat-option>
              <mat-option value="REJECTED">Rejected</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <!-- Actions List -->
        <div *ngIf="filteredActions.length === 0" class="text-center py-8 text-gray-500">
          <mat-icon class="w-12 h-12 mx-auto mb-2 opacity-50">task_alt</mat-icon>
          <p class="text-sm">No actions for this meeting</p>
          <button mat-stroked-button color="primary" (click)="startAddingAction()" class="mt-3">
            Create First Action
          </button>
        </div>

        <div class="space-y-3">
          <div *ngFor="let action of filteredActions"
               class="p-4 rounded-lg border-2 transition-all"
               [ngClass]="{
                 'border-yellow-200 bg-yellow-50': action.status === 'NEW',
                 'border-blue-200 bg-blue-50': action.status === 'ACTIVE',
                 'border-green-200 bg-green-50': action.status === 'COMPLETE',
                 'border-gray-200 bg-gray-50': action.status === 'REJECTED'
               }">

            <!-- Action Header -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <!-- Title Row with Badges -->
                <div class="flex items-center space-x-2 mb-2 flex-wrap">
                  <h4 class="text-sm font-semibold text-gray-900">{{ action.title }}</h4>

                  <!-- Fathom Recording Link Button -->
                  <button *ngIf="getFathomRecordingLink(action)"
                          type="button"
                          (click)="playFathomRecording(action); $event.stopPropagation()"
                          class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors border border-purple-300"
                          title="Play Fathom recording at this timestamp">
                    🎥 Play Recording
                  </button>

                  <!-- Fathom Timestamp Badge -->
                  <span *ngIf="getFathomTimestamp(action)"
                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300"
                        title="Timestamp in recording">
                    ⏱️ {{ getFathomTimestamp(action) }}
                  </span>

                  <!-- Source Badge (for Fathom) -->
                  <span *ngIf="isFathomAction(action)"
                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        title="Source: Fathom">
                    Source: Fathom
                  </span>
                </div>

                <!-- Metadata Row (consistent labels and values) -->
                <div class="flex items-center space-x-4 text-sm text-gray-700">
                  <span>
                    <span class="font-medium">Assigned to:</span> {{ action.assigneeName || action.assigneeEmail || 'Unassigned' }}
                  </span>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="{
                          'bg-red-100 text-red-800': action.priority === 'URGENT',
                          'bg-orange-100 text-orange-800': action.priority === 'HIGH',
                          'bg-yellow-100 text-yellow-800': action.priority === 'MEDIUM',
                          'bg-gray-100 text-gray-800': action.priority === 'LOW'
                        }">
                    Priority: {{ action.priority || 'MEDIUM' }}
                  </span>
                </div>
              </div>

              <!-- Status Badge -->
              <div class="ml-4 flex-shrink-0">
                <span class="px-3 py-1 text-xs font-semibold rounded-full uppercase"
                      [ngClass]="{
                        'bg-yellow-200 text-yellow-900': action.status === 'NEW',
                        'bg-blue-200 text-blue-900': action.status === 'ACTIVE',
                        'bg-green-200 text-green-900': action.status === 'COMPLETE',
                        'bg-gray-200 text-gray-900': action.status === 'REJECTED'
                      }">
                  {{ action.status }}
                </span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-200">
              <!-- Pending Approval Actions -->
              <ng-container *ngIf="action.status === 'NEW'">
                <button mat-raised-button color="primary" (click)="approveAction(action)" class="text-sm">
                  <mat-icon class="w-4 h-4">check</mat-icon>
                  Approve & Execute
                </button>
                <button mat-button color="warn" (click)="rejectAction(action)" class="text-sm">
                  <mat-icon class="w-4 h-4">close</mat-icon>
                  Reject
                </button>
              </ng-container>

              <!-- Active Actions -->
              <ng-container *ngIf="action.status === 'ACTIVE'">
                <button mat-raised-button color="primary" (click)="completeAction(action)" class="text-sm">
                  <mat-icon class="w-4 h-4">check_circle</mat-icon>
                  Mark Complete
                </button>

                <!-- Schedule Meeting Button -->
                <button *ngIf="action.actionType === 'SCHEDULE_MEETING'"
                        mat-stroked-button color="accent" (click)="scheduleMeeting(action)" class="text-sm">
                  <mat-icon class="w-4 h-4">event</mat-icon>
                  Schedule Now
                </button>
              </ng-container>

              <!-- Edit & Delete -->
              <button mat-icon-button (click)="editAction(action)" class="ml-auto">
                <mat-icon class="w-5 h-5">edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteAction(action)">
                <mat-icon class="w-5 h-5">delete</mat-icon>
              </button>
            </div>

            <!-- Send to External System Dropdown (shown on all actions) -->
            <div class="mt-2 pt-2 border-t border-gray-200">
              <p class="text-sm font-medium text-gray-900 mb-2">Manage Task in External System</p>
              <mat-form-field class="w-full" appearance="outline">
                <mat-label>Send to System</mat-label>
                <mat-select (selectionChange)="sendToExternalSystem(action, $event.value)" class="text-sm">
                  <mat-option value="">Select a system...</mat-option>
                  <mat-option value="ZOHO_CRM">Zoho CRM</mat-option>
                  <mat-option value="CLICKUP">ClickUp</mat-option>
                </mat-select>
              </mat-form-field>
              <p class="text-xs text-gray-500 mt-1">
                *Selecting a system will immediately send this action
              </p>
            </div>

            <!-- Confidence Score (for Fathom actions) -->
            <div *ngIf="action.fathomConfidenceScore" class="mt-2 text-xs text-purple-600">
              Fathom Confidence: {{ action.fathomConfidenceScore | number:'1.0-2' }}%
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    mat-form-field {
      font-size: 0.875rem;
    }

    ::ng-deep .mat-mdc-form-field-infix {
      min-height: 40px;
    }
  `]
})
export class UnifiedActionsComponent implements OnInit {
  @Input() meeting!: Meeting;
  @Output() actionChanged = new EventEmitter<void>();

  actions: UnifiedAction[] = [];
  filteredActions: UnifiedAction[] = [];

  collapsed = false;
  isAddingAction = false;
  isSyncing = false;
  isLoading = false;

  filterSource = 'ALL';
  filterStatus = 'ALL';

  newAction: Partial<UnifiedAction> = {
    title: '',
    description: '',
    priority: 'MEDIUM',
    actionType: 'TASK',
    targetSystem: 'MEETING_MANAGER',
    status: 'NEW',
    source: 'MANUAL'
  };

  constructor(
    private actionsService: ActionsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadActions();
  }

  loadActions(): void {
    if (!this.meeting?.id) {
      console.warn('No meeting ID provided to load actions');
      return;
    }

    this.isLoading = true;
    this.actionsService.getActionsForMeeting(this.meeting.id).subscribe({
      next: (actions) => {
        this.actions = actions;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading actions:', error);
        this.showError('Failed to load actions: ' + error.message);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredActions = this.actions.filter(action => {
      const sourceMatch = this.filterSource === 'ALL' || action.source === this.filterSource;
      const statusMatch = this.filterStatus === 'ALL' || action.status === this.filterStatus;
      return sourceMatch && statusMatch;
    });
  }

  getActionCount(): number {
    return this.actions.length;
  }

  getPendingCount(): number {
    return this.actions.filter(a => a.status === 'NEW').length;
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
  }

  startAddingAction(): void {
    this.isAddingAction = true;
  }

  cancelAddingAction(): void {
    this.isAddingAction = false;
    this.newAction = {
      title: '',
      description: '',
      priority: 'MEDIUM',
      actionType: 'TASK',
      targetSystem: 'MEETING_MANAGER',
      status: 'NEW',
      source: 'MANUAL'
    };
  }

  saveNewAction(): void {
    if (!this.meeting?.id || !this.newAction.title) {
      return;
    }

    this.actionsService.createAction(this.meeting.id, this.newAction).subscribe({
      next: (created) => {
        this.showSuccess('Action created successfully');
        this.cancelAddingAction();
        this.loadActions();
        this.actionChanged.emit();
      },
      error: (error) => {
        console.error('Error creating action:', error);
        this.showError('Failed to create action: ' + error.message);
      }
    });
  }

  approveAction(action: UnifiedAction): void {
    const notes = prompt('Approval notes (optional):');
    if (notes === null) return; // User cancelled

    this.actionsService.approveAction(action.id, notes || undefined).subscribe({
      next: (result) => {
        this.showSuccess('Action approved and executed');
        this.loadActions();
        this.actionChanged.emit();
      },
      error: (error) => {
        console.error('Error approving action:', error);
        this.showError('Failed to approve action: ' + error.message);
      }
    });
  }

  rejectAction(action: UnifiedAction): void {
    const notes = prompt('Rejection reason (optional):');
    if (notes === null) return; // User cancelled

    this.actionsService.rejectAction(action.id, notes || undefined).subscribe({
      next: (result) => {
        this.showSuccess('Action rejected');
        this.loadActions();
        this.actionChanged.emit();
      },
      error: (error) => {
        console.error('Error rejecting action:', error);
        this.showError('Failed to reject action: ' + error.message);
      }
    });
  }

  completeAction(action: UnifiedAction): void {
    const completionNotes = prompt('Completion notes (optional):');
    if (completionNotes === null) return; // User cancelled

    this.actionsService.completeAction(action.id, completionNotes || undefined).subscribe({
      next: (result) => {
        this.showSuccess('Action marked as complete');
        this.loadActions();
        this.actionChanged.emit();
      },
      error: (error) => {
        console.error('Error completing action:', error);
        this.showError('Failed to complete action: ' + error.message);
      }
    });
  }

  scheduleMeeting(action: UnifiedAction): void {
    // TODO: Open schedule meeting dialog (reuse from smart insights)
    console.log('Scheduling meeting for action:', action);
    this.showInfo('Schedule meeting feature coming soon');
  }

  editAction(action: UnifiedAction): void {
    // TODO: Implement edit functionality with inline form or dialog
    console.log('Editing action:', action);
    this.showInfo('Edit feature coming soon');
  }

  deleteAction(action: UnifiedAction): void {
    if (!confirm(`Are you sure you want to delete "${action.title}"?`)) {
      return;
    }

    this.actionsService.deleteAction(action.id).subscribe({
      next: () => {
        this.showSuccess('Action deleted');
        this.loadActions();
        this.actionChanged.emit();
      },
      error: (error) => {
        console.error('Error deleting action:', error);
        this.showError('Failed to delete action: ' + error.message);
      }
    });
  }

  syncFromN8n(): void {
    if (!this.meeting?.id) {
      return;
    }

    this.isSyncing = true;
    this.actionsService.syncFromN8n(this.meeting.id).subscribe({
      next: (result) => {
        const count = result.count || result.operations?.length || 0;
        if (result.status === 'success') {
          this.showSuccess(`Synced ${count} actions from n8n`);
        } else if (result.status === 'unavailable') {
          this.showInfo('n8n service is not enabled or configured');
        } else {
          this.showInfo(result.message || 'No new actions from n8n');
        }
        this.loadActions();
        this.isSyncing = false;
      },
      error: (error) => {
        console.error('Error syncing from n8n:', error);
        this.showError('Failed to sync from n8n: ' + error.message);
        this.isSyncing = false;
      }
    });
  }

  getSourceLabel(source: string): string {
    const labels: Record<string, string> = {
      'MANUAL': 'Manual',
      'FATHOM': 'Fathom AI',
      'AI_SUGGESTION': 'AI Suggested',
      'N8N': 'n8n Workflow'
    };
    return labels[source] || source;
  }

  getSystemLabel(system: string): string {
    const labels: Record<string, string> = {
      'MEETING_MANAGER': 'Internal',
      'ZOHO_CRM': 'Zoho CRM',
      'CLICKUP': 'ClickUp',
      'N8N_AGENT': 'n8n Agent'
    };
    return labels[system] || system;
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  private showInfo(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['info-snackbar']
    });
  }

  /**
   * Check if action is from Fathom (based on n8nExecutionId starting with "fathom_")
   */
  isFathomAction(action: UnifiedAction): boolean {
    return !!action.n8nExecutionId && action.n8nExecutionId.startsWith('fathom_');
  }

  /**
   * Extract Fathom recording link from notes field
   * Notes format: "Recording: https://app.fathom.video/share/prod-strategy-q4?t=165\nTimestamp: 00:02:45"
   */
  getFathomRecordingLink(action: UnifiedAction): string | null {
    if (!action.notes) return null;
    const match = action.notes.match(/Recording: (https:\/\/app\.fathom\.video\/[^\s\n]+)/);
    return match ? match[1] : null;
  }

  /**
   * Extract timestamp from notes field
   * Notes format: "Recording: https://app.fathom.video/share/prod-strategy-q4?t=165\nTimestamp: 00:02:45"
   */
  getFathomTimestamp(action: UnifiedAction): string | null {
    if (!action.notes) return null;
    const match = action.notes.match(/Timestamp: (\d{2}:\d{2}:\d{2})/);
    return match ? match[1] : null;
  }

  /**
   * Play Fathom recording at specific timestamp
   */
  playFathomRecording(action: UnifiedAction): void {
    const recordingLink = this.getFathomRecordingLink(action);
    if (recordingLink) {
      window.open(recordingLink, '_blank');
    } else {
      this.showError('Fathom recording link not available');
    }
  }

  /**
   * Send action to external system (Zoho CRM or ClickUp)
   * Triggered when user selects a system from the dropdown
   */
  sendToExternalSystem(action: UnifiedAction, targetSystem: string): void {
    if (!targetSystem) {
      return; // User selected "Select a system..." placeholder
    }

    if (!confirm(`Send "${action.title}" to ${this.getSystemLabel(targetSystem)}?`)) {
      return;
    }

    console.log(`Sending action ${action.id} to ${targetSystem}`);

    this.actionsService.sendToExternalSystem(action.id, targetSystem as any).subscribe({
      next: (result) => {
        if (result.success) {
          this.showSuccess(`Action sent to ${this.getSystemLabel(targetSystem)} successfully!`);
          if (result.externalId) {
            console.log(`External task ID: ${result.externalId}`);
          }
          this.loadActions(); // Reload to get updated action with external ID
        } else {
          this.showError(result.message || 'Failed to send action to external system');
        }
      },
      error: (error) => {
        console.error('Error sending to external system:', error);
        this.showError(`Failed to send to ${this.getSystemLabel(targetSystem)}: ${error.message}`);
      }
    });
  }
}
