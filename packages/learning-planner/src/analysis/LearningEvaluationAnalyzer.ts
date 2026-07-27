import { createLearningPlannerExplanationSummary } from "../explainability";
import type { LearningEvaluation, LearningInitiatives } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord } from "../shared";
import { evaluationFor } from "./scoring";

export class LearningEvaluationAnalyzer {
  analyze(initiatives: LearningInitiatives): LearningEvaluation {
    const portfolioSignal = initiatives.portfolioPlan.orderedInitiatives.length > 0 ? 78 : 48;
    const evaluations = immutableArray(initiatives.initiatives.map((item) => evaluationFor(
      item,
      initiatives.policy,
      initiatives.opportunityDecision.scoreSummary.overallScore,
      initiatives.careerStrategy.scoreSummary.overallScore,
      portfolioSignal
    )));
    const evaluationId = `learning-evaluation:${initiatives.initiativesId}`;
    const confidenceScore = Math.round(evaluations.reduce((sum, item) => sum + item.confidence.value * 100, 0) / Math.max(1, evaluations.length));

    return immutableRecord({
      artifactKind: "LearningEvaluation" as const,
      evaluationId,
      initiativesId: initiatives.initiativesId,
      careerStrategy: initiatives.careerStrategy,
      portfolioPlan: initiatives.portfolioPlan,
      opportunityDecision: initiatives.opportunityDecision,
      evaluations,
      policy: initiatives.policy,
      preferences: initiatives.preferences,
      assumptions: initiatives.assumptions,
      constraints: initiatives.constraints,
      traceId: initiatives.traceId,
      confidence: confidenceFromScore(confidenceScore, "LearningEvaluation confidence follows deterministic initiative evaluations."),
      explanationSummary: createLearningPlannerExplanationSummary({
        decisionId: evaluationId,
        title: "Learning Evaluation",
        outcome: "InitiativesEvaluated",
        confidenceScore,
        evidenceReferenceIds: [initiatives.careerStrategy.artifact.artifactId, initiatives.portfolioPlan.artifact.artifactId, initiatives.opportunityDecision.artifact.artifactId],
        reasonCodes: evaluations.map((item) => item.kind),
        assumptions: initiatives.assumptions,
        constraints: initiatives.constraints.map((constraint) => constraint.label)
      })
    });
  }
}
