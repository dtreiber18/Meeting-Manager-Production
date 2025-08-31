import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { InjectionToken } from '@angular/core';
import { CalendarService } from '../services/calendar.service';

// Interfaces
export interface App {
  id: string;
  name: string;
  type: 'source' | 'destination';
  isActive: boolean;
  connectionType: 'api' | 'folder';
  apiUrl?: string;
  apiKey?: string;
  folderPath?: string;
  username?: string;
  password?: string;
  fieldMapping?: { [key: string]: string };
}

export interface FieldMappingConfig {
  key: string;
  label: string;
  placeholder: string;
  hint?: string;
}

export interface PasswordStrength {
  level: 'weak' | 'fair' | 'good' | 'strong';
  percentage: number;
  label: string;
}

// Add a minimal placeholder for missing ConfirmDialogComponent typing to avoid TS error
// Replace with actual import when component exists.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const ConfirmDialogComponent: any;

// Define a lightweight interface for the settings service instead of any
interface SettingsService {
  getAccountInfo(): Promise<unknown>;
  updateAccount(data: unknown): Promise<void>;
  changePassword(data: unknown): Promise<void>;
  getSourceApps(): Promise<App[]>;
  getDestinationApps(): Promise<App[]>;
  updateApp(id: string, updates: Partial<App>): Promise<void>;
  deleteApp(id: string): Promise<void>;
  testConnection(config: unknown): Promise<{ success: boolean; error?: string }>;
  updateFieldMapping(id: string, key: string, value: string): Promise<void>;
}

export const SETTINGS_SERVICE_TOKEN = new InjectionToken<SettingsService>('SETTINGS_SERVICE_TOKEN');

