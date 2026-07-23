import type { DomainMetadata, DomainTimestamp, Version } from "@career-companion/kernel";
import type { RetrievalEntityType } from "../shared";

export interface RetrievalReference {
  readonly referenceId: string;
  readonly entityType: RetrievalEntityType;
  readonly version?: Version;
  readonly label?: string;
}

export interface RetrievalConfidence {
  readonly value: number;
  readonly level: "low" | "medium" | "high" | "unknown";
  readonly reason?: string;
}

export interface RetrievalExplanation {
  readonly summary: string;
  readonly matchedFields: readonly string[];
  readonly reasons: readonly string[];
  readonly references: readonly RetrievalReference[];
}

export interface RetrievalSummary {
  readonly queryName?: string;
  readonly resultCount: number;
  readonly explanation?: RetrievalExplanation;
}

export interface RetrievalMetadata {
  readonly retrievalTimestamp?: DomainTimestamp;
  readonly sourceVersion?: Version;
  readonly context?: DomainMetadata;
}

export interface RetrievalResult<TItem> {
  readonly items: readonly TItem[];
  readonly references: readonly RetrievalReference[];
  readonly confidence?: RetrievalConfidence;
  readonly explanation?: RetrievalExplanation;
  readonly summary: RetrievalSummary;
  readonly metadata: RetrievalMetadata;
}
