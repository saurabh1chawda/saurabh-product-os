import { inspect } from "node:util";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { afterEach, describe, expect, it } from "vitest";
import {
  AcceptedArtifactId,
  ApprovalReference,
  ArtifactCandidate,
  ArtifactCandidateLifecycle,
  CandidateId,
  ExecutionId,
  PlanSnapshotReference,
  PortfolioExecution,
  PortfolioExecutionCommandContext,
  PortfolioExecutionLifecycle,
  PortfolioPlanReference,
  PortfolioWorkspaceAuthorizationResourceReference,
  PortfolioWorkItem,
  PortfolioWorkItemLifecycle,
  WorkItemId
} from "@career-companion/portfolio-workspace";
import {
  AcceptCandidateInput,
  ActivateWorkItemInput,
  BeginExecutionInput,
  CancelExecutionInput,
  CancelWorkItemInput,
  CompleteExecutionInput,
  CompleteWorkItemInput,
  GetPortfolioExecutionInput,
  InitializeArtifactCandidateDefinition,
  InitializePortfolioExecutionInput,
  InitializePortfolioWorkItemDefinition,
  PortfolioExecutionConcurrencyConflictError,
  PortfolioExecutionNotFoundError,
  RejectCandidateInput
} from "@career-companion/portfolio-workspace-application";
import {
  createPortfolioWorkspaceRuntime,
  PortfolioWorkspaceMigrationMode,
  PortfolioWorkspaceMigrationReadinessError,
  PortfolioWorkspaceRuntime,
  PortfolioWorkspaceRuntimeCompositionError,
  PortfolioWorkspaceRuntimeConfiguration,
  PortfolioWorkspaceRuntimeEnvironment,
  PortfolioWorkspaceRuntimeLifecycle,
  PostgresPortfolioExecutionRepository
} from "../src";
import { portfolioWorkspaceMigrationMetadataTableFor } from "../src/portfolio-workspace/runtime/PortfolioWorkspaceMigrationReadiness";
import * as schema from "../src/portfolio-workspace/postgres/schema";
import type { PortfolioWorkspacePostgresDatabase } from "../src/portfolio-workspace/runtime";
import { assertSafePortfolioWorkspaceTestDatabaseUrl } from "./portfolio-workspace-postgres-test-harness";

const liveDatabaseUrl = process.env.PORTFOLIO_WORKSPACE_TEST_DATABASE_URL?.trim();
const describeLive = liveDatabaseUrl === undefined ? describe.skip : describe;
const runtimeLiveHarnesses: RuntimeLiveHarness[] = [];

