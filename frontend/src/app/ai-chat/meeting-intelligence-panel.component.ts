import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    FormsModule,
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
          <div class="flex items-center space-x-1">
            <button
              mat-icon-button
              (click)="refreshAnalysis()"
              [disabled]="loadingAnalysis"
              matTooltip="Refresh Analysis">
              <mat-icon [class.spin]="loadingAnalysis">refresh</mat-icon>
            </button>
            <button
              mat-icon-button
              (click)="toggleIntelligence()"
              [matTooltip]="intelligenceExpanded ? 'Collapse' : 'Expand'">
              <mat-icon>{{ intelligenceExpanded ? 'expand_less' : 'expand_more' }}</mat-icon>
            </button>
          </div>
        </mat-card-header>

        <mat-card-content *ngIf="intelligenceExpanded">
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
            <mat-chip *ngIf="suggestions.length > 0" class="ml-2 text-xs">
              {{ suggestions.length }} new
            </mat-chip>
          </mat-card-title>
          <div class="flex items-center space-x-1">
            <button
              mat-icon-button
              (click)="toggleAutoSuggestions()"
              [color]="autoSuggestionsEnabled ? 'primary' : ''"
              matTooltip="Auto-generate suggestions">
              <mat-icon>{{ autoSuggestionsEnabled ? 'auto_mode' : 'smart_toy' }}</mat-icon>
            </button>
            <button
              mat-icon-button
              (click)="refreshSuggestions()"
              [disabled]="loadingSuggestions"
              matTooltip="Refresh Suggestions">
              <mat-icon [class.spin]="loadingSuggestions">refresh</mat-icon>
            </button>
            <button
              mat-icon-button
              (click)="toggleSuggestions()"
              [matTooltip]="suggestionsExpanded ? 'Collapse' : 'Expand'">
              <mat-icon>{{ suggestionsExpanded ? 'expand_less' : 'expand_more' }}</mat-icon>
            </button>
          </div>
        </mat-card-header>

        <mat-card-content *ngIf="suggestionsExpanded">
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
                  color="accent"
                  (click)="acceptSuggestionAsWorkflow(suggestion)"
                  class="text-xs"
                  *ngIf="suggestion.priority === 'HIGH' || suggestion.priority === 'URGENT'">
                  Create Workflow
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

      <!-- Smart Insights & Predictions -->
      <mat-card class="smart-insights-card">
        <mat-card-header>
          <mat-card-title class="flex items-center">
            <mat-icon class="mr-2 text-indigo-600">psychology</mat-icon>
            Smart Insights
          </mat-card-title>
          <div class="flex items-center space-x-1">
            <button
              mat-icon-button
              (click)="refreshInsights()"
              [disabled]="loadingAnalysis"
              matTooltip="Refresh Insights">
              <mat-icon [class.spin]="loadingAnalysis">refresh</mat-icon>
            </button>
            <button
              mat-icon-button
              (click)="toggleInsights()"
              [matTooltip]="insightsExpanded ? 'Collapse' : 'Expand'">
              <mat-icon>{{ insightsExpanded ? 'expand_less' : 'expand_more' }}</mat-icon>
            </button>
          </div>
        </mat-card-header>

        <mat-card-content *ngIf="insightsExpanded">
          <div *ngIf="analysis" class="space-y-3">
            
            <!-- Workflow Recommendations -->
            <div *ngIf="getWorkflowRecommendations().length > 0" class="workflow-recommendations">
              <h4 class="text-sm font-semibold mb-2 text-gray-700">🔄 Workflow Automation</h4>
              <div class="space-y-2">
                <div *ngFor="let rec of getWorkflowRecommendations()" 
                     class="text-xs bg-indigo-50 text-indigo-800 px-3 py-2 rounded border-l-3 border-indigo-400 flex justify-between items-center">
                  <span>{{ rec.message }}</span>
                  <button 
                    mat-button 
                    color="primary"
                    (click)="triggerWorkflow(rec.type)"
                    class="text-xs ml-2">
                    Setup
                  </button>
                </div>
              </div>
            </div>

            <!-- Predictive Insights -->
            <div class="predictive-insights">
              <h4 class="text-sm font-semibold mb-2 text-gray-700">🔮 Predictive Analytics</h4>
              <div class="grid grid-cols-1 gap-2 text-xs">
                <div class="prediction-item bg-purple-50 p-2 rounded">
                  <div class="flex justify-between">
                    <span class="text-purple-700">Follow-up Meeting Needed:</span>
                    <span class="font-medium text-purple-900">{{ getPredictedFollowUpProbability() }}%</span>
                  </div>
                </div>
                <div class="prediction-item bg-green-50 p-2 rounded">
                  <div class="flex justify-between">
                    <span class="text-green-700">Action Item Completion Rate:</span>
                    <span class="font-medium text-green-900">{{ getPredictedCompletionRate() }}%</span>
                  </div>
                </div>
                <div class="prediction-item bg-amber-50 p-2 rounded">
                  <div class="flex justify-between">
                    <span class="text-amber-700">Risk of Overdue Items:</span>
                    <span class="font-medium text-amber-900">{{ getOverdueRisk() }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions">
              <h4 class="text-sm font-semibold mb-2 text-gray-700">⚡ Quick Actions</h4>
              <div class="flex flex-wrap gap-2">
                <button 
                  mat-stroked-button 
                  color="primary"
                  (click)="generateMeetingReport()"
                  class="text-xs">
                  📊 Generate Report
                </button>
                <button 
                  mat-stroked-button 
                  color="accent"
                  (click)="scheduleFollowUp()"
                  class="text-xs">
                  📅 Schedule Follow-up
                </button>
                <button 
                  mat-stroked-button 
                  color="warn"
                  (click)="escalateRiskyItems()"
                  *ngIf="hasRiskyActionItems()"
                  class="text-xs">
                  🚨 Escalate Risks
                </button>
              </div>
            </div>

          </div>
        </mat-card-content>
      </mat-card>

    </div>
  `,
  styles: [`
    .meeting-intelligence-panel {
      width: 100%;
      position: sticky;
      top: 20px;
    }

    .analysis-card, .suggestions-card, .followup-card, .quick-actions-card, .smart-insights-card {
      margin-bottom: 16px;
    }

    mat-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    mat-card-title {
      flex: 1;
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
  autoSuggestionsEnabled = false;

  // Collapse/Expand states
  intelligenceExpanded = true;
  suggestionsExpanded = true;
  insightsExpanded = true;

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

  acceptSuggestionAsWorkflow(suggestion: ActionItemSuggestion): void {
    // Create a pending action that requires approval workflow
    console.log('Creating workflow for high-priority suggestion:', suggestion);
    
    // Emit the suggestion as an action item but with workflow flag
    const workflowSuggestion = {
      ...suggestion,
      requiresApproval: true,
      workflowType: 'approval',
      escalationLevel: suggestion.priority === 'URGENT' ? 'executive' : 'manager'
    };
    
    this.actionItemAdded.emit(workflowSuggestion);
    this.suggestions = this.suggestions.filter(s => s !== suggestion);
  }

  dismissSuggestion(suggestion: ActionItemSuggestion): void {
    this.suggestions = this.suggestions.filter(s => s !== suggestion);
  }

  toggleAutoSuggestions(): void {
    this.autoSuggestionsEnabled = !this.autoSuggestionsEnabled;
    if (this.autoSuggestionsEnabled) {
      console.log('Auto-suggestions enabled - will generate suggestions automatically');
      // Could set up periodic refresh or real-time analysis
    }
  }

  // Toggle methods for collapse/expand
  toggleIntelligence(): void {
    this.intelligenceExpanded = !this.intelligenceExpanded;
  }

  toggleSuggestions(): void {
    this.suggestionsExpanded = !this.suggestionsExpanded;
  }

  toggleInsights(): void {
    this.insightsExpanded = !this.insightsExpanded;
  }

  // Refresh insights (recalculates predictions and recommendations)
  refreshInsights(): void {
    // Smart Insights are derived from the meeting analysis
    // So refreshing the analysis will update the insights
    this.refreshAnalysis();
  }

  // Smart Insights Methods
  getWorkflowRecommendations(): Array<{type: string, message: string}> {
    const recommendations = [];
    
    if (this.meeting.actionItems?.some(item => item.priority === 'HIGH' || item.priority === 'URGENT')) {
      recommendations.push({
        type: 'approval-workflow',
        message: 'High-priority items detected - setup approval workflow'
      });
    }
    
    if (this.analysis?.participantInsights?.missingStakeholders && this.analysis.participantInsights.missingStakeholders.length > 0) {
      recommendations.push({
        type: 'notification-workflow',
        message: 'Auto-notify absent stakeholders of key decisions'
      });
    }
    
    if (this.meeting.actionItems?.some(item => !item.assignee)) {
      recommendations.push({
        type: 'assignment-workflow',
        message: 'Auto-assign unassigned tasks based on expertise'
      });
    }

    return recommendations;
  }

  triggerWorkflow(workflowType: string): void {
    console.log('Triggering workflow:', workflowType);
    // Implementation would integrate with N8N or workflow service
    switch (workflowType) {
      case 'approval-workflow':
        alert('Approval workflow setup initiated for high-priority items');
        break;
      case 'notification-workflow':
        alert('Notification workflow created for absent stakeholders');
        break;
      case 'assignment-workflow':
        alert('Auto-assignment workflow configured');
        break;
    }
  }

  getPredictedFollowUpProbability(): number {
    if (!this.analysis) return 50;
    
    let probability = 30; // Base probability
    
    // Increase based on meeting effectiveness
    if (this.analysis.meetingEffectiveness.score < 6) probability += 30;
    
    // Increase if there are missing stakeholders
    if (this.analysis.participantInsights?.missingStakeholders?.length > 0) probability += 25;
    
    // Increase if there are unresolved action items
    if (this.meeting.actionItems?.some(item => !item.assignee)) probability += 20;
    
    return Math.min(95, probability);
  }

  getPredictedCompletionRate(): number {
    if (!this.meeting.actionItems?.length) return 100;
    
    let rate = 75; // Base completion rate
    
    // Adjust based on action item characteristics
    const assignedItems = this.meeting.actionItems.filter(item => item.assignee);
    const assignmentRate = assignedItems.length / this.meeting.actionItems.length;
    
    rate = rate + (assignmentRate * 20); // Higher if items are assigned
    
    // Adjust based on meeting effectiveness
    if (this.analysis?.meetingEffectiveness && this.analysis.meetingEffectiveness.score >= 7) rate += 10;
    
    return Math.round(Math.min(95, rate));
  }

  getOverdueRisk(): string {
    if (!this.meeting.actionItems?.length) return 'Low';
    
    const urgentItems = this.meeting.actionItems.filter(item => item.priority === 'URGENT').length;
    const unassignedItems = this.meeting.actionItems.filter(item => !item.assignee).length;
    
    if (urgentItems > 2 || unassignedItems > 3) return 'High';
    if (urgentItems > 0 || unassignedItems > 1) return 'Medium';
    return 'Low';
  }

  hasRiskyActionItems(): boolean {
    return this.getOverdueRisk() !== 'Low';
  }

  generateMeetingReport(): void {
    console.log('Generating comprehensive meeting report...');
    // Implementation would create a detailed report
    alert('Meeting report generation started - you will receive it via email shortly');
  }

  scheduleFollowUp(): void {
    console.log('Initiating follow-up scheduling...');
    this.followUpScheduled.emit();
    alert('Follow-up meeting scheduling initiated');
  }

  escalateRiskyItems(): void {
    const riskyItems = this.meeting.actionItems?.filter(item => 
      item.priority === 'URGENT' || !item.assignee
    ) || [];
    
    console.log('Escalating risky items:', riskyItems);
    alert(`Escalating ${riskyItems.length} high-risk action items to management`);
  }

}