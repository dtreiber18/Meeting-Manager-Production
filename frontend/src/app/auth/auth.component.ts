import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService, LoginRequest, RegisterRequest } from './auth.service';

@Component({
  selector: 'app-auth',
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
    MatSnackBarModule,
    MatTabsModule,
    MatDividerModule
  ],
  template: `
    <div class="auth-container">
      <div class="auth-card-container">
        <mat-card class="auth-card">
          <mat-card-header class="auth-header">
            <div class="logo-container">
              <mat-icon class="logo-icon">business</mat-icon>
              <h2>Meeting Manager</h2>
            </div>
            <p class="subtitle">Enterprise Meeting Automation Platform</p>
          </mat-card-header>

          <mat-card-content>
            <mat-tab-group [(selectedIndex)]="selectedTabIndex" class="auth-tabs">
              <!-- Login Tab -->
              <mat-tab label="Sign In">
                <div class="tab-content professional-form-field">
                  <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="auth-form">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Email Address</mat-label>
                      <input matInput type="email" formControlName="email" required placeholder="demo@acme.com">
                      <mat-icon matSuffix>email</mat-icon>
                      <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                        Email is required
                      </mat-error>
                      <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                        Please enter a valid email
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Password</mat-label>
                      <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" required placeholder="Enter your password">
                      <mat-icon matSuffix (click)="hidePassword = !hidePassword" class="password-toggle">
                        {{hidePassword ? 'visibility_off' : 'visibility'}}
                      </mat-icon>
                      <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                        Password is required
                      </mat-error>
                      <mat-error *ngIf="loginForm.get('password')?.hasError('minlength')">
                        Password must be at least 6 characters
                      </mat-error>
                    </mat-form-field>

                    <button mat-raised-button color="primary" type="submit" 
                            [disabled]="loginForm.invalid || isLoading" class="full-width professional-form-button submit-button">
                      <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                      <span *ngIf="!isLoading">Sign In</span>
                    </button>
                  </form>

                  <mat-divider class="divider">
                    <span class="divider-text">OR</span>
                  </mat-divider>

                  <button mat-raised-button color="accent" (click)="loginWithAzureAD()" 
                          [disabled]="isLoading" class="full-width professional-form-button azure-button">
                    <mat-icon>account_box</mat-icon>
                    Sign in with Azure AD
                  </button>
                </div>
              </mat-tab>

              <!-- Register Tab -->
              <mat-tab label="Sign Up">
                <div class="tab-content professional-form-field">
                  <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="auth-form">
                    <div class="name-row">
                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>First Name</mat-label>
                        <input matInput formControlName="firstName" required placeholder="John">
                        <mat-error *ngIf="registerForm.get('firstName')?.hasError('required')">
                          First name is required
                        </mat-error>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>Last Name</mat-label>
                        <input matInput formControlName="lastName" required placeholder="Doe">
                        <mat-error *ngIf="registerForm.get('lastName')?.hasError('required')">
                          Last name is required
                        </mat-error>
                      </mat-form-field>
                    </div>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Email Address</mat-label>
                      <input matInput type="email" formControlName="email" required placeholder="john.doe@company.com">
                      <mat-icon matSuffix>email</mat-icon>
                      <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
                        Email is required
                      </mat-error>
                      <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
                        Please enter a valid email
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Organization Name</mat-label>
                      <input matInput formControlName="organizationName" placeholder="Your Company Inc.">
                      <mat-icon matSuffix>business</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Password</mat-label>
                      <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" required placeholder="Create a secure password">
                      <mat-icon matSuffix (click)="hidePassword = !hidePassword" class="password-toggle">
                        {{hidePassword ? 'visibility_off' : 'visibility'}}
                      </mat-icon>
                      <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                        Password is required
                      </mat-error>
                      <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
                        Password must be at least 6 characters
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Confirm Password</mat-label>
                      <input matInput type="password" formControlName="confirmPassword" required placeholder="Confirm your password">
                      <mat-icon matSuffix>lock</mat-icon>
                      <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
                        Please confirm your password
                      </mat-error>
                      <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('passwordMismatch')">
                        Passwords do not match
                      </mat-error>
                    </mat-form-field>

                    <button mat-raised-button color="primary" type="submit" 
                            [disabled]="registerForm.invalid || isLoading" class="full-width professional-form-button submit-button">
                      <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                      <span *ngIf="!isLoading">Create Account</span>
                    </button>
                  </form>
                </div>
              </mat-tab>
            </mat-tab-group>
          </mat-card-content>

          <mat-card-footer class="auth-footer">
            <p class="footer-text">
              © 2025 Meeting Manager - Secure Enterprise Platform
            </p>
            <div class="feature-highlights">
              <span class="feature">🔐 Enterprise Security</span>
              <span class="feature">⚡ AI-Powered</span>
              <span class="feature">📊 Analytics</span>
            </div>
          </mat-card-footer>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    /* Suppress Angular Material -ms-high-contrast deprecation warnings */
    :root {
      --mat-high-contrast-override: none;
    }

    @media (forced-colors: active) {
      .mat-icon, .mat-button, .mat-card, .mat-toolbar, .mat-badge, .mat-spinner {
        color: ButtonText;
        background-color: ButtonFace;
      }
    }

    @supports not (-ms-high-contrast: none) {
      .mat-icon, .mat-button, .mat-toolbar, .mat-spinner {
        color: inherit;
      }
    }

    .auth-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .auth-card-container {
      width: 100%;
      max-width: 480px;
    }

    .auth-card {
      border-radius: 20px;
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .auth-header {
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      color: white;
      padding: 40px 32px;
      text-align: center;
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" fill="white" opacity="0.1"><polygon points="1000,100 1000,0 0,100"/></svg>');
        background-size: cover;
      }
    }

    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
      position: relative;
      z-index: 1;
    }

    .logo-icon {
      font-size: 36px;
      margin-right: 16px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      padding: 12px;
      backdrop-filter: blur(10px);
    }

    .logo-container h2 {
      margin: 0;
      font-weight: 700;
      font-size: 28px;
      letter-spacing: -0.5px;
    }

    .subtitle {
      margin: 0;
      opacity: 0.9;
      font-size: 15px;
      font-weight: 400;
      position: relative;
      z-index: 1;
    }

    .auth-tabs {
      margin-top: 32px;
      
      ::ng-deep .mat-mdc-tab-header {
        border-bottom: 1px solid #f0f0f0;
        
        .mat-mdc-tab {
          height: 56px;
          font-weight: 600;
          font-size: 15px;
          text-transform: none;
          
          &.mdc-tab--active {
            color: #1976d2;
          }
        }
      }
    }

    .tab-content {
      padding: 32px 24px;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .name-row {
      display: flex;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      flex: 1;
    }

    .submit-button {
      height: 52px;
      font-weight: 600;
      font-size: 15px;
      margin-top: 8px;
      text-transform: none;
      box-shadow: 0 4px 16px rgba(25, 118, 210, 0.3);
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(25, 118, 210, 0.4);
      }
    }

    .azure-button {
      height: 52px;
      font-weight: 600;
      font-size: 15px;
      text-transform: none;
      background: linear-gradient(135deg, #0078d4, #005a9e);
      color: white;
      
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #005a9e, #004578);
        transform: translateY(-2px);
      }
      
      .mat-icon {
        margin-right: 8px;
      }
    }

    .password-toggle {
      cursor: pointer;
      user-select: none;
      transition: color 0.3s ease;
      
      &:hover {
        color: #1976d2;
      }
    }

    .divider {
      margin: 32px 0;
      position: relative;
      border-top: 1px solid #e0e0e0;
    }

    .divider-text {
      background: white;
      padding: 0 20px;
      color: #888;
      font-size: 13px;
      font-weight: 500;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .auth-footer {
      background: linear-gradient(135deg, #f8faff, #e3f2fd);
      padding: 24px 32px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }

    .footer-text {
      margin: 0 0 16px 0;
      font-size: 13px;
      color: #666;
      font-weight: 500;
    }

    .feature-highlights {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .feature {
      font-size: 12px;
      color: #555;
      background: white;
      padding: 6px 12px;
      border-radius: 16px;
      border: 1px solid #e0e0e0;
      font-weight: 500;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    // Mobile Responsive
    @media (max-width: 768px) {
      .auth-container {
        padding: 16px;
      }
      
      .auth-card-container {
        max-width: 100%;
      }

      .auth-header {
        padding: 32px 24px;
      }

      .logo-container h2 {
        font-size: 24px;
      }

      .subtitle {
        font-size: 14px;
      }

      .tab-content {
        padding: 24px 20px;
      }

      .name-row {
        flex-direction: column;
        gap: 16px;
      }

      .feature-highlights {
        gap: 8px;
      }

      .feature {
        font-size: 11px;
        padding: 4px 8px;
      }
    }
  `]
})
export class AuthComponent implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  selectedTabIndex = 0;
  returnUrl: string = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.createLoginForm();
    this.registerForm = this.createRegisterForm();
  }

  ngOnInit(): void {
    // Get return URL from route parameters
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  private createLoginForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  private createRegisterForm(): FormGroup {
    return this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      organizationName: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else if (confirmPassword?.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }
    
    return null;
  }

  onLogin(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      const credentials: LoginRequest = this.loginForm.value;

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.showMessage('Login successful!', 'success');
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.isLoading = false;
          const message = error.error?.message || 'Login failed. Please check your credentials.';
          this.showMessage(message, 'error');
        }
      });
    }
  }

  onRegister(): void {
    if (this.registerForm.valid && !this.isLoading) {
      this.isLoading = true;
      const userData: RegisterRequest = {
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        firstName: this.registerForm.value.firstName,
        lastName: this.registerForm.value.lastName,
        organizationName: this.registerForm.value.organizationName
      };

      this.authService.register(userData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.showMessage('Account created successfully!', 'success');
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.isLoading = false;
          const message = error.error?.message || 'Registration failed. Please try again.';
          this.showMessage(message, 'error');
        }
      });
    }
  }

  loginWithAzureAD(): void {
    this.authService.loginWithAzureAD();
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: type === 'success' ? 'success-snackbar' : 'error-snackbar'
    });
  }
}
