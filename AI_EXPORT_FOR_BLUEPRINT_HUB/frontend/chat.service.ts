import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { map } from 'rxjs/operators';
import { PageType } from './chat.model'; // Adjust import path as needed

export interface ChatRequest {
  message: string;
  pageContext: string;
}

export interface ChatResponse {
  response: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = '/api/chat';

  constructor(private http: HttpClient) {
    // TODO: Update with your Blueprint Hub backend URL
    // if (window.location.hostname.includes('your-domain.com') || 
    //     window.location.hostname === 'localhost') {
    //   this.apiUrl = 'https://your-blueprint-hub-backend.com/api/chat';
    // }
  }

  getContextualWelcome(pageType: PageType): string {
    switch (pageType) {
      case 'home':
        return 'Hi! I can help you navigate your Blueprint Hub dashboard, understand project management features, or explain how the blueprint system works. What would you like to know?';
      case 'projects':
        return 'Hello! I can help you with project management, filtering options, project creation, or any project-related features. How can I assist?';
      case 'blueprints':
        return 'Hi there! I can explain blueprint templates, categories, usage patterns, or help you find the right blueprint for your needs. What questions do you have?';
      case 'detail':
        return 'Welcome! I can help you understand the details on this page, explain specific features, or guide you through available actions. What would you like to know?';
      case 'settings':
        return 'Hi! I can help you configure your Blueprint Hub settings, manage integrations, or explain customization options. What would you like to know?';
      default:
        return "Hello! I'm here to help you with any questions about this page. What can I assist you with?";
    }
  }

  generateAIResponse(
    userMessage: string,
    pageType: PageType
  ): Observable<string> {
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

    // Context-aware responses based on page type and user input
    if (pageType === 'home') {
      if (lowerMessage.includes('search') || lowerMessage.includes('find')) {
        return 'You can search for projects and blueprints using the search bar. It searches through project names, descriptions, tags, and blueprint content. Use filters to narrow down results by category, status, or date.';
      }
      if (lowerMessage.includes('project') || lowerMessage.includes('create')) {
        return 'To create a new project, click the "New Project" button. You can start from scratch or use one of our blueprint templates to accelerate your setup with pre-configured structures and best practices.';
      }
      if (lowerMessage.includes('blueprint')) {
        return 'Blueprints are reusable templates that help you quickly set up projects with proven architectures and configurations. Browse the blueprint library to find templates for your technology stack.';
      }
    }

    if (pageType === 'projects') {
      if (lowerMessage.includes('status') || lowerMessage.includes('filter')) {
        return 'Projects can be filtered by status (Active, Completed, Archived), technology stack, team members, or creation date. Use the filter panel to narrow down your project list.';
      }
      if (lowerMessage.includes('collaborate') || lowerMessage.includes('team')) {
        return 'Projects support team collaboration with role-based access, shared resources, and integrated communication tools. Invite team members and assign appropriate permissions.';
      }
    }

    if (pageType === 'blueprints') {
      if (lowerMessage.includes('category') || lowerMessage.includes('type')) {
        return 'Blueprints are organized by categories like Web Development, Mobile Apps, DevOps, Data Science, etc. Each blueprint includes documentation, sample code, and configuration files.';
      }
      if (lowerMessage.includes('customize') || lowerMessage.includes('modify')) {
        return 'You can customize blueprints by forking them to create your own versions, or by using them as starting points and modifying the generated project structure.';
      }
    }

    if (pageType === 'detail') {
      if (lowerMessage.includes('deploy') || lowerMessage.includes('build')) {
        return 'Use the deployment section to configure CI/CD pipelines, set up environments, and manage builds. Each project can have multiple deployment targets.';
      }
      if (lowerMessage.includes('resource') || lowerMessage.includes('file')) {
        return 'Project resources include source code, documentation, configuration files, and shared assets. Use the file browser to navigate and manage your project structure.';
      }
    }

    if (pageType === 'settings') {
      if (lowerMessage.includes('integration') || lowerMessage.includes('api')) {
        return 'Configure integrations with version control systems, cloud providers, and development tools. Set up API keys and authentication for seamless workflows.';
      }
      if (lowerMessage.includes('notification') || lowerMessage.includes('alert')) {
        return 'Customize notification preferences for project updates, build status, team activities, and system alerts. Choose email, in-app, or webhook delivery methods.';
      }
    }

    // General responses
    if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return "I can help explain any feature you see on this page. Try asking about specific functionality, workflows, or best practices for using Blueprint Hub effectively.";
    }

    // Default response with context
    return `I understand you're asking about "${userMessage}". Based on this ${pageType} page, I'd be happy to help explain specific features or guide you through available options. Could you be more specific about what you'd like to know?`;
  }
}