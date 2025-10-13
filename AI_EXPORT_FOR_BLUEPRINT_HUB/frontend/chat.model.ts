export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Adapt these page types to your Blueprint Hub pages
export type PageType = 'home' | 'projects' | 'blueprints' | 'detail' | 'settings';

export interface AIChatContext {
  context: string;
  pageType: PageType;
}