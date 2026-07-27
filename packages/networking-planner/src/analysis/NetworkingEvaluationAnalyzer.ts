import { createNetworkingPlannerExplanationSummary } from "../explainability";
import type { NetworkingEvaluation, NetworkingInitiatives } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord } from "../shared";
import { evaluationFor } from "./scoring";

export class NetworkingEvaluationAnalyzer {
  analyze(initiatives: NetworkingInitiatives): NetworkingEvaluation {
    const portfolioSignal = initiatives.portfolioPlan.orderedInitiatives.length > 0 ? 78 : 48;
    const learningSignal = initiatives.learningPlan.prioritizedInitiatives.length > 0 ? 76 : 50;
    const interviewSignal = initiatives.interviewPlan.prioritizedReadinessInitiatives.length > 0 ? 74 : 50;
    const evaluations = immutableArray(initiatives.initiatives.map((item) => evaluationFor(
      item,
      initiatives.policy,
      initiatives.opportunityDecision.scoreSummary.overallScore,
      initiatives.careerStrategy.scoreSummary.overallScore,
      portfolioSignal,
      learningSignal,
      interviewSignal
    )));
    const evaluationId = `networking-evaluation:${initiatives.initiativesId}`;
    const confidenceScore = Math.round(evaluations.reduce((sum, item) => sum + item.confidence.value * 100, 0) / Math.max(1, evaluations.length));

    return immutableRecord({
      artifactKind: "NetworkingEvaluation" as const,
      evaluationId,
      initiativesId: initiatives.initiativesId,
      careerStrategy: initiatives.careerStrategy,
      portfolioPlan: initiatives.portfolioPlan,
      learningPlan: initiatives.learningPlan,
      interviewPlan: initiatives.interviewPlan,
      opportunityDecision: initiatives.opportunityDecision,
      evaluations,
      policy: initiatives.policy,
      preferences: initiatives.preferences,
      assumptions: initiatives.assumptions,
      constraints: initiatives.constraints,
      traceId: initiatives.traceId,
      confidence: confidenceFromScore(confidenceScore, "NetworkingEvaluation confidence follows deterministic networking initiative evaluations."),
      explanationSummary: createNetworkingPlannerExplanationSummary({
        decisionId: evaluationId,
        title: "Networking Evaluation",
        outcome: "InitiativesEvaluated",
        confidenceScore,
        evidenceReferenceIds: [initiatives.careerStrategy.artifact.artifactId, initiatives.portfolioPlan.artifact.artifactId, initiatives.learningPlan.artifact.artifactId, initiatives.interviewPlan.artifact.artifactId, initiatives.opportunityDecision.artifact.artifactId],
        reasonCodes: evaluations.map((item) => item.kind),
        assumptions: initiatives.assumptions,
        constraints: initiatives.constraints.map((constraint) => constraint.label),
        tradeOffs: immutableArray(["strategic impact is balanced against effort, complexity, dependency, and initiative risk"])
      })
    });
  }
}
