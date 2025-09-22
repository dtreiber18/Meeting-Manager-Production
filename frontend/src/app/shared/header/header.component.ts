import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService, User } from '../../auth/auth.service';
import { RoleService } from '../services/role.service';
import { NotificationService, Notification } from '../services/notification.service';
import { NotificationsDropdownComponent } from '../notifications-dropdown/notifications-dropdown.component';
import { Observable, Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDividerModule,
    NotificationsDropdownComponent
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss', './header-override.css'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  
  currentUser$: Observable<User | null>;
  isAuthenticated$: Observable<boolean>;
  isSystemAdmin$: Observable<boolean>;
  isAssistantOrAbove$: Observable<boolean>;
  currentRoute = '';
  
  // Navigation items
  navigationItems = [
    {
      icon: 'dashboard',
      label: 'Dashboard',
      route: '/',
      tooltip: 'Go to dashboard'
    },
    {
      icon: 'event',
      label: 'Meetings',
      route: '/meetings',
      tooltip: 'View all meetings',
      children: [
        { label: 'All Meetings', route: '/meetings', icon: 'list' },
        { label: 'Previous Meetings', route: '/meetings/previous', icon: 'history' },
        { label: 'New Meeting', route: '/meetings/new', icon: 'add' }
      ]
    }
  ];

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly roleService: RoleService,
    private readonly notificationService: NotificationService
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.isSystemAdmin$ = this.roleService.isSystemAdmin();
    this.isAssistantOrAbove$ = this.roleService.isAssistantOrAbove();
  }

  ngOnInit(): void {
    // Track current route for highlighting active navigation
    this.router.events
      .pipe(
        filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
      });

    // Set initial route
    this.currentRoute = this.router.url;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isActiveRoute(route: string): boolean {
    if (route === '/') {
      return this.currentRoute === '/' || this.currentRoute === '';
    }
    return this.currentRoute.startsWith(route);
  }

  getUserDisplayName(user: User | null): string {
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`;
  }

  getUserInitials(user: User | null): string {
    if (!user) return '';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  getNotificationCount(): number {
    return this.notificationService.getUnreadCount();
  }

  onLogout(): void {
    this.authService.logout();
  }

  navigateToOrganization(): void {
    this.router.navigate(['/settings/organization']);
  }

  onNotificationClick(notification: Notification): void {
    // Navigate to action URL if available
    if (notification.actionUrl) {
      this.router.navigate([notification.actionUrl]);
    }
  }

  onNotificationsMarkAllRead(): void {
    // This is handled by the notification service in the dropdown component
    console.log('All notifications marked as read');
  }

  onNotificationsClick(): void {
    // This method is no longer used since we're using mat-menu trigger
    // But keeping it for backward compatibility
    console.log('Show notifications panel');
  }

  onHelpClick(): void {
    this.router.navigate(['/help']);
  }
}
