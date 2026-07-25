import { createScoreDimension } from "@career-companion/product-intelligence";
import { HiringDecisionArtifactBuilder } from "../builders";
import type { HiringDecision, HiringDecisionOutcome, InterviewEvaluation } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord, priorityFromScore, uniqueSorted } from "../shared";

export class HiringDecisionAnalyzer {
  private readonly artifactBuilder = new HiringDecisionArtifactBuilder();

  analyze(input: {
    readonly pipeline: HiringDecision["pipeline"];
    readonly recruiterEvaluation: HiringDecision["recruiterEvaluation"];
    readonly hiringManagerEvaluation: HiringDecision["hiringManagerEvaluation"];
    readonly interviewEvaluation: InterviewEvaluation;
  }): HiringDecision {
    const stageScores = immutableArray([
      createScoreDimension({ dimension: "Recruiter Evaluation", score: input.recruiterEvaluation.score.overallScore, weight: 0.25, rationale: "Recruiter screen outcome." }),
      createScoreDimension({ dimension: "Hiring Manager Evaluation", score: input.hiringManagerEvaluation.score.overallScore, weight: 0.35, rationale: "Hiring manager screen outcome." }),
      createScoreDimension({ dimension: "Interview Evaluation", score: input.interviewEvaluation.score.overallScore, weight: 0.4, rationale: "Interview validation outcome." })
    ]);
    const aggregate = Math.round(
      (input.recruiterEvaluation.score.overallScore * 0.25) +
      (input.hiringManagerEvaluation.score.overallScore * 0.35) +
      (input.interviewEvaluation.score.overallScore * 0.4)
    );
    const decision = outcomeFor(aggregate, input);
    const allSignals = [
      ...input.recruiterEvaluation.score.dimensions,
      ...input.hiringManagerEvaluation.score.dimensions,
      ...input.interviewEvaluation.score.dimensions
    ];
    const strongestSignals = uniqueSorted(allSignals.filter((dimension) => dimension.score >= 75).map((dimension) => dimension.dimension)).slice(0, 5);
    const weakestSignals = uniqueSorted(allSignals.filter((dimension) => dimension.score < 70).map((dimension) => dimension.dimension)).slice(0, 5);
    const terminationStage = terminationStageFor(input);
    const partial = immutableRecord({
      artifactKind: "HiringDecision" as const,
      decisionId: `hiring-decision:${input.interviewEvaluation.evaluationId}`,
      pipeline: input.pipeline,
      recruiterEvaluation: input.recruiterEvaluation,
      hiringManagerEvaluation: input.hiringManagerEvaluation,
      interviewEvaluation: input.interviewEvaluation,
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
      decisionTrace: input.pipeline.decisionTrace,
      recommendationPriority: terminationStage ? "Critical" as const : priorityFromScore(aggregate),
      recommendations: immutableArray([
        ...input.recruiterEvaluation.recommendations,
        ...input.hiringManagerEvaluation.recommendations,
        ...input.interviewEvaluation.recommendations
      ].sort((left, right) => priorityRank(left.priority) - priorityRank(right.priority)))
    });
    const built = this.artifactBuilder.build(partial);

    return immutableRecord({ ...partial, ...built });
  }
}

function outcomeFor(
  aggregate: number,
  input: {
    readonly recruiterEvaluation: HiringDecision["recruiterEvaluation"];
    readonly hiringManagerEvaluation: HiringDecision["hiringManagerEvaluation"];
    readonly interviewEvaluation: InterviewEvaluation;
  }
): HiringDecisionOutcome {
  if (!input.recruiterEvaluation.proceedToHiringManager) return "NoHire";
  if (!input.hiringManagerEvaluation.spendInterviewTime) return "Hold";
  if (!input.interviewEvaluation.assumptionsValidated) return aggregate >= 65 ? "LeanHire" : "Hold";
  if (aggregate >= 85) return "StrongHire";
  if (aggregate >= 75) return "Hire";
  if (aggregate >= 65) return "LeanHire";
  if (aggregate >= 50) return "Hold";
  return "NoHire";
}

function terminationStageFor(input: {
  readonly recruiterEvaluation: HiringDecision["recruiterEvaluation"];
  readonly hiringManagerEvaluation: HiringDecision["hiringManagerEvaluation"];
  readonly interviewEvaluation: InterviewEvaluation;
}) {
  if (!input.recruiterEvaluation.proceedToHiringManager) return "RecruiterEvaluation" as const;
  if (!input.hiringManagerEvaluation.spendInterviewTime) return "HiringManagerEvaluation" as const;
  if (!input.interviewEvaluation.assumptionsValidated) return "InterviewEvaluation" as const;
  return undefined;
}

function priorityRank(priority: HiringDecision["recommendationPriority"]): number {
  const rank = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  return rank[priority];
}
