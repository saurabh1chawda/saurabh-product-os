import type { DomainMetadata, DomainTimestamp } from "@career-companion/kernel";
import type { ConcurrencyConflict, ConcurrencyStrategy } from "../concurrency";
import type { PersistenceMetadata } from "../metadata";
import type { PersistenceError } from "../shared";

export type TransactionState =
  | "created"
  | "active"
  | "committed"
  | "rolled-back"
  | "failed"
  | "cancelled";

export type TransactionIsolation =
  | "default"
  | "read-committed"
  | "repeatable-read"
  | "serializable";

export interface TransactionOptions {
  readonly isolation?: TransactionIsolation;
  readonly concurrencyStrategy?: ConcurrencyStrategy;
  readonly timeoutMs?: number;
  readonly metadata?: DomainMetadata;
}

export interface TransactionResult {
  readonly transactionId: string;
  readonly state: TransactionState;
  readonly completedAt?: DomainTimestamp;
  readonly metadata?: PersistenceMetadata;
  readonly conflicts?: readonly ConcurrencyConflict[];
  readonly errors?: readonly PersistenceError[];
}

export type CommitResult = TransactionResult & {
  readonly state: "committed" | "failed";
};

export type RollbackResult = TransactionResult & {
  readonly state: "rolled-back" | "failed";
};

export interface PersistenceTransaction {
  readonly transactionId: string;
  readonly state: TransactionState;
  readonly options?: TransactionOptions;
  commit(): CommitResult;
  rollback(reason?: string): RollbackResult;
}

