

import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ButtonModule } from 'primeng/button';
import { AiChatComponent } from './ai-chat/ai-chat.component';
import { MeetingService } from './meetings/meeting.service';
import { Meeting, FilterConfig } from './meetings/meeting.model';
import { PageType } from './models/chat.model';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ButtonModule,
    AiChatComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
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

  constructor(private meetingService: MeetingService, private router: Router) {
    this.loadMeetings();
    this.setupRouterTracking();
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
    this.meetingService.getMeetings().subscribe({
      next: data => {
        this.meetings = data;
      },
      error: err => {
        // handle error if needed
      }
    });
  }

  onViewAllMeetings() {
    // Navigate to meetings list or handle as needed
    // Example: this.router.navigate(['/meetings']);
  }

  onMeetingSelect(meeting: Meeting) {
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
