import { createCareerStrategyExplanationSummary } from "../explainability";
import type { CareerGoal, CareerGoalInput, CareerStrategyStageDefinition } from "../models";
import { defaultCareerStrategyPolicy, defaultStrategicPreferences } from "../policies";
import { artifactReference, confidenceFromScore, immutableArray, immutableRecord } from "../shared";

export class CareerGoalAnalyzer {
  analyze(input: CareerGoalInput): CareerGoal {
    const sequence = stageSequence();
    const sourceReferences = immutableArray([
      artifactReference(input.opportunityDecision.artifact),
      artifactReference(input.decisionReport.artifact)
    ]);
    const goalId = `career-goal:${input.targetRole}:${input.targetLevel}`.replace(/\s+/g, "-").toLowerCase();

    return immutableRecord({
      artifactKind: "CareerGoal" as const,
      goalId,
      opportunityDecision: input.opportunityDecision,
      decisionReport: input.decisionReport,
      targetRole: input.targetRole,
      targetLevel: input.targetLevel,
      targetDomains: immutableArray(input.targetDomains),
      preferredCompanies: immutableArray(input.preferredCompanies),
      preferredIndustries: immutableArray(input.preferredIndustries),
      preferredLocations: immutableArray(input.preferredLocations),
      timeline: input.timeline,
      compensationObjective: input.compensationObjective,
      constraints: immutableArray(input.constraints ?? []),
      strategicPreferences: immutableArray(input.strategicPreferences ?? defaultStrategicPreferences()),
      assumptions: immutableArray(input.assumptions ?? []),
      sequence,
      currentStage: "CurrentState" as const,
      sourceReferences,
      policy: defaultCareerStrategyPolicy(input.policy),
      traceId: input.traceId,
      confidence: confidenceFromScore(100, "CareerGoal aggregates Opportunity Intelligence and Career Decision without strategy analysis."),
      explanationSummary: createCareerStrategyExplanationSummary({
        decisionId: goalId,
        title: "Career Goal",
        outcome: "BalancedGrowth",
        confidenceScore: 100,
        evidenceReferenceIds: sourceReferences.map((reference) => reference.referenceId),
        reasonCodes: immutableArray(["aggregation-only", "strategic-goal-definition"]),
        assumptions: input.assumptions ?? [],
        constraints: input.constraints ?? []
      })
    });
  }
}

function stageSequence(): readonly CareerStrategyStageDefinition[] {
  return immutableArray([
    stage("CareerGoal", 0, [], ["Desired destination is defined."], []),
    stage("CurrentState", 1, ["CareerGoal is available."], ["Current strategic position is represented."], ["CareerGoal"]),
    stage("CareerGap", 2, ["CurrentState is available."], ["Strategic gaps are represented."], ["CurrentState"]),
    stage("StrategyOptions", 3, ["CareerGap is available."], ["Strategic alternatives are generated."], ["CareerGap"]),
    stage("StrategyEvaluation", 4, ["StrategyOptions is available."], ["Strategy alternatives are evaluated."], ["StrategyOptions"]),
    stage("CareerStrategy", 5, ["StrategyEvaluation is available."], ["Long-term strategy is selected."], ["StrategyEvaluation"])
  ]);
}

function stage(stageName: CareerStrategyStageDefinition["stage"], order: number, entryCriteria: readonly string[], exitCriteria: readonly string[], dependencies: readonly CareerStrategyStageDefinition["stage"][]): CareerStrategyStageDefinition {
  return immutableRecord({
    stage: stageName,
    order,
    entryCriteria: immutableArray(entryCriteria),
    exitCriteria: immutableArray(exitCriteria),
    dependencies: immutableArray(dependencies)
  });
}
