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
import { EditorModule } from '@tinymce/tinymce-angular';

import { HelpService, HelpArticle, FAQ } from '../help/help.service';
import { HelpAdminService, SupportTicketFull } from '../services/help-admin.service';
import { environment } from '../../environments/environment';

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
    EditorModule
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

  // TinyMCE configuration
  editorConfig = {
    base_url: '/tinymce', // Set base URL for TinyMCE assets
    suffix: '.min', // Use minified versions in production
    height: 300,
    menubar: false, // Simplified for better UX
    plugins: [
      'advlist autolink lists link image charmap preview anchor',
      'searchreplace visualblocks code fullscreen',
      'insertdatetime table paste code help wordcount'
    ],
    toolbar: [
      'undo redo | formatselect | bold italic forecolor backcolor | \
      alignleft aligncenter alignright alignjustify | \
      bullist numlist outdent indent | removeformat | help'
    ],
    content_style: `
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
        font-size: 14px;
        line-height: 1.6;
        margin: 8px;
      }
      pre { background-color: #f4f4f4; padding: 10px; border-radius: 4px; }
      blockquote { border-left: 4px solid #ccc; margin-left: 0; padding-left: 16px; }
      h1, h2, h3, h4, h5, h6 { margin-top: 1rem; margin-bottom: 0.5rem; }
      p { margin-bottom: 1rem; }
      ul, ol { margin-bottom: 1rem; }
    `,
    branding: false,
    promotion: false,
    statusbar: false, // Remove status bar to clean up UI
    resize: false, // Disable resize to maintain consistent layout
    paste_data_images: false, // Disable for security in production
    automatic_uploads: false,
    valid_elements: '*[*]', // Allow all elements for flexibility
    extended_valid_elements: 'script[src|async|defer|type|charset]',
    ...(environment.tinymceApiKey && { api_key: environment.tinymceApiKey }),
    setup: (editor: any) => {
      editor.on('change', () => {
        editor.save();
      });
    }
  };

  // Larger editor config for content
  contentEditorConfig = {
    base_url: '/tinymce', // Set base URL for TinyMCE assets
    suffix: '.min', // Use minified versions in production
    height: 400,
    menubar: false, // Simplified for better UX
    plugins: [
      'advlist autolink lists link image charmap preview anchor',
      'searchreplace visualblocks code fullscreen',
      'insertdatetime table paste code help wordcount'
    ],
    toolbar: [
      'undo redo | formatselect | bold italic forecolor backcolor | \
      alignleft aligncenter alignright alignjustify | \
      bullist numlist outdent indent | removeformat | help',
      'link image | table | code | fullscreen'
    ],
    content_style: `
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
        font-size: 14px;
        line-height: 1.6;
        margin: 8px;
      }
      pre { background-color: #f4f4f4; padding: 10px; border-radius: 4px; }
      blockquote { border-left: 4px solid #ccc; margin-left: 0; padding-left: 16px; }
      h1, h2, h3, h4, h5, h6 { margin-top: 1rem; margin-bottom: 0.5rem; }
      p { margin-bottom: 1rem; }
      ul, ol { margin-bottom: 1rem; }
    `,
    branding: false,
    promotion: false,
    statusbar: false, // Remove status bar to clean up UI
    resize: false, // Disable resize to maintain consistent layout
    paste_data_images: false, // Disable for security in production
    automatic_uploads: false,
    valid_elements: '*[*]', // Allow all elements for flexibility
    extended_valid_elements: 'script[src|async|defer|type|charset]',
    ...(environment.tinymceApiKey && { api_key: environment.tinymceApiKey }),
    setup: (editor: any) => {
      editor.on('change', () => {
        editor.save();
      });
    }
  };
  
  // Table columns
  articleColumns = ['title', 'category', 'published', 'createdAt', 'actions'];
  faqColumns = ['question', 'category', 'createdAt', 'actions'];
  ticketColumns = ['ticketNumber', 'subject', 'priority', 'status', 'createdAt', 'actions'];

  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private helpService: HelpService,
    private helpAdminService: HelpAdminService
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
    // Mock data for now - replace with actual API call
    setTimeout(() => {
      this.articles = [
        {
          id: '1',
          title: 'Getting Started with Meeting Manager',
          category: 'getting-started',
          description: 'Learn the basics of using Meeting Manager',
          content: 'Complete guide to getting started...',
          tags: ['beginner', 'setup'],
          createdAt: new Date(),
          updatedAt: new Date(),
          viewCount: 245,
          isPublished: true,
          sortOrder: 1
        },
        {
          id: '2',
          title: 'Advanced Meeting Features',
          category: 'user-guide',
          description: 'Explore advanced features for power users',
          content: 'Advanced features include...',
          tags: ['advanced', 'features'],
          createdAt: new Date(),
          updatedAt: new Date(),
          viewCount: 132,
          isPublished: false,
          sortOrder: 2
        }
      ];
      this.isLoading = false;
    }, 1000);
  }

  private loadFaqs(): void {
    // Mock data for now - replace with actual API call
    this.faqs = [
      {
        id: '1',
        question: 'How do I create a meeting?',
        answer: 'Click the "New Meeting" button on the dashboard...',
        category: 'getting-started',
        tags: ['meeting', 'creation'],
        createdAt: new Date(),
        viewCount: 0
      },
      {
        id: '2',
        question: 'Can I export meeting data?',
        answer: 'Yes, you can export meetings as PDF or Excel...',
        category: 'user-guide',
        tags: ['export', 'data'],
        createdAt: new Date(),
        viewCount: 0
      }
    ];
  }

  private loadTickets(): void {
    // Mock data for now - replace with actual API call
    this.tickets = [
      {
        id: 1,
        ticketNumber: 'HELP-001',
        subject: 'Cannot access my account',
        description: 'User is unable to log into their account after password reset',
        priority: 'high',
        category: 'account',
        status: 'open',
        submittedBy: 'user@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        responses: []
      }
    ];
  }

  // Article management
  showCreateArticle(): void {
    this.editingArticle = null;
    this.articleForm.reset();
    this.showArticleForm = true;
  }

  editArticle(article: any): void {
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

  deleteArticle(article: any): void {
    if (confirm(`Are you sure you want to delete "${article.title}"?`)) {
      this.articles = this.articles.filter(a => a.id !== article.id);
      this.snackBar.open('Article deleted successfully!', 'Close', { duration: 3000 });
    }
  }

  toggleArticlePublished(article: any): void {
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

  editFaq(faq: any): void {
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

  deleteFaq(faq: any): void {
    if (confirm(`Are you sure you want to delete this FAQ?`)) {
      this.faqs = this.faqs.filter(f => f.id !== faq.id);
      this.snackBar.open('FAQ deleted successfully!', 'Close', { duration: 3000 });
    }
  }

  // File upload
  onFileUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadFile(file);
    }
  }

  private uploadFile(file: File): void {
    this.isLoading = true;
    
    // Mock file upload - replace with actual API call
    setTimeout(() => {
      this.snackBar.open('File uploaded successfully!', 'Close', { duration: 3000 });
      this.isLoading = false;
    }, 2000);
  }

  // Bulk import
  importArticles(event: any): void {
    const file = event.target.files[0];
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

  importFaqs(event: any): void {
    const file = event.target.files[0];
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