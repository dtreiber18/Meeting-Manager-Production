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
    console.log('🎨 PreferencesComponent - Constructor called');
    console.log('🎨 PreferencesComponent - Services initialized:', {
      fb: !!this.fb,
      toastService: !!this.toastService,
      authService: !!this.authService,
      calendarService: !!this.calendarService,
      userService: !!this.userService
    });
    this.initializeForms();
  }

  ngOnInit(): void {
    console.log('🎨 PreferencesComponent - ngOnInit called');
    this.loadCurrentUser();
    this.loadCalendarStatus();
    this.initializeTheme();
  }

  private initializeTheme(): void {
    // Initialize theme from localStorage or user profile
    const savedTheme = localStorage.getItem('user-theme-preference') || 'auto';
    console.log('🎨 Theme Init - Theme from localStorage:', savedTheme);
    this.applyThemeSettings(savedTheme);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    console.log('🎨 PreferencesComponent - Initializing forms');
    
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

    console.log('🎨 PreferencesComponent - Display form initialized:', this.displayForm.value);
    console.log('🎨 PreferencesComponent - Theme control initialized:', this.displayForm.get('theme')?.value);

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
    
    console.log('🎨 PreferencesComponent - All forms initialized');
  }

  private loadCurrentUser(): void {
    console.log('🎨 PreferencesComponent - Loading current user...');
    
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        console.log('🎨 PreferencesComponent - Current user received:', user);
        this.currentUser = user;
        if (user) {
          console.log('🎨 PreferencesComponent - User authenticated, loading profile...');
          this.loadUserProfile();
        } else {
          console.log('🎨 PreferencesComponent - No user authenticated');
        }
      });
  }

  private async loadUserProfile(): Promise<void> {
    try {
      console.log('🎨 PreferencesComponent - Loading user profile from API...');
      this.isLoading = true;
      const userProfile = await this.userService.getUserProfile().toPromise();
      console.log('🎨 PreferencesComponent - User profile loaded:', userProfile);
      
      if (userProfile) {
        console.log('🎨 PreferencesComponent - Populating forms with profile data...');
        this.populateFormsWithUserData(userProfile);
      } else {
        console.log('🎨 PreferencesComponent - No profile data, using current user...');
        if (this.currentUser) {
          this.populateFormsWithUserData(this.currentUser);
        }
      }
    } catch (error) {
      console.error('🎨 PreferencesComponent - Error loading user profile:', error);
      // Fall back to current user data if API fails
      if (this.currentUser) {
        console.log('🎨 PreferencesComponent - Falling back to current user data...');
        this.populateFormsWithUserData(this.currentUser);
      }
    } finally {
      this.isLoading = false;
    }
  }

  private populateFormsWithUserData(user: User | any): void {
    console.log('🎨 Theme Loading - Populating forms with user data:', user);
    console.log('🎨 Theme Loading - User theme value:', user.theme);
    
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
    const displayValues = {
      language: user.language || 'en',
      timezone: user.timezone || 'America/New_York',
      dateFormat: user.dateFormat || 'MM/DD/YYYY',
      timeFormat: user.timeFormat || '12',
      theme: user.theme || 'light'
    };
    
    console.log('🎨 Theme Loading - Display form values to be set:', displayValues);
    this.displayForm.patchValue(displayValues);
    
    // Log what the form actually contains after patching
    setTimeout(() => {
      console.log('🎨 Theme Loading - Display form after patching:', this.displayForm.value);
      console.log('🎨 Theme Loading - Theme control value:', this.displayForm.get('theme')?.value);
    }, 100);

    // Notification preferences
    this.notificationForm.patchValue({
      emailNotifications: user.emailNotifications ?? true,
      pushNotifications: user.pushNotifications ?? true,
      meetingReminders: user.meetingReminders ?? true,
      actionItemReminders: user.actionItemReminders ?? true,
      weeklyDigest: user.weeklyDigest ?? false
    });

    // Privacy settings
    this.privacyForm.patchValue({
      profileVisibility: user.profileVisibility || 'organization',
      showOnlineStatus: user.showOnlineStatus ?? true,
      allowDirectMessages: user.allowDirectMessages ?? true
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

  onSaveDisplaySettingsClick(event: Event): void {
    console.log('🎨 Theme Saving - Button clicked!', event);
    event.preventDefault(); // Prevent default to avoid double submission
    this.saveDisplaySettings();
  }

  async saveDisplaySettings(): Promise<void> {
    console.log('🎨 Theme Saving - saveDisplaySettings() method called');
    console.log('🎨 Theme Saving - isSaving state:', this.isSaving);
    
    if (!this.displayForm.valid) {
      console.log('🎨 Theme Saving - Form is invalid:', this.displayForm.errors);
      this.toastService.showError('Please correct the errors in the form');
      return;
    }

    console.log('🎨 Theme Saving - Form is valid, proceeding with save');
    this.isSaving = true;
    
    try {
      const formData = this.displayForm.value;
      console.log('🎨 Theme Saving - Form data:', formData);
      console.log('🎨 Theme Saving - Current theme value:', formData.theme);
      console.log('🎨 Theme Saving - Form valid:', this.displayForm.valid);
      console.log('🎨 Theme Saving - Form dirty:', this.displayForm.dirty);
      console.log('🎨 Theme Saving - Form controls:', {
        language: this.displayForm.get('language')?.value,
        timezone: this.displayForm.get('timezone')?.value,
        dateFormat: this.displayForm.get('dateFormat')?.value,
        timeFormat: this.displayForm.get('timeFormat')?.value,
        theme: this.displayForm.get('theme')?.value
      });
      
      const updateData = {
        language: formData.language,
        timezone: formData.timezone,
        dateFormat: formData.dateFormat,
        timeFormat: formData.timeFormat,
        theme: formData.theme
      };
      
      console.log('🎨 Theme Saving - Update data being sent:', updateData);
      
      // Check if userService exists
      if (!this.userService) {
        console.error('🎨 Theme Saving - ERROR: userService is null/undefined');
        throw new Error('User service not available');
      }
      
      console.log('🎨 Theme Saving - Calling userService.updateUserProfile()...');
      
      // Save all display settings to the backend
      const result = await this.userService.updateUserProfile(updateData).toPromise();
      console.log('🎨 Theme Saving - Backend response received:', result);
      
      // Apply theme changes immediately
      console.log('🎨 Theme Saving - Applying theme settings...');
      this.applyThemeSettings(formData.theme);
      
      console.log('🎨 Theme Saving - Showing success toast...');
      this.toastService.showSuccess('Display settings updated successfully');
      
      // Reload user profile to verify save
      setTimeout(async () => {
        try {
          console.log('🎨 Theme Saving - Verification: Loading updated profile...');
          const updatedProfile = await this.userService.getUserProfile().toPromise();
          console.log('🎨 Theme Saving - Verification: Updated profile from backend:', updatedProfile);
          console.log('🎨 Theme Saving - Verification: Theme in updated profile:', updatedProfile?.theme);
        } catch (error) {
          console.error('🎨 Theme Saving - Verification failed:', error);
        }
      }, 1000);
      
    } catch (error) {
      console.error('🎨 Theme Saving - ERROR occurred:', error);
      console.error('🎨 Theme Saving - Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        fullError: error
      });
      this.toastService.showError('Failed to update display settings');
    } finally {
      console.log('🎨 Theme Saving - Setting isSaving to false');
      this.isSaving = false;
    }
  }

  private applyThemeSettings(theme: string): void {
    console.log('🎨 Theme Apply - Applying theme:', theme);
    
    // Store theme preference in localStorage for immediate application
    localStorage.setItem('user-theme-preference', theme);
    
    // Apply theme to document body
    const body = document.body;
    
    // Remove existing theme classes
    body.classList.remove('light-theme', 'dark-theme');
    
    if (theme === 'dark') {
      body.classList.add('dark-theme');
    } else if (theme === 'light') {
      body.classList.add('light-theme');
    } else if (theme === 'auto') {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      body.classList.add(prefersDark ? 'dark-theme' : 'light-theme');
    }
    
    console.log('🎨 Theme Apply - Applied theme:', theme, 'Body classes:', body.className);
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
