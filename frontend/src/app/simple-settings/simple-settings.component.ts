import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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
      <mat-tab-group>
        <!-- Account Info Tab -->
        <mat-tab label="Account Info">
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

        <!-- Get Info From Tab -->
        <mat-tab label="Get Info From">
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

        <!-- Send Info To Tab -->
        <mat-tab label="Send Info To">
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
export class SimpleSettingsComponent {
  userInfo = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    currentPassword: '',
    newPassword: ''
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

  saveAccount() {
    console.log('Saving account info:', this.userInfo);
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
