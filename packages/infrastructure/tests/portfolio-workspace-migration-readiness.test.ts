import { inspect } from "node:util";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { readMigrationFiles } from "drizzle-orm/migrator";
import { describe, expect, it } from "vitest";
import {
  PortfolioWorkspaceMigrationReadinessError,
  PortfolioWorkspaceMigrationReadinessResult,
  portfolioWorkspaceMigrationMetadataTableFor,
  verifyPortfolioWorkspaceMigrationReadinessWithDependencies,
  portfolioWorkspaceMigrationsFolder
} from "../src/portfolio-workspace/runtime/PortfolioWorkspaceMigrationReadiness";
import type { PortfolioWorkspacePostgresDatabase } from "../src/portfolio-workspace/runtime/PortfolioWorkspacePostgresDatabaseRuntime";
import {
  PortfolioWorkspaceMigrationMode,
  PortfolioWorkspaceRuntimeConfiguration,
  PortfolioWorkspaceRuntimeEnvironment
} from "../src/portfolio-workspace/runtime/PortfolioWorkspaceRuntimeConfiguration";
import {
  PortfolioWorkspaceMigrationReadinessResult as PublicPortfolioWorkspaceMigrationReadinessResult,
  verifyPortfolioWorkspaceMigrationReadiness
} from "../src";
import * as publicApi from "../src";

const secretUrl = "postgresql://portfolio_user:super-secret-password@localhost:5432/portfolio_workspace";

