import { Result } from "@career-companion/kernel";
import type { ExecutionId, PortfolioExecution } from "@career-companion/portfolio-workspace";
import {
  LoadedPortfolioExecution,
  PortfolioExecutionAlreadyExistsError,
  PortfolioExecutionConcurrencyConflictError,
  PortfolioExecutionPersistenceMappingError,
  PortfolioExecutionPersistenceUnavailableError,
  PortfolioExecutionRevision,
  PortfolioExecutionSaveResult,
  type PortfolioExecutionRepository,
  type PortfolioExecutionRepositorySaveFailure
} from "@career-companion/portfolio-workspace-application";
import { and, eq } from "drizzle-orm";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { NodePgTransaction } from "drizzle-orm/node-postgres/session";
import { PortfolioExecutionRecordMapper, type PortfolioExecutionRecord } from "../persistence";
import * as schema from "./schema";
import { portfolioExecutions } from "./schema";

type PortfolioWorkspacePostgresDatabase =
  | NodePgDatabase<typeof schema>
  | NodePgTransaction<typeof schema, ExtractTablesWithRelations<typeof schema>>;

const INITIAL_REVISION = new PortfolioExecutionRevision(1);
const POSTGRES_UNIQUE_VIOLATION_CODE = "23505";

export class PostgresPortfolioExecutionRepository implements PortfolioExecutionRepository {
  private readonly database: PortfolioWorkspacePostgresDatabase;

  constructor(database: PortfolioWorkspacePostgresDatabase) {
    this.database = database;
    Object.freeze(this);
  }

  async loadByExecutionId(executionId: ExecutionId): Promise<LoadedPortfolioExecution | undefined> {
    let rows: readonly schema.PortfolioExecutionRow[];
    try {
      rows = await this.database
        .select()
        .from(portfolioExecutions)
        .where(eq(portfolioExecutions.executionId, executionId.toJSON()))
        .limit(1);
    } catch {
      throw new PortfolioExecutionPersistenceUnavailableError();
    }

    const row = rows[0];
    if (row === undefined) {
      return undefined;
    }

    const mapped = PortfolioExecutionRecordMapper.fromUnknownRecord(toRecord(row));
    if (mapped.isFailure) {
      throw mapped.error ?? new PortfolioExecutionPersistenceMappingError();
    }

    return new LoadedPortfolioExecution({
      execution: mapped.value!,
      revision: new PortfolioExecutionRevision(row.revision)
    });
  }

  async save(
    execution: PortfolioExecution,
    expectedRevision?: PortfolioExecutionRevision
  ): Promise<Result<PortfolioExecutionSaveResult, PortfolioExecutionRepositorySaveFailure>> {
    const record = PortfolioExecutionRecordMapper.toRecord(execution);
    if (expectedRevision === undefined) {
      return this.create(record, execution.id);
    }

    return this.update(record, execution.id, expectedRevision);
  }

  private async create(
    record: PortfolioExecutionRecord,
    executionId: ExecutionId
  ): Promise<Result<PortfolioExecutionSaveResult, PortfolioExecutionRepositorySaveFailure>> {
    try {
      await this.database
        .insert(portfolioExecutions)
        .values({
          executionId: record.executionId,
          recordVersion: record.recordVersion,
          revision: INITIAL_REVISION.toJSON(),
          aggregatePayload: record.aggregatePayload
        });

      return Result.success(new PortfolioExecutionSaveResult({
        revision: INITIAL_REVISION
      }));
    } catch (error) {
      if (isPostgresUniqueViolation(error)) {
        const currentRevision = await this.loadCurrentRevision(executionId);
        return Result.failure(new PortfolioExecutionAlreadyExistsError({
          executionId,
          currentRevision: currentRevision ?? INITIAL_REVISION
        }));
      }

      return Result.failure(new PortfolioExecutionPersistenceUnavailableError());
    }
  }

  private async update(
    record: PortfolioExecutionRecord,
    executionId: ExecutionId,
    expectedRevision: PortfolioExecutionRevision
  ): Promise<Result<PortfolioExecutionSaveResult, PortfolioExecutionRepositorySaveFailure>> {
    const nextRevision = expectedRevision.next();

    try {
      const rows = await this.database
        .update(portfolioExecutions)
        .set({
          recordVersion: record.recordVersion,
          revision: nextRevision.toJSON(),
          aggregatePayload: record.aggregatePayload
        })
        .where(and(
          eq(portfolioExecutions.executionId, record.executionId),
          eq(portfolioExecutions.revision, expectedRevision.toJSON())
        ))
        .returning({ revision: portfolioExecutions.revision });

      if (rows[0] === undefined) {
        return Result.failure(new PortfolioExecutionConcurrencyConflictError({
          executionId,
          expectedRevision
        }));
      }

      return Result.success(new PortfolioExecutionSaveResult({
        revision: new PortfolioExecutionRevision(rows[0].revision)
      }));
    } catch {
      return Result.failure(new PortfolioExecutionPersistenceUnavailableError());
    }
  }

  private async loadCurrentRevision(executionId: ExecutionId): Promise<PortfolioExecutionRevision | undefined> {
    try {
      const rows = await this.database
        .select({ revision: portfolioExecutions.revision })
        .from(portfolioExecutions)
        .where(eq(portfolioExecutions.executionId, executionId.toJSON()))
        .limit(1);
      const revision = rows[0]?.revision;
      return revision === undefined ? undefined : new PortfolioExecutionRevision(revision);
    } catch {
      return undefined;
    }
  }
}

function toRecord(row: schema.PortfolioExecutionRow): PortfolioExecutionRecord {
  return {
    recordVersion: row.recordVersion as PortfolioExecutionRecord["recordVersion"],
    executionId: row.executionId,
    aggregatePayload: row.aggregatePayload
  };
}

function isPostgresUniqueViolation(error: unknown, depth = 0): boolean {
  if (depth > 4) {
    return false;
  }

  return typeof error === "object"
    && error !== null
    && (("code" in error && (error as { readonly code?: unknown }).code === POSTGRES_UNIQUE_VIOLATION_CODE)
      || ("cause" in error && isPostgresUniqueViolation((error as { readonly cause?: unknown }).cause, depth + 1)));
}
