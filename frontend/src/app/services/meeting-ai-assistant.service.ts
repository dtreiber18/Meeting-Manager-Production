import { Injectable } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Meeting, ActionItem, Participant } from '../meetings/meeting.model';
import { PendingAction, PendingActionService } from './pending-action.service';
import { MeetingService } from '../meetings/meeting.service';

export interface MeetingAnalysis {
  summary: string;
  keyInsights: string[];
  suggestedActions: string[];
  participantInsights: {
    totalParticipants: number;
    attendanceRate: number;
    keyParticipants: string[];
    missingStakeholders: string[];
  };
  meetingEffectiveness: {
    score: number; // 1-10
    strengths: string[];
    improvements: string[];
  };
  followUpRecommendations: string[];
}

export interface ActionItemSuggestion {
  title: string;
  description: string;
  suggestedAssignee?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedHours?: number;
  reasoning: string;
}

export interface SchedulingSuggestion {
  timeSlots: Array<{
    start: string;
    end: string;
    confidence: number;
    reasoning: string;
  }>;
  participants: Array<{
    email: string;
    name: string;
    availability: 'available' | 'busy' | 'tentative' | 'unknown';
  }>;
  meetingType: string;
  suggestedDuration: number; // minutes
  locationSuggestion: string;
}

@Injectable({
  providedIn: 'root'
})
export class MeetingAiAssistantService {

  constructor(
    private pendingActionService: PendingActionService,
    private meetingService: MeetingService
  ) {}

  /**
   * Analyze a meeting and provide intelligent insights
   */
  analyzeMeeting(meeting: Meeting): Observable<MeetingAnalysis> {
    return of(meeting).pipe(
      map(m => this.generateMeetingAnalysis(m)),
      catchError(error => {
        console.error('Error analyzing meeting:', error);
        return of(this.getDefaultMeetingAnalysis(meeting));
      })
    );
  }

  /**
   * Generate intelligent action item suggestions based on meeting content
   */
  suggestActionItems(meeting: Meeting): Observable<ActionItemSuggestion[]> {
    return of(meeting).pipe(
      map(m => this.generateActionItemSuggestions(m)),
      catchError(error => {
        console.error('Error generating action item suggestions:', error);
        return of([]);
      })
    );
  }

  /**
   * Provide scheduling assistance for new meetings
   */
  getSchedulingSuggestions(
    participants: string[], 
    meetingType: string, 
    preferredTimeRange?: { start: string; end: string }
  ): Observable<SchedulingSuggestion> {
    return of({
      participants,
      meetingType,
      preferredTimeRange
    }).pipe(
      map(params => this.generateSchedulingSuggestions(params)),
      catchError(error => {
        console.error('Error generating scheduling suggestions:', error);
        return of(this.getDefaultSchedulingSuggestion());
      })
    );
  }

  /**
   * Get context-aware meeting assistance based on user query
   */
  getMeetingContextualHelp(query: string, meeting?: Meeting): Observable<string> {
    const lowerQuery = query.toLowerCase();

    // Meeting-specific queries
    if (meeting) {
      if (lowerQuery.includes('action') || lowerQuery.includes('task')) {
        return this.getActionItemHelp(meeting, query);
      }
      if (lowerQuery.includes('participant') || lowerQuery.includes('attendee')) {
        return this.getParticipantHelp(meeting, query);
      }
      if (lowerQuery.includes('follow up') || lowerQuery.includes('next step')) {
        return this.getFollowUpHelp(meeting, query);
      }
      if (lowerQuery.includes('summary') || lowerQuery.includes('recap')) {
        return this.getMeetingSummaryHelp(meeting, query);
      }
      if (lowerQuery.includes('workflow') || lowerQuery.includes('approval')) {
        return this.getWorkflowHelp(meeting, query);
      }
    }

    // General scheduling and meeting management queries
    if (lowerQuery.includes('schedule') || lowerQuery.includes('calendar')) {
      return this.getSchedulingHelp(query);
    }

    if (lowerQuery.includes('best practice') || lowerQuery.includes('tip')) {
      return this.getBestPracticesHelp(query);
    }

    return of(`I can help you with meeting-related questions! Try asking about:
    • Action items and task management
    • Participant insights and attendance
    • Meeting follow-ups and next steps
    • Workflow approvals and pending actions
    • Scheduling assistance
    • Meeting best practices
    
    For specific help with this meeting, ask about participants, action items, or follow-ups.`);
  }

