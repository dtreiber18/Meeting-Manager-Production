export interface Participant {
  id: string;
  name: string;
  email: string;
  attended?: boolean;
}

export interface ActionItem {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  priority?: 'high' | 'medium' | 'low';
  status?: 'pending' | 'in-progress' | 'completed';
}

export interface FilterConfig {
  dateRange?: { start: string; end: string };
  meetingType?: string[];
  participants?: string[];
  hasActionItems?: boolean;
  hasRecording?: boolean;
}

export interface Meeting {
  id: string;
  subject: string;
  title?: string;
  date: string;
  time?: string;
  summary?: string;
  details?: string;
  type: string;
  participants: Participant[];
  actionItems: ActionItem[];
  nextSteps: string[];
  isJustCompleted?: boolean;
  recordingUrl?: string;
}
