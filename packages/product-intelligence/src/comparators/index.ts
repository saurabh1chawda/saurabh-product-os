import type { ComparisonResult, RankingReason } from "../models";
import { immutableArray, immutableRecord } from "../shared";

export interface Comparator<TItem = unknown> {
  readonly compare: (left: TItem, right: TItem) => ComparisonResult;
}

export interface ComparisonCriterion<TItem = unknown> {
  readonly criterionId: string;
  readonly description: string;
  readonly weight?: number;
  readonly comparator: Comparator<TItem>;
}

export interface TieBreakRule<TItem = unknown> {
  readonly ruleId: string;
  readonly priority: number;
  readonly comparator: Comparator<TItem>;
  readonly reason: RankingReason;
}

export interface CompositeComparator<TItem = unknown> extends Comparator<TItem> {
  readonly criteria: readonly ComparisonCriterion<TItem>[];
  readonly tieBreakRules: readonly TieBreakRule<TItem>[];
}

export function createComparisonCriterion<TItem>(input: ComparisonCriterion<TItem>): ComparisonCriterion<TItem> {
  return immutableRecord(input);
}

export function createTieBreakRule<TItem>(input: TieBreakRule<TItem>): TieBreakRule<TItem> {
  return immutableRecord(input);
}

export function createCompositeComparator<TItem>(input: CompositeComparator<TItem>): CompositeComparator<TItem> {
  return immutableRecord({
    ...input,
    criteria: immutableArray(input.criteria),
    tieBreakRules: immutableArray(input.tieBreakRules)
  });
}
