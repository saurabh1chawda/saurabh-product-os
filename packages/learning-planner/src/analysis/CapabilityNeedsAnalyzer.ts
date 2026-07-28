import { createLearningPlannerExplanationSummary } from "../explainability";
import type { CapabilityNeeds, LearningPlanContext } from "../models";
import type { CapabilityCategory } from "../policies";
import { confidenceFromScore, immutableArray, immutableRecord, uniqueSorted } from "../shared";
import { capabilityNeed } from "./scoring";

export class CapabilityNeedsAnalyzer {
  analyze(context: LearningPlanContext): CapabilityNeeds {
    const categories = capabilityCategories(context);
    const evidence = uniqueSorted([
      context.careerStrategy.strategyId,
      context.portfolioPlan.planId,
      context.opportunityDecision.decisionId,
      ...context.portfolioRoadmapReferences
    ]);
    const needs = immutableArray(categories.map((category, index) => capabilityNeed(
      `capability-need:${index + 1}:${category}`,
      category,
      labelFor(category),
      currentReferenceFor(category, context),
      desiredFor(category, context),
      scoreFor(category, context),
      evidence,
      context.traceId
    )));
    const needsId = `capability-needs:${context.contextId}`;
    const confidenceScore = Math.max(35, Math.round(needs.reduce((sum, need) => sum + need.confidence.value * 100, 0) / Math.max(1, needs.length)));

    return immutableRecord({
      artifactKind: "CapabilityNeeds" as const,
      needsId,
      contextId: context.contextId,
      careerStrategy: context.careerStrategy,
      portfolioPlan: context.portfolioPlan,
      opportunityDecision: context.opportunityDecision,
      needs: needs.map((need) => immutableRecord({
        ...need,
        constraints: context.constraints,
        assumptions: context.assumptions,
        explanationSummary: createLearningPlannerExplanationSummary({
          decisionId: need.needId,
          title: need.targetCapability,
          outcome: need.category,
          confidenceScore: Math.round(need.confidence.value * 100),
          evidenceReferenceIds: need.supportingEvidence,
          reasonCodes: [need.category, need.gap.severity],
          tradeOffs: [`${need.category} capability development is balanced against other capability needs.`],
          assumptions: context.assumptions,
          constraints: context.constraints.map((constraint) => constraint.label)
        })
      })),
      policy: context.policy,
      preferences: context.preferences,
      assumptions: context.assumptions,
      constraints: context.constraints,
      traceId: context.traceId,
      confidence: confidenceFromScore(confidenceScore, "CapabilityNeeds confidence follows deterministic capability gaps."),
      explanationSummary: createLearningPlannerExplanationSummary({
        decisionId: needsId,
        title: "Capability Needs",
        outcome: "NeedsRepresented",
        confidenceScore,
        evidenceReferenceIds: evidence,
        reasonCodes: categories,
        tradeOffs: immutableArray(["capability gap coverage is balanced against initiative focus"]),
        assumptions: context.assumptions,
        constraints: context.constraints.map((constraint) => constraint.label)
      })
    });
  }
}

function capabilityCategories(context: LearningPlanContext): readonly CapabilityCategory[] {
  const signals = `${context.careerStrategy.profile} ${context.strategicObjectives.join(" ")} ${context.opportunityDecision.supportingEvidence.join(" ")}`.toLowerCase();
  const categories: CapabilityCategory[] = ["ProductStrategy", "ProductLeadership", "ExecutiveCommunication", "DecisionMaking"];
  if (signals.includes("ai")) categories.push("AIProductManagement", "TechnicalFluency", "SystemsThinking");
  if (signals.includes("platform")) categories.push("PlatformThinking", "ProductOperations");
  if (signals.includes("growth")) categories.push("Growth", "ProductAnalytics", "Experimentation");
  categories.push("CustomerDiscovery", "StakeholderManagement", "DomainExpertise");
  return immutableArray([...new Set(categories)]);
}

function labelFor(category: CapabilityCategory): string {
  return category.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function desiredFor(category: CapabilityCategory, context: LearningPlanContext): string {
  return `${labelFor(category)} at ${context.careerStrategy.profile} standard`;
}

function currentReferenceFor(category: CapabilityCategory, context: LearningPlanContext): string {
  const preference = context.preferences.find((item) => item.value === category);
  return preference?.preferenceId ?? context.careerStrategy.strategyId;
}

function scoreFor(category: CapabilityCategory, context: LearningPlanContext): number {
  const base = Math.round((context.careerStrategy.scoreSummary.overallScore + context.opportunityDecision.scoreSummary.overallScore) / 2);
  if (context.careerStrategy.risks.some((risk) => risk.toLowerCase().includes("ai")) && category === "AIProductManagement") return 42;
  if (context.careerStrategy.risks.some((risk) => risk.toLowerCase().includes("leadership")) && category === "ProductLeadership") return 45;
  if (context.portfolioPlan.outcome === "BuildCriticalEvidence") return Math.max(35, base - 28);
  if (category === "ExecutiveCommunication" || category === "DecisionMaking") return Math.max(45, base - 12);
  return Math.max(38, base - 18);
}
