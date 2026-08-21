import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Result } from "@career-companion/kernel";
import { sql } from "drizzle-orm";
import { readMigrationFiles, type MigrationConfig, type MigrationMeta } from "drizzle-orm/migrator";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { PortfolioWorkspaceMigrationMode, type PortfolioWorkspaceRuntimeConfiguration } from "./PortfolioWorkspaceRuntimeConfiguration";
import type { PortfolioWorkspacePostgresDatabase } from "./PortfolioWorkspacePostgresDatabaseRuntime";

const INSPECT_SYMBOL = Symbol.for("nodejs.util.inspect.custom");
const DRIZZLE_MIGRATIONS_SCHEMA = "drizzle";
const MIGRATION_METADATA_TABLE_PREFIX = "__portfolio_workspace_migrations_";

export type PortfolioWorkspaceMigrationReadinessState =
  | "compatible"
  | "applied-and-compatible";

export interface PortfolioWorkspaceMigrationReadinessResultJSON {
  readonly ready: true;
  readonly databaseReachable: true;
  readonly migrationMode: typeof PortfolioWorkspaceMigrationMode[keyof typeof PortfolioWorkspaceMigrationMode];
  readonly migrationState: PortfolioWorkspaceMigrationReadinessState;
  readonly committedMigrationCount: number;
  readonly appliedMigrationCount: number;
  readonly latestCommittedMigrationTimestamp: number;
  readonly latestAppliedMigrationTimestamp: number;
}

export class PortfolioWorkspaceMigrationReadinessResult {
  readonly ready = true;
  readonly databaseReachable = true;
  readonly migrationMode: typeof PortfolioWorkspaceMigrationMode[keyof typeof PortfolioWorkspaceMigrationMode];
  readonly migrationState: PortfolioWorkspaceMigrationReadinessState;
  readonly committedMigrationCount: number;
  readonly appliedMigrationCount: number;
  readonly latestCommittedMigrationTimestamp: number;
  readonly latestAppliedMigrationTimestamp: number;

  constructor(input: {
    readonly migrationMode: typeof PortfolioWorkspaceMigrationMode[keyof typeof PortfolioWorkspaceMigrationMode];
    readonly migrationState: PortfolioWorkspaceMigrationReadinessState;
    readonly committedMigrationCount: number;
    readonly appliedMigrationCount: number;
    readonly latestCommittedMigrationTimestamp: number;
    readonly latestAppliedMigrationTimestamp: number;
  }) {
    this.migrationMode = input.migrationMode;
    this.migrationState = input.migrationState;
    this.committedMigrationCount = input.committedMigrationCount;
    this.appliedMigrationCount = input.appliedMigrationCount;
    this.latestCommittedMigrationTimestamp = input.latestCommittedMigrationTimestamp;
    this.latestAppliedMigrationTimestamp = input.latestAppliedMigrationTimestamp;
    Object.freeze(this);
  }

  equals(other: PortfolioWorkspaceMigrationReadinessResult | undefined): boolean {
    return other instanceof PortfolioWorkspaceMigrationReadinessResult
      && this.migrationMode === other.migrationMode
      && this.migrationState === other.migrationState
      && this.committedMigrationCount === other.committedMigrationCount
      && this.appliedMigrationCount === other.appliedMigrationCount
      && this.latestCommittedMigrationTimestamp === other.latestCommittedMigrationTimestamp
      && this.latestAppliedMigrationTimestamp === other.latestAppliedMigrationTimestamp;
  }

  toJSON(): PortfolioWorkspaceMigrationReadinessResultJSON {
    return {
      ready: true,
      databaseReachable: true,
      migrationMode: this.migrationMode,
      migrationState: this.migrationState,
      committedMigrationCount: this.committedMigrationCount,
      appliedMigrationCount: this.appliedMigrationCount,
      latestCommittedMigrationTimestamp: this.latestCommittedMigrationTimestamp,
      latestAppliedMigrationTimestamp: this.latestAppliedMigrationTimestamp
    };
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }

