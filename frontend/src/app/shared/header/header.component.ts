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
    MatDividerModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss', './header-override.css'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentUser$: Observable<User | null>;
  isAuthenticated$: Observable<boolean>;
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
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.isAuthenticated$ = this.authService.isAuthenticated$;
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
    // TODO: Replace with actual notification count from service
    return 3;
  }

  onLogout(): void {
    this.authService.logout();
  }

  navigateToProfile(): void {
    // TODO: Implement user profile page
    console.log('Navigate to user profile');
  }

  navigateToOrganization(): void {
    // TODO: Implement organization management page
    console.log('Navigate to organization management');
  }

  onNotificationsClick(): void {
    // TODO: Implement notifications functionality
    console.log('Show notifications');
  }

  onHelpClick(): void {
    // TODO: Implement help/documentation
    console.log('Show help');
  }
}