describe("Portfolio Workspace migration readiness", () => {
  it("verifies an already migrated database without applying migrations", async () => {
    const migrations = committedMigrations();
    const database = new FakeDatabase()
      .queueSuccess()
      .queueSuccess({ rows: [{ current_schema: "public" }] })
      .queueSuccess({
        rows: migrations.map((migration) => ({
          hash: migration.hash,
          created_at: migration.folderMillis
        }))
      })
      .queueSuccess({ rows: compatibleColumns() });
    const runner = new FakeMigrationRunner();

    const result = await verifyPortfolioWorkspaceMigrationReadinessWithDependencies({
      configuration: configurationWith({ migrationMode: PortfolioWorkspaceMigrationMode.VerifyOnly }),
      database: database.asDatabase()
    }, {
      migrationsFolder: portfolioWorkspaceMigrationsFolder(),
      runMigrations: runner.run
    });

    expect(result.isSuccess).toBe(true);
    const readiness = expectSuccess(result);
    expect(readiness).toBeInstanceOf(PortfolioWorkspaceMigrationReadinessResult);
    expect(readiness.toJSON()).toEqual({
      ready: true,
      databaseReachable: true,
      migrationMode: PortfolioWorkspaceMigrationMode.VerifyOnly,
      migrationState: "compatible",
      committedMigrationCount: 2,
      appliedMigrationCount: 2,
      latestCommittedMigrationTimestamp: migrations.at(-1)?.folderMillis,
      latestAppliedMigrationTimestamp: migrations.at(-1)?.folderMillis
    });
    expect(readiness.equals(new PortfolioWorkspaceMigrationReadinessResult(readiness.toJSON()))).toBe(true);
    expect(Object.isFrozen(readiness)).toBe(true);
    expect(database.executeCalls).toBe(4);
    expect(runner.calls).toBe(0);
  });

  it("applies migrations before compatibility verification when configured to apply", async () => {
    const migrations = committedMigrations();
    const database = new FakeDatabase()
      .queueSuccess()
      .queueSuccess({ rows: [{ current_schema: "portfolio_workspace_runtime_test" }] })
      .queueSuccess({
        rows: migrations.map((migration) => ({
          hash: migration.hash,
          created_at: migration.folderMillis
        }))
      })
      .queueSuccess({ rows: compatibleColumns() });
    const runner = new FakeMigrationRunner();

    const result = await verifyPortfolioWorkspaceMigrationReadinessWithDependencies({
      configuration: configurationWith({ migrationMode: PortfolioWorkspaceMigrationMode.Apply }),
      database: database.asDatabase()
    }, {
      migrationsFolder: portfolioWorkspaceMigrationsFolder(),
      runMigrations: runner.run
    });

    expect(result.isSuccess).toBe(true);
    expect(expectSuccess(result).migrationState).toBe("applied-and-compatible");
    expect(runner.calls).toBe(1);
    expect(runner.lastMigrationConfig).toEqual({
      migrationsFolder: portfolioWorkspaceMigrationsFolder(),
      migrationsSchema: "drizzle",
      migrationsTable: portfolioWorkspaceMigrationMetadataTableFor("portfolio_workspace_runtime_test")
    });
  });

  it("reports migration-required in verify-only mode when migration metadata is absent", async () => {
    const database = new FakeDatabase()
      .queueSuccess()
      .queueSuccess({ rows: [{ current_schema: "public" }] })
      .queueFailure(new Error("missing migration metadata"));

    const result = await verifyPortfolioWorkspaceMigrationReadinessWithDependencies({
      configuration: configurationWith({ migrationMode: PortfolioWorkspaceMigrationMode.VerifyOnly }),
      database: database.asDatabase()
    }, {
      migrationsFolder: portfolioWorkspaceMigrationsFolder(),
      runMigrations: new FakeMigrationRunner().run
    });

    expect(result.isFailure).toBe(true);
    expect(expectFailure(result).toJSON()).toEqual({
      name: "PortfolioWorkspaceMigrationReadinessError",
      code: "PORTFOLIO_WORKSPACE_MIGRATION_READINESS_FAILED",
      reason: "migration-required",
      migrationMode: PortfolioWorkspaceMigrationMode.VerifyOnly
    });
  });

  it("reports incompatible migration metadata when the database has unexpected migration history", async () => {
    const migrations = committedMigrations();
    const database = new FakeDatabase()
      .queueSuccess()
      .queueSuccess({ rows: [{ current_schema: "public" }] })
      .queueSuccess({
        rows: migrations.map((migration, index) => ({
          hash: index === 0 ? "unexpected-hash" : migration.hash,
          created_at: migration.folderMillis
        }))
      });

    const result = await verifyPortfolioWorkspaceMigrationReadinessWithDependencies({
      configuration: configurationWith(),
      database: database.asDatabase()
    }, {
      migrationsFolder: portfolioWorkspaceMigrationsFolder(),
      runMigrations: new FakeMigrationRunner().run
    });

    expect(result.isFailure).toBe(true);
    expect(expectFailure(result).reason).toBe("migration-metadata-incompatible");
  });

  it("reports schema incompatibility after migration metadata is compatible", async () => {
    const migrations = committedMigrations();
    const database = new FakeDatabase()
      .queueSuccess()
      .queueSuccess({ rows: [{ current_schema: "public" }] })
      .queueSuccess({
        rows: migrations.map((migration) => ({
          hash: migration.hash,
          created_at: migration.folderMillis
        }))
      })
      .queueSuccess({
        rows: compatibleColumns().filter((column) => column.column_name !== "aggregate_payload")
      });

    const result = await verifyPortfolioWorkspaceMigrationReadinessWithDependencies({
      configuration: configurationWith(),
      database: database.asDatabase()
    }, {
      migrationsFolder: portfolioWorkspaceMigrationsFolder(),
      runMigrations: new FakeMigrationRunner().run
    });

    expect(result.isFailure).toBe(true);
    expect(expectFailure(result).reason).toBe("schema-incompatible");
  });

  it("reports database unavailability before attempting migration or schema verification", async () => {
    const database = new FakeDatabase().queueFailure(new Error("connection refused"));
    const runner = new FakeMigrationRunner();

    const result = await verifyPortfolioWorkspaceMigrationReadinessWithDependencies({
      configuration: configurationWith({ migrationMode: PortfolioWorkspaceMigrationMode.Apply }),
      database: database.asDatabase()
    }, {
      migrationsFolder: portfolioWorkspaceMigrationsFolder(),
      runMigrations: runner.run
    });

    expect(result.isFailure).toBe(true);
    expect(expectFailure(result).reason).toBe("database-unavailable");
    expect(database.executeCalls).toBe(1);
    expect(runner.calls).toBe(0);
  });

  it("requires PostgreSQL to resolve an active schema before deriving migration metadata", async () => {
    const database = new FakeDatabase()
      .queueSuccess()
      .queueSuccess({ rows: [{ current_schema: undefined }] });
    const runner = new FakeMigrationRunner();

    const result = await verifyPortfolioWorkspaceMigrationReadinessWithDependencies({
      configuration: configurationWith({ migrationMode: PortfolioWorkspaceMigrationMode.Apply }),
      database: database.asDatabase()
    }, {
      migrationsFolder: portfolioWorkspaceMigrationsFolder(),
      runMigrations: runner.run
    });

    expect(result.isFailure).toBe(true);
    expect(expectFailure(result).reason).toBe("database-unavailable");
    expect(database.executeCalls).toBe(2);
    expect(runner.calls).toBe(0);
  });

  it("reports migration apply failure without leaking database details", async () => {
    const database = new FakeDatabase()
      .queueSuccess()
      .queueSuccess({ rows: [{ current_schema: "public" }] });
    const runner = new FakeMigrationRunner(new Error("postgresql://portfolio_user:super-secret-password@localhost"));

    const result = await verifyPortfolioWorkspaceMigrationReadinessWithDependencies({
      configuration: configurationWith({ migrationMode: PortfolioWorkspaceMigrationMode.Apply }),
      database: database.asDatabase()
    }, {
      migrationsFolder: portfolioWorkspaceMigrationsFolder(),
      runMigrations: runner.run
    });

    expect(result.isFailure).toBe(true);
    const error = expectFailure(result);
    expect(error.reason).toBe("migration-apply-failed");
    for (const output of [JSON.stringify(error), error.message, inspect(error)]) {
      expect(output).not.toContain(secretUrl);
      expect(output).not.toContain("super-secret-password");
      expect(output).not.toContain("portfolio_user");
      expect(output).not.toContain("localhost");
    }
  });

  it("keeps readiness errors immutable and technology-neutral", () => {
    const error = new PortfolioWorkspaceMigrationReadinessError({
      reason: "schema-incompatible",
      migrationMode: PortfolioWorkspaceMigrationMode.VerifyOnly
    });

    expect(Object.isFrozen(error)).toBe(true);
    expect(error.toJSON()).toEqual({
      name: "PortfolioWorkspaceMigrationReadinessError",
      code: "PORTFOLIO_WORKSPACE_MIGRATION_READINESS_FAILED",
      reason: "schema-incompatible",
      migrationMode: PortfolioWorkspaceMigrationMode.VerifyOnly
    });
    expect(error).not.toHaveProperty("sqlState");
    expect(error).not.toHaveProperty("databaseUrl");
    expect(error).not.toHaveProperty("connectionString");
    expect(error).not.toHaveProperty("drizzle");
    expect(error).not.toHaveProperty("pool");
  });

  it("derives migration metadata table from the active PostgreSQL schema", () => {
    expect(portfolioWorkspaceMigrationMetadataTableFor("public")).toMatch(/^__portfolio_workspace_migrations_[a-f0-9]{16}$/u);
    expect(portfolioWorkspaceMigrationMetadataTableFor("public")).toBe(portfolioWorkspaceMigrationMetadataTableFor("public"));
    expect(portfolioWorkspaceMigrationMetadataTableFor("portfolio_workspace_runtime_a"))
      .not.toBe(portfolioWorkspaceMigrationMetadataTableFor("portfolio_workspace_runtime_b"));
    expect(portfolioWorkspaceMigrationMetadataTableFor(" ")).toBe(portfolioWorkspaceMigrationMetadataTableFor("public"));
    expect(portfolioWorkspaceMigrationMetadataTableFor("portfolio_workspace_runtime_schema_name_that_is_longer_than_postgresql_allows"))
      .toHaveLength(49);
    expect(portfolioWorkspaceMigrationMetadataTableFor("portfolio_workspace_runtime_schema_name_that_is_longer_than_postgresql_allows").length)
      .toBeLessThanOrEqual(63);
  });

  it("keeps the public readiness API explicit", () => {
    expect(PublicPortfolioWorkspaceMigrationReadinessResult).toBe(PortfolioWorkspaceMigrationReadinessResult);
    expect(verifyPortfolioWorkspaceMigrationReadiness).toBeDefined();
    expect(Object.keys(publicApi).sort()).toEqual(expectedPublicApi());
  });

  it("resolves committed migrations independently of the caller working directory", () => {
    const originalWorkingDirectory = process.cwd();
    try {
      process.chdir(join(workspaceRoot(), "apps", "api"));
      const migrationsFolder = portfolioWorkspaceMigrationsFolder();

      expect(readFileSync(join(migrationsFolder, "meta", "_journal.json"), "utf8")).toContain("entries");
      expect(readMigrationFiles({
        migrationsFolder,
        migrationsSchema: "drizzle",
        migrationsTable: "__drizzle_migrations"
      })).toHaveLength(2);
    } finally {
      process.chdir(originalWorkingDirectory);
    }
  });

  it("keeps migration readiness inside Infrastructure boundaries", () => {
    const readinessSource = readFileSync(
      join(packageRoot(), "src", "portfolio-workspace", "runtime", "PortfolioWorkspaceMigrationReadiness.ts"),
      "utf8"
    );
    const domainSource = readSourceTree(join(workspaceRoot(), "packages", "portfolio-workspace", "src"));
    const applicationSource = readSourceTree(join(workspaceRoot(), "packages", "portfolio-workspace-application", "src"));

    expect(readinessSource).not.toContain("PostgresPortfolioExecutionRepository");
    expect(readinessSource).not.toContain("BeginExecutionApplicationService");
    expect(readinessSource).not.toContain("CompleteWorkItemApplicationService");
    expect(readinessSource).not.toContain("AcceptCandidateApplicationService");
    expect(readinessSource).not.toContain("RejectCandidateApplicationService");
    expect(readinessSource).not.toContain("CompleteExecutionApplicationService");
    expect(readinessSource).not.toContain("CancelExecutionApplicationService");
    expect(readinessSource).not.toContain("ActivateWorkItemApplicationService");
    expect(readinessSource).not.toContain("CancelWorkItemApplicationService");
    expect(readinessSource).not.toContain(".query(");
    expect(readinessSource).not.toContain("process.env");
    expect(readinessSource).not.toContain("transaction");
    expect(domainSource).not.toContain("@career-companion/infrastructure");
    expect(applicationSource).not.toContain("@career-companion/infrastructure");
  });
});

