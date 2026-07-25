import type { RecommendationCategory, RecommendationType } from "@career-companion/product-intelligence";
import type { DecisionAction, DecisionRecommendation, StrategyObjective } from "../models";
import { immutableArray, immutableRecord } from "../shared";

export function createDecisionAction(objective: StrategyObjective, index: number): DecisionAction {
  return immutableRecord({
    actionId: `decision-action:${objective.objectiveId}`,
    priority: objective.priority,
    category: categoryFor(objective.label),
    recommendationType: typeFor(objective.label),
    expectedImpact: objective.expectedImpact,
    dependencies: immutableArray(index === 0 ? [] : [`decision-action:${index - 1}`]),
    evidenceRequired: immutableArray([objective.label]),
    completionCriteria: immutableArray([
      `Evidence for ${objective.label} is represented in a canonical product artifact.`,
      `Decision trace references ${objective.objectiveId}.`
    ]),
    confidence: {
      value: Math.max(Math.min(objective.rationale.weight ?? 0.75, 1), 0),
      band: (objective.rationale.weight ?? 0.75) >= 0.75 ? "high" : "medium",
      rationale: objective.rationale.statement
    }
  });
}

export function createDecisionRecommendation(action: DecisionAction): DecisionRecommendation {
  return immutableRecord({
    recommendationId: `decision-recommendation:${action.actionId}`,
    priority: action.priority,
    category: action.category,
    impact: action.expectedImpact,
    recommendationType: action.recommendationType,
    targetActionIds: immutableArray([action.actionId]),
    confidence: action.confidence
  });
}

function categoryFor(label: string): RecommendationCategory {
  const normalized = label.toLowerCase();
  if (normalized.includes("evidence")) return "Evidence";
  if (normalized.includes("risk")) return "RiskMitigation";
  if (normalized.includes("coverage")) return "Coverage";
  if (normalized.includes("impact")) return "Impact";
  return "Alignment";
}

function typeFor(label: string): RecommendationType {
  const normalized = label.toLowerCase();
  if (normalized.includes("quant")) return "Quantify";
  if (normalized.includes("gap") || normalized.includes("weak")) return "Strengthen";
  if (normalized.includes("risk")) return "Validate";
  return "Clarify";
}
