import {
  createConfidenceFactor,
  createGapClassification,
  createRankingReason,
  createScoreBreakdown,
  createScoreContribution,
  createScoreDimension,
  createScorePenalty
} from "@career-companion/product-intelligence";
import type { CapabilityNeed, LearningEvaluationItem, LearningInitiative } from "../models";
import type { CapabilityCategory, LearningInitiativeKind, LearningPlannerPolicy } from "../policies";
import { clampScore, confidenceFromScore, impactFromScore, immutableArray, immutableRecord, priorityFromScore, scoreBand } from "../shared";

export function capabilityNeed(needId: string, category: CapabilityCategory, targetCapability: string, currentReference: string, desiredCapability: string, score: number, evidence: readonly string[], traceLink: string): CapabilityNeed {
  const clamped = clampScore(score);
  const gap = createGapClassification({
    gapId: `capability-gap:${needId}`,
    gapType: targetCapability,
    severity: clamped < 45 ? "high" : clamped < 70 ? "medium" : "low",
    priority: clamped < 45 ? "critical" : clamped < 70 ? "high" : "low",
    rationale: `${targetCapability} is represented as a capability-development gap.`
  });

  return immutableRecord({
    needId,
    category,
    targetCapability,
    currentCapabilityReference: currentReference,
    desiredCapability,
    gap,
    strategicImportance: dimension("Strategic Importance", 100 - clamped, 1, evidence),
    assumptions: immutableArray(["capability need is derived from canonical strategic and planning inputs"]),
    constraints: immutableArray([]),
    confidence: confidenceFromScore(Math.max(35, 100 - clamped), `${targetCapability} confidence follows deterministic capability gap severity.`),
    supportingEvidence: immutableArray(evidence),
    explanationSummary: {} as CapabilityNeed["explanationSummary"],
    traceLink
  });
}

export function learningInitiative(kind: LearningInitiativeKind, title: string, needIds: readonly string[], evidence: readonly string[], score: number): LearningInitiative {
  return immutableRecord({
    initiativeId: `learning-initiative:${kind}:${title.replace(/\s+/g, "-").toLowerCase()}`,
    kind,
    title,
    capabilityNeedIds: immutableArray(needIds),
    category: categoryFor(kind),
    recommendationType: recommendationTypeFor(kind),
    expectedCapabilityOutcome: `${title} strengthens intentional capability development.`,
    evidenceContribution: immutableArray(evidence),
    rationale: createRankingReason({
      code: `learning-initiative:${kind}`,
      statement: `${title} is a deterministic capability-building initiative.`,
      weight: clampScore(score) / 100
    }),
    confidence: confidenceFromScore(score, `${title} confidence follows addressed capability needs.`)
  });
}

