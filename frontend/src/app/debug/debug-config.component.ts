import { Component, OnInit } from '@angular/core';
import { ApiConfigService } from '../core/services/api-config.service';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

/**
 * Debugging component to verify environment and API configuration
 * This can be temporarily added to routes to debug issues
 */
@Component({
  selector: 'app-debug-config',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; font-family: monospace;">
      <h2>🔧 Configuration Debug</h2>
      
      <h3>Environment Check:</h3>
      <pre>{{ environmentInfo | json }}</pre>
      
      <h3>API Configuration:</h3>
      <pre>{{ apiConfig | json }}</pre>
      
      <h3>Authentication State:</h3>
      <pre>{{ authState | json }}</pre>
      
      <h3>Available Endpoints:</h3>
      <ul>
        <li>Meetings: {{ endpoints.meetings }}</li>
        <li>Meeting(123): {{ endpoints.meeting }}</li>
        <li>User Profile: {{ endpoints.userProfile }}</li>
        <li>Notifications: {{ endpoints.notifications }}</li>
        <li>Settings: {{ endpoints.settings }}</li>
        <li>Chat: {{ endpoints.chat }}</li>
      </ul>
      
      <button (click)="logEndpoints()" style="padding: 10px; margin: 10px;">
        Log All Endpoints to Console
      </button>
    </div>
  `
})
export class DebugConfigComponent implements OnInit {
  environmentInfo: any = {};
  apiConfig: any = {};
  authState: any = {};
  endpoints: any = {};

  constructor(
    private apiConfigService: ApiConfigService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Get environment info
    this.environmentInfo = environment;

    // Get API config info
    this.apiConfig = {
      baseUrl: this.apiConfigService.getBaseApiUrl(),
      isLocalhost: window.location.hostname === 'localhost',
      currentOrigin: window.location.origin
    };

    // Get auth state
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.authState = {
        isAuthenticated: isAuth,
        currentUser: this.authService.getCurrentUser()
      };
    });

    // Get sample endpoints
    this.endpoints = {
      meetings: this.apiConfigService.endpoints.meetings(),
      meeting: this.apiConfigService.endpoints.meeting('123'),
      userProfile: this.apiConfigService.endpoints.userProfile(),
      notifications: this.apiConfigService.endpoints.notifications(),
      settings: this.apiConfigService.endpoints.settings(),
      chat: this.apiConfigService.endpoints.chat()
    };
  }

  logEndpoints() {
    this.apiConfigService.logAvailableEndpoints();
  }
}