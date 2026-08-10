import { Result } from "@career-companion/kernel";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import * as schema from "../postgres/schema";
import type { PortfolioWorkspaceRuntimeConfiguration } from "./PortfolioWorkspaceRuntimeConfiguration";

const INSPECT_SYMBOL = Symbol.for("nodejs.util.inspect.custom");

export type PortfolioWorkspacePostgresDatabase = NodePgDatabase<typeof schema>;

export type PortfolioWorkspaceRuntimeConstructionFailureReason =
  | "pool-creation-failed"
  | "drizzle-creation-failed";

export class PortfolioWorkspaceRuntimeConstructionError extends Error {
  readonly code = "PORTFOLIO_WORKSPACE_RUNTIME_CONSTRUCTION_FAILED";
  readonly reason: PortfolioWorkspaceRuntimeConstructionFailureReason;

  constructor(reason: PortfolioWorkspaceRuntimeConstructionFailureReason) {
    super("Portfolio Workspace PostgreSQL runtime database could not be constructed.");
    this.name = "PortfolioWorkspaceRuntimeConstructionError";
    this.reason = reason;
    Object.freeze(this);
  }

  toJSON(): {
    readonly name: "PortfolioWorkspaceRuntimeConstructionError";
    readonly code: "PORTFOLIO_WORKSPACE_RUNTIME_CONSTRUCTION_FAILED";
    readonly reason: PortfolioWorkspaceRuntimeConstructionFailureReason;
  } {
    return {
      name: "PortfolioWorkspaceRuntimeConstructionError",
      code: this.code,
      reason: this.reason
    };
  }
}

export interface PortfolioWorkspacePostgresDatabaseRuntimeJSON {
  readonly configuration: ReturnType<PortfolioWorkspaceRuntimeConfiguration["toJSON"]>;
  readonly databaseConfigured: true;
  readonly disposed: boolean;
}

export class PortfolioWorkspacePostgresDatabaseRuntime {
  readonly #configuration: PortfolioWorkspaceRuntimeConfiguration;
  readonly #pool: Pool;
  readonly #drizzleDatabase: PortfolioWorkspacePostgresDatabase;
  #disposed = false;

  constructor(input: {
    readonly configuration: PortfolioWorkspaceRuntimeConfiguration;
    readonly pool: Pool;
    readonly database: PortfolioWorkspacePostgresDatabase;
  }) {
    this.#configuration = input.configuration;
    this.#pool = input.pool;
    this.#drizzleDatabase = input.database;
    Object.freeze(this);
  }

  database(): PortfolioWorkspacePostgresDatabase {
    return this.#drizzleDatabase;
  }

  isDisposed(): boolean {
    return this.#disposed;
  }

  async dispose(): Promise<void> {
    if (this.#disposed) {
      return;
    }

    try {
      await this.#pool.end();
    } finally {
      this.#disposed = true;
    }
  }

  toJSON(): PortfolioWorkspacePostgresDatabaseRuntimeJSON {
    return {
      configuration: this.#configuration.toJSON(),
      databaseConfigured: true,
      disposed: this.#disposed
    };
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }

  [INSPECT_SYMBOL](): PortfolioWorkspacePostgresDatabaseRuntimeJSON {
    return this.toJSON();
  }
}

export async function createPortfolioWorkspacePostgresDatabaseRuntime(
  configuration: PortfolioWorkspaceRuntimeConfiguration
): Promise<Result<PortfolioWorkspacePostgresDatabaseRuntime, PortfolioWorkspaceRuntimeConstructionError>> {
  let pool: Pool;
  try {
    pool = createPortfolioWorkspacePostgresPool(configuration);
  } catch {
    return Result.failure(new PortfolioWorkspaceRuntimeConstructionError("pool-creation-failed"));
  }

  try {
    const database = createPortfolioWorkspaceDrizzleDatabase(pool);
    return Result.success(new PortfolioWorkspacePostgresDatabaseRuntime({
      configuration,
      pool,
      database
    }));
  } catch {
    await pool.end();
    return Result.failure(new PortfolioWorkspaceRuntimeConstructionError("drizzle-creation-failed"));
  }
}

export function createPortfolioWorkspacePostgresPool(
  configuration: PortfolioWorkspaceRuntimeConfiguration
): Pool {
  return new Pool(toPortfolioWorkspacePostgresPoolConfig(configuration));
}

export function createPortfolioWorkspaceDrizzleDatabase(pool: Pool): PortfolioWorkspacePostgresDatabase {
  return drizzle(pool, { schema });
}

export function toPortfolioWorkspacePostgresPoolConfig(
  configuration: PortfolioWorkspaceRuntimeConfiguration
): PoolConfig {
  return {
    connectionString: configuration.databaseConnectionUrlForRuntime(),
    max: configuration.poolMax,
    idleTimeoutMillis: configuration.idleTimeoutMs,
    connectionTimeoutMillis: configuration.connectionTimeoutMs
  };
}
