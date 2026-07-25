import { DecisionPlanArtifactBuilder } from "../builders";
import type { DecisionPlan, DecisionStrategy } from "../models";
import { createDecisionAction, createDecisionRecommendation } from "../recommendations";
import { average, confidenceFromScore, immutableArray, immutableRecord } from "../shared";

export class DecisionPlanAnalyzer {
  private readonly artifactBuilder = new DecisionPlanArtifactBuilder();

  analyze(strategy: DecisionStrategy): DecisionPlan {
    const actions = immutableArray(strategy.strategicObjectives.map((objective, index) => createDecisionAction(objective, index)));
    const recommendations = immutableArray(actions.map((action) => createDecisionRecommendation(action)));
    const confidenceScore = Math.round(average(actions.map((action) => action.confidence.value * 100)));
    const partial = immutableRecord({
      artifactKind: "DecisionPlan" as const,
      planId: `decision-plan:${strategy.strategyId}`,
      strategyId: strategy.strategyId,
      actions,
      recommendations,
      confidence: confidenceFromScore(confidenceScore, "Plan confidence follows deterministic action confidence.")
    });
    const built = this.artifactBuilder.build(partial);

    return immutableRecord({ ...partial, ...built });
  }
}
