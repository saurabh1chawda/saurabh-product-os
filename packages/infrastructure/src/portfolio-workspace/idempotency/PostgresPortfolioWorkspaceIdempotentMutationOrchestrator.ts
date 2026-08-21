import { Result } from "@career-companion/kernel";
import type { PortfolioExecutionRepository } from "@career-companion/portfolio-workspace-application";
import {
  type PortfolioWorkspaceIdempotencyCommandBinding,
  type PortfolioWorkspaceIdempotencyExpiryMetadata,
  type PortfolioWorkspaceIdempotencyIdentity,
  type PortfolioWorkspaceIdempotencyReplayPayload,
  type PortfolioWorkspaceIdempotencyRequestFingerprint
} from "@career-companion/portfolio-workspace-application";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { NodePgTransaction } from "drizzle-orm/node-postgres/session";
import { PostgresPortfolioExecutionRepository } from "../postgres/PostgresPortfolioExecutionRepository";
import * as schema from "../postgres/schema";
import {
  PortfolioWorkspaceIdempotencyPersistenceError,
  PortfolioWorkspaceIdempotencyReservationKind,
  type PortfolioWorkspaceIdempotencyPersistenceOperationValue,
  type PortfolioWorkspaceIdempotencyReplayPayloadJson,
  type PortfolioWorkspaceIdempotencyScopeInput
} from "./PortfolioWorkspaceIdempotencyPersistenceContracts";
import { PostgresPortfolioWorkspaceIdempotencyStore } from "./PostgresPortfolioWorkspaceIdempotencyStore";

type PortfolioWorkspacePostgresDatabase = NodePgDatabase<typeof schema>;
type PortfolioWorkspacePostgresTransaction =
  NodePgTransaction<typeof schema, ExtractTablesWithRelations<typeof schema>>;

export const PortfolioWorkspaceIdempotentMutationResultKind = Object.freeze({
  Executed: "executed",
  ReplayAvailable: "replay-available",
  InProgress: "in-progress",
  FingerprintMismatch: "fingerprint-mismatch"
} as const);

export type PortfolioWorkspaceIdempotentMutationResultKindValue =
  typeof PortfolioWorkspaceIdempotentMutationResultKind[keyof typeof PortfolioWorkspaceIdempotentMutationResultKind];

export interface PortfolioWorkspaceIdempotentMutationExecutionSuccess<TValue> {
  readonly value: TValue;
  readonly replayPayload: PortfolioWorkspaceIdempotencyReplayPayload;
}

export interface PortfolioWorkspaceIdempotentMutationContext {
  readonly repository: PortfolioExecutionRepository;
}

export interface PortfolioWorkspaceIdempotentMutationInput<TValue, TFailure> {
  readonly identity: PortfolioWorkspaceIdempotencyIdentity;
  readonly requestFingerprint: PortfolioWorkspaceIdempotencyRequestFingerprint;
  readonly commandBinding: PortfolioWorkspaceIdempotencyCommandBinding;
  readonly expiry: PortfolioWorkspaceIdempotencyExpiryMetadata;
  readonly execute: (
    context: PortfolioWorkspaceIdempotentMutationContext
  ) => Promise<Result<PortfolioWorkspaceIdempotentMutationExecutionSuccess<TValue>, TFailure>>;
}

export class PortfolioWorkspaceIdempotentMutationResult<TValue> {
  readonly kind: PortfolioWorkspaceIdempotentMutationResultKindValue;
  readonly value: TValue | undefined;
  readonly replayPayload: PortfolioWorkspaceIdempotencyReplayPayloadJson | undefined;

  constructor(input: {
    readonly kind: PortfolioWorkspaceIdempotentMutationResultKindValue;
    readonly value?: TValue;
    readonly replayPayload?: PortfolioWorkspaceIdempotencyReplayPayloadJson;
  }) {
    this.kind = input.kind;
    this.value = input.value;
    this.replayPayload = input.replayPayload === undefined
      ? undefined
      : deepFreezeReplayPayload(input.replayPayload);
    Object.freeze(this);
  }

  toJSON(): {
    readonly kind: PortfolioWorkspaceIdempotentMutationResultKindValue;
    readonly value?: TValue;
    readonly replayPayload?: PortfolioWorkspaceIdempotencyReplayPayloadJson;
  } {
    return {
      kind: this.kind,
      ...(this.value === undefined ? {} : { value: this.value }),
      ...(this.replayPayload === undefined ? {} : { replayPayload: this.replayPayload })
    };
  }
}

export type PortfolioWorkspaceIdempotentMutationFailure<TFailure> =
  | TFailure
  | PortfolioWorkspaceIdempotencyPersistenceError;

export class PostgresPortfolioWorkspaceIdempotentMutationOrchestrator {
  private readonly database: PortfolioWorkspacePostgresDatabase;

  constructor(database: PortfolioWorkspacePostgresDatabase) {
    this.database = database;
    Object.freeze(this);
  }

