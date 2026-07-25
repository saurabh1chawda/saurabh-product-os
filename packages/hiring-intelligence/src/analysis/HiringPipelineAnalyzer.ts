import { HiringPipelineArtifactBuilder } from "../builders";
import type { HiringPipeline, HiringStageDefinition } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord } from "../shared";
import type { DecisionReport } from "@career-companion/career-decision";

export class HiringPipelineAnalyzer {
  private readonly artifactBuilder = new HiringPipelineArtifactBuilder();

  analyze(decisionReport: DecisionReport): HiringPipeline {
    const sequence = pipelineSequence();
    const partial = immutableRecord({
      artifactKind: "HiringPipeline" as const,
      pipelineId: `hiring-pipeline:${decisionReport.reportId}`,
      decisionReport,
      currentStage: "RecruiterEvaluation" as const,
      sequence,
      entryCriteria: sequence[1]?.entryCriteria ?? immutableArray([]),
      exitCriteria: sequence[sequence.length - 1]?.exitCriteria ?? immutableArray([]),
      stageDependencies: sequence,
      evaluationConstraints: immutableArray([
        "Stages consume only the immediately previous governed artifact.",
        "Hiring Intelligence does not optimize candidate materials.",
        "Hiring Decision is not formed until interview validation is complete."
      ]),
      pipelineConfidence: confidenceFromScore(Math.round(decisionReport.confidence.value * 100), "Pipeline confidence is inherited from the Career Decision report."),
      decisionTrace: decisionReport.decisionTrace
    });
    const built = this.artifactBuilder.build(partial);

    return immutableRecord({ ...partial, ...built });
  }
}

function pipelineSequence(): readonly HiringStageDefinition[] {
  return immutableArray([
    stage("CareerDecision", 0, [], ["Decision report is available."], [], ["Career Decision is authoritative input."]),
    stage("RecruiterEvaluation", 1, ["Decision report is available."], ["Recruiter proceed signal is determined."], ["CareerDecision"], ["No interview performance is evaluated."]),
    stage("HiringManagerEvaluation", 2, ["Recruiter evaluation is complete."], ["Manager interview-time signal is determined."], ["RecruiterEvaluation"], ["No interview evidence is scored."]),
    stage("InterviewEvaluation", 3, ["Hiring manager evaluation is complete."], ["Interview assumptions are validated."], ["HiringManagerEvaluation"], ["No final hiring recommendation is issued."]),
    stage("HiringDecision", 4, ["Interview evaluation is complete."], ["Hiring outcome is determined."], ["InterviewEvaluation"], ["Decision aggregates all prior stages."])
  ]);
}

function stage(
  stageName: HiringStageDefinition["stage"],
  order: number,
  entryCriteria: readonly string[],
  exitCriteria: readonly string[],
  dependencies: readonly HiringStageDefinition["stage"][],
  constraints: readonly string[]
): HiringStageDefinition {
  return immutableRecord({
    stage: stageName,
    order,
    entryCriteria: immutableArray(entryCriteria),
    exitCriteria: immutableArray(exitCriteria),
    dependencies: immutableArray(dependencies),
    constraints: immutableArray(constraints)
  });
}
