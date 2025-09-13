import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { map } from 'rxjs/operators';
import { PageType } from '../models/chat.model';
import { MeetingService } from '../meetings/meeting.service';
import { Meeting } from '../meetings/meeting.model';
import { ApiConfigService } from '../core/services/api-config.service';

export interface ChatRequest {
  message: string;
  pageContext: string;
}

export interface ChatResponse {
  response: string;
  success: boolean;
}

export interface MeetingCreationState {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  meetingType?: string;
  participants?: string[];
  status: 'collecting' | 'confirming' | 'creating' | 'complete';
  step: 'title' | 'date' | 'time' | 'duration' | 'type' | 'participants' | 'description' | 'confirm';
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl: string;
  private meetingCreationState: MeetingCreationState | null = null;

  constructor(
    private http: HttpClient,
    private meetingService: MeetingService,
    private apiConfig: ApiConfigService
  ) {
    // Use production backend for deployed environments, otherwise use ApiConfigService
    if (window.location.hostname.includes('azurecontainerapps.io')) {
      this.apiUrl = 'https://ca-backend-jq7rzfkj24zqy.mangoriver-904fd974.eastus.azurecontainerapps.io/api/chat';
    } else {
      // Use ApiConfigService for local development
      this.apiUrl = this.apiConfig.endpoints.chat();
    }
    console.log('🔧 ChatService API URL:', this.apiUrl); // Debug log
  }

  getContextualWelcome(pageType: PageType): string {
    switch (pageType) {
      case 'home':
        return 'Hi! I can help you understand your meeting dashboard, search for specific meetings, explain how the automation features work, or **create new meetings**. Just say "create a meeting" or "schedule a meeting" to get started. What would you like to know?';
      case 'meetings':
        return 'Hello! I can help you navigate your meeting history, explain the filtering options, provide details about any meeting information you see, or **create new meetings**. Say "create a meeting" to get started. How can I assist?';
      case 'detail':
        return 'Hi there! I can explain the meeting details, action items, participant information, help you understand how to use the recording features, or **create new meetings**. What questions do you have?';
      case 'settings':
        return 'Welcome! I can help you configure your API integrations, set up field mappings, manage your account settings, explain how the automation workflows function, or **create new meetings**. What would you like to know?';
      default:
        return "Hello! I'm here to help you with any questions about this page or **create new meetings**. Just say 'create a meeting' to get started. What can I assist you with?";
    }
  }

  generateAIResponse(
    userMessage: string,
    pageType: PageType
  ): Observable<string> {
    // Check if we're in a meeting creation flow
    if (this.meetingCreationState) {
      return this.handleMeetingCreationFlow(userMessage);
    }

    // Check if user wants to create a meeting
    const lowerMessage = userMessage.toLowerCase();
    if (this.isMeetingCreationIntent(lowerMessage)) {
      return this.startMeetingCreation(userMessage);
    }

    const request: ChatRequest = {
      message: userMessage,
      pageContext: pageType
    };

    console.log('Chat service making request to:', `${this.apiUrl}/message`);
    console.log('Request payload:', request);

    return this.http.post<ChatResponse>(`${this.apiUrl}/message`, request).pipe(
      map(response => {
        console.log('Chat API response received:', response);
        return response.response;
      }),
      catchError(error => {
        console.error('Chat API error:', error);
        console.log('Falling back to local response');
        // Fallback to local response if API fails
        return of(this.getContextualResponse(userMessage, pageType));
      })
    );
  }

