import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Result } from "@career-companion/kernel";
import {
  ExecutionId,
  PortfolioExecution,
  PortfolioExecutionCommandContext,
  PortfolioExecutionLifecycle,
  PortfolioPlanReference,
  PortfolioWorkspaceAuthorizationResourceReference,
  PlanSnapshotReference,
  ApprovalReference
} from "@career-companion/portfolio-workspace";
import {
  LoadedPortfolioExecution,
  PortfolioExecutionAlreadyExistsError,
  PortfolioExecutionConcurrencyConflictError,
  PortfolioExecutionPersistenceMappingError,
  PortfolioExecutionPersistenceUnavailableError,
  PortfolioExecutionRevision,
  PortfolioExecutionSaveResult,
  UnsupportedPortfolioExecutionRecordVersionError
} from "@career-companion/portfolio-workspace-application";
import { describe, expect, it } from "vitest";
import { PostgresPortfolioExecutionRepository } from "../src";
import * as publicApi from "../src";
import {
  PORTFOLIO_EXECUTION_RECORD_VERSION,
  PortfolioExecutionRecordMapper,
  type PortfolioExecutionAggregatePayload
} from "../src/portfolio-workspace/persistence";
import type { PortfolioExecutionRow } from "../src/portfolio-workspace/postgres/schema";

