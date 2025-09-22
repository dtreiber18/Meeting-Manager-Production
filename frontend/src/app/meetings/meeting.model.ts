export interface Organization {
  id: number;
  name: string;
  domain: string;
  timezone: string;
  isActive: boolean;
  maxUsers: number;
  maxMeetings: number;
  subscriptionTier: string;
  currentUserCount: number;
  currentMeetingCount: number;
}

// Meeting room interface
export interface MeetingRoom {
  id: number;
  name: string;
  location?: string;
  description?: string;
  capacity: number;
  isActive: boolean;
  hasProjector: boolean;
  hasWhiteboard: boolean;
  hasVideoConferencing: boolean;
  hasAirConditioning: boolean;
  isAccessible: boolean;
  equipment?: string;
  timeZone?: string;
  createdAt: string;
  updatedAt: string;
}

// Meeting note interface  
export interface MeetingNote {
  id: number;
  title: string;
  content: string;
  noteType: 'GENERAL' | 'AGENDA_ITEM' | 'DECISION' | 'ACTION_ITEM' | 'FOLLOW_UP' | 'RISK' | 'ISSUE' | 'MINUTES';
  isPublic: boolean;
  isPinned: boolean;
  tags?: string;
  createdAt: string;
  updatedAt: string;
  authorId: number;
}

// Meeting attachment interface
export interface MeetingAttachment {
  id: number;
  originalFileName: string;
  storedFileName: string;
  fileSize: number;
  fileType: string;
  description?: string;
  isPublic: boolean;
  isVirusScanned: boolean;
  isArchived: boolean;
  tags?: string;
  uploadedAt: string;
  uploadedById: number;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle?: string;
  department?: string;
  profileImageUrl?: string;
  bio?: string;
  isActive: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  timezone: string;
  language: string;
  displayName: string;
  fullName: string;
  roles: string[];
}

export interface Participant {
  id: number;
  email: string;
  name: string;
  participantRole: string;
  invitationStatus: string;
  attendanceStatus: string;
  isRequired: boolean;
  canEdit: boolean;
  canInviteOthers: boolean;
  attendanceDurationMinutes?: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  organizer: boolean;
  presenter: boolean;
  external: boolean;
  attended: boolean;
  internal: boolean;
}

export interface ActionItem {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  dueDate: string;
  startDate?: string;
  completedAt?: string;
  completed: boolean;
  isRecurring: boolean;
  recurringPattern?: string;
  estimatedHours?: number;
  actualHours?: number;
  notes?: string;
  completionNotes?: string;
  tags?: string;
  createdAt: string;
  updatedAt: string;
  lastReminderSent?: string;
  assignee?: User;
  reporter?: User;
  organization: Organization;
  subTasks: ActionItem[];
  parentActionItem?: ActionItem;
  overdue: boolean;
  progressPercentage: number;
  assignedTo?: string;
}

export interface Organization {
  id: number;
  name: string;
  domain: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  industry?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  timezone: string;
  isActive: boolean;
  maxUsers: number;
  maxMeetings: number;
  subscriptionTier: string;
  subscriptionExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
  currentUserCount: number;
  currentMeetingCount: number;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash?: string;
  phoneNumber?: string;
  jobTitle?: string;
  department?: string;
  profileImageUrl?: string;
  bio?: string;
  isActive: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  timezone: string;
  language: string;
  azureAdObjectId?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  roles: string[];
  displayName: string;
  fullName: string;
}

export interface Participant {
  id: number;
  email: string;
  name: string;
  participantRole: string;
  
  // Enhanced classification system
  participantType: 'CLIENT' | 'G37' | 'OTHER';
  department?: string;
  organization?: string;
  title?: string;
  phoneNumber?: string;
  timezone?: string;
  preferredLanguage?: string;
  
  // Status and attendance
  invitationStatus: string;
  attendanceStatus: string;
  attended: boolean;
  isRequired: boolean;
  
  // Permissions and roles
  canEdit: boolean;
  canInviteOthers: boolean;
  internal: boolean;
  external: boolean;
  organizer: boolean;
  presenter: boolean;
  
  // Time tracking
  joinedAt?: string;
  leftAt?: string;
  attendanceDurationMinutes?: number;
  invitedAt: string;
  respondedAt?: string;
  lastReminderSentAt?: string;
  
  // Additional metadata
  notes?: string;
  avatar?: string;
  linkedInProfile?: string;
  companyWebsite?: string;
  
  // System fields
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface ActionItem {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  dueDate: string;
  startDate?: string;
  completedAt?: string;
  completed: boolean;
  isRecurring: boolean;
  recurringPattern?: string;
  estimatedHours?: number;
  actualHours?: number;
  notes?: string;
  completionNotes?: string;
  tags?: string;
  createdAt: string;
  updatedAt: string;
  lastReminderSent?: string;
  assignee?: User;
  reporter?: User;
  organization: Organization;
  subTasks: ActionItem[];
  parentActionItem?: ActionItem;
  overdue: boolean;
  progressPercentage: number;
  assignedTo?: string;
}

export interface FilterConfig {
  dateRange?: { start: string; end: string };
  meetingType?: string[];
  participants?: string[];
  hasActionItems?: boolean;
  hasRecording?: boolean;
}

export interface Meeting {
  id: number;
  title: string;
  description: string;
  agenda?: string;
  summary?: string;
  keyDecisions?: string;
  nextSteps?: string;
  startTime: string;
  endTime: string;
  meetingType: string;
  status: string;
  priority: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  recurrenceEndDate?: string;
  location?: string;
  meetingLink?: string;
  recordingUrl?: string;
  transcriptUrl?: string;
  isPublic: boolean;
  requiresApproval: boolean;
  allowRecording: boolean;
  autoTranscription: boolean;
  aiAnalysisEnabled: boolean;
  aiInsights?: string;
  createdAt: string;
  updatedAt: string;
  organization: Organization;
  organizer: User;
  meetingRoom?: MeetingRoom;
  participants: Participant[];
  actionItems: ActionItem[];
  notes: MeetingNote[];
  attachments: MeetingAttachment[];
  details: string;
  durationInMinutes: number;
  upcoming: boolean;
  inProgress: boolean;
  subject: string;
  type: string;
  // Legacy fields for backward compatibility
  date?: string;
  time?: string;
  isJustCompleted?: boolean;
}

export interface Meeting {
  id: number;
  title: string;
  description: string;
  agenda?: string;
  summary?: string;
  keyDecisions?: string;
  nextSteps?: string;
  startTime: string;
  endTime: string;
  meetingType: string;
  status: string;
  priority: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  recurrenceEndDate?: string;
  location?: string;
  meetingLink?: string;
  recordingUrl?: string;
  transcriptUrl?: string;
  isPublic: boolean;
  requiresApproval: boolean;
  allowRecording: boolean;
  autoTranscription: boolean;
  aiAnalysisEnabled: boolean;
  aiInsights?: string;
  createdAt: string;
  updatedAt: string;
  organization: Organization;
  organizer: User;
  meetingRoom?: MeetingRoom;
  participants: Participant[];
  actionItems: ActionItem[];
  notes: MeetingNote[];
  attachments: MeetingAttachment[];
  details: string;
  durationInMinutes: number;
  upcoming: boolean;
  inProgress: boolean;
  subject: string;
  type: string;
  // Compatibility properties for existing components
  date?: string;
  time?: string;
  isJustCompleted?: boolean;
}
