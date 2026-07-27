import { createApplicationPlannerExplanationSummary } from "../explainability";
import type { ApplicationEvaluation, ApplicationInitiatives } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord } from "../shared";
import { evaluationFor } from "./scoring";

export class ApplicationEvaluationAnalyzer {
  analyze(initiatives: ApplicationInitiatives): ApplicationEvaluation {
    const portfolioSignal = initiatives.portfolioPlan.orderedInitiatives.length > 0 ? 78 : 48;
    const interviewSignal = initiatives.interviewPlan.prioritizedReadinessInitiatives.length > 0 ? 74 : 50;
    const networkingSignal = initiatives.networkingPlan.prioritizedNetworkingInitiatives.length > 0 ? 76 : 50;
    const evaluations = immutableArray(initiatives.initiatives.map((item) => evaluationFor(
      item,
      initiatives.policy,
      initiatives.opportunityDecision.scoreSummary.overallScore,
      initiatives.careerStrategy.scoreSummary.overallScore,
      portfolioSignal,
      interviewSignal,
      networkingSignal
    )));
    const evaluationId = `application-evaluation:${initiatives.initiativesId}`;
    const confidenceScore = Math.round(evaluations.reduce((sum, item) => sum + item.confidence.value * 100, 0) / Math.max(1, evaluations.length));

    return immutableRecord({
      artifactKind: "ApplicationEvaluation" as const,
      evaluationId,
      initiativesId: initiatives.initiativesId,
      careerStrategy: initiatives.careerStrategy,
      portfolioPlan: initiatives.portfolioPlan,
      learningPlan: initiatives.learningPlan,
      interviewPlan: initiatives.interviewPlan,
      networkingPlan: initiatives.networkingPlan,
      opportunityDecision: initiatives.opportunityDecision,
      evaluations,
      policy: initiatives.policy,
      preferences: initiatives.preferences,
      assumptions: initiatives.assumptions,
      constraints: initiatives.constraints,
      traceId: initiatives.traceId,
      confidence: confidenceFromScore(confidenceScore, "ApplicationEvaluation confidence follows deterministic application initiative evaluations."),
      explanationSummary: createApplicationPlannerExplanationSummary({
        decisionId: evaluationId,
        title: "Application Evaluation",
        outcome: "InitiativesEvaluated",
        confidenceScore,
        evidenceReferenceIds: [initiatives.careerStrategy.artifact.artifactId, initiatives.portfolioPlan.artifact.artifactId, initiatives.learningPlan.artifact.artifactId, initiatives.interviewPlan.artifact.artifactId, initiatives.networkingPlan.artifact.artifactId, initiatives.opportunityDecision.artifact.artifactId],
        reasonCodes: evaluations.map((item) => item.kind),
        assumptions: initiatives.assumptions,
        constraints: initiatives.constraints.map((constraint) => constraint.label),
        tradeOffs: immutableArray(["strategic impact is balanced against effort, complexity, dependency, and initiative risk"])
      })
    });
  }
}
