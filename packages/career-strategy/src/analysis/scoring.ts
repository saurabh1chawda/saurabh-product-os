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
  CareerStrategy,
  StrategicDimension,
  StrategyOption,
  StrategyOptionEvaluation
} from "../models";
import type { CareerStrategyProfile, StrategyOptionKind } from "../policies";
import {
  clampScore,
  confidenceFromScore,
  immutableArray,
  immutableRecord,
  priorityFromScore,
  scoreBand,
  uniqueSorted
} from "../shared";

export function dimension(name: string, score: number, weight: number, evidence: readonly string[]): StrategicDimension {
  const clamped = clampScore(score);
  return immutableRecord({
    dimension: name,
    score: createScoreDimension({
      dimension: name,
      score: clamped,
      weight,
      rationale: `${name} is evaluated from canonical strategic inputs.`
    }),
    evidence: immutableArray(evidence),
    reasons: immutableArray([createRankingReason({
      code: `career-strategy:${name}`,
      statement: `${name} uses deterministic canonical evidence.`,
      weight
    })])
  });
}

export function breakdown(label: string, dimensions: readonly StrategicDimension[]) {
  const scoreDimensions = immutableArray(dimensions.map((item) => item.score));
  const totalWeight = scoreDimensions.reduce((sum, item) => sum + item.weight, 0);
  const overallScore = totalWeight === 0 ? 0 : Math.round(scoreDimensions.reduce((sum, item) => sum + item.score * item.weight, 0) / totalWeight);
  const lowDimensions = dimensions.filter((item) => item.score.score < 55);

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
      amount: item.score.score < 40 ? 12 : 6,
      severity: item.score.score < 40 ? "high" : "medium",
      rationale: `${item.dimension} has a strategic gap.`
    }))
  });
}

export function gap(gapId: string, gapType: string, score: number) {
  return createGapClassification({
    gapId,
    gapType,
    severity: score < 40 ? "high" : score < 65 ? "medium" : "low",
    priority: score < 40 ? "critical" : score < 65 ? "high" : "low",
    rationale: `${gapType} is derived from current strategic state.`
  });
}

export function option(kind: StrategyOptionKind, label: string, addressedGapIds: readonly string[], confidenceScore: number): StrategyOption {
  return immutableRecord({
    optionId: `strategy-option:${kind}`,
    kind,
    label,
    rationale: createRankingReason({
      code: `strategy-option:${kind}`,
      statement: `${label} addresses deterministic career gaps.`,
      weight: confidenceScore / 100
    }),
    assumptions: immutableArray(["strategy option is deterministic and does not include task sequencing"]),
    addressedGapIds: immutableArray(addressedGapIds),
    confidence: confidenceFromScore(confidenceScore, `${label} confidence follows addressed strategic gaps.`)
  });
}

export function evaluationFor(optionInput: StrategyOption, gapCount: number, opportunityScore: number): StrategyOptionEvaluation {
  const base = optionInput.confidence.value * 100;
  const effort = dimension("Effort", Math.max(30, 80 - gapCount * 8), 0.12, [optionInput.optionId]).score;
  const impact = dimension("Impact", Math.min(95, base + opportunityScore * 0.2), 0.2, [optionInput.optionId]).score;
  const risk = dimension("Risk", Math.max(35, 85 - gapCount * 10), 0.12, [optionInput.optionId]).score;
  const timeline = dimension("Timeline", Math.max(35, 80 - gapCount * 6), 0.12, [optionInput.optionId]).score;
  const confidenceDimension = dimension("Confidence", base, 0.14, [optionInput.optionId]).score;
  const opportunityCost = dimension("Opportunity Cost", Math.max(40, 80 - gapCount * 5), 0.1, [optionInput.optionId]).score;
  const dependency = dimension("Dependency", Math.max(35, 75 - gapCount * 7), 0.1, [optionInput.optionId]).score;
  const strategicLeverage = dimension("Strategic Leverage", Math.min(95, base + 10), 0.1, [optionInput.optionId]).score;
  const dimensions = immutableArray([effort, impact, risk, timeline, confidenceDimension, opportunityCost, dependency, strategicLeverage]);
  const totalWeight = dimensions.reduce((sum, item) => sum + item.weight, 0);
  const overallScore = Math.round(dimensions.reduce((sum, item) => sum + item.score * item.weight, 0) / totalWeight);

  return immutableRecord({
    optionId: optionInput.optionId,
    kind: optionInput.kind,
    effort,
    impact,
    risk,
    timeline,
    confidenceDimension,
    opportunityCost,
    dependency,
    strategicLeverage,
    scoreBreakdown: createScoreBreakdown({
      overallScore,
      band: scoreBand(overallScore),
      dimensions,
      contributions: dimensions.map((item) => createScoreContribution({ source: item.dimension, amount: item.score, rationale: item.rationale })),
      penalties: dimensions.filter((item) => item.score < 50).map((item) => createScorePenalty({ code: item.dimension, amount: 8, severity: "medium", rationale: `${item.dimension} reduces strategy viability.` }))
    }),
    confidence: confidenceFromScore(overallScore, `${optionInput.label} evaluation confidence follows deterministic dimensions.`)
  });
}

export function profileFor(best: StrategyOptionEvaluation): CareerStrategyProfile {
  if (best.kind === "AIFirst") return "AITransformation";
  if (best.kind === "LeadershipFirst") return "LeadershipFirst";
  if (best.kind === "AggressiveGrowth" || best.scoreBreakdown.overallScore >= 82) return "AggressiveGrowth";
  if (best.kind === "GeographicPivot" || best.kind === "StartupFocus" || best.kind === "EnterpriseFocus") return "MarketPivot";
  if (best.kind === "BalancedGrowth") return "BalancedGrowth";
  return "OpportunityFirst";
}

export function confidenceFactors(strategy: Pick<CareerStrategy, "scoreSummary" | "risks" | "supportingEvidence">) {
  return immutableArray([
    createConfidenceFactor({
      factor: "strategy-score",
      value: strategy.scoreSummary.overallScore / 100,
      weight: 0.5,
      rationale: "Confidence follows selected strategy score."
    }),
    createConfidenceFactor({
      factor: "risk-load",
      value: Math.max(0, 1 - strategy.risks.length / 6),
      weight: 0.25,
      rationale: "Confidence decreases as strategic risks increase."
    }),
    createConfidenceFactor({
      factor: "evidence-support",
      value: Math.min(1, strategy.supportingEvidence.length / 5),
      weight: 0.25,
      rationale: "Confidence increases with deterministic evidence support."
    })
  ]);
}

export function recommendationPriority(score: number) {
  return priorityFromScore(score);
}

export function evidenceFromDimensions(dimensions: readonly StrategicDimension[]): readonly string[] {
  return uniqueSorted(dimensions.flatMap((item) => item.evidence));
}
