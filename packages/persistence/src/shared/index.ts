import type { DomainMetadata, DomainTimestamp } from "@career-companion/kernel";

export type PersistenceErrorCategory =
  | "validation"
  | "concurrency"
  | "transaction"
  | "commit"
  | "rollback"
  | "policy"
  | "unknown";

export interface PersistenceError {
  readonly code: string;
  readonly message: string;
  readonly category: PersistenceErrorCategory;
  readonly timestamp: DomainTimestamp;
  readonly metadata?: DomainMetadata;
  readonly cause?: unknown;
}

export interface PersistenceCapability {
  readonly capabilityId: string;
  readonly name: string;
  readonly supportedOperations: readonly string[];
  readonly metadata?: DomainMetadata;
}

export interface PersistencePolicy {
  readonly policyId: string;
  readonly name: string;
  readonly required: boolean;
  readonly metadata?: DomainMetadata;
}

