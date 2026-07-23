import type { DomainMetadata, DomainTimestamp } from "@career-companion/kernel";
import type { ConcurrencyConflict } from "../concurrency";
import type { PersistenceMetadata } from "../metadata";
import type { PersistenceContext } from "../session";
import type { PersistenceError } from "../shared";
import type { CommitResult, RollbackResult } from "../transactions";

export type UnitOfWorkState =
  | "created"
  | "collecting"
  | "ready"
  | "committed"
  | "rolled-back"
  | "failed"
  | "cancelled";

export interface SaveResult {
  readonly operationId: string;
  readonly accepted: boolean;
  readonly savedAt?: DomainTimestamp;
  readonly metadata?: PersistenceMetadata;
  readonly conflicts?: readonly ConcurrencyConflict[];
  readonly errors?: readonly PersistenceError[];
}

export interface UnitOfWork {
  readonly unitOfWorkId: string;
  readonly state: UnitOfWorkState;
  readonly context: PersistenceContext;
  readonly metadata?: DomainMetadata;
  save(changeSetName: string, metadata?: PersistenceMetadata): SaveResult;
  commit(): CommitResult;
  rollback(reason?: string): RollbackResult;
}