  private getContextualResponse(
    userMessage: string,
    pageType: PageType
  ): string {
    const lowerMessage = userMessage.toLowerCase();

    // Check for meeting creation intent in fallback
    if (this.isMeetingCreationIntent(lowerMessage)) {
      return "I'd love to help you create a meeting! However, I need to use the enhanced chat features for meeting creation. This might not work in fallback mode, but let's try! What would you like to call your meeting?";
    }

    // Context-aware responses based on page type and user input
    if (pageType === 'home') {
      if (lowerMessage.includes('search') || lowerMessage.includes('find')) {
        return 'You can search for meetings using the search bar at the top. It searches through meeting subjects, summaries, participants, action items, and all other meeting details. Just type your query and press Enter, or use the Filter button for more specific criteria like date ranges or meeting types.';
      }
      if (lowerMessage.includes('filter')) {
        return 'The Filter button opens advanced filtering options where you can filter by date range, meeting type (external/internal), specific participants, meetings with action items, or meetings with recordings. You can combine multiple filters to narrow down your results.';
      }
      if (lowerMessage.includes('action') || lowerMessage.includes('task')) {
        return 'Action items from your meetings are automatically extracted and can be converted into tasks, emails, or calendar events. The system identifies who items are assigned to and their due dates. You can see action items in the meeting summaries and detailed views.';
      }
      if (
        lowerMessage.includes('automation') ||
        lowerMessage.includes('workflow')
      ) {
        return 'The platform automatically processes meeting notes from various sources (Fathom, Otter.ai, etc.), classifies meeting types, and can generate follow-up actions like tasks, emails, and calendar invites based on the meeting content and action items identified.';
      }
    }

    if (pageType === 'meetings') {
      if (lowerMessage.includes('card') || lowerMessage.includes('view')) {
        return 'You can switch between Grid and List views using the buttons in the top right. Grid view shows meetings as cards with key details, while List view provides a more compact table format. Click any meeting to see full details.';
      }
      if (lowerMessage.includes('type') || lowerMessage.includes('category')) {
        return 'Meetings are automatically classified into types like External Sales, Internal Team Strategy, Board Meetings, etc. Each type has a colored badge - blue for external meetings, green for internal meetings. This helps with organization and automated workflows.';
      }
    }

    if (pageType === 'detail') {
      if (
        lowerMessage.includes('participant') ||
        lowerMessage.includes('attend')
      ) {
        return 'The Participants tab shows who was invited, who attended (green indicators), and who was absent (red indicators). This information is automatically extracted from your meeting platform and helps track engagement and follow-up needs.';
      }
      if (lowerMessage.includes('recording') || lowerMessage.includes('play')) {
        return "If a meeting was recorded, you'll see the Recording tab with play and download options. The recording URL is automatically captured from your meeting platform when available.";
      }
      if (lowerMessage.includes('action') || lowerMessage.includes('task')) {
        return "Action items are automatically extracted from meeting transcripts and summaries. Each item shows the description, who it's assigned to, due date, priority level, and current status. These can be automatically converted into tasks in your preferred task management system.";
      }
    }

    if (pageType === 'settings') {
      if (
        lowerMessage.includes('api') ||
        lowerMessage.includes('integration')
      ) {
        return "In the API configuration sections, you'll set up connections to your meeting note sources (like Fathom.video, Otter.ai) and destination apps (like Google Calendar, Gmail). Each requires an API URL, API Key, and field mapping to work properly.";
      }
      if (lowerMessage.includes('field') || lowerMessage.includes('mapping')) {
        return 'Field mapping tells the system how to match data between different apps. For sources, you map their field names to our standard fields. For destinations, you map our fields to their expected field names. This ensures data flows correctly between systems.';
      }
      if (
        lowerMessage.includes('source') ||
        lowerMessage.includes('get info')
      ) {
        return "Meeting note sources are apps that provide meeting data to our platform. Configure the API connection and map fields like 'title' to 'Meeting Subject' or 'participants' to 'Meeting Participants'. Make sure to mark sources as Active when ready.";
      }
      if (
        lowerMessage.includes('destination') ||
        lowerMessage.includes('send info')
      ) {
        return 'Destination apps receive processed meeting data and action items. Set up integrations with calendar apps for scheduling, email apps for follow-ups, and task apps for action items. Field mapping ensures data appears in the right places.';
      }
    }

    // General responses
    if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return "I can help explain any feature you see on this page. Try asking about specific elements like buttons, forms, or data you're viewing. I can also explain workflows, integrations, and best practices for using the platform.";
    }

    if (
      lowerMessage.includes('password') ||
      lowerMessage.includes('security')
    ) {
      return "For security, you only need to enter your new password and confirm it - no need for your current password since you're already authenticated. The system uses secure password hashing and session management.";
    }

