import { createInterviewPlannerExplanationSummary } from "../explainability";
import type { InterviewPlanContext, InterviewPlanContextInput, InterviewPlannerStageDefinition } from "../models";
import { defaultInterviewConstraints, defaultInterviewPlannerPolicy, defaultInterviewPreferences } from "../policies";
import { artifactReference, confidenceFromScore, immutableArray, immutableRecord, uniqueSorted } from "../shared";

export class InterviewPlanContextAnalyzer {
  analyze(input: InterviewPlanContextInput): InterviewPlanContext {
    const sourceReferences = immutableArray([
      artifactReference(input.careerStrategy.artifact),
      artifactReference(input.portfolioPlan.artifact),
      artifactReference(input.learningPlan.artifact),
      artifactReference(input.opportunityDecision.artifact)
    ]);
    const contextId = `interview-plan-context:${input.careerStrategy.strategyId}`.replace(/\s+/g, "-").toLowerCase();
    const assumptions = immutableArray(input.assumptions ?? input.careerStrategy.assumptions);
    const constraints = defaultInterviewConstraints(input.constraints);
    const preferences = defaultInterviewPreferences(input.preferences);
    const targetRoleExpectations = uniqueSorted([
      input.opportunityDecision.outcome,
      ...input.opportunityDecision.supportingEvidence
    ]);
    const strategicPriorities = uniqueSorted([
      input.careerStrategy.profile,
      input.careerStrategy.expectedImpact,
      input.portfolioPlan.outcome,
      input.learningPlan.outcome,
      ...input.careerStrategy.risks
    ]);
    const capabilityReferences = uniqueSorted([
      ...input.learningPlan.prioritizedInitiatives.map((item) => item.initiativeId),
      ...input.learningPlan.capabilityOutcomes
    ]);
    const portfolioEvidenceReferences = uniqueSorted([
      ...input.portfolioPlan.orderedInitiatives.map((item) => item.initiativeId),
      ...input.portfolioPlan.supportingEvidence
    ]);

    return immutableRecord({
      artifactKind: "InterviewPlanContext" as const,
      contextId,
      careerStrategy: input.careerStrategy,
      portfolioPlan: input.portfolioPlan,
      learningPlan: input.learningPlan,
      opportunityDecision: input.opportunityDecision,
      targetRoleExpectations,
      strategicPriorities,
      capabilityReferences,
      portfolioEvidenceReferences,
      sourceReferences,
      sequence: stageSequence(),
      currentStage: "InterviewNeeds" as const,
      policy: defaultInterviewPlannerPolicy(input.policy),
      preferences,
      assumptions,
      constraints,
      traceId: input.traceId,
      confidence: confidenceFromScore(100, "InterviewPlanContext aggregates canonical inputs without readiness analysis."),
      explanationSummary: createInterviewPlannerExplanationSummary({
        decisionId: contextId,
        title: "Interview Plan Context",
        outcome: "Aggregation",
        confidenceScore: 100,
        evidenceReferenceIds: sourceReferences.map((reference) => reference.referenceId),
        reasonCodes: immutableArray(["aggregation-only", "interview-readiness-context"]),
        assumptions,
        constraints: constraints.map((constraint) => constraint.label),
        tradeOffs: immutableArray(["aggregation defers readiness trade-offs to downstream stages"])
      })
    });
  }
}

function stageSequence(): readonly InterviewPlannerStageDefinition[] {
  return immutableArray([
    stage("InterviewPlanContext", 0, [], ["Interview planning context is available."], []),
    stage("InterviewNeeds", 1, ["InterviewPlanContext is available."], ["Readiness needs are represented."], ["InterviewPlanContext"]),
    stage("InterviewInitiatives", 2, ["InterviewNeeds is available."], ["Readiness initiatives are represented."], ["InterviewNeeds"]),
    stage("InterviewEvaluation", 3, ["InterviewInitiatives is available."], ["Readiness initiatives are evaluated."], ["InterviewInitiatives"]),
    stage("InterviewRoadmap", 4, ["InterviewEvaluation is available."], ["Readiness initiatives are sequenced."], ["InterviewEvaluation"]),
    stage("InterviewPlan", 5, ["InterviewRoadmap is available."], ["Interview plan is selected."], ["InterviewRoadmap"])
  ]);
}

function stage(stageName: InterviewPlannerStageDefinition["stage"], order: number, entryCriteria: readonly string[], exitCriteria: readonly string[], dependencies: readonly InterviewPlannerStageDefinition["stage"][]): InterviewPlannerStageDefinition {
  return immutableRecord({
    stage: stageName,
    order,
    entryCriteria: immutableArray(entryCriteria),
    exitCriteria: immutableArray(exitCriteria),
    dependencies: immutableArray(dependencies)
  });
}
