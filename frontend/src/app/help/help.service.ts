import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface HelpArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  isPublished?: boolean; // For admin interface
  sortOrder?: number; // For admin interface
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  createdAt: Date;
  viewCount: number;
}

export interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  type: 'article' | 'faq';
  category: string;
  relevanceScore: number;
}

export interface SupportTicket {
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'account' | 'billing' | 'feature' | 'other';
}

export interface SupportTicketResponse {
  id: string;
  ticketNumber: string;
  status: string;
  createdAt: Date;
}

export interface HelpStatistics {
  totalArticles: number;
  totalFAQs: number;
  totalViews: number;
  popularArticles: HelpArticle[];
}

@Injectable({
  providedIn: 'root'
})
export class HelpService {
  private readonly apiUrl = `${environment.apiUrl}/api/help`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Get all help articles
   */
  getHelpArticles(): Observable<HelpArticle[]> {
    return this.http.get<HelpArticle[]>(`${this.apiUrl}/articles`).pipe(
      catchError(error => {
        console.error('Error fetching help articles:', error);
        return of([]); // Return empty array on error
      })
    );
  }

  /**
   * Get help articles by category
   */
  getHelpArticlesByCategory(category: string): Observable<HelpArticle[]> {
    const params = new HttpParams().set('category', category);
    return this.http.get<HelpArticle[]>(`${this.apiUrl}/articles`, { params }).pipe(
      catchError(error => {
        console.error('Error fetching help articles by category:', error);
        return of([]);
      })
    );
  }

  /**
   * Get a specific help article by ID
   */
  getHelpArticle(id: string): Observable<HelpArticle | null> {
    return this.http.get<HelpArticle>(`${this.apiUrl}/articles/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching help article:', error);
        return of(null);
      })
    );
  }

  /**
   * Get all FAQs
   */
  getFAQs(): Observable<FAQ[]> {
    return this.http.get<FAQ[]>(`${this.apiUrl}/faqs`).pipe(
      catchError(error => {
        console.error('Error fetching FAQs:', error);
        return of([]);
      })
    );
  }

  /**
   * Get FAQs by category
   */
  getFAQsByCategory(category: string): Observable<FAQ[]> {
    const params = new HttpParams().set('category', category);
    return this.http.get<FAQ[]>(`${this.apiUrl}/faqs`, { params }).pipe(
      catchError(error => {
        console.error('Error fetching FAQs by category:', error);
        return of([]);
      })
    );
  }

  /**
   * Search help content (articles and FAQs)
   */
  searchContent(query: string): Observable<SearchResult[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<SearchResult[]>(`${this.apiUrl}/search`, { params }).pipe(
      catchError(error => {
        console.error('Error searching help content:', error);
        return of([]);
      })
    );
  }

  /**
   * Submit a support ticket
   */
  submitSupportTicket(ticket: SupportTicket): Observable<SupportTicketResponse> {
    return this.http.post<SupportTicketResponse>(`${this.apiUrl}/support-tickets`, ticket).pipe(
      catchError(error => {
        console.error('Error submitting support ticket:', error);
        throw error; // Re-throw to let component handle the error
      })
    );
  }

  /**
   * Get help categories
   */
  getHelpCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`).pipe(
      catchError(error => {
        console.error('Error fetching help categories:', error);
        return of(['getting-started', 'user-guide', 'troubleshooting', 'api']);
      })
    );
  }

  /**
   * Get FAQ categories
   */
  getFAQCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/faq-categories`).pipe(
      catchError(error => {
        console.error('Error fetching FAQ categories:', error);
        return of(['General', 'Meetings', 'Action Items', 'Account', 'Technical']);
      })
    );
  }

  /**
   * Increment view count for an article
   */
  incrementViewCount(articleId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/articles/${articleId}/view`, {}).pipe(
      catchError(error => {
        console.error('Error incrementing view count:', error);
        return of();
      })
    );
  }

  /**
   * Get help statistics
   */
  getHelpStatistics(): Observable<HelpStatistics> {
    return this.http.get<HelpStatistics>(`${this.apiUrl}/statistics`).pipe(
      catchError(error => {
        console.error('Error fetching help statistics:', error);
        return of({
          totalArticles: 0,
          totalFAQs: 0,
          totalViews: 0,
          popularArticles: []
        });
      })
    );
  }

  /**
   * Rate a help article
   */
  rateArticle(articleId: string, rating: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/articles/${articleId}/rate`, { rating }).pipe(
      catchError(error => {
        console.error('Error rating article:', error);
        return of();
      })
    );
  }

  /**
   * Submit feedback for a help article
   */
  submitArticleFeedback(articleId: string, feedback: string, isHelpful: boolean): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/articles/${articleId}/feedback`, { 
      feedback, 
      isHelpful 
    }).pipe(
      catchError(error => {
        console.error('Error submitting feedback:', error);
        return of();
      })
    );
  }
}