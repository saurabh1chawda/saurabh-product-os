import { createInterviewPlannerExplanationSummary } from "../explainability";
import type { InterviewNeeds, InterviewPlanContext } from "../models";
import type { InterviewReadinessCategory } from "../policies";
import { confidenceFromScore, immutableArray, immutableRecord, uniqueSorted } from "../shared";
import { interviewNeed } from "./scoring";

export class InterviewNeedsAnalyzer {
  analyze(context: InterviewPlanContext): InterviewNeeds {
    const categories = readinessCategories(context);
    const evidence = uniqueSorted([
      context.careerStrategy.strategyId,
      context.portfolioPlan.planId,
      context.learningPlan.planId,
      context.opportunityDecision.decisionId,
      ...context.capabilityReferences,
      ...context.portfolioEvidenceReferences
    ]);
    const needs = immutableArray(categories.map((category, index) => interviewNeed(
      `interview-need:${index + 1}:${category}`,
      category,
      currentReferenceFor(category, context),
      desiredFor(category, context),
      scoreFor(category, context),
      evidence,
      context.traceId
    )));
    const needsId = `interview-needs:${context.contextId}`;
    const confidenceScore = Math.max(35, Math.round(needs.reduce((sum, need) => sum + need.confidence.value * 100, 0) / Math.max(1, needs.length)));

    return immutableRecord({
      artifactKind: "InterviewNeeds" as const,
      needsId,
      contextId: context.contextId,
      careerStrategy: context.careerStrategy,
      portfolioPlan: context.portfolioPlan,
      learningPlan: context.learningPlan,
      opportunityDecision: context.opportunityDecision,
      needs: needs.map((need) => immutableRecord({
        ...need,
        constraints: context.constraints,
        assumptions: context.assumptions,
        explanationSummary: createInterviewPlannerExplanationSummary({
          decisionId: need.needId,
          title: need.desiredReadiness,
          outcome: need.category,
          confidenceScore: Math.round(need.confidence.value * 100),
          evidenceReferenceIds: need.evidence,
          reasonCodes: [need.category, need.gap.severity],
          assumptions: context.assumptions,
          constraints: context.constraints.map((constraint) => constraint.label),
          tradeOffs: [`${need.category} readiness is balanced against other readiness categories.`]
        })
      })),
      policy: context.policy,
      preferences: context.preferences,
      assumptions: context.assumptions,
      constraints: context.constraints,
      traceId: context.traceId,
      confidence: confidenceFromScore(confidenceScore, "InterviewNeeds confidence follows deterministic readiness gaps."),
      explanationSummary: createInterviewPlannerExplanationSummary({
        decisionId: needsId,
        title: "Interview Needs",
        outcome: "NeedsRepresented",
        confidenceScore,
        evidenceReferenceIds: evidence,
        reasonCodes: categories,
        assumptions: context.assumptions,
        constraints: context.constraints.map((constraint) => constraint.label),
        tradeOffs: immutableArray(["readiness gap coverage is balanced against initiative focus"])
      })
    });
  }
}

function readinessCategories(context: InterviewPlanContext): readonly InterviewReadinessCategory[] {
  const signals = `${context.careerStrategy.profile} ${context.strategicPriorities.join(" ")} ${context.targetRoleExpectations.join(" ")}`.toLowerCase();
  const categories: InterviewReadinessCategory[] = ["ProductStrategy", "ProductSense", "Metrics", "ProductExecution", "LeadershipStories", "BehavioralReadiness", "Communication", "StakeholderManagement", "ExecutiveCommunication"];
  if (signals.includes("ai")) categories.push("AIProductDesign", "TechnicalFluency", "SystemsThinking");
  if (signals.includes("platform")) categories.push("TechnicalFluency", "SystemsThinking");
  if (signals.includes("growth")) categories.push("Growth", "Pricing");
  categories.push("CustomerDiscovery");
  return immutableArray([...new Set(categories)]);
}

function desiredFor(category: InterviewReadinessCategory, context: InterviewPlanContext): string {
  return `${labelFor(category)} readiness for ${context.careerStrategy.profile}`;
}

function currentReferenceFor(category: InterviewReadinessCategory, context: InterviewPlanContext): string {
  const preference = context.preferences.find((item) => item.value === category);
  return preference?.preferenceId ?? context.learningPlan.planId;
}

function scoreFor(category: InterviewReadinessCategory, context: InterviewPlanContext): number {
  const base = Math.round((context.careerStrategy.scoreSummary.overallScore + context.opportunityDecision.scoreSummary.overallScore) / 2);
  if (context.careerStrategy.risks.some((risk) => risk.toLowerCase().includes("interview")) && category === "BehavioralReadiness") return 38;
  if (context.careerStrategy.risks.some((risk) => risk.toLowerCase().includes("leadership")) && category === "LeadershipStories") return 42;
  if (context.learningPlan.outcome === "EvidenceLedLearning") return Math.max(35, base - 30);
  if (category === "ExecutiveCommunication" || category === "ProductStrategy") return Math.max(42, base - 16);
  return Math.max(38, base - 20);
}

function labelFor(category: InterviewReadinessCategory): string {
  return category.replace(/([a-z])([A-Z])/g, "$1 $2");
}
