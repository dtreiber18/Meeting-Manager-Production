import { Injectable } from '@angular/core';
import { AuthService, User } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthTestHelper {
  
  constructor(private authService: AuthService) {}

  /**
   * Test authentication flow with demo credentials
   */
  async testDemoLogin(): Promise<boolean> {
    try {
      console.log('Testing demo login...');
      
      const result = await this.authService.login({
        email: 'demo@acme.com',
        password: 'password123'
      }).toPromise();

      if (result) {
        console.log('Login successful:', result);
        
        // Verify authentication state
        const isAuthenticated = this.authService.isAuthenticated();
        const currentUser = this.authService.getCurrentUser();
        
        console.log('Is authenticated:', isAuthenticated);
        console.log('Current user:', currentUser);
        
        return isAuthenticated && currentUser !== null;
      }
      
      return false;
    } catch (error) {
      console.error('Login test failed:', error);
      return false;
    }
  }

  /**
   * Test authentication state persistence
   */
  testAuthStatePersistence(): boolean {
    console.log('Testing auth state persistence...');
    
    // Check if user data persists in localStorage
    const storedToken = localStorage.getItem('mm_auth_token');
    const storedUser = localStorage.getItem('mm_user');
    
    console.log('Stored token:', storedToken ? 'Present' : 'Missing');
    console.log('Stored user:', storedUser ? JSON.parse(storedUser) : 'Missing');
    
    return !!(storedToken && storedUser);
  }

  /**
   * Test logout functionality
   */
  testLogout(): boolean {
    console.log('Testing logout...');
    
    this.authService.logout();
    
    // Verify state is cleared
    const isAuthenticated = this.authService.isAuthenticated();
    const currentUser = this.authService.getCurrentUser();
    const storedToken = localStorage.getItem('mm_auth_token');
    
    console.log('Is authenticated after logout:', isAuthenticated);
    console.log('Current user after logout:', currentUser);
    console.log('Stored token after logout:', storedToken);
    
    return !isAuthenticated && currentUser === null && storedToken === null;
  }

  /**
   * Test permission checking
   */
  testPermissionChecking(): boolean {
    console.log('Testing permission checking...');
    
    if (!this.authService.isAuthenticated()) {
      console.log('User not authenticated, skipping permission test');
      return false;
    }

    const hasReadPermission = this.authService.hasPermission('READ_MEETINGS');
    const hasAdminRole = this.authService.hasRole('ADMIN');
    
    console.log('Has READ_MEETINGS permission:', hasReadPermission);
    console.log('Has ADMIN role:', hasAdminRole);
    
    return true; // Just testing the methods work without errors
  }

  /**
   * Run complete authentication test suite
   */
  async runCompleteTest(): Promise<boolean> {
    console.log('=== Starting Complete Authentication Test ===');
    
    try {
      // Test 1: Login
      const loginSuccess = await this.testDemoLogin();
      if (!loginSuccess) {
        console.error('Login test failed');
        return false;
      }
      
      // Test 2: Persistence
      const persistenceSuccess = this.testAuthStatePersistence();
      if (!persistenceSuccess) {
        console.error('Persistence test failed');
        return false;
      }
      
      // Test 3: Permissions
      const permissionSuccess = this.testPermissionChecking();
      if (!permissionSuccess) {
        console.error('Permission test failed');
        return false;
      }
      
      // Test 4: Logout
      const logoutSuccess = this.testLogout();
      if (!logoutSuccess) {
        console.error('Logout test failed');
        return false;
      }
      
      console.log('=== All Authentication Tests Passed! ===');
      return true;
      
    } catch (error) {
      console.error('Authentication test suite failed:', error);
      return false;
    }
  }
}
