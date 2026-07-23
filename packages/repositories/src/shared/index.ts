import type { DomainMetadata } from "@career-companion/kernel";
import type { PersistenceContext, PersistenceSession, UnitOfWork } from "@career-companion/persistence";

export type RepositoryOperation = "get-by-id" | "exists" | "save" | "remove";

export type RemovalMode = "archive-only" | "soft-delete";

export type DeletionReason =
  | "user-request"
  | "duplicate-record"
  | "incorrect-record"
  | "governance-cleanup"
  | "retention-policy";

export interface RemovalIntent {
  readonly mode: RemovalMode;
  readonly reason: DeletionReason;
  readonly requestedBy?: string;
  readonly metadata?: DomainMetadata;
}

export interface RepositoryContext {
  readonly persistenceContext: PersistenceContext;
  readonly session?: PersistenceSession;
  readonly unitOfWork?: UnitOfWork;
  readonly metadata?: DomainMetadata;
}

export interface BatchRepositoryCapability {
  readonly supported: boolean;
  readonly maxItems?: number;
  readonly metadata?: DomainMetadata;
}

export interface RepositoryCapabilities {
  readonly supportedOperations: readonly RepositoryOperation[];
  readonly supportedRemovalModes: readonly RemovalMode[];
  readonly batch?: BatchRepositoryCapability;
  readonly metadata?: DomainMetadata;
}

export interface RepositoryDescriptor {
  readonly repositoryName: string;
  readonly aggregateName: string;
  readonly aggregateType: string;
  readonly capabilities: RepositoryCapabilities;
  readonly metadata?: DomainMetadata;
}

