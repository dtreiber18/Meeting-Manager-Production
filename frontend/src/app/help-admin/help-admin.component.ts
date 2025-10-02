import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { QuillModule } from 'ngx-quill';

import { HelpService, HelpArticle, FAQ } from '../help/help.service';
import { HelpAdminService, SupportTicketFull, HelpFaq } from '../services/help-admin.service';

@Component({
  selector: 'app-help-admin',
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
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatChipsModule,
    QuillModule
  ],
  templateUrl: './help-admin.component.html',
  styleUrls: ['./help-admin.component.scss']
})
export class HelpAdminComponent implements OnInit {
  
  // Form groups
  articleForm!: FormGroup;
  faqForm!: FormGroup;
  
  // Data arrays
  articles: HelpArticle[] = [];
  faqs: FAQ[] = [];
  tickets: SupportTicketFull[] = [];
  
  // UI state
  selectedTab = 0;
  isLoading = false;
  showArticleForm = false;
  showFaqForm = false;
  editingArticle: HelpArticle | null = null;
  editingFaq: FAQ | null = null;
  
  // Categories and options
  categories = [
    'getting-started',
    'user-guide', 
    'troubleshooting',
    'api-documentation',
    'account-management'
  ];
  
  priorities = ['low', 'medium', 'high', 'urgent'];
  statuses = ['open', 'in-progress', 'waiting-for-customer', 'resolved', 'closed'];

