import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ToastService } from './toast.service';
import { AuthService } from '../../auth/auth.service';
import { ApiConfigService } from '../../core/services/api-config.service';

export interface NotificationData {
  [key: string]: string | number | boolean | Date | undefined;
}

export interface NotificationConditions {
  [key: string]: string | number | boolean | Date | string[] | undefined;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  priority: NotificationPriority;
  actionUrl?: string;
  actionText?: string;
}

export enum NotificationType {
  MEETING_REMINDER = 'meeting_reminder',
  MEETING_INVITATION = 'meeting_invitation',
  MEETING_UPDATED = 'meeting_updated',
  MEETING_CANCELLED = 'meeting_cancelled',
  ACTION_ITEM_ASSIGNED = 'action_item_assigned',
  ACTION_ITEM_DUE = 'action_item_due',
  ACTION_ITEM_OVERDUE = 'action_item_overdue',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  USER_MENTION = 'user_mention',
  DOCUMENT_SHARED = 'document_shared',
  WEEKLY_DIGEST = 'weekly_digest'
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface NotificationTrigger {
  id: string;
  name: string;
  description: string;
  type: NotificationType;
  isEnabled: boolean;
  conditions: NotificationConditions;
  template: NotificationTemplate;
}

export interface NotificationTemplate {
  titleTemplate: string;
  messageTemplate: string;
  emailTemplate?: string;
  pushTemplate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public readonly notifications$ = this.notificationsSubject.asObservable();
  
  private readonly unreadCountSubject = new BehaviorSubject<number>(0);
  public readonly unreadCount$ = this.unreadCountSubject.asObservable();
  
  private isPolling = false;

  // Pre-defined notification triggers
  private readonly defaultTriggers: NotificationTrigger[] = [
    {
      id: '1',
      name: 'Meeting Reminder',
      description: 'Notify users before meeting starts',
      type: NotificationType.MEETING_REMINDER,
      isEnabled: true,
      conditions: { minutesBefore: 15 },
      template: {
        titleTemplate: 'Meeting Reminder',
        messageTemplate: 'Your meeting "{{meetingTitle}}" starts in {{minutesBefore}} minutes',
        pushTemplate: 'Meeting "{{meetingTitle}}" starts soon'
      }
    },
    {
      id: '2',
      name: 'Action Item Due',
      description: 'Notify when action items are due',
      type: NotificationType.ACTION_ITEM_DUE,
      isEnabled: true,
      conditions: { daysBefore: 1 },
      template: {
        titleTemplate: 'Action Item Due Tomorrow',
        messageTemplate: 'Action item "{{actionTitle}}" is due tomorrow',
        emailTemplate: 'Your action item "{{actionTitle}}" is due on {{dueDate}}'
      }
    },
    {
      id: '3',
      name: 'Meeting Invitation',
      description: 'Notify when invited to a meeting',
      type: NotificationType.MEETING_INVITATION,
      isEnabled: true,
      conditions: {},
      template: {
        titleTemplate: 'Meeting Invitation',
        messageTemplate: 'You have been invited to "{{meetingTitle}}" on {{meetingDate}}',
        pushTemplate: 'New meeting invitation: {{meetingTitle}}'
      }
    },
    {
      id: '4',
      name: 'Action Item Assignment',
      description: 'Notify when an action item is assigned',
      type: NotificationType.ACTION_ITEM_ASSIGNED,
      isEnabled: true,
      conditions: {},
      template: {
        titleTemplate: 'New Action Item Assigned',
        messageTemplate: 'You have been assigned: "{{actionTitle}}" (Due: {{dueDate}})',
        emailTemplate: 'A new action item has been assigned to you: "{{actionTitle}}"'
      }
    }
  ];

  constructor(
    private readonly http: HttpClient,
    private readonly toastService: ToastService,
    private readonly authService: AuthService,
    private readonly apiConfig: ApiConfigService
  ) {
    console.log('🔧 NotificationService using ApiConfigService');
    this.initializeService();
  }

  private initializeService(): void {
    // Start polling when user is authenticated
    this.authService.isAuthenticated$.subscribe({
      next: (isAuth) => {
        this.handleAuthenticationState(isAuth);
      }
    });
  }

  private handleAuthenticationState(isAuthenticated: boolean): void {
    this.updatePollingBasedOnAuth(isAuthenticated);
  }

