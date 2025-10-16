import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Meeting, TranscriptEntry } from '../meetings/meeting.model';
import { AttendanceStatus } from '../models/meeting-participant.model';
import { environment } from '../../environments/environment';

/**
 * PHASE 2: Participant engagement interface
 */
export interface ParticipantEngagement {
  participant: string;
  speakingTime: number;
  speakingPercentage: number;
  contributionCount: number;
  averageContributionLength: number;
  questionCount: number;
  keyTopics: string[];
  engagementScore: number;
}

/**
 * Service for analyzing Fathom meeting data and extracting intelligence
 * Focuses on insights that complement (not duplicate) Fathom's built-in AI
 * PHASE 2: Enhanced with participant engagement and advanced analytics
 */
@Injectable({
  providedIn: 'root'
})
export class FathomIntelligenceService {
  private apiUrl = environment.apiUrl || 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

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
   * PHASE 2: Enhanced with sophisticated talk time analysis
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

    // PHASE 2: Enhanced talk time analysis
    if (hasTranscript) {
      const speakerAnalysis = this.analyzeSpeakerBalance(meeting.transcriptEntries);
      const engagement = this.analyzeParticipantEngagement(meeting);

      if (speakerAnalysis.balanced) {
        strengths.push('Balanced participation across speakers');
        score += 1;
      } else if (speakerAnalysis.dominantSpeaker) {
        improvements.push(`One speaker dominated (${speakerAnalysis.dominantSpeaker.speaker})`);
        score -= 0.5;
      }

      // PHASE 2: Check for silent participants
      if (engagement.silentParticipants.length > 0) {
        improvements.push(`${engagement.silentParticipants.length} participant(s) didn't contribute`);
        score -= 0.5;
      }

      // PHASE 2: Evaluate question-asking (indicates engagement)
      const totalQuestions = engagement.participants.reduce((sum, p) => sum + p.questionCount, 0);
      if (totalQuestions >= 5) {
        strengths.push('High engagement with questions and discussion');
        score += 0.5;
      } else if (totalQuestions === 0) {
        improvements.push('No questions asked - may indicate low engagement');
        score -= 0.5;
      }

      // Check meeting length vs content
      if (meeting.durationInMinutes > 60 && meeting.actionItems.length < 3) {
        improvements.push('Long meeting with few actionable outcomes');
        score -= 1;
      }

      // PHASE 2: Analyze talk time efficiency
      const avgContributionLength = engagement.participants.reduce(
        (sum, p) => sum + p.averageContributionLength, 0
      ) / engagement.participants.length;

      if (avgContributionLength < 10) {
        strengths.push('Concise, focused contributions');
        score += 0.5;
      } else if (avgContributionLength > 30) {
        improvements.push('Some contributions were lengthy - could be more concise');
        score -= 0.5;
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

  /**
   * PHASE 2: Detailed participant engagement analysis
   * Analyzes speaking patterns, question-asking, and contribution quality
   */
  analyzeParticipantEngagement(meeting: Meeting): {
    participants: ParticipantEngagement[];
    overallEngagement: 'high' | 'medium' | 'low';
    silentParticipants: string[];
    dominantSpeakers: string[];
    recommendations: string[];
  } {
    const transcript = meeting.transcriptEntries || [];
    const participantStats = new Map<string, {
      contributionCount: number;
      speakingTime: number;
      wordCount: number;
      questionCount: number;
      keyTopics: string[];
    }>();

    // Analyze each transcript entry
    transcript.forEach(entry => {
      const speaker = entry.speaker;
      const stats = participantStats.get(speaker) || {
        contributionCount: 0,
        speakingTime: 0,
        wordCount: 0,
        questionCount: 0,
        keyTopics: []
      };

      stats.contributionCount++;
      stats.wordCount += entry.text.split(/\s+/).length;
      stats.speakingTime += this.estimateSpeakingTime(entry.text);

      // Count questions (indicates engagement)
      if (entry.text.includes('?')) {
        stats.questionCount++;
      }

      participantStats.set(speaker, stats);
    });

    // Calculate total speaking time
    const totalSpeakingTime = Array.from(participantStats.values())
      .reduce((sum, stats) => sum + stats.speakingTime, 0);

    // Build participant engagement objects
    const participants: ParticipantEngagement[] = Array.from(participantStats.entries()).map(([speaker, stats]) => {
      const speakingPercentage = totalSpeakingTime > 0 ? (stats.speakingTime / totalSpeakingTime) * 100 : 0;
      const avgContributionLength = stats.contributionCount > 0 ? stats.speakingTime / stats.contributionCount : 0;

      return {
        participant: speaker,
        speakingTime: stats.speakingTime,
        speakingPercentage,
        contributionCount: stats.contributionCount,
        averageContributionLength: avgContributionLength,
        questionCount: stats.questionCount,
        keyTopics: [],
        engagementScore: this.calculateEngagementScore(speakingPercentage, stats.questionCount, stats.contributionCount)
      };
    }).sort((a, b) => b.engagementScore - a.engagementScore);

    // Identify silent participants by comparing meeting participants with speakers
    const silentParticipants: string[] = [];
    if (meeting.participants && meeting.participants.length > 0) {
      const speakers = new Set(participants.map(p => p.participant.toLowerCase()));

      meeting.participants.forEach(participant => {
        const participantName = participant.name || participant.email || '';
        const participantEmail = participant.email?.toLowerCase() || '';

        // Check if participant spoke (by name or email)
        const didSpeak = speakers.has(participantName.toLowerCase()) ||
                         speakers.has(participantEmail) ||
                         Array.from(speakers).some(speaker =>
                           speaker.includes(participantName.toLowerCase()) ||
                           participantName.toLowerCase().includes(speaker)
                         );

        // Only count as silent if they attended but didn't speak
        if (!didSpeak && participant.attendanceStatus === AttendanceStatus.PRESENT) {
          silentParticipants.push(participantName || participantEmail);
        }
      });
    }

    // Identify dominant speakers (>40% talk time)
    const dominantSpeakers = participants
      .filter(p => p.speakingPercentage > 40)
      .map(p => p.participant);

    // Calculate overall engagement
    const avgEngagement = participants.reduce((sum, p) => sum + p.engagementScore, 0) / participants.length;
    let overallEngagement: 'high' | 'medium' | 'low';
    if (avgEngagement >= 7) {
      overallEngagement = 'high';
    } else if (avgEngagement >= 5) {
      overallEngagement = 'medium';
    } else {
      overallEngagement = 'low';
    }

    // Generate recommendations
    const recommendations = this.generateEngagementRecommendations(participants, dominantSpeakers, silentParticipants);

    return {
      participants,
      overallEngagement,
      silentParticipants,
      dominantSpeakers,
      recommendations
    };
  }

  /**
   * PHASE 2: Calculate engagement score for a participant
   */
  private calculateEngagementScore(
    speakingPercentage: number,
    questionCount: number,
    contributionCount: number
  ): number {
    let score = 5; // Baseline

    // Ideal speaking percentage: 15-35% (balanced participation)
    if (speakingPercentage >= 15 && speakingPercentage <= 35) {
      score += 2;
    } else if (speakingPercentage > 35) {
      score += 1; // Still engaged, but dominating
    } else if (speakingPercentage < 10) {
      score -= 2; // Under-participating
    }

    // Bonus for asking questions (shows engagement)
    score += Math.min(questionCount * 0.5, 2);

    // Bonus for multiple contributions (shows active participation)
    if (contributionCount >= 10) {
      score += 1;
    }

    return Math.max(1, Math.min(10, score));
  }

  /**
   * PHASE 2: Generate recommendations for improving engagement
   */
  private generateEngagementRecommendations(
    participants: ParticipantEngagement[],
    dominantSpeakers: string[],
    silentParticipants: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (dominantSpeakers.length > 0) {
      recommendations.push(`Encourage ${dominantSpeakers.join(', ')} to give others more time to speak`);
    }

    if (silentParticipants.length > 0) {
      recommendations.push(`Directly invite ${silentParticipants.join(', ')} to share their thoughts`);
    }

    const lowEngagement = participants.filter(p => p.engagementScore < 5);
    if (lowEngagement.length > participants.length / 2) {
      recommendations.push('Consider using round-robin format to ensure everyone contributes');
    }

    const noQuestions = participants.every(p => p.questionCount === 0);
    if (noQuestions) {
      recommendations.push('Encourage more questions and discussion to increase engagement');
    }

    return recommendations;
  }

  /**
   * PHASE 2: Advanced keyword extraction using TF-IDF-like algorithm
   * Extract the most relevant keywords from transcript
   */
  extractKeywords(transcript: TranscriptEntry[] | undefined): {
    word: string;
    count: number;
    relevance: number;
  }[] {
    if (!transcript || transcript.length === 0) return [];

    const text = transcript.map(e => e.text).join(' ');

    // Stop words to exclude
    const stopWords = new Set([
      'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with',
      'to', 'of', 'for', 'as', 'by', 'this', 'that', 'it', 'from', 'be', 'was', 'were',
      'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'may', 'might', 'can', 'are', 'am', 'so', 'we', 'i', 'you', 'he', 'she', 'they', 'what',
      'when', 'where', 'who', 'why', 'how', 'just', 'now', 'then', 'there', 'here', 'all',
      'some', 'any', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'into', 'through'
    ]);

    // Extract words
    const words = text.toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 3 && !stopWords.has(word) && !/^\d+$/.test(word));

    // Count frequency
    const frequency = new Map<string, number>();
    words.forEach(word => {
      frequency.set(word, (frequency.get(word) || 0) + 1);
    });

    // Calculate relevance (simplified TF-IDF)
    const totalWords = words.length;
    const keywords = Array.from(frequency.entries())
      .map(([word, count]) => ({
        word,
        count,
        relevance: (count / totalWords) * Math.log(totalWords / count)
      }))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 20);

    return keywords;
  }

