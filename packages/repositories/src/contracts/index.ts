import type { AggregateRoot, UniqueIdentifier } from "@career-companion/kernel";
import type { VersionToken } from "@career-companion/persistence";
import type {
  RepositoryExistenceResult,
  RepositoryRemoveResult,
  RepositoryResult,
  RepositorySaveResult
} from "../results";
import type { RemovalIntent, RepositoryContext, RepositoryDescriptor } from "../shared";

export interface ReadRepository<TAggregate extends AggregateRoot<TId>, TId extends UniqueIdentifier> {
  readonly descriptor: RepositoryDescriptor;
  getById(id: TId, context: RepositoryContext): RepositoryResult<TAggregate, TId>;
  exists(id: TId, context: RepositoryContext): RepositoryExistenceResult;
}

export interface WriteRepository<TAggregate extends AggregateRoot<TId>, TId extends UniqueIdentifier> {
  readonly descriptor: RepositoryDescriptor;
  save(
    aggregate: TAggregate,
    context: RepositoryContext,
    expectedVersion?: VersionToken
  ): RepositorySaveResult<TId>;
  remove(
    id: TId,
    intent: RemovalIntent,
    context: RepositoryContext,
    expectedVersion?: VersionToken
  ): RepositoryRemoveResult<TId>;
}

export interface Repository<TAggregate extends AggregateRoot<TId>, TId extends UniqueIdentifier>
  extends ReadRepository<TAggregate, TId>,
    WriteRepository<TAggregate, TId> {}

