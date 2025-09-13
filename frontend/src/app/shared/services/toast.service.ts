import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export interface ToastConfig extends MatSnackBarConfig {
  type?: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  
  constructor(private snackBar: MatSnackBar) {}

  /**
   * Show a success toast message
   */
  showSuccess(message: string, duration: number = 3000): void {
    this.show(message, 'success', duration);
  }

  /**
   * Show an error toast message
   */
  showError(message: string, duration: number = 5000): void {
    this.show(message, 'error', duration);
  }

  /**
   * Show a warning toast message
   */
  showWarning(message: string, duration: number = 4000): void {
    this.show(message, 'warning', duration);
  }

  /**
   * Show an info toast message
   */
  showInfo(message: string, duration: number = 3000): void {
    this.show(message, 'info', duration);
  }

  /**
   * Show a custom toast with full configuration
   */
  showCustom(message: string, config: ToastConfig = {}): void {
    const defaultConfig: ToastConfig = {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: []
    };

    const mergedConfig = { ...defaultConfig, ...config };
    
    // Add type-specific classes
    if (mergedConfig.type) {
      const typeClass = `toast-${mergedConfig.type}`;
      mergedConfig.panelClass = Array.isArray(mergedConfig.panelClass) 
        ? [...mergedConfig.panelClass, typeClass]
        : [typeClass];
    }

    this.snackBar.open(message, 'Close', mergedConfig);
  }

  /**
   * Internal method to show toast with type styling
   */
  private show(message: string, type: 'success' | 'error' | 'warning' | 'info', duration: number): void {
    this.showCustom(message, { type, duration });
  }

  /**
   * Dismiss all current toasts
   */
  dismiss(): void {
    this.snackBar.dismiss();
  }
}
