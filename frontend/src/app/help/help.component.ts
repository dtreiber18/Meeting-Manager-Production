import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { marked } from 'marked';
import { HelpService, HelpArticle, FAQ, SearchResult, SupportTicket, SupportTicketResponse } from './help.service';

// Mock service for now - will be replaced with actual service
// REMOVED: Using real HelpService now instead of MockHelpService

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatExpansionModule,
    MatProgressSpinnerModule
  ],
  providers: [],
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  // Current section navigation
  currentSection = 'main';
  
  // Search functionality
  searchQuery = '';
  searchResults: SearchResult[] = [];
  searchSuggestions: string[] = [
    'How to create a meeting',
    'Calendar integration setup',
    'Action items management',
    'User permissions',
    'Notification settings',
    'Password reset',
    'Export meeting data',
    'Mobile app access'
  ];
  showSuggestions = false;

  // Filter functionality
  showFilters = false;
  selectedCategory = '';
  selectedContentType = '';
  sortBy = 'relevance';

  // Content data
  helpArticles: HelpArticle[] = [];
  faqs: FAQ[] = [];
  faqCategories: string[] = ['General', 'Meetings', 'Action Items', 'Account', 'Technical'];
  selectedFAQCategory = 'General';

  // Support ticket form
  showTicketForm = false;
  supportTicketForm: FormGroup;
  isSubmittingTicket = false;

  // Loading states
  isLoading = false;
  
  // Error states
  hasError = false;
  errorMessage = '';
  retryAttempts = 0;
  maxRetryAttempts = 3;

  constructor(
    private readonly helpService: HelpService,
    private readonly formBuilder: FormBuilder,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router
  ) {
    this.supportTicketForm = this.formBuilder.group({
      subject: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      priority: ['medium', Validators.required],
      category: ['technical', Validators.required]
    });

    // Configure marked for better formatting
    marked.setOptions({
      breaks: true,
      gfm: true
    });
  }

  ngOnInit(): void {
    this.loadHelpContent();
    this.setupSearchDebounce();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Navigation
  navigateToAdmin(): void {
    this.router.navigate(['/help/admin']);
  }

  private setupSearchDebounce(): void {
    // Add debounce for search as user types
    const searchInput$ = new Subject<string>();
    searchInput$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      if (query.trim().length > 2) {
        this.performSearch();
      }
    });
  }

  private loadHelpContent(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';
    
    // Load help articles
    this.helpService.getHelpArticles().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (articles: HelpArticle[]) => {
        this.helpArticles = articles;
        this.isLoading = false;
        this.retryAttempts = 0;
      },
      error: (error: unknown) => {
        console.error('Error loading help articles:', error);
        this.handleLoadError('Failed to load help articles. Please check your connection and try again.');
      }
    });

    // Load FAQs
    this.helpService.getFAQs().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (faqs: FAQ[]) => {
        this.faqs = faqs;
      },
      error: (error: unknown) => {
        console.error('Error loading FAQs:', error);
        this.handleLoadError('Failed to load FAQ content. Please check your connection and try again.');
      }
    });
  }

  private handleLoadError(message: string): void {
    this.isLoading = false;
    this.hasError = true;
    this.errorMessage = message;
    this.retryAttempts++;
    
    // Show user-friendly error message
    this.snackBar.open(message, 'Retry', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    }).onAction().subscribe(() => {
      this.retryLoadContent();
    });
  }

  retryLoadContent(): void {
    if (this.retryAttempts < this.maxRetryAttempts) {
      this.loadHelpContent();
    } else {
      this.snackBar.open('Maximum retry attempts reached. Please contact support.', 'Close', {
        duration: 10000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }

  // Navigation methods
  navigateToSection(section: string): void {
    this.currentSection = section;
  }

  goBack(): void {
    this.currentSection = 'main';
    this.searchResults = [];
  }

  // Search functionality
  onSearchInput(): void {
    this.showSuggestions = this.searchQuery.length > 0 && this.searchQuery.length < 3;
  }

  performSearch(): void {
    if (!this.searchQuery.trim()) {
      return;
    }

    this.showSuggestions = false;
    this.isLoading = true;

    this.helpService.searchContent(this.searchQuery).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (results: SearchResult[]) => {
        this.searchResults = results;
        this.currentSection = 'search-results';
        this.isLoading = false;
      },
      error: (error: unknown) => {
        console.error('Error searching content:', error);
        this.isLoading = false;
        this.snackBar.open('Search failed. Please check your connection and try again.', 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  selectSuggestion(suggestion: string): void {
    this.searchQuery = suggestion;
    this.performSearch();
  }

  openResult(result: SearchResult): void {
    if (result.type === 'article') {
      this.navigateToSection(result.category);
    } else if (result.type === 'faq') {
      this.navigateToSection('faq');
      this.selectedFAQCategory = result.category;
    }
  }

  getResultIcon(type: string): string {
    switch (type) {
      case 'article': return 'article';
      case 'faq': return 'quiz';
      default: return 'help';
    }
  }

  // Content filtering methods
  getFilteredArticles(category: string): HelpArticle[] {
    return this.helpArticles.filter(article => article.category === category);
  }

  getFilteredFAQs(): FAQ[] {
    if (this.selectedFAQCategory === 'General') {
      return this.faqs;
    }
    return this.faqs.filter(faq => faq.category === this.selectedFAQCategory);
  }

  selectFAQCategory(category: string): void {
    this.selectedFAQCategory = category;
  }

  // Article count methods
  getArticleCount(category: string): number {
    return this.helpArticles.filter(article => article.category === category).length;
  }

  getFAQCount(): number {
    return this.faqs.length;
  }

  // Support ticket methods
  openSupportTicket(): void {
    this.showTicketForm = true;
  }

  cancelTicketForm(): void {
    this.showTicketForm = false;
    this.supportTicketForm.reset({
      priority: 'medium',
      category: 'technical'
    });
  }

  submitSupportTicket(): void {
    if (this.supportTicketForm.invalid) {
      return;
    }

    this.isSubmittingTicket = true;
    const ticket: SupportTicket = this.supportTicketForm.value;

    this.helpService.submitSupportTicket(ticket).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (_response: SupportTicketResponse) => {
        this.snackBar.open('Support ticket submitted successfully! You will receive a confirmation email.', 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        this.cancelTicketForm();
        this.isSubmittingTicket = false;
      },
      error: (error: unknown) => {
        console.error('Error submitting ticket:', error);
        this.snackBar.open('Error submitting ticket. Please try again or contact support directly.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isSubmittingTicket = false;
      }
    });
  }

  startLiveChat(): void {
    // Placeholder for live chat integration
    this.snackBar.open('Live chat is not currently available. Please submit a support ticket or send an email.', 'Close', {
      duration: 5000
    });
  }

  // Filter methods
  applyFilters(): void {
    // Apply filters to search results or content
    if (this.currentSection === 'search-results') {
      this.performSearch(); // Re-search with filters applied
    } else {
      // Filter the current content based on selected filters
      this.filterCurrentContent();
    }
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.selectedContentType = '';
    this.sortBy = 'relevance';
    this.applyFilters();
  }

  private filterCurrentContent(): void {
    // This method would filter the current articles/FAQs based on selected filters
    // Implementation depends on the specific filtering requirements
  }

  // Markdown to HTML conversion
  convertMarkdownToHtml(markdown: string): string {
    if (!markdown) {
      return '';
    }
    try {
      return marked(markdown) as string;
    } catch (error) {
      console.error('Error converting markdown to HTML:', error);
      return markdown; // Fallback to original text
    }
  }

  // Get formatted content for display
  getFormattedContent(content: string): string {
    return this.convertMarkdownToHtml(content);
  }
}