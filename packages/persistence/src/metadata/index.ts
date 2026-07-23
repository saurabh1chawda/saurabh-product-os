import type { DomainMetadata, DomainTimestamp, Version } from "@career-companion/kernel";

export interface PersistenceIdentity {
  readonly persistenceId: string;
  readonly aggregateId?: string;
  readonly aggregateType?: string;
}

export interface PersistenceVersion {
  readonly currentVersion: Version;
  readonly expectedVersion?: Version;
  readonly versionToken?: string;
}

export interface PersistenceAudit {
  readonly actor?: string;
  readonly reason?: string;
  readonly correlationId?: string;
  readonly timestamp: DomainTimestamp;
  readonly metadata?: DomainMetadata;
}

export interface PersistenceMetadata {
  readonly identity: PersistenceIdentity;
  readonly version: PersistenceVersion;
  readonly audit: PersistenceAudit;
  readonly metadata?: DomainMetadata;
}

