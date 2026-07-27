import { createApplicationPlannerExplanationSummary } from "../explainability";
import type { ApplicationNeeds, ApplicationPlanContext } from "../models";
import type { ApplicationNeedCategory } from "../policies";
import { confidenceFromScore, immutableArray, immutableRecord, uniqueSorted } from "../shared";
import { applicationNeed } from "./scoring";

export class ApplicationNeedsAnalyzer {
  analyze(context: ApplicationPlanContext): ApplicationNeeds {
    const categories = applicationCategories(context);
    const evidence = uniqueSorted([
      context.careerStrategy.strategyId,
      context.portfolioPlan.planId,
      context.learningPlan.planId,
      context.interviewPlan.planId,
      context.networkingPlan.planId,
      context.opportunityDecision.decisionId,
      ...context.portfolioReferences,
      ...context.capabilityReferences,
      ...context.interviewReadinessReferences,
      ...context.networkingReadinessReferences
    ]);
    const needs = immutableArray(categories.map((category, index) => applicationNeed(
      `application-need:${index + 1}:${category}`,
      category,
      currentReferenceFor(category, context),
      desiredFor(category, context),
      scoreFor(category, context),
      evidence,
      context.traceId
    )));
    const needsId = `application-needs:${context.contextId}`;
    const confidenceScore = Math.max(35, Math.round(needs.reduce((sum, need) => sum + need.confidence.value * 100, 0) / Math.max(1, needs.length)));

    return immutableRecord({
      artifactKind: "ApplicationNeeds" as const,
      needsId,
      contextId: context.contextId,
      careerStrategy: context.careerStrategy,
      portfolioPlan: context.portfolioPlan,
      learningPlan: context.learningPlan,
      interviewPlan: context.interviewPlan,
      networkingPlan: context.networkingPlan,
      opportunityDecision: context.opportunityDecision,
      needs: needs.map((need) => immutableRecord({
        ...need,
        constraints: context.constraints,
        assumptions: context.assumptions,
        explanationSummary: createApplicationPlannerExplanationSummary({
          decisionId: need.needId,
          title: need.desiredApplicationOutcome,
          outcome: need.category,
          confidenceScore: Math.round(need.confidence.value * 100),
          evidenceReferenceIds: need.evidence,
          reasonCodes: [need.category, need.gap.severity],
          assumptions: context.assumptions,
          constraints: context.constraints.map((constraint) => constraint.label),
          tradeOffs: [`${need.category} is balanced against other application needs.`]
        })
      })),
      policy: context.policy,
      preferences: context.preferences,
      assumptions: context.assumptions,
      constraints: context.constraints,
      traceId: context.traceId,
      confidence: confidenceFromScore(confidenceScore, "ApplicationNeeds confidence follows deterministic application gaps."),
      explanationSummary: createApplicationPlannerExplanationSummary({
        decisionId: needsId,
        title: "Application Needs",
        outcome: "NeedsRepresented",
        confidenceScore,
        evidenceReferenceIds: evidence,
        reasonCodes: categories,
        assumptions: context.assumptions,
        constraints: context.constraints.map((constraint) => constraint.label),
        tradeOffs: immutableArray(["application gap coverage is balanced against initiative focus"])
      })
    });
  }
}

function applicationCategories(context: ApplicationPlanContext): readonly ApplicationNeedCategory[] {
  const signals = `${context.careerStrategy.profile} ${context.strategicPriorities.join(" ")} ${context.targetOpportunities.join(" ")}`.toLowerCase();
  const categories: ApplicationNeedCategory[] = ["ResumeReadiness", "PortfolioCompleteness", "ApplicationPrioritization", "RecruiterEngagementReadiness", "ReferralReadiness", "RoleAlignment", "ApplicationEvidence", "InterviewPipelineReadiness"];
  if (signals.includes("ai")) categories.push("SupportingDocumentation", "CompanyResearch");
  if (signals.includes("growth")) categories.push("CompanyResearch");
  categories.push("SupportingDocumentation");
  return immutableArray([...new Set(categories)]);
}

function desiredFor(category: ApplicationNeedCategory, context: ApplicationPlanContext): string {
  return `${labelFor(category)} for ${context.careerStrategy.profile}`;
}

function currentReferenceFor(category: ApplicationNeedCategory, context: ApplicationPlanContext): string {
  const preference = context.preferences.find((item) => item.value === category);
  return preference?.preferenceId ?? context.networkingPlan.planId;
}

function scoreFor(category: ApplicationNeedCategory, context: ApplicationPlanContext): number {
  const base = Math.round((context.careerStrategy.scoreSummary.overallScore + context.opportunityDecision.scoreSummary.overallScore) / 2);
  if (context.careerStrategy.risks.some((risk) => risk.toLowerCase().includes("evidence")) && category === "ApplicationEvidence") return 38;
  if (context.careerStrategy.risks.some((risk) => risk.toLowerCase().includes("referral")) && category === "ReferralReadiness") return 42;
  if (context.portfolioPlan.outcome === "BuildCriticalEvidence") return Math.max(35, base - 28);
  if (category === "RoleAlignment" || category === "ApplicationPrioritization") return Math.max(42, base - 16);
  return Math.max(38, base - 20);
}

function labelFor(category: ApplicationNeedCategory): string {
  return category.replace(/([a-z])([A-Z])/g, "$1 $2");
}
