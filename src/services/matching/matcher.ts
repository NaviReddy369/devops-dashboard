/**
 * Assistant Matching Service
 * Matches Neural Gateway requests with available assistants based on expertise
 */

import { NeuralRequest, User } from '../../types';
import { scoreMatch } from './scoring';

// ============================================================================
// MATCHING CONFIGURATION
// ============================================================================

export interface MatchingConfig {
  minScore: number;              // Minimum match score (0-100)
  maxCandidates: number;         // Max assistants to consider
  considerAvailability: boolean;  // Filter by availability status
  considerWorkload: boolean;      // Consider current workload
}

const defaultConfig: MatchingConfig = {
  minScore: 60,
  maxCandidates: 10,
  considerAvailability: true,
  considerWorkload: true,
};

// ============================================================================
// MATCH RESULT
// ============================================================================

export interface MatchResult {
  assistant: User;
  score: number;
  reasons: string[];
  strengths: string[];
}

// ============================================================================
// MATCHER CLASS
// ============================================================================

export class AssistantMatcher {
  private config: MatchingConfig;

  constructor(config: Partial<MatchingConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Find best matching assistants for a Neural Request
   */
  async findMatches(
    request: NeuralRequest,
    availableAssistants: User[]
  ): Promise<MatchResult[]> {
    // Filter assistants
    let candidates = this.filterCandidates(availableAssistants);

    // Score each candidate
    const scored = candidates.map((assistant) => {
      const score = scoreMatch(request, assistant);
      const reasons = this.generateReasons(request, assistant, score);
      const strengths = this.identifyStrengths(request, assistant);

      return {
        assistant,
        score,
        reasons,
        strengths,
      };
    });

    // Sort by score (highest first)
    scored.sort((a, b) => b.score - a.score);

    // Filter by minimum score
    const qualified = scored.filter((m) => m.score >= this.config.minScore);

    // Return top candidates
    return qualified.slice(0, this.config.maxCandidates);
  }

  /**
   * Filter candidates based on availability and basic requirements
   */
  private filterCandidates(assistants: User[]): User[] {
    return assistants.filter((assistant) => {
      // Must be a neural assistant
      if (!assistant.isNeuralAssistant) {
        return false;
      }

      // Filter by availability if enabled
      if (this.config.considerAvailability) {
        if (assistant.availability === 'unavailable') {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Generate human-readable reasons for the match
   */
  private generateReasons(
    request: NeuralRequest,
    assistant: User,
    score: number
  ): string[] {
    const reasons: string[] = [];

    // Category match
    if (assistant.expertise.includes(request.category.toLowerCase())) {
      reasons.push(`Expertise in ${request.category}`);
    }

    // High score
    if (score >= 80) {
      reasons.push('Excellent match based on expertise');
    } else if (score >= 60) {
      reasons.push('Good match with relevant experience');
    }

    // Availability
    if (assistant.availability === 'available') {
      reasons.push('Currently available');
    }

    return reasons;
  }

  /**
   * Identify assistant strengths relevant to the request
   */
  private identifyStrengths(
    request: NeuralRequest,
    assistant: User
  ): string[] {
    const strengths: string[] = [];

    // Matching expertise areas
    const matchingExpertise = assistant.expertise.filter((exp) =>
      request.description.toLowerCase().includes(exp.toLowerCase()) ||
      request.category.toLowerCase().includes(exp.toLowerCase())
    );

    if (matchingExpertise.length > 0) {
      strengths.push(...matchingExpertise);
    }

    // Role-based strengths
    if (assistant.role === 'admin') {
      strengths.push('Administrative access');
    }

    return strengths;
  }

  /**
   * Find the best single match (for auto-assignment)
   */
  async findBestMatch(
    request: NeuralRequest,
    availableAssistants: User[]
  ): Promise<MatchResult | null> {
    const matches = await this.findMatches(request, availableAssistants);
    return matches.length > 0 ? matches[0] : null;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let matcherInstance: AssistantMatcher | null = null;

export function getMatcher(config?: Partial<MatchingConfig>): AssistantMatcher {
  if (!matcherInstance) {
    matcherInstance = new AssistantMatcher(config);
  }
  return matcherInstance;
}

