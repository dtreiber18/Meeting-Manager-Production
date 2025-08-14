# Document Upload System Documentation

## 🎯 Overview

The Meeting Manager includes a comprehensive document upload system that allows users to upload, manage, and organize documents with cloud storage integration. The system supports multiple cloud providers and includes advanced metadata management, AI processing capabilities, and enterprise-grade security features.

## ✨ Key Features

### 📤 Upload Capabilities
- **Drag-and-drop file upload** with progress tracking
- **Multiple cloud storage providers**: OneDrive, Google Drive, and local storage
- **Document metadata management**: Title, description, type, tags, and access permissions
- **Meeting association**: Link documents to specific meetings or store globally
- **File type validation** and size restrictions
- **Batch upload support** for multiple files

### 🔐 Security & Permissions
- **Access control levels**: Public, Private, Restricted
- **Integration with authentication system** for user-based permissions
- **Secure cloud storage authentication**
- **Enterprise-grade security** with encrypted storage

### 🤖 AI Integration Ready
- **Document indexing** for full-text search
- **Content analysis** and keyword extraction
- **Summary generation** capabilities
- **Meeting context analysis** for relevant document suggestions

## 🏗️ Architecture

### Frontend Components

#### DocumentUploadDialogComponent
```typescript
// Location: frontend/src/app/shared/document-upload-dialog/
// Features: Modal interface, drag-and-drop, cloud provider selection
```

**Key Features:**
- Material Design modal interface
- File selection via drag-and-drop or file browser
- Cloud storage provider selection (OneDrive/Google Drive)
- Comprehensive metadata form with validation
- Progress tracking during upload
- Error handling and user feedback

#### DocumentListComponent
```typescript
// Location: frontend/src/app/shared/document-list/
// Features: Document display, search, filtering, management
```

**Key Features:**
- Grid and list view options
- Search and filter functionality
- Document preview capabilities
- Download and sharing options
- Meeting association display

#### Integration Points
- **Dashboard**: Green "Upload Document" button in header
- **Meeting Forms**: Blue "Upload Document" button in action section
- **MatDialog integration** for seamless modal experience

### Backend Services

#### Document Entity
```java
// Location: backend/src/main/java/com/g37/meetingmanager/model/Document.java
// Features: JPA entity with validation, cloud storage fields, AI processing support
```

**Database Schema:**
```sql
CREATE TABLE documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    document_type ENUM('AGENDA', 'MINUTES', 'PRESENTATION', 'HANDOUT', 'ATTACHMENT', 'OTHER'),
    storage_provider ENUM('ONEDRIVE', 'GOOGLEDRIVE', 'LOCAL'),
    cloud_file_id VARCHAR(255),
    cloud_url TEXT,
    access_permissions ENUM('PUBLIC', 'PRIVATE', 'RESTRICTED'),
    meeting_id INT,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    tags TEXT,
    ai_indexed BOOLEAN DEFAULT FALSE,
    ai_summary TEXT,
    ai_keywords TEXT,
    search_vector TEXT,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE SET NULL
);
```

#### DocumentService
```java
// Location: backend/src/main/java/com/g37/meetingmanager/service/DocumentService.java
// Features: CRUD operations, cloud storage integration, search capabilities
```

**Key Methods:**
- `uploadDocument()` - Handle file upload with metadata
- `searchDocuments()` - Full-text search with filtering
- `getDocumentsByMeeting()` - Retrieve meeting-associated documents
- `processDocumentForAI()` - Queue documents for AI processing

#### Cloud Storage Services
```java
// Location: backend/src/main/java/com/g37/meetingmanager/service/
// Features: OneDrive, Google Drive, and composite storage implementations
```

**Service Implementations:**
- `OneDriveStorageService` - Microsoft OneDrive integration
- `GoogleDriveStorageService` - Google Drive integration
- `CompositeCloudStorageService` - Unified interface for multiple providers

## 🔧 API Endpoints

### Document Management
```http
# Upload document
POST /api/documents/upload
Content-Type: multipart/form-data

# Get documents
GET /api/documents
GET /api/documents/{id}
GET /api/documents/meeting/{meetingId}

# Search documents
GET /api/documents/search?query={searchTerm}&type={docType}&provider={cloudProvider}

# Update document metadata
PUT /api/documents/{id}

# Delete document
DELETE /api/documents/{id}
```

### Sample API Usage

