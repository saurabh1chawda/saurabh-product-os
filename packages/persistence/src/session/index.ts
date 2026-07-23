import type { DomainMetadata, DomainTimestamp } from "@career-companion/kernel";
import type { PersistenceMetadata } from "../metadata";
import type { PersistenceTransaction, TransactionOptions } from "../transactions";

export type PersistenceSessionState =
  | "created"
  | "active"
  | "closed"
  | "failed"
  | "cancelled";

export interface PersistenceContext {
  readonly sessionId: string;
  readonly correlationId?: string;
  readonly actor?: string;
  readonly createdAt: DomainTimestamp;
  readonly metadata?: DomainMetadata;
}

export interface PersistenceSession {
  readonly sessionId: string;
  readonly state: PersistenceSessionState;
  readonly context: PersistenceContext;
  readonly metadata?: PersistenceMetadata;
  beginTransaction(options?: TransactionOptions): PersistenceTransaction;
  close(reason?: string): PersistenceSession;
}

