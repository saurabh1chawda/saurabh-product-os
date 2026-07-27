import {
  createConfidenceFactor,
  createGapClassification,
  createRankingReason,
  createScoreBreakdown,
  createScoreContribution,
  createScoreDimension,
  createScorePenalty
} from "@career-companion/product-intelligence";
import type { InterviewEvaluationItem, InterviewInitiative, InterviewNeed } from "../models";
import type { InterviewInitiativeKind, InterviewPlannerPolicy, InterviewReadinessCategory } from "../policies";
import { clampScore, confidenceFromScore, impactFromScore, immutableArray, immutableRecord, priorityFromScore, scoreBand } from "../shared";

export function interviewNeed(needId: string, category: InterviewReadinessCategory, currentReference: string, desiredReadiness: string, score: number, evidence: readonly string[], traceLink: string): InterviewNeed {
  const clamped = clampScore(score);
  const gap = createGapClassification({
    gapId: `interview-readiness-gap:${needId}`,
    gapType: category,
    severity: clamped < 45 ? "high" : clamped < 70 ? "medium" : "low",
    priority: clamped < 45 ? "critical" : clamped < 70 ? "high" : "low",
    rationale: `${category} is represented as an interview-readiness gap.`
  });

  return immutableRecord({
    needId,
    category,
    currentReadinessReference: currentReference,
    desiredReadiness,
    gap,
    strategicImportance: dimension("Strategic Importance", 100 - clamped, 1, evidence),
    confidence: confidenceFromScore(Math.max(35, 100 - clamped), `${category} confidence follows deterministic readiness gap severity.`),
    evidence: immutableArray(evidence),
    assumptions: immutableArray(["interview readiness need is derived from canonical planning inputs"]),
    constraints: immutableArray([]),
    explanationSummary: {} as InterviewNeed["explanationSummary"],
    traceLink
  });
}

export function interviewInitiative(kind: InterviewInitiativeKind, title: string, needIds: readonly string[], evidence: readonly string[], score: number): InterviewInitiative {
  return immutableRecord({
    initiativeId: `interview-initiative:${kind}:${title.replace(/\s+/g, "-").toLowerCase()}`,
    kind,
    title,
    readinessNeedIds: immutableArray(needIds),
    category: categoryFor(kind),
    recommendationType: recommendationTypeFor(kind),
    expectedReadinessOutcome: `${title} improves interview readiness evidence.`,
    evidenceContribution: immutableArray(evidence),
    rationale: createRankingReason({
      code: `interview-initiative:${kind}`,
      statement: `${title} is a deterministic readiness initiative.`,
      weight: clampScore(score) / 100
    }),
    confidence: confidenceFromScore(score, `${title} confidence follows addressed readiness needs.`)
  });
}

export function evaluationFor(item: InterviewInitiative, policy: InterviewPlannerPolicy, opportunityScore: number, strategyScore: number, portfolioSignal: number, learningSignal: number): InterviewEvaluationItem {
  const needPressure = Math.min(95, 52 + item.readinessNeedIds.length * 10);
  const strategicImpact = dimension("Strategic Impact", strategyScore, policy.strategicImpactWeight, [item.initiativeId]);
  const interviewCoverage = dimension("Interview Coverage", needPressure, policy.interviewCoverageWeight, item.readinessNeedIds);
  const capabilityReinforcement = dimension("Capability Reinforcement", learningSignal, policy.capabilityReinforcementWeight, [item.initiativeId]);
  const evidenceContribution = dimension("Evidence Contribution", portfolioSignal, policy.evidenceContributionWeight, item.evidenceContribution);
  const recruiterRelevance = dimension("Recruiter Relevance", Math.round((opportunityScore + portfolioSignal) / 2), policy.relevanceWeight / 2, item.evidenceContribution);
  const hiringManagerRelevance = dimension("Hiring Manager Relevance", Math.round((strategyScore + learningSignal) / 2), policy.relevanceWeight / 2, [item.initiativeId]);
  const effort = dimension("Effort", effortScore(item.kind), 0.06, [item.initiativeId]);
  const complexity = dimension("Complexity", complexityScore(item.kind), 0.06, [item.initiativeId]);
  const dependency = dimension("Dependency", dependencyScore(item.kind), 0.05, item.readinessNeedIds);
  const leverage = dimension("Leverage", Math.min(95, strategyScore + item.readinessNeedIds.length * 4), 0.06, [item.initiativeId]);
  const opportunityCost = dimension("Opportunity Cost", Math.max(40, 86 - item.readinessNeedIds.length * 7), 0.04, [item.initiativeId]);
  const initiativeRisk = dimension("Initiative Risk", riskScore(item.kind), policy.effortRiskWeight, [item.initiativeId]);
  const dimensions = immutableArray([strategicImpact, interviewCoverage, capabilityReinforcement, evidenceContribution, recruiterRelevance, hiringManagerRelevance, effort, complexity, dependency, leverage, opportunityCost, initiativeRisk]);
  const totalWeight = dimensions.reduce((sum, itemInput) => sum + itemInput.weight, 0);
  const overallScore = totalWeight === 0 ? 0 : Math.round(dimensions.reduce((sum, itemInput) => sum + itemInput.score * itemInput.weight, 0) / totalWeight);

  return immutableRecord({
    initiativeId: item.initiativeId,
    kind: item.kind,
    strategicImpact,
    interviewCoverage,
    capabilityReinforcement,
    evidenceContribution,
    recruiterRelevance,
    hiringManagerRelevance,
    effort,
    complexity,
    dependency,
    leverage,
    opportunityCost,
    initiativeRisk,
    scoreBreakdown: createScoreBreakdown({
      overallScore,
      band: scoreBand(overallScore),
      dimensions,
      contributions: dimensions.map((dimensionInput) => createScoreContribution({ source: dimensionInput.dimension, amount: dimensionInput.score, rationale: dimensionInput.rationale })),
      penalties: dimensions.filter((dimensionInput) => dimensionInput.score < 50).map((dimensionInput) => createScorePenalty({ code: dimensionInput.dimension, amount: 8, severity: "medium", rationale: `${dimensionInput.dimension} reduces readiness initiative priority.` }))
    }),
    priority: priorityFromScore(overallScore),
    impact: impactFromScore(overallScore),
    confidence: confidenceFromScore(overallScore, `${item.title} evaluation confidence follows deterministic readiness dimensions.`)
  });
}

