import { DecisionReportArtifactBuilder } from "../builders";
import type { DecisionAssessment, DecisionContext, DecisionPlan, DecisionReport, DecisionReportSummary, DecisionStrategy } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord } from "../shared";

export class DecisionReportAnalyzer {
  private readonly artifactBuilder = new DecisionReportArtifactBuilder();

  analyze(input: {
    readonly context: DecisionContext;
    readonly assessment: DecisionAssessment;
    readonly strategy: DecisionStrategy;
    readonly plan: DecisionPlan;
  }): DecisionReport {
    const summary: DecisionReportSummary = immutableRecord({
      headline: "Deterministic career decision report",
      readinessBand: input.assessment.overallReadiness.band,
      topStrengths: immutableArray(input.assessment.strengthAreas.slice(0, 3).map((finding) => finding.label)),
      topRisks: immutableArray(input.assessment.riskAreas.slice(0, 3).map((finding) => finding.label)),
      nextActions: immutableArray(input.plan.actions.slice(0, 3).map((action) => action.actionId))
    });
    const confidence = confidenceFromScore(input.assessment.overallReadiness.overallScore, "Report confidence follows assessment readiness.");
    const partial = immutableRecord({
      artifactKind: "DecisionReport" as const,
      reportId: `decision-report:${input.context.contextId}`,
      context: input.context,
      assessment: input.assessment,
      strategy: input.strategy,
      plan: input.plan,
      summary,
      confidence,
      recommendations: input.plan.recommendations,
      decisionTrace: input.context.decisionTrace
    });
    const built = this.artifactBuilder.build(partial);

    return immutableRecord({ ...partial, ...built });
  }
}
