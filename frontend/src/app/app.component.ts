

import { Component, OnDestroy, inject, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ButtonModule } from 'primeng/button';
import { AiChatComponent } from './ai-chat/ai-chat.component';
import { HeaderComponent } from './shared/header/header.component';
import { MeetingService } from './meetings/meeting.service';
import { AuthService } from './auth/auth.service';
import { Meeting, FilterConfig } from './meetings/meeting.model';
import { PageType } from './models/chat.model';
import { filter, takeUntil, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ButtonModule,
    AiChatComponent,
    HeaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  title = 'Meeting Manager - Enterprise Application';
  currentPageType: PageType = 'home';

  meetings: Meeting[] = [];
  searchQuery = '';
  filterConfig: FilterConfig = {
    dateRange: { start: '', end: '' },
    meetingType: [],
    participants: [],
    hasActionItems: false,
    hasRecording: false
  };

  private readonly destroy$ = new Subject<void>();
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  public authService = inject(AuthService); // Made public for template access
  private meetingService?: MeetingService; // Lazy-loaded service
  private meetingServiceInitialized = false; // Track initialization state

  constructor() {
    this.setupRouterTracking();
    this.setupAuthenticatedDataLoading();
  }

  private setupAuthenticatedDataLoading(): void {
    // Only load meetings when user is authenticated
    this.authService.isAuthenticated$
      .pipe(
        takeUntil(this.destroy$),
        switchMap(isAuthenticated => {
          if (isAuthenticated && !this.meetingServiceInitialized) {
            console.log('🔓 User authenticated, initializing services...');
            
            // Lazy-load MeetingService only once when authenticated
            if (!this.meetingService) {
              this.meetingService = this.injector.get(MeetingService);
              console.log('🔧 MeetingService lazy-loaded after authentication');
            }
            
            // Subscribe to meeting updates only once
            this.meetingService.meetingsUpdated$
              .pipe(takeUntil(this.destroy$))
              .subscribe((updated) => {
                if (updated) {
                  console.log('Meetings updated, refreshing app component meetings...');
                  this.loadMeetings();
                }
              });
            
            // Mark as initialized to prevent duplicate initialization
            this.meetingServiceInitialized = true;
            
            // Load initial meetings
            this.loadMeetings();
          } else if (!isAuthenticated) {
            console.log('🔒 User not authenticated, clearing meetings...');
            this.meetings = []; // Clear meetings when not authenticated
            this.meetingServiceInitialized = false; // Reset for next login
          }
          return [];
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupRouterTracking(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.updatePageTypeFromRoute(event.url);
        }
      });
    
    // Set initial page type
    this.updatePageTypeFromRoute(this.router.url);
  }

  private updatePageTypeFromRoute(url: string): void {
    if (url === '/' || url === '/home') {
      this.currentPageType = 'home';
    } else if (url.includes('/meetings')) {
      this.currentPageType = url.includes('/meetings/') ? 'detail' : 'meetings';
    } else if (url.includes('/settings')) {
      this.currentPageType = 'settings';
    } else {
      this.currentPageType = 'home';
    }
  }

  getCurrentPageType(): PageType {
    return this.currentPageType;
  }

  getCurrentContext(): string {
    switch (this.currentPageType) {
      case 'home':
        return 'Dashboard with meeting overview and quick actions';
      case 'meetings':
        return `Meeting list with ${this.meetings.length} meetings`;
      case 'detail':
        return 'Individual meeting details and action items';
      case 'settings':
        return 'Application settings and configuration';
      default:
        return 'Meeting Manager application';
    }
  }

  loadMeetings() {
    if (!this.meetingService) {
      console.log('🚫 MeetingService not initialized, skipping load');
      return;
    }
    
    this.meetingService.getMeetings().subscribe({
      next: data => {
        this.meetings = data;
      },
      error: _err => {
        // handle error if needed
      }
    });
  }

  onViewAllMeetings() {
    // Navigate to meetings list or handle as needed
    // Example: this.router.navigate(['/meetings']);
  }

  onMeetingSelect(_meeting: Meeting) {
    // Navigate to meeting details or handle as needed
    // Example: this.router.navigate(['/meetings', meeting.id]);
  }

  onSearchChange(query: string) {
    this.searchQuery = query;
  }

  onFilterChange(config: FilterConfig) {
    this.filterConfig = config;
  }
}
