import {
  createConfidenceFactor,
  createGapClassification,
  createRankingReason,
  createScoreBreakdown,
  createScoreContribution,
  createScoreDimension,
  createScorePenalty
} from "@career-companion/product-intelligence";
import type { ApplicationEvaluationItem, ApplicationInitiative, ApplicationNeed } from "../models";
import type { ApplicationInitiativeKind, ApplicationNeedCategory, ApplicationPlannerPolicy } from "../policies";
import { clampScore, confidenceFromScore, impactFromScore, immutableArray, immutableRecord, priorityFromScore, scoreBand } from "../shared";

export function applicationNeed(needId: string, category: ApplicationNeedCategory, currentReference: string, desiredOutcome: string, score: number, evidence: readonly string[], traceLink: string): ApplicationNeed {
  const clamped = clampScore(score);
  const gap = createGapClassification({
    gapId: `application-gap:${needId}`,
    gapType: category,
    severity: clamped < 45 ? "high" : clamped < 70 ? "medium" : "low",
    priority: clamped < 45 ? "critical" : clamped < 70 ? "high" : "low",
    rationale: `${category} is represented as an application readiness gap.`
  });

  return immutableRecord({
    needId,
    category,
    currentApplicationReference: currentReference,
    desiredApplicationOutcome: desiredOutcome,
    gap,
    strategicImportance: dimension("Strategic Importance", 100 - clamped, 1, evidence),
    confidence: confidenceFromScore(Math.max(35, 100 - clamped), `${category} confidence follows deterministic application gap severity.`),
    evidence: immutableArray(evidence),
    assumptions: immutableArray(["application need is derived from canonical planning inputs"]),
    constraints: immutableArray([]),
    explanationSummary: {} as ApplicationNeed["explanationSummary"],
    traceLink
  });
}

export function applicationInitiative(kind: ApplicationInitiativeKind, title: string, needIds: readonly string[], evidence: readonly string[], score: number): ApplicationInitiative {
  return immutableRecord({
    initiativeId: `application-initiative:${kind}:${title.replace(/\s+/g, "-").toLowerCase()}`,
    kind,
    title,
    applicationNeedIds: immutableArray(needIds),
    category: categoryFor(kind),
    recommendationType: recommendationTypeFor(kind),
    expectedApplicationOutcome: `${title} improves application readiness evidence.`,
    evidenceContribution: immutableArray(evidence),
    rationale: createRankingReason({
      code: `application-initiative:${kind}`,
      statement: `${title} is a deterministic application initiative.`,
      weight: clampScore(score) / 100
    }),
    confidence: confidenceFromScore(score, `${title} confidence follows addressed application needs.`)
  });
}

export function evaluationFor(item: ApplicationInitiative, policy: ApplicationPlannerPolicy, opportunityScore: number, strategyScore: number, portfolioSignal: number, interviewSignal: number, networkingSignal: number): ApplicationEvaluationItem {
  const needPressure = Math.min(95, 52 + item.applicationNeedIds.length * 10);
  const strategicImpact = dimension("Strategic Impact", strategyScore, policy.strategicImpactWeight, [item.initiativeId]);
  const opportunityAlignment = dimension("Opportunity Alignment", opportunityScore, policy.opportunityAlignmentWeight, [item.initiativeId]);
  const readinessImprovement = dimension("Readiness Improvement", Math.round((portfolioSignal + interviewSignal + needPressure) / 3), policy.readinessImprovementWeight, item.evidenceContribution);
  const recruiterRelevance = dimension("Recruiter Relevance", Math.round((opportunityScore + networkingSignal) / 2), policy.recruiterRelevanceWeight, item.evidenceContribution);
  const hiringManagerRelevance = dimension("Hiring Manager Relevance", Math.round((strategyScore + interviewSignal) / 2), policy.hiringManagerRelevanceWeight, [item.initiativeId]);
  const effort = dimension("Effort", effortScore(item.kind), 0.06, [item.initiativeId]);
  const complexity = dimension("Complexity", complexityScore(item.kind), 0.06, [item.initiativeId]);
  const dependency = dimension("Dependency", dependencyScore(item.kind), 0.05, item.applicationNeedIds);
  const opportunityCost = dimension("Opportunity Cost", Math.max(40, 86 - item.applicationNeedIds.length * 7), 0.05, [item.initiativeId]);
  const initiativeRisk = dimension("Initiative Risk", riskScore(item.kind), policy.effortRiskWeight, [item.initiativeId]);
  const dimensions = immutableArray([strategicImpact, opportunityAlignment, readinessImprovement, recruiterRelevance, hiringManagerRelevance, effort, complexity, dependency, opportunityCost, initiativeRisk]);
  const totalWeight = dimensions.reduce((sum, itemInput) => sum + itemInput.weight, 0);
  const overallScore = totalWeight === 0 ? 0 : Math.round(dimensions.reduce((sum, itemInput) => sum + itemInput.score * itemInput.weight, 0) / totalWeight);

  return immutableRecord({
    initiativeId: item.initiativeId,
    kind: item.kind,
    strategicImpact,
    opportunityAlignment,
    readinessImprovement,
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
      penalties: dimensions.filter((dimensionInput) => dimensionInput.score < 50).map((dimensionInput) => createScorePenalty({ code: dimensionInput.dimension, amount: 8, severity: "medium", rationale: `${dimensionInput.dimension} reduces application initiative priority.` }))
    }),
    priority: priorityFromScore(overallScore),
    impact: impactFromScore(overallScore),
    confidence: confidenceFromScore(overallScore, `${item.title} evaluation confidence follows deterministic application dimensions.`)
  });
}

