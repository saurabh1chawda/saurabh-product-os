import { createNetworkingPlannerExplanationSummary } from "../explainability";
import type { NetworkingPlanContext, NetworkingPlanContextInput, NetworkingPlannerStageDefinition } from "../models";
import { defaultNetworkingConstraints, defaultNetworkingPlannerPolicy, defaultNetworkingPreferences } from "../policies";
import { artifactReference, confidenceFromScore, immutableArray, immutableRecord, uniqueSorted } from "../shared";

export class NetworkingPlanContextAnalyzer {
  analyze(input: NetworkingPlanContextInput): NetworkingPlanContext {
    const sourceReferences = immutableArray([
      artifactReference(input.careerStrategy.artifact),
      artifactReference(input.portfolioPlan.artifact),
      artifactReference(input.learningPlan.artifact),
      artifactReference(input.interviewPlan.artifact),
      artifactReference(input.opportunityDecision.artifact)
    ]);
    const contextId = `networking-plan-context:${input.careerStrategy.strategyId}`.replace(/\s+/g, "-").toLowerCase();
    const assumptions = immutableArray(input.assumptions ?? input.careerStrategy.assumptions);
    const constraints = defaultNetworkingConstraints(input.constraints);
    const preferences = defaultNetworkingPreferences(input.preferences);
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

    return immutableRecord({
      artifactKind: "NetworkingPlanContext" as const,
      contextId,
      careerStrategy: input.careerStrategy,
      portfolioPlan: input.portfolioPlan,
      learningPlan: input.learningPlan,
      interviewPlan: input.interviewPlan,
      opportunityDecision: input.opportunityDecision,
      targetOpportunities,
      strategicPriorities,
      portfolioReferences,
      capabilityReferences,
      interviewReadinessReferences,
      sourceReferences,
      sequence: stageSequence(),
      currentStage: "NetworkingNeeds" as const,
      policy: defaultNetworkingPlannerPolicy(input.policy),
      preferences,
      assumptions,
      constraints,
      traceId: input.traceId,
      confidence: confidenceFromScore(100, "NetworkingPlanContext aggregates canonical inputs without networking analysis."),
      explanationSummary: createNetworkingPlannerExplanationSummary({
        decisionId: contextId,
        title: "Networking Plan Context",
        outcome: "Aggregation",
        confidenceScore: 100,
        evidenceReferenceIds: sourceReferences.map((reference) => reference.referenceId),
        reasonCodes: immutableArray(["aggregation-only", "networking-planning-context"]),
        assumptions,
        constraints: constraints.map((constraint) => constraint.label),
        tradeOffs: immutableArray(["aggregation defers networking trade-offs to downstream stages"])
      })
    });
  }
}

function stageSequence(): readonly NetworkingPlannerStageDefinition[] {
  return immutableArray([
    stage("NetworkingPlanContext", 0, [], ["Networking planning context is available."], []),
    stage("NetworkingNeeds", 1, ["NetworkingPlanContext is available."], ["Networking needs are represented."], ["NetworkingPlanContext"]),
    stage("NetworkingInitiatives", 2, ["NetworkingNeeds is available."], ["Networking initiatives are represented."], ["NetworkingNeeds"]),
    stage("NetworkingEvaluation", 3, ["NetworkingInitiatives is available."], ["Networking initiatives are evaluated."], ["NetworkingInitiatives"]),
    stage("NetworkingRoadmap", 4, ["NetworkingEvaluation is available."], ["Networking initiatives are sequenced."], ["NetworkingEvaluation"]),
    stage("NetworkingPlan", 5, ["NetworkingRoadmap is available."], ["Networking plan is selected."], ["NetworkingRoadmap"])
  ]);
}

function stage(stageName: NetworkingPlannerStageDefinition["stage"], order: number, entryCriteria: readonly string[], exitCriteria: readonly string[], dependencies: readonly NetworkingPlannerStageDefinition["stage"][]): NetworkingPlannerStageDefinition {
  return immutableRecord({
    stage: stageName,
    order,
    entryCriteria: immutableArray(entryCriteria),
    exitCriteria: immutableArray(exitCriteria),
    dependencies: immutableArray(dependencies)
  });
}
