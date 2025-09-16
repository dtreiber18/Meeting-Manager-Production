import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';

import { HelpAdminComponent } from './help-admin.component';

describe('HelpAdminComponent', () => {
  let component: HelpAdminComponent;
  let fixture: ComponentFixture<HelpAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HelpAdminComponent,
        HttpClientTestingModule,
        NoopAnimationsModule,
        MatSnackBarModule,
        MatTabsModule,
        MatCardModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatIconModule,
        ReactiveFormsModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default tab selected', () => {
    expect(component.selectedTab).toBe(0);
  });

  it('should have form controls for article creation', () => {
    expect(component.articleForm.get('title')).toBeTruthy();
    expect(component.articleForm.get('category')).toBeTruthy();
    expect(component.articleForm.get('description')).toBeTruthy();
    expect(component.articleForm.get('content')).toBeTruthy();
  });

  it('should have form controls for FAQ creation', () => {
    expect(component.faqForm.get('question')).toBeTruthy();
    expect(component.faqForm.get('category')).toBeTruthy();
    expect(component.faqForm.get('answer')).toBeTruthy();
    expect(component.faqForm.get('tags')).toBeTruthy();
    expect(component.faqForm.get('sortOrder')).toBeTruthy();
  });

  it('should show create new article form when new article button is clicked', () => {
    component.showCreateArticle();
    expect(component.showArticleForm).toBe(true);
  });

  it('should show create new FAQ form when new FAQ button is clicked', () => {
    component.showCreateFaq();
    expect(component.showFaqForm).toBe(true);
  });

  it('should cancel edit and hide forms', () => {
    component.showArticleForm = true;
    component.showFaqForm = true;
    component.cancelEdit();
    expect(component.showArticleForm).toBe(false);
    expect(component.showFaqForm).toBe(false);
  });
});