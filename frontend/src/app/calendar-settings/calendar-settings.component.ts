import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../auth/auth.service';
import { UserService, UserProfile } from '../services/user.service';

interface CalendarProvider {
  id: string;
  name: string;
  icon: string;
  description: string;
  connected: boolean;
}

@Component({
  selector: 'app-calendar-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    MatListModule
  ],
  template: `
    <div class="calendar-settings-container">
      <mat-card class="calendar-settings-card">
        <mat-card-header>
          <div mat-card-avatar class="calendar-avatar">
            <mat-icon>calendar_today</mat-icon>
          </div>
          <mat-card-title>Calendar Settings</mat-card-title>
          <mat-card-subtitle>Manage your calendar integration and availability preferences</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="calendarForm" (ngSubmit)="onSaveSettings()">
            
            <!-- Calendar Integration Section -->
            <div class="section">
              <h3 class="section-title">
                <mat-icon>sync</mat-icon>
                Calendar Integration
              </h3>
              
              <div class="calendar-providers">
                <div *ngFor="let provider of calendarProviders" class="provider-item">
                  <div class="provider-info">
                    <mat-icon [class]="'provider-icon ' + provider.id">{{ provider.icon }}</mat-icon>
                    <div class="provider-details">
                      <div class="provider-name">{{ provider.name }}</div>
                      <div class="provider-description">{{ provider.description }}</div>
                    </div>
                  </div>
                  <div class="provider-actions">
                    <button *ngIf="!provider.connected" 
                            mat-raised-button 
                            color="primary" 
                            (click)="connectProvider(provider)">
                      Connect
                    </button>
                    <div *ngIf="provider.connected" class="connected-status">
                      <mat-icon color="primary">check_circle</mat-icon>
                      <span>Connected</span>
                      <button mat-button color="warn" (click)="disconnectProvider(provider)">
                        Disconnect
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <mat-slide-toggle formControlName="calendarSync" class="sync-toggle">
                <div class="toggle-content">
                  <span class="toggle-label">Enable Calendar Sync</span>
                  <span class="toggle-description">Automatically sync meetings with your connected calendars</span>
                </div>
              </mat-slide-toggle>
            </div>

            <mat-divider></mat-divider>

            <!-- Working Hours Section -->
            <div class="section">
              <h3 class="section-title">
                <mat-icon>schedule</mat-icon>
                Working Hours
              </h3>
              
              <mat-slide-toggle formControlName="workingHoursEnabled" class="toggle-option">
                <div class="toggle-content">
                  <span class="toggle-label">Set Working Hours</span>
                  <span class="toggle-description">Define your availability for scheduling meetings</span>
                </div>
              </mat-slide-toggle>

              <div class="working-hours-config" *ngIf="calendarForm.get('workingHoursEnabled')?.value">
                <div class="form-row">
                  <mat-form-field appearance="outline" class="time-field">
                    <mat-label>Start Time</mat-label>
                    <mat-select formControlName="workingHoursStart">
                      <mat-option *ngFor="let time of timeOptions" [value]="time.value">
                        {{ time.label }}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="time-field">
                    <mat-label>End Time</mat-label>
                    <mat-select formControlName="workingHoursEnd">
                      <mat-option *ngFor="let time of timeOptions" [value]="time.value">
                        {{ time.label }}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <div class="working-days">
                  <h4>Working Days</h4>
                  <div class="days-grid">
                    <mat-slide-toggle *ngFor="let day of weekDays" 
                                      [formControlName]="'workingDay' + day.value"
                                      class="day-toggle">
                      {{ day.label }}
                    </mat-slide-toggle>
                  </div>
                </div>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Meeting Preferences Section -->
            <div class="section">
              <h3 class="section-title">
                <mat-icon>group</mat-icon>
                Meeting Preferences
              </h3>
              
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Default Meeting Duration</mat-label>
                  <mat-select formControlName="defaultMeetingDuration">
                    <mat-option value="15">15 minutes</mat-option>
                    <mat-option value="30">30 minutes</mat-option>
                    <mat-option value="45">45 minutes</mat-option>
                    <mat-option value="60">1 hour</mat-option>
                    <mat-option value="90">1.5 hours</mat-option>
                    <mat-option value="120">2 hours</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Buffer Time Between Meetings</mat-label>
                  <mat-select formControlName="bufferTime">
                    <mat-option value="0">No buffer</mat-option>
                    <mat-option value="5">5 minutes</mat-option>
                    <mat-option value="10">10 minutes</mat-option>
                    <mat-option value="15">15 minutes</mat-option>
                    <mat-option value="30">30 minutes</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="toggle-options">
                <mat-slide-toggle formControlName="autoAcceptMeetings" class="toggle-option">
                  <div class="toggle-content">
                    <span class="toggle-label">Auto-Accept Meeting Invitations</span>
                    <span class="toggle-description">Automatically accept meetings from team members</span>
                  </div>
                </mat-slide-toggle>

                <mat-slide-toggle formControlName="showBusyTime" class="toggle-option">
                  <div class="toggle-content">
                    <span class="toggle-label">Show Busy Time to Others</span>
                    <span class="toggle-description">Allow others to see when you're unavailable</span>
                  </div>
                </mat-slide-toggle>

                <mat-slide-toggle formControlName="allowDoubleBooking" class="toggle-option">
                  <div class="toggle-content">
                    <span class="toggle-label">Allow Double Booking</span>
                    <span class="toggle-description">Permit overlapping meetings (not recommended)</span>
                  </div>
                </mat-slide-toggle>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Notification Settings Section -->
            <div class="section">
              <h3 class="section-title">
                <mat-icon>notifications_active</mat-icon>
                Meeting Notifications
              </h3>
              
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Reminder Time</mat-label>
                  <mat-select formControlName="reminderTime">
                    <mat-option value="0">No reminder</mat-option>
                    <mat-option value="5">5 minutes before</mat-option>
                    <mat-option value="10">10 minutes before</mat-option>
                    <mat-option value="15">15 minutes before</mat-option>
                    <mat-option value="30">30 minutes before</mat-option>
                    <mat-option value="60">1 hour before</mat-option>
                    <mat-option value="1440">1 day before</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Secondary Reminder</mat-label>
                  <mat-select formControlName="secondaryReminderTime">
                    <mat-option value="0">No secondary reminder</mat-option>
                    <mat-option value="1">1 minute before</mat-option>
                    <mat-option value="2">2 minutes before</mat-option>
                    <mat-option value="5">5 minutes before</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="toggle-options">
                <mat-slide-toggle formControlName="emailReminders" class="toggle-option">
                  <div class="toggle-content">
                    <span class="toggle-label">Email Reminders</span>
                    <span class="toggle-description">Receive meeting reminders via email</span>
                  </div>
                </mat-slide-toggle>

                <mat-slide-toggle formControlName="popupReminders" class="toggle-option">
                  <div class="toggle-content">
                    <span class="toggle-label">Popup Reminders</span>
                    <span class="toggle-description">Show browser notifications for upcoming meetings</span>
                  </div>
                </mat-slide-toggle>

                <mat-slide-toggle formControlName="soundNotifications" class="toggle-option">
                  <div class="toggle-content">
                    <span class="toggle-label">Sound Notifications</span>
                    <span class="toggle-description">Play sound when meetings are starting</span>
                  </div>
                </mat-slide-toggle>
              </div>
            </div>

          </form>
        </mat-card-content>

        <mat-card-actions align="end">
          <button mat-button type="button" (click)="onCancel()" [disabled]="isSaving">
            Cancel
          </button>
          <button mat-raised-button 
                  color="primary" 
                  (click)="onSaveSettings()"
                  [disabled]="isSaving">
            <mat-spinner diameter="20" *ngIf="isSaving"></mat-spinner>
            <span *ngIf="!isSaving">Save Settings</span>
            <span *ngIf="isSaving">Saving...</span>
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .calendar-settings-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }

    .calendar-settings-card {
      margin-bottom: 24px;
    }

    .calendar-avatar {
      background-color: #1976d2;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .section {
      margin: 24px 0;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      color: #1976d2;
      font-weight: 500;
    }

    .calendar-providers {
      margin-bottom: 24px;
    }

    .provider-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      margin-bottom: 12px;
    }

    .provider-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .provider-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .provider-icon.google {
      color: #4285f4;
    }

    .provider-icon.outlook {
      color: #0078d4;
    }

    .provider-icon.apple {
      color: #007aff;
    }

    .provider-details {
      flex: 1;
    }

    .provider-name {
      font-weight: 500;
      color: #333;
    }

    .provider-description {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }

    .provider-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .connected-status {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #4caf50;
    }

    .sync-toggle {
      width: 100%;
      margin-top: 16px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .half-width {
      flex: 1;
    }

    .time-field {
      min-width: 150px;
    }

    .working-hours-config {
      margin-top: 16px;
      padding: 16px;
      background-color: #f9f9f9;
      border-radius: 8px;
    }

    .working-days {
      margin-top: 16px;
    }

    .working-days h4 {
      margin-bottom: 12px;
      color: #666;
      font-size: 14px;
      font-weight: 500;
    }

    .days-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 8px;
    }

    .day-toggle {
      justify-self: start;
    }

    .toggle-options {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .toggle-option {
      width: 100%;
    }

    .toggle-content {
      display: flex;
      flex-direction: column;
      margin-left: 12px;
    }

    .toggle-label {
      font-weight: 500;
      color: #333;
    }

    .toggle-description {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }

    mat-divider {
      margin: 24px 0;
    }

    @media (max-width: 768px) {
      .calendar-settings-container {
        padding: 16px;
      }

      .form-row {
        flex-direction: column;
        gap: 0;
      }

      .provider-item {
        flex-direction: column;
        gap: 12px;
        text-align: center;
      }

      .days-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
  `]
})
export class CalendarSettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly snackBar = inject(MatSnackBar);

  calendarForm!: FormGroup;
  userProfile: UserProfile | null = null;
  isSaving = false;

  calendarProviders: CalendarProvider[] = [
    {
      id: 'google',
      name: 'Google Calendar',
      icon: 'event',
      description: 'Sync with your Google Calendar',
      connected: false
    },
    {
      id: 'outlook',
      name: 'Microsoft Outlook',
      icon: 'email',
      description: 'Sync with Outlook/Office 365',
      connected: false
    },
    {
      id: 'apple',
      name: 'Apple Calendar',
      icon: 'calendar_today',
      description: 'Sync with iCloud Calendar',
      connected: false
    }
  ];

  timeOptions = [
    { value: '09:00', label: '9:00 AM' },
    { value: '09:30', label: '9:30 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '10:30', label: '10:30 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '11:30', label: '11:30 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '12:30', label: '12:30 PM' },
    { value: '13:00', label: '1:00 PM' },
    { value: '13:30', label: '1:30 PM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '14:30', label: '2:30 PM' },
    { value: '15:00', label: '3:00 PM' },
    { value: '15:30', label: '3:30 PM' },
    { value: '16:00', label: '4:00 PM' },
    { value: '16:30', label: '4:30 PM' },
    { value: '17:00', label: '5:00 PM' },
    { value: '17:30', label: '5:30 PM' },
    { value: '18:00', label: '6:00 PM' }
  ];

  weekDays = [
    { value: 'Monday', label: 'Monday' },
    { value: 'Tuesday', label: 'Tuesday' },
    { value: 'Wednesday', label: 'Wednesday' },
    { value: 'Thursday', label: 'Thursday' },
    { value: 'Friday', label: 'Friday' },
    { value: 'Saturday', label: 'Saturday' },
    { value: 'Sunday', label: 'Sunday' }
  ];

  ngOnInit() {
    this.initializeForm();
    this.loadCalendarSettings();
  }

  private initializeForm(): void {
    interface FormConfig {
      [key: string]: unknown[];
    }
    
    const formConfig: FormConfig = {
      // Calendar Integration
      calendarSync: [false],
      
      // Working Hours
      workingHoursEnabled: [true],
      workingHoursStart: ['09:00'],
      workingHoursEnd: ['17:00'],
      
      // Meeting Preferences
      defaultMeetingDuration: [30],
      bufferTime: [5],
      autoAcceptMeetings: [false],
      showBusyTime: [true],
      allowDoubleBooking: [false],
      
      // Notifications
      reminderTime: [15],
      secondaryReminderTime: [0],
      emailReminders: [true],
      popupReminders: [true],
      soundNotifications: [false]
    };

    // Add working day controls
    this.weekDays.forEach(day => {
      formConfig[`workingDay${day.value}`] = [day.value !== 'Saturday' && day.value !== 'Sunday'];
    });

    this.calendarForm = this.fb.group(formConfig);
  }

  private loadCalendarSettings() {
    this.userService.getUserProfile().subscribe({
      next: (profile) => {
        if (profile) {
          this.userProfile = profile;
          this.populateForm(profile);
        }
      },
      error: (error) => {
        console.error('Error loading calendar settings:', error);
        this.snackBar.open('Error loading calendar settings', 'Close', { duration: 3000 });
      }
    });
  }

  private populateForm(profile: UserProfile) {
    this.calendarForm.patchValue({
      calendarSync: profile.calendarSync || false,
      // Note: Most calendar-specific settings are not yet in the UserProfile interface
      // These would need to be added to the backend UserProfile/User entities
    });
  }

  connectProvider(provider: CalendarProvider): void {
    // OAuth flow implementation will be added in future sprint
    this.snackBar.open(`${provider.name} connection will be implemented soon`, 'Close', { duration: 3000 });
  }

  disconnectProvider(provider: CalendarProvider) {
    provider.connected = false;
    this.snackBar.open(`Disconnected from ${provider.name}`, 'Close', { duration: 3000 });
  }

  onSaveSettings() {
    this.isSaving = true;
    const formData = this.calendarForm.value;

    // Extract only the fields that exist in UserProfile
    const updateData = {
      calendarSync: formData.calendarSync
      // Additional calendar-related fields will be added to UserProfile interface in future sprint
    };

    this.userService.updateUserProfile(updateData).subscribe({
      next: (updatedProfile) => {
        this.userProfile = updatedProfile;
        this.isSaving = false;
        this.snackBar.open('Calendar settings saved successfully!', 'Close', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Error updating calendar settings:', error);
        this.isSaving = false;
        this.snackBar.open('Error saving calendar settings. Please try again.', 'Close', { 
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onCancel() {
    if (this.userProfile) {
      this.populateForm(this.userProfile);
    } else {
      this.calendarForm.reset();
      this.initializeForm();
    }
  }
}