  /**
   * PHASE 2: Find related meetings based on topic similarity
   * Queries the backend for meetings with similar topics/keywords
   */
  async findRelatedMeetings(topics: string[], currentMeeting: Meeting): Promise<Meeting[]> {
    if (!topics || topics.length === 0) {
      return [];
    }

    try {
      const url = `${this.apiUrl}/meetings/search/related`;
      const params = {
        topics: topics.join(','),
        excludeMeetingId: currentMeeting.id.toString(),
        limit: '5'
      };

      const meetings = await this.http.get<Meeting[]>(url, { params }).toPromise();
      console.log(`Found ${meetings?.length || 0} related meetings for topics:`, topics);
      return meetings || [];
    } catch (error) {
      console.error('Error finding related meetings:', error);
      return [];
    }
  }

  /**
   * PHASE 2: Extract potential action items from transcript
   * Identifies commitments, tasks, and next steps mentioned in conversation
   */
  extractActionItemsFromTranscript(transcript: TranscriptEntry[] | undefined): {
    description: string;
    speaker: string;
    timestamp: number;
    confidence: 'high' | 'medium' | 'low';
  }[] {
    if (!transcript || transcript.length === 0) return [];

    const actionItems: {
      description: string;
      speaker: string;
      timestamp: number;
      confidence: 'high' | 'medium' | 'low';
    }[] = [];

    // Action item indicators
    const highConfidencePatterns = [
      /i will/i,
      /i'll/i,
      /we will/i,
      /we'll/i,
      /let me/i,
      /i can/i,
      /i'm going to/i,
      /i am going to/i
    ];

    const mediumConfidencePatterns = [
      /we should/i,
      /we need to/i,
      /we have to/i,
      /someone should/i,
      /todo/i,
      /action item/i,
      /next step/i,
      /follow up/i,
      /by \w+ (morning|afternoon|evening|today|tomorrow|monday|tuesday|wednesday|thursday|friday)/i
    ];

    transcript.forEach(entry => {
      // Check for high confidence patterns
      for (const pattern of highConfidencePatterns) {
        if (pattern.test(entry.text)) {
          actionItems.push({
            description: entry.text.trim(),
            speaker: entry.speaker,
            timestamp: entry.timestamp,
            confidence: 'high'
          });
          return; // Only add once per entry
        }
      }

      // Check for medium confidence patterns
      for (const pattern of mediumConfidencePatterns) {
        if (pattern.test(entry.text)) {
          actionItems.push({
            description: entry.text.trim(),
            speaker: entry.speaker,
            timestamp: entry.timestamp,
            confidence: 'medium'
          });
          return; // Only add once per entry
        }
      }
    });

    return actionItems;
  }

