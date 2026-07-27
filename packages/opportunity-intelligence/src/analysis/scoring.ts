import {
  createConfidenceFactor,
  createGapClassification,
  createRankingReason,
  createScoreBreakdown,
  createScoreContribution,
  createScoreDimension,
  createScorePenalty
} from "@career-companion/product-intelligence";
import type {
  OpportunityDecision,
  OpportunityDimension,
  OpportunityRecommendation
} from "../models";
import type { OpportunityDecisionOutcome, OpportunitySignal } from "../policies";
import {
  average,
  clampScore,
  confidenceFromScore,
  immutableArray,
  immutableRecord,
  priorityFromScore,
  scoreBand,
  textMatch
} from "../shared";

export function dimension(name: string, sourceText: string, signals: readonly OpportunitySignal[], fallbackScore: number, weight: number): OpportunityDimension {
  const matchedSignals = immutableArray(signals.filter((signal) => textMatch(sourceText, signal.value) || textMatch(sourceText, signal.label)));
  const score = matchedSignals.length === 0 ? fallbackScore : clampScore(60 + average(matchedSignals.map((signal) => signal.weight * 100)));
  return immutableRecord({
    dimension: name,
    score: createScoreDimension({
      dimension: name,
      score,
      weight,
      rationale: `${name} evaluates supplied opportunity evidence with deterministic signal matching.`
    }),
    signals: matchedSignals,
    reasons: immutableArray(matchedSignals.map((signal) => createRankingReason({
      code: `opportunity-signal:${signal.signalId}`,
      statement: `${signal.label} matched supplied opportunity evidence.`,
      weight: signal.weight
    })))
  });
}

export function breakdown(label: string, dimensions: readonly OpportunityDimension[]) {
  const scoreDimensions = immutableArray(dimensions.map((item) => item.score));
  const totalWeight = scoreDimensions.reduce((sum, item) => sum + item.weight, 0);
  const overallScore = totalWeight === 0 ? 0 : Math.round(scoreDimensions.reduce((sum, item) => sum + item.score * item.weight, 0) / totalWeight);
  const lowDimensions = dimensions.filter((item) => item.score.score < 50);

  return createScoreBreakdown({
    overallScore,
    band: scoreBand(overallScore),
    dimensions: scoreDimensions,
    contributions: scoreDimensions.map((item) => createScoreContribution({
      source: item.dimension,
      amount: item.score,
      rationale: item.rationale
    })),
    penalties: lowDimensions.map((item) => createScorePenalty({
      code: `${label}:${item.dimension}`,
      amount: 8,
      severity: "medium",
      rationale: `${item.dimension} has weak supplied evidence.`
    }))
  });
}

export function gapsFromDimensions(prefix: string, dimensions: readonly OpportunityDimension[]) {
  return immutableArray(dimensions
    .filter((item) => item.score.score < 55)
    .map((item) => createGapClassification({
      gapId: `${prefix}:${item.dimension}`,
      gapType: item.dimension,
      severity: item.score.score < 40 ? "high" : "medium",
      priority: item.score.score < 40 ? "critical" : "high",
      rationale: `${item.dimension} is below the opportunity evaluation threshold.`
    })));
}

export function recommendationsFromGaps(gaps: readonly ReturnType<typeof createGapClassification>[]): readonly OpportunityRecommendation[] {
  return immutableArray(gaps.map((gap) => immutableRecord({
    recommendationId: `opportunity-recommendation:${gap.gapId}`,
    priority: gap.priority === "critical" ? "Critical" : "High",
    category: "RiskMitigation",
    impact: gap.severity === "high" ? "Significant" : "Moderate",
    recommendationType: "Validate",
    rationale: gap.rationale,
    affectedDimensions: immutableArray([gap.gapType]),
    confidence: confidenceFromScore(gap.severity === "high" ? 80 : 65, "Recommendation confidence follows deterministic opportunity gap severity.")
  } satisfies OpportunityRecommendation)));
}

export function outcomeFor(score: number, policy: { readonly minimumPursueScore: number; readonly highPriorityScore: number; readonly worthExploringScore: number; readonly monitorScore: number }): OpportunityDecisionOutcome {
  if (score >= policy.minimumPursueScore) return "PursueImmediately";
  if (score >= policy.highPriorityScore) return "HighPriority";
  if (score >= policy.worthExploringScore) return "WorthExploring";
  if (score >= policy.monitorScore) return "Monitor";
  return "Decline";
}

export function alternativesFor(outcome: OpportunityDecisionOutcome): readonly OpportunityDecisionOutcome[] {
  return immutableArray((["PursueImmediately", "HighPriority", "WorthExploring", "Monitor", "Decline"] as const).filter((item) => item !== outcome));
}

export function confidenceFactors(decision: Pick<OpportunityDecision, "scoreSummary" | "opportunityStrengths" | "risks">) {
  return immutableArray([
    createConfidenceFactor({
      factor: "opportunity-score",
      value: decision.scoreSummary.overallScore / 100,
      weight: 0.5,
      rationale: "Confidence follows deterministic opportunity score."
    }),
    createConfidenceFactor({
      factor: "strength-coverage",
      value: Math.min(1, decision.opportunityStrengths.length / 4),
      weight: 0.25,
      rationale: "Confidence increases when multiple opportunity strengths are evidenced."
    }),
    createConfidenceFactor({
      factor: "risk-load",
      value: Math.max(0, 1 - decision.risks.length / 4),
      weight: 0.25,
      rationale: "Confidence decreases as deterministic risks increase."
    })
  ]);
}

export function priorityForDecision(outcome: OpportunityDecisionOutcome, score: number) {
  if (outcome === "PursueImmediately") return "Critical" as const;
  if (outcome === "HighPriority") return "High" as const;
  return priorityFromScore(score);
}
