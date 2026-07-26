import { createConfidenceFactor } from "@career-companion/product-intelligence";
import { InterviewArtifactBuilder } from "../builders";
import type { HiringManagerEvaluation, InterviewEvaluation } from "../models";
import { createHiringRecommendations } from "../recommendations";
import { average, confidenceFromScore, immutableArray, immutableRecord } from "../shared";
import { gapsFor, scoreFor, signal } from "./RecruiterAnalyzer";

export class InterviewAnalyzer {
  private readonly artifactBuilder = new InterviewArtifactBuilder();

  analyze(hiringManagerEvaluation: HiringManagerEvaluation): InterviewEvaluation {
    const managerScore = hiringManagerEvaluation.score.overallScore;
    const signals = immutableArray([
      signal("behavioral-evidence", "BehavioralEvidence", "Behavioral evidence", average([hiringManagerEvaluation.leadership.score.score, hiringManagerEvaluation.ownership.score.score]), ["manager:leadership"], 0.13),
      signal("interview-communication", "Communication", "Communication", hiringManagerEvaluation.crossFunctionalCollaboration.score.score, ["manager:collaboration"], 0.12),
      signal("product-sense", "ProductSense", "Product sense", hiringManagerEvaluation.productThinking.score.score, ["manager:product-thinking"], 0.13),
      signal("analytical-thinking", "AnalyticalThinking", "Analytical thinking", hiringManagerEvaluation.decisionQuality.score.score, ["manager:decision-quality"], 0.12),
      signal("tradeoff-reasoning", "TradeoffReasoning", "Trade-off reasoning", average([hiringManagerEvaluation.productThinking.score.score, hiringManagerEvaluation.decisionQuality.score.score]), ["manager:decision-quality"], 0.12),
      signal("execution-reasoning", "ExecutionReasoning", "Execution reasoning", hiringManagerEvaluation.execution.score.score, ["manager:execution"], 0.13),
      signal("stakeholder-management", "StakeholderManagement", "Stakeholder management", hiringManagerEvaluation.crossFunctionalCollaboration.score.score, ["manager:collaboration"], 0.12),
      signal("leadership-validation", "LeadershipValidation", "Leadership validation", hiringManagerEvaluation.leadership.score.score, ["manager:leadership"], 0.13)
    ]);
    const score = scoreFor("Interview Evaluation", signals);
    const confidence = confidenceFromScore(score.overallScore, "Interview confidence is derived from deterministic validation dimensions.");
    const partial = immutableRecord({
      artifactKind: "InterviewEvaluation" as const,
      evaluationId: `interview-evaluation:${hiringManagerEvaluation.evaluationId}`,
      hiringManagerEvaluationId: hiringManagerEvaluation.evaluationId,
      decisionTrace: hiringManagerEvaluation.decisionTrace,
      assumptionsValidated: hiringManagerEvaluation.spendInterviewTime && score.overallScore >= Math.min(managerScore, 75),
      behavioralEvidence: signals[0],
      communication: signals[1],
      productSense: signals[2],
      analyticalThinking: signals[3],
      tradeoffReasoning: signals[4],
      executionReasoning: signals[5],
      stakeholderManagement: signals[6],
      leadershipValidation: signals[7],
      score,
      gaps: gapsFor(signals),
      recommendations: createHiringRecommendations(signals),
      confidence,
      confidenceFactors: immutableArray(signals.map((item) => createConfidenceFactor({
        factor: item.area,
        value: item.score.score / 100,
        weight: item.score.weight,
        rationale: item.rankingReason.statement
      })))
    });
    const built = this.artifactBuilder.build(partial);

    return immutableRecord({ ...partial, ...built });
  }
}
