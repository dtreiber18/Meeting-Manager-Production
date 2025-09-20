import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-simple-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="settings-container">
      <mat-tab-group [selectedIndex]="selectedTabIndex" (selectedTabChange)="onTabChange($event)">
        <!-- General Settings Tab -->
        <mat-tab label="General Settings">
          <mat-card class="settings-card">
            <mat-card-header>
              <mat-card-title>Account Information</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Name</mat-label>
                  <input matInput [(ngModel)]="userInfo.name" placeholder="Enter your name">
                </mat-form-field>
                
                <mat-form-field appearance="outline">
                  <mat-label>Email</mat-label>
                  <input matInput [(ngModel)]="userInfo.email" placeholder="Enter your email">
                </mat-form-field>
                
                <mat-form-field appearance="outline">
                  <mat-label>Current Password</mat-label>
                  <input matInput type="password" [(ngModel)]="userInfo.currentPassword" placeholder="Current password">
                </mat-form-field>
                
                <mat-form-field appearance="outline">
                  <mat-label>New Password</mat-label>
                  <input matInput type="password" [(ngModel)]="userInfo.newPassword" placeholder="New password">
                </mat-form-field>
              </div>
              
              <div class="actions">
                <button mat-raised-button color="primary" (click)="saveAccount()">
                  Save Changes
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-tab>

        <!-- Calendar Tab -->
        <mat-tab label="Calendar">
          <mat-card class="settings-card">
            <mat-card-header>
              <mat-card-title>Calendar Settings</mat-card-title>
              <mat-card-subtitle>Configure calendar integration and preferences</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Default Calendar</mat-label>
                  <mat-select [(ngModel)]="calendarSettings.defaultCalendar">
                    <mat-option value="primary">Primary Calendar</mat-option>
                    <mat-option value="work">Work Calendar</mat-option>
                    <mat-option value="personal">Personal Calendar</mat-option>
                  </mat-select>
                </mat-form-field>
                
                <mat-form-field appearance="outline">
                  <mat-label>Time Zone</mat-label>
                  <mat-select [(ngModel)]="calendarSettings.timezone">
                    <mat-option value="America/New_York">Eastern Time</mat-option>
                    <mat-option value="America/Chicago">Central Time</mat-option>
                    <mat-option value="America/Denver">Mountain Time</mat-option>
                    <mat-option value="America/Los_Angeles">Pacific Time</mat-option>
                  </mat-select>
                </mat-form-field>
                
                <mat-form-field appearance="outline">
                  <mat-label>Default Meeting Duration (minutes)</mat-label>
                  <input matInput type="number" [(ngModel)]="calendarSettings.defaultDuration" placeholder="60">
                </mat-form-field>
              </div>
              
              <div class="toggle-options">
                <div class="toggle-item">
                  <mat-slide-toggle [(ngModel)]="calendarSettings.autoSync">
                    Auto-sync with calendar
                  </mat-slide-toggle>
                </div>
                <div class="toggle-item">
                  <mat-slide-toggle [(ngModel)]="calendarSettings.showWeekends">
                    Show weekends
                  </mat-slide-toggle>
                </div>
                <div class="toggle-item">
                  <mat-slide-toggle [(ngModel)]="calendarSettings.enableReminders">
                    Enable meeting reminders
                  </mat-slide-toggle>
                </div>
              </div>
              
              <div class="actions">
                <button mat-raised-button color="primary" (click)="saveCalendarSettings()">
                  Save Calendar Settings
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-tab>

        <!-- User Preferences Tab -->
        <mat-tab label="User Preferences">
          <mat-card class="settings-card">
            <mat-card-header>
              <mat-card-title>User Preferences</mat-card-title>
              <mat-card-subtitle>Customize your experience</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Language</mat-label>
                  <mat-select [(ngModel)]="preferences.language">
                    <mat-option value="en">English</mat-option>
                    <mat-option value="es">Spanish</mat-option>
                    <mat-option value="fr">French</mat-option>
                    <mat-option value="de">German</mat-option>
                  </mat-select>
                </mat-form-field>
                
                <mat-form-field appearance="outline">
                  <mat-label>Theme</mat-label>
                  <mat-select [(ngModel)]="preferences.theme">
                    <mat-option value="light">Light</mat-option>
                    <mat-option value="dark">Dark</mat-option>
                    <mat-option value="auto">Auto</mat-option>
                  </mat-select>
                </mat-form-field>
                
                <mat-form-field appearance="outline">
                  <mat-label>Date Format</mat-label>
                  <mat-select [(ngModel)]="preferences.dateFormat">
                    <mat-option value="MM/DD/YYYY">MM/DD/YYYY</mat-option>
                    <mat-option value="DD/MM/YYYY">DD/MM/YYYY</mat-option>
                    <mat-option value="YYYY-MM-DD">YYYY-MM-DD</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
              
              <div class="toggle-options">
                <div class="toggle-item">
                  <mat-slide-toggle [(ngModel)]="preferences.emailNotifications">
                    Email notifications
                  </mat-slide-toggle>
                </div>
                <div class="toggle-item">
                  <mat-slide-toggle [(ngModel)]="preferences.pushNotifications">
                    Push notifications
                  </mat-slide-toggle>
                </div>
                <div class="toggle-item">
                  <mat-slide-toggle [(ngModel)]="preferences.autoSave">
                    Auto-save changes
                  </mat-slide-toggle>
                </div>
              </div>
              
              <div class="actions">
                <button mat-raised-button color="primary" (click)="savePreferences()">
                  Save Preferences
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-tab>

        <!-- Data Sources Tab -->
        <mat-tab label="Data Sources">
          <mat-card class="settings-card">
            <mat-card-header>
              <mat-card-title>Information Sources</mat-card-title>
              <mat-card-subtitle>Configure where to get meeting information from</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="source-list">
                <div *ngFor="let source of sources" class="source-item">
                  <mat-card class="source-card">
                    <mat-card-content>
                      <div class="source-header">
                        <mat-icon>{{ getSourceIcon(source.type) }}</mat-icon>
                        <h3>{{ source.name }}</h3>
                        <mat-slide-toggle [(ngModel)]="source.enabled"></mat-slide-toggle>
                      </div>
                      
                      <div *ngIf="source.enabled" class="source-config">
                        <mat-form-field appearance="outline">
                          <mat-label>API URL</mat-label>
                          <input matInput [(ngModel)]="source.apiUrl" placeholder="Enter API URL">
                        </mat-form-field>
                        
                        <mat-form-field appearance="outline">
                          <mat-label>API Key</mat-label>
                          <input matInput [(ngModel)]="source.apiKey" placeholder="Enter API Key">
                        </mat-form-field>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </div>
              
              <div class="actions">
                <button mat-raised-button color="primary" (click)="addSource()">
                  <mat-icon>add</mat-icon>
                  Add Source
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-tab>

        <!-- Data Destinations Tab -->
        <mat-tab label="Data Destinations">
          <mat-card class="settings-card">
            <mat-card-header>
              <mat-card-title>Information Destinations</mat-card-title>
              <mat-card-subtitle>Configure where to send meeting information to</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="destination-list">
                <div *ngFor="let destination of destinations" class="destination-item">
                  <mat-card class="destination-card">
                    <mat-card-content>
                      <div class="destination-header">
                        <mat-icon>{{ getDestinationIcon(destination.type) }}</mat-icon>
                        <h3>{{ destination.name }}</h3>
                        <mat-slide-toggle [(ngModel)]="destination.enabled"></mat-slide-toggle>
                      </div>
                      
                      <div *ngIf="destination.enabled" class="destination-config">
                        <mat-form-field appearance="outline">
                          <mat-label>API URL</mat-label>
                          <input matInput [(ngModel)]="destination.apiUrl" placeholder="Enter API URL">
                        </mat-form-field>
                        
                        <mat-form-field appearance="outline">
                          <mat-label>API Key</mat-label>
                          <input matInput [(ngModel)]="destination.apiKey" placeholder="Enter API Key">
                        </mat-form-field>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </div>
              
              <div class="actions">
                <button mat-raised-button color="primary" (click)="addDestination()">
                  <mat-icon>add</mat-icon>
                  Add Destination
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .settings-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    .settings-card {
      margin: 16px 0;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .toggle-options {
      margin: 24px 0;
    }

    .toggle-item {
      margin: 12px 0;
      display: flex;
      align-items: center;
    }

    .actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    .source-list, .destination-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .source-card, .destination-card {
      margin: 8px 0;
    }

    .source-header, .destination-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .source-header h3, .destination-header h3 {
      flex: 1;
      margin: 0;
    }

    .source-config, .destination-config {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    mat-icon {
      color: #666;
    }
  `]
})
export class SimpleSettingsComponent implements OnInit {
  selectedTabIndex = 0;

  userInfo = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    currentPassword: '',
    newPassword: ''
  };

  calendarSettings = {
    defaultCalendar: 'primary',
    timezone: 'America/New_York',
    defaultDuration: 60,
    autoSync: true,
    showWeekends: false,
    enableReminders: true
  };

  preferences = {
    language: 'en',
    theme: 'light',
    dateFormat: 'MM/DD/YYYY',
    emailNotifications: true,
    pushNotifications: false,
    autoSave: true
  };

  sources = [
    {
      name: 'Calendar API',
      type: 'calendar',
      enabled: true,
      apiUrl: 'https://api.calendar.example.com',
      apiKey: '***'
    },
    {
      name: 'Fathom AI',
      type: 'recording',
      enabled: false,
      apiUrl: '',
      apiKey: ''
    }
  ];

  destinations = [
    {
      name: 'Notion',
      type: 'notion',
      enabled: true,
      apiUrl: 'https://api.notion.com',
      apiKey: '***'
    },
    {
      name: 'Asana',
      type: 'task',
      enabled: false,
      apiUrl: '',
      apiKey: ''
    }
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit() {
    // Set the selected tab based on the route
    const url = this.router.url;
    if (url.includes('/settings/calendar')) {
      this.selectedTabIndex = 1;
    } else if (url.includes('/settings/preferences')) {
      this.selectedTabIndex = 2;
    } else {
      this.selectedTabIndex = 0;
    }
  }

  onTabChange(event: { index: number }) {
    const routes = ['/settings', '/settings/calendar', '/settings/preferences', '/settings', '/settings'];
    this.router.navigate([routes[event.index]]);
  }

  saveAccount() {
    console.log('Saving account info:', this.userInfo);
    // Implement save logic
  }

  saveCalendarSettings() {
    console.log('Saving calendar settings:', this.calendarSettings);
    // Implement save logic
  }

  savePreferences() {
    console.log('Saving preferences:', this.preferences);
    // Implement save logic
  }

  addSource() {
    this.sources.push({
      name: 'New Source',
      type: 'api',
      enabled: false,
      apiUrl: '',
      apiKey: ''
    });
  }

  addDestination() {
    this.destinations.push({
      name: 'New Destination',
      type: 'api',
      enabled: false,
      apiUrl: '',
      apiKey: ''
    });
  }

  getSourceIcon(type: string): string {
    switch (type) {
      case 'calendar': return 'event';
      case 'recording': return 'videocam';
      case 'email': return 'email';
      default: return 'source';
    }
  }

  getDestinationIcon(type: string): string {
    switch (type) {
      case 'notion': return 'note';
      case 'task': return 'task_alt';
      case 'email': return 'email';
      default: return 'send';
    }
  }
}
