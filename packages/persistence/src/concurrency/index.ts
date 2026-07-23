import type { DomainMetadata, DomainTimestamp, Version } from "@career-companion/kernel";

export interface VersionToken {
  readonly value: string;
  readonly version: Version;
}

export type ConcurrencyStrategy =
  | "optimistic"
  | "strict-version"
  | "append-only"
  | "none";

export interface OptimisticConcurrency {
  readonly strategy: Extract<ConcurrencyStrategy, "optimistic">;
  readonly expectedVersion: Version;
  readonly currentVersion?: Version;
  readonly token?: VersionToken;
}

export interface ConcurrencyConflict {
  readonly aggregateId?: string;
  readonly aggregateType?: string;
  readonly expectedVersion?: Version;
  readonly actualVersion?: Version;
  readonly detectedAt: DomainTimestamp;
  readonly metadata?: DomainMetadata;
}

