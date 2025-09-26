import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../core/services/api-config.service';

export interface PendingAction {
  id?: string;
  meetingId: number;
  title: string;
  description: string;
  actionType: 'TASK' | 'DECISION' | 'FOLLOW_UP' | 'APPROVAL' | 'REVIEW' | 'COMMUNICATION' | 'OTHER';
  status: 'NEW' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETE' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assigneeId?: number;
  assigneeName?: string;
  assigneeEmail?: string;
  reporterId?: number;
  reporterName?: string;
  reporterEmail?: string;
  organizationId?: number;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  notes?: string;
  tags?: string[];
  
  // Approval workflow fields
  approvalRequired: boolean;
  approvedById?: number;
  approvedByName?: string;
  approvedAt?: string;
  rejectedById?: number;
  rejectedByName?: string;
  rejectedAt?: string;
  approvalNotes?: string;
  rejectionReason?: string;
  
  // N8N Integration fields
  n8nWorkflowId?: string;
  n8nExecutionId?: string;
  n8nWorkflowStatus?: 'PENDING' | 'TRIGGERED' | 'SUCCESS' | 'FAILED';
  n8nExecutionResults?: Record<string, unknown>;
  
  // External system tracking
  actionManagementSystems?: string[];
  externalSystemIds?: Record<string, string>;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
}

