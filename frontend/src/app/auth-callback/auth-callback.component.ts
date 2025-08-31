import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CalendarService } from '../services/calendar.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatCardModule, MatIconModule],
  template: `
    <div class="callback-container">
      <mat-card class="callback-card">
        <mat-card-content>
          <div class="callback-content">
            <mat-icon class="callback-icon">sync</mat-icon>
            
            <div *ngIf="processing" class="processing">
              <mat-spinner diameter="40"></mat-spinner>
              <h3>Processing Calendar Authorization</h3>
              <p>Please wait while we connect your Outlook calendar...</p>
            </div>
            
            <div *ngIf="success" class="success">
              <mat-icon color="primary">check_circle</mat-icon>
              <h3>Calendar Connected Successfully!</h3>
              <p>Your Outlook calendar is now connected. Meetings will automatically sync.</p>
            </div>
            
            <div *ngIf="error" class="error">
              <mat-icon color="warn">error</mat-icon>
              <h3>Calendar Authorization Failed</h3>
              <p>{{ errorMessage }}</p>
              <div class="error-help">
                <p><strong>Common causes:</strong></p>
                <ul>
                  <li>Microsoft App Registration not properly configured</li>
                  <li>Invalid client credentials in backend configuration</li>
                  <li>Missing API permissions for Calendar access</li>
                </ul>
                <p>Check the <code>CALENDAR_SETUP_GUIDE.md</code> file for setup instructions.</p>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 20px;
    }
    
    .callback-card {
      max-width: 500px;
      width: 100%;
    }
    
    .callback-content {
      text-align: center;
      padding: 40px 20px;
    }
    
    .callback-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: #1976d2;
      margin-bottom: 20px;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    
    .processing, .success, .error {
      margin-top: 20px;
    }
    
    .success mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: #4caf50;
    }
    
    .error mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: #f44336;
    }
    
    h3 {
      margin: 20px 0 10px 0;
      color: #333;
    }
    
    p {
      color: #666;
      margin-bottom: 0;
    }
    
    .error-help {
      margin-top: 20px;
      padding: 15px;
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 4px;
      text-align: left;
    }
    
    .error-help ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    
    .error-help li {
      margin: 5px 0;
    }
    
    .error-help code {
      background-color: #f8f9fa;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: monospace;
    }
  `]
})
export class AuthCallbackComponent implements OnInit {
  processing = true;
  success = false;
  error = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private calendarService: CalendarService
  ) {}

  ngOnInit() {
    // Get the authorization code from URL parameters
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      const error = params['error'];
      const errorDescription = params['error_description'];

      if (error) {
        this.handleError(`Authorization failed: ${errorDescription || error}`);
        return;
      }

      if (code) {
        this.handleAuthorizationCode(code);
      } else {
        this.handleError('No authorization code received');
      }
    });
  }

  private async handleAuthorizationCode(code: string) {
    try {
      console.log('Processing authorization code:', code);
      const result = await this.calendarService.handleOAuthCallback(code).toPromise();
      console.log('OAuth callback result:', result);
      
      this.processing = false;
      this.success = true;
      
      // Redirect to calendar setup page after 3 seconds
      setTimeout(() => {
        this.router.navigate(['/calendar-setup']);
      }, 3000);
      
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      let errorMessage = 'Failed to process authorization. Please try again.';
      
      if (error && error.error) {
        errorMessage = `Error: ${error.error.error || error.error}`;
      }
      
      this.handleError(errorMessage);
    }
  }

  private handleError(message: string) {
    this.processing = false;
    this.error = true;
    this.errorMessage = message;
    
    // Redirect to calendar setup page after 5 seconds
    setTimeout(() => {
      this.router.navigate(['/calendar-setup']);
    }, 5000);
  }
}
