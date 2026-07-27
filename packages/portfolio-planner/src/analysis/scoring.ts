import {
  createConfidenceFactor,
  createGapClassification,
  createRankingReason,
  createScoreBreakdown,
  createScoreContribution,
  createScoreDimension,
  createScorePenalty
} from "@career-companion/product-intelligence";
import type { EvidenceNeed, InitiativeEvaluationItem, PortfolioInitiative } from "../models";
import type { PortfolioInitiativeKind, PortfolioPlannerPolicy } from "../policies";
import { clampScore, confidenceFromScore, impactFromScore, immutableArray, immutableRecord, priorityFromScore, scoreBand } from "../shared";

export function planningGap(gapId: string, gapType: string, score: number) {
  return createGapClassification({
    gapId,
    gapType,
    severity: score < 40 ? "high" : score < 65 ? "medium" : "low",
    priority: score < 40 ? "critical" : score < 65 ? "high" : "low",
    rationale: `${gapType} is represented as a portfolio planning gap.`
  });
}

export function evidenceNeed(needId: string, label: string, sourceGapId: string, targetEvidenceType: string, score: number, supportingReferences: readonly string[]): EvidenceNeed {
  return immutableRecord({
    needId,
    label,
    sourceGapId,
    targetEvidenceType,
    priority: priorityFromScore(score),
    severity: score < 45 ? "high" as const : score < 70 ? "medium" as const : "low" as const,
    rationale: createRankingReason({
      code: `portfolio-need:${needId}`,
      statement: `${label} follows canonical strategy and portfolio evidence gaps.`,
      weight: clampScore(100 - score) / 100
    }),
    supportingReferences: immutableArray(supportingReferences),
    confidence: confidenceFromScore(Math.max(35, 100 - score), `${label} confidence follows deterministic evidence need severity.`)
  });
}

export function initiative(kind: PortfolioInitiativeKind, title: string, needIds: readonly string[], references: readonly string[], score: number): PortfolioInitiative {
  return immutableRecord({
    initiativeId: `portfolio-initiative:${kind}:${title.replace(/\s+/g, "-").toLowerCase()}`,
    kind,
    title,
    objective: `${title} to support the selected career strategy.`,
    evidenceNeedIds: immutableArray(needIds),
    targetArtifactReferences: immutableArray(references),
    category: kind === "QuantifyImpact" ? "Impact" : kind === "PublishEvidence" ? "Readiness" : "Evidence",
    recommendationType: kind === "PublishEvidence" ? "Prepare" : kind === "ImproveEvidence" ? "Strengthen" : kind === "QuantifyImpact" ? "Quantify" : "Add",
    rationale: createRankingReason({
      code: `portfolio-initiative:${kind}`,
      statement: `${title} is a deterministic portfolio planning initiative.`,
      weight: clampScore(score) / 100
    }),
    confidence: confidenceFromScore(score, `${title} confidence follows addressed evidence needs.`)
  });
}

export function evaluationFor(item: PortfolioInitiative, policy: PortfolioPlannerPolicy, opportunityScore: number, strategyScore: number): InitiativeEvaluationItem {
  const needPressure = Math.min(95, 50 + item.evidenceNeedIds.length * 12);
  const strategicAlignment = dimension("Strategic Alignment", strategyScore, policy.strategicAlignmentWeight, [item.initiativeId]);
  const evidenceUrgency = dimension("Evidence Urgency", needPressure, policy.evidenceUrgencyWeight, item.evidenceNeedIds);
  const opportunityImpact = dimension("Opportunity Impact", opportunityScore, policy.opportunityWeight, [item.initiativeId]);
  const feasibility = dimension("Feasibility", item.kind === "PublishEvidence" ? 82 : item.kind === "BuildEvidence" ? 58 : 68, policy.feasibilityWeight, item.targetArtifactReferences);
  const dimensions = immutableArray([strategicAlignment, evidenceUrgency, opportunityImpact, feasibility]);
  const totalWeight = dimensions.reduce((sum, dimensionInput) => sum + dimensionInput.weight, 0);
  const overallScore = totalWeight === 0 ? 0 : Math.round(dimensions.reduce((sum, dimensionInput) => sum + dimensionInput.score * dimensionInput.weight, 0) / totalWeight);

  return immutableRecord({
    initiativeId: item.initiativeId,
    kind: item.kind,
    strategicAlignment,
    evidenceUrgency,
    opportunityImpact,
    feasibility,
    scoreBreakdown: createScoreBreakdown({
      overallScore,
      band: scoreBand(overallScore),
      dimensions,
      contributions: dimensions.map((dimensionInput) => createScoreContribution({ source: dimensionInput.dimension, amount: dimensionInput.score, rationale: dimensionInput.rationale })),
      penalties: dimensions.filter((dimensionInput) => dimensionInput.score < 50).map((dimensionInput) => createScorePenalty({ code: dimensionInput.dimension, amount: 8, severity: "medium", rationale: `${dimensionInput.dimension} lowers initiative priority.` }))
    }),
    priority: priorityFromScore(overallScore),
    impact: impactFromScore(overallScore),
    confidence: confidenceFromScore(overallScore, `${item.title} evaluation confidence follows deterministic planning dimensions.`)
  });
}

export function confidenceFactors(score: number, initiativeCount: number) {
  return immutableArray([
    createConfidenceFactor({
      factor: "roadmap-score",
      value: clampScore(score) / 100,
      weight: 0.55,
      rationale: "Plan confidence follows roadmap evaluation score."
    }),
    createConfidenceFactor({
      factor: "initiative-coverage",
      value: Math.min(1, initiativeCount / 4),
      weight: 0.45,
      rationale: "Plan confidence increases with deterministic initiative coverage."
    })
  ]);
}

function dimension(name: string, score: number, weight: number, evidence: readonly string[]) {
  const evidenceCount = evidence.length;
  return createScoreDimension({
    dimension: name,
    score: clampScore(score),
    weight,
    rationale: `${name} is derived from ${evidenceCount} canonical portfolio planning reference${evidenceCount === 1 ? "" : "s"}.`
  });
}