describe("PostgresPortfolioExecutionRepository", () => {
  it("inserts one aggregate row with revision one and mapper-controlled record version", async () => {
    const database = new FakePostgresDatabase();
    const repository = new PostgresPortfolioExecutionRepository(database.toDrizzle());
    const execution = createExecution("execution:insert");

    const result = await repository.save(execution);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBeInstanceOf(PortfolioExecutionSaveResult);
    expect(result.value?.revision.toJSON()).toBe(1);
    expect(database.rows()).toEqual([{
      executionId: "execution:insert",
      recordVersion: PORTFOLIO_EXECUTION_RECORD_VERSION,
      revision: 1,
      aggregatePayload: PortfolioExecutionRecordMapper.toRecord(execution).aggregatePayload
    }]);
    expect(database.rows()[0]?.aggregatePayload).not.toHaveProperty("revision");
    expect(database.rows()[0]?.aggregatePayload).not.toHaveProperty("recordVersion");
  });

  it("returns AlreadyExists on duplicate create without overwriting the existing row", async () => {
    const database = new FakePostgresDatabase();
    const repository = new PostgresPortfolioExecutionRepository(database.toDrizzle());
    const first = createExecution("execution:duplicate");
    const second = createExecution("execution:duplicate");
    second.beginExecution(commandContext("attempted-overwrite"));

    expect((await repository.save(first)).isSuccess).toBe(true);
    const before = database.rows();
    const result = await repository.save(second);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(PortfolioExecutionAlreadyExistsError);
    expect(database.rows()).toEqual(before);
  });

  it("performs one compare-and-swap update and advances revision exactly once", async () => {
    const database = new FakePostgresDatabase();
    const repository = new PostgresPortfolioExecutionRepository(database.toDrizzle());
    const execution = createExecution("execution:update");
    const createResult = await repository.save(execution);
    const loaded = expectLoaded(await repository.loadByExecutionId(execution.id));

    loaded.execution.beginExecution(commandContext("begin-update"));
    const updateResult = await repository.save(loaded.execution, expectSuccess(createResult).revision);

    expect(updateResult.isSuccess).toBe(true);
    expect(updateResult.value?.revision.equals(new PortfolioExecutionRevision(2))).toBe(true);
    expect(database.rows()).toHaveLength(1);
    expect(database.rows()[0]?.revision).toBe(2);
    expect(expectLoaded(await repository.loadByExecutionId(execution.id)).execution.lifecycle).toBe(PortfolioExecutionLifecycle.Active);
  });

  it("rejects stale updates without silently overwriting stored state", async () => {
    const database = new FakePostgresDatabase();
    const repository = new PostgresPortfolioExecutionRepository(database.toDrizzle());
    const execution = createExecution("execution:stale");
    expect((await repository.save(execution)).isSuccess).toBe(true);
    const first = expectLoaded(await repository.loadByExecutionId(execution.id));
    const second = expectLoaded(await repository.loadByExecutionId(execution.id));

    first.execution.beginExecution(commandContext("first"));
    expect((await repository.save(first.execution, first.revision)).isSuccess).toBe(true);
    const beforeStale = database.rows();

    second.execution.beginExecution(commandContext("second"));
    const stale = await repository.save(second.execution, second.revision);

    expect(stale.isFailure).toBe(true);
    expect(stale.error).toBeInstanceOf(PortfolioExecutionConcurrencyConflictError);
    expect(database.rows()).toEqual(beforeStale);
  });

  it("throws approved mapping errors from load for corrupt or unsupported persisted rows", async () => {
    const database = new FakePostgresDatabase();
    const repository = new PostgresPortfolioExecutionRepository(database.toDrizzle());
    const execution = createExecution("execution:corrupt");
    const record = PortfolioExecutionRecordMapper.toRecord(execution);

    database.seed({
      executionId: "execution:corrupt",
      recordVersion: PORTFOLIO_EXECUTION_RECORD_VERSION,
      revision: 1,
      aggregatePayload: { ...record.aggregatePayload, id: "" } as PortfolioExecutionAggregatePayload
    });
    await expect(repository.loadByExecutionId(execution.id)).rejects.toBeInstanceOf(PortfolioExecutionPersistenceMappingError);

    database.clear();
    database.seed({
      executionId: "execution:version-one",
      recordVersion: 1,
      revision: 1,
      aggregatePayload: record.aggregatePayload
    });
    await expect(repository.loadByExecutionId(new ExecutionId("execution:version-one"))).rejects.toBeInstanceOf(UnsupportedPortfolioExecutionRecordVersionError);

    database.clear();
    database.seed({
      executionId: "execution:future-version",
      recordVersion: 99,
      revision: 1,
      aggregatePayload: record.aggregatePayload
    });
    await expect(repository.loadByExecutionId(new ExecutionId("execution:future-version"))).rejects.toBeInstanceOf(UnsupportedPortfolioExecutionRecordVersionError);
  });

  it("maps database failures to approved technology-neutral repository errors", async () => {
    const database = new FakePostgresDatabase();
    const repository = new PostgresPortfolioExecutionRepository(database.toDrizzle());
    const execution = createExecution("execution:unavailable");

    database.failNextSelect();
    await expect(repository.loadByExecutionId(execution.id)).rejects.toBeInstanceOf(PortfolioExecutionPersistenceUnavailableError);

    database.failNextInsert();
    const createFailure = await repository.save(execution);
    expect(createFailure.isFailure).toBe(true);
    expect(createFailure.error).toBeInstanceOf(PortfolioExecutionPersistenceUnavailableError);

    expect((await repository.save(execution)).isSuccess).toBe(true);
    database.failNextUpdate();
    const updateFailure = await repository.save(execution, new PortfolioExecutionRevision(1));
    expect(updateFailure.isFailure).toBe(true);
    expect(updateFailure.error).toBeInstanceOf(PortfolioExecutionPersistenceUnavailableError);
  });

  it("keeps adapter internals out of the package root API except the repository", () => {
    const exportedNames = Object.keys(publicApi).sort();

    expect(exportedNames).toEqual([
      "InvalidPortfolioWorkspaceRuntimeConfigurationError",
      "PORTFOLIO_EXECUTION_RECORD_VERSION",
      "PORTFOLIO_WORKSPACE_IDEMPOTENCY_FINGERPRINT_ALGORITHM",
      "PORTFOLIO_WORKSPACE_IDEMPOTENCY_RECORD_VERSION",
      "PORTFOLIO_WORKSPACE_RUNTIME_ENVIRONMENT_VARIABLES",
      "PortfolioExecutionRecordMapper",
      "PortfolioWorkspaceIdempotencyCompletionResult",
      "PortfolioWorkspaceIdempotencyPersistenceError",
      "PortfolioWorkspaceIdempotencyPersistenceOperation",
      "PortfolioWorkspaceIdempotencyPersistenceStatus",
      "PortfolioWorkspaceIdempotencyRecordMapper",
      "PortfolioWorkspaceIdempotencyReleaseResult",
      "PortfolioWorkspaceIdempotencyReservationKind",
      "PortfolioWorkspaceIdempotencyReservationResult",
      "PortfolioWorkspaceIdempotentMutationResult",
      "PortfolioWorkspaceIdempotentMutationResultKind",
      "PortfolioWorkspaceMigrationMode",
      "PortfolioWorkspaceMigrationReadinessError",
      "PortfolioWorkspaceMigrationReadinessResult",
      "PortfolioWorkspacePostgresDatabaseRuntime",
      "PortfolioWorkspaceRuntime",
      "PortfolioWorkspaceRuntimeCompositionError",
      "PortfolioWorkspaceRuntimeConfiguration",
      "PortfolioWorkspaceRuntimeConstructionError",
      "PortfolioWorkspaceRuntimeDisposalError",
      "PortfolioWorkspaceRuntimeEnvironment",
      "PortfolioWorkspaceRuntimeLifecycle",
      "PortfolioWorkspaceRuntimeStatus",
      "PostgresPortfolioExecutionRepository",
      "PostgresPortfolioWorkspaceIdempotencyStore",
      "PostgresPortfolioWorkspaceIdempotentMutationOrchestrator",
      "createPortfolioWorkspacePostgresDatabaseRuntime",
      "createPortfolioWorkspaceRuntime",
      "verifyPortfolioWorkspaceMigrationReadiness"
    ]);
    expect(exportedNames).not.toContain("portfolioExecutions");
    expect(exportedNames).not.toContain("PortfolioExecutionRow");
    expect(exportedNames).not.toContain("NewPortfolioExecutionRow");
  });

  it("keeps PostgreSQL implementation details out of Domain and Application packages", () => {
    const workspaceRoot = join(packageRoot(), "..", "..");
    const domainSource = readFileSync(join(workspaceRoot, "packages", "portfolio-workspace", "src", "index.ts"), "utf8");
    const applicationSource = readFileSync(join(workspaceRoot, "packages", "portfolio-workspace-application", "src", "index.ts"), "utf8");

    expect(domainSource).not.toContain("PostgresPortfolioExecutionRepository");
    expect(applicationSource).not.toContain("PostgresPortfolioExecutionRepository");
    expect(applicationSource).not.toContain("drizzle-orm");
    expect(applicationSource).not.toContain("from \"pg\"");
  });
});