describeLive("PortfolioWorkspaceRuntime live PostgreSQL composition", () => {
  afterEach(async () => {
    while (runtimeLiveHarnesses.length > 0) {
      await runtimeLiveHarnesses.pop()?.dispose();
    }
  });

  it("applies committed migrations in development and test modes on clean schemas", async () => {
    for (const environment of [
      PortfolioWorkspaceRuntimeEnvironment.Development,
      PortfolioWorkspaceRuntimeEnvironment.Test
    ]) {
      const harness = await createHarness();
      const runtime = await expectRuntime(harness, {
        environment,
        migrationMode: PortfolioWorkspaceMigrationMode.Apply
      });

      expect(runtime).toBeInstanceOf(PortfolioWorkspaceRuntime);
      expect(runtime.lifecycle()).toBe(PortfolioWorkspaceRuntimeLifecycle.Ready);
      expect(runtime.isLive()).toBe(true);
      expect(runtime.isReady()).toBe(true);
      expect(runtime.toJSON()).toMatchObject({
        live: true,
        ready: true,
        lifecycle: PortfolioWorkspaceRuntimeLifecycle.Ready,
        environment,
        migrationMode: PortfolioWorkspaceMigrationMode.Apply,
        migrationState: "applied-and-compatible",
        disposed: false
      });
      expect(await harness.tableExists("portfolio_executions")).toBe(true);
      expect(await harness.appliedMigrationCount()).toBe(1);

      await runtime.dispose();
      expect(runtime.lifecycle()).toBe(PortfolioWorkspaceRuntimeLifecycle.Disposed);
    }
  });

  it("fails verify-only before migration, then succeeds after apply without reapplying", async () => {
    const harness = await createHarness();

    const cleanVerify = await createPortfolioWorkspaceRuntime(configurationFor(harness, {
      migrationMode: PortfolioWorkspaceMigrationMode.VerifyOnly
    }));
    expect(cleanVerify.isFailure).toBe(true);
    expect(cleanVerify.error).toBeInstanceOf(PortfolioWorkspaceMigrationReadinessError);
    expect((cleanVerify.error as PortfolioWorkspaceMigrationReadinessError).reason).toBe("migration-required");

    const applyingRuntime = await expectRuntime(harness, {
      migrationMode: PortfolioWorkspaceMigrationMode.Apply
    });
    expect(await harness.appliedMigrationCount()).toBe(1);
    await applyingRuntime.dispose();

    const verifyingRuntime = await expectRuntime(harness, {
      migrationMode: PortfolioWorkspaceMigrationMode.VerifyOnly
    });
    expect(verifyingRuntime.toJSON()).toMatchObject({
      ready: true,
      migrationMode: PortfolioWorkspaceMigrationMode.VerifyOnly,
      migrationState: "compatible"
    });
    expect(await harness.appliedMigrationCount()).toBe(1);
    await verifyingRuntime.dispose();
  });

  it("rejects unsafe apply policy before opening database resources", async () => {
    for (const environment of [
      PortfolioWorkspaceRuntimeEnvironment.Staging,
      PortfolioWorkspaceRuntimeEnvironment.Production
    ]) {
      const configuration = expectSuccess(PortfolioWorkspaceRuntimeConfiguration.create({
        databaseUrl: "postgresql://portfolio_user:secret@example.invalid/portfolio_workspace_test",
        environment,
        migrationMode: PortfolioWorkspaceMigrationMode.Apply
      }));

      const result = await createPortfolioWorkspaceRuntime(configuration);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(PortfolioWorkspaceRuntimeCompositionError);
      expect((result.error as PortfolioWorkspaceRuntimeCompositionError).toJSON()).toEqual({
        name: "PortfolioWorkspaceRuntimeCompositionError",
        code: "PORTFOLIO_WORKSPACE_RUNTIME_COMPOSITION_FAILED",
        reason: "invalid-migration-policy",
        environment,
        migrationMode: PortfolioWorkspaceMigrationMode.Apply
      });
      expect(safeOutput(result.error)).not.toContain("secret");
      expect(safeOutput(result.error)).not.toContain("example.invalid");
    }
  });

  it("composes all ten services and persists a non-trivial workflow initialized through the runtime", async () => {
    const harness = await createHarness();
    const runtime = await expectRuntime(harness, {
      migrationMode: PortfolioWorkspaceMigrationMode.Apply
    });
    const repository = harness.repository();
    const executionId = new ExecutionId("execution:runtime-flow");
    const activeWorkItemId = new WorkItemId("work-item:runtime-active");
    const cancelledWorkItemId = new WorkItemId("work-item:runtime-cancelled");
    const acceptedCandidateId = new CandidateId("candidate:runtime-accepted");
    const rejectedCandidateId = new CandidateId("candidate:runtime-rejected");
    const acceptedArtifactId = new AcceptedArtifactId("accepted-artifact:runtime-accepted");

    const initialized = expectSuccess(await initializeExecution(runtime, {
      executionId,
      workItemIds: [activeWorkItemId, cancelledWorkItemId],
      candidateIds: [acceptedCandidateId, rejectedCandidateId],
      contextSuffix: "runtime-flow-initialize"
    }));
    expect(initialized.fact.commandContext.correlationId).toBe(initialized.correlationId);
    expect(initialized.summary.lifecycle).toBe(PortfolioExecutionLifecycle.Initialized);

    const initializedLoaded = expectLoaded(await repository.loadByExecutionId(executionId));
    expect(initializedLoaded.revision.toJSON()).toBe(1);
    expect(initializedLoaded.execution.lifecycle).toBe(PortfolioExecutionLifecycle.Initialized);
    expect(initializedLoaded.execution.findWorkItem(activeWorkItemId)?.lifecycle).toBe(PortfolioWorkItemLifecycle.Pending);
    expect(initializedLoaded.execution.findWorkItem(cancelledWorkItemId)?.lifecycle).toBe(PortfolioWorkItemLifecycle.Pending);
    expect(initializedLoaded.execution.findCandidate(acceptedCandidateId)?.lifecycle).toBe(ArtifactCandidateLifecycle.Registered);
    expect(initializedLoaded.execution.findCandidate(rejectedCandidateId)?.lifecycle).toBe(ArtifactCandidateLifecycle.Registered);
    expect(initializedLoaded.execution.acceptedArtifacts()).toHaveLength(0);

    const queried = expectSuccess(await runtime.getPortfolioExecution.get(new GetPortfolioExecutionInput({
      executionId,
      correlationId: "correlation:runtime-flow-query"
    })));
    expect(queried.correlationId).toBe("correlation:runtime-flow-query");
    expect(queried.summary.lifecycle).toBe(PortfolioExecutionLifecycle.Initialized);
    expect(queried.toJSON()).not.toHaveProperty("fact");
    expect(queried.toJSON()).not.toHaveProperty("revision");
    const afterQueryLoaded = expectLoaded(await repository.loadByExecutionId(executionId));
    expect(afterQueryLoaded.revision.toJSON()).toBe(initializedLoaded.revision.toJSON());
    expect(afterQueryLoaded.execution.toJSON()).toEqual(initializedLoaded.execution.toJSON());

    const missingQuery = await runtime.getPortfolioExecution.get(new GetPortfolioExecutionInput({
      executionId: new ExecutionId("execution:runtime-flow-missing"),
      correlationId: "correlation:runtime-flow-missing-query"
    }));
    expect(missingQuery.isFailure).toBe(true);
    expect(missingQuery.error).toBeInstanceOf(PortfolioExecutionNotFoundError);

    const begin = expectSuccess(await runtime.beginExecution.begin(new BeginExecutionInput({
      executionId,
      commandContext: commandContext("runtime-flow-begin")
    })));
    expect(begin.correlationId).toBe(begin.fact.commandContext.correlationId);

    const activated = expectSuccess(await runtime.activateWorkItem.activate(new ActivateWorkItemInput({
      executionId,
      workItemId: activeWorkItemId,
      commandContext: commandContext("runtime-flow-activate")
    })));
    expect(activated.workItemSummary.lifecycle).toBe(PortfolioWorkItemLifecycle.Active);

    expectSuccess(await runtime.completeWorkItem.complete(new CompleteWorkItemInput({
      executionId,
      workItemId: activeWorkItemId,
      commandContext: commandContext("runtime-flow-complete-work-item")
    })));
    expectSuccess(await runtime.cancelWorkItem.cancel(new CancelWorkItemInput({
      executionId,
      workItemId: cancelledWorkItemId,
      commandContext: commandContext("runtime-flow-cancel-work-item")
    })));
    const accepted = expectSuccess(await runtime.acceptCandidate.accept(new AcceptCandidateInput({
      executionId,
      candidateId: acceptedCandidateId,
      acceptedArtifactId,
      commandContext: commandContext("runtime-flow-accept-candidate")
    })));
    expect(accepted.acceptedArtifactSummary.id).toBe(acceptedArtifactId.toJSON());
    expectSuccess(await runtime.rejectCandidate.reject(new RejectCandidateInput({
      executionId,
      candidateId: rejectedCandidateId,
      commandContext: commandContext("runtime-flow-reject-candidate")
    })));
    const completed = expectSuccess(await runtime.completeExecution.complete(new CompleteExecutionInput({
      executionId,
      commandContext: commandContext("runtime-flow-complete-execution")
    })));
    expect(completed.summary.lifecycle).toBe(PortfolioExecutionLifecycle.Completed);

    const loaded = expectLoaded(await repository.loadByExecutionId(executionId));
    expect(loaded.revision.toJSON()).toBe(8);
    expect(loaded.execution.lifecycle).toBe(PortfolioExecutionLifecycle.Completed);
    expect(loaded.execution.findWorkItem(activeWorkItemId)?.lifecycle).toBe(PortfolioWorkItemLifecycle.Completed);
    expect(loaded.execution.findWorkItem(cancelledWorkItemId)?.lifecycle).toBe(PortfolioWorkItemLifecycle.Cancelled);
    expect(loaded.execution.findCandidate(acceptedCandidateId)?.lifecycle).toBe(ArtifactCandidateLifecycle.Accepted);
    expect(loaded.execution.findCandidate(rejectedCandidateId)?.lifecycle).toBe(ArtifactCandidateLifecycle.Rejected);
    expect(loaded.execution.findAcceptedArtifact(acceptedArtifactId)?.id.toJSON()).toBe(acceptedArtifactId.toJSON());

    await runtime.dispose();
  });

  it("exercises cancellation service against the composed runtime", async () => {
    const harness = await createHarness();
    const runtime = await expectRuntime(harness, {
      migrationMode: PortfolioWorkspaceMigrationMode.Apply
    });
    const repository = harness.repository();
    const executionId = new ExecutionId("execution:runtime-cancel");
    expectSuccess(await initializeExecution(runtime, {
      executionId,
      workItemIds: [new WorkItemId("work-item:runtime-cancel")],
      candidateIds: [new CandidateId("candidate:runtime-cancel")],
      contextSuffix: "runtime-cancel-initialize"
    }));

    const result = expectSuccess(await runtime.cancelExecution.cancel(new CancelExecutionInput({
      executionId,
      commandContext: commandContext("runtime-cancel-execution")
    })));

    expect(result.fact.commandContext.correlationId).toBe(result.correlationId);
    expect(result.summary.lifecycle).toBe(PortfolioExecutionLifecycle.Cancelled);
    const loaded = expectLoaded(await repository.loadByExecutionId(executionId));
    expect(loaded.revision.toJSON()).toBe(2);
    expect(loaded.execution.lifecycle).toBe(PortfolioExecutionLifecycle.Cancelled);

    await runtime.dispose();
  });

  it("validates optimistic concurrency against the runtime database path", async () => {
    const harness = await createHarness();
    const runtime = await expectRuntime(harness, {
      migrationMode: PortfolioWorkspaceMigrationMode.Apply
    });
    const repository = harness.repository();
    const executionId = new ExecutionId("execution:runtime-concurrency");
    expect((await repository.save(createExecution({
      id: executionId,
      workItemIds: [new WorkItemId("work-item:runtime-concurrency-a"), new WorkItemId("work-item:runtime-concurrency-b")],
      candidateIds: [new CandidateId("candidate:runtime-concurrency")]
    }))).isSuccess).toBe(true);

    expectSuccess(await runtime.beginExecution.begin(new BeginExecutionInput({
      executionId,
      commandContext: commandContext("runtime-concurrency-begin")
    })));

    const copyA = expectLoaded(await repository.loadByExecutionId(executionId));
    const copyB = expectLoaded(await repository.loadByExecutionId(executionId));
    copyA.execution.activateWorkItem(new WorkItemId("work-item:runtime-concurrency-a"), commandContext("runtime-concurrency-copy-a"));
    copyB.execution.cancelWorkItem(new WorkItemId("work-item:runtime-concurrency-b"), commandContext("runtime-concurrency-copy-b"));

    const savedA = await repository.save(copyA.execution, copyA.revision);
    expect(savedA.isSuccess).toBe(true);
    const stale = await repository.save(copyB.execution, copyB.revision);
    expect(stale.isFailure).toBe(true);
    expect(stale.error).toBeInstanceOf(PortfolioExecutionConcurrencyConflictError);
    expect(safeOutput(stale.error)).not.toContain("portfolio_executions");

    const loaded = expectLoaded(await repository.loadByExecutionId(executionId));
    expect(loaded.execution.findWorkItem(new WorkItemId("work-item:runtime-concurrency-a"))?.lifecycle).toBe(PortfolioWorkItemLifecycle.Active);
    expect(loaded.execution.findWorkItem(new WorkItemId("work-item:runtime-concurrency-b"))?.lifecycle).toBe(PortfolioWorkItemLifecycle.Pending);

    await runtime.dispose();
  });

  it("validates lifecycle, readiness, concurrent disposal, and safe status serialization with a real Pool", async () => {
    const harness = await createHarness();
    const runtime = await expectRuntime(harness, {
      migrationMode: PortfolioWorkspaceMigrationMode.Apply
    });

    expect(runtime.status().toJSON()).toEqual({
      live: true,
      ready: true,
      lifecycle: PortfolioWorkspaceRuntimeLifecycle.Ready,
      disposed: false
    });
    expect(runtime).not.toHaveProperty("pool");
    expect(runtime).not.toHaveProperty("database");
    expect(runtime).not.toHaveProperty("repository");

    const firstDispose = runtime.dispose();
    const secondDispose = runtime.dispose();
    expect(runtime.lifecycle()).toBe(PortfolioWorkspaceRuntimeLifecycle.Disposing);
    expect(runtime.isReady()).toBe(false);

    await firstDispose;
    await secondDispose;
    await runtime.dispose();

    expect(runtime.status().toJSON()).toEqual({
      live: false,
      ready: false,
      lifecycle: PortfolioWorkspaceRuntimeLifecycle.Disposed,
      disposed: true,
      notReadyReason: "disposed"
    });
    expect(JSON.stringify(runtime)).not.toContain(liveDatabaseUrl);
    expect(JSON.stringify(runtime)).not.toContain(databaseName(liveDatabaseUrl!));
  });

  it("cleans up partial startup after schema incompatibility", async () => {
    const harness = await createHarness();
    await harness.applyMigrationsThroughRuntime();
    await harness.query(`DROP TABLE portfolio_executions`);

    const result = await createPortfolioWorkspaceRuntime(configurationFor(harness, {
      migrationMode: PortfolioWorkspaceMigrationMode.VerifyOnly
    }));

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(PortfolioWorkspaceMigrationReadinessError);
    expect((result.error as PortfolioWorkspaceMigrationReadinessError).reason).toBe("schema-incompatible");
    expect(await harness.canDropSchema()).toBe(true);
    expect(safeOutput(result.error)).not.toContain(liveDatabaseUrl);
    expect(safeOutput(result.error)).not.toContain(databaseName(liveDatabaseUrl!));
  });

  it("keeps runtime integration and production boundaries narrow", () => {
    const runtimeSource = readSourceTree(join(packageRoot(), "src", "portfolio-workspace", "runtime"));
    const packageJson = readFileSync(join(packageRoot(), "package.json"), "utf8");

    expect(packageJson).toContain("test:integration:portfolio-workspace-runtime");
    expect(runtimeSource).not.toContain("process.env");
    expect(runtimeSource).not.toContain("setTimeout");
    expect(runtimeSource).not.toContain("setInterval");
    expect(runtimeSource).not.toContain("Controller");
    expect(runtimeSource).not.toContain("GraphQL");
    expect(runtimeSource).not.toContain("ServiceLocator");
    expect(runtimeSource).not.toContain("CommandBus");
    expect(runtimeSource).not.toContain("InMemoryPortfolioExecutionRepository");
    expect(runtimeSource).not.toContain("InitializePortfolioExecutionInput");
    expect(runtimeSource).not.toContain("PortfolioExecution.initialize");
  });
});

