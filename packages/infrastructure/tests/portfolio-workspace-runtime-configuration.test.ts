import { inspect } from "node:util";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  InvalidPortfolioWorkspaceRuntimeConfigurationError,
  PORTFOLIO_WORKSPACE_RUNTIME_ENVIRONMENT_VARIABLES,
  PortfolioWorkspaceMigrationMode,
  PortfolioWorkspaceRuntimeConfiguration,
  PortfolioWorkspaceRuntimeEnvironment
} from "../src";
import * as publicApi from "../src";

const secretUrl = "postgresql://portfolio_user:super-secret-password@localhost:5432/portfolio_workspace";

describe("PortfolioWorkspaceRuntimeConfiguration", () => {
  it("accepts valid PostgreSQL URLs and applies deterministic defaults", () => {
    const postgresql = expectSuccess(PortfolioWorkspaceRuntimeConfiguration.create({
      databaseUrl: secretUrl
    }));
    const postgres = expectSuccess(PortfolioWorkspaceRuntimeConfiguration.create({
      databaseUrl: "postgres://user:password@localhost:5432/portfolio_workspace"
    }));

    expect(postgresql.databaseConnectionUrlForRuntime()).toBe(secretUrl);
    expect(postgres.databaseConnectionUrlForRuntime()).toBe("postgres://user:password@localhost:5432/portfolio_workspace");
    expect(postgresql.toJSON()).toEqual({
      databaseUrlConfigured: true,
      poolMax: 10,
      idleTimeoutMs: 30_000,
      connectionTimeoutMs: 5_000,
      shutdownTimeoutMs: 10_000,
      environment: PortfolioWorkspaceRuntimeEnvironment.Development,
      migrationMode: PortfolioWorkspaceMigrationMode.VerifyOnly
    });
    expect(Object.isFrozen(postgresql)).toBe(true);
  });

  it("accepts explicit operational settings", () => {
    const configuration = expectSuccess(PortfolioWorkspaceRuntimeConfiguration.create({
      databaseUrl: secretUrl,
      poolMax: 4,
      idleTimeoutMs: 0,
      connectionTimeoutMs: 1_000,
      shutdownTimeoutMs: 2_000,
      environment: PortfolioWorkspaceRuntimeEnvironment.Staging,
      migrationMode: PortfolioWorkspaceMigrationMode.Apply
    }));

    expect(configuration.toJSON()).toEqual({
      databaseUrlConfigured: true,
      poolMax: 4,
      idleTimeoutMs: 0,
      connectionTimeoutMs: 1_000,
      shutdownTimeoutMs: 2_000,
      environment: "staging",
      migrationMode: "apply"
    });
  });

  it.each([
    ["missing", undefined],
    ["empty", ""],
    ["whitespace", "   "],
    ["malformed", "not a url"],
    ["unsupported protocol", "mysql://user:password@localhost:3306/portfolio_workspace"],
    ["missing database name", "postgresql://user:password@localhost:5432/"]
  ])("rejects invalid database URL: %s", (_caseName, databaseUrl) => {
    const result = PortfolioWorkspaceRuntimeConfiguration.create({ databaseUrl });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(InvalidPortfolioWorkspaceRuntimeConfigurationError);
    expect(JSON.stringify(result.error?.toJSON())).not.toContain("password");
    expect(JSON.stringify(result.error?.toJSON())).not.toContain("mysql://user");
    expect(result.error?.issues.some((issue) => issue.field === "databaseUrl")).toBe(true);
  });

  it.each([
    ["poolMax zero", { poolMax: "0" }],
    ["poolMax negative", { poolMax: "-1" }],
    ["poolMax fractional", { poolMax: "1.5" }],
    ["poolMax NaN", { poolMax: "NaN" }],
    ["idleTimeoutMs negative", { idleTimeoutMs: "-1" }],
    ["idleTimeoutMs fractional", { idleTimeoutMs: "1.5" }],
    ["connectionTimeoutMs zero", { connectionTimeoutMs: "0" }],
    ["shutdownTimeoutMs zero", { shutdownTimeoutMs: "0" }]
  ])("rejects invalid numeric setting: %s", (_caseName, overrides) => {
    const result = PortfolioWorkspaceRuntimeConfiguration.create({
      databaseUrl: secretUrl,
      ...overrides
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(InvalidPortfolioWorkspaceRuntimeConfigurationError);
  });

  it("rejects unsupported environment and migration vocabulary", () => {
    const result = PortfolioWorkspaceRuntimeConfiguration.create({
      databaseUrl: secretUrl,
      environment: "preview",
      migrationMode: "skip"
    });

    expect(result.isFailure).toBe(true);
    expect(result.error?.toJSON()).toEqual({
      name: "InvalidPortfolioWorkspaceRuntimeConfigurationError",
      code: "INVALID_PORTFOLIO_WORKSPACE_RUNTIME_CONFIGURATION",
      issues: [
        {
          code: "configuration.unsupported",
          field: "environment",
          message: "environment is unsupported."
        },
        {
          code: "configuration.unsupported",
          field: "migrationMode",
          message: "migrationMode is unsupported."
        }
      ]
    });
  });

  it("parses a narrow environment-like map without reading process.env or the test database variable", () => {
    const environment = Object.freeze({
      PORTFOLIO_WORKSPACE_DATABASE_URL: secretUrl,
      PORTFOLIO_WORKSPACE_DB_POOL_MAX: "3",
      PORTFOLIO_WORKSPACE_DB_IDLE_TIMEOUT_MS: "20",
      PORTFOLIO_WORKSPACE_DB_CONNECTION_TIMEOUT_MS: "30",
      PORTFOLIO_WORKSPACE_SHUTDOWN_TIMEOUT_MS: "40",
      PORTFOLIO_WORKSPACE_ENVIRONMENT: "test",
      PORTFOLIO_WORKSPACE_MIGRATION_MODE: "apply",
      PORTFOLIO_WORKSPACE_TEST_DATABASE_URL: "postgresql://test:test@localhost:5433/should_not_be_used",
      UNRELATED_VALUE: "ignored"
    });

    const configuration = expectSuccess(PortfolioWorkspaceRuntimeConfiguration.fromEnvironment(environment));

    expect(configuration.databaseConnectionUrlForRuntime()).toBe(secretUrl);
    expect(configuration.toJSON()).toMatchObject({
      poolMax: 3,
      idleTimeoutMs: 20,
      connectionTimeoutMs: 30,
      shutdownTimeoutMs: 40,
      environment: "test",
      migrationMode: "apply"
    });
    expect(environment.PORTFOLIO_WORKSPACE_TEST_DATABASE_URL).toContain("should_not_be_used");
  });

  it("redacts the secret-bearing database URL from serialization, string conversion, and inspection", () => {
    const configuration = expectSuccess(PortfolioWorkspaceRuntimeConfiguration.create({
      databaseUrl: secretUrl
    }));

    const serialized = JSON.stringify(configuration);
    const stringified = String(configuration);
    const inspected = inspect(configuration);

    for (const output of [serialized, stringified, inspected]) {
      expect(output).not.toContain(secretUrl);
      expect(output).not.toContain("super-secret-password");
      expect(output).not.toContain("portfolio_user");
      expect(output).not.toContain("localhost");
    }
    expect(serialized).toContain("databaseUrlConfigured");
  });

  it("compares configurations without exposing secret values", () => {
    const first = expectSuccess(PortfolioWorkspaceRuntimeConfiguration.create({ databaseUrl: secretUrl }));
    const same = expectSuccess(PortfolioWorkspaceRuntimeConfiguration.create({ databaseUrl: secretUrl }));
    const different = expectSuccess(PortfolioWorkspaceRuntimeConfiguration.create({
      databaseUrl: "postgresql://portfolio_user:other-secret@localhost:5432/portfolio_workspace"
    }));

    expect(first.equals(same)).toBe(true);
    expect(first.equals(different)).toBe(false);
  });

  it("keeps the public API explicit", () => {
    expect(Object.keys(publicApi).sort()).toEqual([
      "InvalidPortfolioWorkspaceRuntimeConfigurationError",
      "PORTFOLIO_EXECUTION_RECORD_VERSION",
      "PORTFOLIO_WORKSPACE_RUNTIME_ENVIRONMENT_VARIABLES",
      "PortfolioExecutionRecordMapper",
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
      "createPortfolioWorkspacePostgresDatabaseRuntime",
      "createPortfolioWorkspaceRuntime",
      "verifyPortfolioWorkspaceMigrationReadiness"
    ]);
    expect(PORTFOLIO_WORKSPACE_RUNTIME_ENVIRONMENT_VARIABLES.databaseUrl).toBe("PORTFOLIO_WORKSPACE_DATABASE_URL");
    expect(Object.values(PORTFOLIO_WORKSPACE_RUNTIME_ENVIRONMENT_VARIABLES)).not.toContain("PORTFOLIO_WORKSPACE_TEST_DATABASE_URL");
  });

  it("keeps runtime configuration outside Domain and Application boundaries", () => {
    const domainSource = readSourceTree(join(workspaceRoot(), "packages", "portfolio-workspace", "src"));
    const applicationSource = readSourceTree(join(workspaceRoot(), "packages", "portfolio-workspace-application", "src"));
    const configurationSource = readFileSync(
      join(packageRoot(), "src", "portfolio-workspace", "runtime", "PortfolioWorkspaceRuntimeConfiguration.ts"),
      "utf8"
    );

    expect(domainSource).not.toContain("PortfolioWorkspaceRuntimeConfiguration");
    expect(applicationSource).not.toContain("PortfolioWorkspaceRuntimeConfiguration");
    expect(domainSource).not.toContain("PORTFOLIO_WORKSPACE_DATABASE_URL");
    expect(applicationSource).not.toContain("PORTFOLIO_WORKSPACE_DATABASE_URL");
    expect(configurationSource).not.toContain("from \"pg\"");
    expect(configurationSource).not.toContain("drizzle-orm");
    expect(configurationSource).not.toContain("process.env");
    expect(configurationSource).not.toContain("PostgresPortfolioExecutionRepository");
    expect(configurationSource).not.toContain("new Pool");
    expect(configurationSource).not.toContain("drizzle(");
    expect(configurationSource).not.toContain("migrate(");
  });
});

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
