-- Schema for meetings, participants, and action_items tables
-- Drop old tables if they exist
DROP TABLE IF EXISTS action_items;
DROP TABLE IF EXISTS participants;
DROP TABLE IF EXISTS meetings;

-- Create meetings table
CREATE TABLE meetings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject VARCHAR(255),
  summary TEXT,
  details TEXT,
  next_steps TEXT,
  recording_url VARCHAR(512),
  type VARCHAR(64),
  date DATE,
  time VARCHAR(16)
);

-- Create participants table
CREATE TABLE participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  attended BOOLEAN,
  meeting_id INT,
  CONSTRAINT fk_meeting_participant FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
);

-- Create action_items table
CREATE TABLE action_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  description TEXT,
  assigned_to VARCHAR(255),
  due_date DATE,
  priority VARCHAR(16),
  status VARCHAR(32),
  meeting_id INT,
  CONSTRAINT fk_meeting_actionitem FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
);