class FakeDatabase {
  executeCalls = 0;
  readonly #responses: (
    | { readonly ok: true; readonly value?: unknown }
    | { readonly ok: false; readonly error: unknown }
  )[] = [];

  queueSuccess(value: unknown = { rows: [] }): this {
    this.#responses.push({ ok: true, value });
    return this;
  }

  queueFailure(error: unknown): this {
    this.#responses.push({ ok: false, error });
    return this;
  }

  async execute(): Promise<unknown> {
    this.executeCalls += 1;
    const response = this.#responses.shift();
    if (response === undefined) return { rows: [] };
    if (response.ok) return response.value;
    throw response.error;
  }

  asDatabase(): PortfolioWorkspacePostgresDatabase {
    return this as unknown as PortfolioWorkspacePostgresDatabase;
  }
}

class FakeMigrationRunner {
  calls = 0;
  lastMigrationConfig: unknown;

  constructor(private readonly failure?: Error) {}

  readonly run = async (_database: PortfolioWorkspacePostgresDatabase, migrationConfig: unknown): Promise<void> => {
    this.calls += 1;
    this.lastMigrationConfig = migrationConfig;
    if (this.failure !== undefined) {
      throw this.failure;
    }
  };
}

function configurationWith(
  overrides: Partial<Parameters<typeof PortfolioWorkspaceRuntimeConfiguration.create>[0]> = {}
): PortfolioWorkspaceRuntimeConfiguration {
  return expectSuccess(PortfolioWorkspaceRuntimeConfiguration.create({
    databaseUrl: secretUrl,
    environment: PortfolioWorkspaceRuntimeEnvironment.Test,
    ...overrides
  }));
}

