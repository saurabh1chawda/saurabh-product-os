import type { DomainMetadata, DomainTimestamp, Version } from "@career-companion/kernel";

export type RetrievalField = string;
export type RetrievalEntityType =
  | "knowledge"
  | "identity"
  | "competency"
  | "story"
  | "evidence"
  | "metric"
  | "decision";

export interface FieldMask {
  readonly fields: readonly RetrievalField[];
}

export interface SelectionSet {
  readonly include: readonly RetrievalField[];
  readonly exclude: readonly RetrievalField[];
}

export interface Projection {
  readonly projectionName?: string;
  readonly fieldMask?: FieldMask;
  readonly selectionSet?: SelectionSet;
}

export interface RetrievalContext {
  readonly actor?: string;
  readonly correlationId?: string;
  readonly retrievalTimestamp?: DomainTimestamp;
  readonly modelVersion?: Version;
  readonly metadata?: DomainMetadata;
}
