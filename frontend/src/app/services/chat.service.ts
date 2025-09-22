import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { map } from 'rxjs/operators';
import { PageType } from '../models/chat.model';
import { MeetingService } from '../meetings/meeting.service';
import { Meeting } from '../meetings/meeting.model';
import { ApiConfigService } from '../core/services/api-config.service';
import { MeetingAiAssistantService, MeetingAnalysis, ActionItemSuggestion } from './meeting-ai-assistant.service';

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
  private readonly apiUrl: string;
  private meetingCreationState: MeetingCreationState | null = null;

  constructor(
    private readonly http: HttpClient,
    private readonly meetingService: MeetingService,
    private readonly apiConfig: ApiConfigService,
    private readonly aiAssistant: MeetingAiAssistantService
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
    pageType: PageType,
    meetingContext?: Meeting
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

    // Use AI Assistant for meeting-specific queries
    if (pageType === 'detail' && meetingContext) {
      return this.aiAssistant.getMeetingContextualHelp(userMessage, meetingContext);
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
        // Enhanced fallback with AI assistant for meeting context
        if (pageType === 'detail' && meetingContext) {
          return this.aiAssistant.getMeetingContextualHelp(userMessage, meetingContext);
        }
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

    // Context-aware responses based on page type
    switch (pageType) {
      case 'home':
        return this.getHomePageResponse(lowerMessage);
      case 'meetings':
        return this.getMeetingsPageResponse(lowerMessage);
      case 'detail':
        return this.getDetailPageResponse(lowerMessage);
      case 'settings':
        return this.getSettingsPageResponse(lowerMessage);
      default:
        return this.getGeneralResponse(lowerMessage, userMessage, pageType);
    }
  }

  private getHomePageResponse(lowerMessage: string): string {
    if (lowerMessage.includes('search') || lowerMessage.includes('find')) {
      return 'You can search for meetings using the search bar at the top. It searches through meeting subjects, summaries, participants, action items, and all other meeting details. Just type your query and press Enter, or use the Filter button for more specific criteria like date ranges or meeting types.';
    }
    if (lowerMessage.includes('filter')) {
      return 'The Filter button opens advanced filtering options where you can filter by date range, meeting type (external/internal), specific participants, meetings with action items, or meetings with recordings. You can combine multiple filters to narrow down your results.';
    }
    if (lowerMessage.includes('action') || lowerMessage.includes('task')) {
      return 'Action items from your meetings are automatically extracted and can be converted into tasks, emails, or calendar events. The system identifies who items are assigned to and their due dates. You can see action items in the meeting summaries and detailed views.';
    }
    if (lowerMessage.includes('automation') || lowerMessage.includes('workflow')) {
      return 'The platform automatically processes meeting notes from various sources (Fathom, Otter.ai, etc.), classifies meeting types, and can generate follow-up actions like tasks, emails, and calendar invites based on the meeting content and action items identified.';
    }
    return this.getGeneralResponse(lowerMessage, '', 'home');
  }

  private getMeetingsPageResponse(lowerMessage: string): string {
    if (lowerMessage.includes('card') || lowerMessage.includes('view')) {
      return 'You can switch between Grid and List views using the buttons in the top right. Grid view shows meetings as cards with key details, while List view provides a more compact table format. Click any meeting to see full details.';
    }
    if (lowerMessage.includes('type') || lowerMessage.includes('category')) {
      return 'Meetings are automatically classified into types like External Sales, Internal Team Strategy, Board Meetings, etc. Each type has a colored badge - blue for external meetings, green for internal meetings. This helps with organization and automated workflows.';
    }
    return this.getGeneralResponse(lowerMessage, '', 'meetings');
  }

  private getDetailPageResponse(lowerMessage: string): string {
    if (lowerMessage.includes('participant') || lowerMessage.includes('attend')) {
      return 'The Participants tab shows who was invited, who attended (green indicators), and who was absent (red indicators). This information is automatically extracted from your meeting platform and helps track engagement and follow-up needs.';
    }
    if (lowerMessage.includes('recording') || lowerMessage.includes('play')) {
      return "If a meeting was recorded, you'll see the Recording tab with play and download options. The recording URL is automatically captured from your meeting platform when available.";
    }
    if (lowerMessage.includes('action') || lowerMessage.includes('task')) {
      return "Action items are automatically extracted from meeting transcripts and summaries. Each item shows the description, who it's assigned to, due date, priority level, and current status. These can be automatically converted into tasks in your preferred task management system.";
    }
    return this.getGeneralResponse(lowerMessage, '', 'detail');
  }

  private getSettingsPageResponse(lowerMessage: string): string {
    if (lowerMessage.includes('api') || lowerMessage.includes('integration')) {
      return "In the API configuration sections, you'll set up connections to your meeting note sources (like Fathom.video, Otter.ai) and destination apps (like Google Calendar, Gmail). Each requires an API URL, API Key, and field mapping to work properly.";
    }
    if (lowerMessage.includes('field') || lowerMessage.includes('mapping')) {
      return 'Field mapping tells the system how to match data between different apps. For sources, you map their field names to our standard fields. For destinations, you map our fields to their expected field names. This ensures data flows correctly between systems.';
    }
    if (lowerMessage.includes('source') || lowerMessage.includes('get info')) {
      return "Meeting note sources are apps that provide meeting data to our platform. Configure the API connection and map fields like 'title' to 'Meeting Subject' or 'participants' to 'Meeting Participants'. Make sure to mark sources as Active when ready.";
    }
    if (lowerMessage.includes('destination') || lowerMessage.includes('send info')) {
      return 'Destination apps receive processed meeting data and action items. Set up integrations with calendar apps for scheduling, email apps for follow-ups, and task apps for action items. Field mapping ensures data appears in the right places.';
    }
    return this.getGeneralResponse(lowerMessage, '', 'settings');
  }

  private getGeneralResponse(lowerMessage: string, userMessage: string, pageType: PageType): string {
    // General responses
    if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return "I can help explain any feature you see on this page. Try asking about specific elements like buttons, forms, or data you're viewing. I can also explain workflows, integrations, and best practices for using the platform.";
    }

    if (lowerMessage.includes('password') || lowerMessage.includes('security')) {
      return "For security, you only need to enter your new password and confirm it - no need for your current password since you're already authenticated. The system uses secure password hashing and session management.";
    }

    // Default response with context
    const messageToUse = userMessage || lowerMessage;
    return `I understand you're asking about "${messageToUse}". Based on what I can see on this ${pageType} page, I'd be happy to help explain specific features, workflows, or answer questions about the information displayed. Could you be more specific about what you'd like to know?`;
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
    if (this.isCancellationMessage(lowerMessage)) {
      this.meetingCreationState = null;
      return of("No problem! Meeting creation cancelled. Let me know if you'd like to create a meeting later.");
    }

    // Handle each step of the creation flow
    switch (state.step) {
      case 'title':
        return this.handleTitleStep(userMessage, state);
      case 'date':
        return this.handleDateStep(userMessage, state);
      case 'type':
        return this.handleTypeStep(userMessage, state);
      case 'participants':
        return this.handleParticipantsStep(userMessage, state);
      case 'description':
        return this.handleDescriptionStep(userMessage, state);
      case 'confirm':
        return this.handleConfirmStep(lowerMessage, state);
      default:
        this.meetingCreationState = null;
        return of("Something went wrong. Let's start over. What meeting would you like to create?");
    }
  }

  private isCancellationMessage(lowerMessage: string): boolean {
    return lowerMessage.includes('cancel') || 
           lowerMessage.includes('nevermind') || 
           lowerMessage.includes('stop');
  }

  private handleTitleStep(userMessage: string, state: MeetingCreationState): Observable<string> {
    state.title = userMessage.trim();
    state.step = 'date';
    return of(`Perfect! I'll create a meeting called "${state.title}". When would you like to schedule it? Please provide a date and time (e.g., "Tomorrow at 2 PM" or "December 15th at 10:30 AM").`);
  }

  private handleDateStep(userMessage: string, state: MeetingCreationState): Observable<string> {
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
  }

  private handleTypeStep(userMessage: string, state: MeetingCreationState): Observable<string> {
    state.meetingType = this.normalizeMeetingType(userMessage);
    state.step = 'participants';
    return of(`Got it! This will be a ${state.meetingType}. Who would you like to invite? You can list email addresses separated by commas, or say "just me" for a solo meeting.`);
  }

  private handleParticipantsStep(userMessage: string, state: MeetingCreationState): Observable<string> {
    const lowerMessage = userMessage.toLowerCase();
    
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
  }

  private handleDescriptionStep(userMessage: string, state: MeetingCreationState): Observable<string> {
    const lowerMessage = userMessage.toLowerCase();
    
    if (!lowerMessage.includes('no description') && !lowerMessage.includes('skip')) {
      state.description = userMessage.trim();
    }
    
    state.step = 'confirm';
    return of(this.generateConfirmationMessage(state));
  }

  private handleConfirmStep(lowerMessage: string, state: MeetingCreationState): Observable<string> {
    if (lowerMessage.includes('yes') || lowerMessage.includes('confirm') || 
        lowerMessage.includes('create') || lowerMessage.includes('looks good')) {
      return this.createMeetingFromState(state);
    } else if (lowerMessage.includes('no') || lowerMessage.includes('cancel')) {
      this.meetingCreationState = null;
      return of("Okay, I've cancelled the meeting creation. Let me know if you'd like to start over!");
    } else {
      return of("Please confirm by saying 'yes' to create the meeting, or 'no' to cancel.");
    }
  }

  private extractMeetingDataFromMessage(message: string): Partial<MeetingCreationState> {
    // Simple extraction - look for quoted text as title
    const titleRegex = /"([^"]+)"/;
    const titleMatch = titleRegex.exec(message);
    return {
      title: titleMatch ? titleMatch[1] : undefined
    };
  }

  private parseDateTimeFromMessage(message: string): { startTime?: string; endTime?: string } {
    const now = new Date();
    const lowerMessage = message.toLowerCase();

    // Handle relative dates first
    const relativeDateResult = this.parseRelativeDates(lowerMessage, now, message);
    if (relativeDateResult.startTime) {
      return relativeDateResult;
    }

    // Handle specific month/day patterns
    const monthDayResult = this.parseMonthDayPattern(message, now);
    if (monthDayResult.startTime) {
      return monthDayResult;
    }

    // Handle numeric date patterns
    const numericDateResult = this.parseNumericDatePatterns(message, now);
    if (numericDateResult.startTime) {
      return numericDateResult;
    }

    // Handle time-only patterns (for today/tomorrow)
    const timeOnlyResult = this.parseTimeOnlyPattern(message, now);
    if (timeOnlyResult.startTime) {
      return timeOnlyResult;
    }

    return {};
  }

  private parseRelativeDates(lowerMessage: string, now: Date, originalMessage: string): { startTime?: string } {
    if (lowerMessage.includes('tomorrow')) {
      return this.createDateWithTime(now, 1, originalMessage);
    }

    if (lowerMessage.includes('next week')) {
      return this.createDateWithTime(now, 7, originalMessage);
    }

    return {};
  }

  private createDateWithTime(baseDate: Date, daysToAdd: number, message: string): { startTime?: string } {
    const targetDate = new Date(baseDate);
    targetDate.setDate(targetDate.getDate() + daysToAdd);
    
    const time = this.extractTimeFromMessage(message);
    if (time) {
      targetDate.setHours(time.hours, time.minutes, 0, 0);
      return { startTime: targetDate.toISOString() };
    }
    
    return {};
  }

  private parseMonthDayPattern(message: string, now: Date): { startTime?: string } {
    // Split the complex regex into simpler parts to reduce complexity
    const fullMonths = /(january|february|march|april|may|june|july|august|september|october|november|december)/i;
    const shortMonths = /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i;
    const dayPattern = /\s+(\d{1,2})(?:st|nd|rd|th)?\b/i;
    
    let monthMatch = fullMonths.exec(message);
    monthMatch ??= shortMonths.exec(message);
    
    if (monthMatch) {
      const restOfMessage = message.slice(monthMatch.index + monthMatch[0].length);
      const dayMatch = dayPattern.exec(restOfMessage);
      
      if (dayMatch) {
        const monthName = monthMatch[1].toLowerCase();
        const day = parseInt(dayMatch[1]);
        const time = this.extractTimeFromMessage(message);
        
        const monthIndex = this.getMonthIndex(monthName);
        if (monthIndex !== undefined && time) {
          const meetingDate = new Date(now.getFullYear(), monthIndex, day, time.hours, time.minutes, 0, 0);
          
          // If the date is in the past this year, schedule for next year
          if (meetingDate < now) {
            meetingDate.setFullYear(meetingDate.getFullYear() + 1);
          }
          
          return { startTime: meetingDate.toISOString() };
        }
      }
    }

    return {};
  }

  private getMonthIndex(monthName: string): number | undefined {
    const monthMap: { [key: string]: number } = {
      'january': 0, 'jan': 0, 'february': 1, 'feb': 1, 'march': 2, 'mar': 2,
      'april': 3, 'apr': 3, 'may': 4, 'june': 5, 'jun': 5,
      'july': 6, 'jul': 6, 'august': 7, 'aug': 7, 'september': 8, 'sep': 8,
      'october': 9, 'oct': 9, 'november': 10, 'nov': 10, 'december': 11, 'dec': 11
    };
    
    return monthMap[monthName];
  }

  private parseNumericDatePatterns(message: string, now: Date): { startTime?: string } {
    const datePatterns = [
      /(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/, // MM/DD or MM/DD/YY or MM/DD/YYYY
      /(\d{1,2})-(\d{1,2})(?:-(\d{2,4}))?/, // MM-DD or MM-DD-YY or MM-DD-YYYY
    ];

    for (const pattern of datePatterns) {
      const match = pattern.exec(message);
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

    return {};
  }

  private parseTimeOnlyPattern(message: string, now: Date): { startTime?: string } {
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
      const match = pattern.exec(message);
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
        if (error.error?.message) {
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

  /**
   * Get intelligent meeting analysis
   */
  getMeetingAnalysis(meeting: Meeting): Observable<MeetingAnalysis> {
    return this.aiAssistant.analyzeMeeting(meeting);
  }

  /**
   * Get smart action item suggestions
   */
  suggestActionItems(meeting: Meeting): Observable<ActionItemSuggestion[]> {
    return this.aiAssistant.suggestActionItems(meeting);
  }

  /**
   * Get intelligent scheduling assistance
   */
  getSchedulingSuggestions(participants: string[], meetingType: string): Observable<{
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
    suggestedDuration: number;
    locationSuggestion: string;
  }> {
    return this.aiAssistant.getSchedulingSuggestions(participants, meetingType);
  }

  /**
   * Analyze meeting trends for dashboard insights
   */
  analyzeMeetingTrends(meetings: Meeting[]): Observable<{
    attendancePatterns: Record<string, unknown>;
    actionItemTrends: Record<string, unknown>;
    meetingFrequency: Record<string, unknown>;
    participantEngagement: Record<string, unknown>;
    recommendations: string[];
  }> {
    return this.aiAssistant.getMeetingTrends(meetings);
  }

  /**
   * Enhanced chat response for meeting details with intelligent context
   */
  getIntelligentMeetingHelp(query: string, meeting: Meeting): Observable<string> {
    return this.aiAssistant.getMeetingContextualHelp(query, meeting);
  }
}
