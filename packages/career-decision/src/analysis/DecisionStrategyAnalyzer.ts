import { DecisionStrategyArtifactBuilder } from "../builders";
import type { DecisionAssessment, DecisionStrategy, StrategyTradeoff } from "../models";
import { PriorityEngine, StrategyEngine } from "../prioritization";
import { confidenceFromScore, immutableArray, immutableRecord, uniqueSorted } from "../shared";

export class DecisionStrategyAnalyzer {
  private readonly artifactBuilder = new DecisionStrategyArtifactBuilder();
  private readonly strategyEngine = new StrategyEngine();
  private readonly priorityEngine = new PriorityEngine();

  analyze(assessment: DecisionAssessment): DecisionStrategy {
    const objectives = this.strategyEngine.createObjectives(assessment);
    const themes = this.strategyEngine.themes(assessment);
    const priorities = this.priorityEngine.order(objectives.map((objective) => objective.priority));
    const tradeoffs = immutableArray(objectives.slice(0, 3).map((objective, index) => immutableRecord({
      tradeoffId: `strategy-tradeoff:${objective.objectiveId}`,
      accepted: objective.label,
      reduced: index === 0 ? "lower-impact refinements" : "lower-priority parallel changes",
      rationale: `Prioritize ${objective.label} because it has stronger decision impact.`,
      confidence: confidenceFromScore(assessment.overallReadiness.overallScore, "Trade-off confidence follows assessment readiness.")
    } satisfies StrategyTradeoff)));
    const partial = immutableRecord({
      artifactKind: "DecisionStrategy" as const,
      strategyId: `decision-strategy:${assessment.assessmentId}`,
      assessmentId: assessment.assessmentId,
      strategicObjectives: objectives,
      optimizationFocus: immutableArray(objectives.map((objective) => objective.label)),
      priorityThemes: themes,
      tradeoffs,
      sequencing: uniqueSorted(objectives.map((objective) => objective.objectiveId)),
      expectedImpact: objectives[0]?.expectedImpact ?? "Minor",
      recommendationPriorities: priorities,
      confidence: this.strategyEngine.confidence(assessment)
    });
    const built = this.artifactBuilder.build(partial);

    return immutableRecord({ ...partial, ...built });
  }
}