export function evaluationFor(item: LearningInitiative, policy: LearningPlannerPolicy, opportunityScore: number, strategyScore: number, portfolioSignal: number): LearningEvaluationItem {
  const needPressure = Math.min(95, 52 + item.capabilityNeedIds.length * 10);
  const strategicImpact = dimension("Strategic Impact", strategyScore, policy.strategicImpactWeight, [item.initiativeId]);
  const capabilityCoverage = dimension("Capability Coverage", needPressure, policy.capabilityCoverageWeight, item.capabilityNeedIds);
  const evidenceContribution = dimension("Evidence Contribution", portfolioSignal, policy.evidenceContributionWeight, item.evidenceContribution);
  const recruiterValue = dimension("Recruiter Value", Math.round((opportunityScore + portfolioSignal) / 2), 0.08, item.evidenceContribution);
  const hiringManagerValue = dimension("Hiring Manager Value", Math.round((strategyScore + opportunityScore) / 2), 0.08, [item.initiativeId]);
  const effort = dimension("Effort", effortScore(item.kind), 0.07, [item.initiativeId]);
  const complexity = dimension("Complexity", complexityScore(item.kind), 0.07, [item.initiativeId]);
  const dependency = dimension("Dependency", dependencyScore(item.kind), 0.06, item.capabilityNeedIds);
  const leverage = dimension("Leverage", Math.min(95, strategyScore + item.capabilityNeedIds.length * 4), 0.08, [item.initiativeId]);
  const opportunityCost = dimension("Opportunity Cost", Math.max(40, 86 - item.capabilityNeedIds.length * 7), 0.05, [item.initiativeId]);
  const executionRisk = dimension("Execution Risk", riskScore(item.kind), policy.effortRiskWeight, [item.initiativeId]);
  const dimensions = immutableArray([strategicImpact, capabilityCoverage, evidenceContribution, recruiterValue, hiringManagerValue, effort, complexity, dependency, leverage, opportunityCost, executionRisk]);
  const totalWeight = dimensions.reduce((sum, itemInput) => sum + itemInput.weight, 0);
  const overallScore = totalWeight === 0 ? 0 : Math.round(dimensions.reduce((sum, itemInput) => sum + itemInput.score * itemInput.weight, 0) / totalWeight);

  return immutableRecord({
    initiativeId: item.initiativeId,
    kind: item.kind,
    strategicImpact,
    capabilityCoverage,
    evidenceContribution,
    recruiterValue,
    hiringManagerValue,
    effort,
    complexity,
    dependency,
    leverage,
    opportunityCost,
    executionRisk,
    scoreBreakdown: createScoreBreakdown({
      overallScore,
      band: scoreBand(overallScore),
      dimensions,
      contributions: dimensions.map((dimensionInput) => createScoreContribution({ source: dimensionInput.dimension, amount: dimensionInput.score, rationale: dimensionInput.rationale })),
      penalties: dimensions.filter((dimensionInput) => dimensionInput.score < 50).map((dimensionInput) => createScorePenalty({ code: dimensionInput.dimension, amount: 8, severity: "medium", rationale: `${dimensionInput.dimension} reduces learning initiative priority.` }))
    }),
    priority: priorityFromScore(overallScore),
    impact: impactFromScore(overallScore),
    confidence: confidenceFromScore(overallScore, `${item.title} evaluation confidence follows deterministic learning dimensions.`)
  });
}

export function confidenceFactors(score: number, initiativeCount: number) {
  return immutableArray([
    createConfidenceFactor({
      factor: "learning-roadmap-score",
      value: clampScore(score) / 100,
      weight: 0.55,
      rationale: "Plan confidence follows learning roadmap score."
    }),
    createConfidenceFactor({
      factor: "capability-coverage",
      value: Math.min(1, initiativeCount / 5),
      weight: 0.45,
      rationale: "Plan confidence increases with deterministic capability coverage."
    })
  ]);
}

function dimension(name: string, score: number, weight: number, evidence: readonly string[]) {
  const evidenceCount = evidence.length;
  return createScoreDimension({
    dimension: name,
    score: clampScore(score),
    weight,
    rationale: `${name} is derived from ${evidenceCount} canonical learning planning reference${evidenceCount === 1 ? "" : "s"}.`
  });
}

function categoryFor(kind: LearningInitiativeKind) {
  if (kind === "AnalyzeProductionMetrics" || kind === "BuildAnalyticsDashboard") return "Impact" as const;
  if (kind === "WriteStrategyMemo" || kind === "CreateDecisionFramework") return "Positioning" as const;
  if (kind === "PublishTechnicalArticle" || kind === "ContributeToOpenSource") return "Evidence" as const;
  return "Readiness" as const;
}

function recommendationTypeFor(kind: LearningInitiativeKind) {
  if (kind === "AnalyzeProductionMetrics" || kind === "BuildAnalyticsDashboard") return "Quantify" as const;
  if (kind === "PublishTechnicalArticle" || kind === "ContributeToOpenSource") return "Validate" as const;
  if (kind === "CreatePRD" || kind === "WriteStrategyMemo") return "Clarify" as const;
  return "Strengthen" as const;
}

function effortScore(kind: LearningInitiativeKind): number {
  if (kind === "BuildAIPrototype" || kind === "BuildAnalyticsDashboard" || kind === "ContributeToOpenSource") return 55;
  if (kind === "ConductCustomerInterviews" || kind === "AnalyzeProductionMetrics") return 64;
  return 72;
}

function complexityScore(kind: LearningInitiativeKind): number {
  if (kind === "DesignAIWorkflow" || kind === "BuildAIPrototype") return 58;
  if (kind === "BuildAnalyticsDashboard") return 62;
  return 74;
}

function dependencyScore(kind: LearningInitiativeKind): number {
  if (kind === "AnalyzeProductionMetrics" || kind === "ConductCustomerInterviews") return 58;
  return 78;
}

function riskScore(kind: LearningInitiativeKind): number {
  if (kind === "BuildAIPrototype" || kind === "ContributeToOpenSource") return 58;
  return 72;
}