  /**
   * PHASE 2: Analyze topic evolution throughout the meeting
   * Shows how topics changed over time
   */
  analyzeTopicEvolution(transcript: TranscriptEntry[] | undefined): {
    timeSegment: string;
    topics: string[];
    keywords: string[];
  }[] {
    if (!transcript || transcript.length === 0) return [];

    // Divide transcript into time segments (e.g., every 10 minutes)
    const segmentSize = Math.ceil(transcript.length / 4); // 4 segments
    const segments: {
      timeSegment: string;
      topics: string[];
      keywords: string[];
    }[] = [];

    for (let i = 0; i < 4; i++) {
      const start = i * segmentSize;
      const end = Math.min((i + 1) * segmentSize, transcript.length);
      const segmentTranscript = transcript.slice(start, end);

      if (segmentTranscript.length === 0) continue;

      // Extract keywords from this segment
      const keywords = this.extractKeywords(segmentTranscript);
      const topKeywords = keywords.slice(0, 5).map(k => k.word);

      // Get time range
      const startTime = segmentTranscript[0].timestamp;
      const endTime = segmentTranscript[segmentTranscript.length - 1].timestamp;

      segments.push({
        timeSegment: `${this.formatTimestamp(startTime)} - ${this.formatTimestamp(endTime)}`,
        topics: topKeywords,
        keywords: topKeywords
      });
    }

    return segments;
  }

  /**
   * Format timestamp (seconds) to MM:SS
   */
  private formatTimestamp(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
