import type { DecisionConfidence, DecisionReason, DecisionReference, DecisionScore, AlternativeId } from "../shared";
import { immutableArray, immutableRecord } from "../shared";

export type AlternativeStatus = "available" | "preferred" | "rejected" | "deferred";

export interface AlternativeOption {
  readonly id: AlternativeId;
  readonly label: string;
  readonly description: string;
  readonly status: AlternativeStatus;
  readonly references: readonly DecisionReference[];
}

export interface Alternative {
  readonly id: AlternativeId;
  readonly option: AlternativeOption;
  readonly score?: DecisionScore;
  readonly confidence?: DecisionConfidence;
  readonly reasons: readonly DecisionReason[];
}

export interface AlternativeComparison {
  readonly leftAlternativeId: AlternativeId;
  readonly rightAlternativeId: AlternativeId;
  readonly comparison: "stronger" | "weaker" | "equivalent" | "incomparable";
  readonly reasons: readonly DecisionReason[];
}

export interface AlternativeRanking {
  readonly alternativeId: AlternativeId;
  readonly rank: number;
  readonly score: DecisionScore;
  readonly confidence: DecisionConfidence;
  readonly reasons: readonly DecisionReason[];
}

export function createAlternative(input: Alternative): Alternative {
  return immutableRecord({
    ...input,
    reasons: immutableArray(input.reasons)
  });
}
