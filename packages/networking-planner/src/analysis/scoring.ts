import {
  createConfidenceFactor,
  createGapClassification,
  createRankingReason,
  createScoreBreakdown,
  createScoreContribution,
  createScoreDimension,
  createScorePenalty
} from "@career-companion/product-intelligence";
import type { NetworkingEvaluationItem, NetworkingInitiative, NetworkingNeed } from "../models";
import type { NetworkingInitiativeKind, NetworkingNeedCategory, NetworkingPlannerPolicy } from "../policies";
import { clampScore, confidenceFromScore, impactFromScore, immutableArray, immutableRecord, priorityFromScore, scoreBand } from "../shared";

export function networkingNeed(needId: string, category: NetworkingNeedCategory, currentReference: string, desiredOutcome: string, score: number, evidence: readonly string[], traceLink: string): NetworkingNeed {
  const clamped = clampScore(score);
  const gap = createGapClassification({
    gapId: `networking-gap:${needId}`,
    gapType: category,
    severity: clamped < 45 ? "high" : clamped < 70 ? "medium" : "low",
    priority: clamped < 45 ? "critical" : clamped < 70 ? "high" : "low",
    rationale: `${category} is represented as a networking gap.`
  });

  return immutableRecord({
    needId,
    category,
    currentNetworkingReference: currentReference,
    desiredNetworkingOutcome: desiredOutcome,
    gap,
    strategicImportance: dimension("Strategic Importance", 100 - clamped, 1, evidence),
    confidence: confidenceFromScore(Math.max(35, 100 - clamped), `${category} confidence follows deterministic networking gap severity.`),
    evidence: immutableArray(evidence),
    assumptions: immutableArray(["networking need is derived from canonical planning inputs"]),
    constraints: immutableArray([]),
    explanationSummary: {} as NetworkingNeed["explanationSummary"],
    traceLink
  });
}

export function networkingInitiative(kind: NetworkingInitiativeKind, title: string, needIds: readonly string[], evidence: readonly string[], score: number): NetworkingInitiative {
  return immutableRecord({
    initiativeId: `networking-initiative:${kind}:${title.replace(/\s+/g, "-").toLowerCase()}`,
    kind,
    title,
    networkingNeedIds: immutableArray(needIds),
    category: categoryFor(kind),
    recommendationType: recommendationTypeFor(kind),
    expectedNetworkingOutcome: `${title} improves networking readiness evidence.`,
    evidenceContribution: immutableArray(evidence),
    rationale: createRankingReason({
      code: `networking-initiative:${kind}`,
      statement: `${title} is a deterministic networking initiative.`,
      weight: clampScore(score) / 100
    }),
    confidence: confidenceFromScore(score, `${title} confidence follows addressed networking needs.`)
  });
}

