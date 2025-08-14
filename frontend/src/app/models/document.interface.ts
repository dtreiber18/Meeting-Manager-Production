export interface Document {
  id?: number;
  meetingId?: number;
  title: string;
  description?: string;
  notes?: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
  mimeType?: string;
  storageProvider: StorageProvider;
  externalFileId?: string;
  externalUrl?: string;
  downloadUrl?: string;
  documentType: DocumentType;
  tags?: string;
  accessPermissions: AccessPermission;
  uploadedBy?: number;
  aiProcessed?: boolean;
  aiIndexed?: boolean;
  aiSummary?: string;
  aiKeywords?: string;
  contentText?: string;
  uploadDate?: string;
  lastModified?: string;
}

export enum StorageProvider {
  ONEDRIVE = 'ONEDRIVE',
  GOOGLEDRIVE = 'GOOGLEDRIVE',
  LOCAL = 'LOCAL'
}

export enum DocumentType {
  AGENDA = 'AGENDA',
  MINUTES = 'MINUTES',
  PRESENTATION = 'PRESENTATION',
  REPORT = 'REPORT',
  NOTES = 'NOTES',
  ATTACHMENT = 'ATTACHMENT',
  OTHER = 'OTHER'
}

export enum AccessPermission {
  PUBLIC = 'PUBLIC',
  MEETING_PARTICIPANTS = 'MEETING_PARTICIPANTS',
  RESTRICTED = 'RESTRICTED',
  PRIVATE = 'PRIVATE'
}

export interface DocumentStatistics {
  totalDocuments: number;
  aiProcessedDocuments: number;
  aiIndexedDocuments: number;
  totalSizeBytes: number;
  totalSizeFormatted: string;
}

export interface DocumentUploadRequest {
  file: File;
  meetingId?: number;
  title?: string;
  description?: string;
  documentType: DocumentType;
  accessPermissions: AccessPermission;
  storageProvider: StorageProvider;
  uploadedBy?: number;
  tags?: string;
}

export interface DocumentSearchFilters {
  searchTerm?: string;
  meetingId?: number;
  documentType?: DocumentType;
  accessPermissions?: AccessPermission;
  uploadedBy?: number;
}
