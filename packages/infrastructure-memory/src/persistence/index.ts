import type { DomainMetadata } from "@career-companion/kernel";
import type {
  CommitResult,
  PersistenceContext,
  PersistenceMetadata,
  PersistenceSession,
  PersistenceSessionState,
  PersistenceTransaction,
  RollbackResult,
  SaveResult,
  TransactionOptions,
  TransactionState,
  UnitOfWork,
  UnitOfWorkState
} from "@career-companion/persistence";
import { timestamp } from "../shared";

export class InMemoryPersistenceSession implements PersistenceSession {
  private currentState: PersistenceSessionState = "active";

  readonly context: PersistenceContext;

  constructor(
    readonly sessionId: string = "in-memory-session",
    context: Partial<PersistenceContext> = {},
    readonly metadata?: PersistenceMetadata
  ) {
    this.context = Object.freeze({
      sessionId,
      createdAt: context.createdAt ?? timestamp(),
      correlationId: context.correlationId,
      actor: context.actor,
      metadata: context.metadata
    });
  }

  get state(): PersistenceSessionState {
    return this.currentState;
  }

  beginTransaction(options?: TransactionOptions): PersistenceTransaction {
    return new InMemoryPersistenceTransaction(`${this.sessionId}:transaction`, options);
  }

  close(): PersistenceSession {
    this.currentState = "closed";
    return this;
  }
}

export class InMemoryPersistenceTransaction implements PersistenceTransaction {
  private currentState: TransactionState = "active";

  constructor(
    readonly transactionId: string = "in-memory-transaction",
    readonly options?: TransactionOptions
  ) {}

  get state(): TransactionState {
    return this.currentState;
  }

  commit(): CommitResult {
    if (this.currentState === "rolled-back" || this.currentState === "cancelled") {
      this.currentState = "failed";
    } else {
      this.currentState = "committed";
    }

    return Object.freeze({
      transactionId: this.transactionId,
      state: this.currentState === "committed" ? "committed" : "failed",
      completedAt: timestamp()
    });
  }

  rollback(reason?: string): RollbackResult {
    if (this.currentState === "committed") {
      this.currentState = "failed";
    } else {
      this.currentState = "rolled-back";
    }

    return Object.freeze({
      transactionId: this.transactionId,
      state: this.currentState === "rolled-back" ? "rolled-back" : "failed",
      completedAt: timestamp(),
      metadata: reason === undefined ? undefined : createPersistenceMetadata(this.transactionId, 0, { reason })
    });
  }
}

export interface InMemoryChangeRecord {
  readonly changeSetName: string;
  readonly metadata?: PersistenceMetadata;
}

interface PendingChange extends InMemoryChangeRecord {
  readonly commit: () => void;
}

export class InMemoryUnitOfWork implements UnitOfWork {
  private currentState: UnitOfWorkState = "created";
  private readonly changeRecords: InMemoryChangeRecord[] = [];
  private readonly pendingChanges: PendingChange[] = [];

  constructor(
    readonly context: PersistenceContext,
    readonly unitOfWorkId: string = `${context.sessionId}:unit-of-work`,
    readonly metadata?: DomainMetadata
  ) {}

  get state(): UnitOfWorkState {
    return this.currentState;
  }

  get changes(): readonly InMemoryChangeRecord[] {
    return Object.freeze([...this.changeRecords]);
  }

  save(changeSetName: string, metadata?: PersistenceMetadata): SaveResult {
    if (this.currentState === "committed" || this.currentState === "rolled-back" || this.currentState === "cancelled") {
      return Object.freeze({
        operationId: `${this.unitOfWorkId}:save:${this.changeRecords.length + 1}`,
        accepted: false,
        errors: Object.freeze([
          {
            code: "unit-of-work.closed",
            message: "Unit of work cannot accept changes after completion.",
            category: "transaction" as const,
            timestamp: timestamp()
          }
        ])
      });
    }

    this.currentState = "collecting";
    this.changeRecords.push(Object.freeze({ changeSetName, metadata }));

    return Object.freeze({
      operationId: `${this.unitOfWorkId}:save:${this.changeRecords.length}`,
      accepted: true,
      savedAt: timestamp(),
      metadata
    });
  }

  commit(): CommitResult {
    if (this.currentState === "rolled-back" || this.currentState === "cancelled") {
      this.currentState = "failed";
    } else {
      for (const change of this.pendingChanges) {
        change.commit();
      }
      this.pendingChanges.splice(0, this.pendingChanges.length);
      this.currentState = "committed";
    }

    return Object.freeze({
      transactionId: this.unitOfWorkId,
      state: this.currentState === "committed" ? "committed" : "failed",
      completedAt: timestamp()
    });
  }

  rollback(reason?: string): RollbackResult {
    this.changeRecords.splice(0, this.changeRecords.length);
    this.pendingChanges.splice(0, this.pendingChanges.length);

    if (this.currentState === "committed") {
      this.currentState = "failed";
    } else {
      this.currentState = "rolled-back";
    }

    return Object.freeze({
      transactionId: this.unitOfWorkId,
      state: this.currentState === "rolled-back" ? "rolled-back" : "failed",
      completedAt: timestamp(),
      metadata: reason === undefined ? undefined : createPersistenceMetadata(this.unitOfWorkId, 0, { reason })
    });
  }

  stage(changeSetName: string, commit: () => void, metadata?: PersistenceMetadata): SaveResult {
    this.pendingChanges.push(Object.freeze({ changeSetName, commit, metadata }));
    return this.save(changeSetName, metadata);
  }
}

export function createPersistenceMetadata(
  persistenceId: string,
  currentVersion: number,
  metadata?: DomainMetadata
): PersistenceMetadata {
  return Object.freeze({
    identity: Object.freeze({ persistenceId }),
    version: Object.freeze({ currentVersion }),
    audit: Object.freeze({
      timestamp: timestamp(),
      metadata
    }),
    metadata
  });
}
