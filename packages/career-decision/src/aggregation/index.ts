import { DecisionContextArtifactBuilder, sourceArtifactIds } from "../builders";
import type { DecisionContext, ProductIntelligenceSet } from "../models";
import { immutableRecord } from "../shared";

export class IntelligenceAggregator {
  private readonly artifactBuilder = new DecisionContextArtifactBuilder();

  aggregate(input: ProductIntelligenceSet): DecisionContext {
    const contextId = `decision-context:${input.jobMatchReport.candidateId}:${input.jobModel.source.jobDescriptionId}`;
    const partial = immutableRecord({
      artifactKind: "DecisionContext" as const,
      contextId,
      resume: input.resume,
      portfolio: input.portfolio,
      interview: input.interview,
      jobModel: input.jobModel,
      hiringModel: input.hiringModel,
      evaluationFramework: input.evaluationFramework,
      jobMatchReport: input.jobMatchReport,
      sourceArtifactIds: sourceArtifactIds(input),
      decisionTrace: input.decisionTrace
    });
    const built = this.artifactBuilder.build(partial);

    return immutableRecord({ ...partial, ...built });
  }
}
