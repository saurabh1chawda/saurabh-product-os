import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { portfolioExecutions } from "../src/portfolio-workspace/postgres/schema";
import * as publicApi from "../src";

describe("Portfolio Workspace PostgreSQL schema", () => {
  it("defines the PortfolioExecution aggregate snapshot table", () => {
    const migrationSql = migration();

    expect(portfolioExecutions).toBeDefined();
    expect(migrationSql).toContain("CREATE TABLE \"portfolio_executions\"");
    expect(migrationSql).toContain("\"execution_id\" text PRIMARY KEY NOT NULL");
    expect(migrationSql).toContain("\"record_version\" integer NOT NULL");
    expect(migrationSql).toContain("\"revision\" integer NOT NULL");
    expect(migrationSql).toContain("\"aggregate_payload\" jsonb NOT NULL");
    expect(migrationSql).not.toContain("DEFAULT");
    expect(migrationSql).not.toContain("CREATE INDEX");
    expect(migrationSql).not.toContain("work_items");
    expect(migrationSql).not.toContain("artifact_candidates");
    expect(migrationSql).not.toContain("accepted_artifacts");
    expect(migrationSql).not.toContain("facts");
    expect(migrationSql).not.toContain("projections");
    expect(migrationSql).not.toContain("audit");
  });

  it("keeps record version, revision, and JSONB payload boundaries distinct", () => {
    const schemaSource = readFileSync(join(packageRoot(), "src", "portfolio-workspace", "postgres", "schema.ts"), "utf8");
    const recordSource = readFileSync(join(packageRoot(), "src", "portfolio-workspace", "persistence", "PortfolioExecutionRecord.ts"), "utf8");
    const migrationSql = migration();

    expect(schemaSource).toContain("$type<PortfolioExecutionAggregatePayload>()");
    expect(migrationSql).toContain("CONSTRAINT \"portfolio_executions_record_version_positive\" CHECK (\"portfolio_executions\".\"record_version\" >= 1)");
    expect(migrationSql).toContain("CONSTRAINT \"portfolio_executions_revision_positive\" CHECK (\"portfolio_executions\".\"revision\" >= 1)");
    expect(migrationSql).not.toContain("record_version\" = 1");
    expect(recordSource).not.toContain("revision");
    expect(recordSource).not.toContain("PortfolioExecutionRevision");
  });

  it("keeps schema and migration internals out of the package root API", () => {
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
  });

  it("keeps PostgreSQL dependencies inside Infrastructure boundaries", () => {
    const infrastructurePackage = packageJson(join(packageRoot(), "package.json"));
    const domainPackage = packageJson(join(workspaceRoot(), "packages", "portfolio-workspace", "package.json"));
    const applicationPackage = packageJson(join(workspaceRoot(), "packages", "portfolio-workspace-application", "package.json"));
    const domainSource = readSourceTree(join(workspaceRoot(), "packages", "portfolio-workspace", "src"));
    const applicationSource = readSourceTree(join(workspaceRoot(), "packages", "portfolio-workspace-application", "src"));

    expect(infrastructurePackage.dependencies).toMatchObject({
      "drizzle-orm": expect.any(String),
      "pg": expect.any(String)
    });
    expect(infrastructurePackage.devDependencies).toMatchObject({
      "@types/pg": expect.any(String),
      "drizzle-kit": expect.any(String)
    });
    for (const packageJson of [domainPackage, applicationPackage]) {
      expect(packageJson.dependencies ?? {}).not.toHaveProperty("drizzle-orm");
      expect(packageJson.dependencies ?? {}).not.toHaveProperty("drizzle-kit");
      expect(packageJson.dependencies ?? {}).not.toHaveProperty("pg");
      expect(packageJson.devDependencies ?? {}).not.toHaveProperty("drizzle-orm");
      expect(packageJson.devDependencies ?? {}).not.toHaveProperty("drizzle-kit");
      expect(packageJson.devDependencies ?? {}).not.toHaveProperty("pg");
    }
    expect(domainSource).not.toContain("drizzle-orm");
    expect(domainSource).not.toContain("drizzle-kit");
    expect(domainSource).not.toContain("from \"pg\"");
    expect(applicationSource).not.toContain("drizzle-orm");
    expect(applicationSource).not.toContain("drizzle-kit");
    expect(applicationSource).not.toContain("from \"pg\"");
  });

  it("keeps the migration set scoped to the initial aggregate table", () => {
    const migrationFiles = readdirSync(join(packageRoot(), "drizzle", "portfolio-workspace"))
      .filter((entry) => entry.endsWith(".sql"));

    expect(migrationFiles).toHaveLength(1);
    expect(migration()).toContain("CREATE TABLE \"portfolio_executions\"");
  });
});

function migration(): string {
  return readFileSync(join(packageRoot(), "drizzle", "portfolio-workspace", "0000_shocking_firebrand.sql"), "utf8");
}

function packageJson(path: string): {
  readonly dependencies?: Record<string, string>;
  readonly devDependencies?: Record<string, string>;
} {
  return JSON.parse(readFileSync(path, "utf8")) as {
    readonly dependencies?: Record<string, string>;
    readonly devDependencies?: Record<string, string>;
  };
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
