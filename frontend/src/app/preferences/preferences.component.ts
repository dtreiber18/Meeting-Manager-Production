import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ToastService } from '../shared/services/toast.service';
import { AuthService, User } from '../auth/auth.service';
import { CalendarService } from '../services/calendar.service';
import { UserService } from '../services/user.service';
import { Subject, takeUntil } from 'rxjs';

interface UserPreferences {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  jobTitle?: string;
  department?: string;
  bio?: string;
  
  // Display & Language
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  theme: string;
  
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  meetingReminders: boolean;
  actionItemReminders: boolean;
  weeklyDigest: boolean;
  
  // Privacy
  profileVisibility: string;
  showOnlineStatus: boolean;
  allowDirectMessages: boolean;
}

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatDividerModule,
    MatSlideToggleModule
  ],
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss']
})
export class PreferencesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  profileForm!: FormGroup;
  displayForm!: FormGroup;
  notificationForm!: FormGroup;
  privacyForm!: FormGroup;
  
  isLoading = false;
  isSaving = false;
  currentUser: User | null = null;
  calendarStatus: any = null;
  
  // Options for dropdowns
  languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' }
  ];
  
  timezoneOptions = [
    { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
    { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
    { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
    { value: 'Europe/London', label: 'GMT (London)' },
    { value: 'Europe/Paris', label: 'Central European Time' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time' }
  ];
  
  dateFormatOptions = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (UK)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
    { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY' }
  ];
  
  timeFormatOptions = [
    { value: '12', label: '12-hour (AM/PM)' },
    { value: '24', label: '24-hour' }
  ];
  
  themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'auto', label: 'System Default' }
  ];
  
  profileVisibilityOptions = [
    { value: 'public', label: 'Public (All users)' },
    { value: 'organization', label: 'Organization Only' },
    { value: 'private', label: 'Private (Me only)' }
  ];

  constructor(
    private fb: FormBuilder,
    private toastService: ToastService,
    private authService: AuthService,
    private calendarService: CalendarService,
    private userService: UserService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadCalendarStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      jobTitle: [''],
      department: [''],
      bio: ['', Validators.maxLength(500)]
    });

    this.displayForm = this.fb.group({
      language: ['en', Validators.required],
      timezone: ['America/New_York', Validators.required],
      dateFormat: ['MM/DD/YYYY', Validators.required],
      timeFormat: ['12', Validators.required],
      theme: ['light', Validators.required]
    });

    this.notificationForm = this.fb.group({
      emailNotifications: [true],
      pushNotifications: [true],
      meetingReminders: [true],
      actionItemReminders: [true],
      weeklyDigest: [false]
    });

    this.privacyForm = this.fb.group({
      profileVisibility: ['organization', Validators.required],
      showOnlineStatus: [true],
      allowDirectMessages: [true]
    });
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.loadUserProfile();
        }
      });
  }

  private async loadUserProfile(): Promise<void> {
    try {
      this.isLoading = true;
      const userProfile = await this.userService.getUserProfile().toPromise();
      if (userProfile) {
        this.populateFormsWithUserData(userProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Fall back to current user data if API fails
      if (this.currentUser) {
        this.populateFormsWithUserData(this.currentUser);
      }
    } finally {
      this.isLoading = false;
    }
  }

  private populateFormsWithUserData(user: User | any): void {
    // Profile information
    this.profileForm.patchValue({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      jobTitle: user.jobTitle || '',
      department: user.department || '',
      bio: user.bio || ''
    });

    // Display preferences (with defaults if not set)
    this.displayForm.patchValue({
      language: user.language || 'en',
      timezone: user.timezone || 'America/New_York',
      dateFormat: 'MM/DD/YYYY', // Add to user model later
      timeFormat: '12', // Add to user model later
      theme: 'light' // Add to user model later
    });

    // Notification preferences
    this.notificationForm.patchValue({
      emailNotifications: user.emailNotifications ?? true,
      pushNotifications: user.pushNotifications ?? true,
      meetingReminders: true, // Add to user model later
      actionItemReminders: true, // Add to user model later
      weeklyDigest: false // Add to user model later
    });

    // Privacy settings
    this.privacyForm.patchValue({
      profileVisibility: 'organization', // Add to user model later
      showOnlineStatus: true, // Add to user model later
      allowDirectMessages: true // Add to user model later
    });
  }

  private async loadCalendarStatus(): Promise<void> {
    try {
      this.isLoading = true;
      this.calendarStatus = await this.calendarService.getCalendarStatus().toPromise();
    } catch (error: any) {
      console.error('Error checking calendar status:', error);
      if (error.status === 404 || (error.error && error.error.error === 'User not found')) {
        this.calendarStatus = { isConnected: false, userEmail: '', isExpired: false };
      } else {
        this.calendarStatus = { isConnected: false, userEmail: '', isExpired: false };
      }
    } finally {
      this.isLoading = false;
    }
  }

  async saveProfile(): Promise<void> {
    if (!this.profileForm.valid) {
      this.toastService.showError('Please correct the errors in the form');
      return;
    }

    this.isSaving = true;
    try {
      const formData = this.profileForm.value;
      console.log('Saving profile:', formData);
      
      await this.userService.updateUserProfile(formData).toPromise();
      
      this.toastService.showSuccess('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      this.toastService.showError('Failed to update profile');
    } finally {
      this.isSaving = false;
    }
  }

  async saveDisplaySettings(): Promise<void> {
    if (!this.displayForm.valid) {
      this.toastService.showError('Please correct the errors in the form');
      return;
    }

    this.isSaving = true;
    try {
      const formData = this.displayForm.value;
      console.log('Saving display settings:', formData);
      
      await this.userService.updateUserProfile({
        language: formData.language,
        timezone: formData.timezone
      }).toPromise();
      
      this.toastService.showSuccess('Display settings updated successfully');
    } catch (error) {
      console.error('Error saving display settings:', error);
      this.toastService.showError('Failed to update display settings');
    } finally {
      this.isSaving = false;
    }
  }

  async saveNotificationSettings(): Promise<void> {
    this.isSaving = true;
    try {
      const formData = this.notificationForm.value;
      console.log('Saving notification settings:', formData);
      
      await this.userService.updateNotificationPreferences({
        emailNotifications: formData.emailNotifications,
        smsNotifications: formData.pushNotifications,
        meetingReminders: formData.meetingReminders
      }).toPromise();
      
      this.toastService.showSuccess('Notification preferences updated successfully');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      this.toastService.showError('Failed to update notification preferences');
    } finally {
      this.isSaving = false;
    }
  }

  async savePrivacySettings(): Promise<void> {
    if (!this.privacyForm.valid) {
      this.toastService.showError('Please correct the errors in the form');
      return;
    }

    this.isSaving = true;
    try {
      const formData = this.privacyForm.value;
      // TODO: Implement actual API call to save privacy settings
      console.log('Saving privacy settings:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.toastService.showSuccess('Privacy settings updated successfully');
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      this.toastService.showError('Failed to update privacy settings');
    } finally {
      this.isSaving = false;
    }
  }

  // Calendar Integration Methods
  async connectCalendar(): Promise<void> {
    try {
      const authUrl = await this.calendarService.getAuthUrl().toPromise();
      if (authUrl && authUrl.authUrl) {
        window.location.href = authUrl.authUrl;
      }
    } catch (error) {
      console.error('Error getting auth URL:', error);
      this.toastService.showError('Error connecting to calendar');
    }
  }

  async disconnectCalendar(): Promise<void> {
    try {
      await this.calendarService.disconnectCalendar().toPromise();
      this.calendarStatus = { isConnected: false, userEmail: '', isExpired: false };
      this.toastService.showSuccess('Calendar disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting calendar:', error);
      this.toastService.showError('Error disconnecting calendar');
    }
  }

  async refreshCalendarStatus(): Promise<void> {
    await this.loadCalendarStatus();
  }

  // Form validation helpers
  hasError(form: FormGroup, fieldName: string, errorType: string): boolean {
    const field = form.get(fieldName);
    return field ? field.hasError(errorType) && (field.dirty || field.touched) : false;
  }

  getErrorMessage(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.hasError('required')) return `${fieldName} is required`;
    if (field.hasError('email')) return 'Invalid email address';
    if (field.hasError('minlength')) return `${fieldName} is too short`;
    if (field.hasError('maxlength')) return `${fieldName} is too long`;

    return 'Invalid value';
  }
}