export function confidenceFactors(score: number, initiativeCount: number) {
  return immutableArray([
    createConfidenceFactor({
      factor: "application-roadmap-score",
      value: clampScore(score) / 100,
      weight: 0.55,
      rationale: "Plan confidence follows application roadmap score."
    }),
    createConfidenceFactor({
      factor: "application-coverage",
      value: Math.min(1, initiativeCount / 5),
      weight: 0.45,
      rationale: "Plan confidence increases with deterministic application coverage."
    })
  ]);
}

function dimension(name: string, score: number, weight: number, evidence: readonly string[]) {
  const evidenceCount = evidence.length;
  return createScoreDimension({
    dimension: name,
    score: clampScore(score),
    weight,
    rationale: `${name} is derived from ${evidenceCount} canonical application planning reference${evidenceCount === 1 ? "" : "s"}.`
  });
}

function categoryFor(kind: ApplicationInitiativeKind) {
  if (kind === "CompletePortfolioEvidence" || kind === "OrganizeSupportingDocumentation") return "Evidence" as const;
  if (kind === "PrioritizeTargetCompanies" || kind === "PrepareCompanyResearch") return "Alignment" as const;
  if (kind === "ValidateResumeCoverage" || kind === "PrepareRoleSpecificAssets") return "Coverage" as const;
  return "Readiness" as const;
}

function recommendationTypeFor(kind: ApplicationInitiativeKind) {
  if (kind === "CompletePortfolioEvidence" || kind === "OrganizeSupportingDocumentation") return "Strengthen" as const;
  if (kind === "PrioritizeTargetCompanies" || kind === "PrepareCompanyResearch") return "Clarify" as const;
  if (kind === "ValidateResumeCoverage" || kind === "VerifyInterviewReadiness") return "Validate" as const;
  return "Prepare" as const;
}

function effortScore(kind: ApplicationInitiativeKind): number {
  if (kind === "PrepareRoleSpecificAssets" || kind === "PrepareCompanyResearch") return 62;
  if (kind === "CompletePortfolioEvidence" || kind === "OrganizeSupportingDocumentation") return 68;
  return 74;
}

function complexityScore(kind: ApplicationInitiativeKind): number {
  if (kind === "PrepareRoleSpecificAssets" || kind === "ValidateResumeCoverage") return 62;
  return 74;
}

function dependencyScore(kind: ApplicationInitiativeKind): number {
  if (kind === "CompletePortfolioEvidence" || kind === "PrioritizeReferrals") return 64;
  return 78;
}

function riskScore(kind: ApplicationInitiativeKind): number {
  if (kind === "PrepareRoleSpecificAssets" || kind === "PrioritizeTargetCompanies") return 66;
  return 74;
}
