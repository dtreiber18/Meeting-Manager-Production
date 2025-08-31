import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthTestHelper } from './auth-test-helper.service';

@Component({
  selector: 'app-auth-test',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div style="padding: 20px;">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Authentication Test</mat-card-title>
          <mat-card-subtitle>Test the authentication system functionality</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content style="padding: 20px;">
          <div class="test-results">
            <div *ngFor="let result of testResults" 
                 [style.color]="result.success ? 'green' : 'red'"
                 style="margin: 5px 0;">
              <mat-icon>{{ result.success ? 'check_circle' : 'error' }}</mat-icon>
              {{ result.message }}
            </div>
          </div>
          
          <div *ngIf="isRunning" style="margin: 20px 0;">
            <mat-icon style="animation: spin 1s linear infinite;">refresh</mat-icon>
            Running tests...
          </div>
        </mat-card-content>
        
        <mat-card-actions>
          <button mat-raised-button color="primary" 
                  (click)="runTests()" 
                  [disabled]="isRunning">
            <mat-icon>play_arrow</mat-icon>
            Run Authentication Tests
          </button>
          
          <button mat-button (click)="clearResults()">
            <mat-icon>clear</mat-icon>
            Clear Results
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class AuthTestComponent {
  testResults: { message: string; success: boolean }[] = [];
  isRunning = false;

  constructor(private authTestHelper: AuthTestHelper) {}

  async runTests() {
    this.isRunning = true;
    this.testResults = [];

    try {
      // Test individual components
      await this.testLogin();
      this.testPersistence();
      this.testPermissions();
      await this.testLogout();
      
      this.addResult('✅ All authentication tests completed successfully!', true);
      
    } catch (error) {
      this.addResult(`❌ Test suite failed: ${error}`, false);
    } finally {
      this.isRunning = false;
    }
  }

  private async testLogin() {
    try {
      const success = await this.authTestHelper.testDemoLogin();
      this.addResult(`Login Test: ${success ? 'PASSED' : 'FAILED'}`, success);
      return success;
    } catch (error) {
      this.addResult(`Login Test: FAILED - ${error}`, false);
      throw error;
    }
  }

  private testPersistence() {
    try {
      const success = this.authTestHelper.testAuthStatePersistence();
      this.addResult(`Persistence Test: ${success ? 'PASSED' : 'FAILED'}`, success);
      return success;
    } catch (error) {
      this.addResult(`Persistence Test: FAILED - ${error}`, false);
      throw error;
    }
  }

  private testPermissions() {
    try {
      const success = this.authTestHelper.testPermissionChecking();
      this.addResult(`Permission Test: ${success ? 'PASSED' : 'FAILED'}`, success);
      return success;
    } catch (error) {
      this.addResult(`Permission Test: FAILED - ${error}`, false);
      throw error;
    }
  }

  private async testLogout() {
    try {
      const success = this.authTestHelper.testLogout();
      this.addResult(`Logout Test: ${success ? 'PASSED' : 'FAILED'}`, success);
      return success;
    } catch (error) {
      this.addResult(`Logout Test: FAILED - ${error}`, false);
      throw error;
    }
  }

  private addResult(message: string, success: boolean) {
    this.testResults.push({ message, success });
  }

  clearResults() {
    this.testResults = [];
  }
}
