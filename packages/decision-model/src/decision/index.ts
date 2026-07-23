import type { DecisionExplanation } from "../explanation";
import type { Recommendation } from "../recommendation";
import type {
  DecisionConfidence,
  DecisionId,
  DecisionLifecycleStatus,
  DecisionMetadata,
  DecisionReason,
  DecisionReference,
  DecisionScore,
  DecisionSummary
} from "../shared";
import { immutableArray, immutableRecord } from "../shared";

export type DecisionOutcome = "recommended" | "not-recommended" | "deferred" | "requires-review" | "approved" | "rejected";

export interface Decision {
  readonly id: DecisionId;
  readonly title: string;
  readonly question: string;
  readonly outcome: DecisionOutcome;
  readonly status: DecisionLifecycleStatus;
  readonly score: DecisionScore;
  readonly confidence: DecisionConfidence;
  readonly reasons: readonly DecisionReason[];
  readonly references: readonly DecisionReference[];
  readonly recommendations: readonly Recommendation[];
  readonly explanation: DecisionExplanation;
  readonly summary: DecisionSummary;
  readonly metadata: DecisionMetadata;
}

export function createDecision(input: Decision): Decision {
  return immutableRecord({
    ...input,
    reasons: immutableArray(input.reasons),
    references: immutableArray(input.references),
    recommendations: immutableArray(input.recommendations)
  });
}
