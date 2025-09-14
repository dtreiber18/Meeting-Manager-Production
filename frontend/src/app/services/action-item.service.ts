import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { 
  ActionItem, 
  ActionItemFilter, 
  ActionItemSummary, 
  CreateActionItemRequest, 
  UpdateActionItemRequest,
  ActionItemStatus,
  ActionItemPriority
} from '../models/action-item.model';
import { environment } from '../../environments/environment';
import { ToastService } from '../shared/services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class ActionItemService {
  private apiUrl = `${environment.apiUrl}/action-items`;
  
  // Subject for real-time updates
  private actionItemsSubject = new BehaviorSubject<ActionItem[]>([]);
  public actionItems$ = this.actionItemsSubject.asObservable();
  
  private currentFilterSubject = new BehaviorSubject<ActionItemFilter>({});
  public currentFilter$ = this.currentFilterSubject.asObservable();

  constructor(
    private http: HttpClient,
    private toastService: ToastService
  ) {
    this.loadActionItems();
  }

  /**
   * Get all action items with optional filtering
   */
  getActionItems(filter?: ActionItemFilter): Observable<ActionItem[]> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.status && filter.status.length > 0) {
        filter.status.forEach(status => params = params.append('status', status));
      }
      if (filter.priority && filter.priority.length > 0) {
        filter.priority.forEach(priority => params = params.append('priority', priority));
      }
      if (filter.type && filter.type.length > 0) {
        filter.type.forEach(type => params = params.append('type', type));
      }
      if (filter.assigneeId) {
        params = params.set('assigneeId', filter.assigneeId.toString());
      }
      if (filter.reporterId) {
        params = params.set('reporterId', filter.reporterId.toString());
      }
      if (filter.meetingId) {
        params = params.set('meetingId', filter.meetingId.toString());
      }
      if (filter.dueDateFrom) {
        params = params.set('dueDateFrom', filter.dueDateFrom.toISOString());
      }
      if (filter.dueDateTo) {
        params = params.set('dueDateTo', filter.dueDateTo.toISOString());
      }
      if (filter.completed !== undefined) {
        params = params.set('completed', filter.completed.toString());
      }
      if (filter.overdue !== undefined) {
        params = params.set('overdue', filter.overdue.toString());
      }
      if (filter.dueSoon !== undefined) {
        params = params.set('dueSoon', filter.dueSoon.toString());
      }
      if (filter.search) {
        params = params.set('search', filter.search);
      }
      if (filter.tags && filter.tags.length > 0) {
        filter.tags.forEach(tag => params = params.append('tags', tag));
      }
    }

    return this.http.get<any[]>(this.apiUrl, { params }).pipe(
      map(response => this.convertToActionItems(response)),
      tap(actionItems => this.actionItemsSubject.next(actionItems)),
      catchError(error => {
        console.error('Error loading action items:', error);
        this.toastService.showError('Failed to load action items');
        return throwError(() => error);
      })
    );
  }

  /**
   * Get a specific action item by ID
   */
  getActionItem(id: number): Observable<ActionItem> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => this.convertToActionItem(response)),
      catchError(error => {
        console.error(`Error loading action item ${id}:`, error);
        this.toastService.showError('Failed to load action item');
        return throwError(() => error);
      })
    );
  }

  /**
   * Create a new action item
   */
  createActionItem(request: CreateActionItemRequest): Observable<ActionItem> {
    return this.http.post<any>(this.apiUrl, request).pipe(
      map(response => this.convertToActionItem(response)),
      tap(() => {
        this.toastService.showSuccess('Action item created successfully');
        this.refreshActionItems();
      }),
      catchError(error => {
        console.error('Error creating action item:', error);
        this.toastService.showError('Failed to create action item');
        return throwError(() => error);
      })
    );
  }

  /**
   * Update an existing action item
   */
  updateActionItem(id: number, request: UpdateActionItemRequest): Observable<ActionItem> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, request).pipe(
      map(response => this.convertToActionItem(response)),
      tap(() => {
        this.toastService.showSuccess('Action item updated successfully');
        this.refreshActionItems();
      }),
      catchError(error => {
        console.error(`Error updating action item ${id}:`, error);
        this.toastService.showError('Failed to update action item');
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete an action item
   */
  deleteActionItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.toastService.showSuccess('Action item deleted successfully');
        this.refreshActionItems();
      }),
      catchError(error => {
        console.error(`Error deleting action item ${id}:`, error);
        this.toastService.showError('Failed to delete action item');
        return throwError(() => error);
      })
    );
  }

  /**
   * Mark action item as completed
   */
  markAsCompleted(id: number): Observable<ActionItem> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/complete`, {}).pipe(
      map(response => this.convertToActionItem(response)),
      tap(() => {
        this.toastService.showSuccess('Action item marked as completed');
        this.refreshActionItems();
      }),
      catchError(error => {
        console.error(`Error marking action item ${id} as completed:`, error);
        this.toastService.showError('Failed to mark action item as completed');
        return throwError(() => error);
      })
    );
  }

  /**
   * Mark action item as in progress
   */
  markAsInProgress(id: number): Observable<ActionItem> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/in-progress`, {}).pipe(
      map(response => this.convertToActionItem(response)),
      tap(() => {
        this.toastService.showSuccess('Action item marked as in progress');
        this.refreshActionItems();
      }),
      catchError(error => {
        console.error(`Error marking action item ${id} as in progress:`, error);
        this.toastService.showError('Failed to mark action item as in progress');
        return throwError(() => error);
      })
    );
  }

  /**
   * Get action items assigned to current user
   */
  getMyActionItems(): Observable<ActionItem[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-items`).pipe(
      map(response => this.convertToActionItems(response)),
      catchError(error => {
        console.error('Error loading my action items:', error);
        this.toastService.showError('Failed to load your action items');
        return throwError(() => error);
      })
    );
  }

  /**
   * Get action items created by current user
   */
  getReportedActionItems(): Observable<ActionItem[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reported`).pipe(
      map(response => this.convertToActionItems(response)),
      catchError(error => {
        console.error('Error loading reported action items:', error);
        this.toastService.showError('Failed to load reported action items');
        return throwError(() => error);
      })
    );
  }

  /**
   * Get action items for a specific meeting
   */
  getActionItemsForMeeting(meetingId: number): Observable<ActionItem[]> {
    return this.http.get<any[]>(`${this.apiUrl}/meeting/${meetingId}`).pipe(
      map(response => this.convertToActionItems(response)),
      catchError(error => {
        console.error(`Error loading action items for meeting ${meetingId}:`, error);
        this.toastService.showError('Failed to load meeting action items');
        return throwError(() => error);
      })
    );
  }

  /**
   * Get action item summary/statistics
   */
  getActionItemSummary(): Observable<ActionItemSummary> {
    return this.http.get<ActionItemSummary>(`${this.apiUrl}/summary`).pipe(
      catchError(error => {
        console.error('Error loading action item summary:', error);
        this.toastService.showError('Failed to load action item summary');
        return throwError(() => error);
      })
    );
  }

  /**
   * Get overdue action items
   */
  getOverdueActionItems(): Observable<ActionItem[]> {
    return this.getActionItems({ overdue: true, completed: false });
  }

  /**
   * Get action items due soon (within 3 days)
   */
  getDueSoonActionItems(): Observable<ActionItem[]> {
    return this.getActionItems({ dueSoon: true, completed: false });
  }

  /**
   * Search action items
   */
  searchActionItems(query: string): Observable<ActionItem[]> {
    return this.getActionItems({ search: query });
  }

  /**
   * Apply filter and update current filter
   */
  applyFilter(filter: ActionItemFilter): void {
    this.currentFilterSubject.next(filter);
    this.getActionItems(filter).subscribe();
  }

  /**
   * Clear current filter
   */
  clearFilter(): void {
    this.currentFilterSubject.next({});
    this.loadActionItems();
  }

  /**
   * Get current action items from subject
   */
  getCurrentActionItems(): ActionItem[] {
    return this.actionItemsSubject.value;
  }

  /**
   * Refresh action items with current filter
   */
  private refreshActionItems(): void {
    const currentFilter = this.currentFilterSubject.value;
    this.getActionItems(currentFilter).subscribe();
  }

  /**
   * Load action items initially
   */
  private loadActionItems(): void {
    this.getActionItems().subscribe();
  }

  /**
   * Convert API response to ActionItem array
   */
  private convertToActionItems(response: any[]): ActionItem[] {
    return response.map(item => this.convertToActionItem(item));
  }

  /**
   * Convert API response to ActionItem
   */
  private convertToActionItem(item: any): ActionItem {
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      status: item.status as ActionItemStatus,
      priority: item.priority as ActionItemPriority,
      type: item.type,
      dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
      startDate: item.startDate ? new Date(item.startDate) : undefined,
      completedAt: item.completedAt ? new Date(item.completedAt) : undefined,
      completed: item.completed,
      isRecurring: item.isRecurring,
      recurringPattern: item.recurringPattern,
      estimatedHours: item.estimatedHours,
      actualHours: item.actualHours,
      notes: item.notes,
      completionNotes: item.completionNotes,
      tags: item.tags,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
      lastReminderSent: item.lastReminderSent ? new Date(item.lastReminderSent) : undefined,
      meeting: item.meeting,
      assignee: item.assignee,
      reporter: item.reporter,
      organization: item.organization,
      subTasks: item.subTasks ? this.convertToActionItems(item.subTasks) : undefined,
      parentActionItem: item.parentActionItem ? this.convertToActionItem(item.parentActionItem) : undefined,
      assignedTo: item.assignee ? `${item.assignee.firstName} ${item.assignee.lastName}` : undefined
    };
  }
}