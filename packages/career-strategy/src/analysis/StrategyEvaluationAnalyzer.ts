import { createCareerStrategyExplanationSummary } from "../explainability";
import type { StrategyEvaluation, StrategyOptions } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord } from "../shared";
import { evaluationFor } from "./scoring";

export class StrategyEvaluationAnalyzer {
  analyze(options: StrategyOptions): StrategyEvaluation {
    const gapCount = options.gaps.filter((gap) => gap.severity !== "low").length;
    const evaluations = immutableArray(options.options.map((item) => evaluationFor(item, gapCount, options.opportunityDecision.scoreSummary.overallScore)));
    const evaluationId = `strategy-evaluation:${options.optionsId}`;
    const confidenceScore = Math.round(evaluations.reduce((sum, item) => sum + item.confidence.value * 100, 0) / evaluations.length);

    return immutableRecord({
      artifactKind: "StrategyEvaluation" as const,
      evaluationId,
      optionsId: options.optionsId,
      evaluations,
      opportunityDecision: options.opportunityDecision,
      decisionReport: options.decisionReport,
      gaps: options.gaps,
      policy: options.policy,
      assumptions: options.assumptions,
      constraints: options.constraints,
      traceId: options.traceId,
      confidence: confidenceFromScore(confidenceScore, "StrategyEvaluation confidence follows deterministic option evaluations."),
      explanationSummary: createCareerStrategyExplanationSummary({
        decisionId: evaluationId,
        title: "Strategy Evaluation",
        outcome: "BalancedGrowth",
        confidenceScore,
        evidenceReferenceIds: [options.decisionReport.artifact.artifactId, options.opportunityDecision.artifact.artifactId],
        reasonCodes: evaluations.map((item) => item.kind),
        assumptions: options.assumptions,
        constraints: options.constraints
      })
    });
  }
}
