import { createLearningPlannerExplanationSummary } from "../explainability";
import type { LearningPlanContext, LearningPlanContextInput, LearningPlannerStageDefinition } from "../models";
import { defaultLearningConstraints, defaultLearningPlannerPolicy, defaultLearningPreferences } from "../policies";
import { artifactReference, confidenceFromScore, immutableArray, immutableRecord, uniqueSorted } from "../shared";

export class LearningPlanContextAnalyzer {
  analyze(input: LearningPlanContextInput): LearningPlanContext {
    const sourceReferences = immutableArray([
      artifactReference(input.careerStrategy.artifact),
      artifactReference(input.portfolioPlan.artifact),
      artifactReference(input.opportunityDecision.artifact)
    ]);
    const contextId = `learning-plan-context:${input.careerStrategy.strategyId}`.replace(/\s+/g, "-").toLowerCase();
    const assumptions = immutableArray(input.assumptions ?? input.careerStrategy.assumptions);
    const constraints = defaultLearningConstraints(input.constraints);
    const preferences = defaultLearningPreferences(input.preferences);
    const strategicObjectives = uniqueSorted([
      input.careerStrategy.profile,
      input.careerStrategy.expectedImpact,
      ...input.careerStrategy.risks
    ]);
    const portfolioRoadmapReferences = immutableArray(input.portfolioPlan.orderedInitiatives.map((item) => item.initiativeId));
    const targetOpportunityReferences = uniqueSorted([
      input.opportunityDecision.decisionId,
      input.opportunityDecision.outcome,
      ...input.opportunityDecision.supportingEvidence
    ]);

    return immutableRecord({
      artifactKind: "LearningPlanContext" as const,
      contextId,
      careerStrategy: input.careerStrategy,
      portfolioPlan: input.portfolioPlan,
      opportunityDecision: input.opportunityDecision,
      strategicObjectives,
      portfolioRoadmapReferences,
      targetOpportunityReferences,
      sourceReferences,
      sequence: stageSequence(),
      currentStage: "CapabilityNeeds" as const,
      policy: defaultLearningPlannerPolicy(input.policy),
      preferences,
      assumptions,
      constraints,
      traceId: input.traceId,
      confidence: confidenceFromScore(100, "LearningPlanContext aggregates canonical inputs without capability analysis."),
      explanationSummary: createLearningPlannerExplanationSummary({
        decisionId: contextId,
        title: "Learning Plan Context",
        outcome: "Aggregation",
        confidenceScore: 100,
        evidenceReferenceIds: sourceReferences.map((reference) => reference.referenceId),
        reasonCodes: immutableArray(["aggregation-only", "learning-planning-context"]),
        tradeOffs: immutableArray(["aggregation defers capability trade-offs to downstream stages"]),
        assumptions,
        constraints: constraints.map((constraint) => constraint.label)
      })
    });
  }
}

function stageSequence(): readonly LearningPlannerStageDefinition[] {
  return immutableArray([
    stage("LearningPlanContext", 0, [], ["Learning planning context is available."], []),
    stage("CapabilityNeeds", 1, ["LearningPlanContext is available."], ["Capability needs are represented."], ["LearningPlanContext"]),
    stage("LearningInitiatives", 2, ["CapabilityNeeds is available."], ["Learning initiatives are represented."], ["CapabilityNeeds"]),
    stage("LearningEvaluation", 3, ["LearningInitiatives is available."], ["Learning initiatives are evaluated."], ["LearningInitiatives"]),
    stage("LearningRoadmap", 4, ["LearningEvaluation is available."], ["Learning initiatives are sequenced."], ["LearningEvaluation"]),
    stage("LearningPlan", 5, ["LearningRoadmap is available."], ["Learning plan is selected."], ["LearningRoadmap"])
  ]);
}

function stage(stageName: LearningPlannerStageDefinition["stage"], order: number, entryCriteria: readonly string[], exitCriteria: readonly string[], dependencies: readonly LearningPlannerStageDefinition["stage"][]): LearningPlannerStageDefinition {
  return immutableRecord({
    stage: stageName,
    order,
    entryCriteria: immutableArray(entryCriteria),
    exitCriteria: immutableArray(exitCriteria),
    dependencies: immutableArray(dependencies)
  });
}