type StoredRow = Omit<PortfolioExecutionRow, "recordVersion"> & {
  readonly recordVersion: number;
};

class FakePostgresDatabase {
  private readonly records = new Map<string, StoredRow>();
  private shouldFailSelect = false;
  private shouldFailInsert = false;
  private shouldFailUpdate = false;

  toDrizzle(): ConstructorParameters<typeof PostgresPortfolioExecutionRepository>[0] {
    return this as unknown as ConstructorParameters<typeof PostgresPortfolioExecutionRepository>[0];
  }

  rows(): readonly StoredRow[] {
    return [...this.records.values()].map((row) => cloneRow(row));
  }

  seed(row: StoredRow): void {
    this.records.set(row.executionId, cloneRow(row));
  }

  clear(): void {
    this.records.clear();
  }

  failNextSelect(): void {
    this.shouldFailSelect = true;
  }

  failNextInsert(): void {
    this.shouldFailInsert = true;
  }

  failNextUpdate(): void {
    this.shouldFailUpdate = true;
  }

  select(): FakeSelectBuilder {
    return new FakeSelectBuilder(this);
  }

  insert(): FakeInsertBuilder {
    return new FakeInsertBuilder(this);
  }

  update(): FakeUpdateBuilder {
    return new FakeUpdateBuilder(this);
  }

  async findByExecutionId(executionId: string): Promise<StoredRow | undefined> {
    if (this.shouldFailSelect) {
      this.shouldFailSelect = false;
      throw new Error("database unavailable");
    }
    const row = this.records.get(executionId);
    return row === undefined ? undefined : cloneRow(row);
  }

  async insertRow(row: StoredRow): Promise<void> {
    if (this.shouldFailInsert) {
      this.shouldFailInsert = false;
      throw new Error("database unavailable");
    }
    if (this.records.has(row.executionId)) {
      throw Object.assign(new Error("duplicate key"), { code: "23505" });
    }
    this.records.set(row.executionId, cloneRow(row));
  }

  async updateRow(executionId: string, expectedRevision: number, row: StoredRow): Promise<readonly { readonly revision: number }[]> {
    if (this.shouldFailUpdate) {
      this.shouldFailUpdate = false;
      throw new Error("database unavailable");
    }
    const current = this.records.get(executionId);
    if (current === undefined || current.revision !== expectedRevision) {
      return [];
    }
    this.records.set(executionId, cloneRow(row));
    return [{ revision: row.revision }];
  }
}

