import { and, eq } from "drizzle-orm";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { NodePgTransaction } from "drizzle-orm/node-postgres/session";
import { Result } from "@career-companion/kernel";
import * as schema from "../postgres/schema";
import { portfolioWorkspaceIdempotencyRecords } from "../postgres/schema";
import {
  failure,
  PortfolioWorkspaceIdempotencyCompletionResult,
  PortfolioWorkspaceIdempotencyPersistenceError,
  PortfolioWorkspaceIdempotencyPersistenceStatus,
  PortfolioWorkspaceIdempotencyReleaseResult,
  PortfolioWorkspaceIdempotencyReservationKind,
  PortfolioWorkspaceIdempotencyReservationResult,
  type PortfolioWorkspaceIdempotencyCompleteSuccessInput,
  type PortfolioWorkspaceIdempotencyReleaseInput,
  type PortfolioWorkspaceIdempotencyReservationInput,
  type PortfolioWorkspaceIdempotencyStore
} from "./PortfolioWorkspaceIdempotencyPersistenceContracts";
import {
  PortfolioWorkspaceIdempotencyRecordMapper,
  type PortfolioWorkspaceIdempotencyRecord
} from "./PortfolioWorkspaceIdempotencyRecordMapper";

type PortfolioWorkspacePostgresDatabase =
  | NodePgDatabase<typeof schema>
  | NodePgTransaction<typeof schema, ExtractTablesWithRelations<typeof schema>>;

export class PostgresPortfolioWorkspaceIdempotencyStore implements PortfolioWorkspaceIdempotencyStore {
  private readonly database: PortfolioWorkspacePostgresDatabase;

  constructor(database: PortfolioWorkspacePostgresDatabase) {
    this.database = database;
    Object.freeze(this);
  }

  async reserve(
    input: PortfolioWorkspaceIdempotencyReservationInput
  ): Promise<Result<PortfolioWorkspaceIdempotencyReservationResult, PortfolioWorkspaceIdempotencyPersistenceError>> {
    try {
      const row = PortfolioWorkspaceIdempotencyRecordMapper.reservationToRow(input);
      const inserted = await this.database
        .insert(portfolioWorkspaceIdempotencyRecords)
        .values(row)
        .onConflictDoNothing({
          target: portfolioWorkspaceIdempotencyRecords.scopeHash
        })
        .returning({ scopeHash: portfolioWorkspaceIdempotencyRecords.scopeHash });

      if (inserted[0] !== undefined) {
        return Result.success(new PortfolioWorkspaceIdempotencyReservationResult({
          kind: PortfolioWorkspaceIdempotencyReservationKind.FirstExecutionReserved
        }));
      }

      const existing = await this.loadByScopeHash(row.scopeHash);
      if (existing.isFailure || existing.value === undefined) {
        return failure("storage-unavailable");
      }

      return Result.success(reservationResultFor(existing.value, row.requestFingerprintValue));
    } catch (error) {
      if (error instanceof PortfolioWorkspaceIdempotencyPersistenceError) {
        return Result.failure(error);
      }
      return failure("storage-unavailable");
    }
  }

  async completeSuccess(
    input: PortfolioWorkspaceIdempotencyCompleteSuccessInput
  ): Promise<Result<PortfolioWorkspaceIdempotencyCompletionResult, PortfolioWorkspaceIdempotencyPersistenceError>> {
    try {
      const scopeHash = PortfolioWorkspaceIdempotencyRecordMapper.scopeHash(input.scope);
      const update = PortfolioWorkspaceIdempotencyRecordMapper.successUpdate(input);
      const rows = await this.database
        .update(portfolioWorkspaceIdempotencyRecords)
        .set(update)
        .where(and(
          eq(portfolioWorkspaceIdempotencyRecords.scopeHash, scopeHash),
          eq(portfolioWorkspaceIdempotencyRecords.requestFingerprintValue, input.fingerprint.value),
          eq(portfolioWorkspaceIdempotencyRecords.status, PortfolioWorkspaceIdempotencyPersistenceStatus.Reserved)
        ))
        .returning({ scopeHash: portfolioWorkspaceIdempotencyRecords.scopeHash });

      return rows[0] === undefined
        ? failure("state-transition-conflict")
        : Result.success(new PortfolioWorkspaceIdempotencyCompletionResult());
    } catch (error) {
      if (error instanceof PortfolioWorkspaceIdempotencyPersistenceError) {
        return Result.failure(error);
      }
      return failure("storage-unavailable");
    }
  }

  async release(
    input: PortfolioWorkspaceIdempotencyReleaseInput
  ): Promise<Result<PortfolioWorkspaceIdempotencyReleaseResult, PortfolioWorkspaceIdempotencyPersistenceError>> {
    try {
      const scopeHash = PortfolioWorkspaceIdempotencyRecordMapper.scopeHash(input.scope);
      const rows = await this.database
        .delete(portfolioWorkspaceIdempotencyRecords)
        .where(and(
          eq(portfolioWorkspaceIdempotencyRecords.scopeHash, scopeHash),
          eq(portfolioWorkspaceIdempotencyRecords.requestFingerprintValue, input.fingerprint.value),
          eq(portfolioWorkspaceIdempotencyRecords.status, PortfolioWorkspaceIdempotencyPersistenceStatus.Reserved)
        ))
        .returning({ scopeHash: portfolioWorkspaceIdempotencyRecords.scopeHash });

      return rows[0] === undefined
        ? failure("state-transition-conflict")
        : Result.success(new PortfolioWorkspaceIdempotencyReleaseResult());
    } catch {
      return failure("storage-unavailable");
    }
  }

  private async loadByScopeHash(
    scopeHash: string
  ): Promise<Result<PortfolioWorkspaceIdempotencyRecord | undefined, PortfolioWorkspaceIdempotencyPersistenceError>> {
    try {
      const rows = await this.database
        .select()
        .from(portfolioWorkspaceIdempotencyRecords)
        .where(eq(portfolioWorkspaceIdempotencyRecords.scopeHash, scopeHash))
        .limit(1);
      const row = rows[0];
      return row === undefined ? Result.success(undefined) : PortfolioWorkspaceIdempotencyRecordMapper.fromRow(row);
    } catch {
      return failure("storage-unavailable");
    }
  }
}

function reservationResultFor(
  record: PortfolioWorkspaceIdempotencyRecord,
  requestFingerprintValue: string
): PortfolioWorkspaceIdempotencyReservationResult {
  if (record.requestFingerprintValue !== requestFingerprintValue) {
    return new PortfolioWorkspaceIdempotencyReservationResult({
      kind: PortfolioWorkspaceIdempotencyReservationKind.ConflictFingerprintMismatch
    });
  }

  if (record.status === PortfolioWorkspaceIdempotencyPersistenceStatus.Succeeded) {
    return new PortfolioWorkspaceIdempotencyReservationResult({
      kind: PortfolioWorkspaceIdempotencyReservationKind.ReplaySucceeded,
      replayPayload: {
        replayContractVersion: record.replayContractVersion!,
        responsePayload: record.replayResponsePayload!
      }
    });
  }

  return new PortfolioWorkspaceIdempotencyReservationResult({
    kind: PortfolioWorkspaceIdempotencyReservationKind.InProgress
  });
}
