import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HelpArticle, FAQ } from '../help/help.service';

export interface HelpFaq extends FAQ {
  sortOrder?: number;
  isPublished?: boolean;
}

export interface SupportTicketFull {
  id: number;
  ticketNumber: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'account' | 'billing' | 'feature' | 'other';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  submittedBy: string;
  createdAt: Date;
  updatedAt: Date;
  responses: string[];
}

export interface AdminAnalytics {
  totalArticles: number;
  totalFaqs: number;
  totalTickets: number;
  openTickets: number;
  totalViews: number;
  recentSearches: string[];
}

export interface BulkImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class HelpAdminService {
  private baseUrl = '/api/admin/help';

  constructor(private http: HttpClient) {}

  // Articles Management
  createArticle(article: Omit<HelpArticle, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>): Observable<HelpArticle> {
    return this.http.post<HelpArticle>(`${this.baseUrl}/articles`, article);
  }

  updateArticle(id: number, article: Partial<HelpArticle>): Observable<HelpArticle> {
    return this.http.put<HelpArticle>(`${this.baseUrl}/articles/${id}`, article);
  }

  deleteArticle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/articles/${id}`);
  }

  toggleArticlePublished(id: number): Observable<HelpArticle> {
    return this.http.patch<HelpArticle>(`${this.baseUrl}/articles/${id}/toggle-published`, {});
  }

  // FAQs Management
  createFaq(faq: Omit<HelpFaq, 'id' | 'createdAt' | 'updatedAt'>): Observable<HelpFaq> {
    return this.http.post<HelpFaq>(`${this.baseUrl}/faqs`, faq);
  }

  updateFaq(id: number, faq: Partial<HelpFaq>): Observable<HelpFaq> {
    return this.http.put<HelpFaq>(`${this.baseUrl}/faqs/${id}`, faq);
  }

  deleteFaq(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/faqs/${id}`);
  }

  // Support Tickets Management
  getTickets(page: number = 0, size: number = 20): Observable<{ content: SupportTicketFull[], totalElements: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<{ content: SupportTicketFull[], totalElements: number }>(`${this.baseUrl}/tickets`, { params });
  }

  updateTicketStatus(id: number, status: string): Observable<SupportTicketFull> {
    return this.http.patch<SupportTicketFull>(`${this.baseUrl}/tickets/${id}/status`, { status });
  }

  respondToTicket(id: number, response: string): Observable<SupportTicketFull> {
    return this.http.post<SupportTicketFull>(`${this.baseUrl}/tickets/${id}/respond`, { response });
  }

  // File Upload
  uploadFile(file: File, type: 'article' | 'faq'): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    return this.http.post<string>(`${this.baseUrl}/upload`, formData);
  }

  // Bulk Import
  importArticles(file: File): Observable<BulkImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<BulkImportResult>(`${this.baseUrl}/import/articles`, formData);
  }

  importFaqs(file: File): Observable<BulkImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<BulkImportResult>(`${this.baseUrl}/import/faqs`, formData);
  }

  // Analytics
  getAnalytics(): Observable<AdminAnalytics> {
    return this.http.get<AdminAnalytics>(`${this.baseUrl}/analytics`);
  }

  getPopularContent(): Observable<{
    articles: HelpArticle[];
    faqs: HelpFaq[];
  }> {
    return this.http.get<{
      articles: HelpArticle[];
      faqs: HelpFaq[];
    }>(`${this.baseUrl}/analytics/popular`);
  }

  getSearchAnalytics(): Observable<{
    searches: Array<{ query: string; count: number; lastSearched: Date }>;
    trends: Array<{ period: string; searchCount: number }>;
  }> {
    return this.http.get<{
      searches: Array<{ query: string; count: number; lastSearched: Date }>;
      trends: Array<{ period: string; searchCount: number }>;
    }>(`${this.baseUrl}/analytics/searches`);
  }
}