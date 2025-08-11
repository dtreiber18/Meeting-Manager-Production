export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export type PageType = 'home' | 'meetings' | 'detail' | 'settings';

export interface AIChatContext {
  context: string;
  pageType: PageType;
}