  private updatePollingBasedOnAuth(isAuthenticated: boolean): void {
    const shouldPoll = isAuthenticated && !this.isPolling;
    const shouldStop = !isAuthenticated && this.isPolling;
    
    if (shouldPoll) {
      this.startPolling();
    }
    
    if (shouldStop) {
      this.stopPolling();
    }
  }

  /**
   * Start polling for new notifications every 30 seconds
   */
  private startPolling(): void {
    this.isPolling = true;
    this.loadNotifications(); // Initial load
    
    interval(30000).subscribe(() => {
      if (this.isPolling) {
        this.loadNotifications();
      }
    });
  }

  /**
   * Stop polling for notifications
   */
  private stopPolling(): void {
    this.isPolling = false;
    this.notificationsSubject.next([]);
    this.unreadCountSubject.next(0);
  }

  /**
   * Load notifications from the server (temporary mock implementation for production)
   */
  async loadNotifications(): Promise<void> {
    try {
      console.log('🔔 NotificationService: Loading mock notifications for production');
      
      // Use mock notifications for immediate production functionality
      const mockNotifications: Notification[] = [
        {
          id: 'notif_1',
          userId: '1',
          type: NotificationType.SYSTEM_ANNOUNCEMENT,
          title: 'Welcome to Meeting Manager',
          message: 'Your enterprise meeting management system is ready to use.',
          data: {},
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          priority: NotificationPriority.NORMAL,
          actionUrl: '/meetings',
          actionText: 'View Meetings'
        },
        {
          id: 'notif_2',
          userId: '1',
          type: NotificationType.MEETING_REMINDER,
          title: 'Upcoming Meeting',
          message: 'You have meetings scheduled for today.',
          data: {},
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          updatedAt: new Date(Date.now() - 1000 * 60 * 30),
          priority: NotificationPriority.HIGH,
          actionUrl: '/meetings',
          actionText: 'Join Meeting'
        },
        {
          id: 'notif_3',
          userId: '1',
          type: NotificationType.WEEKLY_DIGEST,
          title: 'Weekly Summary',
          message: 'Your meeting summary for this week is available.',
          data: {},
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
          priority: NotificationPriority.LOW,
          actionUrl: '/meetings',
          actionText: 'View Summary'
        }
      ];
      
      this.notificationsSubject.next(mockNotifications);
      this.updateUnreadCount(mockNotifications);
      
      console.log('✅ NotificationService: Mock notifications loaded successfully');
    } catch (error) {
      console.error('❌ NotificationService: Error in mock notification setup:', error);
      this.notificationsSubject.next([]);
      this.unreadCountSubject.next(0);
    }
  }

  /**
   * Update unread notification count
   */
  private updateUnreadCount(notifications: Notification[]): void {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    this.unreadCountSubject.next(unreadCount);
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await lastValueFrom(this.http.patch(this.apiConfig.endpoints.notification(notificationId) + '/read', {}));
      
      // Update local state
      const notifications = this.notificationsSubject.value;
      const updatedNotifications = notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true, updatedAt: new Date() } : n
      );
      
      this.notificationsSubject.next(updatedNotifications);
      this.updateUnreadCount(updatedNotifications);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Update locally anyway for UX
      const notifications = this.notificationsSubject.value;
      const updatedNotifications = notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      this.notificationsSubject.next(updatedNotifications);
      this.updateUnreadCount(updatedNotifications);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      await lastValueFrom(this.http.patch(this.apiConfig.getApiUrl('notifications/mark-all-read'), {}));
      
      // Update local state
      const notifications = this.notificationsSubject.value;
      const updatedNotifications = notifications.map(n => ({ ...n, isRead: true, updatedAt: new Date() }));
      
      this.notificationsSubject.next(updatedNotifications);
      this.updateUnreadCount(updatedNotifications);
      