export function evaluationFor(item: NetworkingInitiative, policy: NetworkingPlannerPolicy, opportunityScore: number, strategyScore: number, portfolioSignal: number, learningSignal: number, interviewSignal: number): NetworkingEvaluationItem {
  const needPressure = Math.min(95, 52 + item.networkingNeedIds.length * 10);
  const strategicImpact = dimension("Strategic Impact", strategyScore, policy.strategicImpactWeight, [item.initiativeId]);
  const opportunityAlignment = dimension("Opportunity Alignment", opportunityScore, policy.opportunityAlignmentWeight, [item.initiativeId]);
  const visibilityImprovement = dimension("Visibility Improvement", Math.round((portfolioSignal + needPressure) / 2), policy.visibilityImprovementWeight, item.evidenceContribution);
  const relationshipLeverage = dimension("Relationship Leverage", Math.round((learningSignal + interviewSignal) / 2), policy.relationshipLeverageWeight, item.networkingNeedIds);
  const recruiterRelevance = dimension("Recruiter Relevance", Math.round((opportunityScore + portfolioSignal) / 2), policy.relevanceWeight / 2, item.evidenceContribution);
  const hiringManagerRelevance = dimension("Hiring Manager Relevance", Math.round((strategyScore + interviewSignal) / 2), policy.relevanceWeight / 2, [item.initiativeId]);
  const effort = dimension("Effort", effortScore(item.kind), 0.06, [item.initiativeId]);
  const complexity = dimension("Complexity", complexityScore(item.kind), 0.06, [item.initiativeId]);
  const dependency = dimension("Dependency", dependencyScore(item.kind), 0.05, item.networkingNeedIds);
  const opportunityCost = dimension("Opportunity Cost", Math.max(40, 86 - item.networkingNeedIds.length * 7), 0.05, [item.initiativeId]);
  const initiativeRisk = dimension("Initiative Risk", riskScore(item.kind), policy.effortRiskWeight, [item.initiativeId]);
  const dimensions = immutableArray([strategicImpact, opportunityAlignment, visibilityImprovement, relationshipLeverage, recruiterRelevance, hiringManagerRelevance, effort, complexity, dependency, opportunityCost, initiativeRisk]);
  const totalWeight = dimensions.reduce((sum, itemInput) => sum + itemInput.weight, 0);
  const overallScore = totalWeight === 0 ? 0 : Math.round(dimensions.reduce((sum, itemInput) => sum + itemInput.score * itemInput.weight, 0) / totalWeight);

  return immutableRecord({
    initiativeId: item.initiativeId,
    kind: item.kind,
    strategicImpact,
    opportunityAlignment,
    visibilityImprovement,
    relationshipLeverage,
    recruiterRelevance,
    hiringManagerRelevance,
    effort,
    complexity,
    dependency,
    opportunityCost,
    initiativeRisk,
    scoreBreakdown: createScoreBreakdown({
      overallScore,
      band: scoreBand(overallScore),
      dimensions,
      contributions: dimensions.map((dimensionInput) => createScoreContribution({ source: dimensionInput.dimension, amount: dimensionInput.score, rationale: dimensionInput.rationale })),
      penalties: dimensions.filter((dimensionInput) => dimensionInput.score < 50).map((dimensionInput) => createScorePenalty({ code: dimensionInput.dimension, amount: 8, severity: "medium", rationale: `${dimensionInput.dimension} reduces networking initiative priority.` }))
    }),
    priority: priorityFromScore(overallScore),
    impact: impactFromScore(overallScore),
    confidence: confidenceFromScore(overallScore, `${item.title} evaluation confidence follows deterministic networking dimensions.`)
  });
}

export function confidenceFactors(score: number, initiativeCount: number) {
  return immutableArray([
    createConfidenceFactor({
      factor: "networking-roadmap-score",
      value: clampScore(score) / 100,
      weight: 0.55,
      rationale: "Plan confidence follows networking roadmap score."
    }),
    createConfidenceFactor({
      factor: "networking-coverage",
      value: Math.min(1, initiativeCount / 5),
      weight: 0.45,
      rationale: "Plan confidence increases with deterministic networking coverage."
    })
  ]);
}

function dimension(name: string, score: number, weight: number, evidence: readonly string[]) {
  const evidenceCount = evidence.length;
  return createScoreDimension({
    dimension: name,
    score: clampScore(score),
    weight,
    rationale: `${name} is derived from ${evidenceCount} canonical networking planning reference${evidenceCount === 1 ? "" : "s"}.`
  });
}

function categoryFor(kind: NetworkingInitiativeKind) {
  if (kind === "PublishAIProductContent" || kind === "PublishPortfolio") return "Evidence" as const;
  if (kind === "IncreaseProfessionalVisibility" || kind === "EngageIndustryDiscussions") return "Positioning" as const;
  if (kind === "BuildReferralNetwork" || kind === "StrengthenRecruiterNetwork") return "Alignment" as const;
  return "Readiness" as const;
}

function recommendationTypeFor(kind: NetworkingInitiativeKind) {
  if (kind === "PublishAIProductContent" || kind === "PublishPortfolio") return "Strengthen" as const;
  if (kind === "IncreaseProfessionalVisibility" || kind === "EngageIndustryDiscussions") return "Clarify" as const;
  if (kind === "BuildReferralNetwork" || kind === "ExpandHiringManagerNetwork") return "Validate" as const;
  return "Prepare" as const;
}

function effortScore(kind: NetworkingInitiativeKind): number {
  if (kind === "ParticipateInConferences" || kind === "AttendProductMeetups") return 58;
  if (kind === "PublishAIProductContent" || kind === "PublishPortfolio") return 68;
  return 72;
}

function complexityScore(kind: NetworkingInitiativeKind): number {
  if (kind === "ParticipateInConferences" || kind === "ContributeToCommunities") return 62;
  return 74;
}

function dependencyScore(kind: NetworkingInitiativeKind): number {
  if (kind === "PublishPortfolio" || kind === "PublishAIProductContent") return 64;
  return 78;
}

function riskScore(kind: NetworkingInitiativeKind): number {
  if (kind === "ParticipateInConferences" || kind === "BuildReferralNetwork") return 62;
  return 74;
}
