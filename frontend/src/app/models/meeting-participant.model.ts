export interface MeetingParticipant {
  id?: number;
  email: string;
  name?: string;
  participantRole: ParticipantRole;
  invitationStatus: InvitationStatus;
  attendanceStatus: AttendanceStatus;
  isRequired: boolean;
  canEdit: boolean;
  canInviteOthers: boolean;
  joinedAt?: string;
  leftAt?: string;
  attendanceDurationMinutes?: number;
  invitedAt?: string;
  respondedAt?: string;
  lastReminderSentAt?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    fullName?: string;
  };
}

export enum ParticipantRole {
  ORGANIZER = 'ORGANIZER',
  PRESENTER = 'PRESENTER',
  ATTENDEE = 'ATTENDEE',
  OPTIONAL = 'OPTIONAL',
  OBSERVER = 'OBSERVER',
  ACTION_OWNER = 'ACTION_OWNER'
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  TENTATIVE = 'TENTATIVE',
  NO_RESPONSE = 'NO_RESPONSE'
}

export enum AttendanceStatus {
  UNKNOWN = 'UNKNOWN',
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  LEFT_EARLY = 'LEFT_EARLY'
}

// Legacy compatibility interface for existing code
export interface Participant {
  id?: number;
  name: string;
  email: string;
  type?: ParticipantType;
  role?: ParticipantRole;
  department?: string;
  organization?: string;
  title?: string;
  phone?: string;
  invitationStatus?: InvitationStatus;
  attendanceStatus?: AttendanceStatus;
  joinedAt?: string;
  leftAt?: string;
  attendanceDurationMinutes?: number;
  isRequired?: boolean;
  canEdit?: boolean;
  canInviteOthers?: boolean;
  createdAt?: string;
  updatedAt?: string;

  // Legacy fields
  attended?: boolean;

  // CRM integration fields
  isExternal?: boolean;
  crmContactId?: string;
  crmSource?: 'zoho' | 'salesforce' | 'hubspot';
}

export enum ParticipantType {
  CLIENT = 'CLIENT',
  G37 = 'G37',
  OTHER = 'OTHER'
}