      this.toastService.showSuccess('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      this.toastService.showError('Failed to mark notifications as read');
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await lastValueFrom(this.http.delete(this.apiConfig.endpoints.notification(notificationId)));
      
      // Update local state
      const notifications = this.notificationsSubject.value;
      const updatedNotifications = notifications.filter(n => n.id !== notificationId);
      
      this.notificationsSubject.next(updatedNotifications);
      this.updateUnreadCount(updatedNotifications);
    } catch (error) {
      console.error('Error deleting notification:', error);
      this.toastService.showError('Failed to delete notification');
    }
  }

  /**
   * Create a new notification (for system/admin use)
   */
  async createNotification(notification: Partial<Notification>): Promise<void> {
    try {
      const newNotification = {
        ...notification,
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isRead: false
      };

      await lastValueFrom(this.http.post(this.apiConfig.endpoints.notifications(), newNotification));
      
      // Reload notifications to get the latest state
      this.loadNotifications();
      
      this.toastService.showSuccess('Notification sent successfully');
    } catch (error) {
      console.error('Error creating notification:', error);
      this.toastService.showError('Failed to send notification');
    }
  }

  /**
   * Send a meeting reminder notification
   */
  async sendMeetingReminder(meetingId: string, meetingTitle: string, startTime: Date): Promise<void> {
    const minutesUntilMeeting = Math.round((startTime.getTime() - Date.now()) / (1000 * 60));
    
    const notification: Partial<Notification> = {
      type: NotificationType.MEETING_REMINDER,
      title: 'Meeting Reminder',
      message: `Your meeting "${meetingTitle}" starts in ${minutesUntilMeeting} minutes`,
      priority: NotificationPriority.HIGH,
      actionUrl: `/meetings/${meetingId}`,
      actionText: 'Join Meeting',
      data: { meetingId, startTime }
    };

    await this.createNotification(notification);
  }

  /**
   * Send an action item due notification
   */
  async sendActionItemDueNotification(actionItemId: string, title: string, dueDate: Date): Promise<void> {
    const notification: Partial<Notification> = {
      type: NotificationType.ACTION_ITEM_DUE,
      title: 'Action Item Due Soon',
      message: `Action item "${title}" is due soon`,
      priority: NotificationPriority.NORMAL,
      actionUrl: `/action-items/${actionItemId}`,
      actionText: 'View Details',
      data: { actionItemId, dueDate }
    };

    await this.createNotification(notification);
  }

  /**
   * Get notification by ID
   */
  getNotification(id: string): Observable<Notification | undefined> {
    return this.notifications$.pipe(
      map(notifications => notifications.find(n => n.id === id))
    );
  }

  /**
   * Get notifications by type
   */
  getNotificationsByType(type: NotificationType): Observable<Notification[]> {
    return this.notifications$.pipe(
      map(notifications => notifications.filter(n => n.type === type))
    );
  }

  /**
   * Get unread notifications
   */
  getUnreadNotifications(): Observable<Notification[]> {
    return this.notifications$.pipe(
      map(notifications => notifications.filter(n => !n.isRead))
    );
  }

  /**
   * Get current unread count
   */
  getUnreadCount(): number {
    return this.unreadCountSubject.value;
  }

  /**
   * Check if browser notifications are supported and request permission
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  /**
   * Show browser push notification
   */
  async showPushNotification(notification: Notification): Promise<void> {
    const hasPermission = await this.requestNotificationPermission();
    if (!hasPermission) return;

    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/assets/icons/icon-192x192.png',
      badge: '/assets/icons/icon-72x72.png',
      tag: notification.id,
      requireInteraction: notification.priority === NotificationPriority.URGENT,
      data: notification.data
    });

    browserNotification.onclick = () => {
      window.focus();
      if (notification.actionUrl) {
        window.location.href = notification.actionUrl;
      }
      browserNotification.close();
    };

    // Auto-close after 5 seconds for non-urgent notifications
    if (notification.priority !== NotificationPriority.URGENT) {
      setTimeout(() => browserNotification.close(), 5000);
    }
  }

  /**
   * Generate a unique ID for notifications
   */
  private generateId(): string {
    return 'notif_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }

  /**
   * Get default notification triggers
   */
  getNotificationTriggers(): NotificationTrigger[] {
    return this.defaultTriggers;
  }

  /**
   * Update notification trigger settings
   */
  async updateNotificationTrigger(triggerId: string, updates: Partial<NotificationTrigger>): Promise<void> {
    try {
      await lastValueFrom(this.http.patch(this.apiConfig.getApiUrl(`notifications/triggers/${triggerId}`), updates));
      this.toastService.showSuccess('Notification settings updated');
    } catch (error) {
      console.error('Error updating notification trigger:', error);
      this.toastService.showError('Failed to update notification settings');
    }
  }
}
