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

interface ThemeOption {
  value: string;
  label: string;
  description: string;
  preview: string;
}

interface LanguageOption {
  value: string;
  label: string;
  flag: string;
}

interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

@Component({
  selector: 'app-preferences',
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
    <div class="preferences-container">
      <mat-card class="preferences-card">
        <mat-card-header>
          <div mat-card-avatar class="preferences-avatar">
            <mat-icon>settings</mat-icon>
          </div>
          <mat-card-title>Preferences</mat-card-title>
          <mat-card-subtitle>Customize your Meeting Manager experience</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="preferencesForm" (ngSubmit)="onSavePreferences()">
            
            <!-- Appearance Section -->
            <div class="section">
              <h3 class="section-title">
                <mat-icon>palette</mat-icon>
                Appearance
              </h3>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Theme</mat-label>
                <mat-select formControlName="theme">
                  <mat-option *ngFor="let theme of themeOptions" [value]="theme.value">
                    <div class="theme-option">
                      <div class="theme-preview" [style.background]="theme.preview"></div>
                      <div class="theme-info">
                        <div class="theme-label">{{ theme.label }}</div>
                        <div class="theme-description">{{ theme.description }}</div>
                      </div>
                    </div>
                  </mat-option>
                </mat-select>
                <mat-hint>Choose your preferred visual theme</mat-hint>
              </mat-form-field>

              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Date Format</mat-label>
                  <mat-select formControlName="dateFormat">
                    <mat-option value="MM/dd/yyyy">MM/dd/yyyy (US)</mat-option>
                    <mat-option value="dd/MM/yyyy">dd/MM/yyyy (European)</mat-option>
                    <mat-option value="yyyy-MM-dd">yyyy-MM-dd (ISO)</mat-option>
                    <mat-option value="dd MMM yyyy">dd MMM yyyy (Verbose)</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Time Format</mat-label>
                  <mat-select formControlName="timeFormat">
                    <mat-option value="h:mm a">12-hour (1:30 PM)</mat-option>
                    <mat-option value="HH:mm">24-hour (13:30)</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Localization Section -->
            <div class="section">
              <h3 class="section-title">
                <mat-icon>language</mat-icon>
                Localization
              </h3>
              
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Language</mat-label>
                  <mat-select formControlName="language">
                    <mat-option *ngFor="let lang of languageOptions" [value]="lang.value">
                      <span class="language-flag">{{ lang.flag }}</span>
                      {{ lang.label }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Timezone</mat-label>
                  <mat-select formControlName="timezone">
                    <mat-option *ngFor="let tz of timezoneOptions" [value]="tz.value">
                      <div class="timezone-option">
                        <span class="timezone-label">{{ tz.label }}</span>
                        <span class="timezone-offset">{{ tz.offset }}</span>
                      </div>
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Notifications Section -->
            <div class="section">
              <h3 class="section-title">
                <mat-icon>notifications</mat-icon>
                Notifications
              </h3>
              
              <div class="toggle-options">
                <mat-slide-toggle formControlName="emailNotifications" class="toggle-option">
                  <div class="toggle-content">
                    <span class="toggle-label">Email Notifications</span>
                    <span class="toggle-description">Receive meeting reminders and updates via email</span>
                  </div>
                </mat-slide-toggle>

                <mat-slide-toggle formControlName="pushNotifications" class="toggle-option">
                  <div class="toggle-content">
                    <span class="toggle-label">Push Notifications</span>
                    <span class="toggle-description">Browser notifications for real-time updates</span>
                  </div>
                </mat-slide-toggle>

                <mat-slide-toggle formControlName="meetingReminders" class="toggle-option">
                  <div class="toggle-content">
                    <span class="toggle-label">Meeting Reminders</span>
                    <span class="toggle-description">Automatic reminders before scheduled meetings</span>
                  </div>
                </mat-slide-toggle>

                <mat-slide-toggle formControlName="weeklyDigest" class="toggle-option">
                  <div class="toggle-content">
                    <span class="toggle-label">Weekly Digest</span>
                    <span class="toggle-description">Summary of your week's meetings and activities</span>
                  </div>
                </mat-slide-toggle>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Privacy & Security Section -->
            <div class="section">
              <h3 class="section-title">
                <mat-icon>security</mat-icon>
                Privacy & Security
              </h3>
              
              <div class="toggle-options">
                <mat-slide-toggle formControlName="shareAvailability" class="toggle-option">
                  <div class="toggle-content">
                    <span class="toggle-label">Share Availability</span>
                    <span class="toggle-description">Allow others to see your availability status</span>
                  </div>
                </mat-slide-toggle>

                <mat-slide-toggle formControlName="allowGuestAccess" class="toggle-option">
                  <div class="toggle-content">
                    <span class="toggle-label">Allow Guest Access</span>
                    <span class="toggle-description">Permit external users to join your meetings</span>
                  </div>
                </mat-slide-toggle>

                <mat-slide-toggle formControlName="twoFactorAuth" class="toggle-option">
                  <div class="toggle-content">
                    <span class="toggle-label">Two-Factor Authentication</span>
                    <span class="toggle-description">Enhanced security for your account</span>
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
                  (click)="onSavePreferences()"
                  [disabled]="isSaving">
            <mat-spinner diameter="20" *ngIf="isSaving"></mat-spinner>
            <span *ngIf="!isSaving">Save Preferences</span>
            <span *ngIf="isSaving">Saving...</span>
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .preferences-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }

    .preferences-card {
      margin-bottom: 24px;
    }

    .preferences-avatar {
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

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .half-width {
      flex: 1;
    }

    .theme-option {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
    }

    .theme-preview {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid #ddd;
    }

    .theme-info {
      flex: 1;
    }

    .theme-label {
      font-weight: 500;
    }

    .theme-description {
      font-size: 12px;
      color: #666;
    }

    .language-flag {
      margin-right: 8px;
      font-size: 18px;
    }

    .timezone-option {
      display: flex;
      justify-content: space-between;
      width: 100%;
    }

    .timezone-label {
      flex: 1;
    }

    .timezone-offset {
      color: #666;
      font-size: 12px;
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
      .preferences-container {
        padding: 16px;
      }

      .form-row {
        flex-direction: column;
        gap: 0;
      }
    }
  `]
})
export class PreferencesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly snackBar = inject(MatSnackBar);

  preferencesForm!: FormGroup;
  userProfile: UserProfile | null = null;
  isSaving = false;

  themeOptions: ThemeOption[] = [
    { value: 'light', label: 'Light Theme', description: 'Clean and bright interface', preview: 'linear-gradient(45deg, #ffffff, #f5f5f5)' },
    { value: 'dark', label: 'Dark Theme', description: 'Easy on the eyes for low-light environments', preview: 'linear-gradient(45deg, #303030, #424242)' },
    { value: 'auto', label: 'Auto', description: 'Follows your system preference', preview: 'linear-gradient(45deg, #ffffff, #303030)' }
  ];

  languageOptions: LanguageOption[] = [
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'es', label: 'Español', flag: '🇪🇸' },
    { value: 'fr', label: 'Français', flag: '🇫🇷' },
    { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { value: 'it', label: 'Italiano', flag: '🇮🇹' },
    { value: 'pt', label: 'Português', flag: '🇵🇹' },
    { value: 'ja', label: '日本語', flag: '🇯🇵' },
    { value: 'ko', label: '한국어', flag: '🇰🇷' },
    { value: 'zh', label: '中文', flag: '🇨🇳' }
  ];

  timezoneOptions: TimezoneOption[] = [
    { value: 'America/New_York', label: 'Eastern Time', offset: 'UTC-5/-4' },
    { value: 'America/Chicago', label: 'Central Time', offset: 'UTC-6/-5' },
    { value: 'America/Denver', label: 'Mountain Time', offset: 'UTC-7/-6' },
    { value: 'America/Los_Angeles', label: 'Pacific Time', offset: 'UTC-8/-7' },
    { value: 'Europe/London', label: 'London', offset: 'UTC+0/+1' },
    { value: 'Europe/Paris', label: 'Central European Time', offset: 'UTC+1/+2' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time', offset: 'UTC+9' },
    { value: 'Asia/Shanghai', label: 'China Standard Time', offset: 'UTC+8' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time', offset: 'UTC+10/+11' }
  ];

  ngOnInit() {
    this.initializeForm();
    this.loadUserPreferences();
  }

  private initializeForm() {
    this.preferencesForm = this.fb.group({
      // Appearance
      theme: ['light'],
      dateFormat: ['MM/dd/yyyy'],
      timeFormat: ['h:mm a'],
      
      // Localization
      language: ['en'],
      timezone: ['America/New_York'],
      
      // Notifications
      emailNotifications: [true],
      pushNotifications: [true],
      meetingReminders: [true],
      weeklyDigest: [false],
      
      // Privacy & Security
      shareAvailability: [true],
      allowGuestAccess: [false],
      twoFactorAuth: [false]
    });
  }

  private loadUserPreferences() {
    this.userService.getUserProfile().subscribe({
      next: (profile) => {
        if (profile) {
          this.userProfile = profile;
          this.populateForm(profile);
        }
      },
      error: (error) => {
        console.error('Error loading user preferences:', error);
        this.snackBar.open('Error loading preferences', 'Close', { duration: 3000 });
      }
    });
  }

  private populateForm(profile: UserProfile) {
    this.preferencesForm.patchValue({
      theme: profile.theme || 'light',
      dateFormat: profile.dateFormat || 'MM/dd/yyyy',
      timeFormat: profile.timeFormat || 'h:mm a',
      language: profile.language || 'en',
      timezone: profile.timezone || 'America/New_York',
      emailNotifications: profile.emailNotifications ?? true,
      pushNotifications: profile.pushNotifications ?? true,
      meetingReminders: profile.meetingReminders ?? true,
      weeklyDigest: profile.weeklyDigest ?? false,
      shareAvailability: profile.showOnlineStatus ?? true,
      allowGuestAccess: profile.allowDirectMessages ?? false,
      twoFactorAuth: false // Not yet implemented in backend
    });
  }

  onSavePreferences() {
    this.isSaving = true;
    const formData = this.preferencesForm.value;

    this.userService.updateUserProfile(formData).subscribe({
      next: (updatedProfile) => {
        this.userProfile = updatedProfile;
        this.isSaving = false;
        
        // Apply theme immediately
        this.applyTheme(formData.theme);
        
        this.snackBar.open('Preferences saved successfully!', 'Close', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Error updating preferences:', error);
        this.isSaving = false;
        this.snackBar.open('Error saving preferences. Please try again.', 'Close', { 
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
      this.preferencesForm.reset();
      this.initializeForm();
    }
  }

  private applyTheme(theme: string) {
    // Remove existing theme classes
    document.body.classList.remove('light-theme', 'dark-theme');
    
    // Apply new theme
    if (theme === 'auto') {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'dark' : 'light';
    }
    
    document.body.classList.add(`${theme}-theme`);
    
    // Store in localStorage for persistence
    localStorage.setItem('theme', theme);
    
    console.log('Applied theme:', theme);
  }
}