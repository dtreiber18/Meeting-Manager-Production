import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ActionItemService } from '../services/action-item.service';
import { 
  ActionItem, 
  ActionItemStatus, 
  ActionItemPriority, 
  ActionItemType,
  ActionItemFilter,
  getActionItemStatusColor,
  getActionItemPriorityColor,
  getActionItemStatusIcon,
  getActionItemPriorityIcon,
  isActionItemOverdue,
  isActionItemDueSoon,
  formatActionItemDueDate
} from '../models/action-item.model';

@Component({
  selector: 'app-action-item-list',
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
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './action-item-list.component.html',
  styleUrls: ['./action-item-list.component.scss']
})
export class ActionItemListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  actionItems: ActionItem[] = [];
  isLoading = true;
  searchQuery = '';
  
  // Filter options
  selectedStatuses: ActionItemStatus[] = [];
  selectedPriorities: ActionItemPriority[] = [];
  selectedTypes: ActionItemType[] = [];
  showCompletedItems = true;
  showOverdueOnly = false;
  showDueSoonOnly = false;
  
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
  formatDueDate = formatActionItemDueDate;

  constructor(private actionItemService: ActionItemService) {}

  ngOnInit(): void {
    this.loadActionItems();
    this.setupSearchDebouncing();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchDebouncing(): void {
    // Implement search debouncing if needed
  }

  loadActionItems(): void {
    const filter = this.buildFilter();
    
    this.actionItemService.getActionItems(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (actionItems) => {
          this.actionItems = actionItems;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading action items:', error);
          this.isLoading = false;
        }
      });
  }

  private buildFilter(): ActionItemFilter {
    const filter: ActionItemFilter = {};
    
    if (this.searchQuery) {
      filter.search = this.searchQuery;
    }
    
    if (this.selectedStatuses.length > 0) {
      filter.status = this.selectedStatuses;
    }
    
    if (this.selectedPriorities.length > 0) {
      filter.priority = this.selectedPriorities;
    }
    
    if (this.selectedTypes.length > 0) {
      filter.type = this.selectedTypes;
    }
    
    if (!this.showCompletedItems) {
      filter.completed = false;
    }
    
    if (this.showOverdueOnly) {
      filter.overdue = true;
    }
    
    if (this.showDueSoonOnly) {
      filter.dueSoon = true;
    }
    
    return filter;
  }

  onSearchChange(): void {
    this.loadActionItems();
  }

  onFilterChange(): void {
    this.loadActionItems();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedStatuses = [];
    this.selectedPriorities = [];
    this.selectedTypes = [];
    this.showCompletedItems = true;
    this.showOverdueOnly = false;
    this.showDueSoonOnly = false;
    this.loadActionItems();
  }

  markAsCompleted(actionItem: ActionItem, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    
    this.actionItemService.markAsCompleted(actionItem.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadActionItems();
        },
        error: (error) => {
          console.error('Error marking action item as completed:', error);
        }
      });
  }

  markAsInProgress(actionItem: ActionItem, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    
    this.actionItemService.markAsInProgress(actionItem.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadActionItems();
        },
        error: (error) => {
          console.error('Error marking action item as in progress:', error);
        }
      });
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

  getFilteredActionItems(): ActionItem[] {
    return this.actionItems;
  }

  trackByActionItemId(index: number, actionItem: ActionItem): number {
    return actionItem.id;
  }

  getProgressPercentage(actionItem: ActionItem): number {
    if (actionItem.completed) return 100;
    
    if (!actionItem.subTasks || actionItem.subTasks.length === 0) {
      switch (actionItem.status) {
        case ActionItemStatus.OPEN:
          return 0;
        case ActionItemStatus.IN_PROGRESS:
          return 50;
        case ActionItemStatus.BLOCKED:
          return 25;
        case ActionItemStatus.COMPLETED:
          return 100;
        case ActionItemStatus.CANCELLED:
          return 0;
        default:
          return 0;
      }
    }
    
    // Calculate based on subtasks
    const completedSubtasks = actionItem.subTasks.filter(st => st.completed).length;
    return Math.round((completedSubtasks * 100) / actionItem.subTasks.length);
  }
}