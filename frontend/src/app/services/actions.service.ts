import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface UnifiedAction {
  id: string;
  title: string;
  description?: string;
  status: 'NEW' | 'ACTIVE' | 'COMPLETE' | 'REJECTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  source: 'MANUAL' | 'FATHOM' | 'AI_SUGGESTION' | 'N8N';
  actionType: 'TASK' | 'SCHEDULE_MEETING' | 'UPDATE_CRM' | 'FOLLOW_UP' | 'DECISION' | 'RESEARCH' | 'APPROVAL' | 'DOCUMENTATION' | 'MEETING' | 'SEND_EMAIL';
  targetSystem?: 'MEETING_MANAGER' | 'ZOHO_CRM' | 'CLICKUP' | 'N8N_AGENT';
  assigneeEmail?: string;
  assigneeName?: string;
  assigneeId?: number;
  dueDate?: string;
  estimatedHours?: number;

  // Meeting reference
  meetingId?: number;

  // Source-specific fields
  fathomActionId?: string;
  fathomConfidenceScore?: number;
  fathomTranscriptTimestamp?: number;
  aiSuggestionId?: number;
  sourceReferenceId?: string;

  // External system IDs
  zohoTaskId?: string;
  zohoContactId?: string;
  zohoDealId?: string;
  clickUpTaskId?: string;
  clickUpListId?: string;
  clickUpSpaceId?: string;
  externalTaskId?: string;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
  approvedAt?: string;
  completedAt?: string;
  rejectedAt?: string;
  sentToSystemAt?: string;

  // Approval tracking
  approvedById?: number;
  rejectedById?: number;
  approvalNotes?: string;
  rejectionNotes?: string;

  // Execution metadata
  executionError?: string;

  // Additional fields
  notes?: string;
  completionNotes?: string;
  tags?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ActionsService {
  private apiUrl = environment.apiUrl || 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  /**
   * Get all actions for a specific meeting
   */
  getActionsForMeeting(meetingId: number): Observable<UnifiedAction[]> {
    const url = `${this.apiUrl}/meetings/${meetingId}/actions`;
    return this.http.get<UnifiedAction[]>(url).pipe(
      tap(actions => console.log(`Loaded ${actions.length} actions for meeting ${meetingId}`)),
      catchError(this.handleError('getActionsForMeeting'))
    );
  }

  /**
   * Get pending actions (NEW status) for a meeting
   */
  getPendingActionsForMeeting(meetingId: number): Observable<UnifiedAction[]> {
    const url = `${this.apiUrl}/meetings/${meetingId}/actions/pending`;
    return this.http.get<UnifiedAction[]>(url).pipe(
      tap(actions => console.log(`Loaded ${actions.length} pending actions for meeting ${meetingId}`)),
      catchError(this.handleError('getPendingActionsForMeeting'))
    );
  }

  /**
   * Create a new action for a meeting
   */
  createAction(meetingId: number, action: Partial<UnifiedAction>): Observable<UnifiedAction> {
    const url = `${this.apiUrl}/meetings/${meetingId}/actions`;
    return this.http.post<UnifiedAction>(url, action).pipe(
      tap(newAction => console.log(`Created action: ${newAction.id}`)),
      catchError(this.handleError('createAction'))
    );
  }

  /**
   * Update an existing action
   */
  updateAction(actionId: string, updates: Partial<UnifiedAction>): Observable<UnifiedAction> {
    const url = `${this.apiUrl}/actions/${actionId}`;
    return this.http.put<UnifiedAction>(url, updates).pipe(
      tap(updated => console.log(`Updated action: ${actionId}`)),
      catchError(this.handleError('updateAction'))
    );
  }

  /**
   * Approve an action (NEW -> ACTIVE)
   */
  approveAction(actionId: string, notes?: string): Observable<{ success: boolean; message: string; action: UnifiedAction }> {
    const url = `${this.apiUrl}/actions/${actionId}/approve`;
    const payload = notes ? { notes } : {};
    return this.http.put<{ success: boolean; message: string; action: UnifiedAction }>(url, payload).pipe(
      tap(result => console.log(`Approved action: ${actionId}`)),
      catchError(this.handleError('approveAction'))
    );
  }

  /**
   * Reject an action
   */
  rejectAction(actionId: string, notes?: string): Observable<{ success: boolean; message: string; action: UnifiedAction }> {
    const url = `${this.apiUrl}/actions/${actionId}/reject`;
    const payload = notes ? { notes } : {};
    return this.http.put<{ success: boolean; message: string; action: UnifiedAction }>(url, payload).pipe(
      tap(result => console.log(`Rejected action: ${actionId}`)),
      catchError(this.handleError('rejectAction'))
    );
  }

  /**
   * Mark action as complete (ACTIVE -> COMPLETE)
   */
  completeAction(actionId: string, completionNotes?: string): Observable<{ success: boolean; message: string; action: UnifiedAction }> {
    const url = `${this.apiUrl}/actions/${actionId}/complete`;
    const payload = completionNotes ? { completionNotes } : {};
    return this.http.put<{ success: boolean; message: string; action: UnifiedAction }>(url, payload).pipe(
      tap(result => console.log(`Completed action: ${actionId}`)),
      catchError(this.handleError('completeAction'))
    );
  }

  /**
   * Delete an action
   */
  deleteAction(actionId: string): Observable<void> {
    const url = `${this.apiUrl}/actions/${actionId}`;
    return this.http.delete<void>(url).pipe(
      tap(() => console.log(`Deleted action: ${actionId}`)),
      catchError(this.handleError('deleteAction'))
    );
  }

  /**
   * Bulk approve multiple actions
   */
  bulkApproveActions(actionIds: string[], notes?: string): Observable<{ success: boolean; approvedCount: number }> {
    const url = `${this.apiUrl}/actions/bulk-approve`;
    const payload = { actionIds, notes };
    return this.http.post<{ success: boolean; approvedCount: number }>(url, payload).pipe(
      tap(result => console.log(`Bulk approved ${result.approvedCount} actions`)),
      catchError(this.handleError('bulkApproveActions'))
    );
  }

  /**
   * Send action to external system (Zoho CRM, ClickUp, etc.)
   */
  sendToExternalSystem(
    actionId: string,
    targetSystem: 'ZOHO_CRM' | 'CLICKUP' | 'N8N_AGENT',
    additionalData?: any
  ): Observable<{ success: boolean; externalId?: string; message: string }> {
    const url = `${this.apiUrl}/actions/${actionId}/send`;
    const payload = { targetSystem, ...additionalData };
    return this.http.post<{ success: boolean; externalId?: string; message: string }>(url, payload).pipe(
      tap(result => console.log(`Sent action ${actionId} to ${targetSystem}: ${result.message}`)),
      catchError(this.handleError('sendToExternalSystem'))
    );
  }

  /**
   * Sync actions from n8n for a specific meeting
   */
  syncFromN8n(meetingId: number): Observable<{ success: boolean; syncedCount: number; actions: UnifiedAction[] }> {
    const url = `${this.apiUrl}/meetings/${meetingId}/actions/sync-n8n`;
    return this.http.post<{ success: boolean; syncedCount: number; actions: UnifiedAction[] }>(url, {}).pipe(
      tap(result => console.log(`Synced ${result.syncedCount} actions from n8n for meeting ${meetingId}`)),
      catchError(this.handleError('syncFromN8n'))
    );
  }

  /**
   * Get actions by source type
   */
  getActionsBySource(meetingId: number, source: string): Observable<UnifiedAction[]> {
    const url = `${this.apiUrl}/meetings/${meetingId}/actions?source=${source}`;
    return this.http.get<UnifiedAction[]>(url).pipe(
      tap(actions => console.log(`Loaded ${actions.length} ${source} actions`)),
      catchError(this.handleError('getActionsBySource'))
    );
  }

  /**
   * Get actions by status
   */
  getActionsByStatus(meetingId: number, status: string): Observable<UnifiedAction[]> {
    const url = `${this.apiUrl}/meetings/${meetingId}/actions?status=${status}`;
    return this.http.get<UnifiedAction[]>(url).pipe(
      tap(actions => console.log(`Loaded ${actions.length} ${status} actions`)),
      catchError(this.handleError('getActionsByStatus'))
    );
  }

  /**
   * Schedule a meeting for a SCHEDULE_MEETING action type
   */
  scheduleMeetingForAction(actionId: string, meetingDetails: any): Observable<{ success: boolean; meetingId: number }> {
    const url = `${this.apiUrl}/actions/${actionId}/schedule-meeting`;
    return this.http.post<{ success: boolean; meetingId: number }>(url, meetingDetails).pipe(
      tap(result => console.log(`Scheduled meeting for action ${actionId}: meeting ID ${result.meetingId}`)),
      catchError(this.handleError('scheduleMeetingForAction'))
    );
  }

  /**
   * Get action statistics for a meeting
   */
  getActionStats(meetingId: number): Observable<{
    total: number;
    byStatus: { [key: string]: number };
    bySource: { [key: string]: number };
    byPriority: { [key: string]: number };
  }> {
    const url = `${this.apiUrl}/meetings/${meetingId}/actions/stats`;
    return this.http.get<any>(url).pipe(
      tap(stats => console.log(`Loaded action statistics for meeting ${meetingId}`)),
      catchError(this.handleError('getActionStats'))
    );
  }

  /**
   * Error handler
   */
  private handleError(operation: string) {
    return (error: any): Observable<never> => {
      console.error(`${operation} failed:`, error);

      // Extract error message
      let errorMessage = 'An error occurred';
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.error) {
        errorMessage = error.error.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Log to console for debugging
      console.error(`Operation: ${operation}`, errorMessage);

      return throwError(() => new Error(errorMessage));
    };
  }
}
