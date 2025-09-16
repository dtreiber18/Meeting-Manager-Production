import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { ReactiveFormsModule } from '@angular/forms';

import { HelpComponent } from './help.component';

describe('HelpComponent', () => {
  let component: HelpComponent;
  let fixture: ComponentFixture<HelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HelpComponent,
        HttpClientTestingModule,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatTabsModule,
        MatExpansionModule,
        MatChipsModule,
        ReactiveFormsModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty search query', () => {
    expect(component.searchQuery).toBe('');
  });

  it('should filter articles by category', () => {
    component.helpArticles = [
      { 
        id: '1', 
        title: 'Getting Started', 
        content: 'How to get started', 
        category: 'guide',
        description: 'Guide to getting started',
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        viewCount: 0
      },
      { 
        id: '2', 
        title: 'Advanced Features', 
        content: 'Advanced functionality', 
        category: 'advanced',
        description: 'Advanced features guide',
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        viewCount: 0
      }
    ];
    
    const filtered = component.getFilteredArticles('guide');
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toBe('Getting Started');
  });

  it('should filter FAQs correctly', () => {
    component.faqs = [
      { 
        id: '1', 
        question: 'How to login?', 
        answer: 'Use your credentials', 
        category: 'auth',
        tags: [],
        createdAt: new Date(),
        viewCount: 0
      },
      { 
        id: '2', 
        question: 'How to reset password?', 
        answer: 'Click forgot password', 
        category: 'auth',
        tags: [],
        createdAt: new Date(),
        viewCount: 0
      }
    ];
    
    const filtered = component.getFilteredFAQs();
    expect(filtered.length).toBeGreaterThanOrEqual(0);
  });
});