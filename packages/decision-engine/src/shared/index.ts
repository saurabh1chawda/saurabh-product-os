import type { Confidence, Ranking, Reason, Recommendation, RecommendationScore } from "@career-companion/career-intelligence";

export type DecisionReferenceType =
  | "identity"
  | "competency"
  | "evidence"
  | "story"
  | "metric"
  | "resume"
  | "portfolio"
  | "pipeline"
  | "other";

export interface DecisionReference {
  readonly referenceId: string;
  readonly referenceType: DecisionReferenceType;
  readonly label?: string;
}

export interface DecisionReason extends Reason {
  readonly references: readonly DecisionReference[];
}

export interface PipelineMetadata {
  readonly pipelineName: string;
  readonly executionTimestamp: string;
  readonly correlationId?: string;
  readonly actor?: string;
}

export interface ExecutionSummary {
  readonly pipelineName: string;
  readonly stepCount: number;
  readonly recommendationCount: number;
  readonly highestScore?: RecommendationScore;
  readonly highestConfidence?: Confidence;
}

export interface RecommendationBundle<TRecommendation = unknown> {
  readonly recommendations: readonly Recommendation<TRecommendation>[];
  readonly rankings: readonly Ranking<TRecommendation>[];
  readonly reasons: readonly DecisionReason[];
}

export function createDecisionReference(input: DecisionReference): DecisionReference {
  return Object.freeze({ ...input });
}

export function createDecisionReason(input: DecisionReason): DecisionReason {
  return Object.freeze({
    ...input,
    supportingReferenceIds: Object.freeze([...input.supportingReferenceIds]),
    references: Object.freeze([...input.references])
  });
}

export function createRecommendationBundle<TRecommendation>(input: {
  readonly recommendations?: readonly Recommendation<TRecommendation>[];
  readonly rankings?: readonly Ranking<TRecommendation>[];
  readonly reasons?: readonly DecisionReason[];
}): RecommendationBundle<TRecommendation> {
  return Object.freeze({
    recommendations: Object.freeze([...(input.recommendations ?? [])]),
    rankings: Object.freeze([...(input.rankings ?? [])]),
    reasons: Object.freeze([...(input.reasons ?? [])])
  });
}
