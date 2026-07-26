import { ATSPipelineArtifactBuilder } from "../builders";
import type { ATSPipeline, ATSPipelineInput, ATSStageDefinition } from "../models";
import { defaultMatchingPolicy, defaultParsingPolicy, defaultScreeningPolicy } from "../policies";
import { confidenceFromScore, immutableArray, immutableRecord } from "../shared";

export class ATSPipelineAnalyzer {
  private readonly artifactBuilder = new ATSPipelineArtifactBuilder();

  analyze(input: ATSPipelineInput): ATSPipeline {
    const sourceArtifactIds = immutableArray([
      input.resume.artifact.artifactId,
      input.jobModel.artifact.artifactId,
      input.hiringModel.artifact.artifactId,
      input.evaluationFramework.artifact.artifactId
    ]);
    const sequence = stageSequence();
    const partial = immutableRecord({
      artifactKind: "ATSPipeline" as const,
      pipelineId: `ats-pipeline:${input.resume.resumeId}:${input.jobModel.source.jobDescriptionId}`,
      resume: input.resume,
      jobContext: immutableRecord({
        jobModel: input.jobModel,
        hiringModel: input.hiringModel,
        evaluationFramework: input.evaluationFramework
      }),
      sourceArtifactIds,
      currentStage: "ATSParsing" as const,
      sequence,
      entryCriteria: sequence[1]?.entryCriteria ?? immutableArray([]),
      exitCriteria: sequence[sequence.length - 1]?.exitCriteria ?? immutableArray([]),
      stageDependencies: sequence,
      parsingPolicy: defaultParsingPolicy(),
      matchingPolicy: defaultMatchingPolicy(),
      screeningPolicy: defaultScreeningPolicy(input.screeningPolicy),
      screeningConstraints: immutableArray([
        "ATSPipeline is the only multi-input ATS aggregation boundary.",
        "Protected and sensitive characteristics never influence ATS decisions.",
        "Later ATS stages consume only their immediate predecessor."
      ]),
      confidence: confidenceFromScore(100, "ATS pipeline aggregates canonical Resume and Job Intelligence artifacts."),
      decisionTrace: input.decisionTrace
    });
    const built = this.artifactBuilder.build(partial);

    return immutableRecord({ ...partial, ...built });
  }
}

function stageSequence(): readonly ATSStageDefinition[] {
  return immutableArray([
    stage("ATSPipeline", 0, [], ["Canonical resume and job artifacts are available."], []),
    stage("ATSParsing", 1, ["ATSPipeline is available."], ["Deterministic resume projection is available."], ["ATSPipeline"]),
    stage("ATSMatching", 2, ["ATSParsing is available."], ["Requirement coverage is available."], ["ATSParsing"]),
    stage("ATSScreening", 3, ["ATSMatching is available."], ["Screening gates are evaluated."], ["ATSMatching"]),
    stage("ATSDecision", 4, ["ATSScreening is available."], ["ATS screening outcome is selected."], ["ATSScreening"])
  ]);
}

function stage(stageName: ATSStageDefinition["stage"], order: number, entryCriteria: readonly string[], exitCriteria: readonly string[], dependencies: readonly ATSStageDefinition["stage"][]): ATSStageDefinition {
  return immutableRecord({
    stage: stageName,
    order,
    entryCriteria: immutableArray(entryCriteria),
    exitCriteria: immutableArray(exitCriteria),
    dependencies: immutableArray(dependencies)
  });
}
