import type { DomainMetadata, DomainTimestamp } from "@career-companion/kernel";
import type { PersistenceContext, VersionToken } from "@career-companion/persistence";

export interface ActorContext {
  readonly actorId: string;
  readonly actorType: "user" | "system" | "reviewer";
  readonly roles: readonly string[];
  readonly metadata?: DomainMetadata;
}

export interface RequestContext {
  readonly requestId: string;
  readonly requestedAt: DomainTimestamp;
  readonly source?: string;
  readonly metadata?: DomainMetadata;
}

export interface CorrelationContext {
  readonly correlationId: string;
  readonly causationId?: string;
  readonly traceId?: string;
  readonly metadata?: DomainMetadata;
}

export interface ExecutionMetadata {
  readonly useCaseName: string;
  readonly capability?: string;
  readonly expectedVersion?: VersionToken;
  readonly metadata?: DomainMetadata;
}

export interface ExecutionContext {
  readonly actor: ActorContext;
  readonly request: RequestContext;
  readonly correlation: CorrelationContext;
  readonly execution: ExecutionMetadata;
  readonly persistence?: PersistenceContext;
}

export type UseCaseContext = ExecutionContext;

