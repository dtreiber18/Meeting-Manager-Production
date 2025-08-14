-- Documents table for storing document metadata and external storage references
-- This supports integration with OneDrive, Google Drive, and AI processing

CREATE TABLE IF NOT EXISTS documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- Meeting association
    meeting_id INT,
    
    -- Document basic info
    title VARCHAR(255) NOT NULL,
    description TEXT,
    notes TEXT,
    
    -- File information
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'pdf', 'docx', 'txt', 'gdoc', etc.
    file_size BIGINT, -- in bytes
    mime_type VARCHAR(100),
    
    -- External storage info
    storage_provider ENUM('ONEDRIVE', 'GOOGLEDRIVE', 'LOCAL') NOT NULL DEFAULT 'ONEDRIVE',
    external_file_id VARCHAR(255), -- OneDrive/Google Drive file ID
    external_url TEXT, -- Direct access URL
    download_url TEXT, -- Download URL
    
    -- Document classification
    document_type ENUM('AGENDA', 'MINUTES', 'PRESENTATION', 'REPORT', 'NOTES', 'ATTACHMENT', 'OTHER') NOT NULL DEFAULT 'OTHER',
    tags JSON, -- Array of tags for categorization
    
    -- Access control
    access_permissions ENUM('PUBLIC', 'MEETING_PARTICIPANTS', 'RESTRICTED', 'PRIVATE') NOT NULL DEFAULT 'MEETING_PARTICIPANTS',
    uploaded_by BIGINT, -- User ID who uploaded the document
    
    -- AI processing fields
    ai_processed BOOLEAN DEFAULT FALSE,
    ai_indexed BOOLEAN DEFAULT FALSE,
    ai_summary TEXT, -- AI-generated summary
    ai_keywords JSON, -- AI-extracted keywords
    content_text LONGTEXT, -- Extracted text content for search
    
    -- Timestamps
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    
    -- Indexes for better performance
    INDEX idx_meeting_id (meeting_id),
    INDEX idx_document_type (document_type),
    INDEX idx_upload_date (upload_date),
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_ai_processed (ai_processed),
    INDEX idx_storage_provider (storage_provider),
    INDEX idx_external_file_id (external_file_id),
    
    -- Full-text search indexes
    FULLTEXT(title, description, content_text, ai_summary)
);

-- Insert sample documents for testing
INSERT INTO documents (
    meeting_id, title, description, file_name, file_type, storage_provider, 
    document_type, access_permissions, uploaded_by, ai_processed
) VALUES 
(1, 'Q4 Planning Agenda', 'Agenda for quarterly planning meeting', 'q4-agenda.pdf', 'pdf', 'ONEDRIVE', 'AGENDA', 'MEETING_PARTICIPANTS', 1, TRUE),
(1, 'Budget Presentation', 'Financial overview and projections', 'budget-2024.pptx', 'pptx', 'GOOGLEDRIVE', 'PRESENTATION', 'MEETING_PARTICIPANTS', 1, FALSE),
(2, 'Meeting Minutes', 'Notes from the team standup', 'standup-notes.docx', 'docx', 'ONEDRIVE', 'MINUTES', 'PUBLIC', 2, TRUE),
(NULL, 'Company Handbook', 'Employee handbook document', 'handbook.pdf', 'pdf', 'GOOGLEDRIVE', 'OTHER', 'PUBLIC', 1, TRUE);

SELECT 'Documents table created successfully' as status;
