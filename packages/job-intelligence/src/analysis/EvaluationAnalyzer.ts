import {
  createRankingReason,
  createScoreWeight,
  type RecommendationPriority
} from "@career-companion/product-intelligence";
import { EvaluationFrameworkArtifactBuilder } from "../builders";
import type { EvaluationDimension, EvaluationFramework, HiringModel, JobModel } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord } from "../shared";

export class EvaluationAnalyzer {
  private readonly artifactBuilder = new EvaluationFrameworkArtifactBuilder();

  analyze(jobModel: JobModel, hiringModel: HiringModel): EvaluationFramework {
    const dimensions = immutableArray(jobModel.requiredCompetencies.map((competency, index) => {
      const weight = createScoreWeight({
        key: competency.competencyId,
        weight: competency.weight,
        rationale: `Weight derived from ${competency.name} requirement.`
      });
      return immutableRecord({
        dimensionId: `dimension:${competency.competencyId}`,
        dimension: competency.name,
        weight: weight.weight,
        expectedEvidence: immutableArray(hiringModel.evidenceExpectations.filter((expectation) => competency.evidenceExpectationIds.includes(expectation.expectationId))),
        minimumExpectation: competency.required ? "Candidate must show validated evidence." : "Candidate should show supporting evidence.",
        recommendationPriority: competency.required ? "High" : "Medium" as RecommendationPriority,
        confidence: confidenceFromScore(80 - index * 3, "Evaluation dimension is derived from required competencies and hiring expectations."),
        gapSeverity: competency.required ? "high" : "medium",
        rankingReason: createRankingReason({
          code: `dimension:${competency.competencyId}`,
          statement: "Evaluation dimension is ordered by requirement weight and source signal strength.",
          weight: competency.weight
        })
      } satisfies EvaluationDimension);
    }));
    const totalWeight = dimensions.reduce((sum, dimension) => sum + dimension.weight, 0);
    const partial = immutableRecord({
      artifactKind: "EvaluationFramework" as const,
      jobModelId: jobModel.source.jobDescriptionId,
      hiringModelId: `hiring-model:${jobModel.source.jobDescriptionId}`,
      dimensions,
      totalWeight,
      scoringPolicyId: "job-intelligence:evaluation-framework:v1"
    });
    const built = this.artifactBuilder.build(partial, jobModel.source);

    return immutableRecord({ ...partial, ...built });
  }
}
