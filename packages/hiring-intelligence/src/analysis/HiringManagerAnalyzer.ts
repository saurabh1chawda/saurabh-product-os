import { createConfidenceFactor } from "@career-companion/product-intelligence";
import { HiringManagerArtifactBuilder } from "../builders";
import type { HiringManagerEvaluation, RecruiterEvaluation } from "../models";
import { createHiringRecommendations } from "../recommendations";
import { average, confidenceFromScore, immutableArray, immutableRecord } from "../shared";
import { gapsFor, scoreFor, signal } from "./RecruiterAnalyzer";

export class HiringManagerAnalyzer {
  private readonly artifactBuilder = new HiringManagerArtifactBuilder();

  analyze(recruiterEvaluation: RecruiterEvaluation): HiringManagerEvaluation {
    const recruiterScore = recruiterEvaluation.score.overallScore;
    const signals = immutableArray([
      signal("product-thinking", "ProductThinking", "Product thinking", average([recruiterEvaluation.transferability.score.score, recruiterScore]), ["recruiter:transferability"], 0.12),
      signal("execution", "Execution", "Execution", average([recruiterEvaluation.businessImpact.score.score, recruiterScore]), ["recruiter:business-impact"], 0.12),
      signal("manager-business-impact", "BusinessImpact", "Business impact", recruiterEvaluation.businessImpact.score.score, ["recruiter:business-impact"], 0.12),
      signal("customer-obsession", "CustomerObsession", "Customer obsession", recruiterEvaluation.transferability.score.score, ["recruiter:transferability"], 0.1),
      signal("technical-depth", "TechnicalDepth", "Technical depth", average([recruiterEvaluation.transferability.score.score, recruiterEvaluation.evidenceQuality.score.score]), ["recruiter:evidence-quality"], 0.1),
      signal("leadership", "Leadership", "Leadership", recruiterEvaluation.careerProgression.score.score, ["recruiter:career-progression"], 0.12),
      signal("collaboration", "Collaboration", "Cross-functional collaboration", recruiterEvaluation.communication.score.score, ["recruiter:communication"], 0.1),
      signal("decision-quality", "DecisionQuality", "Decision quality", average([recruiterEvaluation.evidenceQuality.score.score, recruiterEvaluation.riskSignals.score.score]), ["recruiter:risk-signals"], 0.11),
      signal("ownership", "Ownership", "Ownership", average([recruiterEvaluation.stability.score.score, recruiterEvaluation.careerProgression.score.score]), ["recruiter:stability"], 0.11)
    ]);
    const score = scoreFor("Hiring Manager Evaluation", signals);
    const confidence = confidenceFromScore(score.overallScore, "Hiring manager confidence is derived from deterministic manager dimensions.");
    const partial = immutableRecord({
      artifactKind: "HiringManagerEvaluation" as const,
      evaluationId: `hiring-manager-evaluation:${recruiterEvaluation.evaluationId}`,
      recruiterEvaluationId: recruiterEvaluation.evaluationId,
      decisionTrace: recruiterEvaluation.decisionTrace,
      spendInterviewTime: recruiterEvaluation.proceedToHiringManager && score.overallScore >= 75,
      productThinking: signals[0],
      execution: signals[1],
      businessImpact: signals[2],
      customerObsession: signals[3],
      technicalDepth: signals[4],
      leadership: signals[5],
      crossFunctionalCollaboration: signals[6],
      decisionQuality: signals[7],
      ownership: signals[8],
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