class RuntimeLiveHarness {
  readonly #adminPool: Pool;
  readonly #repositoryPools: Pool[] = [];
  readonly #schemaName: string;
  readonly #baseConnectionString: string;

  private constructor(input: {
    readonly adminPool: Pool;
    readonly schemaName: string;
    readonly baseConnectionString: string;
  }) {
    this.#adminPool = input.adminPool;
    this.#schemaName = input.schemaName;
    this.#baseConnectionString = input.baseConnectionString;
  }

  static async create(connectionString: string): Promise<RuntimeLiveHarness> {
    assertSafePortfolioWorkspaceTestDatabaseUrl(connectionString);
    const schemaName = uniquePostgresSchemaName("pwr");
    const adminPool = new Pool({ connectionString, max: 1 });
    try {
      await adminPool.query(`CREATE SCHEMA ${quoteIdentifier(schemaName)}`);
      return new RuntimeLiveHarness({
        adminPool,
        schemaName,
        baseConnectionString: connectionString
      });
    } catch (error) {
      await adminPool.end();
      throw error;
    }
  }

  runtimeDatabaseUrl(): string {
    const parsed = new URL(this.#baseConnectionString);
    parsed.searchParams.set("options", `-c search_path=${this.#schemaName}`);
    return parsed.toString();
  }

  repository(): PostgresPortfolioExecutionRepository {
    return new PostgresPortfolioExecutionRepository(this.database());
  }

  database(): PortfolioWorkspacePostgresDatabase {
    const pool = new Pool({
      connectionString: this.#baseConnectionString,
      max: 1,
      options: `-c search_path=${this.#schemaName}`
    });
    this.#repositoryPools.push(pool);

    return drizzle(pool, {
      schema
    }) as NodePgDatabase<typeof schema>;
  }

  async query<T extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    values: readonly unknown[] = []
  ): Promise<readonly T[]> {
    await this.#adminPool.query(`SET search_path TO ${quoteIdentifier(this.#schemaName)}`);
    const result = await this.#adminPool.query(text, [...values]);
    return result.rows as readonly T[];
  }

