import type { DomainMetadata, DomainTimestamp, Version } from "../primitives";

export interface DomainEvent {
  readonly eventId: string;
  readonly eventType: string;
  readonly aggregateId?: string;
  readonly aggregateVersion?: Version;
  readonly occurredAt: DomainTimestamp;
  readonly payload?: DomainMetadata;
  readonly metadata?: DomainMetadata;
}

export interface DomainRule<T = unknown> {
  readonly code: string;
  readonly description: string;
  isSatisfiedBy(candidate: T): boolean;
}
