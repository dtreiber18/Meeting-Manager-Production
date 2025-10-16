import { Injectable } from '@angular/core';
import { Meeting } from './meeting.model';
import { Participant, ParticipantType, ParticipantRole, InvitationStatus, AttendanceStatus } from '../models/meeting-participant.model';

// Backend data interfaces (what we receive from API)
interface BackendMeetingData {
  id: number;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  meetingType?: string;
  status?: string;
  participants?: BackendParticipant[];
  actionItems?: BackendActionItem[];
  nextSteps?: string | string[];
  summary?: string;
  details?: string;
  recordingUrl?: string;
  // Fathom integration fields
  source?: string;
  fathomRecordingId?: string;
  fathomRecordingUrl?: string;
  fathomSummary?: string;
  transcript?: string;
  transcriptEntriesJson?: string; // JSON string from backend
  [key: string]: unknown; // For additional fields we might not have typed
}

interface BackendParticipant {
  id?: number;
  name: string;
  email: string;
  attended?: boolean;
  participantRole?: string;
  invitationStatus?: string;
  attendanceStatus?: string;
  isRequired?: boolean;
  canEdit?: boolean;
  canInviteOthers?: boolean;
  [key: string]: unknown;
}

interface BackendActionItem {
  id: number;
  description: string;
  assignedTo?: string;
  dueDate: string;
  priority?: string;
  status?: string;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class MeetingMapperService {

  /**
   * Transforms backend meeting data to frontend-compatible format
   */
  transformMeetingFromBackend(backendMeeting: BackendMeetingData): Meeting {
    // Extract date and time from startTime
    const startDate = new Date(backendMeeting.startTime);
    const dateStr = startDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = startDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Map participants to simple format
    const participants = backendMeeting.participants?.map((p: BackendParticipant) => ({
      id: p.id,
      email: p.email,
      name: p.name,
      role: ParticipantRole.ATTENDEE,
      invitationStatus: InvitationStatus.ACCEPTED,
      attendanceStatus: p.attended ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT,
      isRequired: false,
      canEdit: false,
      canInviteOthers: false,
      attendanceDurationMinutes: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attended: p.attended || false,
      type: ParticipantType.OTHER
    })) || [];

    // Map action items to simple format
    const actionItems = backendMeeting.actionItems?.map((ai: BackendActionItem) => ({
      id: ai.id,
      title: ai.description, // Use description as title
      description: ai.description,
      status: ai.status || 'pending',
      priority: ai.priority?.toLowerCase() || 'medium',
      type: 'ACTION',
      dueDate: ai.dueDate,
      startDate: undefined,
      completedAt: undefined,
      completed: ai.status?.toLowerCase() === 'completed' || false,
      isRecurring: false,
      recurringPattern: undefined,
      estimatedHours: undefined,
      actualHours: undefined,
      notes: undefined,
      completionNotes: undefined,
      tags: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastReminderSent: undefined,
      assignee: undefined,
      reporter: undefined,
      organization: {
        id: 1,
        name: 'Default Organization',
        domain: 'example.com',
        description: undefined,
        website: undefined,
        logoUrl: undefined,
        industry: undefined,
        phone: undefined,
        address: undefined,
        city: undefined,
        state: undefined,
        zipCode: undefined,
        country: undefined,
        timezone: 'UTC',
        isActive: true,
        maxUsers: 1000,
        maxMeetings: 1000,
        subscriptionTier: 'BASIC',
        subscriptionExpiresAt: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        currentUserCount: 1,
        currentMeetingCount: 1
      },
      subTasks: [],
      parentActionItem: undefined,
      overdue: new Date(ai.dueDate) < new Date(),
      progressPercentage: ai.status?.toLowerCase() === 'completed' ? 100 : 0,
      assignedTo: ai.assignedTo || 'Unassigned'
    })) || [];

    // Convert nextSteps string to array if it's a string, then back to string for Meeting interface
    let nextStepsString: string = '';
    if (typeof backendMeeting.nextSteps === 'string') {
      nextStepsString = backendMeeting.nextSteps;
    } else if (Array.isArray(backendMeeting.nextSteps)) {
      nextStepsString = backendMeeting.nextSteps.join('; ');
    }

    // Parse Fathom transcript entries from JSON string to array
    let transcriptEntries: Array<{ speaker: string; timestamp: number; text: string }> | undefined;
    if (backendMeeting.transcriptEntriesJson) {
      try {
        const parsed = JSON.parse(backendMeeting.transcriptEntriesJson);
        // Transform backend format to frontend format
        // Backend: { speaker: { display_name: string }, text: string, timestamp: "00:01:30" }
        // Frontend: { speaker: string, text: string, timestamp: number (seconds) }
        const entries = parsed.map((entry: any) => ({
          speaker: entry.speaker?.display_name || entry.speaker?.name || 'Unknown Speaker',
          text: entry.text || '',
          timestamp: this.parseTimestampToSeconds(entry.timestamp || '00:00:00')
        }));
        transcriptEntries = entries;
        console.log(`✅ Parsed ${entries.length} transcript entries for meeting "${backendMeeting.title}"`);
      } catch (error) {
        console.error('❌ Failed to parse transcriptEntriesJson:', error);
        transcriptEntries = undefined;
      }
    }

    // Create a simplified meeting object with required properties
    const transformedMeeting: Meeting = {
      id: backendMeeting.id,
      title: backendMeeting.title || '',
      description: backendMeeting.description || '',
      agenda: undefined,
      summary: backendMeeting.summary || '',
      keyDecisions: undefined,
      nextSteps: nextStepsString,
      startTime: backendMeeting.startTime,
      endTime: backendMeeting.endTime || backendMeeting.startTime,
      meetingType: backendMeeting.meetingType || 'GENERAL',
      status: backendMeeting.status || 'SCHEDULED',
      priority: 'MEDIUM',
      isRecurring: false,
      recurrencePattern: undefined,
      recurrenceEndDate: undefined,
      location: undefined,
      meetingLink: undefined,
      recordingUrl: backendMeeting.recordingUrl,
      transcriptUrl: undefined,
      isPublic: false,
      requiresApproval: false,
      allowRecording: true,
      autoTranscription: false,
      aiAnalysisEnabled: false,
      aiInsights: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      organization: {
        id: 1,
        name: 'Default Organization',
        domain: 'example.com',
        description: undefined,
        website: undefined,
        logoUrl: undefined,
        industry: undefined,
        phone: undefined,
        address: undefined,
        city: undefined,
        state: undefined,
        zipCode: undefined,
        country: undefined,
        timezone: 'UTC',
        isActive: true,
        maxUsers: 1000,
        maxMeetings: 1000,
        subscriptionTier: 'BASIC',
        subscriptionExpiresAt: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        currentUserCount: 1,
        currentMeetingCount: 1
      },
      organizer: {
        id: 1,
        firstName: 'System',
        lastName: 'User',
        email: 'system@example.com',
        jobTitle: undefined,
        department: undefined,
        profileImageUrl: undefined,
        bio: undefined,
        isActive: true,
        emailNotifications: true,
        pushNotifications: true,
        timezone: 'UTC',
        language: 'en',
        displayName: 'System User',
        fullName: 'System User',
        roles: ['USER'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      meetingRoom: undefined,
      participants,
      actionItems,
      notes: [],
      attachments: [],
      details: backendMeeting.details || backendMeeting.description || '',
      durationInMinutes: 60,
      upcoming: new Date(backendMeeting.startTime) > new Date(),
      inProgress: false,
      subject: backendMeeting.title || '',
      type: backendMeeting.meetingType || 'GENERAL',
      // Legacy fields for backward compatibility
      date: dateStr,
      time: timeStr,
      isJustCompleted: this.isRecentlyCompleted(backendMeeting),
      // Fathom integration fields
      source: backendMeeting.source as 'mm' | 'n8n' | 'fathom' | undefined,
      fathomRecordingId: backendMeeting.fathomRecordingId,
      fathomRecordingUrl: backendMeeting.fathomRecordingUrl,
      fathomSummary: backendMeeting.fathomSummary,
      transcript: backendMeeting.transcript,
      transcriptEntries
    };

    return transformedMeeting;
  }

  /**
   * Maps backend action item status to frontend format
   */
  private mapActionItemStatus(backendStatus: string): 'pending' | 'in-progress' | 'completed' {
    switch (backendStatus?.toLowerCase()) {
      case 'open':
      case 'new':
        return 'pending';
      case 'in_progress':
      case 'inprogress':
        return 'in-progress';
      case 'completed':
      case 'done':
        return 'completed';
      default:
        return 'pending';
    }
  }

  /**
   * Determines if a meeting was recently completed
   */
  private isRecentlyCompleted(meeting: BackendMeetingData): boolean {
    if (meeting.status === 'COMPLETED' && meeting.endTime) {
      const endTime = new Date(meeting.endTime);
      const now = new Date();
      const hoursSinceEnd = (now.getTime() - endTime.getTime()) / (1000 * 60 * 60);
      return hoursSinceEnd <= 24; // Completed within last 24 hours
    }
    return false;
  }

  /**
   * Converts Fathom timestamp format (HH:MM:SS) to seconds
   * @param timestamp String in format "00:01:30" or "01:30"
   * @returns Total seconds
   */
  private parseTimestampToSeconds(timestamp: string): number {
    const parts = timestamp.split(':').map(p => parseInt(p, 10));
    if (parts.length === 3) {
      // HH:MM:SS format
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      // MM:SS format
      return parts[0] * 60 + parts[1];
    }
    return 0;
  }

  /**
   * Transforms array of backend meetings
   */
  transformMeetingsFromBackend(backendMeetings: BackendMeetingData[]): Meeting[] {
    return backendMeetings.map(meeting => this.transformMeetingFromBackend(meeting));
  }

  /**
   * Transforms frontend meeting data to backend-compatible format for updates
   */
  transformMeetingToBackend(frontendMeeting: Meeting): BackendMeetingData {
    return {
      id: frontendMeeting.id,
      title: frontendMeeting.title,
      description: frontendMeeting.description,
      startTime: frontendMeeting.startTime,
      endTime: frontendMeeting.endTime,
      meetingType: frontendMeeting.meetingType,
      status: frontendMeeting.status,
      participants: frontendMeeting.participants?.map(p => ({
        id: p.id === Date.now() ? undefined : p.id, // Don't send temporary IDs
        name: p.name,
        email: p.email,
        participantRole: p.role,
        invitationStatus: p.invitationStatus || 'PENDING',
        attendanceStatus: p.attendanceStatus || 'UNKNOWN',
        isRequired: p.isRequired || false,
        canEdit: p.canEdit || false,
        canInviteOthers: p.canInviteOthers || false
      })) || []
    } as BackendMeetingData;
  }
}
