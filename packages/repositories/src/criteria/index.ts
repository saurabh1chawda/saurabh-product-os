import type { VersionToken } from "@career-companion/persistence";
import type { RemovalIntent } from "../shared";

export interface RepositoryIdentityCriteria<TId> {
  readonly id: TId;
}

export interface RepositorySaveCriteria {
  readonly expectedVersion?: VersionToken;
}

export interface RepositoryRemoveCriteria<TId> extends RepositoryIdentityCriteria<TId> {
  readonly intent: RemovalIntent;
  readonly expectedVersion?: VersionToken;
}

