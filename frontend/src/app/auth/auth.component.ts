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
                <div class="tab-content">
                  <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="auth-form">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Email Address</mat-label>
                      <input matInput type="email" formControlName="email" required>
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
                      <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" required>
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
                            [disabled]="loginForm.invalid || isLoading" class="full-width submit-button">
                      <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                      <span *ngIf="!isLoading">Sign In</span>
                    </button>
                  </form>

                  <mat-divider class="divider">
                    <span class="divider-text">OR</span>
                  </mat-divider>

                  <button mat-raised-button color="accent" (click)="loginWithAzureAD()" 
                          [disabled]="isLoading" class="full-width azure-button">
                    <mat-icon>account_box</mat-icon>
                    Sign in with Azure AD
                  </button>
                </div>
              </mat-tab>

              <!-- Register Tab -->
              <mat-tab label="Sign Up">
                <div class="tab-content">
                  <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="auth-form">
                    <div class="name-row">
                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>First Name</mat-label>
                        <input matInput formControlName="firstName" required>
                        <mat-error *ngIf="registerForm.get('firstName')?.hasError('required')">
                          First name is required
                        </mat-error>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>Last Name</mat-label>
                        <input matInput formControlName="lastName" required>
                        <mat-error *ngIf="registerForm.get('lastName')?.hasError('required')">
                          Last name is required
                        </mat-error>
                      </mat-form-field>
                    </div>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Email Address</mat-label>
                      <input matInput type="email" formControlName="email" required>
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
                      <input matInput formControlName="organizationName">
                      <mat-icon matSuffix>business</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Password</mat-label>
                      <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" required>
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
                      <input matInput type="password" formControlName="confirmPassword" required>
                      <mat-icon matSuffix>lock</mat-icon>
                      <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
                        Please confirm your password
                      </mat-error>
                      <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('passwordMismatch')">
                        Passwords do not match
                      </mat-error>
                    </mat-form-field>

                    <button mat-raised-button color="primary" type="submit" 
                            [disabled]="registerForm.invalid || isLoading" class="full-width submit-button">
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
      max-width: 450px;
    }

    .auth-card {
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .auth-header {
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      color: white;
      padding: 32px 24px;
      text-align: center;
    }

    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
    }

    .logo-icon {
      font-size: 32px;
      margin-right: 12px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 8px;
    }

    .logo-container h2 {
      margin: 0;
      font-weight: 600;
      font-size: 24px;
    }

    .subtitle {
      margin: 0;
      opacity: 0.9;
      font-size: 14px;
    }

    .auth-tabs {
      margin-top: 24px;
    }

    .tab-content {
      padding: 24px 0;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
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
      height: 48px;
      font-weight: 600;
      margin-top: 8px;
    }

    .azure-button {
      height: 48px;
      font-weight: 500;
    }

    .password-toggle {
      cursor: pointer;
      user-select: none;
    }

    .divider {
      margin: 24px 0;
      position: relative;
    }

    .divider-text {
      background: white;
      padding: 0 16px;
      color: #666;
      font-size: 12px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .auth-footer {
      background-color: #fafafa;
      padding: 20px 24px;
      text-align: center;
      border-top: 1px solid #e0e0e0;
    }

    .footer-text {
      margin: 0 0 12px 0;
      font-size: 12px;
      color: #666;
    }

    .feature-highlights {
      display: flex;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .feature {
      font-size: 11px;
      color: #888;
      background: white;
      padding: 4px 8px;
      border-radius: 12px;
      border: 1px solid #e0e0e0;
    }

    @media (max-width: 768px) {
      .auth-container {
        padding: 16px;
      }
      
      .auth-card-container {
        max-width: 100%;
      }

      .name-row {
        flex-direction: column;
        gap: 16px;
      }

      .feature-highlights {
        gap: 8px;
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