  // Quill Editor configuration - clean and simple editor for article descriptions
  editorConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link']
    ],
    theme: 'snow'
  };

  // Enhanced editor config for article content
  contentEditorConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image', 'video']
    ],
    theme: 'snow'
  };
  
  // Table columns
  articleColumns = ['title', 'category', 'published', 'createdAt', 'actions'];
  faqColumns = ['question', 'category', 'createdAt', 'actions'];
  ticketColumns = ['ticketNumber', 'subject', 'priority', 'status', 'createdAt', 'actions'];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly helpService: HelpService,
    private readonly helpAdminService: HelpAdminService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadAllData();
  }

  private initializeForms(): void {
    this.articleForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      content: ['', [Validators.required, Validators.minLength(50)]],
      category: ['', Validators.required],
      tags: [''],
      isPublished: [false],
      sortOrder: [0, [Validators.min(0)]]
    });

    this.faqForm = this.formBuilder.group({
      question: ['', [Validators.required, Validators.minLength(5)]],
      answer: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      tags: [''],
      sortOrder: [0, [Validators.min(0)]]
    });
  }

  private loadAllData(): void {
    this.loadArticles();
    this.loadFaqs();
    this.loadTickets();
  }

  private loadArticles(): void {
    this.isLoading = true;
    // Use actual backend service instead of mock data
    this.helpService.getHelpArticles().subscribe({
      next: (articles) => {
        this.articles = articles.map(article => ({
          ...article,
          isPublished: article.isPublished ?? true, // Default for existing articles
          sortOrder: article.sortOrder ?? 0 // Default sort order
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading help articles:', error);
        this.isLoading = false;
        this.snackBar.open('Error loading help articles', 'Close', { duration: 3000 });
        // Fallback to empty array instead of mock data
        this.articles = [];
      }
    });
  }

  private loadFaqs(): void {
    this.isLoading = true;
    // Use actual backend service instead of mock data
    this.helpService.getFAQs().subscribe({
      next: (faqs) => {
        this.faqs = faqs.map(faq => ({
          ...faq,
          isPublished: true, // Default for existing FAQs
          sortOrder: 0 // Default sort order
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading FAQs:', error);
        this.isLoading = false;
        this.snackBar.open('Error loading FAQs', 'Close', { duration: 3000 });
        // Fallback to empty array instead of mock data
        this.faqs = [];
      }
    });
  }

  private loadTickets(): void {
    this.isLoading = true;
    // Use actual backend service instead of mock data
    this.helpAdminService.getTickets(0, 20).subscribe({
      next: (response) => {
        this.tickets = response.content;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading support tickets:', error);
        this.isLoading = false;
        this.snackBar.open('Error loading support tickets', 'Close', { duration: 3000 });
        // Fallback to empty array instead of mock data
        this.tickets = [];
      }
    });
  }

  // Article management
  showCreateArticle(): void {
    this.editingArticle = null;
    this.articleForm.reset();
    this.showArticleForm = true;
  }

  editArticle(article: HelpArticle): void {
    this.editingArticle = article;
    this.articleForm.patchValue({
      title: article.title,
      description: article.description,
      content: article.content,
      category: article.category,
      tags: article.tags?.join(', ') || '',
      isPublished: article.isPublished,
      sortOrder: article.sortOrder || 0
    });
    this.showArticleForm = true;
  }

  saveArticle(): void {
    if (this.articleForm.invalid) {
      this.markFormGroupTouched(this.articleForm);
      return;
    }

    const formValue = this.articleForm.value;
    const articleData = {
      ...formValue,
      tags: formValue.tags ? formValue.tags.split(',').map((tag: string) => tag.trim()) : []
    };

    this.isLoading = true;

    // Mock save - replace with actual API call
    setTimeout(() => {
      if (this.editingArticle) {
        // Update existing article
        const index = this.articles.findIndex(a => a.id === this.editingArticle!.id);
        if (index !== -1) {
          this.articles[index] = { ...this.editingArticle, ...articleData };
        }
        this.snackBar.open('Article updated successfully!', 'Close', { duration: 3000 });
      } else {
        // Create new article
        const newArticle = {
          id: (this.articles.length + 1).toString(),
          ...articleData,
          createdAt: new Date(),
          updatedAt: new Date(),
          viewCount: 0,
          isPublished: articleData.isPublished || false,
          sortOrder: articleData.sortOrder || 0
        };
        this.articles.push(newArticle);
        this.snackBar.open('Article created successfully!', 'Close', { duration: 3000 });
      }

      this.showArticleForm = false;
      this.isLoading = false;
    }, 1000);
  }

  deleteArticle(article: HelpArticle): void {
    if (confirm(`Are you sure you want to delete "${article.title}"?`)) {
      this.articles = this.articles.filter(a => a.id !== article.id);
      this.snackBar.open('Article deleted successfully!', 'Close', { duration: 3000 });
    }
  }

  toggleArticlePublished(article: HelpArticle): void {
    article.isPublished = !article.isPublished;
    const status = article.isPublished ? 'published' : 'unpublished';
    this.snackBar.open(`Article ${status} successfully!`, 'Close', { duration: 3000 });
  }

  // FAQ management
  showCreateFaq(): void {
    this.editingFaq = null;
    this.faqForm.reset();
    this.showFaqForm = true;
  }

  editFaq(faq: HelpFaq): void {
    this.editingFaq = faq;
    this.faqForm.patchValue({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      tags: faq.tags?.join(', ') || '',
      sortOrder: faq.sortOrder || 0
    });
    this.showFaqForm = true;
  }

  saveFaq(): void {
    if (this.faqForm.invalid) {
      this.markFormGroupTouched(this.faqForm);
      return;
    }

    const formValue = this.faqForm.value;
    const faqData = {
      ...formValue,
      tags: formValue.tags ? formValue.tags.split(',').map((tag: string) => tag.trim()) : []
    };

    this.isLoading = true;

    // Mock save - replace with actual API call
    setTimeout(() => {
      if (this.editingFaq) {
        // Update existing FAQ
        const index = this.faqs.findIndex(f => f.id === this.editingFaq!.id);
        if (index !== -1) {
          this.faqs[index] = { ...this.editingFaq, ...faqData };
        }
        this.snackBar.open('FAQ updated successfully!', 'Close', { duration: 3000 });
      } else {
        // Create new FAQ
        const newFaq = {
          id: (this.faqs.length + 1).toString(),
          ...faqData,
          createdAt: new Date(),
          viewCount: 0
        };
        this.faqs.push(newFaq);
        this.snackBar.open('FAQ created successfully!', 'Close', { duration: 3000 });
      }

      this.showFaqForm = false;
      this.isLoading = false;
    }, 1000);
  }

  deleteFaq(faq: HelpFaq): void {
    if (confirm(`Are you sure you want to delete this FAQ?`)) {
      this.faqs = this.faqs.filter(f => f.id !== faq.id);
      this.snackBar.open('FAQ deleted successfully!', 'Close', { duration: 3000 });
    }
  }

  // File upload
  onFileUpload(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target?.files?.[0];
    if (file) {
      this.uploadFile(file);
    }
  }

  private uploadFile(_file: File): void {
    this.isLoading = true;
    
    // Mock file upload - replace with actual API call
    setTimeout(() => {
      this.snackBar.open('File uploaded successfully!', 'Close', { duration: 3000 });
      this.isLoading = false;
    }, 2000);
  }

  // Bulk import
  importArticles(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target?.files?.[0];
    if (file) {
      this.isLoading = true;
      
      // Mock import - replace with actual API call
      setTimeout(() => {
        this.snackBar.open('Articles imported successfully!', 'Close', { duration: 3000 });
        this.loadArticles();
        this.isLoading = false;
      }, 3000);
    }
  }

  importFaqs(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target?.files?.[0];
    if (file) {
      this.isLoading = true;
      
      // Mock import - replace with actual API call
      setTimeout(() => {
        this.snackBar.open('FAQs imported successfully!', 'Close', { duration: 3000 });
        this.loadFaqs();
        this.isLoading = false;
      }, 3000);
    }
  }

  // Utility methods
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  cancelEdit(): void {
    this.showArticleForm = false;
    this.showFaqForm = false;
    this.editingArticle = null;
    this.editingFaq = null;
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'open': 'warn',
      'in-progress': 'accent',
      'resolved': 'primary',
      'closed': ''
    };
    return statusColors[status] || '';
  }

  getPriorityColor(priority: string): string {
    const priorityColors: { [key: string]: string } = {
      'low': 'primary',
      'medium': 'accent',
      'high': 'warn',
      'urgent': 'warn'
    };
    return priorityColors[priority] || '';
  }
}