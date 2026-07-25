import {
  type RecommendationCategory,
  type RecommendationImpact,
  type RecommendationPriority,
  type RecommendationType
} from "@career-companion/product-intelligence";
import type { DimensionMatch, JobRecommendation } from "../models";
import { immutableArray, immutableRecord } from "../shared";

export function createJobRecommendations(matches: readonly DimensionMatch[]): readonly JobRecommendation[] {
  const weakMatches = matches.filter((match) => match.score < 70);
  return immutableArray(weakMatches.map((match) => immutableRecord({
    recommendationId: `job-recommendation:${match.dimensionId}`,
    priority: priorityFor(match.score),
    category: categoryFor(match),
    impact: impactFor(match.score),
    recommendationType: typeFor(match),
    statement: `Address evidence gap for ${match.dimension}.`,
    affectedDimensionIds: immutableArray([match.dimensionId]),
    confidence: match.confidence
  } satisfies JobRecommendation)).sort((left, right) => {
    const priorityDifference = priorityRank(left.priority) - priorityRank(right.priority);
    return priorityDifference === 0 ? left.recommendationId.localeCompare(right.recommendationId) : priorityDifference;
  }).map((recommendation) => immutableRecord({
    ...recommendation,
    statement: recommendation.statement
  })));
}

function priorityFor(score: number): RecommendationPriority {
  if (score < 40) return "Critical";
  if (score < 60) return "High";
  if (score < 75) return "Medium";
  return "Low";
}

function impactFor(score: number): RecommendationImpact {
  if (score < 40) return "Transformational";
  if (score < 60) return "Significant";
  if (score < 75) return "Moderate";
  return "Minor";
}

function categoryFor(match: DimensionMatch): RecommendationCategory {
  if (match.missingEvidence.length > 0) return "Evidence";
  if (match.competencyCoverage < 70) return "Coverage";
  return "Alignment";
}

function typeFor(match: DimensionMatch): RecommendationType {
  if (match.missingEvidence.some((missing) => missing.toLowerCase().includes("metric"))) return "Quantify";
  if (match.evidenceCoverage < 70) return "Strengthen";
  return "Clarify";
}

function priorityRank(priority: RecommendationPriority): number {
  const ranks: Readonly<Record<RecommendationPriority, number>> = {
    Critical: 0,
    High: 1,
    Medium: 2,
    Low: 3
  };
  return ranks[priority];
}