  async tableExists(tableName: string): Promise<boolean> {
    const rows = await this.query<{ readonly exists: boolean }>(
      "SELECT to_regclass($1) IS NOT NULL AS exists",
      [tableName]
    );
    return rows[0]?.exists === true;
  }

  async appliedMigrationCount(): Promise<number> {
    const rows = await this.#adminPool.query<{ readonly count: string }>(
      `SELECT count(*)::text AS count FROM drizzle.${quoteIdentifier(this.migrationMetadataTableName())}`
    );
    return Number(rows.rows[0]?.count ?? 0);
  }

  async applyMigrationsThroughRuntime(): Promise<void> {
    const runtime = await expectRuntime(this, {
      migrationMode: PortfolioWorkspaceMigrationMode.Apply
    });
    await runtime.dispose();
  }

  async canDropSchema(): Promise<boolean> {
    await this.#adminPool.query(`DROP SCHEMA ${quoteIdentifier(this.#schemaName)} CASCADE`);
    await this.#adminPool.query(`CREATE SCHEMA ${quoteIdentifier(this.#schemaName)}`);
    return true;
  }

  async dispose(): Promise<void> {
    try {
      while (this.#repositoryPools.length > 0) {
        await this.#repositoryPools.pop()?.end();
      }
      await this.#adminPool.query(`DROP SCHEMA IF EXISTS ${quoteIdentifier(this.#schemaName)} CASCADE`);
      await this.#adminPool.query(`DROP TABLE IF EXISTS drizzle.${quoteIdentifier(this.migrationMetadataTableName())}`);
    } finally {
      await this.#adminPool.end();
    }
  }

  private migrationMetadataTableName(): string {
    return portfolioWorkspaceMigrationMetadataTableFor(this.#schemaName);
  }
}

