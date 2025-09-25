import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface TextInputDialogData {
  title: string;
  placeholder?: string;
  required?: boolean;
  initialValue?: string;
  multiline?: boolean;
}

@Component({
  selector: 'app-text-input-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="text-input-dialog">
      <h2 mat-dialog-title>{{ data.title }}</h2>
      
      <mat-dialog-content class="dialog-content">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>{{ data.placeholder || 'Enter text' }}</mat-label>
          <input 
            *ngIf="!data.multiline"
            matInput 
            [(ngModel)]="inputValue"
            [placeholder]="data.placeholder || ''"
            (keydown.enter)="onSubmit()"
            #inputElement>
          <textarea 
            *ngIf="data.multiline"
            matInput 
            [(ngModel)]="inputValue"
            [placeholder]="data.placeholder || ''"
            rows="4"
            #inputElement>
          </textarea>
        </mat-form-field>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button 
          mat-raised-button 
          color="primary" 
          (click)="onSubmit()"
          [disabled]="data.required && !inputValue.trim()">
          OK
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .text-input-dialog {
      min-width: 400px;
    }
    
    .dialog-content {
      padding: 16px 0;
    }
    
    .full-width {
      width: 100%;
    }
    
    .dialog-actions {
      padding: 8px 0 0 0;
      margin: 0;
    }
    
    .dialog-actions button {
      margin-left: 8px;
    }
  `]
})
export class TextInputDialogComponent {
  inputValue: string;

  constructor(
    public dialogRef: MatDialogRef<TextInputDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TextInputDialogData
  ) {
    this.inputValue = data.initialValue || '';
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSubmit(): void {
    if (this.data.required && !this.inputValue.trim()) {
      return;
    }
    this.dialogRef.close(this.inputValue);
  }
}