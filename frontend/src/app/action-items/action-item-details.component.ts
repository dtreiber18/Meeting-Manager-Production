import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

import { ActionItemService } from '../services/action-item.service';
import { 
  ActionItem, 
  ActionItemStatus, 
  ActionItemPriority, 
  ActionItemType,
  UpdateActionItemRequest,
  getActionItemStatusColor,
  getActionItemPriorityColor,
  getActionItemStatusIcon,
  getActionItemPriorityIcon,
  isActionItemOverdue,
  isActionItemDueSoon,
  getActionItemProgressPercentage,
  formatActionItemDueDate
} from '../models/action-item.model';

@Component({
  selector: 'app-action-item-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule,
    MatExpansionModule
  ],
  templateUrl: './action-item-details.component.html',
  styleUrls: ['./action-item-details.component.scss']
})
export class ActionItemDetailsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  actionItem: ActionItem | null = null;
  isLoading = true;
  isEditing = false;
  editForm: FormGroup;
  
  // Enums for templates
  ActionItemStatus = ActionItemStatus;
  ActionItemPriority = ActionItemPriority;
  ActionItemType = ActionItemType;
  
  // Helper functions
  getStatusColor = getActionItemStatusColor;
  getPriorityColor = getActionItemPriorityColor;
  getStatusIcon = getActionItemStatusIcon;
  getPriorityIcon = getActionItemPriorityIcon;
  isOverdue = isActionItemOverdue;
  isDueSoon = isActionItemDueSoon;
  getProgressPercentage = getActionItemProgressPercentage;
  formatDueDate = formatActionItemDueDate;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private actionItemService: ActionItemService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog
  ) {
    this.editForm = this.createEditForm();
  }

  ngOnInit(): void {
    this.route.params
      .pipe(
        takeUntil(this.destroy$),
        switchMap(params => {
          const id = Number(params['id']);
          return this.actionItemService.getActionItem(id);
        })
      )
      .subscribe({
        next: (actionItem) => {
          this.actionItem = actionItem;
          this.isLoading = false;
          this.populateEditForm();
        },
        error: (error) => {
          console.error('Error loading action item:', error);
          this.isLoading = false;
          this.router.navigate(['/action-items']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createEditForm(): FormGroup {
    return this.formBuilder.group({
      title: ['', [Validators.required, Validators.maxLength(500)]],
      description: [''],
      status: ['', Validators.required],
      priority: ['', Validators.required],
      type: ['', Validators.required],
      dueDate: [''],
      startDate: [''],
      estimatedHours: ['', [Validators.min(0)]],
      actualHours: ['', [Validators.min(0)]],
      notes: [''],
      completionNotes: [''],
      tags: ['']
    });
  }

  private populateEditForm(): void {
    if (!this.actionItem) return;

    this.editForm.patchValue({
      title: this.actionItem.title,
      description: this.actionItem.description || '',
      status: this.actionItem.status,
      priority: this.actionItem.priority,
      type: this.actionItem.type,
      dueDate: this.actionItem.dueDate,
      startDate: this.actionItem.startDate,
      estimatedHours: this.actionItem.estimatedHours,
      actualHours: this.actionItem.actualHours,
      notes: this.actionItem.notes || '',
      completionNotes: this.actionItem.completionNotes || '',
      tags: this.actionItem.tags || ''
    });
  }

  toggleEdit(): void {
    if (this.isEditing) {
      this.cancelEdit();
    } else {
      this.startEdit();
    }
  }

  startEdit(): void {
    this.isEditing = true;
    this.populateEditForm();
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.populateEditForm();
  }

  saveChanges(): void {
    if (!this.actionItem || !this.editForm.valid) return;

    const formValue = this.editForm.value;
    const updateRequest: UpdateActionItemRequest = {
      title: formValue.title,
      description: formValue.description,
      status: formValue.status,
      priority: formValue.priority,
      type: formValue.type,
      dueDate: formValue.dueDate,
      startDate: formValue.startDate,
      estimatedHours: formValue.estimatedHours,
      actualHours: formValue.actualHours,
      notes: formValue.notes,
      completionNotes: formValue.completionNotes,
      tags: formValue.tags
    };

    this.actionItemService.updateActionItem(this.actionItem.id, updateRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedActionItem) => {
          this.actionItem = updatedActionItem;
          this.isEditing = false;
        },
        error: (error) => {
          console.error('Error updating action item:', error);
        }
      });
  }

  markAsCompleted(): void {
    if (!this.actionItem) return;

    this.actionItemService.markAsCompleted(this.actionItem.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedActionItem) => {
          this.actionItem = updatedActionItem;
        },
        error: (error) => {
          console.error('Error marking action item as completed:', error);
        }
      });
  }

  markAsInProgress(): void {
    if (!this.actionItem) return;

    this.actionItemService.markAsInProgress(this.actionItem.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedActionItem) => {
          this.actionItem = updatedActionItem;
        },
        error: (error) => {
          console.error('Error marking action item as in progress:', error);
        }
      });
  }

  deleteActionItem(): void {
    if (!this.actionItem) return;

    const confirmDelete = confirm('Are you sure you want to delete this action item?');
    if (!confirmDelete) return;

    this.actionItemService.deleteActionItem(this.actionItem.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/action-items']);
        },
        error: (error) => {
          console.error('Error deleting action item:', error);
        }
      });
  }

  navigateToMeeting(): void {
    if (this.actionItem?.meeting) {
      this.router.navigate(['/meetings', this.actionItem.meeting.id]);
    }
  }

  goBack(): void {
    this.router.navigate(['/action-items']);
  }

  getStatusOptions(): { value: ActionItemStatus; label: string }[] {
    return [
      { value: ActionItemStatus.OPEN, label: 'Open' },
      { value: ActionItemStatus.IN_PROGRESS, label: 'In Progress' },
      { value: ActionItemStatus.BLOCKED, label: 'Blocked' },
      { value: ActionItemStatus.COMPLETED, label: 'Completed' },
      { value: ActionItemStatus.CANCELLED, label: 'Cancelled' }
    ];
  }

  getPriorityOptions(): { value: ActionItemPriority; label: string }[] {
    return [
      { value: ActionItemPriority.LOW, label: 'Low' },
      { value: ActionItemPriority.MEDIUM, label: 'Medium' },
      { value: ActionItemPriority.HIGH, label: 'High' },
      { value: ActionItemPriority.URGENT, label: 'Urgent' }
    ];
  }

  getTypeOptions(): { value: ActionItemType; label: string }[] {
    return [
      { value: ActionItemType.TASK, label: 'Task' },
      { value: ActionItemType.FOLLOW_UP, label: 'Follow Up' },
      { value: ActionItemType.DECISION, label: 'Decision' },
      { value: ActionItemType.RESEARCH, label: 'Research' },
      { value: ActionItemType.APPROVAL, label: 'Approval' },
      { value: ActionItemType.DOCUMENTATION, label: 'Documentation' },
      { value: ActionItemType.MEETING, label: 'Meeting' }
    ];
  }

  getTagsArray(): string[] {
    if (!this.actionItem?.tags) return [];
    return this.actionItem.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  }
}