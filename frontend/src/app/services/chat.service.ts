import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Message, PageType } from '../models/chat.model';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor() {}

  getContextualWelcome(pageType: PageType): string {
    switch (pageType) {
      case 'home':
        return 'Hi! I can help you understand your meeting dashboard, search for specific meetings, or explain how the automation features work. What would you like to know?';
      case 'meetings':
        return 'Hello! I can help you navigate your meeting history, explain the filtering options, or provide details about any meeting information you see. How can I assist?';
      case 'detail':
        return 'Hi there! I can explain the meeting details, action items, participant information, or help you understand how to use the recording features. What questions do you have?';
      case 'settings':
        return 'Welcome! I can help you configure your API integrations, set up field mappings, manage your account settings, or explain how the automation workflows function. What would you like to know?';
      default:
        return "Hello! I'm here to help you with any questions about this page. What can I assist you with?";
    }
  }

  generateAIResponse(
    userMessage: string,
    pageType: PageType
  ): Observable<string> {
    // Simulate AI processing delay
    const processingTime = 1000 + Math.random() * 2000;

    return of(this.getContextualResponse(userMessage, pageType)).pipe(
      delay(processingTime)
    );
  }

  private getContextualResponse(
    userMessage: string,
    pageType: PageType
  ): string {
    const lowerMessage = userMessage.toLowerCase();

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
}
