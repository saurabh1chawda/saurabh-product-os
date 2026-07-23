import type { DecisionReason, DecisionReference, TradeoffId } from "../shared";
import { immutableArray, immutableRecord } from "../shared";

export type TradeoffCategory = "positioning" | "evidence" | "scope" | "risk" | "time" | "quality" | "emphasis" | "other";

export interface TradeoffImpact {
  readonly dimension: string;
  readonly direction: "increase" | "decrease" | "neutral";
  readonly description: string;
  readonly references: readonly DecisionReference[];
}

export interface Tradeoff {
  readonly id: TradeoffId;
  readonly category: TradeoffCategory;
  readonly description: string;
  readonly positiveImpacts: readonly TradeoffImpact[];
  readonly negativeImpacts: readonly TradeoffImpact[];
  readonly reasons: readonly DecisionReason[];
}

export interface TradeoffAnalysis {
  readonly tradeoffs: readonly Tradeoff[];
  readonly summary: string;
}

export function createTradeoffAnalysis(input: TradeoffAnalysis): TradeoffAnalysis {
  return immutableRecord({
    ...input,
    tradeoffs: immutableArray(input.tradeoffs)
  });
}
