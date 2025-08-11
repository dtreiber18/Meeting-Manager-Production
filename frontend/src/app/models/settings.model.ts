export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FieldMapping {
  meetingDate: string;
  meetingTime: string;
  meetingSubject: string;
  meetingParticipants: string;
  meetingSummary: string;
  meetingActionItems: string;
  meetingNextSteps: string;
  meetingDetails: string;
  meetingRecording?: string;
  meetingDuration?: string;
  meetingType?: string;
  attendedParticipants?: string;
  absentParticipants?: string;
}

export interface AppConfig {
  id: string;
  name: string;
  type: 'source' | 'destination';
  connectionType: 'api' | 'folder';
  apiUrl?: string;
  apiKey?: string;
  folderPath?: string;
  username?: string;
  password?: string;
  fieldMapping: FieldMapping;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AccountFormData {
  name: string;
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export type SettingsTab = 'account' | 'sources' | 'destinations';
export type SettingsView = 'summary' | 'detail';