  [INSPECT_SYMBOL](): PortfolioWorkspaceMigrationReadinessResultJSON {
    return this.toJSON();
  }
}

export type PortfolioWorkspaceMigrationReadinessFailureReason =
  | "database-unavailable"
  | "migration-required"
  | "migration-apply-failed"
  | "schema-incompatible"
  | "migration-metadata-incompatible";

export class PortfolioWorkspaceMigrationReadinessError extends Error {
  readonly code = "PORTFOLIO_WORKSPACE_MIGRATION_READINESS_FAILED";
  readonly reason: PortfolioWorkspaceMigrationReadinessFailureReason;
  readonly migrationMode: typeof PortfolioWorkspaceMigrationMode[keyof typeof PortfolioWorkspaceMigrationMode];

  constructor(input: {
    readonly reason: PortfolioWorkspaceMigrationReadinessFailureReason;
    readonly migrationMode: typeof PortfolioWorkspaceMigrationMode[keyof typeof PortfolioWorkspaceMigrationMode];
  }) {
    super("Portfolio Workspace database is not migration-ready.");
    this.name = "PortfolioWorkspaceMigrationReadinessError";
    this.reason = input.reason;
    this.migrationMode = input.migrationMode;
    Object.freeze(this);
  }

  toJSON(): {
    readonly name: "PortfolioWorkspaceMigrationReadinessError";
    readonly code: "PORTFOLIO_WORKSPACE_MIGRATION_READINESS_FAILED";
    readonly reason: PortfolioWorkspaceMigrationReadinessFailureReason;
    readonly migrationMode: typeof PortfolioWorkspaceMigrationMode[keyof typeof PortfolioWorkspaceMigrationMode];
  } {
    return {
      name: "PortfolioWorkspaceMigrationReadinessError",
      code: this.code,
      reason: this.reason,
      migrationMode: this.migrationMode
    };
  }

  [INSPECT_SYMBOL](): ReturnType<PortfolioWorkspaceMigrationReadinessError["toJSON"]> {
    return this.toJSON();
  }
}

export async function verifyPortfolioWorkspaceMigrationReadiness(input: {
  readonly configuration: PortfolioWorkspaceRuntimeConfiguration;
  readonly database: PortfolioWorkspacePostgresDatabase;
}): Promise<Result<PortfolioWorkspaceMigrationReadinessResult, PortfolioWorkspaceMigrationReadinessError>> {
  return verifyPortfolioWorkspaceMigrationReadinessWithDependencies(input, {
    migrationsFolder: portfolioWorkspaceMigrationsFolder(),
    runMigrations: async (database, migrationConfig) => {
      await migrate(database, migrationConfig);
    }
  });
}

export async function verifyPortfolioWorkspaceMigrationReadinessWithDependencies(input: {
  readonly configuration: PortfolioWorkspaceRuntimeConfiguration;
  readonly database: PortfolioWorkspacePostgresDatabase;
}, dependencies: {
  readonly migrationsFolder: string;
  readonly runMigrations: (
    database: PortfolioWorkspacePostgresDatabase,
    migrationConfig: MigrationConfig
  ) => Promise<void>;
}): Promise<Result<PortfolioWorkspaceMigrationReadinessResult, PortfolioWorkspaceMigrationReadinessError>> {
  const connectivity = await verifyConnectivity(input.database);
  if (connectivity.isFailure) {
    return Result.failure(readinessError("database-unavailable", input.configuration));
  }

  const activeSchema = await readCurrentSchema(input.database);
  if (activeSchema.isFailure || activeSchema.value === undefined) {
    return Result.failure(readinessError("database-unavailable", input.configuration));
  }
  const migrationMetadataTable = portfolioWorkspaceMigrationMetadataTableFor(activeSchema.value);
  const migrationConfig = migrationConfiguration(
    dependencies.migrationsFolder,
    migrationMetadataTable
  );

  if (input.configuration.migrationMode === PortfolioWorkspaceMigrationMode.Apply) {
    try {
      await dependencies.runMigrations(input.database, migrationConfig);
    } catch {
      return Result.failure(readinessError("migration-apply-failed", input.configuration));
    }
  }

  const committedMigrations = readMigrationFiles(migrationConfig);
  const appliedMigrations = await readAppliedMigrations(input.database, migrationMetadataTable);
  if (appliedMigrations.isFailure) {
    return Result.failure(readinessError("migration-required", input.configuration));
  }

  const compatibility = verifyMigrationCompatibility(committedMigrations, appliedMigrations.value ?? []);
  if (compatibility !== undefined) {
    return Result.failure(readinessError(compatibility, input.configuration));
  }

  const schemaCompatibility = await verifySchemaCompatibility(input.database);
  if (schemaCompatibility.isFailure) {
    return Result.failure(readinessError("schema-incompatible", input.configuration));
  }

  const latestCommittedMigrationTimestamp = latestMigrationTimestamp(committedMigrations);
  const latestAppliedMigrationTimestamp = latestMigrationTimestamp(appliedMigrations.value ?? []);

  return Result.success(new PortfolioWorkspaceMigrationReadinessResult({
    migrationMode: input.configuration.migrationMode,
    migrationState: input.configuration.migrationMode === PortfolioWorkspaceMigrationMode.Apply
      ? "applied-and-compatible"
      : "compatible",
    committedMigrationCount: committedMigrations.length,
    appliedMigrationCount: (appliedMigrations.value ?? []).length,
    latestCommittedMigrationTimestamp,
    latestAppliedMigrationTimestamp
  }));
}

