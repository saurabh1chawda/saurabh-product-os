import { createInterviewPlannerExplanationSummary } from "../explainability";
import type { InterviewEvaluation, InterviewInitiatives } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord } from "../shared";
import { evaluationFor } from "./scoring";

export class InterviewEvaluationAnalyzer {
  analyze(initiatives: InterviewInitiatives): InterviewEvaluation {
    const portfolioSignal = initiatives.portfolioPlan.orderedInitiatives.length > 0 ? 78 : 48;
    const learningSignal = initiatives.learningPlan.prioritizedInitiatives.length > 0 ? 76 : 50;
    const evaluations = immutableArray(initiatives.initiatives.map((item) => evaluationFor(
      item,
      initiatives.policy,
      initiatives.opportunityDecision.scoreSummary.overallScore,
      initiatives.careerStrategy.scoreSummary.overallScore,
      portfolioSignal,
      learningSignal
    )));
    const evaluationId = `interview-evaluation:${initiatives.initiativesId}`;
    const confidenceScore = Math.round(evaluations.reduce((sum, item) => sum + item.confidence.value * 100, 0) / Math.max(1, evaluations.length));

    return immutableRecord({
      artifactKind: "InterviewEvaluation" as const,
      evaluationId,
      initiativesId: initiatives.initiativesId,
      careerStrategy: initiatives.careerStrategy,
      portfolioPlan: initiatives.portfolioPlan,
      learningPlan: initiatives.learningPlan,
      opportunityDecision: initiatives.opportunityDecision,
      evaluations,
      policy: initiatives.policy,
      preferences: initiatives.preferences,
      assumptions: initiatives.assumptions,
      constraints: initiatives.constraints,
      traceId: initiatives.traceId,
      confidence: confidenceFromScore(confidenceScore, "InterviewEvaluation confidence follows deterministic readiness initiative evaluations."),
      explanationSummary: createInterviewPlannerExplanationSummary({
        decisionId: evaluationId,
        title: "Interview Evaluation",
        outcome: "InitiativesEvaluated",
        confidenceScore,
        evidenceReferenceIds: [initiatives.careerStrategy.artifact.artifactId, initiatives.portfolioPlan.artifact.artifactId, initiatives.learningPlan.artifact.artifactId, initiatives.opportunityDecision.artifact.artifactId],
        reasonCodes: evaluations.map((item) => item.kind),
        assumptions: initiatives.assumptions,
        constraints: initiatives.constraints.map((constraint) => constraint.label),
        tradeOffs: immutableArray(["strategic impact is balanced against effort, complexity, dependency, and initiative risk"])
      })
    });
  }
}
