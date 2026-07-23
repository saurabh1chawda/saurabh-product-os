import type { RetrievalField } from "../shared";

export type SortDirection = "ascending" | "descending";

export interface SortField {
  readonly field: RetrievalField;
  readonly direction: SortDirection;
  readonly nulls?: "first" | "last";
}

export interface Sort {
  readonly field: SortField;
}

export interface MultiSort {
  readonly fields: readonly SortField[];
}