export function portfolioWorkspaceMigrationsFolder(): string {
  let currentDirectory = dirname(fileURLToPath(import.meta.url));
  while (true) {
    const migrationsFolder = join(currentDirectory, "drizzle", "portfolio-workspace");
    if (existsSync(join(migrationsFolder, "meta", "_journal.json"))) {
      return migrationsFolder;
    }

    const parentDirectory = dirname(currentDirectory);
    if (parentDirectory === currentDirectory) {
      return join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "drizzle", "portfolio-workspace");
    }

    currentDirectory = parentDirectory;
  }
}

export function portfolioWorkspaceMigrationMetadataTableFor(currentSchema: string): string {
  const normalizedSchema = currentSchema.trim().length > 0 ? currentSchema.trim() : "public";
  const schemaHash = createHash("sha256")
    .update(normalizedSchema)
    .digest("hex")
    .slice(0, 16);
  return `${MIGRATION_METADATA_TABLE_PREFIX}${schemaHash}`;
}

function migrationConfiguration(migrationsFolder: string, migrationsTable: string): MigrationConfig {
  return {
    migrationsFolder,
    migrationsSchema: DRIZZLE_MIGRATIONS_SCHEMA,
    migrationsTable
  };
}

function readinessError(
  reason: PortfolioWorkspaceMigrationReadinessFailureReason,
  configuration: PortfolioWorkspaceRuntimeConfiguration
): PortfolioWorkspaceMigrationReadinessError {
  return new PortfolioWorkspaceMigrationReadinessError({
    reason,
    migrationMode: configuration.migrationMode
  });
}

async function verifyConnectivity(
  database: PortfolioWorkspacePostgresDatabase
): Promise<Result<true, false>> {
  try {
    await database.execute(sql`select 1 as portfolio_workspace_database_ready`);
    return Result.success(true);
  } catch {
    return Result.failure(false);
  }
}

async function readCurrentSchema(
  database: PortfolioWorkspacePostgresDatabase
): Promise<Result<string, false>> {
  try {
    const result = await database.execute(sql`select current_schema() as current_schema`);
    const currentSchema = rowsFrom(result)[0]?.current_schema;
    return typeof currentSchema === "string" && currentSchema.trim().length > 0
      ? Result.success(currentSchema)
      : Result.failure(false);
  } catch {
    return Result.failure(false);
  }
}

