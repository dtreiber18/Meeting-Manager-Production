import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { 
  DocumentType, 
  AccessPermission, 
  StorageProvider,
  DocumentUploadRequest 
} from '../../models/document.interface';
import { DocumentService } from '../../services/document.service';
import { AuthService } from '../../auth/auth.service';
import { MeetingService } from '../../meetings/meeting.service';

export interface DocumentUploadDialogData {
  meetingId?: number;
  preselectedMeeting?: BasicMeeting;
}

export interface BasicMeeting {
  id: number;
  subject: string;
  date?: string;
}

@Component({
  selector: 'app-document-upload-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule
  ],
  templateUrl: './document-upload-dialog.component.html',
  styleUrls: ['./document-upload-dialog.component.scss']
})
export class DocumentUploadDialogComponent implements OnInit {
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  meetings: BasicMeeting[] = [];
  availableMeetings: BasicMeeting[] = [];
  isUploading = false;
  uploadProgress = 0;

  // Enum references for template
  DocumentType = DocumentType;
  AccessPermission = AccessPermission;
  StorageProvider = StorageProvider;

  // Options for dropdowns
  documentTypes = [
    { value: DocumentType.AGENDA, label: 'Agenda' },
    { value: DocumentType.MINUTES, label: 'Meeting Minutes' },
    { value: DocumentType.PRESENTATION, label: 'Presentation' },
    { value: DocumentType.REPORT, label: 'Report' },
    { value: DocumentType.NOTES, label: 'Notes' },
    { value: DocumentType.ATTACHMENT, label: 'Attachment' },
    { value: DocumentType.OTHER, label: 'Other' }
  ];

  accessPermissions = [
    { value: AccessPermission.PUBLIC, label: 'Public', description: 'Anyone can view' },
    { value: AccessPermission.MEETING_PARTICIPANTS, label: 'Meeting Participants', description: 'Only meeting participants' },
    { value: AccessPermission.RESTRICTED, label: 'Restricted', description: 'Limited access' },
    { value: AccessPermission.PRIVATE, label: 'Private', description: 'Only you can view' }
  ];

  storageProviders = [
    { value: StorageProvider.ONEDRIVE, label: 'OneDrive', icon: 'cloud' },
    { value: StorageProvider.GOOGLEDRIVE, label: 'Google Drive', icon: 'cloud_queue' },
    { value: StorageProvider.LOCAL, label: 'Local Storage', icon: 'storage' }
  ];

  constructor(
    private fb: FormBuilder,
    private documentService: DocumentService,
    private authService: AuthService,
    private meetingService: MeetingService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<DocumentUploadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DocumentUploadDialogData
  ) {
    this.uploadForm = this.fb.group({
      meetingId: [data?.meetingId || null],
      title: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', Validators.maxLength(1000)],
      documentType: [DocumentType.OTHER, Validators.required],
      accessPermissions: [AccessPermission.MEETING_PARTICIPANTS, Validators.required],
      storageProvider: [StorageProvider.ONEDRIVE, Validators.required],
      tags: ['', Validators.maxLength(255)]
    });
  }

  ngOnInit(): void {
    this.loadMeetings();
  }

  private loadMeetings(): void {
    this.meetingService.getMeetings().subscribe({
      next: (meetings) => {
        this.availableMeetings = meetings.map(meeting => ({
          id: meeting.id,
          subject: meeting.subject,
          date: meeting.startTime?.split('T')[0] || meeting.date || new Date().toISOString().split('T')[0]
        }));
      },
      error: (error) => {
        console.error('Error loading meetings:', error);
        // Fallback to mock meetings for development
        this.availableMeetings = [
          { id: 1, subject: 'Weekly Standup', date: '2024-12-15' },
          { id: 2, subject: 'Sprint Planning', date: '2024-12-16' },
          { id: 3, subject: 'Project Review', date: '2024-12-17' }
        ];
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      
      // Auto-fill title from filename if title is empty
      if (!this.uploadForm.get('title')?.value) {
        const fileName = this.selectedFile.name;
        const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
        this.uploadForm.patchValue({ title: nameWithoutExtension });
      }
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
      
      // Auto-fill title from filename if title is empty
      if (!this.uploadForm.get('title')?.value) {
        const fileName = this.selectedFile.name;
        const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
        this.uploadForm.patchValue({ title: nameWithoutExtension });
      }
    }
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
  }

  getFileIcon(): string {
    if (!this.selectedFile) return 'insert_drive_file';
    
    const extension = this.selectedFile.name.split('.').pop()?.toLowerCase() || '';
    return this.documentService.getFileIcon(extension);
  }

  formatFileSize(): string {
    if (!this.selectedFile) return '';
    return this.documentService.formatFileSize(this.selectedFile.size);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onUpload(): void {
    if (!this.selectedFile || this.uploadForm.invalid) {
      this.snackBar.open('Please select a file and fill in required fields', 'Close', { duration: 3000 });
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;

    const formValue = this.uploadForm.value;
    const currentUser = this.authService.getCurrentUser();
    const userId = currentUser?.id ? (typeof currentUser.id === 'string' ? parseInt(currentUser.id, 10) : currentUser.id) : 1;
    const uploadRequest: DocumentUploadRequest = {
      file: this.selectedFile,
      meetingId: formValue.meetingId || undefined,
      title: formValue.title,
      description: formValue.description || undefined,
      documentType: formValue.documentType,
      accessPermissions: formValue.accessPermissions,
      storageProvider: formValue.storageProvider,
      uploadedBy: userId, // Use authenticated user ID or fallback to 1
      tags: formValue.tags || undefined
    };

    this.documentService.uploadDocument(uploadRequest).subscribe({
      next: (document) => {
        this.isUploading = false;
        this.uploadProgress = 100;
        this.snackBar.open('Document uploaded successfully!', 'Close', { duration: 3000 });
        this.dialogRef.close(document);
      },
      error: (error) => {
        this.isUploading = false;
        this.uploadProgress = 0;
        console.error('Upload error:', error);
        this.snackBar.open('Upload failed: ' + (error.error?.message || error.message), 'Close', { 
          duration: 5000 
        });
      }
    });
  }

  // Validation helpers
  get titleError(): string {
    const control = this.uploadForm.get('title');
    if (control?.hasError('required')) return 'Title is required';
    if (control?.hasError('maxlength')) return 'Title is too long';
    return '';
  }

  get descriptionError(): string {
    const control = this.uploadForm.get('description');
    if (control?.hasError('maxlength')) return 'Description is too long';
    return '';
  }

  get tagsError(): string {
    const control = this.uploadForm.get('tags');
    if (control?.hasError('maxlength')) return 'Tags are too long';
    return '';
  }
}
