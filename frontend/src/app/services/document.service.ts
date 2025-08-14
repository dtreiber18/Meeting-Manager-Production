import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Document, 
  DocumentStatistics, 
  DocumentUploadRequest, 
  DocumentSearchFilters,
  DocumentType,
  AccessPermission
} from '../models/document.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) {}

  // Upload document
  uploadDocument(uploadRequest: DocumentUploadRequest): Observable<Document> {
    const formData = new FormData();
    formData.append('file', uploadRequest.file);
    
    if (uploadRequest.meetingId) {
      formData.append('meetingId', uploadRequest.meetingId.toString());
    }
    if (uploadRequest.title) {
      formData.append('title', uploadRequest.title);
    }
    if (uploadRequest.description) {
      formData.append('description', uploadRequest.description);
    }
    formData.append('documentType', uploadRequest.documentType);
    formData.append('accessPermissions', uploadRequest.accessPermissions);
    formData.append('storageProvider', uploadRequest.storageProvider);
    if (uploadRequest.uploadedBy) {
      formData.append('uploadedBy', uploadRequest.uploadedBy.toString());
    }
    if (uploadRequest.tags) {
      formData.append('tags', uploadRequest.tags);
    }

    return this.http.post<Document>(`${this.apiUrl}/upload`, formData);
  }

  // Get all documents
  getAllDocuments(): Observable<Document[]> {
    return this.http.get<Document[]>(this.apiUrl);
  }

  // Get document by ID
  getDocumentById(id: number): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrl}/${id}`);
  }

  // Get documents by meeting
  getDocumentsByMeeting(meetingId: number): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/meeting/${meetingId}`);
  }

  // Get accessible documents by meeting
  getAccessibleDocumentsByMeeting(meetingId: number, userId: number): Observable<Document[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<Document[]>(`${this.apiUrl}/meeting/${meetingId}/accessible`, { params });
  }

  // Get documents by user
  getDocumentsByUser(userId: number): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Search documents with filters
  searchDocuments(filters: DocumentSearchFilters): Observable<Document[]> {
    let params = new HttpParams();
    
    if (filters.searchTerm) {
      params = params.set('searchTerm', filters.searchTerm);
    }
    if (filters.meetingId) {
      params = params.set('meetingId', filters.meetingId.toString());
    }
    if (filters.documentType) {
      params = params.set('documentType', filters.documentType);
    }
    if (filters.accessPermissions) {
      params = params.set('accessPermissions', filters.accessPermissions);
    }
    if (filters.uploadedBy) {
      params = params.set('uploadedBy', filters.uploadedBy.toString());
    }

    return this.http.get<Document[]>(`${this.apiUrl}/search`, { params });
  }

  // Search documents by tag
  getDocumentsByTag(tag: string): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/tag/${tag}`);
  }

  // Update document
  updateDocument(id: number, document: Document): Observable<Document> {
    return this.http.put<Document>(`${this.apiUrl}/${id}`, document);
  }

  // Delete document
  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Download document
  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, { 
      responseType: 'blob',
      observe: 'body' 
    });
  }

  // Get document statistics
  getDocumentStatistics(): Observable<DocumentStatistics> {
    return this.http.get<DocumentStatistics>(`${this.apiUrl}/statistics`);
  }

  // Get recent documents
  getRecentDocuments(): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/recent`);
  }

  // Get documents needing AI processing
  getDocumentsNeedingAiProcessing(): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/ai/pending`);
  }

  // Update AI processing status
  updateAiProcessingStatus(
    id: number, 
    aiSummary?: string, 
    aiKeywords?: string, 
    contentText?: string
  ): Observable<Document> {
    let params = new HttpParams();
    
    if (aiSummary) {
      params = params.set('aiSummary', aiSummary);
    }
    if (aiKeywords) {
      params = params.set('aiKeywords', aiKeywords);
    }
    if (contentText) {
      params = params.set('contentText', contentText);
    }

    return this.http.put<Document>(`${this.apiUrl}/${id}/ai-processing`, null, { params });
  }

  // Helper methods
  getDocumentTypeDisplayName(type: DocumentType): string {
    switch (type) {
      case DocumentType.AGENDA: return 'Agenda';
      case DocumentType.MINUTES: return 'Minutes';
      case DocumentType.PRESENTATION: return 'Presentation';
      case DocumentType.REPORT: return 'Report';
      case DocumentType.NOTES: return 'Notes';
      case DocumentType.ATTACHMENT: return 'Attachment';
      case DocumentType.OTHER: return 'Other';
      default: return 'Unknown';
    }
  }

  getAccessPermissionDisplayName(permission: AccessPermission): string {
    switch (permission) {
      case AccessPermission.PUBLIC: return 'Public';
      case AccessPermission.MEETING_PARTICIPANTS: return 'Meeting Participants';
      case AccessPermission.RESTRICTED: return 'Restricted';
      case AccessPermission.PRIVATE: return 'Private';
      default: return 'Unknown';
    }
  }

  formatFileSize(bytes?: number): string {
    if (!bytes || bytes === 0) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }

  getFileIcon(fileType: string): string {
    const type = fileType.toLowerCase();
    
    if (['pdf'].includes(type)) return 'picture_as_pdf';
    if (['doc', 'docx'].includes(type)) return 'description';
    if (['xls', 'xlsx'].includes(type)) return 'table_chart';
    if (['ppt', 'pptx'].includes(type)) return 'slideshow';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(type)) return 'image';
    if (['mp4', 'avi', 'mov', 'wmv'].includes(type)) return 'movie';
    if (['mp3', 'wav', 'flac', 'aac'].includes(type)) return 'audiotrack';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(type)) return 'archive';
    if (['txt', 'md', 'log'].includes(type)) return 'text_snippet';
    if (['html', 'css', 'js', 'ts', 'json', 'xml'].includes(type)) return 'code';
    
    return 'insert_drive_file';
  }
}
