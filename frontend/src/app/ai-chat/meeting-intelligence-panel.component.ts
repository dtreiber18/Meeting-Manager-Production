import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChatService } from '../services/chat.service';
import { Meeting } from '../meetings/meeting.model';
import { MeetingAnalysis, ActionItemSuggestion } from '../services/meeting-ai-assistant.service';

@Component({
  selector: 'app-meeting-intelligence-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  template: `
    <div class="meeting-intelligence-panel space-y-4">
      
      <!-- Meeting Analysis Card -->
      <mat-card class="analysis-card">
        <mat-card-header>
          <mat-card-title class="flex items-center">
            <mat-icon class="mr-2 text-blue-600">analytics</mat-icon>
            Meeting Intelligence
          </mat-card-title>
          <button 
            mat-icon-button 
            (click)="refreshAnalysis()"
            [disabled]="loadingAnalysis"
            matTooltip="Refresh Analysis">
            <mat-icon [class.spin]="loadingAnalysis">refresh</mat-icon>
          </button>
        </mat-card-header>
        
        <mat-card-content>
          <div *ngIf="loadingAnalysis" class="text-center py-4">
            <mat-spinner diameter="40"></mat-spinner>
            <p class="mt-2 text-gray-600">Analyzing meeting...</p>
          </div>

          <div *ngIf="!loadingAnalysis && analysis" class="space-y-4">
            <!-- Effectiveness Score -->
            <div class="effectiveness-score">
              <div class="flex items-center justify-between mb-2">
                <span class="font-semibold">Meeting Effectiveness</span>
                <div class="flex items-center">
                  <div class="score-circle" [ngClass]="getScoreClass(analysis.meetingEffectiveness.score)">
                    {{ analysis.meetingEffectiveness.score }}/10
                  </div>
                </div>
              </div>
              
              <!-- Strengths -->
              <div *ngIf="analysis.meetingEffectiveness.strengths.length > 0" class="mb-3">
                <h4 class="text-sm font-medium text-green-700 mb-1">✅ Strengths</h4>
                <div class="space-y-1">
                  <div *ngFor="let strength of analysis.meetingEffectiveness.strengths" 
                       class="text-xs bg-green-50 text-green-800 px-2 py-1 rounded">
                    {{ strength }}
                  </div>
                </div>
              </div>

              <!-- Improvements -->
              <div *ngIf="analysis.meetingEffectiveness.improvements.length > 0">
                <h4 class="text-sm font-medium text-amber-700 mb-1">💡 Improvements</h4>
                <div class="space-y-1">
                  <div *ngFor="let improvement of analysis.meetingEffectiveness.improvements" 
                       class="text-xs bg-amber-50 text-amber-800 px-2 py-1 rounded">
                    {{ improvement }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Key Insights -->
            <div *ngIf="analysis.keyInsights.length > 0" class="insights-section">
              <h4 class="text-sm font-semibold mb-2 text-gray-700">🔍 Key Insights</h4>
              <div class="space-y-2">
                <div *ngFor="let insight of analysis.keyInsights" 
                     class="text-xs bg-blue-50 text-blue-800 px-3 py-2 rounded border-l-3 border-blue-400">
                  {{ insight }}
                </div>
              </div>
            </div>

            <!-- Participant Insights -->
            <div class="participant-insights">
              <h4 class="text-sm font-semibold mb-2 text-gray-700">👥 Participant Insights</h4>
              <div class="grid grid-cols-2 gap-3 text-xs">
                <div class="stat-item">
                  <span class="text-gray-600">Total:</span>
                  <span class="font-medium">{{ analysis.participantInsights.totalParticipants }}</span>
                </div>
                <div class="stat-item">
                  <span class="text-gray-600">Attendance:</span>
                  <span class="font-medium" [ngClass]="getAttendanceClass(analysis.participantInsights.attendanceRate)">
                    {{ analysis.participantInsights.attendanceRate.toFixed(1) }}%
                  </span>
                </div>
              </div>
              
              <div *ngIf="analysis.participantInsights.keyParticipants.length > 0" class="mt-2">
                <span class="text-xs text-gray-600">Key Participants:</span>
                <div class="flex flex-wrap gap-1 mt-1">
                  <mat-chip *ngFor="let participant of analysis.participantInsights.keyParticipants" 
                           class="text-xs">
                    {{ participant }}
                  </mat-chip>
                </div>
              </div>

              <div *ngIf="analysis.participantInsights.missingStakeholders.length > 0" class="mt-2">
                <span class="text-xs text-red-600">Missing Required:</span>
                <div class="flex flex-wrap gap-1 mt-1">
                  <mat-chip *ngFor="let missing of analysis.participantInsights.missingStakeholders" 
                           color="warn" class="text-xs">
                    {{ missing }}
                  </mat-chip>
                </div>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Action Item Suggestions -->
      <mat-card class="suggestions-card">
        <mat-card-header>
          <mat-card-title class="flex items-center">
            <mat-icon class="mr-2 text-purple-600">lightbulb</mat-icon>
            AI Suggestions
          </mat-card-title>
          <button 
            mat-icon-button 
            (click)="refreshSuggestions()"
            [disabled]="loadingSuggestions"
            matTooltip="Refresh Suggestions">
            <mat-icon [class.spin]="loadingSuggestions">refresh</mat-icon>
          </button>
        </mat-card-header>

        <mat-card-content>
          <div *ngIf="loadingSuggestions" class="text-center py-4">
            <mat-spinner diameter="40"></mat-spinner>
            <p class="mt-2 text-gray-600">Generating suggestions...</p>
          </div>

          <div *ngIf="!loadingSuggestions && suggestions.length > 0" class="space-y-3">
            <div *ngFor="let suggestion of suggestions" 
                 class="suggestion-item p-3 bg-gray-50 rounded-lg border">
              <div class="flex items-start justify-between mb-2">
                <h4 class="text-sm font-semibold text-gray-900">{{ suggestion.title }}</h4>
                <mat-chip [ngClass]="getPriorityClass(suggestion.priority)" class="text-xs">
                  {{ suggestion.priority }}
                </mat-chip>
              </div>
              
              <p class="text-xs text-gray-600 mb-2">{{ suggestion.description }}</p>
              
              <div class="flex items-center justify-between text-xs text-gray-500">
                <span *ngIf="suggestion.estimatedHours">
                  ⏱️ {{ suggestion.estimatedHours }}h estimated
                </span>
                <span *ngIf="suggestion.suggestedAssignee" class="ml-auto">
                  👤 {{ suggestion.suggestedAssignee }}
                </span>
              </div>
              
              <div class="mt-2 text-xs text-blue-600 italic">
                💡 {{ suggestion.reasoning }}
              </div>

              <div class="flex gap-2 mt-3">
                <button 
                  mat-button 
                  color="primary" 
                  (click)="acceptSuggestion(suggestion)"
                  class="text-xs">
                  Add as Action Item
                </button>
                <button 
                  mat-button 
                  (click)="dismissSuggestion(suggestion)"
                  class="text-xs">
                  Dismiss
                </button>
              </div>
            </div>
          </div>

          <div *ngIf="!loadingSuggestions && suggestions.length === 0" class="text-center py-6 text-gray-500">
            <mat-icon class="text-4xl mb-2 opacity-50">psychology</mat-icon>
            <p class="text-sm">No suggestions available for this meeting</p>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Follow-up Recommendations -->
      <mat-card class="followup-card" *ngIf="analysis?.followUpRecommendations?.length">
        <mat-card-header>
          <mat-card-title class="flex items-center">
            <mat-icon class="mr-2 text-green-600">trending_up</mat-icon>
            Follow-up Actions
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div class="space-y-2">
            <div *ngFor="let recommendation of analysis?.followUpRecommendations || []; let i = index" 
                 class="flex items-start gap-3 p-2 rounded hover:bg-gray-50">
              <div class="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium">
                {{ i + 1 }}
              </div>
              <span class="text-sm text-gray-700">{{ recommendation }}</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Quick Actions -->
      <mat-card class="quick-actions-card">
        <mat-card-header>
          <mat-card-title class="flex items-center">
            <mat-icon class="mr-2 text-indigo-600">flash_on</mat-icon>
            Quick Actions
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div class="grid grid-cols-2 gap-2">
            <button 
              mat-button 
              color="primary" 
              (click)="scheduleFollowUp()"
              class="text-xs flex items-center justify-center gap-1">
              <mat-icon class="text-sm">event_note</mat-icon>
              Schedule Follow-up
            </button>
            
            <button 
              mat-button 
              color="primary" 
              (click)="sendSummary()"
              class="text-xs flex items-center justify-center gap-1">
              <mat-icon class="text-sm">email</mat-icon>
              Send Summary
            </button>
            
            <button 
              mat-button 
              color="primary" 
              (click)="createWorkflow()"
              class="text-xs flex items-center justify-center gap-1">
              <mat-icon class="text-sm">account_tree</mat-icon>
              Create Workflow
            </button>
            
            <button 
              mat-button 
              color="primary" 
              (click)="exportData()"
              class="text-xs flex items-center justify-center gap-1">
              <mat-icon class="text-sm">download</mat-icon>
              Export Data
            </button>
          </div>
        </mat-card-content>
      </mat-card>

    </div>
  `,
  styles: [`
    .meeting-intelligence-panel {
      max-width: 400px;
      position: sticky;
      top: 20px;
    }

    .analysis-card, .suggestions-card, .followup-card, .quick-actions-card {
      margin-bottom: 16px;
    }

    .score-circle {
      @apply rounded-full px-3 py-1 text-xs font-bold text-white;
    }

    .score-excellent { @apply bg-green-500; }
    .score-good { @apply bg-blue-500; }
    .score-fair { @apply bg-yellow-500; }
    .score-poor { @apply bg-red-500; }

    .attendance-high { @apply text-green-600; }
    .attendance-medium { @apply text-yellow-600; }
    .attendance-low { @apply text-red-600; }

    .priority-URGENT { @apply bg-red-100 text-red-800; }
    .priority-HIGH { @apply bg-orange-100 text-orange-800; }
    .priority-MEDIUM { @apply bg-yellow-100 text-yellow-800; }
    .priority-LOW { @apply bg-green-100 text-green-800; }

    .suggestion-item {
      transition: all 0.2s ease;
    }
    
    .suggestion-item:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .stat-item {
      @apply flex justify-between items-center;
    }
  `]
})
export class MeetingIntelligencePanelComponent implements OnInit {
  @Input() meeting!: Meeting;
  @Output() actionItemAdded = new EventEmitter<ActionItemSuggestion>();
  @Output() followUpScheduled = new EventEmitter<void>();

  analysis: MeetingAnalysis | null = null;
  suggestions: ActionItemSuggestion[] = [];
  loadingAnalysis = false;
  loadingSuggestions = false;

  constructor(private readonly chatService: ChatService) {}

  ngOnInit(): void {
    this.loadMeetingIntelligence();
  }

  private loadMeetingIntelligence(): void {
    this.refreshAnalysis();
    this.refreshSuggestions();
  }

  refreshAnalysis(): void {
    this.loadingAnalysis = true;
    this.chatService.getMeetingAnalysis(this.meeting).subscribe({
      next: (analysis) => {
        this.analysis = analysis;
        this.loadingAnalysis = false;
      },
      error: (error) => {
        console.error('Error loading meeting analysis:', error);
        this.loadingAnalysis = false;
      }
    });
  }

  refreshSuggestions(): void {
    this.loadingSuggestions = true;
    this.chatService.suggestActionItems(this.meeting).subscribe({
      next: (suggestions) => {
        this.suggestions = suggestions;
        this.loadingSuggestions = false;
      },
      error: (error) => {
        console.error('Error loading suggestions:', error);
        this.loadingSuggestions = false;
      }
    });
  }

  getScoreClass(score: number): string {
    if (score >= 8) return 'score-excellent';
    if (score >= 6) return 'score-good';
    if (score >= 4) return 'score-fair';
    return 'score-poor';
  }

  getAttendanceClass(rate: number): string {
    if (rate >= 80) return 'attendance-high';
    if (rate >= 60) return 'attendance-medium';
    return 'attendance-low';
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority}`;
  }

  acceptSuggestion(suggestion: ActionItemSuggestion): void {
    this.actionItemAdded.emit(suggestion);
    // Remove from suggestions list
    this.suggestions = this.suggestions.filter(s => s !== suggestion);
  }

  dismissSuggestion(suggestion: ActionItemSuggestion): void {
    this.suggestions = this.suggestions.filter(s => s !== suggestion);
  }

  scheduleFollowUp(): void {
    this.followUpScheduled.emit();
    // Here you would integrate with calendar API
    console.log('Scheduling follow-up meeting...');
  }

  sendSummary(): void {
    // Here you would integrate with email API
    console.log('Sending meeting summary...');
  }

  createWorkflow(): void {
    // Here you would integrate with workflow/automation system
    console.log('Creating automated workflow...');
  }

  exportData(): void {
    // Here you would export meeting data
    console.log('Exporting meeting data...');
  }
}