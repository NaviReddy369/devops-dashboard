/**
 * Match Scoring Algorithm
 * Calculates compatibility score between Neural Request and Assistant
 */

import { NeuralRequest, User } from '../../types';

// ============================================================================
// SCORING WEIGHTS
// ============================================================================

const WEIGHTS = {
  EXPERTISE_MATCH: 0.4,      // 40% - Category/expertise alignment
  KEYWORD_MATCH: 0.3,       // 30% - Description keyword matching
  AVAILABILITY: 0.2,         // 20% - Current availability
  PRIORITY_ALIGNMENT: 0.1,  // 10% - Priority handling capability
};

// ============================================================================
// SCORING FUNCTIONS
// ============================================================================

/**
 * Calculate expertise match score
 */
function scoreExpertise(request: NeuralRequest, assistant: User): number {
  if (assistant.expertise.length === 0) {
    return 0;
  }

  const requestCategory = request.category.toLowerCase();
  const requestKeywords = extractKeywords(request.description);

  let matchCount = 0;
  let totalExpertise = assistant.expertise.length;

  // Check direct category match
  const categoryMatch = assistant.expertise.some(
    (exp) => exp.toLowerCase() === requestCategory
  );

  if (categoryMatch) {
    matchCount += 2; // Category match is worth 2x
  }

  // Check keyword matches in expertise
  assistant.expertise.forEach((exp) => {
    if (requestKeywords.some((kw) => exp.toLowerCase().includes(kw))) {
      matchCount += 1;
    }
  });

  // Normalize to 0-100
  return Math.min(100, (matchCount / (totalExpertise + 1)) * 100);
}

/**
 * Calculate keyword match score from description
 */
function scoreKeywords(request: NeuralRequest, assistant: User): number {
  const requestKeywords = extractKeywords(request.description);
  const assistantKeywords = assistant.expertise.map((exp) => exp.toLowerCase());

  if (requestKeywords.length === 0) {
    return 50; // Neutral score if no keywords
  }

  let matches = 0;
  requestKeywords.forEach((keyword) => {
    if (assistantKeywords.some((exp) => exp.includes(keyword))) {
      matches += 1;
    }
  });

  return (matches / requestKeywords.length) * 100;
}

/**
 * Calculate availability score
 */
function scoreAvailability(assistant: User): number {
  switch (assistant.availability) {
    case 'available':
      return 100;
    case 'busy':
      return 50;
    case 'unavailable':
      return 0;
    default:
      return 50;
  }
}

/**
 * Calculate priority alignment score
 */
function scorePriority(request: NeuralRequest, assistant: User): number {
  // High-priority requests might benefit from experienced assistants
  // This is a simplified version - can be enhanced with historical data
  if (request.priority === 'critical' || request.priority === 'high') {
    // Prefer assistants with more expertise (proxy for experience)
    if (assistant.expertise.length >= 5) {
      return 100;
    } else if (assistant.expertise.length >= 3) {
      return 75;
    }
    return 50;
  }

  // For lower priority, all assistants are equally suitable
  return 75;
}

/**
 * Extract keywords from text
 */
function extractKeywords(text: string): string[] {
  // Simple keyword extraction - in production, use NLP library
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'been', 'be',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
    'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
  ]);

  return text
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word))
    .slice(0, 10); // Limit to top 10 keywords
}

// ============================================================================
// MAIN SCORING FUNCTION
// ============================================================================

/**
 * Calculate overall match score between request and assistant
 * Returns a score from 0-100
 */
export function scoreMatch(request: NeuralRequest, assistant: User): number {
  const expertiseScore = scoreExpertise(request, assistant);
  const keywordScore = scoreKeywords(request, assistant);
  const availabilityScore = scoreAvailability(assistant);
  const priorityScore = scorePriority(request, assistant);

  // Weighted average
  const totalScore =
    expertiseScore * WEIGHTS.EXPERTISE_MATCH +
    keywordScore * WEIGHTS.KEYWORD_MATCH +
    availabilityScore * WEIGHTS.AVAILABILITY +
    priorityScore * WEIGHTS.PRIORITY_ALIGNMENT;

  // Round to 2 decimal places
  return Math.round(totalScore * 100) / 100;
}

