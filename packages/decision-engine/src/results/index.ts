import type { Confidence, RecommendationScore } from "@career-companion/career-intelligence";
import type { DecisionTrace } from "../trace";
import type { ExecutionSummary, RecommendationBundle } from "../shared";

export interface DecisionScore {
  readonly value: RecommendationScore;
}

export interface DecisionConfidence {
  readonly value: Confidence;
}

export interface DecisionSummary extends ExecutionSummary {
  readonly status: "completed" | "failed";
}

export interface DecisionResult<TOutput = unknown> {
  readonly pipelineName: string;
  readonly output: TOutput;
  readonly trace: DecisionTrace;
  readonly summary: DecisionSummary;
  readonly recommendationBundle: RecommendationBundle;
}

export function createDecisionResult<TOutput>(input: DecisionResult<TOutput>): DecisionResult<TOutput> {
  return Object.freeze({
    ...input,
    summary: Object.freeze({ ...input.summary }),
    recommendationBundle: input.recommendationBundle
  });
}
