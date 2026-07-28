import { createPortfolioPlannerExplanationSummary } from "../explainability";
import type { InitiativeEvaluation, PortfolioInitiatives } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord } from "../shared";
import { evaluationFor } from "./scoring";

export class InitiativeEvaluationAnalyzer {
  analyze(initiatives: PortfolioInitiatives): InitiativeEvaluation {
    const evaluations = immutableArray(initiatives.initiatives.map((item) => evaluationFor(
      item,
      initiatives.policy,
      initiatives.opportunityDecision.scoreSummary.overallScore,
      initiatives.careerStrategy.scoreSummary.overallScore
    )));
    const evaluationId = `initiative-evaluation:${initiatives.initiativesId}`;
    const confidenceScore = Math.round(evaluations.reduce((sum, item) => sum + item.confidence.value * 100, 0) / evaluations.length);

    return immutableRecord({
      artifactKind: "InitiativeEvaluation" as const,
      evaluationId,
      initiativesId: initiatives.initiativesId,
      careerStrategy: initiatives.careerStrategy,
      portfolio: initiatives.portfolio,
      opportunityDecision: initiatives.opportunityDecision,
      evaluations,
      policy: initiatives.policy,
      assumptions: initiatives.assumptions,
      constraints: initiatives.constraints,
      traceId: initiatives.traceId,
      confidence: confidenceFromScore(confidenceScore, "InitiativeEvaluation confidence follows deterministic initiative evaluations."),
      explanationSummary: createPortfolioPlannerExplanationSummary({
        decisionId: evaluationId,
        title: "Initiative Evaluation",
        outcome: "InitiativesEvaluated",
        confidenceScore,
        evidenceReferenceIds: [initiatives.portfolio.artifact.artifactId, initiatives.careerStrategy.artifact.artifactId],
        reasonCodes: evaluations.map((item) => item.kind),
        tradeOffs: immutableArray(["strategic alignment is balanced against feasibility and evidence urgency"]),
        assumptions: initiatives.assumptions,
        constraints: initiatives.constraints.map((constraint) => constraint.label)
      })
    });
  }
}
