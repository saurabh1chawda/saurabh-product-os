import type { RetrievalField } from "../shared";

export type ComparisonOperator =
  | "equals"
  | "not-equals"
  | "greater-than"
  | "greater-than-or-equal"
  | "less-than"
  | "less-than-or-equal"
  | "contains"
  | "starts-with"
  | "ends-with"
  | "in"
  | "not-in"
  | "exists";

export type LogicalOperator = "and" | "or" | "not";

export interface Filter {
  readonly field: RetrievalField;
  readonly operator: ComparisonOperator;
  readonly value?: unknown;
}

export interface RangeFilter {
  readonly field: RetrievalField;
  readonly minimum?: string | number;
  readonly maximum?: string | number;
  readonly includeMinimum: boolean;
  readonly includeMaximum: boolean;
}

export interface TextFilter {
  readonly field: RetrievalField;
  readonly text: string;
  readonly matchMode: "exact" | "prefix" | "contains" | "token";
  readonly caseSensitive: boolean;
}

export interface TagFilter {
  readonly field: RetrievalField;
  readonly tags: readonly string[];
  readonly matchMode: "any" | "all" | "none";
}

export interface FilterGroup {
  readonly operator: LogicalOperator;
  readonly filters: readonly Filter[];
  readonly rangeFilters: readonly RangeFilter[];
  readonly textFilters: readonly TextFilter[];
  readonly tagFilters: readonly TagFilter[];
  readonly groups: readonly FilterGroup[];
}
