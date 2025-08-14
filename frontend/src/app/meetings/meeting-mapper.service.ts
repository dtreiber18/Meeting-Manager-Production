import { Injectable } from '@angular/core';
import { Meeting } from './meeting.model';

@Injectable({ providedIn: 'root' })
export class MeetingMapperService {

  /**
   * Transforms backend meeting data to frontend-compatible format
   */
  transformMeetingFromBackend(backendMeeting: any): Meeting {
    // Extract date and time from startTime
    const startDate = new Date(backendMeeting.startTime);
    const dateStr = startDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = startDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Map participants to simple format
    const participants = backendMeeting.participants?.map((p: any) => ({
      id: p.id.toString(),
      name: p.name,
      email: p.email,
      attended: p.attended || false
    })) || [];

    // Map action items to simple format
    const actionItems = backendMeeting.actionItems?.map((ai: any) => ({
      id: ai.id.toString(),
      description: ai.description,
      assignedTo: ai.assignedTo || ai.assignee?.fullName || 'Unassigned',
      dueDate: ai.dueDate,
      priority: ai.priority?.toLowerCase() || 'medium',
      status: this.mapActionItemStatus(ai.status)
    })) || [];

    // Convert nextSteps string to array if it's a string
    let nextSteps: string[] = [];
    if (typeof backendMeeting.nextSteps === 'string') {
      nextSteps = [backendMeeting.nextSteps];
    } else if (Array.isArray(backendMeeting.nextSteps)) {
      nextSteps = backendMeeting.nextSteps;
    }

    // Start with all backend properties
    const transformedMeeting: Meeting = {
      ...backendMeeting,
      // Override with our transformed properties
      id: backendMeeting.id.toString(),
      subject: backendMeeting.title || backendMeeting.subject,
      title: backendMeeting.title || backendMeeting.subject,
      date: dateStr,
      time: timeStr,
      summary: backendMeeting.summary || '',
      details: backendMeeting.description || backendMeeting.details || '',
      type: backendMeeting.meetingType || backendMeeting.type,
      participants,
      actionItems,
      nextSteps,
      isJustCompleted: this.isRecentlyCompleted(backendMeeting),
      recordingUrl: backendMeeting.recordingUrl,
      // Ensure numeric id for backend compatibility
      numericId: backendMeeting.id,
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
  private isRecentlyCompleted(meeting: any): boolean {
    if (meeting.status === 'COMPLETED') {
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
  transformMeetingsFromBackend(backendMeetings: any[]): Meeting[] {
    return backendMeetings.map(meeting => this.transformMeetingFromBackend(meeting));
  }
}