  async execute<TValue, TFailure>(
    input: PortfolioWorkspaceIdempotentMutationInput<TValue, TFailure>
  ): Promise<Result<
    PortfolioWorkspaceIdempotentMutationResult<TValue>,
    PortfolioWorkspaceIdempotentMutationFailure<TFailure>
  >> {
    try {
      return await this.database.transaction(async (transaction) => {
        const store = new PostgresPortfolioWorkspaceIdempotencyStore(transaction);
        const reservation = await store.reserve({
          scope: toPersistenceScope(input.identity),
          fingerprint: input.requestFingerprint.toJSON(),
          originalCommandId: input.commandBinding.originalCommandId,
          originalCorrelationId: input.commandBinding.originalCorrelationId,
          now: new Date(input.expiry.createdAt),
          expiresAt: new Date(input.expiry.expiresAt)
        });

        if (reservation.isFailure) {
          return Result.failure(reservation.error!);
        }

        switch (reservation.value!.kind) {
          case PortfolioWorkspaceIdempotencyReservationKind.ReplaySucceeded:
            return Result.success(new PortfolioWorkspaceIdempotentMutationResult<TValue>({
              kind: PortfolioWorkspaceIdempotentMutationResultKind.ReplayAvailable,
              replayPayload: reservation.value!.replayPayload
            }));
          case PortfolioWorkspaceIdempotencyReservationKind.InProgress:
            return Result.success(new PortfolioWorkspaceIdempotentMutationResult<TValue>({
              kind: PortfolioWorkspaceIdempotentMutationResultKind.InProgress
            }));
          case PortfolioWorkspaceIdempotencyReservationKind.ConflictFingerprintMismatch:
            return Result.success(new PortfolioWorkspaceIdempotentMutationResult<TValue>({
              kind: PortfolioWorkspaceIdempotentMutationResultKind.FingerprintMismatch
            }));
          case PortfolioWorkspaceIdempotencyReservationKind.FirstExecutionReserved:
            return this.executeFirstMutation(input, transaction, store);
        }
      });
    } catch (error) {
      if (error instanceof RollbackResult) {
        return error.result as Result<
          PortfolioWorkspaceIdempotentMutationResult<TValue>,
          PortfolioWorkspaceIdempotentMutationFailure<TFailure>
        >;
      }

      return Result.failure(new PortfolioWorkspaceIdempotencyPersistenceError("storage-unavailable"));
    }
  }

  private async executeFirstMutation<TValue, TFailure>(
    input: PortfolioWorkspaceIdempotentMutationInput<TValue, TFailure>,
    transaction: PortfolioWorkspacePostgresTransaction,
    store: PostgresPortfolioWorkspaceIdempotencyStore
  ): Promise<Result<
    PortfolioWorkspaceIdempotentMutationResult<TValue>,
    PortfolioWorkspaceIdempotentMutationFailure<TFailure>
  >> {
    const mutation = await input.execute({
      repository: new PostgresPortfolioExecutionRepository(transaction)
    });
    if (mutation.isFailure) {
      throw new RollbackResult(Result.failure(mutation.error!));
    }

    const replayPayload = mutation.value!.replayPayload.toJSON();
    const completion = await store.completeSuccess({
      scope: toPersistenceScope(input.identity),
      fingerprint: input.requestFingerprint.toJSON(),
      replayPayload,
      completedAt: new Date(input.expiry.completedAt ?? input.expiry.createdAt)
    });
    if (completion.isFailure) {
      throw new RollbackResult(Result.failure(completion.error!));
    }

    return Result.success(new PortfolioWorkspaceIdempotentMutationResult({
      kind: PortfolioWorkspaceIdempotentMutationResultKind.Executed,
      value: mutation.value!.value,
      replayPayload
    }));
  }
}

class RollbackResult extends Error {
  readonly result: Result<unknown, unknown>;

  constructor(result: Result<unknown, unknown>) {
    super("Rollback Portfolio Workspace idempotent mutation transaction.");
    this.name = "PortfolioWorkspaceIdempotentMutationRollback";
    this.result = result;
  }
}

function toPersistenceScope(
  identity: PortfolioWorkspaceIdempotencyIdentity
): PortfolioWorkspaceIdempotencyScopeInput {
  return {
    operation: identity.operation as PortfolioWorkspaceIdempotencyPersistenceOperationValue,
    authorizationResourceReference: identity.authorizationResourceReference.toJSON().authorizationResourceReference,
    resourceIdentity: identity.resourceIdentity,
    idempotencyKeyHash: identity.keyHash.value
  };
}

function deepFreezeReplayPayload(
  payload: PortfolioWorkspaceIdempotencyReplayPayloadJson
): PortfolioWorkspaceIdempotencyReplayPayloadJson {
  return Object.freeze({
    replayContractVersion: payload.replayContractVersion,
    responsePayload: deepFreezeJson(JSON.parse(JSON.stringify(payload.responsePayload)))
  });
}

function deepFreezeJson<T>(value: T): T {
  if (Array.isArray(value)) {
    return Object.freeze(value.map((entry) => deepFreezeJson(entry))) as T;
  }

  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value).map(([key, entry]) => [key, deepFreezeJson(entry)] as const);
    return Object.freeze(Object.fromEntries(entries)) as T;
  }

  return value;
}