async function createHarness(): Promise<RuntimeLiveHarness> {
  if (liveDatabaseUrl === undefined) {
    throw new Error("PORTFOLIO_WORKSPACE_TEST_DATABASE_URL is required.");
  }
  const harness = await RuntimeLiveHarness.create(liveDatabaseUrl);
  runtimeLiveHarnesses.push(harness);
  return harness;
}

async function expectRuntime(
  harness: RuntimeLiveHarness,
  overrides: Partial<Parameters<typeof configurationFor>[1]> = {}
): Promise<PortfolioWorkspaceRuntime> {
  const result = await createPortfolioWorkspaceRuntime(configurationFor(harness, overrides));
  if (!result.isSuccess || result.value === undefined) {
    throw new Error(`Expected runtime composition success: ${safeOutput(result.error)}`);
  }
  return result.value;
}

function configurationFor(
  harness: RuntimeLiveHarness,
  overrides: Partial<Parameters<typeof PortfolioWorkspaceRuntimeConfiguration.create>[0]> = {}
): PortfolioWorkspaceRuntimeConfiguration {
  return expectSuccess(PortfolioWorkspaceRuntimeConfiguration.create({
    databaseUrl: harness.runtimeDatabaseUrl(),
    environment: PortfolioWorkspaceRuntimeEnvironment.Development,
    migrationMode: PortfolioWorkspaceMigrationMode.VerifyOnly,
    poolMax: 1,
    connectionTimeoutMs: 5_000,
    idleTimeoutMs: 1_000,
    shutdownTimeoutMs: 1_000,
    ...overrides
  }));
}