  /**
   * Analyze meeting trends and provide insights
   */
  getMeetingTrends(meetings: Meeting[]): Observable<{
    attendancePatterns: any;
    actionItemTrends: any;
    meetingFrequency: any;
    participantEngagement: any;
    recommendations: string[];
  }> {
    return of(meetings).pipe(
      map(meetingList => this.analyzeMeetingTrends(meetingList))
    );
  }

  /**
   * Generate meeting analysis
   */
  private generateMeetingAnalysis(meeting: Meeting): MeetingAnalysis {
    const participants = meeting.participants || [];
    const actionItems = meeting.actionItems || [];
    const attendedCount = participants.filter(p => p.attended).length;
    const attendanceRate = participants.length > 0 ? (attendedCount / participants.length) * 100 : 0;

    // Analyze meeting content
    const hasRecording = !!meeting.recordingUrl;
    const hasActionItems = actionItems.length > 0;
    const hasNextSteps = !!meeting.nextSteps?.trim();
    
    // Calculate effectiveness score
    let effectivenessScore = 5; // Base score
    if (attendanceRate > 80) effectivenessScore += 1;
    if (hasActionItems) effectivenessScore += 1;
    if (hasNextSteps) effectivenessScore += 1;
    if (hasRecording) effectivenessScore += 1;
    if (meeting.summary && meeting.summary.length > 100) effectivenessScore += 1;

    const keyInsights = [];
    if (attendanceRate < 70) {
      keyInsights.push(`Low attendance rate (${attendanceRate.toFixed(1)}%) - consider rescheduling or checking participant availability`);
    }
    if (!hasActionItems) {
      keyInsights.push('No action items identified - consider if follow-up tasks are needed');
    }
    if (!hasRecording && meeting.meetingType?.toLowerCase().includes('external')) {
      keyInsights.push('External meeting without recording - consider recording for client references');
    }

    const suggestedActions = [];
    if (actionItems.filter(a => !a.assignee).length > 0) {
      suggestedActions.push('Assign owners to unassigned action items');
    }
    if (!meeting.nextSteps) {
      suggestedActions.push('Define clear next steps for this meeting');
    }
    if (attendanceRate < 80) {
      suggestedActions.push('Follow up with absent participants');
    }

    return {
      summary: this.generateMeetingSummary(meeting),
      keyInsights,
      suggestedActions,
      participantInsights: {
        totalParticipants: participants.length,
        attendanceRate,
        keyParticipants: participants.filter(p => p.presenter || p.organizer).map(p => p.name),
        missingStakeholders: participants.filter(p => p.isRequired && !p.attended).map(p => p.name)
      },
      meetingEffectiveness: {
        score: Math.min(10, effectivenessScore),
        strengths: this.identifyMeetingStrengths(meeting),
        improvements: this.identifyImprovementAreas(meeting)
      },
      followUpRecommendations: this.generateFollowUpRecommendations(meeting)
    };
  }

  /**
   * Generate action item suggestions
   */
  private generateActionItemSuggestions(meeting: Meeting): ActionItemSuggestion[] {
    const suggestions: ActionItemSuggestion[] = [];
    
    // Analyze meeting content for potential action items
    if (meeting.summary) {
      const summaryLower = meeting.summary.toLowerCase();
      
      if (summaryLower.includes('follow up') || summaryLower.includes('contact')) {
        suggestions.push({
          title: 'Follow up with stakeholders',
          description: 'Reach out to key stakeholders mentioned in the meeting',
          priority: 'MEDIUM',
          estimatedHours: 0.5,
          reasoning: 'Meeting summary mentions follow-up activities'
        });
      }
      
      if (summaryLower.includes('document') || summaryLower.includes('write')) {
        suggestions.push({
          title: 'Document meeting outcomes',
          description: 'Create comprehensive documentation of decisions and outcomes',
          priority: 'HIGH',
          estimatedHours: 1,
          reasoning: 'Documentation needs identified in meeting summary'
        });
      }
      
      if (summaryLower.includes('schedule') || summaryLower.includes('meeting')) {
        suggestions.push({
          title: 'Schedule follow-up meeting',
          description: 'Plan and schedule the next meeting with relevant participants',
          priority: 'MEDIUM',
          estimatedHours: 0.25,
          reasoning: 'Additional meetings mentioned in summary'
        });
      }
    }

    // Check for missing action items based on meeting type
    if (meeting.meetingType?.toLowerCase().includes('sales')) {
      suggestions.push({
        title: 'Update CRM with meeting notes',
        description: 'Record client interactions and next steps in CRM system',
        priority: 'HIGH',
        estimatedHours: 0.5,
        reasoning: 'Sales meetings require CRM updates for tracking'
      });
    }

    if (meeting.meetingType?.toLowerCase().includes('project')) {
      suggestions.push({
        title: 'Update project timeline',
        description: 'Reflect any timeline changes or new requirements in project plan',
        priority: 'MEDIUM',
        estimatedHours: 1,
        reasoning: 'Project meetings often result in timeline adjustments'
      });
    }

    return suggestions;
  }