#### Upload Document
```javascript
const formData = new FormData();
formData.append('file', selectedFile);
formData.append('title', 'Meeting Agenda');
formData.append('description', 'Q1 Planning Meeting Agenda');
formData.append('documentType', 'AGENDA');
formData.append('storageProvider', 'ONEDRIVE');
formData.append('accessPermissions', 'PRIVATE');
formData.append('meetingId', '123');
formData.append('tags', 'planning,q1,agenda');

const response = await fetch('/api/documents/upload', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': `Bearer ${authToken}`
  }
});
```

#### Search Documents
```javascript
const searchResults = await fetch('/api/documents/search?query=planning&type=AGENDA&provider=ONEDRIVE', {
  headers: {
    'Authorization': `Bearer ${authToken}`
  }
});
```

## 🚀 Usage Guide

### For Users

#### Uploading Documents from Dashboard
1. Click the green "Upload Document" button in the dashboard header
2. Select or drag-and-drop files into the upload area
3. Choose cloud storage provider (OneDrive/Google Drive)
4. Fill in document metadata (title, description, type, tags)
5. Set access permissions (Public/Private/Restricted)
6. Click "Upload" to process the files

#### Uploading Documents from Meeting Forms
1. While creating or editing a meeting, click the blue "Upload Document" button
2. Follow the same upload process
3. Documents will be automatically associated with the meeting

#### Managing Uploaded Documents
1. View documents in the document list component
2. Search by title, description, or tags
3. Filter by document type, storage provider, or date
4. Download, share, or delete documents as needed

### For Developers

#### Extending Cloud Storage Providers
```java
// Implement the CloudStorageService interface
public class CustomStorageService implements CloudStorageService {
    @Override
    public StorageResult uploadFile(byte[] fileData, String fileName, String contentType) {
        // Custom implementation
    }
    
    @Override
    public byte[] downloadFile(String fileId) {
        // Custom implementation
    }
}
```

#### Adding Custom Document Types
```java
// Update the DocumentType enum
public enum DocumentType {
    AGENDA, MINUTES, PRESENTATION, HANDOUT, ATTACHMENT, 
    CUSTOM_TYPE, // Add new types here
    OTHER
}
```

## 🔧 Configuration

### Environment Variables
```yaml
# application.yml
document:
  storage:
    onedrive:
      client-id: ${ONEDRIVE_CLIENT_ID}
      client-secret: ${ONEDRIVE_CLIENT_SECRET}
      redirect-uri: ${ONEDRIVE_REDIRECT_URI}
    googledrive:
      client-id: ${GOOGLEDRIVE_CLIENT_ID}
      client-secret: ${GOOGLEDRIVE_CLIENT_SECRET}
      redirect-uri: ${GOOGLEDRIVE_REDIRECT_URI}
  upload:
    max-file-size: 50MB
    allowed-types: ["pdf", "doc", "docx", "ppt", "pptx", "txt", "jpg", "png"]
```

### Frontend Configuration
```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  document: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'jpg', 'png']
  }
};
```

## 🧪 Testing

### Unit Tests
```bash
# Backend tests
cd backend
mvn test

# Frontend tests
cd frontend
npm test
```

### Integration Testing
1. **Upload Flow**: Test complete upload workflow from UI to storage
2. **Cloud Storage**: Verify OneDrive and Google Drive integration
3. **Search Functionality**: Test document search and filtering
4. **Security**: Verify access permissions and authentication
5. **Meeting Association**: Test document-meeting relationships

### Manual Testing Scenarios
1. Upload various file types and sizes
2. Test drag-and-drop functionality
3. Verify cloud storage provider switching
4. Test metadata validation and error handling
5. Verify document search and filtering
6. Test permission-based access control

## 🔮 Future Enhancements

### Phase 1: Core Improvements
- **Version control** for documents
- **Collaborative editing** capabilities
- **Advanced search** with AI-powered suggestions
- **Bulk operations** for document management

### Phase 2: AI Integration
- **Automatic document categorization**
- **Content summarization**
- **Keyword extraction**
- **Related document suggestions**

### Phase 3: Enterprise Features
- **Document approval workflows**
- **Audit logging** and compliance
- **Advanced analytics** and reporting
- **Integration with enterprise document systems**

## 📚 Related Documentation
- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Authentication](./AUTHENTICATION.md) - Security and auth details
- [Environment Setup](./ENVIRONMENT_SETUP.md) - Development setup
- [Status](./STATUS.md) - Current implementation status

---

*Document Upload System implemented as part of the Meeting Manager enterprise application. For questions or support, refer to the development team documentation.*
