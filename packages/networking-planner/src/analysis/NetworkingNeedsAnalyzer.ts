import { createNetworkingPlannerExplanationSummary } from "../explainability";
import type { NetworkingNeeds, NetworkingPlanContext } from "../models";
import type { NetworkingNeedCategory } from "../policies";
import { confidenceFromScore, immutableArray, immutableRecord, uniqueSorted } from "../shared";
import { networkingNeed } from "./scoring";

export class NetworkingNeedsAnalyzer {
  analyze(context: NetworkingPlanContext): NetworkingNeeds {
    const categories = networkingCategories(context);
    const evidence = uniqueSorted([
      context.careerStrategy.strategyId,
      context.portfolioPlan.planId,
      context.learningPlan.planId,
      context.interviewPlan.planId,
      context.opportunityDecision.decisionId,
      ...context.portfolioReferences,
      ...context.capabilityReferences,
      ...context.interviewReadinessReferences
    ]);
    const needs = immutableArray(categories.map((category, index) => networkingNeed(
      `networking-need:${index + 1}:${category}`,
      category,
      currentReferenceFor(category, context),
      desiredFor(category, context),
      scoreFor(category, context),
      evidence,
      context.traceId
    )));
    const needsId = `networking-needs:${context.contextId}`;
    const confidenceScore = Math.max(35, Math.round(needs.reduce((sum, need) => sum + need.confidence.value * 100, 0) / Math.max(1, needs.length)));

    return immutableRecord({
      artifactKind: "NetworkingNeeds" as const,
      needsId,
      contextId: context.contextId,
      careerStrategy: context.careerStrategy,
      portfolioPlan: context.portfolioPlan,
      learningPlan: context.learningPlan,
      interviewPlan: context.interviewPlan,
      opportunityDecision: context.opportunityDecision,
      needs: needs.map((need) => immutableRecord({
        ...need,
        constraints: context.constraints,
        assumptions: context.assumptions,
        explanationSummary: createNetworkingPlannerExplanationSummary({
          decisionId: need.needId,
          title: need.desiredNetworkingOutcome,
          outcome: need.category,
          confidenceScore: Math.round(need.confidence.value * 100),
          evidenceReferenceIds: need.evidence,
          reasonCodes: [need.category, need.gap.severity],
          assumptions: context.assumptions,
          constraints: context.constraints.map((constraint) => constraint.label),
          tradeOffs: [`${need.category} is balanced against other networking needs.`]
        })
      })),
      policy: context.policy,
      preferences: context.preferences,
      assumptions: context.assumptions,
      constraints: context.constraints,
      traceId: context.traceId,
      confidence: confidenceFromScore(confidenceScore, "NetworkingNeeds confidence follows deterministic networking gaps."),
      explanationSummary: createNetworkingPlannerExplanationSummary({
        decisionId: needsId,
        title: "Networking Needs",
        outcome: "NeedsRepresented",
        confidenceScore,
        evidenceReferenceIds: evidence,
        reasonCodes: categories,
        assumptions: context.assumptions,
        constraints: context.constraints.map((constraint) => constraint.label),
        tradeOffs: immutableArray(["networking gap coverage is balanced against initiative focus"])
      })
    });
  }
}

function networkingCategories(context: NetworkingPlanContext): readonly NetworkingNeedCategory[] {
  const signals = `${context.careerStrategy.profile} ${context.strategicPriorities.join(" ")} ${context.targetOpportunities.join(" ")}`.toLowerCase();
  const categories: NetworkingNeedCategory[] = ["ProfessionalVisibility", "IndustryRelationships", "RecruiterExposure", "HiringManagerExposure", "PeerNetwork", "PortfolioAwareness", "Referrals"];
  if (signals.includes("ai")) categories.push("AICommunityParticipation", "ThoughtLeadership");
  if (signals.includes("growth")) categories.push("ConferenceParticipation", "DomainCredibility");
  if (signals.includes("leadership")) categories.push("MentorNetwork", "ThoughtLeadership");
  categories.push("DomainCredibility");
  return immutableArray([...new Set(categories)]);
}

function desiredFor(category: NetworkingNeedCategory, context: NetworkingPlanContext): string {
  return `${labelFor(category)} for ${context.careerStrategy.profile}`;
}

function currentReferenceFor(category: NetworkingNeedCategory, context: NetworkingPlanContext): string {
  const preference = context.preferences.find((item) => item.value === category);
  return preference?.preferenceId ?? context.interviewPlan.planId;
}

function scoreFor(category: NetworkingNeedCategory, context: NetworkingPlanContext): number {
  const base = Math.round((context.careerStrategy.scoreSummary.overallScore + context.opportunityDecision.scoreSummary.overallScore) / 2);
  if (context.careerStrategy.risks.some((risk) => risk.toLowerCase().includes("visibility")) && category === "ProfessionalVisibility") return 38;
  if (context.careerStrategy.risks.some((risk) => risk.toLowerCase().includes("referral")) && category === "Referrals") return 42;
  if (context.portfolioPlan.outcome === "BuildCriticalEvidence") return Math.max(35, base - 28);
  if (category === "ProfessionalVisibility" || category === "HiringManagerExposure") return Math.max(42, base - 16);
  return Math.max(38, base - 20);
}

function labelFor(category: NetworkingNeedCategory): string {
  return category.replace(/([a-z])([A-Z])/g, "$1 $2");
}
