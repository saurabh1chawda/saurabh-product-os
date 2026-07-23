import type { Confidence, Reason, RecommendationScore } from "@career-companion/career-intelligence";
import type { PipelineMetadata } from "../shared";

export interface DecisionTraceStep {
  readonly stepName: string;
  readonly inputSummary: string;
  readonly outputSummary: string;
  readonly score?: RecommendationScore;
  readonly confidence?: Confidence;
  readonly reasons: readonly Reason[];
}

export interface DecisionTrace {
  readonly pipeline: string;
  readonly stepsExecuted: readonly DecisionTraceStep[];
  readonly decisionInputs: readonly string[];
  readonly recommendations: readonly string[];
  readonly scores: readonly RecommendationScore[];
  readonly confidence: readonly Confidence[];
  readonly reasons: readonly Reason[];
  readonly executionTimestamp: string;
}

export function createDecisionTrace(input: {
  readonly metadata: PipelineMetadata;
  readonly stepsExecuted: readonly DecisionTraceStep[];
  readonly decisionInputs: readonly string[];
  readonly recommendations: readonly string[];
}): DecisionTrace {
  const reasons = input.stepsExecuted.flatMap((step) => step.reasons);

  return Object.freeze({
    pipeline: input.metadata.pipelineName,
    stepsExecuted: Object.freeze([...input.stepsExecuted]),
    decisionInputs: Object.freeze([...input.decisionInputs]),
    recommendations: Object.freeze([...input.recommendations]),
    scores: Object.freeze(input.stepsExecuted.flatMap((step) => step.score === undefined ? [] : [step.score])),
    confidence: Object.freeze(input.stepsExecuted.flatMap((step) => step.confidence === undefined ? [] : [step.confidence])),
    reasons: Object.freeze(reasons),
    executionTimestamp: input.metadata.executionTimestamp
  });
}

export function createTraceStep(input: DecisionTraceStep): DecisionTraceStep {
  return Object.freeze({
    ...input,
    reasons: Object.freeze([...input.reasons])
  });
}