function createExecution(input: {
  readonly id: ExecutionId;
  readonly workItemIds: readonly WorkItemId[];
  readonly candidateIds: readonly CandidateId[];
}): PortfolioExecution {
  const id = input.id.toJSON();
  return new PortfolioExecution({
    id: input.id,
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
    lifecycle: PortfolioExecutionLifecycle.Initialized,
    workItems: input.workItemIds.map((workItemId) => new PortfolioWorkItem({
      id: workItemId,
      lifecycle: PortfolioWorkItemLifecycle.Pending
    })),
    candidates: input.candidateIds.map((candidateId) => new ArtifactCandidate({
      id: candidateId,
      lifecycle: ArtifactCandidateLifecycle.Registered
    }))
  });
}

async function initializeExecution(
  runtime: PortfolioWorkspaceRuntime,
  input: {
    readonly executionId: ExecutionId;
    readonly workItemIds: readonly WorkItemId[];
    readonly candidateIds: readonly CandidateId[];
    readonly contextSuffix: string;
  }
) {
  const id = input.executionId.toJSON();
  return runtime.initializePortfolioExecution.initialize(new InitializePortfolioExecutionInput({
    executionId: input.executionId,
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
    commandContext: commandContext(input.contextSuffix),
    workItems: input.workItemIds.map((workItemId) => new InitializePortfolioWorkItemDefinition({
      workItemId
    })),
    candidates: input.candidateIds.map((candidateId) => new InitializeArtifactCandidateDefinition({
      candidateId
    }))
  }));
}