  /**
   * Generate scheduling suggestions
   */
  private generateSchedulingSuggestions(params: any): SchedulingSuggestion {
    // Mock intelligent scheduling - in production, this would integrate with calendar APIs
    const now = new Date();
    const timeSlots = [];
    
    // Suggest next business day at 10 AM
    const nextDay = new Date(now);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(10, 0, 0, 0);
    
    timeSlots.push({
      start: nextDay.toISOString(),
      end: new Date(nextDay.getTime() + 60 * 60 * 1000).toISOString(),
      confidence: 0.8,
      reasoning: 'Optimal time for most participants based on typical availability'
    });

    // Suggest afternoon slot
    const afternoonSlot = new Date(nextDay);
    afternoonSlot.setHours(14, 0, 0, 0);
    
    timeSlots.push({
      start: afternoonSlot.toISOString(),
      end: new Date(afternoonSlot.getTime() + 60 * 60 * 1000).toISOString(),
      confidence: 0.7,
      reasoning: 'Alternative afternoon slot for different time zones'
    });

    return {
      timeSlots,
      participants: params.participants.map((email: string) => ({
        email,
        name: email.split('@')[0],
        availability: 'unknown' as const
      })),
      meetingType: params.meetingType || 'General Meeting',
      suggestedDuration: this.getSuggestedDuration(params.meetingType),
      locationSuggestion: 'Virtual meeting recommended for flexibility'
    };
  }

  /**
   * Helper methods for contextual help
   */
  private getActionItemHelp(meeting: Meeting, query: string): Observable<string> {
    const actionItems = meeting.actionItems || [];
    const pendingActions = []; // Could fetch from pending actions service
    
    if (actionItems.length === 0) {
      return of(`This meeting doesn't have any action items yet. Based on the meeting content, I suggest:
      • Review meeting summary for potential follow-up tasks
      • Consider if any decisions need implementation
      • Check if participants mentioned commitments or deliverables
      
      Would you like me to suggest some action items based on the meeting content?`);
    }

    const unassigned = actionItems.filter(a => !a.assignee);
    const overdue = actionItems.filter(a => a.dueDate && new Date(a.dueDate) < new Date());
    
    let response = `This meeting has ${actionItems.length} action item(s):\n\n`;
    
    if (unassigned.length > 0) {
      response += `⚠️ ${unassigned.length} items need to be assigned to team members\n`;
    }
    
    if (overdue.length > 0) {
      response += `🔴 ${overdue.length} items are overdue and need immediate attention\n`;
    }
    
    response += `\nI can help you:
    • Create new action items from meeting content
    • Assign owners to unassigned items
    • Set realistic due dates based on priority
    • Convert action items to pending actions for approval workflow`;

    return of(response);
  }

  private getParticipantHelp(meeting: Meeting, query: string): Observable<string> {
    const participants = meeting.participants || [];
    const attended = participants.filter(p => p.attended);
    const absent = participants.filter(p => !p.attended);
    const required = participants.filter(p => p.isRequired);
    
    let response = `Meeting had ${participants.length} participant(s):\n`;
    response += `✅ ${attended.length} attended\n`;
    response += `❌ ${absent.length} were absent\n`;
    
    if (required.length > 0) {
      const absentRequired = required.filter(p => !p.attended);
      if (absentRequired.length > 0) {
        response += `\n⚠️ ${absentRequired.length} required participant(s) were absent:\n`;
        absentRequired.forEach(p => response += `  • ${p.name}\n`);
        response += `\nConsider rescheduling or following up individually.`;
      }
    }

    // Analyze participant types
    const clientParticipants = participants.filter(p => p.participantType === 'CLIENT');
    const g37Participants = participants.filter(p => p.participantType === 'G37');
    
    if (clientParticipants.length > 0) {
      response += `\n\n👥 Client participants: ${clientParticipants.length}`;
    }
    if (g37Participants.length > 0) {
      response += `\n🏢 G37 team members: ${g37Participants.length}`;
    }

    return of(response);
  }

