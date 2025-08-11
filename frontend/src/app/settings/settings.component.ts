import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';

import { SettingsService } from '../services/settings.service';
import { User, AppConfig, SettingsTab, SettingsView, FieldMapping, AccountFormData } from '../models/settings.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // State management
  activeTab: SettingsTab = 'account';
  currentView: SettingsView = 'summary';
  selectedApp: AppConfig | null = null;
  showPassword = false;
  isLoading = false;
  isSaving = false;
  isTestingConnection = false;

  // Data
  currentUser: User | null = null;
  sourceApps: AppConfig[] = [];
  destinationApps: AppConfig[] = [];

  // Forms
  accountForm!: FormGroup;
  passwordForm!: FormGroup;

  // Field mapping configuration
  fieldMappingConfig = [
    { key: 'meetingDate', label: 'Meeting Date', placeholder: 'date, created_at, meeting_date' },
    { key: 'meetingTime', label: 'Meeting Time', placeholder: 'time, start_time, meeting_time' },
    { key: 'meetingSubject', label: 'Meeting Subject', placeholder: 'title, subject, name' },
    { key: 'meetingParticipants', label: 'Meeting Participants', placeholder: 'participants, attendees, speakers' },
    { key: 'meetingSummary', label: 'Meeting Summary', placeholder: 'summary, overview, description' },
    { key: 'meetingActionItems', label: 'Action Items', placeholder: 'action_items, tasks, todos' },
    { key: 'meetingNextSteps', label: 'Next Steps', placeholder: 'next_steps, follow_ups, actions' },
    { key: 'meetingDetails', label: 'Meeting Details', placeholder: 'transcript, notes, content' },
    { key: 'meetingRecording', label: 'Meeting Recording', placeholder: 'recording_url, audio_url, video_url' },
    { key: 'meetingDuration', label: 'Meeting Duration', placeholder: 'duration, length, time_spent' },
    { key: 'meetingType', label: 'Meeting Type', placeholder: 'type, category, classification' },
    { key: 'attendedParticipants', label: 'Attended Participants', placeholder: 'attended, present, joined' },
    { key: 'absentParticipants', label: 'Absent Participants', placeholder: 'absent, missing, not_joined' }
  ];

  constructor(
    private settingsService: SettingsService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadSourceApps();
    this.loadDestinationApps();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    this.accountForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.formBuilder.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  private loadUserData(): void {
    this.settingsService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.accountForm.patchValue({
            name: user.name,
            email: user.email
          });
        }
      });
  }

  private loadSourceApps(): void {
    this.isLoading = true;
    this.settingsService.getSourceApps()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (apps) => {
          this.sourceApps = apps;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading source apps:', error);
          this.snackBar.open('Error loading source applications', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  private loadDestinationApps(): void {
    this.settingsService.getDestinationApps()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (apps) => {
          this.destinationApps = apps;
        },
        error: (error) => {
          console.error('Error loading destination apps:', error);
          this.snackBar.open('Error loading destination applications', 'Close', { duration: 3000 });
        }
      });
  }

  onTabChange(tab: SettingsTab): void {
    this.activeTab = tab;
    this.currentView = 'summary';
    this.selectedApp = null;
  }

  onAppClick(app: AppConfig): void {
    this.selectedApp = { ...app };
    this.currentView = 'detail';
  }

  onBackToSummary(): void {
    this.currentView = 'summary';
    this.selectedApp = null;
  }

  onAccountUpdate(): void {
    if (this.accountForm.valid && this.currentUser) {
      this.isSaving = true;
      const formValue = this.accountForm.value;
      const updatedUser: User = {
        ...this.currentUser,
        name: formValue.name,
        email: formValue.email
      };

      this.settingsService.updateUser(updatedUser)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (user) => {
            this.currentUser = user;
            this.isSaving = false;
            this.snackBar.open('Account updated successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error updating account:', error);
            this.snackBar.open('Error updating account', 'Close', { duration: 3000 });
            this.isSaving = false;
          }
        });
    }
  }

  onPasswordChange(): void {
    if (this.passwordForm.valid) {
      this.isSaving = true;
      const formValue = this.passwordForm.value;
      
      this.settingsService.changePassword('', formValue.newPassword)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (success) => {
            if (success) {
              this.passwordForm.reset();
              this.snackBar.open('Password changed successfully', 'Close', { duration: 3000 });
            }
            this.isSaving = false;
          },
          error: (error) => {
            console.error('Error changing password:', error);
            this.snackBar.open('Error changing password', 'Close', { duration: 3000 });
            this.isSaving = false;
          }
        });
    }
  }

  addSourceApp(): void {
    const newApp: AppConfig = {
      id: Date.now().toString(),
      name: '',
      type: 'source',
      connectionType: 'api',
      apiUrl: '',
      apiKey: '',
      fieldMapping: this.createEmptyFieldMapping(),
      isActive: false
    };
    this.sourceApps.push(newApp);
    this.onAppClick(newApp);
  }

  addDestinationApp(): void {
    const newApp: AppConfig = {
      id: Date.now().toString(),
      name: '',
      type: 'destination',
      connectionType: 'api',
      apiUrl: '',
      apiKey: '',
      fieldMapping: this.createEmptyFieldMapping(),
      isActive: false
    };
    this.destinationApps.push(newApp);
    this.onAppClick(newApp);
  }

  private createEmptyFieldMapping(): FieldMapping {
    return {
      meetingDate: '',
      meetingTime: '',
      meetingSubject: '',
      meetingParticipants: '',
      meetingSummary: '',
      meetingActionItems: '',
      meetingNextSteps: '',
      meetingDetails: '',
      meetingRecording: '',
      meetingDuration: '',
      meetingType: '',
      attendedParticipants: '',
      absentParticipants: ''
    };
  }

  updateApp(updates: Partial<AppConfig>): void {
    if (this.selectedApp) {
      this.selectedApp = { ...this.selectedApp, ...updates };
      
      // Update in the appropriate array
      if (this.selectedApp.type === 'source') {
        const index = this.sourceApps.findIndex(app => app.id === this.selectedApp!.id);
        if (index !== -1) {
          this.sourceApps[index] = { ...this.selectedApp };
        }
      } else {
        const index = this.destinationApps.findIndex(app => app.id === this.selectedApp!.id);
        if (index !== -1) {
          this.destinationApps[index] = { ...this.selectedApp };
        }
      }
    }
  }

  updateFieldMapping(field: string, value: string): void {
    if (this.selectedApp) {
      this.selectedApp.fieldMapping[field as keyof FieldMapping] = value;
      this.updateApp({ fieldMapping: this.selectedApp.fieldMapping });
    }
  }

  getFieldMappingValue(key: string): string {
    return this.selectedApp?.fieldMapping?.[key as keyof FieldMapping] || '';
  }

  saveApp(): void {
    if (this.selectedApp) {
      this.isSaving = true;
      this.settingsService.saveAppConfig(this.selectedApp)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (savedApp) => {
            this.snackBar.open('Configuration saved successfully', 'Close', { duration: 3000 });
            this.isSaving = false;
          },
          error: (error) => {
            console.error('Error saving app configuration:', error);
            this.snackBar.open('Error saving configuration', 'Close', { duration: 3000 });
            this.isSaving = false;
          }
        });
    }
  }

  deleteApp(): void {
    if (this.selectedApp) {
      const appType = this.selectedApp.type;
      const appId = this.selectedApp.id;
      
      this.settingsService.deleteAppConfig(appId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (success) => {
            if (success) {
              if (appType === 'source') {
                this.sourceApps = this.sourceApps.filter(app => app.id !== appId);
              } else {
                this.destinationApps = this.destinationApps.filter(app => app.id !== appId);
              }
              this.onBackToSummary();
              this.snackBar.open('Configuration deleted successfully', 'Close', { duration: 3000 });
            }
          },
          error: (error) => {
            console.error('Error deleting app configuration:', error);
            this.snackBar.open('Error deleting configuration', 'Close', { duration: 3000 });
          }
        });
    }
  }

  testConnection(): void {
    if (this.selectedApp) {
      this.isTestingConnection = true;
      this.settingsService.testConnection(this.selectedApp)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            this.snackBar.open(result.message, 'Close', { 
              duration: 5000,
              panelClass: result.success ? 'success-snackbar' : 'error-snackbar'
            });
            this.isTestingConnection = false;
          },
          error: (error) => {
            console.error('Error testing connection:', error);
            this.snackBar.open('Error testing connection', 'Close', { duration: 3000 });
            this.isTestingConnection = false;
          }
        });
    }
  }

  getAppIcon(appName: string): string {
    const name = appName.toLowerCase();
    if (name.includes('calendar')) return 'event';
    if (name.includes('mail') || name.includes('gmail')) return 'email';
    if (name.includes('note') || name.includes('notion')) return 'note';
    if (name.includes('task') || name.includes('asana') || name.includes('trello')) return 'task_alt';
    if (name.includes('fathom')) return 'videocam';
    if (name.includes('otter')) return 'mic';
    return 'storage';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
