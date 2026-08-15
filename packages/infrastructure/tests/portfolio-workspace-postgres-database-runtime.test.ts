import { inspect } from "node:util";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";
import { describe, expect, it } from "vitest";
import {
  createPortfolioWorkspaceDrizzleDatabase,
  createPortfolioWorkspacePostgresPool,
  PortfolioWorkspacePostgresDatabaseRuntime,
  PortfolioWorkspaceRuntimeConstructionError,
  toPortfolioWorkspacePostgresPoolConfig
} from "../src/portfolio-workspace/runtime/PortfolioWorkspacePostgresDatabaseRuntime";
import {
  createPortfolioWorkspacePostgresDatabaseRuntime,
  PortfolioWorkspaceMigrationMode,
  PortfolioWorkspaceRuntimeConfiguration,
  PortfolioWorkspaceRuntimeEnvironment
} from "../src";
import * as publicApi from "../src";
import * as schema from "../src/portfolio-workspace/postgres/schema";

const secretUrl = "postgresql://portfolio_user:super-secret-password@localhost:5432/portfolio_workspace";

describe("Portfolio Workspace PostgreSQL database runtime", () => {
  it("maps runtime configuration into pg Pool settings without inventing tuning", async () => {
    const configuration = configurationWith({
      poolMax: 3,
      idleTimeoutMs: 1_500,
      connectionTimeoutMs: 2_500
    });

    const poolConfig = toPortfolioWorkspacePostgresPoolConfig(configuration);
    const pool = createPortfolioWorkspacePostgresPool(configuration);

    try {
      expect(poolConfig).toEqual({
        connectionString: secretUrl,
        max: 3,
        idleTimeoutMillis: 1_500,
        connectionTimeoutMillis: 2_500
      });
      expect(poolConfig).not.toHaveProperty("statement_timeout");
      expect(poolConfig).not.toHaveProperty("query_timeout");
      expect(poolConfig).not.toHaveProperty("application_name");
      expect(pool).toBeDefined();
    } finally {
      await pool.end();
    }
  });

  it("creates a Drizzle database from an already-created Pool", async () => {
    const pool = createPortfolioWorkspacePostgresPool(configurationWith());

    try {
      const database = createPortfolioWorkspaceDrizzleDatabase(pool);

      expect(database).toBeDefined();
      expect(database).not.toBe(pool);
    } finally {
      await pool.end();
    }
  });

  it("creates a narrow database runtime without connecting, querying, or constructing repositories", async () => {
    const result = await createPortfolioWorkspacePostgresDatabaseRuntime(configurationWith());

    expect(result.isSuccess).toBe(true);
    const runtime = expectSuccess(result);

    try {
      expect(runtime.database()).toBeDefined();
      expect(runtime.toJSON()).toEqual({
        configuration: {
          databaseUrlConfigured: true,
          poolMax: 10,
          idleTimeoutMs: 30_000,
          connectionTimeoutMs: 5_000,
          shutdownTimeoutMs: 10_000,
          environment: PortfolioWorkspaceRuntimeEnvironment.Development,
          migrationMode: PortfolioWorkspaceMigrationMode.VerifyOnly
        },
        databaseConfigured: true,
        disposed: false
      });
      expect(Object.isFrozen(runtime)).toBe(true);
      expect(runtime).not.toHaveProperty("pool");
      expect(runtime).not.toHaveProperty("repository");
      expect(runtime).not.toHaveProperty("services");
    } finally {
      await runtime.dispose();
    }
  });

  it("disposes the owned Pool deterministically and idempotently", async () => {
    const pool = new FakePool();
    const runtime = new PortfolioWorkspacePostgresDatabaseRuntime({
      configuration: configurationWith(),
      pool: pool.asPool(),
      database: fakeDatabase()
    });

    await runtime.dispose();
    await runtime.dispose();

    expect(pool.endCalls).toBe(1);
    expect(runtime.isDisposed()).toBe(true);
    expect(runtime.toJSON().disposed).toBe(true);
  });

  it("does not throw when dispose is called after the runtime is already disposed", async () => {
    const pool = new FakePool();
    const runtime = new PortfolioWorkspacePostgresDatabaseRuntime({
      configuration: configurationWith(),
      pool: pool.asPool(),
      database: fakeDatabase()
    });

    await runtime.dispose();
    await expect(runtime.dispose()).resolves.toBeUndefined();

    expect(pool.endCalls).toBe(1);
  });

  it("redacts secrets from runtime serialization, string conversion, inspection, and construction errors", async () => {
    const runtime = new PortfolioWorkspacePostgresDatabaseRuntime({
      configuration: configurationWith(),
      pool: new FakePool().asPool(),
      database: fakeDatabase()
    });
    const error = new PortfolioWorkspaceRuntimeConstructionError("pool-creation-failed");

    for (const output of [
      JSON.stringify(runtime),
      String(runtime),
      inspect(runtime),
      JSON.stringify(error),
      error.message
    ]) {
      expect(output).not.toContain(secretUrl);
      expect(output).not.toContain("super-secret-password");
      expect(output).not.toContain("portfolio_user");
      expect(output).not.toContain("localhost");
    }

    await runtime.dispose();
  });

  it("keeps runtime construction errors immutable and technology-neutral", () => {
    const error = new PortfolioWorkspaceRuntimeConstructionError("drizzle-creation-failed");

    expect(Object.isFrozen(error)).toBe(true);
    expect(error.toJSON()).toEqual({
      name: "PortfolioWorkspaceRuntimeConstructionError",
      code: "PORTFOLIO_WORKSPACE_RUNTIME_CONSTRUCTION_FAILED",
      reason: "drizzle-creation-failed"
    });
    expect(error).not.toHaveProperty("sqlState");
    expect(error).not.toHaveProperty("connectionString");
    expect(error).not.toHaveProperty("pool");
    expect(error).not.toHaveProperty("drizzle");
  });

  it("keeps the public API explicit", () => {
    expect(Object.keys(publicApi).sort()).toEqual([
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
  });

  it("keeps the runtime database factory inside Infrastructure boundaries", () => {
    const databaseRuntimeSource = readFileSync(
      join(packageRoot(), "src", "portfolio-workspace", "runtime", "PortfolioWorkspacePostgresDatabaseRuntime.ts"),
      "utf8"
    );
    const domainSource = readSourceTree(join(workspaceRoot(), "packages", "portfolio-workspace", "src"));
    const applicationSource = readSourceTree(join(workspaceRoot(), "packages", "portfolio-workspace-application", "src"));

    expect(databaseRuntimeSource).not.toContain("PostgresPortfolioExecutionRepository");
    expect(databaseRuntimeSource).not.toContain("BeginExecutionApplicationService");
    expect(databaseRuntimeSource).not.toContain("CompleteWorkItemApplicationService");
    expect(databaseRuntimeSource).not.toContain("AcceptCandidateApplicationService");
    expect(databaseRuntimeSource).not.toContain("RejectCandidateApplicationService");
    expect(databaseRuntimeSource).not.toContain("CompleteExecutionApplicationService");
    expect(databaseRuntimeSource).not.toContain("CancelExecutionApplicationService");
    expect(databaseRuntimeSource).not.toContain("ActivateWorkItemApplicationService");
    expect(databaseRuntimeSource).not.toContain("CancelWorkItemApplicationService");
    expect(databaseRuntimeSource).not.toContain("migrate(");
    expect(databaseRuntimeSource).not.toContain(".query(");
    expect(databaseRuntimeSource).not.toContain("process.env");
    expect(databaseRuntimeSource).not.toContain("transaction");
    expect(domainSource).not.toContain("@career-companion/infrastructure");
    expect(applicationSource).not.toContain("@career-companion/infrastructure");
  });
});

class FakePool {
  endCalls = 0;

  async end(): Promise<void> {
    this.endCalls += 1;
  }

  asPool(): Pool {
    return this as unknown as Pool;
  }
}

function configurationWith(
  overrides: Partial<Parameters<typeof PortfolioWorkspaceRuntimeConfiguration.create>[0]> = {}
): PortfolioWorkspaceRuntimeConfiguration {
  return expectSuccess(PortfolioWorkspaceRuntimeConfiguration.create({
    databaseUrl: secretUrl,
    ...overrides
  }));
}

function fakeDatabase(): NodePgDatabase<typeof schema> {
  return Object.freeze({}) as NodePgDatabase<typeof schema>;
}

function expectSuccess<T>(result: { readonly isSuccess: boolean; readonly value?: T }): T {
  if (!result.isSuccess || result.value === undefined) {
    throw new Error("Expected successful result.");
  }

  return result.value;
}

function packageRoot(): string {
  const packageLocal = process.cwd();
  if (packageLocal.endsWith("infrastructure")) return packageLocal;
  return join(process.cwd(), "packages", "infrastructure");
}

function workspaceRoot(): string {
  const packageLocal = process.cwd();
  if (packageLocal.endsWith("infrastructure")) return join(packageLocal, "..", "..");
  return process.cwd();
}

function readSourceTree(directory: string): string {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = join(directory, entry.name);
      if (entry.isDirectory()) return readSourceTree(entryPath);
      if (!entry.name.endsWith(".ts")) return [];
      return readFileSync(entryPath, "utf8");
    })
    .join("\n");
}
