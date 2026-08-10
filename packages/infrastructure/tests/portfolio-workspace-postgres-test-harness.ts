import { readFileSync } from "node:fs";
import { join } from "node:path";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../src/portfolio-workspace/postgres/schema";
import { PostgresPortfolioExecutionRepository } from "../src";
import type { PortfolioExecutionAggregatePayload } from "../src/portfolio-workspace/persistence";

export class PortfolioWorkspacePostgresTestHarness {
  readonly database: NodePgDatabase<typeof schema>;
  private readonly pool: Pool;
  private readonly schemaName: string;

  private constructor(input: {
    readonly pool: Pool;
    readonly database: NodePgDatabase<typeof schema>;
    readonly schemaName: string;
  }) {
    this.pool = input.pool;
    this.database = input.database;
    this.schemaName = input.schemaName;
  }

  static async create(connectionString: string): Promise<PortfolioWorkspacePostgresTestHarness> {
    assertSafePortfolioWorkspaceTestDatabaseUrl(connectionString);
    const schemaName = `portfolio_workspace_it_${process.pid}_${Date.now()}`;
    const pool = new Pool({
      connectionString,
      max: 1,
      options: `-c search_path=${schemaName}`
    });

    try {
      await pool.query(`CREATE SCHEMA ${quoteIdentifier(schemaName)}`);
      await pool.query(`SET search_path TO ${quoteIdentifier(schemaName)}`);
      await pool.query(migrationSql());
    } catch (error) {
      await pool.end();
      throw error;
    }

    return new PortfolioWorkspacePostgresTestHarness({
      pool,
      database: drizzle(pool, { schema }),
      schemaName
    });
  }

  repository(): PostgresPortfolioExecutionRepository {
    return new PostgresPortfolioExecutionRepository(this.database);
  }

  async reset(): Promise<void> {
    await this.pool.query("DELETE FROM portfolio_executions");
  }

  async dispose(): Promise<void> {
    try {
      await this.pool.query(`DROP SCHEMA IF EXISTS ${quoteIdentifier(this.schemaName)} CASCADE`);
    } finally {
      await this.pool.end();
    }
  }

  async query<T extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    values: readonly unknown[] = []
  ): Promise<readonly T[]> {
    const result = await this.pool.query(text, [...values]);
    return result.rows as readonly T[];
  }

  async insertRawPortfolioExecutionRow(input: {
    readonly executionId: string;
    readonly recordVersion: number;
    readonly revision: number;
    readonly aggregatePayload: PortfolioExecutionAggregatePayload;
  }): Promise<void> {
    await this.pool.query(
      `INSERT INTO portfolio_executions (execution_id, record_version, revision, aggregate_payload)
       VALUES ($1, $2, $3, $4::jsonb)`,
      [
        input.executionId,
        input.recordVersion,
        input.revision,
        JSON.stringify(input.aggregatePayload)
      ]
    );
  }
}

export function assertSafePortfolioWorkspaceTestDatabaseUrl(value: string): void {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("PORTFOLIO_WORKSPACE_TEST_DATABASE_URL must be a valid PostgreSQL connection URL.");
  }

  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    throw new Error("PORTFOLIO_WORKSPACE_TEST_DATABASE_URL must use the postgres or postgresql protocol.");
  }

  const databaseName = decodeURIComponent(parsed.pathname.replace(/^\//, "")).toLowerCase();
  if (!databaseName.includes("test")) {
    throw new Error("Refusing to run PostgreSQL integration tests: database name must contain 'test'.");
  }
  if (databaseName.includes("prod") || databaseName.includes("production")) {
    throw new Error("Refusing to run PostgreSQL integration tests against a database name that appears production-related.");
  }
}

function migrationSql(): string {
  return readFileSync(join(packageRoot(), "drizzle", "portfolio-workspace", "0000_shocking_firebrand.sql"), "utf8");
}

function packageRoot(): string {
  const packageLocal = process.cwd();
  if (packageLocal.endsWith("infrastructure")) return packageLocal;
  return join(process.cwd(), "packages", "infrastructure");
}

function quoteIdentifier(value: string): string {
  return `"${value.replace(/"/g, "\"\"")}"`;
}