  private getFollowUpHelp(meeting: Meeting, query: string): Observable<string> {
    const recommendations = this.generateFollowUpRecommendations(meeting);
    
    let response = `Based on this meeting, here are my follow-up recommendations:\n\n`;
    recommendations.forEach((rec, index) => {
      response += `${index + 1}. ${rec}\n`;
    });
    
    response += `\nI can help you:
    • Create action items for these follow-ups
    • Schedule follow-up meetings
    • Draft follow-up emails to participants
    • Set up approval workflows for decisions made`;

    return of(response);
  }

  private getMeetingSummaryHelp(meeting: Meeting, query: string): Observable<string> {
    if (!meeting.summary?.trim()) {
      return of(`This meeting doesn't have a summary yet. I can help you:
      • Generate a summary based on participants and action items
      • Suggest key points to include in the summary
      • Create a template for future meeting summaries
      
      A good meeting summary should include:
      • Key decisions made
      • Action items assigned
      • Next steps identified
      • Important discussions or concerns raised`);
    }

    const analysis = this.generateMeetingAnalysis(meeting);
    return of(`Meeting Summary Analysis:
    
📊 Effectiveness Score: ${analysis.meetingEffectiveness.score}/10

🎯 Key Insights:
${analysis.keyInsights.map(insight => `• ${insight}`).join('\n')}

💡 Suggested Actions:
${analysis.suggestedActions.map(action => `• ${action}`).join('\n')}

The summary covers the main points well. Consider adding more specific details about deadlines and responsibilities if they're missing.`);
  }

  private getWorkflowHelp(meeting: Meeting, query: string): Observable<string> {
    return of(`I can help you set up approval workflows for this meeting:

🔄 Available Workflow Options:
• Convert action items to pending actions requiring approval
• Set up multi-level approval for high-priority tasks
• Create automated follow-up reminders
• Integrate with N8N Operations Manager for external systems

💼 Approval Workflow Benefits:
• Ensure proper oversight for important decisions
• Track approval status and history
• Automate notifications to approvers
• Maintain audit trail for compliance

Would you like me to help convert any action items to pending actions that require management approval?`);
  }

  private getSchedulingHelp(query: string): Observable<string> {
    return of(`I can help you with intelligent scheduling:

📅 Scheduling Assistance:
• Find optimal meeting times based on participant availability
• Suggest meeting duration based on agenda and type
• Recommend virtual vs. in-person based on participants
• Consider time zones for distributed teams

🎯 Best Practices:
• Schedule important meetings during peak energy hours (10 AM - 12 PM)
• Allow buffer time between back-to-back meetings
• Send invites at least 24-48 hours in advance
• Include clear agenda and objectives in meeting description

🤖 Smart Features:
• Automatic conflict detection
• Participant availability analysis
• Meeting room/resource booking
• Calendar integration with multiple platforms

What type of meeting would you like help scheduling?`);
  }

  private getBestPracticesHelp(query: string): Observable<string> {
    return of(`Here are meeting best practices I recommend:

🎯 Before the Meeting:
• Set clear objectives and agenda
• Invite only necessary participants
• Share pre-reading materials 24+ hours ahead
• Test technology for virtual meetings

⚡ During the Meeting:
• Start and end on time
• Keep discussions focused on agenda
• Assign action items with owners and due dates
• Document key decisions and next steps

✅ After the Meeting:
• Send summary within 24 hours
• Follow up on action items weekly
• Schedule follow-up meetings if needed
• Gather feedback for continuous improvement

📊 Meeting Effectiveness Tips:
• Limit meetings to 25 or 50 minutes
• Use the "no agenda, no meeting" rule
• Encourage active participation
• End with clear next steps

Would you like specific advice for any particular type of meeting?`);
  }

