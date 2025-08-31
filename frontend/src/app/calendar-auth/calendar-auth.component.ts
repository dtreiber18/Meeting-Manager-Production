import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { CalendarService } from '../services/calendar.service';

@Component({
  selector: 'app-calendar-auth',
  standalone: true,
  imports: [
    CommonModule, 
    MatButtonModule, 
    MatCardModule, 
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="calendar-auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Connect Your Outlook Calendar</mat-card-title>
          <mat-card-subtitle>
            Sync Meeting Manager with your Outlook calendar for automatic scheduling
          </mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="auth-content">
            <mat-icon class="calendar-icon">event</mat-icon>
            
            <div class="status-section" *ngIf="calendarStatus">
              <div class="status-connected" *ngIf="calendarStatus.isConnected">
                <mat-icon>check_circle</mat-icon>
                <span>Calendar Connected</span>
                <p>Your Outlook calendar is connected. Meetings will automatically sync.</p>
                <button mat-raised-button color="warn" (click)="disconnectCalendar()">
                  Disconnect Calendar
                </button>
              </div>
              
              <div class="status-disconnected" *ngIf="!calendarStatus.isConnected">
                <mat-icon>cancel</mat-icon>
                <span>Calendar Not Connected</span>
                <p *ngIf="calendarStatus.userEmail">Connect your Outlook calendar to automatically schedule meetings.</p>
                <p *ngIf="!calendarStatus.userEmail">Please log in to connect your Outlook calendar.</p>
                <button mat-raised-button color="primary" (click)="connectCalendar()" [disabled]="!calendarStatus.userEmail">
                  <mat-icon>link</mat-icon>
                  Connect Outlook Calendar
                </button>
                <button mat-raised-button color="accent" (click)="goToLogin()" *ngIf="!calendarStatus.userEmail">
                  <mat-icon>login</mat-icon>
                  Log In
                </button>
              </div>
            </div>
            
            <div class="loading" *ngIf="loading">
              <mat-icon>hourglass_empty</mat-icon>
              <span>Checking calendar status...</span>
            </div>
          </div>
        </mat-card-content>
        
        <mat-card-actions>
          <button mat-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            Back to Meetings
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .calendar-auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 20px;
    }
    
    .auth-card {
      max-width: 500px;
      width: 100%;
    }
    
    .auth-content {
      text-align: center;
      padding: 20px 0;
    }
    
    .calendar-icon {
      font-size: 64px;
      height: 64px;
      width: 64px;
      color: #1976d2;
      margin-bottom: 20px;
    }
    
    .status-section {
      margin: 20px 0;
    }
    
    .status-connected {
      color: #4caf50;
    }
    
    .status-disconnected {
      color: #f44336;
    }
    
    .status-connected mat-icon,
    .status-disconnected mat-icon {
      font-size: 24px;
      margin-right: 8px;
      vertical-align: middle;
    }
    
    .status-connected span,
    .status-disconnected span {
      font-size: 18px;
      font-weight: 500;
    }
    
    .status-connected p,
    .status-disconnected p {
      margin: 10px 0 20px 0;
      color: #666;
    }
    
    .loading {
      color: #666;
    }
    
    .loading mat-icon {
      animation: spin 2s linear infinite;
      margin-right: 8px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    mat-card-actions {
      text-align: center;
    }
  `]
})
export class CalendarAuthComponent implements OnInit {
  calendarStatus: any = null;
  loading = true;

  constructor(
    private calendarService: CalendarService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.checkCalendarStatus();
  }

  async checkCalendarStatus() {
    try {
      this.loading = true;
      this.calendarStatus = await this.calendarService.getCalendarStatus().toPromise();
    } catch (error: any) {
      console.error('Error checking calendar status:', error);
      
      // Handle authentication errors
      if (error.status === 404 || (error.error && error.error.error === 'User not found')) {
        // User is not authenticated or doesn't exist
        this.calendarStatus = { isConnected: false, userEmail: '', isExpired: false };
        this.snackBar.open('Please log in to check calendar status', 'Close', { 
          duration: 3000 
        });
      } else {
        // Other errors
        this.calendarStatus = { isConnected: false, userEmail: '', isExpired: false };
        this.snackBar.open('Error checking calendar status', 'Close', { 
          duration: 3000 
        });
      }
    } finally {
      this.loading = false;
    }
  }

  async connectCalendar() {
    try {
      const authUrl = await this.calendarService.getAuthUrl().toPromise();
      if (authUrl && authUrl.authUrl) {
        // Redirect current window to Microsoft OAuth (no popup)
        window.location.href = authUrl.authUrl;
      }
    } catch (error) {
      console.error('Error getting auth URL:', error);
      this.snackBar.open('Error connecting to calendar', 'Close', { 
        duration: 3000 
      });
    }
  }

  async disconnectCalendar() {
    try {
      await this.calendarService.disconnectCalendar().toPromise();
      this.calendarStatus = { isConnected: false };
      this.snackBar.open('Calendar disconnected successfully', 'Close', { 
        duration: 3000 
      });
    } catch (error) {
      console.error('Error disconnecting calendar:', error);
      this.snackBar.open('Error disconnecting calendar', 'Close', { 
        duration: 3000 
      });
    }
  }

  goBack() {
    this.router.navigate(['/meetings']);
  }

  goToLogin() {
    this.router.navigate(['/auth']);
  }
}
