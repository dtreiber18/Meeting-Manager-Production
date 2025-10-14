import { Injectable } from '@angular/core';
import { Meeting, TranscriptEntry } from '../meetings/meeting.model';

/**
 * Service for analyzing Fathom meeting data and extracting intelligence
 * Focuses on insights that complement (not duplicate) Fathom's built-in AI
 */
@Injectable({
  providedIn: 'root'
})
export class FathomIntelligenceService {

  constructor() {}

  /**
   * Extract decisions from Fathom's AI-generated summary
   * Fathom provides excellent summaries - we just parse them for decisions
   */
  extractDecisions(fathomSummary: string | undefined): string[] {
    if (!fathomSummary) return [];

    const decisions: string[] = [];
    const lines = fathomSummary.split('\n');

    // Fathom typically formats summaries in markdown
    // Look for decision indicators
    const decisionKeywords = [
      'decision',
      'decided',
      'agreed',
      'approved',
      'confirmed',
      'resolved',
      'conclusion',
      'determined',
      'committed to'
    ];

    lines.forEach((line, index) => {
      const lowerLine = line.toLowerCase();

      // Check if line contains decision keywords
      const hasDecisionKeyword = decisionKeywords.some(keyword =>
        lowerLine.includes(keyword)
      );

      // Check if line is a bolded item (Fathom often bolds key points)
      const isBoldedItem = line.match(/^[-*]\s*\*\*.*\*\*/);

      // Check if under a "Decisions" section
      const previousLine = index > 0 ? lines[index - 1].toLowerCase() : '';
      const inDecisionSection = previousLine.includes('decision') ||
                                previousLine.includes('outcome') ||
                                previousLine.includes('resolution');

      if ((hasDecisionKeyword || isBoldedItem || inDecisionSection) && line.trim().length > 0) {
        // Clean up markdown formatting
        const cleanedLine = line
          .replace(/^[-*]\s*/, '')  // Remove bullet points
          .replace(/\*\*/g, '')      // Remove bold markers
          .replace(/^#+\s*/, '')     // Remove headers
          .trim();

        if (cleanedLine.length > 10) {  // Avoid capturing section headers
          decisions.push(cleanedLine);
        }
      }
    });

    // Remove duplicates and limit to most relevant
    return [...new Set(decisions)].slice(0, 8);
  }

  /**
   * Extract key topics from Fathom summary
   * Uses keyword frequency and context to identify main discussion topics
   */
  extractTopics(fathomSummary: string | undefined, meetingTitle?: string): string[] {
    if (!fathomSummary) return [];

    const topics: Set<string> = new Set();

    // Extract topics from section headers (Fathom uses ## for sections)
    const headerRegex = /^#{2,3}\s+(.+)$/gm;
    let match;
    while ((match = headerRegex.exec(fathomSummary)) !== null) {
      const topic = match[1].trim();
      if (topic.length > 3 && !this.isGenericHeader(topic)) {
        topics.add(topic);
      }
    }

    // Extract topics from the meeting title if provided
    if (meetingTitle) {
      const titleTopics = this.extractTopicsFromText(meetingTitle);
      titleTopics.forEach(topic => topics.add(topic));
    }

    // Extract key phrases (look for capitalized multi-word phrases)
    const capitalizedPhraseRegex = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g;
    const phrases = fathomSummary.match(capitalizedPhraseRegex) || [];

    // Count frequency and add high-frequency topics
    const phraseFrequency = new Map<string, number>();
    phrases.forEach(phrase => {
      if (phrase.split(' ').length <= 4) {  // Only phrases up to 4 words
        phraseFrequency.set(phrase, (phraseFrequency.get(phrase) || 0) + 1);
      }
    });

    // Add phrases that appear more than once
    Array.from(phraseFrequency.entries())
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([phrase, _]) => topics.add(phrase));

    return Array.from(topics).slice(0, 10);
  }

  /**
   * Identify key discussion points from Fathom summary
   * These are the main points discussed, extracted from Fathom's markdown
   */
  extractKeyPoints(fathomSummary: string | undefined): string[] {
    if (!fathomSummary) return [];

    const keyPoints: string[] = [];
    const lines = fathomSummary.split('\n');

    lines.forEach(line => {
      const trimmed = line.trim();

      // Match bullet points (- or *)
      const bulletMatch = trimmed.match(/^[-*]\s+(.+)$/);
      if (bulletMatch) {
        const point = bulletMatch[1]
          .replace(/\*\*/g, '')  // Remove bold
          .trim();

        if (point.length > 15 && point.length < 200) {
          keyPoints.push(point);
        }
      }
    });

    return keyPoints.slice(0, 10);
  }

