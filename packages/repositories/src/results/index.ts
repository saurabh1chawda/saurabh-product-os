import type { DomainMetadata, DomainTimestamp, Version } from "@career-companion/kernel";
import type { ConcurrencyConflict, VersionToken } from "@career-companion/persistence";

export type RepositoryResultStatus = "success" | "not-found" | "conflict" | "failure";

export interface RepositoryMetadata {
  readonly operationId: string;
  readonly repositoryName: string;
  readonly aggregateType: string;
  readonly occurredAt: DomainTimestamp;
  readonly versionToken?: VersionToken;
  readonly metadata?: DomainMetadata;
}

export interface RepositoryFailure {
  readonly status: "failure";
  readonly code: string;
  readonly message: string;
  readonly metadata: RepositoryMetadata;
  readonly cause?: unknown;
}

export interface RepositoryNotFound<TId = unknown> {
  readonly status: "not-found";
  readonly id: TId;
  readonly metadata: RepositoryMetadata;
}

export interface RepositoryConflict<TId = unknown> {
  readonly status: "conflict";
  readonly id: TId;
  readonly expectedVersion?: Version;
  readonly actualVersion?: Version;
  readonly versionToken?: VersionToken;
  readonly conflict?: ConcurrencyConflict;
  readonly metadata: RepositoryMetadata;
}

export interface RepositorySuccess<T> {
  readonly status: "success";
  readonly value: T;
  readonly metadata: RepositoryMetadata;
}

export type RepositoryResult<T, TId = unknown> =
  | RepositorySuccess<T>
  | RepositoryNotFound<TId>
  | RepositoryConflict<TId>
  | RepositoryFailure;

export type RepositorySaveResult<TId> =
  | RepositorySuccess<TId>
  | RepositoryConflict<TId>
  | RepositoryFailure;

export type RepositoryRemoveResult<TId> =
  | RepositorySuccess<TId>
  | RepositoryNotFound<TId>
  | RepositoryConflict<TId>
  | RepositoryFailure;

export type RepositoryExistenceResult =
  | RepositorySuccess<boolean>
  | RepositoryConflict
  | RepositoryFailure;

