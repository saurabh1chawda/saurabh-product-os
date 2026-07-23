import type { DecisionExplanation } from "../explanation";
import type {
  DecisionConfidence,
  DecisionLifecycleStatus,
  DecisionMetadata,
  DecisionReason,
  DecisionReference,
  DecisionScore,
  RecommendationId
} from "../shared";
import { immutableArray, immutableRecord } from "../shared";

export type RecommendationType = "select" | "reject" | "rank" | "defer" | "review" | "approve";

export interface Recommendation {
  readonly id: RecommendationId;
  readonly recommendationType: RecommendationType;
  readonly title: string;
  readonly statement: string;
  readonly status: DecisionLifecycleStatus;
  readonly score: DecisionScore;
  readonly confidence: DecisionConfidence;
  readonly reasons: readonly DecisionReason[];
  readonly references: readonly DecisionReference[];
  readonly explanation?: DecisionExplanation;
  readonly metadata: DecisionMetadata;
}

export function createRecommendation(input: Recommendation): Recommendation {
  return immutableRecord({
    ...input,
    reasons: immutableArray(input.reasons),
    references: immutableArray(input.references)
  });
}