  /**
   * Calculate speaker balance from Fathom transcript
   * Fathom provides transcripts - we analyze speaking time distribution
   */
  analyzeSpeakerBalance(transcriptEntries: TranscriptEntry[] | undefined) {
    if (!transcriptEntries || transcriptEntries.length === 0) {
      return {
        balanced: true,
        speakers: [],
        dominantSpeaker: null,
        silentParticipants: []
      };
    }

    // Calculate speaking time per participant
    const speakerStats = new Map<string, {
      contributionCount: number;
      estimatedTime: number;
      wordCount: number;
    }>();

    transcriptEntries.forEach(entry => {
      const speaker = entry.speaker;
      const stats = speakerStats.get(speaker) || {
        contributionCount: 0,
        estimatedTime: 0,
        wordCount: 0
      };

      stats.contributionCount++;
      stats.wordCount += entry.text.split(/\s+/).length;
      stats.estimatedTime += this.estimateSpeakingTime(entry.text);

      speakerStats.set(speaker, stats);
    });

    // Calculate total speaking time
    const totalTime = Array.from(speakerStats.values())
      .reduce((sum, stats) => sum + stats.estimatedTime, 0);

    // Build speaker distribution
    const speakers = Array.from(speakerStats.entries()).map(([speaker, stats]) => ({
      speaker,
      contributionCount: stats.contributionCount,
      estimatedTime: stats.estimatedTime,
      percentage: totalTime > 0 ? (stats.estimatedTime / totalTime) * 100 : 0,
      wordCount: stats.wordCount
    })).sort((a, b) => b.percentage - a.percentage);

    // Identify dominant speaker (>40% of time)
    const dominantSpeaker = speakers.find(s => s.percentage > 40);

    // Check if balanced (no one speaks more than 40%, everyone speaks at least 5%)
    const balanced = speakers.every(s => s.percentage <= 40 && s.percentage >= 5);

    return {
      balanced,
      speakers,
      dominantSpeaker: dominantSpeaker || null,
      silentParticipants: []  // Would need full participant list to determine this
    };
  }

  /**
   * Estimate speaking time from text (simple word count heuristic)
   * Average speaking rate: ~150 words per minute
   */
  private estimateSpeakingTime(text: string): number {
    const wordCount = text.split(/\s+/).length;
    const wordsPerSecond = 150 / 60;  // ~2.5 words per second
    return wordCount / wordsPerSecond;
  }

  /**
   * Extract topics from text using simple keyword extraction
   */
  private extractTopicsFromText(text: string): string[] {
    // Remove common words and extract meaningful phrases
    const stopWords = new Set(['meeting', 'call', 'discussion', 'review', 'update', 'sync', 'the', 'and', 'for', 'with']);

    const words = text.split(/\s+/)
      .map(w => w.replace(/[^a-zA-Z0-9]/g, ''))
      .filter(w => w.length > 3 && !stopWords.has(w.toLowerCase()));

    return words.slice(0, 3);
  }

  /**
   * Check if a header is generic (skip these)
   */
  private isGenericHeader(header: string): boolean {
    const genericHeaders = [
      'meeting summary',
      'attendees',
      'next steps',
      'action items',
      'summary',
      'overview',
      'introduction',
      'conclusion'
    ];

    return genericHeaders.some(generic =>
      header.toLowerCase().includes(generic)
    );
  }

  /**
   * Analyze meeting effectiveness using Fathom data
   * Complements Fathom's summary with quantitative metrics
   */
  analyzeMeetingEffectiveness(meeting: Meeting): {
    score: number;
    insights: string[];
    strengths: string[];
    improvements: string[];
  } {
    const insights: string[] = [];
    const strengths: string[] = [];
    const improvements: string[] = [];
    let score = 7; // Start with baseline

    // Check if meeting has Fathom data
    const hasFathomSummary = !!meeting.fathomSummary;
    const hasActionItems = meeting.actionItems && meeting.actionItems.length > 0;
    const hasTranscript = meeting.transcriptEntries && meeting.transcriptEntries.length > 0;

    if (hasFathomSummary) {
      const decisions = this.extractDecisions(meeting.fathomSummary);

      if (decisions.length > 0) {
        strengths.push(`${decisions.length} clear decision${decisions.length > 1 ? 's' : ''} made`);
        score += 1;
      } else {
        improvements.push('No clear decisions documented');
        score -= 1;
      }

      const keyPoints = this.extractKeyPoints(meeting.fathomSummary);
      if (keyPoints.length >= 3) {
        strengths.push('Well-structured discussion with multiple key points');
        score += 0.5;
      }
    }

    if (hasActionItems) {
      const assignedItems = meeting.actionItems.filter(item => item.assignee);
      const assignmentRate = assignedItems.length / meeting.actionItems.length;

      if (assignmentRate >= 0.8) {
        strengths.push('Action items clearly assigned');
        score += 1;
      } else {
        improvements.push('Some action items lack clear ownership');
        score -= 0.5;
      }
    } else {
      insights.push('No action items - may indicate discussion-only meeting');
    }

    if (hasTranscript) {
      const speakerAnalysis = this.analyzeSpeakerBalance(meeting.transcriptEntries);

      if (speakerAnalysis.balanced) {
        strengths.push('Balanced participation across speakers');
        score += 1;
      } else if (speakerAnalysis.dominantSpeaker) {
        improvements.push(`One speaker dominated (${speakerAnalysis.dominantSpeaker.speaker})`);
        score -= 0.5;
      }

      // Check meeting length vs content
      if (meeting.durationInMinutes > 60 && meeting.actionItems.length < 3) {
        improvements.push('Long meeting with few actionable outcomes');
        score -= 1;
      }
    }

    // Ensure score is within 1-10 range
    score = Math.max(1, Math.min(10, score));

    return {
      score: Math.round(score * 10) / 10,  // Round to 1 decimal
      insights,
      strengths,
      improvements
    };
  }
}