async function readAppliedMigrations(
  database: PortfolioWorkspacePostgresDatabase,
  migrationsTable: string
): Promise<Result<readonly AppliedMigration[], false>> {
  try {
    const result = await database.execute(sql`
      select hash, created_at
      from ${sql.identifier(DRIZZLE_MIGRATIONS_SCHEMA)}.${sql.identifier(migrationsTable)}
      order by created_at asc
    `);
    return Result.success(rowsFrom(result).map((row) => Object.freeze({
      hash: String(row.hash),
      folderMillis: Number(row.created_at)
    })));
  } catch {
    return Result.failure(false);
  }
}

function verifyMigrationCompatibility(
  committedMigrations: readonly MigrationMeta[],
  appliedMigrations: readonly AppliedMigration[]
): PortfolioWorkspaceMigrationReadinessFailureReason | undefined {
  if (appliedMigrations.length < committedMigrations.length) {
    return "migration-required";
  }

  if (appliedMigrations.length > committedMigrations.length) {
    return "migration-metadata-incompatible";
  }

  for (const [index, committedMigration] of committedMigrations.entries()) {
    const appliedMigration = appliedMigrations[index];
    if (
      appliedMigration === undefined
      || appliedMigration.folderMillis !== committedMigration.folderMillis
      || appliedMigration.hash !== committedMigration.hash
    ) {
      return "migration-metadata-incompatible";
    }
  }

  return undefined;
}

async function verifySchemaCompatibility(
  database: PortfolioWorkspacePostgresDatabase
): Promise<Result<true, false>> {
  try {
    const result = await database.execute(sql`
      select table_name, column_name, data_type, is_nullable
      from information_schema.columns
      where table_schema = current_schema()
        and table_name in ('portfolio_executions', 'portfolio_workspace_idempotency_records')
      order by table_name asc, ordinal_position asc
    `);
    const columns = rowsFrom(result);
    return hasCompatiblePortfolioExecutionColumns(columns)
      && hasCompatiblePortfolioWorkspaceIdempotencyColumns(columns)
      ? Result.success(true)
      : Result.failure(false);
  } catch {
    return Result.failure(false);
  }
}

function hasCompatiblePortfolioExecutionColumns(
  columns: readonly Record<string, unknown>[]
): boolean {
  const expectedColumns = new Map([
    ["execution_id", "text"],
    ["record_version", "integer"],
    ["revision", "integer"],
    ["aggregate_payload", "jsonb"]
  ]);

  for (const [columnName, dataType] of expectedColumns) {
    const column = columns.find((candidate) => candidate.table_name === "portfolio_executions" && candidate.column_name === columnName);
    if (column === undefined || column.data_type !== dataType || column.is_nullable !== "NO") {
      return false;
    }
  }

  return true;
}

function hasCompatiblePortfolioWorkspaceIdempotencyColumns(
  columns: readonly Record<string, unknown>[]
): boolean {
  const expectedColumns = new Map([
    ["scope_hash", "text"],
    ["record_version", "integer"],
    ["operation", "text"],
    ["authorization_resource_reference", "text"],
    ["resource_identity", "text"],
    ["idempotency_key_hash", "text"],
    ["request_fingerprint_algorithm", "text"],
    ["request_fingerprint_value", "text"],
    ["status", "text"],
    ["created_at", "timestamp with time zone"],
    ["updated_at", "timestamp with time zone"],
    ["expires_at", "timestamp with time zone"]
  ]);

  for (const [columnName, dataType] of expectedColumns) {
    const column = columns.find((candidate) => candidate.table_name === "portfolio_workspace_idempotency_records" && candidate.column_name === columnName);
    if (column === undefined || column.data_type !== dataType || column.is_nullable !== "NO") {
      return false;
    }
  }

  return true;
}

function latestMigrationTimestamp(migrations: readonly { readonly folderMillis: number }[]): number {
  return migrations.reduce((latest, migration) => Math.max(latest, migration.folderMillis), 0);
}

function rowsFrom(result: unknown): readonly Record<string, unknown>[] {
  if (Array.isArray(result)) {
    return result.filter(isRecord);
  }

  if (isRecord(result) && Array.isArray(result.rows)) {
    return result.rows.filter(isRecord);
  }

  return [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

interface AppliedMigration {
  readonly hash: string;
  readonly folderMillis: number;
}
