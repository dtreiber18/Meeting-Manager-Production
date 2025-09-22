import { Injectable } from '@angular/core';
import { Meeting } from './meeting.model';

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
  [key: string]: unknown; // For additional fields we might not have typed
}

interface BackendParticipant {
  id: number;
  name: string;
  email: string;
  attended?: boolean;
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
      participantRole: 'ATTENDEE',
      invitationStatus: 'ACCEPTED',
      attendanceStatus: p.attended ? 'ATTENDED' : 'NOT_ATTENDED',
      isRequired: false,
      canEdit: false,
      canInviteOthers: false,
      attendanceDurationMinutes: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: undefined,
      organizer: false,
      presenter: false,
      external: false,
      attended: p.attended || false,
      internal: true,
      participantType: 'OTHER' as const,
      department: undefined,
      organization: undefined,
      title: undefined,
      invitedAt: new Date().toISOString()
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
      isJustCompleted: this.isRecentlyCompleted(backendMeeting)
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
   * Transforms array of backend meetings
   */
  transformMeetingsFromBackend(backendMeetings: BackendMeetingData[]): Meeting[] {
    return backendMeetings.map(meeting => this.transformMeetingFromBackend(meeting));
  }
}