class FakeSelectBuilder {
  private executionId: string | undefined;

  constructor(private readonly database: FakePostgresDatabase) {}

  from(): this {
    return this;
  }

  where(condition: unknown): this {
    this.executionId = firstStringParam(condition);
    return this;
  }

  async limit(): Promise<readonly StoredRow[]> {
    if (this.executionId === undefined) return [];
    const row = await this.database.findByExecutionId(this.executionId);
    return row === undefined ? [] : [row];
  }
}

class FakeInsertBuilder {
  constructor(private readonly database: FakePostgresDatabase) {}

  async values(row: StoredRow): Promise<void> {
    await this.database.insertRow(row);
  }
}

class FakeUpdateBuilder {
  private updates: Omit<StoredRow, "executionId"> | undefined;
  private executionId: string | undefined;
  private expectedRevision: number | undefined;

  constructor(private readonly database: FakePostgresDatabase) {}

  set(updates: Omit<StoredRow, "executionId">): this {
    this.updates = updates;
    return this;
  }

  where(condition: unknown): this {
    const values = conditionParams(condition);
    this.executionId = values.find((value): value is string => typeof value === "string");
    this.expectedRevision = values.find((value): value is number => typeof value === "number");
    return this;
  }

  async returning(): Promise<readonly { readonly revision: number }[]> {
    if (this.executionId === undefined || this.expectedRevision === undefined || this.updates === undefined) {
      return [];
    }
    return this.database.updateRow(this.executionId, this.expectedRevision, {
      executionId: this.executionId,
      ...this.updates
    });
  }
}

function createExecution(id: string): PortfolioExecution {
  return new PortfolioExecution({
    id: new ExecutionId(id),
    portfolioPlanReference: new PortfolioPlanReference({
      planId: `plan:${id}`,
      roadmapId: `roadmap:${id}`,
      planArtifactReference: `artifact:plan:${id}`
    }),
    planSnapshotReference: new PlanSnapshotReference({
      snapshotReference: `snapshot:plan:${id}:v1`
    }),
    approvalReference: new ApprovalReference({
      approvalReference: `approval:plan:${id}`
    }),
    authorizationResourceReference: new PortfolioWorkspaceAuthorizationResourceReference({
      authorizationResourceReference: "portfolio-workspace:execution-owner-1"
    }),
    commandContext: commandContext(`initialization:${id}`),
    lifecycle: PortfolioExecutionLifecycle.Initialized
  });
}

function commandContext(suffix: string): PortfolioExecutionCommandContext {
  return new PortfolioExecutionCommandContext({
    commandId: `command:${suffix}`,
    correlationId: `correlation:${suffix}`,
    actorReference: `actor:${suffix}`,
    occurredAt: "2026-08-01T00:00:00.000Z"
  });
}

function expectLoaded(loaded: LoadedPortfolioExecution | undefined): LoadedPortfolioExecution {
  if (loaded === undefined) {
    throw new Error("Expected loaded aggregate.");
  }

  return loaded;
}

function expectSuccess(result: Result<PortfolioExecutionSaveResult, unknown>): PortfolioExecutionSaveResult {
  if (result.value === undefined) {
    throw new Error("Expected successful save result.");
  }

  return result.value;
}

function firstStringParam(condition: unknown): string | undefined {
  return conditionParams(condition).find((value): value is string => typeof value === "string");
}

function conditionParams(condition: unknown): readonly unknown[] {
  if (typeof condition !== "object" || condition === null) {
    return [];
  }
  if (condition.constructor.name === "Param" && "value" in condition) {
    return [(condition as { readonly value: unknown }).value];
  }
  if ("queryChunks" in condition && Array.isArray((condition as { readonly queryChunks: unknown }).queryChunks)) {
    return (condition as { readonly queryChunks: readonly unknown[] }).queryChunks.flatMap((chunk) => conditionParams(chunk));
  }

  return [];
}

function cloneRow(row: StoredRow): StoredRow {
  return JSON.parse(JSON.stringify(row)) as StoredRow;
}

function packageRoot(): string {
  const packageLocal = process.cwd();
  if (packageLocal.endsWith("infrastructure")) return packageLocal;
  return join(process.cwd(), "packages", "infrastructure");
}
