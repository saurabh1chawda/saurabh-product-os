import { createApplicationPlannerExplanationSummary } from "../explainability";
import type { ApplicationPlanContext, ApplicationPlanContextInput, ApplicationPlannerStageDefinition } from "../models";
import { defaultApplicationConstraints, defaultApplicationPlannerPolicy, defaultApplicationPreferences } from "../policies";
import { artifactReference, confidenceFromScore, immutableArray, immutableRecord, uniqueSorted } from "../shared";

export class ApplicationPlanContextAnalyzer {
  analyze(input: ApplicationPlanContextInput): ApplicationPlanContext {
    const sourceReferences = immutableArray([
      artifactReference(input.careerStrategy.artifact),
      artifactReference(input.portfolioPlan.artifact),
      artifactReference(input.learningPlan.artifact),
      artifactReference(input.interviewPlan.artifact),
      artifactReference(input.networkingPlan.artifact),
      artifactReference(input.opportunityDecision.artifact)
    ]);
    const contextId = `application-plan-context:${input.careerStrategy.strategyId}`.replace(/\s+/g, "-").toLowerCase();
    const assumptions = immutableArray(input.assumptions ?? input.careerStrategy.assumptions);
    const constraints = defaultApplicationConstraints(input.constraints);
    const preferences = defaultApplicationPreferences(input.preferences);
    const targetOpportunities = uniqueSorted([
      input.opportunityDecision.decisionId,
      input.opportunityDecision.outcome,
      ...input.opportunityDecision.supportingEvidence
    ]);
    const strategicPriorities = uniqueSorted([
      input.careerStrategy.profile,
      input.careerStrategy.expectedImpact,
      input.portfolioPlan.outcome,
      input.learningPlan.outcome,
      input.interviewPlan.outcome,
      input.networkingPlan.outcome,
      ...input.careerStrategy.risks
    ]);
    const portfolioReferences = uniqueSorted([
      ...input.portfolioPlan.orderedInitiatives.map((item) => item.initiativeId),
      ...input.portfolioPlan.supportingEvidence
    ]);
    const capabilityReferences = uniqueSorted([
      ...input.learningPlan.prioritizedInitiatives.map((item) => item.initiativeId),
      ...input.learningPlan.capabilityOutcomes
    ]);
    const interviewReadinessReferences = uniqueSorted([
      ...input.interviewPlan.prioritizedReadinessInitiatives.map((item) => item.initiativeId),
      ...input.interviewPlan.expectedReadinessOutcomes
    ]);
    const networkingReadinessReferences = uniqueSorted([
      ...input.networkingPlan.prioritizedNetworkingInitiatives.map((item) => item.initiativeId),
      ...input.networkingPlan.expectedNetworkingOutcomes
    ]);

    return immutableRecord({
      artifactKind: "ApplicationPlanContext" as const,
      contextId,
      careerStrategy: input.careerStrategy,
      portfolioPlan: input.portfolioPlan,
      learningPlan: input.learningPlan,
      interviewPlan: input.interviewPlan,
      networkingPlan: input.networkingPlan,
      opportunityDecision: input.opportunityDecision,
      targetOpportunities,
      strategicPriorities,
      portfolioReferences,
      capabilityReferences,
      interviewReadinessReferences,
      networkingReadinessReferences,
      sourceReferences,
      sequence: stageSequence(),
      currentStage: "ApplicationNeeds" as const,
      policy: defaultApplicationPlannerPolicy(input.policy),
      preferences,
      assumptions,
      constraints,
      traceId: input.traceId,
      confidence: confidenceFromScore(100, "ApplicationPlanContext aggregates canonical inputs without application analysis."),
      explanationSummary: createApplicationPlannerExplanationSummary({
        decisionId: contextId,
        title: "Application Plan Context",
        outcome: "Aggregation",
        confidenceScore: 100,
        evidenceReferenceIds: sourceReferences.map((reference) => reference.referenceId),
        reasonCodes: immutableArray(["aggregation-only", "application-planning-context"]),
        assumptions,
        constraints: constraints.map((constraint) => constraint.label),
        tradeOffs: immutableArray(["aggregation defers application trade-offs to downstream stages"])
      })
    });
  }
}

function stageSequence(): readonly ApplicationPlannerStageDefinition[] {
  return immutableArray([
    stage("ApplicationPlanContext", 0, [], ["Application planning context is available."], []),
    stage("ApplicationNeeds", 1, ["ApplicationPlanContext is available."], ["Application needs are represented."], ["ApplicationPlanContext"]),
    stage("ApplicationInitiatives", 2, ["ApplicationNeeds is available."], ["Application initiatives are represented."], ["ApplicationNeeds"]),
    stage("ApplicationEvaluation", 3, ["ApplicationInitiatives is available."], ["Application initiatives are evaluated."], ["ApplicationInitiatives"]),
    stage("ApplicationRoadmap", 4, ["ApplicationEvaluation is available."], ["Application initiatives are sequenced."], ["ApplicationEvaluation"]),
    stage("ApplicationPlan", 5, ["ApplicationRoadmap is available."], ["Application plan is selected."], ["ApplicationRoadmap"])
  ]);
}

function stage(stageName: ApplicationPlannerStageDefinition["stage"], order: number, entryCriteria: readonly string[], exitCriteria: readonly string[], dependencies: readonly ApplicationPlannerStageDefinition["stage"][]): ApplicationPlannerStageDefinition {
  return immutableRecord({
    stage: stageName,
    order,
    entryCriteria: immutableArray(entryCriteria),
    exitCriteria: immutableArray(exitCriteria),
    dependencies: immutableArray(dependencies)
  });
}