    // Default response with context
    return `I understand you're asking about "${userMessage}". Based on what I can see on this ${pageType} page, I'd be happy to help explain specific features, workflows, or answer questions about the information displayed. Could you be more specific about what you'd like to know?`;
  }

  private isMeetingCreationIntent(message: string): boolean {
    const creationKeywords = [
      'create meeting', 'schedule meeting', 'new meeting', 'book meeting',
      'set up meeting', 'arrange meeting', 'plan meeting', 'organize meeting',
      'create a meeting', 'schedule a meeting', 'add meeting', 'add a meeting'
    ];
    return creationKeywords.some(keyword => message.includes(keyword));
  }

  private startMeetingCreation(userMessage: string): Observable<string> {
    // Try to extract meeting details from the initial message
    const extractedData = this.extractMeetingDataFromMessage(userMessage);
    
    this.meetingCreationState = {
      ...extractedData,
      status: 'collecting',
      step: extractedData.title ? 'date' : 'title'
    };

    if (extractedData.title) {
      return of(`Great! I'll help you create a meeting titled "${extractedData.title}". When would you like to schedule it? Please provide a date and time (e.g., "Tomorrow at 2 PM" or "December 15th at 10:30 AM").`);
    } else {
      return of("I'd be happy to help you create a new meeting! Let's start with the basics. What would you like to call this meeting?");
    }
  }

  private handleMeetingCreationFlow(userMessage: string): Observable<string> {
    if (!this.meetingCreationState) {
      return of("Something went wrong with the meeting creation. Let's start over. What meeting would you like to create?");
    }

    const state = this.meetingCreationState;
    const lowerMessage = userMessage.toLowerCase();

    // Handle cancellation
    if (lowerMessage.includes('cancel') || lowerMessage.includes('nevermind') || lowerMessage.includes('stop')) {
      this.meetingCreationState = null;
      return of("No problem! Meeting creation cancelled. Let me know if you'd like to create a meeting later.");
    }

    switch (state.step) {
      case 'title':
        state.title = userMessage.trim();
        state.step = 'date';
        return of(`Perfect! I'll create a meeting called "${state.title}". When would you like to schedule it? Please provide a date and time (e.g., "Tomorrow at 2 PM" or "December 15th at 10:30 AM").`);

      case 'date':
        const dateTime = this.parseDateTimeFromMessage(userMessage);
        if (dateTime.startTime) {
          state.startTime = dateTime.startTime;
          state.endTime = dateTime.endTime || this.calculateEndTime(dateTime.startTime, 60); // Default 1 hour
          state.step = 'type';
          return of(`Great! I've scheduled it for ${this.formatDateTime(state.startTime)}. What type of meeting is this? You can say:

• **Team meeting** - Internal team discussions
• **Client meeting** - External client calls  
• **One-on-one** - Individual meetings
• **Board meeting** - Executive meetings
• **Standup** - Daily status meetings
• **Planning** - Project planning sessions
• **Review/Retrospective** - Review meetings

Just say the type you prefer.`);
        } else {
          return of(`I couldn't understand that date/time. Could you try again? Here are some examples that work well:

**Relative dates:**
• "Tomorrow at 2 PM"
• "Next Friday at 10:30 AM"

**Specific dates:**
• "September 2nd at 8:30 AM"
• "December 15th at 3:00 PM"
• "9/2 at 8:30 AM"

Please try again with one of these formats.`);
        }

      case 'type':
        state.meetingType = this.normalizeMeetingType(userMessage);
        state.step = 'participants';
        return of(`Got it! This will be a ${state.meetingType}. Who would you like to invite? You can list email addresses separated by commas, or say "just me" for a solo meeting.`);

      case 'participants':
        if (lowerMessage.includes('just me') || lowerMessage.includes('only me') || lowerMessage.includes('no one')) {
          state.participants = [];
        } else {
          state.participants = this.extractEmailsFromMessage(userMessage);
        }
        state.step = 'description';
        const participantText = state.participants && state.participants.length > 0 
          ? `I'll invite: ${state.participants.join(', ')}.` 
          : "This will be a solo meeting.";
        return of(`${participantText} Would you like to add a description or agenda for the meeting? (You can say "no description" to skip this step)`);

      case 'description':
        if (!lowerMessage.includes('no description') && !lowerMessage.includes('skip')) {
          state.description = userMessage.trim();
        }
        state.step = 'confirm';
        return of(this.generateConfirmationMessage(state));

      case 'confirm':
        if (lowerMessage.includes('yes') || lowerMessage.includes('confirm') || lowerMessage.includes('create') || lowerMessage.includes('looks good')) {
          return this.createMeetingFromState(state);
        } else if (lowerMessage.includes('no') || lowerMessage.includes('cancel')) {
          this.meetingCreationState = null;
          return of("Okay, I've cancelled the meeting creation. Let me know if you'd like to start over!");
        } else {
          return of("Please confirm by saying 'yes' to create the meeting, or 'no' to cancel.");
        }

      default:
        this.meetingCreationState = null;
        return of("Something went wrong. Let's start over. What meeting would you like to create?");
    }
  }

  private extractMeetingDataFromMessage(message: string): Partial<MeetingCreationState> {
    // Simple extraction - look for quoted text as title
    const titleMatch = message.match(/"([^"]+)"/);
    return {
      title: titleMatch ? titleMatch[1] : undefined
    };
  }

  private parseDateTimeFromMessage(message: string): { startTime?: string; endTime?: string } {
    const now = new Date();
    const lowerMessage = message.toLowerCase();

    // Handle relative dates
    if (lowerMessage.includes('tomorrow')) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const time = this.extractTimeFromMessage(message);
      if (time) {
        tomorrow.setHours(time.hours, time.minutes, 0, 0);
        return { startTime: tomorrow.toISOString() };
      }
    }

    if (lowerMessage.includes('next week')) {
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      const time = this.extractTimeFromMessage(message);
      if (time) {
        nextWeek.setHours(time.hours, time.minutes, 0, 0);
        return { startTime: nextWeek.toISOString() };
      }
    }

    // Handle specific dates like "September 2nd", "Dec 15th", etc.
    const monthDayMatch = message.match(/(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})(st|nd|rd|th)?/i);
    if (monthDayMatch) {
      const monthName = monthDayMatch[1].toLowerCase();
      const day = parseInt(monthDayMatch[2]);
      const time = this.extractTimeFromMessage(message);
      
      const monthMap: { [key: string]: number } = {
        'january': 0, 'jan': 0, 'february': 1, 'feb': 1, 'march': 2, 'mar': 2,
        'april': 3, 'apr': 3, 'may': 4, 'june': 5, 'jun': 5,
        'july': 6, 'jul': 6, 'august': 7, 'aug': 7, 'september': 8, 'sep': 8,
        'october': 9, 'oct': 9, 'november': 10, 'nov': 10, 'december': 11, 'dec': 11
      };
      
      const monthIndex = monthMap[monthName];
      if (monthIndex !== undefined && time) {
        const meetingDate = new Date(now.getFullYear(), monthIndex, day, time.hours, time.minutes, 0, 0);
        
        // If the date is in the past this year, schedule for next year
        if (meetingDate < now) {
          meetingDate.setFullYear(meetingDate.getFullYear() + 1);
        }
        
        return { startTime: meetingDate.toISOString() };
      }
    }

    // Handle specific dates in format "Dec 15", "12/15", etc.
    const datePatterns = [
      /(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/, // MM/DD or MM/DD/YY or MM/DD/YYYY
      /(\d{1,2})-(\d{1,2})(?:-(\d{2,4}))?/, // MM-DD or MM-DD-YY or MM-DD-YYYY
    ];

    for (const pattern of datePatterns) {
      const match = message.match(pattern);
      if (match) {
        const month = parseInt(match[1]) - 1; // JS months are 0-indexed
        const day = parseInt(match[2]);
        const year = match[3] ? parseInt(match[3]) : now.getFullYear();
        const fullYear = year < 100 ? 2000 + year : year;
        
        const time = this.extractTimeFromMessage(message);
        if (time) {
          const meetingDate = new Date(fullYear, month, day, time.hours, time.minutes, 0, 0);
          return { startTime: meetingDate.toISOString() };
        }
      }
    }

    // Handle specific times (basic parsing) - fallback for today or tomorrow
    const timeMatch = this.extractTimeFromMessage(message);
    if (timeMatch) {
      const meetingDate = new Date(now);
      meetingDate.setHours(timeMatch.hours, timeMatch.minutes, 0, 0);
      
      // If the time is in the past today, schedule for tomorrow
      if (meetingDate <= now) {
        meetingDate.setDate(meetingDate.getDate() + 1);
      }
      
      return { startTime: meetingDate.toISOString() };
    }

    return {};
  }

  private extractTimeFromMessage(message: string): { hours: number; minutes: number } | null {
    // Match patterns like "2 PM", "10:30 AM", "14:30"
    const timePatterns = [
      /(\d{1,2}):(\d{2})\s*(am|pm)/i,
      /(\d{1,2})\s*(am|pm)/i,
      /(\d{1,2}):(\d{2})/
    ];

    for (const pattern of timePatterns) {
      const match = message.match(pattern);
      if (match) {
        let hours = parseInt(match[1]);
        const minutes = match[2] ? parseInt(match[2]) : 0;
        const ampm = match[3]?.toLowerCase();

        if (ampm === 'pm' && hours !== 12) {
          hours += 12;
        } else if (ampm === 'am' && hours === 12) {
          hours = 0;
        }

        return { hours, minutes };
      }
    }

    return null;
  }

  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + durationMinutes * 60000);
    return end.toISOString();
  }

  private formatDateTime(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  private normalizeMeetingType(input: string): string {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('team') || lowerInput.includes('internal')) return 'TEAM_MEETING';
    if (lowerInput.includes('client') || lowerInput.includes('external')) return 'CLIENT_MEETING';
    if (lowerInput.includes('one-on-one') || lowerInput.includes('1:1')) return 'ONE_ON_ONE';
    if (lowerInput.includes('board')) return 'BOARD_MEETING';
    if (lowerInput.includes('standup') || lowerInput.includes('daily')) return 'STANDUP';
    if (lowerInput.includes('review') || lowerInput.includes('retrospective')) return 'RETROSPECTIVE';
    if (lowerInput.includes('planning')) return 'PLANNING';
    if (lowerInput.includes('interview')) return 'INTERVIEW';
    if (lowerInput.includes('training')) return 'TRAINING';
    if (lowerInput.includes('presentation')) return 'PRESENTATION';
    if (lowerInput.includes('workshop')) return 'WORKSHOP';
    
    return 'TEAM_MEETING'; // Default
  }

  private extractEmailsFromMessage(message: string): string[] {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = message.match(emailRegex) || [];
    return emails;
  }

  private generateConfirmationMessage(state: MeetingCreationState): string {
    const participantText = state.participants && state.participants.length > 0
      ? `\n• **Participants:** ${state.participants.join(', ')}`
      : '\n• **Participants:** Just you';

    const descriptionText = state.description 
      ? `\n• **Description:** ${state.description}`
      : '';

    return `Perfect! Here's your meeting summary:

• **Title:** ${state.title}
• **Date & Time:** ${this.formatDateTime(state.startTime!)}
• **Type:** ${state.meetingType}${participantText}${descriptionText}

Does this look correct? Say "yes" to create the meeting or "no" to cancel.`;
  }

  private createMeetingFromState(state: MeetingCreationState): Observable<string> {
    // Create a meeting object that matches backend DTO expectations
    const newMeeting = {
      title: state.title!,
      description: state.description || '',
      startTime: state.startTime!,
      endTime: state.endTime!,
      meetingType: state.meetingType || 'TEAM_MEETING',
      status: 'SCHEDULED',
      priority: 'MEDIUM',
      isRecurring: false,
      isPublic: false,
      requiresApproval: false,
      allowRecording: true,
      autoTranscription: false,
      aiAnalysisEnabled: true
    };

    console.log('Creating meeting with data:', newMeeting);

    return this.meetingService.createMeeting(newMeeting as Meeting).pipe(
      map((createdMeeting) => {
        this.meetingCreationState = null; // Reset state
        return `🎉 Great! I've successfully created your meeting "${createdMeeting.title}" for ${this.formatDateTime(createdMeeting.startTime)}. 

The meeting has been added to your calendar and you should see it in your meeting list. Is there anything else I can help you with?`;
      }),
      catchError((error) => {
        console.error('Error creating meeting:', error);
        console.error('Meeting data that failed:', newMeeting);
        this.meetingCreationState = null; // Reset state
        
        let errorMessage = 'Unknown error';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.status) {
          errorMessage = `HTTP ${error.status} error`;
        }
        
        return of(`I'm sorry, but I encountered an error while creating the meeting. Let me help you try a different approach.

**Error details:** ${errorMessage}

Would you like to:
1. Try creating the meeting again with different details
2. Use the manual meeting form instead
3. Check if the meeting data looks correct to you

Just let me know how you'd like to proceed!`);
      })
    );
  }
}
