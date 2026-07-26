import { createScoreDimension } from "@career-companion/product-intelligence";
import { HiringDecisionArtifactBuilder } from "../builders";
import type { HiringDecision, HiringDecisionOutcome, InterviewEvaluation } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord, priorityFromScore, uniqueSorted } from "../shared";

export class HiringDecisionAnalyzer {
  private readonly artifactBuilder = new HiringDecisionArtifactBuilder();

  analyze(interviewEvaluation: InterviewEvaluation): HiringDecision {
    const stageScores = immutableArray([
      createScoreDimension({ dimension: "Interview Evaluation", score: interviewEvaluation.score.overallScore, weight: 1, rationale: "Interview validation outcome from the immediate predecessor." })
    ]);
    const aggregate = interviewEvaluation.score.overallScore;
    const decision = outcomeFor(aggregate, interviewEvaluation);
    const allSignals = [...interviewEvaluation.score.dimensions];
    const strongestSignals = uniqueSorted(allSignals.filter((dimension) => dimension.score >= 75).map((dimension) => dimension.dimension)).slice(0, 5);
    const weakestSignals = uniqueSorted(allSignals.filter((dimension) => dimension.score < 70).map((dimension) => dimension.dimension)).slice(0, 5);
    const terminationStage = terminationStageFor(interviewEvaluation);
    const partial = immutableRecord({
      artifactKind: "HiringDecision" as const,
      decisionId: `hiring-decision:${interviewEvaluation.evaluationId}`,
      interviewEvaluation,
      decision,
      confidence: confidenceFromScore(aggregate, "Hiring decision confidence is derived from all governed hiring stages."),
      supportingEvidence: strongestSignals,
      contradictingEvidence: weakestSignals,
      pipelineSummary: immutableRecord({
        stageScores,
        strongestSignals,
        weakestSignals,
        terminationStage
      }),
      decisionTrace: interviewEvaluation.decisionTrace,
      recommendationPriority: terminationStage ? "Critical" as const : priorityFromScore(aggregate),
      recommendations: immutableArray([...interviewEvaluation.recommendations].sort((left, right) => priorityRank(left.priority) - priorityRank(right.priority)))
    });
    const built = this.artifactBuilder.build(partial);

    return immutableRecord({ ...partial, ...built });
  }
}

function outcomeFor(
  aggregate: number,
  interviewEvaluation: InterviewEvaluation
): HiringDecisionOutcome {
  if (!interviewEvaluation.assumptionsValidated) return aggregate >= 65 ? "LeanHire" : "Hold";
  if (aggregate >= 85) return "StrongHire";
  if (aggregate >= 75) return "Hire";
  if (aggregate >= 65) return "LeanHire";
  if (aggregate >= 50) return "Hold";
  return "NoHire";
}

function terminationStageFor(interviewEvaluation: InterviewEvaluation) {
  if (!interviewEvaluation.assumptionsValidated) return "InterviewEvaluation" as const;
  return undefined;
}

function priorityRank(priority: HiringDecision["recommendationPriority"]): number {
  const rank = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  return rank[priority];
}
