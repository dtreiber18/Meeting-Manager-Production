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
    storage_provider ENUM('onedrive', 'googledrive', 'local') NOT NULL,
    external_file_id VARCHAR(255), -- OneDrive/Google Drive file ID
    external_url TEXT, -- Direct access URL
    download_url TEXT, -- Download URL
    
    -- Document classification
    document_type ENUM('agenda', 'minutes', 'presentation', 'report', 'notes', 'attachment', 'other') NOT NULL DEFAULT 'other',
    tags JSON, -- Array of tags for categorization
    
    -- Access control
    access_permissions ENUM('public', 'meeting_participants', 'restricted', 'private') NOT NULL DEFAULT 'meeting_participants',
    uploaded_by BIGINT, -- User ID who uploaded
    
    -- AI processing status
    ai_processed BOOLEAN DEFAULT FALSE,
    ai_indexed BOOLEAN DEFAULT FALSE,
    ai_summary TEXT, -- AI-generated summary
    ai_keywords JSON, -- AI-extracted keywords
    content_text LONGTEXT, -- Extracted text content for search
    
    -- Timestamps
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for search and performance
    INDEX idx_meeting_id (meeting_id),
    INDEX idx_document_type (document_type),
    INDEX idx_storage_provider (storage_provider),
    INDEX idx_upload_date (upload_date),
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_ai_processed (ai_processed),
    
    -- Full-text search index
    FULLTEXT INDEX ft_search (title, description, notes, content_text, ai_summary),
    
    -- Foreign key constraints
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE SET NULL,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create document_access table for fine-grained permissions
CREATE TABLE IF NOT EXISTS document_access (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    access_level ENUM('read', 'write', 'admin') NOT NULL DEFAULT 'read',
    granted_by BIGINT,
    granted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_document_user (document_id, user_id),
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert some sample document types for testing
INSERT IGNORE INTO documents (title, file_name, file_type, storage_provider, document_type, tags, access_permissions, uploaded_by, content_text) VALUES
('Q3 Planning Meeting Agenda', 'q3-planning-agenda.pdf', 'pdf', 'onedrive', 'agenda', '["planning", "quarterly", "strategy"]', 'meeting_participants', 1, 'Quarterly planning meeting agenda covering strategic initiatives, budget review, and team objectives.'),
('Product Launch Meeting Minutes', 'product-launch-minutes.docx', 'docx', 'googledrive', 'minutes', '["product", "launch", "meeting-notes"]', 'meeting_participants', 1, 'Meeting minutes from product launch planning session including action items and timeline.'),
('Market Analysis Presentation', 'market-analysis.pptx', 'pptx', 'onedrive', 'presentation', '["market", "analysis", "research"]', 'public', 1, 'Comprehensive market analysis presentation covering competitive landscape and opportunities.');