@Component({
  selector: 'app-settings',
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
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  // Form Groups
  accountForm!: FormGroup;
  passwordForm!: FormGroup;
  appConfigForm!: FormGroup;

  // State Management
  activeTabIndex = 0;
  currentView: 'summary' | 'detail' = 'summary';
  selectedApp: App | null = null;

  // Loading States
  isLoading = false;
  isSaving = false;
  isTestingConnection = false;
  loadError: string | null = null;

  // Visibility Controls
  showPassword = false;
  showApiKey = false;

  // Data
  sourceApps: App[] = [];
  destinationApps: App[] = [];

  // Calendar Integration
  calendarStatus: any = null;
  isLoadingCalendar = false;

  // Field Mapping Configuration
  fieldMappingConfig: FieldMappingConfig[] = [
    { key: 'title', label: 'Meeting Title', placeholder: 'title', hint: 'Field containing meeting title' },
    { key: 'date', label: 'Meeting Date', placeholder: 'date', hint: 'Field containing meeting date' },
    { key: 'participants', label: 'Participants', placeholder: 'attendees', hint: 'Field containing participant list' },
    { key: 'notes', label: 'Meeting Notes', placeholder: 'content', hint: 'Field containing meeting content' },
    { key: 'actions', label: 'Action Items', placeholder: 'action_items', hint: 'Field containing action items' },
    { key: 'location', label: 'Location', placeholder: 'location', hint: 'Field containing meeting location' }
  ];

  // Subjects for reactive updates
  private fieldMappingSubject = new Subject<{key: string, value: string}>();
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private calendarService: CalendarService,
    @Inject(SETTINGS_SERVICE_TOKEN) private settingsService: SettingsService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.setupFieldMappingDebounce();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Form Initialization
  private initializeForms(): void {
    this.accountForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.appConfigForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      connectionType: ['api', Validators.required],
      apiUrl: ['', [Validators.pattern(/^https?:\/\/.+/)]],
      apiKey: [''],
      folderPath: [''],
      username: [''],
      password: ['']
    });

    // Subscribe to connection type changes to update validators
    this.appConfigForm.get('connectionType')?.valueChanges.subscribe(type => {
      this.updateValidatorsForConnectionType(type);
    });
  }

  private updateValidatorsForConnectionType(type: string): void {
    const apiUrlControl = this.appConfigForm.get('apiUrl');
    const apiKeyControl = this.appConfigForm.get('apiKey');
    const folderPathControl = this.appConfigForm.get('folderPath');

    if (type === 'api') {
      apiUrlControl?.setValidators([Validators.required, Validators.pattern(/^https?:\/\/.+/)]);
      apiKeyControl?.setValidators([Validators.required]);
      folderPathControl?.clearValidators();
    } else {
      apiUrlControl?.clearValidators();
      apiKeyControl?.clearValidators();
      folderPathControl?.setValidators([Validators.required]);
    }

    apiUrlControl?.updateValueAndValidity();
    apiKeyControl?.updateValueAndValidity();
    folderPathControl?.updateValueAndValidity();
  }

  // Custom Validators
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (!newPassword || !confirmPassword) {
      return null;
    }

    return newPassword.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  // Utility Methods
  hasFieldError(form: FormGroup, fieldName: string, errorType: string): boolean {
    const field = form.get(fieldName);
    return field ? field.hasError(errorType) && (field.dirty || field.touched) : false;
  }

  trackByAppId(index: number, app: App): string {
    return app.id || index.toString();
  }

  trackByFieldKey(index: number, field: FieldMappingConfig): string {
    return field.key || index.toString();
  }

  // Password Strength Calculation
  getPasswordStrength(password: string): PasswordStrength {
    if (!password) {
      return { level: 'weak', percentage: 0, label: 'Enter a password' };
    }

    let score = 0;
    const checks = [
      /[a-z]/.test(password), // lowercase
      /[A-Z]/.test(password), // uppercase
      /\d/.test(password),     // digit
      /[@$!%*?&]/.test(password), // special char
      password.length >= 8,    // length
      password.length >= 12    // extra length
    ];

    score = checks.filter(check => check).length;

    if (score <= 2) {
      return { level: 'weak', percentage: 25, label: 'Weak' };
    } else if (score <= 3) {
      return { level: 'fair', percentage: 50, label: 'Fair' };
    } else if (score <= 4) {
      return { level: 'good', percentage: 75, label: 'Good' };
    } else {
      return { level: 'strong', percentage: 100, label: 'Strong' };
    }
  }

  // Data Loading
  private async loadData(): Promise<void> {
    this.isLoading = true;
    this.loadError = null;

    try {
      await Promise.all([
        this.loadAccountInfo(),
        this.loadSourceApps(),
        this.loadDestinationApps(),
        this.loadCalendarStatus()
      ]);
    } catch (error) {
      this.loadError = 'Failed to load settings data';
      this.handleError('Failed to load settings', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadAccountInfo(): Promise<void> {
    try {
      const accountInfo = await this.settingsService.getAccountInfo();
      if (accountInfo && typeof accountInfo === 'object') {
        this.accountForm.patchValue(accountInfo as Record<string, unknown>);
      }
    } catch (error) {
      console.error('Failed to load account info:', error);
    }
  }

  async loadSourceApps(): Promise<void> {
    try {
      this.sourceApps = await this.settingsService.getSourceApps();
    } catch (error) {
      this.handleError('Failed to load source applications', error);
    }
  }

  private async loadDestinationApps(): Promise<void> {
    try {
      this.destinationApps = await this.settingsService.getDestinationApps();
    } catch (error) {
      this.handleError('Failed to load destination applications', error);
    }
  }

  // Calendar Status Loading
  private async loadCalendarStatus(): Promise<void> {
    try {
      this.isLoadingCalendar = true;
      this.calendarStatus = await this.calendarService.getCalendarStatus().toPromise();
    } catch (error: any) {
      console.error('Error checking calendar status:', error);
      
      // Handle authentication errors gracefully
      if (error.status === 404 || (error.error && error.error.error === 'User not found')) {
        this.calendarStatus = { isConnected: false, userEmail: '', isExpired: false };
      } else {
        this.calendarStatus = { isConnected: false, userEmail: '', isExpired: false };
      }
    } finally {
      this.isLoadingCalendar = false;
    }
  }

  // Tab Management
  onTabChange(index: number): void {
    this.activeTabIndex = index;
    this.currentView = 'summary';
    this.selectedApp = null;

    // Load data for active tab if needed
    if (index === 1 && this.sourceApps.length === 0) {
      this.loadSourceApps();
    } else if (index === 2 && this.destinationApps.length === 0) {
      this.loadDestinationApps();
    } else if (index === 3 && !this.calendarStatus) {
      this.loadCalendarStatus();
    }
  }

  // Navigation
  onAppClick(app: App): void {
    this.selectedApp = app;
    this.currentView = 'detail';
    this.populateAppConfigForm(app);
  }

  onBackToSummary(): void {
    this.currentView = 'summary';
    this.selectedApp = null;
    this.appConfigForm.reset();
  }

  private populateAppConfigForm(app: App): void {
    this.appConfigForm.patchValue({
      name: app.name,
      connectionType: app.connectionType,
      apiUrl: app.apiUrl || '',
      apiKey: app.apiKey || '',
      folderPath: app.folderPath || '',
      username: app.username || '',
      password: app.password || ''
    });
  }

  // Visibility Toggles
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleApiKeyVisibility(): void {
    this.showApiKey = !this.showApiKey;
  }

  // Icon Helper
  getAppIcon(appName: string): string {
    const iconMap: { [key: string]: string } = {
      'teams': 'groups',
      'slack': 'chat',
      'zoom': 'videocam',
      'outlook': 'email',
      'gmail': 'mail',
      'trello': 'view_kanban',
      'asana': 'task_alt',
      'jira': 'bug_report',
      'notion': 'description',
      'sharepoint': 'folder_shared',
      'onedrive': 'cloud',
      'dropbox': 'cloud_upload',
      'default': 'apps'
    };

    const name = appName?.toLowerCase() || '';
    return iconMap[name] || iconMap['default'];
  }

  // Form Actions - Account
  async onAccountUpdate(): Promise<void> {
    if (!this.accountForm.valid) return;

    this.isSaving = true;
    try {
      await this.settingsService.updateAccount(this.accountForm.value);
      this.showSuccessMessage('Account updated successfully');
    } catch (error) {
      this.handleError('Failed to update account', error);
    } finally {
      this.isSaving = false;
    }
  }

  async onPasswordChange(): Promise<void> {
    if (!this.passwordForm.valid) return;

    this.isSaving = true;
    try {
      await this.settingsService.changePassword(this.passwordForm.value);
      this.showSuccessMessage('Password changed successfully');
      this.passwordForm.reset();
    } catch (error) {
      this.handleError('Failed to change password', error);
    } finally {
      this.isSaving = false;
    }
  }

  // App Management
  addSourceApp(): void {
    const newApp: App = {
      id: this.generateId(),
      name: '',
      type: 'source',
      isActive: false,
      connectionType: 'api'
    };
    
    this.sourceApps.push(newApp);
    this.onAppClick(newApp);
  }

  addDestinationApp(): void {
    const newApp: App = {
      id: this.generateId(),
      name: '',
      type: 'destination',
      isActive: false,
      connectionType: 'api'
    };
    
    this.destinationApps.push(newApp);
    this.onAppClick(newApp);
  }

  async updateApp(updates: Partial<App>): Promise<void> {
    if (!this.selectedApp) return;

    try {
      Object.assign(this.selectedApp, updates);
      await this.settingsService.updateApp(this.selectedApp.id, updates);
      this.showSuccessMessage('Application updated');
    } catch (error) {
      this.handleError('Failed to update application', error);
    }
  }

  confirmDeleteApp(): void {
    if (!this.selectedApp) return;

    // Open confirmation dialog
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Application',
        message: `Are you sure you want to delete "${this.selectedApp.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteApp();
      }
    });
  }

  private async deleteApp(): Promise<void> {
    if (!this.selectedApp) return;

    try {
      await this.settingsService.deleteApp(this.selectedApp.id);
      
      // Remove from local array
      if (this.selectedApp.type === 'source') {
        this.sourceApps = this.sourceApps.filter(app => app.id !== this.selectedApp!.id);
      } else {
        this.destinationApps = this.destinationApps.filter(app => app.id !== this.selectedApp!.id);
      }

      this.showSuccessMessage('Application deleted successfully');
      this.onBackToSummary();
    } catch (error) {
      this.handleError('Failed to delete application', error);
    }
  }

  // Connection Testing
  canTestConnection(): boolean {
    if (!this.appConfigForm.valid) return false;
    
    const connectionType = this.appConfigForm.get('connectionType')?.value;
    if (connectionType === 'api') {
      return !!(this.appConfigForm.get('apiUrl')?.value && this.appConfigForm.get('apiKey')?.value);
    } else {
      return !!this.appConfigForm.get('folderPath')?.value;
    }
  }

  async testConnection(): Promise<void> {
    if (!this.canTestConnection()) return;

    this.isTestingConnection = true;
    try {
      const testConfig = this.appConfigForm.value;
      const result = await this.settingsService.testConnection(testConfig);
      
      if (result.success) {
        this.showSuccessMessage('Connection successful!');
      } else {
        this.showErrorMessage(`Connection failed: ${result.error}`);
      }
    } catch (error) {
      this.handleError('Connection test failed', error);
    } finally {
      this.isTestingConnection = false;
    }
  }

  // App Configuration
  async saveAppConfig(): Promise<void> {
    if (!this.appConfigForm.valid || !this.selectedApp) return;

    this.isSaving = true;
    try {
      const configData = this.appConfigForm.value;
      Object.assign(this.selectedApp, configData);
      
      await this.settingsService.updateApp(this.selectedApp.id, configData);
      this.showSuccessMessage('Configuration saved successfully');
    } catch (error) {
      this.handleError('Failed to save configuration', error);
    } finally {
      this.isSaving = false;
    }
  }

  // Field Mapping
  private setupFieldMappingDebounce(): void {
    this.fieldMappingSubject.pipe(
      debounceTime(500),
      distinctUntilChanged((prev, curr) => prev.key === curr.key && prev.value === curr.value),
      takeUntil(this.destroy$)
    ).subscribe(({key, value}) => {
      this.performFieldMappingUpdate(key, value);
    });
  }

  getFieldMappingValue(key: string): string {
    return this.selectedApp?.fieldMapping?.[key] || '';
  }

  updateFieldMapping(key: string, value: string): void {
    if (!this.selectedApp) return;

    // Initialize fieldMapping if it doesn't exist
    if (!this.selectedApp.fieldMapping) {
      this.selectedApp.fieldMapping = {};
    }

    // Update UI immediately for responsiveness
    this.selectedApp.fieldMapping[key] = value;
    
    // Debounce the actual save operation
    this.fieldMappingSubject.next({key, value});
  }

  private async performFieldMappingUpdate(key: string, value: string): Promise<void> {
    if (!this.selectedApp) return;

    try {
      await this.settingsService.updateFieldMapping(this.selectedApp.id, key, value);
    } catch (error) {
      this.handleError('Failed to update field mapping', error);
    }
  }

  // Utility Methods
  private generateId(): string {
    return 'app-' + Math.random().toString(36).substring(2, 11);
  }

  // Error + Messaging Helpers
  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000, panelClass: ['snack-success'] });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 5000, panelClass: ['snack-error'] });
  }

  // Central error handler (logs + user feedback)
  private handleError(context: string, error: unknown): void {
    console.error(`[Settings] ${context}:`, error);
    this.showErrorMessage(context);
  }

  // Provide a method to determine password strength class for template binding
  getPasswordStrengthClass(password: string): string {
    const strength = this.getPasswordStrength(password).level;
    switch (strength) {
      case 'weak': return 'pw-weak';
      case 'fair': return 'pw-fair';
      case 'good': return 'pw-good';
      case 'strong': return 'pw-strong';
      default: return '';
    }
  }

  // Convenience getter for account form controls
  get af() { return this.accountForm.controls; }
  get pf() { return this.passwordForm.controls; }
  get cf() { return this.appConfigForm.controls; }

  // Calendar Integration Methods
  async connectCalendar(): Promise<void> {
    try {
      const authUrl = await this.calendarService.getAuthUrl().toPromise();
      if (authUrl && authUrl.authUrl) {
        // Redirect current window to Microsoft OAuth (no popup)
        window.location.href = authUrl.authUrl;
      }
    } catch (error) {
      console.error('Error getting auth URL:', error);
      this.showErrorMessage('Error connecting to calendar');
    }
  }

  async disconnectCalendar(): Promise<void> {
    try {
      await this.calendarService.disconnectCalendar().toPromise();
      this.calendarStatus = { isConnected: false, userEmail: '', isExpired: false };
      this.showSuccessMessage('Calendar disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting calendar:', error);
      this.showErrorMessage('Error disconnecting calendar');
    }
  }

  async refreshCalendarStatus(): Promise<void> {
    await this.loadCalendarStatus();
  }
}