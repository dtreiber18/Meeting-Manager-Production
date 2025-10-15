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
import { FathomIntelligenceService } from '../services/fathom-intelligence.service';
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
      
      <!-- Meeting Analysis Card - Only show if no Fathom data (mock fallback) -->
      <mat-card *ngIf="!hasFathomData" class="analysis-card">
        <mat-card-header>
          <mat-card-title class="flex items-center">
            <mat-icon class="mr-2 text-blue-600">analytics</mat-icon>
            Meeting Intelligence
            <span class="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              Mock Data
            </span>
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

      <!-- Action Item Suggestions - Mock data for now -->
      <mat-card class="suggestions-card">
        <mat-card-header>
          <mat-card-title class="flex items-center">
            <mat-icon class="mr-2 text-purple-600">lightbulb</mat-icon>
            AI Suggestions
            <span class="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              Mock Data
            </span>
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

      <!-- Fathom Intelligence Card (only shows for Fathom meetings) -->
      <mat-card class="fathom-insights-card" *ngIf="hasFathomData">
        <mat-card-header>
          <mat-card-title class="flex items-center">
            <mat-icon class="mr-2 text-purple-600">mic</mat-icon>
            Fathom AI Insights
            <span class="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
              Powered by Fathom
            </span>
          </mat-card-title>
          <div class="flex items-center space-x-1">
            <button
              mat-icon-button
              (click)="refreshFathomAnalysis()"
              matTooltip="Refresh Fathom Analysis">
              <mat-icon>refresh</mat-icon>
            </button>
            <button
              mat-icon-button
              (click)="toggleFathomInsights()"
              [matTooltip]="fathomInsightsExpanded ? 'Collapse' : 'Expand'">
              <mat-icon>{{ fathomInsightsExpanded ? 'expand_less' : 'expand_more' }}</mat-icon>
            </button>
          </div>
        </mat-card-header>

        <mat-card-content *ngIf="fathomInsightsExpanded">
          <div class="space-y-4">

            <!-- Fathom Effectiveness Score -->
            <div *ngIf="fathomEffectiveness" class="effectiveness-section">
              <div class="flex items-center justify-between mb-2 cursor-pointer hover:bg-gray-50 p-2 rounded -m-2"
                   (click)="toggleFathomEffectiveness()">
                <div class="flex items-center">
                  <mat-icon class="text-sm mr-1">{{ fathomEffectivenessExpanded ? 'expand_less' : 'expand_more' }}</mat-icon>
                  <span class="font-semibold text-sm">Fathom-Enhanced Effectiveness</span>
                </div>
                <div class="score-circle" [ngClass]="getScoreClass(fathomEffectiveness.score)">
                  {{ fathomEffectiveness.score }}/10
                </div>
              </div>

              <!-- Strengths from Fathom analysis -->
              <div *ngIf="fathomEffectivenessExpanded && fathomEffectiveness.strengths.length > 0" class="mb-2">
                <h4 class="text-xs font-medium text-green-700 mb-1">✅ Strengths</h4>
                <div class="space-y-1">
                  <div *ngFor="let strength of fathomEffectiveness.strengths"
                       class="text-xs bg-green-50 text-green-800 px-2 py-1 rounded">
                    {{ strength }}
                  </div>
                </div>
              </div>

              <!-- Improvements from Fathom analysis -->
              <div *ngIf="fathomEffectivenessExpanded && fathomEffectiveness.improvements.length > 0">
                <h4 class="text-xs font-medium text-amber-700 mb-1">💡 Improvements</h4>
                <div class="space-y-1">
                  <div *ngFor="let improvement of fathomEffectiveness.improvements"
                       class="text-xs bg-amber-50 text-amber-800 px-2 py-1 rounded">
                    {{ improvement }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Decisions from Fathom -->
            <div *ngIf="fathomDecisions.length > 0" class="decisions-section">
              <h4 class="text-sm font-semibold mb-2 text-gray-700 flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded -m-2"
                  (click)="toggleFathomDecisions()">
                <mat-icon class="text-sm mr-1">{{ fathomDecisionsExpanded ? 'expand_less' : 'expand_more' }}</mat-icon>
                <mat-icon class="w-4 h-4 mr-1 text-green-600">check_circle</mat-icon>
                Decisions Made ({{ fathomDecisions.length }})
              </h4>
              <div *ngIf="fathomDecisionsExpanded" class="space-y-2">
                <div *ngFor="let decision of fathomDecisions"
                     class="text-xs bg-green-50 text-green-900 px-3 py-2 rounded border-l-4 border-green-500">
                  {{ decision }}
                </div>
              </div>
            </div>

            <!-- Topics from Fathom -->
            <div *ngIf="fathomTopics.length > 0" class="topics-section">
              <h4 class="text-sm font-semibold mb-2 text-gray-700 flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded -m-2"
                  (click)="toggleFathomTopics()">
                <mat-icon class="text-sm mr-1">{{ fathomTopicsExpanded ? 'expand_less' : 'expand_more' }}</mat-icon>
                🏷️ Key Topics
              </h4>
              <div *ngIf="fathomTopicsExpanded" class="flex flex-wrap gap-2">
                <mat-chip *ngFor="let topic of fathomTopics"
                         class="text-xs bg-blue-100 text-blue-800">
                  {{ topic }}
                </mat-chip>
              </div>
            </div>

            <!-- Speaker Balance Analysis -->
            <div *ngIf="speakerBalance && speakerBalance.speakers.length > 0" class="speaker-section">
              <h4 class="text-sm font-semibold mb-2 text-gray-700 flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded -m-2"
                  (click)="toggleFathomSpeakerBalance()">
                <mat-icon class="text-sm mr-1">{{ fathomSpeakerBalanceExpanded ? 'expand_less' : 'expand_more' }}</mat-icon>
                👥 Speaker Balance
              </h4>

              <div *ngIf="fathomSpeakerBalanceExpanded" class="mb-2">
                <span class="text-xs"
                      [ngClass]="speakerBalance.balanced ? 'text-green-600' : 'text-amber-600'">
                  {{ speakerBalance.balanced ? '✅ Well-balanced discussion' : '⚠️ Unbalanced participation' }}
                </span>
              </div>

              <div *ngIf="fathomSpeakerBalanceExpanded" class="space-y-2">
                <div *ngFor="let speaker of speakerBalance.speakers"
                     class="flex items-center justify-between text-xs">
                  <div class="flex items-center flex-1">
                    <span class="font-medium mr-2">{{ speaker.speaker }}</span>
                    <div class="flex-1 bg-gray-200 rounded-full h-2 mr-2 max-w-[200px]">
                      <div class="bg-blue-600 h-2 rounded-full transition-all"
                           [style.width.%]="speaker.percentage"></div>
                    </div>
                  </div>
                  <span class="text-gray-600">
                    {{ speaker.percentage.toFixed(1) }}% ({{ speaker.contributionCount }} times)
                  </span>
                </div>
              </div>

              <div *ngIf="fathomSpeakerBalanceExpanded && speakerBalance.dominantSpeaker" class="mt-2 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
                ⚠️ {{ speakerBalance.dominantSpeaker.speaker }} dominated the conversation ({{ speakerBalance.dominantSpeaker.percentage.toFixed(1) }}%)
              </div>
            </div>

            <!-- Key Discussion Points -->
            <div *ngIf="fathomKeyPoints.length > 0" class="key-points-section">
              <h4 class="text-sm font-semibold mb-2 text-gray-700 flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded -m-2"
                  (click)="toggleFathomKeyPoints()">
                <mat-icon class="text-sm mr-1">{{ fathomKeyPointsExpanded ? 'expand_less' : 'expand_more' }}</mat-icon>
                📝 Key Discussion Points
              </h4>
              <div *ngIf="fathomKeyPointsExpanded" class="space-y-1">
                <div *ngFor="let point of fathomKeyPoints"
                     class="text-xs bg-gray-50 text-gray-800 px-3 py-2 rounded border-l-2 border-gray-300">
                  • {{ point }}
                </div>
              </div>
            </div>

            <!-- PHASE 2: Participant Engagement Analytics -->
            <div *ngIf="participantEngagement && participantEngagement.participants.length > 0" class="engagement-section border-t pt-4 mt-4">
              <h4 class="text-sm font-semibold mb-2 text-gray-700 flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded -m-2"
                  (click)="toggleFathomParticipantEngagement()">
                <mat-icon class="text-sm mr-1">{{ fathomParticipantEngagementExpanded ? 'expand_less' : 'expand_more' }}</mat-icon>
                <mat-icon class="w-4 h-4 mr-1 text-indigo-600">people</mat-icon>
                Participant Engagement (Phase 2)
                <span class="ml-2 text-xs px-2 py-0.5 rounded-full"
                      [ngClass]="{
                        'bg-green-100 text-green-800': participantEngagement.overallEngagement === 'high',
                        'bg-yellow-100 text-yellow-800': participantEngagement.overallEngagement === 'medium',
                        'bg-red-100 text-red-800': participantEngagement.overallEngagement === 'low'
                      }">
                  {{ participantEngagement.overallEngagement }} engagement
                </span>
              </h4>

              <div *ngIf="fathomParticipantEngagementExpanded" class="space-y-2 mb-3">
                <div *ngFor="let participant of participantEngagement.participants.slice(0, 5)"
                     class="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                  <div class="flex items-center">
                    <span class="font-medium">{{ participant.participant }}</span>
                    <span class="ml-2 text-gray-500">
                      ({{ participant.contributionCount }} contributions, {{ participant.questionCount }} questions)
                    </span>
                  </div>
                  <div class="flex items-center">
                    <span class="mr-2 font-semibold"
                          [ngClass]="{
                            'text-green-600': participant.engagementScore >= 7,
                            'text-yellow-600': participant.engagementScore >= 5 && participant.engagementScore < 7,
                            'text-red-600': participant.engagementScore < 5
                          }">
                      Score: {{ participant.engagementScore.toFixed(1) }}/10
                    </span>
                  </div>
                </div>
              </div>

              <!-- Engagement Recommendations -->
              <div *ngIf="fathomParticipantEngagementExpanded && participantEngagement.recommendations.length > 0" class="mt-2">
                <h5 class="text-xs font-medium text-indigo-700 mb-1">💡 Recommendations</h5>
                <div class="space-y-1">
                  <div *ngFor="let rec of participantEngagement.recommendations"
                       class="text-xs bg-indigo-50 text-indigo-800 px-2 py-1 rounded">
                    {{ rec }}
                  </div>
                </div>
              </div>
            </div>

            <!-- PHASE 2: Transcript Keywords -->
            <div *ngIf="transcriptKeywords.length > 0" class="keywords-section border-t pt-4 mt-4">
              <h4 class="text-sm font-semibold mb-2 text-gray-700 flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded -m-2"
                  (click)="toggleFathomKeywords()">
                <mat-icon class="text-sm mr-1">{{ fathomKeywordsExpanded ? 'expand_less' : 'expand_more' }}</mat-icon>
                <mat-icon class="w-4 h-4 mr-1 text-teal-600">tag</mat-icon>
                Most Relevant Keywords (Phase 2)
              </h4>
              <div *ngIf="fathomKeywordsExpanded" class="flex flex-wrap gap-2">
                <div *ngFor="let keyword of transcriptKeywords.slice(0, 15)"
                     class="text-xs bg-teal-50 text-teal-800 px-2 py-1 rounded border border-teal-200"
                     [title]="'Mentioned ' + keyword.count + ' times'">
                  {{ keyword.word }} <span class="text-teal-600">({{ keyword.count }})</span>
                </div>
              </div>
            </div>

            <!-- PHASE 2: Extracted Action Items from Transcript -->
            <div *ngIf="extractedActionItems.length > 0" class="extracted-actions-section border-t pt-4 mt-4">
              <h4 class="text-sm font-semibold mb-2 text-gray-700 flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded -m-2"
                  (click)="toggleFathomExtractedActions()">
                <mat-icon class="text-sm mr-1">{{ fathomExtractedActionsExpanded ? 'expand_less' : 'expand_more' }}</mat-icon>
                <mat-icon class="w-4 h-4 mr-1 text-orange-600">auto_awesome</mat-icon>
                AI-Detected Action Items (Phase 2)
                <span class="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                  {{ extractedActionItems.length }} found
                </span>
              </h4>
              <div *ngIf="fathomExtractedActionsExpanded" class="space-y-2">
                <div *ngFor="let item of extractedActionItems.slice(0, 5)"
                     class="text-xs p-2 rounded border-l-3"
                     [ngClass]="{
                       'bg-green-50 border-green-500': item.confidence === 'high',
                       'bg-yellow-50 border-yellow-500': item.confidence === 'medium',
                       'bg-gray-50 border-gray-400': item.confidence === 'low'
                     }">
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-medium">{{ item.speaker }}</span>
                    <span class="px-2 py-0.5 rounded text-xs"
                          [ngClass]="{
                            'bg-green-200 text-green-800': item.confidence === 'high',
                            'bg-yellow-200 text-yellow-800': item.confidence === 'medium',
                            'bg-gray-200 text-gray-800': item.confidence === 'low'
                          }">
                      {{ item.confidence }}
                    </span>
                  </div>
                  <div class="text-gray-700">{{ item.description }}</div>
                  <div class="text-gray-500 text-xs mt-1">&#64; {{ formatTimestamp(item.timestamp) }}</div>
                </div>
              </div>
            </div>

            <!-- PHASE 2: Topic Evolution -->
            <div *ngIf="topicEvolution.length > 0" class="topic-evolution-section border-t pt-4 mt-4">
              <h4 class="text-sm font-semibold mb-2 text-gray-700 flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded -m-2"
                  (click)="toggleFathomTopicEvolution()">
                <mat-icon class="text-sm mr-1">{{ fathomTopicEvolutionExpanded ? 'expand_less' : 'expand_more' }}</mat-icon>
                <mat-icon class="w-4 h-4 mr-1 text-pink-600">timeline</mat-icon>
                Topic Evolution (Phase 2)
              </h4>
              <div *ngIf="fathomTopicEvolutionExpanded" class="space-y-3">
                <div *ngFor="let segment of topicEvolution; let i = index"
                     class="text-xs p-2 bg-pink-50 rounded border-l-3 border-pink-400">
                  <div class="font-medium text-pink-800 mb-1">
                    Segment {{ i + 1 }}: {{ segment.timeSegment }}
                  </div>
                  <div class="flex flex-wrap gap-1">
                    <span *ngFor="let topic of segment.topics"
                          class="bg-pink-100 text-pink-800 px-2 py-0.5 rounded">
                      {{ topic }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Fathom data message -->
            <div *ngIf="!fathomDecisions.length && !fathomTopics.length && !speakerBalance"
                 class="text-center py-4 text-gray-500">
              <mat-icon class="text-3xl mb-2 opacity-50">pending</mat-icon>
              <p class="text-sm">Processing Fathom AI analysis...</p>
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

  // Fathom Intelligence - Phase 1
  fathomDecisions: string[] = [];
  fathomTopics: string[] = [];
  fathomKeyPoints: string[] = [];
  speakerBalance: any = null;
  fathomEffectiveness: any = null;
  hasFathomData = false;

  // PHASE 2: Advanced Analytics
  participantEngagement: any = null;
  transcriptKeywords: any[] = [];
  extractedActionItems: any[] = [];
  topicEvolution: any[] = [];

  // Collapse/Expand states - all collapsed by default for cleaner UI
  intelligenceExpanded = false;
  suggestionsExpanded = false;
  insightsExpanded = false;
  fathomInsightsExpanded = false;

  // Fathom subsection collapse/expand states
  fathomEffectivenessExpanded = false;
  fathomDecisionsExpanded = false;
  fathomTopicsExpanded = false;
  fathomSpeakerBalanceExpanded = false;
  fathomKeyPointsExpanded = false;
  fathomParticipantEngagementExpanded = false;
  fathomKeywordsExpanded = false;
  fathomExtractedActionsExpanded = false;
  fathomTopicEvolutionExpanded = false;

  constructor(
    private readonly chatService: ChatService,
    private readonly fathomService: FathomIntelligenceService
  ) {}

  ngOnInit(): void {
    this.loadMeetingIntelligence();
  }

  private loadMeetingIntelligence(): void {
    this.refreshAnalysis();
    this.refreshSuggestions();
    this.analyzeFathomData();
  }

  /**
   * Analyze Fathom data if available
   * PHASE 2: Enhanced with advanced analytics
   */
  private analyzeFathomData(): void {
    // Check if meeting has Fathom data
    this.hasFathomData = this.isFathomMeeting();

    if (!this.hasFathomData) return;

    // PHASE 1: Basic extraction
    this.fathomDecisions = this.fathomService.extractDecisions(this.meeting.fathomSummary);
    this.fathomTopics = this.fathomService.extractTopics(this.meeting.fathomSummary, this.meeting.title);
    this.fathomKeyPoints = this.fathomService.extractKeyPoints(this.meeting.fathomSummary);

    // Analyze transcript if available
    if (this.meeting.transcriptEntries && this.meeting.transcriptEntries.length > 0) {
      // PHASE 1: Speaker balance
      this.speakerBalance = this.fathomService.analyzeSpeakerBalance(this.meeting.transcriptEntries);

      // PHASE 2: Participant engagement analysis
      this.participantEngagement = this.fathomService.analyzeParticipantEngagement(this.meeting);

      // PHASE 2: Extract keywords from transcript
      this.transcriptKeywords = this.fathomService.extractKeywords(this.meeting.transcriptEntries);

      // PHASE 2: Extract action items from transcript
      this.extractedActionItems = this.fathomService.extractActionItemsFromTranscript(this.meeting.transcriptEntries);

      // PHASE 2: Analyze topic evolution
      this.topicEvolution = this.fathomService.analyzeTopicEvolution(this.meeting.transcriptEntries);
    }

    // Calculate Fathom-enhanced effectiveness (now includes PHASE 2 enhancements)
    this.fathomEffectiveness = this.fathomService.analyzeMeetingEffectiveness(this.meeting);
  }

  /**
   * Check if meeting is from Fathom
   */
  private isFathomMeeting(): boolean {
    return !!(this.meeting.source === 'fathom' ||
              this.meeting.fathomSummary ||
              this.meeting.fathomRecordingUrl ||
              (this.meeting.recordingUrl && this.meeting.recordingUrl.includes('fathom.video')));
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

  /**
   * Toggle Fathom insights panel
   */
  toggleFathomInsights(): void {
    this.fathomInsightsExpanded = !this.fathomInsightsExpanded;
  }

  /**
   * Toggle methods for Fathom subsections
   */
  toggleFathomEffectiveness(): void {
    this.fathomEffectivenessExpanded = !this.fathomEffectivenessExpanded;
  }

  toggleFathomDecisions(): void {
    this.fathomDecisionsExpanded = !this.fathomDecisionsExpanded;
  }

  toggleFathomTopics(): void {
    this.fathomTopicsExpanded = !this.fathomTopicsExpanded;
  }

  toggleFathomSpeakerBalance(): void {
    this.fathomSpeakerBalanceExpanded = !this.fathomSpeakerBalanceExpanded;
  }

  toggleFathomKeyPoints(): void {
    this.fathomKeyPointsExpanded = !this.fathomKeyPointsExpanded;
  }

  toggleFathomParticipantEngagement(): void {
    this.fathomParticipantEngagementExpanded = !this.fathomParticipantEngagementExpanded;
  }

  toggleFathomKeywords(): void {
    this.fathomKeywordsExpanded = !this.fathomKeywordsExpanded;
  }

  toggleFathomExtractedActions(): void {
    this.fathomExtractedActionsExpanded = !this.fathomExtractedActionsExpanded;
  }

  toggleFathomTopicEvolution(): void {
    this.fathomTopicEvolutionExpanded = !this.fathomTopicEvolutionExpanded;
  }

  /**
   * Refresh Fathom analysis
   */
  refreshFathomAnalysis(): void {
    this.analyzeFathomData();
  }

  /**
   * PHASE 2: Format timestamp for display
   */
  formatTimestamp(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

}