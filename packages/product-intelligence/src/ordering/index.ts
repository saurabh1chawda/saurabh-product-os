import type { ComparisonResult, OrderingDirection } from "../models";
import { immutableArray, immutableRecord } from "../shared";

export interface OrderingKey {
  readonly key: string;
  readonly direction: OrderingDirection;
  readonly priority: number;
}

export interface OrderingRule<TItem = unknown> {
  readonly ruleId: string;
  readonly key: OrderingKey;
  readonly describe: (item: TItem) => string | number;
}

export interface OrderingResult<TItem = unknown> {
  readonly orderedItems: readonly TItem[];
  readonly appliedRules: readonly OrderingKey[];
  readonly stable: boolean;
}

export interface OrderingSpecification<TItem = unknown> {
  readonly specificationId: string;
  readonly rules: readonly OrderingRule<TItem>[];
  readonly tieBreakRules: readonly OrderingKey[];
}

export interface StableOrdering<TItem = unknown> {
  readonly order: (items: readonly TItem[], specification: OrderingSpecification<TItem>) => OrderingResult<TItem>;
}

export interface CanonicalOrdering<TItem = unknown> extends StableOrdering<TItem> {
  readonly compare: (left: TItem, right: TItem, specification: OrderingSpecification<TItem>) => ComparisonResult;
}

export function createOrderingKey(input: OrderingKey): OrderingKey {
  return immutableRecord(input);
}

export function createOrderingSpecification<TItem>(input: OrderingSpecification<TItem>): OrderingSpecification<TItem> {
  return immutableRecord({
    ...input,
    rules: immutableArray(input.rules),
    tieBreakRules: immutableArray(input.tieBreakRules)
  });
}

export function createOrderingResult<TItem>(input: OrderingResult<TItem>): OrderingResult<TItem> {
  return immutableRecord({
    ...input,
    orderedItems: immutableArray(input.orderedItems),
    appliedRules: immutableArray(input.appliedRules)
  });
}
