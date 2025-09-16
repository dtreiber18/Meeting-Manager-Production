import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService, User } from '../auth/auth.service';
import { UserService, UserProfile } from '../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <div class="profile-container">
      <mat-card class="profile-card">
        <mat-card-header>
          <div mat-card-avatar class="profile-avatar">
            <mat-icon>account_circle</mat-icon>
          </div>
          <mat-card-title>My Profile</mat-card-title>
          <mat-card-subtitle>Manage your personal information and account details</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="profileForm" (ngSubmit)="onSaveProfile()">
            
            <!-- Personal Information Section -->
            <div class="section">
              <h3 class="section-title">
                <mat-icon>person</mat-icon>
                Personal Information
              </h3>
              
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>First Name</mat-label>
                  <input matInput formControlName="firstName" placeholder="Enter your first name">
                  <mat-error *ngIf="profileForm.get('firstName')?.hasError('required')">
                    First name is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Last Name</mat-label>
                  <input matInput formControlName="lastName" placeholder="Enter your last name">
                  <mat-error *ngIf="profileForm.get('lastName')?.hasError('required')">
                    Last name is required
                  </mat-error>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email Address</mat-label>
                <input matInput formControlName="email" type="email" readonly>
                <mat-hint>Your email address cannot be changed</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Phone Number</mat-label>
                <input matInput formControlName="phoneNumber" placeholder="Enter your phone number">
              </mat-form-field>
            </div>

            <mat-divider></mat-divider>

            <!-- Professional Information Section -->
            <div class="section">
              <h3 class="section-title">
                <mat-icon>work</mat-icon>
                Professional Information
              </h3>
              
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Job Title</mat-label>
                  <input matInput formControlName="jobTitle" placeholder="Enter your job title">
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Department</mat-label>
                  <input matInput formControlName="department" placeholder="Enter your department">
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Bio</mat-label>
                <textarea matInput 
                          formControlName="bio" 
                          placeholder="Tell us about yourself..."
                          rows="4"
                          maxlength="500">
                </textarea>
                <mat-hint align="end">{{ profileForm.get('bio')?.value?.length || 0 }}/500</mat-hint>
              </mat-form-field>
            </div>

            <mat-divider></mat-divider>

            <!-- Organization Information Section -->
            <div class="section" *ngIf="currentUser">
              <h3 class="section-title">
                <mat-icon>business</mat-icon>
                Organization Information
              </h3>
              
              <div class="readonly-info">
                <div class="info-item">
                  <label>Organization:</label>
                  <span>{{ currentUser.organizationName || 'Not specified' }}</span>
                </div>
                
                <div class="info-item">
                  <label>Roles:</label>
                  <div class="roles-container">
                    <mat-chip-set *ngIf="currentUser.roles && currentUser.roles.length > 0">
                      <mat-chip *ngFor="let role of currentUser.roles">{{ role }}</mat-chip>
                    </mat-chip-set>
                    <span *ngIf="!currentUser.roles || currentUser.roles.length === 0">No roles assigned</span>
                  </div>
                </div>
                
                      <div class="info-item">
        <label>Organization:</label>
        <span>{{ currentUser.organizationName || 'Not specified' }}</span>
      </div>
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
                  (click)="onSaveProfile()"
                  [disabled]="isSaving || profileForm.invalid">
            <mat-spinner diameter="20" *ngIf="isSaving"></mat-spinner>
            <span *ngIf="!isSaving">Save Profile</span>
            <span *ngIf="isSaving">Saving...</span>
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }

    .profile-card {
      margin-bottom: 24px;
    }

    .profile-avatar {
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

    .readonly-info {
      background-color: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
    }

    .info-item {
      display: flex;
      margin-bottom: 12px;
      align-items: flex-start;
    }

    .info-item:last-child {
      margin-bottom: 0;
    }

    .info-item label {
      font-weight: 500;
      min-width: 120px;
      color: #666;
    }

    .info-item span {
      color: #333;
    }

    .roles-container {
      flex: 1;
    }

    mat-chip {
      margin-right: 8px;
    }

    mat-divider {
      margin: 24px 0;
    }

    @media (max-width: 768px) {
      .profile-container {
        padding: 16px;
      }

      .form-row {
        flex-direction: column;
        gap: 0;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);

  profileForm!: FormGroup;
  currentUser: User | null = null;
  userProfile: UserProfile | null = null;
  isSaving = false;

  ngOnInit() {
    this.initializeForm();
    this.loadUserData();
  }

  private initializeForm() {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: [''],
      phoneNumber: [''],
      jobTitle: [''],
      department: [''],
      bio: ['', [Validators.maxLength(500)]]
    });
  }

  private loadUserData() {
    // Get current user from auth service
    this.currentUser = this.authService.getCurrentUser();
    
    if (this.currentUser) {
      // Load detailed profile from user service
      this.userService.getUserProfile().subscribe({
        next: (profile) => {
          if (profile) {
            this.userProfile = profile;
            this.populateForm(profile);
          }
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
          this.snackBar.open('Error loading profile data', 'Close', { duration: 3000 });
        }
      });
    }
  }

  private populateForm(profile: UserProfile) {
    this.profileForm.patchValue({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      email: profile.email || '',
      phoneNumber: profile.phoneNumber || '',
      jobTitle: profile.jobTitle || '',
      department: profile.department || '',
      bio: profile.bio || ''
    });
  }

  onSaveProfile() {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSaving = true;
    const formData = this.profileForm.value;

    // Prepare update data with only the fields that can be updated
    const updateData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      jobTitle: formData.jobTitle,
      department: formData.department,
      bio: formData.bio
    };

    this.userService.updateUserProfile(updateData).subscribe({
      next: (updatedProfile) => {
        this.userProfile = updatedProfile;
        this.isSaving = false;
        this.snackBar.open('Profile updated successfully!', 'Close', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        // Update the auth service with new user data
        if (this.currentUser) {
          this.currentUser.firstName = updatedProfile.firstName || this.currentUser.firstName;
          this.currentUser.lastName = updatedProfile.lastName || this.currentUser.lastName;
        }
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.isSaving = false;
        this.snackBar.open('Error updating profile. Please try again.', 'Close', { 
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
      this.profileForm.reset();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }
}