  /**
   * Helper methods for analysis
   */
  private generateMeetingSummary(meeting: Meeting): string {
    const participants = meeting.participants?.length || 0;
    const actionItems = meeting.actionItems?.length || 0;
    const attendance = meeting.participants?.filter(p => p.attended).length || 0;
    
    return `Meeting with ${participants} participants (${attendance} attended) resulted in ${actionItems} action items. ${meeting.summary || 'No detailed summary available.'}`;
  }

  private identifyMeetingStrengths(meeting: Meeting): string[] {
    const strengths = [];
    
    if (meeting.recordingUrl) strengths.push('Meeting was recorded for future reference');
    if (meeting.actionItems?.length > 0) strengths.push('Clear action items were identified');
    if (meeting.nextSteps) strengths.push('Next steps were defined');
    if (meeting.summary && meeting.summary.length > 100) strengths.push('Comprehensive meeting summary provided');
    
    const attendanceRate = meeting.participants?.length > 0 ? 
      (meeting.participants.filter(p => p.attended).length / meeting.participants.length) * 100 : 0;
    if (attendanceRate > 80) strengths.push('Good participant attendance');
    
    return strengths.length > 0 ? strengths : ['Meeting was successfully completed'];
  }

  private identifyImprovementAreas(meeting: Meeting): string[] {
    const improvements = [];
    
    if (!meeting.recordingUrl && meeting.meetingType?.includes('external')) {
      improvements.push('Consider recording external meetings for client reference');
    }
    if (!meeting.actionItems?.length) {
      improvements.push('Identify specific action items and next steps');
    }
    if (!meeting.nextSteps) {
      improvements.push('Define clear next steps and follow-up plans');
    }
    
    const unassignedActions = meeting.actionItems?.filter(a => !a.assignee).length || 0;
    if (unassignedActions > 0) {
      improvements.push('Assign owners to all action items');
    }
    
    return improvements;
  }

  private generateFollowUpRecommendations(meeting: Meeting): string[] {
    const recommendations = [];
    
    const absentRequired = meeting.participants?.filter(p => p.isRequired && !p.attended) || [];
    if (absentRequired.length > 0) {
      recommendations.push(`Follow up with ${absentRequired.length} absent required participants`);
    }
    
    const unassignedActions = meeting.actionItems?.filter(a => !a.assignee).length || 0;
    if (unassignedActions > 0) {
      recommendations.push('Assign owners to unassigned action items');
    }
    
    if (!meeting.nextSteps) {
      recommendations.push('Schedule follow-up meeting to continue discussions');
    }
    
    if (meeting.meetingType?.toLowerCase().includes('sales')) {
      recommendations.push('Update CRM with client meeting notes and next steps');
    }
    
    recommendations.push('Send meeting summary to all participants within 24 hours');
    
    return recommendations;
  }

  private getSuggestedDuration(meetingType: string): number {
    const type = meetingType?.toLowerCase() || '';
    
    if (type.includes('standup') || type.includes('check-in')) return 15;
    if (type.includes('interview') || type.includes('1:1')) return 30;
    if (type.includes('team') || type.includes('project')) return 60;
    if (type.includes('workshop') || type.includes('training')) return 120;
    if (type.includes('board') || type.includes('quarterly')) return 90;
    
    return 60; // Default to 1 hour
  }

  private analyzeMeetingTrends(meetings: Meeting[]): any {
    // Implementation for meeting trend analysis
    return {
      attendancePatterns: {},
      actionItemTrends: {},
      meetingFrequency: {},
      participantEngagement: {},
      recommendations: ['Regular meeting review recommended']
    };
  }

  private getDefaultMeetingAnalysis(meeting: Meeting): MeetingAnalysis {
    return {
      summary: 'Meeting analysis unavailable',
      keyInsights: [],
      suggestedActions: [],
      participantInsights: {
        totalParticipants: meeting.participants?.length || 0,
        attendanceRate: 0,
        keyParticipants: [],
        missingStakeholders: []
      },
      meetingEffectiveness: {
        score: 5,
        strengths: [],
        improvements: []
      },
      followUpRecommendations: []
    };
  }

  private getDefaultSchedulingSuggestion(): SchedulingSuggestion {
    return {
      timeSlots: [],
      participants: [],
      meetingType: 'General Meeting',
      suggestedDuration: 60,
      locationSuggestion: 'Virtual meeting'
    };
  }
}