function committedMigrations(): ReturnType<typeof readMigrationFiles> {
  return readMigrationFiles({
    migrationsFolder: portfolioWorkspaceMigrationsFolder(),
    migrationsSchema: "drizzle",
    migrationsTable: "__drizzle_migrations"
  });
}

function compatibleColumns(): readonly Record<string, unknown>[] {
  return [
    { table_name: "portfolio_executions", column_name: "execution_id", data_type: "text", is_nullable: "NO" },
    { table_name: "portfolio_executions", column_name: "record_version", data_type: "integer", is_nullable: "NO" },
    { table_name: "portfolio_executions", column_name: "revision", data_type: "integer", is_nullable: "NO" },
    { table_name: "portfolio_executions", column_name: "aggregate_payload", data_type: "jsonb", is_nullable: "NO" },
    { table_name: "portfolio_workspace_idempotency_records", column_name: "scope_hash", data_type: "text", is_nullable: "NO" },
    { table_name: "portfolio_workspace_idempotency_records", column_name: "record_version", data_type: "integer", is_nullable: "NO" },
    { table_name: "portfolio_workspace_idempotency_records", column_name: "operation", data_type: "text", is_nullable: "NO" },
    { table_name: "portfolio_workspace_idempotency_records", column_name: "authorization_resource_reference", data_type: "text", is_nullable: "NO" },
    { table_name: "portfolio_workspace_idempotency_records", column_name: "resource_identity", data_type: "text", is_nullable: "NO" },
    { table_name: "portfolio_workspace_idempotency_records", column_name: "idempotency_key_hash", data_type: "text", is_nullable: "NO" },
    { table_name: "portfolio_workspace_idempotency_records", column_name: "request_fingerprint_algorithm", data_type: "text", is_nullable: "NO" },
    { table_name: "portfolio_workspace_idempotency_records", column_name: "request_fingerprint_value", data_type: "text", is_nullable: "NO" },
    { table_name: "portfolio_workspace_idempotency_records", column_name: "status", data_type: "text", is_nullable: "NO" },
    { table_name: "portfolio_workspace_idempotency_records", column_name: "created_at", data_type: "timestamp with time zone", is_nullable: "NO" },
    { table_name: "portfolio_workspace_idempotency_records", column_name: "updated_at", data_type: "timestamp with time zone", is_nullable: "NO" },
    { table_name: "portfolio_workspace_idempotency_records", column_name: "expires_at", data_type: "timestamp with time zone", is_nullable: "NO" }
  ];
}

function expectSuccess<T>(result: { readonly isSuccess: boolean; readonly value?: T }): T {
  if (!result.isSuccess || result.value === undefined) {
    throw new Error("Expected successful result.");
  }

  return result.value;
}

function expectFailure<E>(result: { readonly isFailure: boolean; readonly error?: E }): E {
  if (!result.isFailure || result.error === undefined) {
    throw new Error("Expected failure result.");
  }

  return result.error;
}

function expectedPublicApi(): readonly string[] {
  return [
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
  ];
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
