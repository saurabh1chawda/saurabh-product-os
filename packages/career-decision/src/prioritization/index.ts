import {
  createRankingReason,
  type RecommendationImpact,
  type RecommendationPriority
} from "@career-companion/product-intelligence";
import type { DecisionAssessment, StrategyObjective } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord, uniqueSorted } from "../shared";

export class PriorityEngine {
  order(priorities: readonly RecommendationPriority[]): readonly RecommendationPriority[] {
    const rank: Readonly<Record<RecommendationPriority, number>> = {
      Critical: 0,
      High: 1,
      Medium: 2,
      Low: 3
    };
    return immutableArray([...priorities].sort((left, right) => rank[left] - rank[right]));
  }
}

export class StrategyEngine {
  createObjectives(assessment: DecisionAssessment): readonly StrategyObjective[] {
    const weakAreas = assessment.weaknessAreas.length > 0 ? assessment.weaknessAreas : assessment.opportunityAreas;
    return immutableArray(weakAreas.slice(0, 4).map((finding, index) => immutableRecord({
      objectiveId: `strategy-objective:${finding.findingId}`,
      label: finding.label,
      priority: priorityFor(index, finding.confidence.value),
      expectedImpact: impactFor(finding.confidence.value),
      rationale: createRankingReason({
        code: `objective:${finding.findingId}`,
        statement: finding.rationale,
        weight: Math.max(0.1, 1 - index * 0.15)
      })
    } satisfies StrategyObjective)));
  }

  themes(assessment: DecisionAssessment): readonly string[] {
    return uniqueSorted([
      ...assessment.weaknessAreas.map((finding) => finding.area),
      ...assessment.riskAreas.map((finding) => finding.area),
      ...assessment.opportunityAreas.map((finding) => finding.area)
    ]);
  }

  confidence(assessment: DecisionAssessment) {
    return confidenceFromScore(assessment.overallReadiness.overallScore, "Strategy confidence follows deterministic assessment readiness.");
  }
}

function priorityFor(index: number, confidence: number): RecommendationPriority {
  if (index === 0 && confidence < 0.6) return "Critical";
  if (index <= 1) return "High";
  if (index <= 3) return "Medium";
  return "Low";
}

function impactFor(confidence: number): RecommendationImpact {
  if (confidence < 0.45) return "Transformational";
  if (confidence < 0.65) return "Significant";
  if (confidence < 0.85) return "Moderate";
  return "Minor";
}
