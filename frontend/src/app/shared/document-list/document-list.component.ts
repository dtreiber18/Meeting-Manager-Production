import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Document } from '../../models/document.interface';
import { DocumentService } from '../../services/document.service';
import { DocumentUploadDialogComponent } from '../document-upload-dialog/document-upload-dialog.component';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent implements OnInit {
  @Input() meetingId?: number;
  @Input() showUploadButton = true;
  @Input() showSearchFilter = true;
  @Input() maxHeight?: string;
  
  @Output() documentSelected = new EventEmitter<Document>();
  @Output() documentUploaded = new EventEmitter<Document>();

  documents: Document[] = [];
  filteredDocuments: Document[] = [];
  searchTerm = '';
  isLoading = false;

  constructor(
    private documentService: DocumentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.isLoading = true;
    
    if (this.meetingId) {
      this.documentService.getDocumentsByMeeting(this.meetingId).subscribe({
        next: (documents) => {
          this.documents = documents;
          this.applySearchFilter();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading documents:', error);
          this.snackBar.open('Error loading documents', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
    } else {
      this.documentService.getAllDocuments().subscribe({
        next: (documents) => {
          this.documents = documents;
          this.applySearchFilter();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading documents:', error);
          this.snackBar.open('Error loading documents', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
    }
  }

  onSearch(): void {
    this.applySearchFilter();
  }

  private applySearchFilter(): void {
    if (!this.searchTerm.trim()) {
      this.filteredDocuments = [...this.documents];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredDocuments = this.documents.filter(doc => 
        doc.title.toLowerCase().includes(term) ||
        (doc.description && doc.description.toLowerCase().includes(term)) ||
        doc.fileName.toLowerCase().includes(term) ||
        (doc.tags && doc.tags.toLowerCase().includes(term))
      );
    }
  }

  onUploadDocument(): void {
    const dialogRef = this.dialog.open(DocumentUploadDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: { meetingId: this.meetingId }
    });

    dialogRef.afterClosed().subscribe((result: Document) => {
      if (result) {
        this.documents.unshift(result);
        this.applySearchFilter();
        this.documentUploaded.emit(result);
        this.snackBar.open('Document uploaded successfully!', 'Close', { duration: 3000 });
      }
    });
  }

  onDocumentClick(document: Document): void {
    this.documentSelected.emit(document);
  }

  onDownload(document: Document, event: Event): void {
    event.stopPropagation();
    
    if (document.externalUrl) {
      window.open(document.externalUrl, '_blank');
    } else {
      this.documentService.downloadDocument(document.id!).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = window.document.createElement('a');
          a.href = url;
          a.download = document.fileName;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Download error:', error);
          this.snackBar.open('Download failed', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onDelete(document: Document, event: Event): void {
    event.stopPropagation();
    
    if (confirm(`Are you sure you want to delete "${document.title}"?`)) {
      this.documentService.deleteDocument(document.id!).subscribe({
        next: () => {
          this.documents = this.documents.filter(d => d.id !== document.id);
          this.applySearchFilter();
          this.snackBar.open('Document deleted successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Delete error:', error);
          this.snackBar.open('Delete failed', 'Close', { duration: 3000 });
        }
      });
    }
  }

  getDocumentIcon(document: Document): string {
    return this.documentService.getFileIcon(document.fileType);
  }

  getDocumentTypeDisplayName(document: Document): string {
    return this.documentService.getDocumentTypeDisplayName(document.documentType);
  }

  getAccessPermissionDisplayName(document: Document): string {
    return this.documentService.getAccessPermissionDisplayName(document.accessPermissions);
  }

  formatFileSize(document: Document): string {
    return this.documentService.formatFileSize(document.fileSize);
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }

  getStorageProviderIcon(document: Document): string {
    switch (document.storageProvider) {
      case 'ONEDRIVE': return 'cloud';
      case 'GOOGLEDRIVE': return 'cloud_queue';
      case 'LOCAL': return 'storage';
      default: return 'cloud';
    }
  }
}
