import type { AggregateRoot, DomainMetadata, DomainTimestamp, UniqueIdentifier, Version } from "@career-companion/kernel";
import type { VersionToken } from "@career-companion/persistence";

export interface StoredAggregate<TAggregate extends AggregateRoot> {
  readonly aggregate: TAggregate;
  readonly version: Version;
  readonly versionToken: VersionToken;
}

export const VersionTokenFactory = Object.freeze({
  create(aggregateId: string, version: Version): VersionToken {
    return Object.freeze({
      value: `${aggregateId}:${version}`,
      version
    });
  },

  next(current: VersionToken): VersionToken {
    return this.create(current.value.split(":")[0] ?? current.value, current.version + 1);
  }
});

export const DeepClone = Object.freeze({
  clone<T>(value: T): T {
    return cloneValue(value);
  }
});

export const ImmutableCollectionFactory = Object.freeze({
  create<T>(items: readonly T[]): readonly T[] {
    return Object.freeze([...items]);
  }
});

export class RepositoryStore<TAggregate extends AggregateRoot<TId>, TId extends UniqueIdentifier> {
  private readonly records = new Map<string, StoredAggregate<TAggregate>>();

  constructor(initialAggregates: readonly TAggregate[] = []) {
    for (const aggregate of initialAggregates) {
      this.set(aggregate);
    }
  }

  get(id: TId): StoredAggregate<TAggregate> | undefined {
    return this.records.get(id.toString());
  }

  has(id: TId): boolean {
    return this.records.has(id.toString());
  }

  set(aggregate: TAggregate, version?: Version): StoredAggregate<TAggregate> {
    const key = aggregate.id.toString();
    const current = this.records.get(key);
    const nextVersion = version ?? (current?.version ?? aggregate.version) + 1;
    const record = Object.freeze({
      aggregate,
      version: nextVersion,
      versionToken: VersionTokenFactory.create(key, nextVersion)
    });
    this.records.set(key, record);
    return record;
  }

  delete(id: TId): boolean {
    return this.records.delete(id.toString());
  }

  values(): readonly TAggregate[] {
    return Object.freeze([...this.records.values()].map((record) => record.aggregate));
  }

  entries(): readonly StoredAggregate<TAggregate>[] {
    return Object.freeze([...this.records.values()]);
  }
}

export function timestamp(): DomainTimestamp {
  return new Date(0).toISOString();
}

export function metadata(overrides: DomainMetadata = {}): DomainMetadata {
  return Object.freeze({ ...overrides });
}

function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return Object.freeze(value.map((item) => cloneValue(item))) as T;
  }

  if (value !== null && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    const output: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      output[key] = cloneValue(item);
    }
    return Object.freeze(output) as T;
  }

  return value;
}