function commandContext(suffix: string): PortfolioExecutionCommandContext {
  return new PortfolioExecutionCommandContext({
    commandId: `command:${suffix}`,
    correlationId: `correlation:${suffix}`,
    actorReference: `actor:${suffix}`,
    occurredAt: "2026-08-04T00:00:00.000Z"
  });
}

function expectSuccess<T>(result: { readonly isSuccess: boolean; readonly value?: T; readonly error?: unknown }): T {
  if (!result.isSuccess || result.value === undefined) {
    throw new Error(`Expected success: ${safeOutput(result.error)}`);
  }
  return result.value;
}

function expectLoaded<T>(loaded: T | undefined): T {
  if (loaded === undefined) {
    throw new Error("Expected PortfolioExecution to load.");
  }
  return loaded;
}

function safeOutput(value: unknown): string {
  return [
    JSON.stringify(value),
    String(value),
    inspect(value)
  ].join("\n");
}

function databaseName(value: string): string {
  return decodeURIComponent(new URL(value).pathname.replace(/^\//, ""));
}

function packageRoot(): string {
  const packageLocal = process.cwd();
  if (packageLocal.endsWith("infrastructure")) return packageLocal;
  return join(process.cwd(), "packages", "infrastructure");
}

function readSourceTree(directory: string): string {
  return readFileSync(join(directory, "PortfolioWorkspaceRuntime.ts"), "utf8");
}

function quoteIdentifier(value: string): string {
  return `"${value.replace(/"/g, "\"\"")}"`;
}

function uniquePostgresSchemaName(prefix: string): string {
  const schemaName = `${prefix}_${process.pid.toString(36)}_${Date.now().toString(36)}_${Math.random().toString(16).slice(2, 10)}`;
  if (schemaName.length > 63) {
    throw new Error("Generated PostgreSQL test schema name exceeds the identifier limit.");
  }
  return schemaName;
}
