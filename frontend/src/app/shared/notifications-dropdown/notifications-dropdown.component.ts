import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { NotificationService, Notification, NotificationType, NotificationPriority } from '../services/notification.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-notifications-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatDividerModule,
    MatTooltipModule,
    MatListModule,
    MatCardModule
  ],
  templateUrl: './notifications-dropdown.component.html',
  styleUrls: ['./notifications-dropdown.component.scss']
})
export class NotificationsDropdownComponent implements OnInit, OnDestroy {
  @Input() maxDisplayItems: number = 5;
  @Output() notificationClick = new EventEmitter<Notification>();
  @Output() markAllAsRead = new EventEmitter<void>();

  private destroy$ = new Subject<void>();
  
  notifications$: Observable<Notification[]>;
  unreadCount$: Observable<number>;
  displayNotifications: Notification[] = [];
  hasMoreNotifications = false;

  constructor(private notificationService: NotificationService) {
    this.notifications$ = this.notificationService.notifications$;
    this.unreadCount$ = this.notificationService.unreadCount$;
  }

  ngOnInit(): void {
    // Subscribe to notifications and limit display
    this.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        // Sort by creation date (newest first) and limit display
        const sortedNotifications = notifications
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        this.displayNotifications = sortedNotifications.slice(0, this.maxDisplayItems);
        this.hasMoreNotifications = sortedNotifications.length > this.maxDisplayItems;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Get the icon for notification type
   */
  getNotificationIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.MEETING_REMINDER:
        return 'schedule';
      case NotificationType.MEETING_INVITATION:
        return 'event';
      case NotificationType.MEETING_UPDATED:
        return 'edit';
      case NotificationType.MEETING_CANCELLED:
        return 'event_busy';
      case NotificationType.ACTION_ITEM_ASSIGNED:
        return 'assignment';
      case NotificationType.ACTION_ITEM_DUE:
        return 'assignment_late';
      case NotificationType.ACTION_ITEM_OVERDUE:
        return 'assignment_turned_in';
      case NotificationType.SYSTEM_ANNOUNCEMENT:
        return 'campaign';
      case NotificationType.USER_MENTION:
        return 'alternate_email';
      case NotificationType.DOCUMENT_SHARED:
        return 'folder_shared';
      case NotificationType.WEEKLY_DIGEST:
        return 'summarize';
      default:
        return 'notifications';
    }
  }

  /**
   * Get the color class for notification priority
   */
  getPriorityClass(priority: NotificationPriority): string {
    switch (priority) {
      case NotificationPriority.LOW:
        return 'priority-low';
      case NotificationPriority.NORMAL:
        return 'priority-normal';
      case NotificationPriority.HIGH:
        return 'priority-high';
      case NotificationPriority.URGENT:
        return 'priority-urgent';
      default:
        return 'priority-normal';
    }
  }

  /**
   * Format relative time
   */
  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return new Date(date).toLocaleDateString();
    }
  }

  /**
   * Handle notification click
   */
  onNotificationClick(notification: Notification, event: Event): void {
    event.stopPropagation();
    
    // Mark as read if not already read
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id);
    }

    // Emit click event
    this.notificationClick.emit(notification);

    // Navigate to action URL if available
    if (notification.actionUrl) {
      // You might want to inject Router here and navigate programmatically
      // For now, we'll let the parent component handle navigation
    }
  }

  /**
   * Mark individual notification as read
   */
  onMarkAsRead(notification: Notification, event: Event): void {
    event.stopPropagation();
    this.notificationService.markAsRead(notification.id);
  }

  /**
   * Delete notification
   */
  onDeleteNotification(notification: Notification, event: Event): void {
    event.stopPropagation();
    this.notificationService.deleteNotification(notification.id);
  }

  /**
   * Mark all notifications as read
   */
  onMarkAllAsRead(): void {
    this.notificationService.markAllAsRead();
    this.markAllAsRead.emit();
  }

  /**
   * Check if there are any notifications
   */
  hasNotifications(): boolean {
    return this.displayNotifications.length > 0;
  }

  /**
   * Get unread notifications count
   */
  getUnreadCount(): number {
    return this.displayNotifications.filter(n => !n.isRead).length;
  }

  /**
   * Track by function for ngFor performance
   */
  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id;
  }
}