export function confidenceFactors(score: number, initiativeCount: number) {
  return immutableArray([
    createConfidenceFactor({
      factor: "interview-roadmap-score",
      value: clampScore(score) / 100,
      weight: 0.55,
      rationale: "Plan confidence follows interview roadmap score."
    }),
    createConfidenceFactor({
      factor: "readiness-coverage",
      value: Math.min(1, initiativeCount / 5),
      weight: 0.45,
      rationale: "Plan confidence increases with deterministic readiness coverage."
    })
  ]);
}

function dimension(name: string, score: number, weight: number, evidence: readonly string[]) {
  const evidenceCount = evidence.length;
  return createScoreDimension({
    dimension: name,
    score: clampScore(score),
    weight,
    rationale: `${name} is derived from ${evidenceCount} canonical interview planning reference${evidenceCount === 1 ? "" : "s"}.`
  });
}

function categoryFor(kind: InterviewInitiativeKind) {
  if (kind === "PrepareMetricsFramework" || kind === "PrepareEstimationFramework") return "Impact" as const;
  if (kind === "PrepareProductStrategyNarratives" || kind === "PrepareProductSenseFramework") return "Positioning" as const;
  if (kind === "PrepareSTAREvidenceMatrix" || kind === "PrepareLeadershipEvidence") return "Evidence" as const;
  return "Readiness" as const;
}

function recommendationTypeFor(kind: InterviewInitiativeKind) {
  if (kind === "PrepareMetricsFramework" || kind === "PrepareEstimationFramework") return "Quantify" as const;
  if (kind === "PreparePortfolioWalkthrough" || kind === "PrepareLeadershipEvidence") return "Validate" as const;
  if (kind === "PrepareProductStrategyNarratives" || kind === "PrepareProductSenseFramework") return "Clarify" as const;
  return "Strengthen" as const;
}

function effortScore(kind: InterviewInitiativeKind): number {
  if (kind === "PrepareArchitectureWalkthrough" || kind === "PrepareMetricsFramework") return 62;
  if (kind === "PreparePortfolioWalkthrough" || kind === "PrepareSTAREvidenceMatrix") return 72;
  return 68;
}

function complexityScore(kind: InterviewInitiativeKind): number {
  if (kind === "PrepareArchitectureWalkthrough" || kind === "PrepareProductStrategyNarratives") return 60;
  return 72;
}

function dependencyScore(kind: InterviewInitiativeKind): number {
  if (kind === "PreparePortfolioWalkthrough" || kind === "PrepareLeadershipEvidence") return 66;
  return 78;
}

function riskScore(kind: InterviewInitiativeKind): number {
  if (kind === "PrepareArchitectureWalkthrough" || kind === "PreparePricingFramework") return 62;
  return 74;
}