export interface PendingActionStatistics {
  total: number;
  pending: number;
  active: number;
  completed: number;
  rejected: number;
  overdue: number;
  completionRate: number;
  approvalRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class PendingActionService {
  private readonly apiUrl: string;

  constructor(
    private readonly http: HttpClient,
    private readonly apiConfig: ApiConfigService
  ) {
    this.apiUrl = this.apiConfig.getApiUrl('pending-actions');
    console.log('🔧 PendingActionService using ApiConfigService, URL:', this.apiUrl);
  }

  /**
   * Get all pending actions for a specific meeting
   */
  getPendingActionsByMeeting(meetingId: number): Observable<PendingAction[]> {
    return this.http.get<PendingAction[]>(`${this.apiUrl}/meeting/${meetingId}`);
  }

  /**
   * Get pending action by ID
   */
  getPendingActionById(id: string): Observable<PendingAction> {
    return this.http.get<PendingAction>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get pending actions assigned to a specific user
   */
  getPendingActionsByAssignee(userId: number): Observable<PendingAction[]> {
    return this.http.get<PendingAction[]>(`${this.apiUrl}/user/${userId}`);
  }

  /**
   * Get pending actions by status
   */
  getPendingActionsByStatus(status: PendingAction['status']): Observable<PendingAction[]> {
    return this.http.get<PendingAction[]>(`${this.apiUrl}/status/${status}`);
  }

  /**
   * Get overdue pending actions
   */
  getOverduePendingActions(): Observable<PendingAction[]> {
    return this.http.get<PendingAction[]>(`${this.apiUrl}/overdue`);
  }

  /**
   * Get pending actions due soon
   */
  getPendingActionsDueSoon(days: number = 7): Observable<PendingAction[]> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<PendingAction[]>(`${this.apiUrl}/due-soon`, { params });
  }

  /**
   * Create a new pending action
   */
  createPendingAction(pendingAction: Omit<PendingAction, 'id'>): Observable<PendingAction> {
    return this.http.post<PendingAction>(this.apiUrl, pendingAction);
  }

  /**
   * Update a pending action
   */
  updatePendingAction(id: string, actionDetails: Partial<PendingAction>): Observable<PendingAction> {
    return this.http.put<PendingAction>(`${this.apiUrl}/${id}`, actionDetails);
  }

  /**
   * Approve a pending action
   */
  approvePendingAction(id: string, approvedById: number, notes?: string): Observable<PendingAction> {
    let params = new HttpParams().set('approvedById', approvedById.toString());
    if (notes) {
      params = params.set('notes', notes);
    }
    return this.http.post<PendingAction>(`${this.apiUrl}/${id}/approve`, {}, { params });
  }

  /**
   * Reject a pending action
   */
  rejectPendingAction(id: string, rejectedById: number, notes?: string): Observable<PendingAction> {
    let params = new HttpParams().set('rejectedById', rejectedById.toString());
    if (notes) {
      params = params.set('notes', notes);
    }
    return this.http.post<PendingAction>(`${this.apiUrl}/${id}/reject`, {}, { params });
  }

  /**
   * Mark pending action as completed
   */
  completePendingAction(id: string, completionNotes?: string): Observable<PendingAction> {
    let params = new HttpParams();
    if (completionNotes) {
      params = params.set('completionNotes', completionNotes);
    }
    return this.http.post<PendingAction>(`${this.apiUrl}/${id}/complete`, {}, { params });
  }

  /**
   * Delete a pending action
   */
  deletePendingAction(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get pending actions with pagination and filtering
   */
  getPendingActions(options: {
    userId?: number;
    organizationId?: number;
    statuses?: PendingAction['status'][];
    page?: number;
    size?: number;
    sort?: string[];
  } = {}): Observable<{
    content: PendingAction[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    let params = new HttpParams();
    
    if (options.userId) params = params.set('userId', options.userId.toString());
    if (options.organizationId) params = params.set('organizationId', options.organizationId.toString());
    if (options.statuses?.length) {
      options.statuses.forEach(status => {
        params = params.append('statuses', status);
      });
    }
    if (options.page !== undefined) params = params.set('page', options.page.toString());
    if (options.size !== undefined) params = params.set('size', options.size.toString());
    if (options.sort?.length) {
      options.sort.forEach(sortParam => {
        params = params.append('sort', sortParam);
      });
    }

    return this.http.get<{
      content: PendingAction[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
    }>(this.apiUrl, { params });
  }

  /**
   * Search pending actions by text
   */
  searchPendingActions(searchText: string, organizationId?: number): Observable<PendingAction[]> {
    let params = new HttpParams().set('searchText', searchText);
    if (organizationId) {
      params = params.set('organizationId', organizationId.toString());
    }
    return this.http.get<PendingAction[]>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Get pending action statistics
   */
  getStatistics(userId: number): Observable<PendingActionStatistics> {
    return this.http.get<PendingActionStatistics>(`${this.apiUrl}/statistics/${userId}`);
  }

  /**
   * Bulk approve pending actions
   */
  bulkApprovePendingActions(ids: string[], approvedById: number, notes?: string): Observable<PendingAction[]> {
    let params = new HttpParams().set('approvedById', approvedById.toString());
    if (notes) {
      params = params.set('notes', notes);
    }
    return this.http.post<PendingAction[]>(`${this.apiUrl}/bulk-approve`, ids, { params });
  }

  /**
   * Bulk reject pending actions
   */
  bulkRejectPendingActions(ids: string[], rejectedById: number, notes?: string): Observable<PendingAction[]> {
    let params = new HttpParams().set('rejectedById', rejectedById.toString());
    if (notes) {
      params = params.set('notes', notes);
    }
    return this.http.post<PendingAction[]>(`${this.apiUrl}/bulk-reject`, ids, { params });
  }

  /**
   * Create pending actions from meeting action items
   */
  createPendingActionsFromMeeting(meetingId: number, reporterId: number): Observable<PendingAction[]> {
    const params = new HttpParams().set('reporterId', reporterId.toString());
    return this.http.post<PendingAction[]>(`${this.apiUrl}/from-meeting/${meetingId}`, {}, { params });
  }

  /**
   * Helper methods for status and priority display
   */
  getStatusColor(status: PendingAction['status']): string {
    switch (status) {
      case 'NEW': return 'text-blue-600 bg-blue-50';
      case 'PENDING_APPROVAL': return 'text-yellow-600 bg-yellow-50';
      case 'APPROVED': return 'text-green-600 bg-green-50';
      case 'REJECTED': return 'text-red-600 bg-red-50';
      case 'ACTIVE': return 'text-purple-600 bg-purple-50';
      case 'COMPLETE': return 'text-green-700 bg-green-100';
      case 'CANCELLED': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }

  getPriorityColor(priority: PendingAction['priority']): string {
    switch (priority) {
      case 'LOW': return 'text-green-600 bg-green-50';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
      case 'HIGH': return 'text-orange-600 bg-orange-50';
      case 'URGENT': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }

  getActionTypeIcon(actionType: PendingAction['actionType']): string {
    switch (actionType) {
      case 'TASK': return 'task_alt';
      case 'DECISION': return 'rule';
      case 'FOLLOW_UP': return 'follow_the_signs';
      case 'APPROVAL': return 'approval';
      case 'REVIEW': return 'rate_review';
      case 'COMMUNICATION': return 'chat';
      case 'OTHER': return 'more_horiz';
      default: return 'task_alt';
    }
  }
}