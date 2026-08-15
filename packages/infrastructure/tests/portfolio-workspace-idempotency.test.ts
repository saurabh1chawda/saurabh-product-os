import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PORTFOLIO_WORKSPACE_IDEMPOTENCY_RECORD_VERSION,
  PortfolioWorkspaceIdempotencyPersistenceError,
  PortfolioWorkspaceIdempotencyPersistenceOperation,
  PortfolioWorkspaceIdempotencyPersistenceStatus,
  PortfolioWorkspaceIdempotencyRecordMapper,
  PortfolioWorkspaceIdempotencyReservationKind,
  PortfolioWorkspaceIdempotencyReservationResult
} from "../src";
import * as publicApi from "../src";
import { portfolioWorkspaceIdempotencyRecords } from "../src/portfolio-workspace/postgres/schema";
import type { PortfolioWorkspaceIdempotencyReservationInput } from "../src/portfolio-workspace/idempotency";
import type { PortfolioWorkspaceIdempotencyRow } from "../src/portfolio-workspace/postgres/schema";

describe("Portfolio Workspace durable idempotency persistence contracts", () => {
  it("maps reservation input to a deterministic privacy-preserving row", () => {
    const input = reservationInput();
    const row = PortfolioWorkspaceIdempotencyRecordMapper.reservationToRow(input);
    const repeated = PortfolioWorkspaceIdempotencyRecordMapper.reservationToRow(input);

    expect(row).toEqual(repeated);
    expect(row.recordVersion).toBe(PORTFOLIO_WORKSPACE_IDEMPOTENCY_RECORD_VERSION);
    expect(row.status).toBe(PortfolioWorkspaceIdempotencyPersistenceStatus.Reserved);
    expect(row.operation).toBe(PortfolioWorkspaceIdempotencyPersistenceOperation.InitializeExecution);
    expect(row.requestFingerprintAlgorithm).toBe("sha256");
    expect(row.requestFingerprintValue).toBe(fingerprintA.value);
    expect(row.idempotencyKeyHash).toMatch(/^[a-f0-9]{64}$/u);
    expect(row.idempotencyKeyHash).toBe(scope.idempotencyKeyHash);
    expect(row.scopeHash).toMatch(/^[a-f0-9]{64}$/u);
    expect(JSON.stringify(row)).not.toContain("idem-key-1");
    expect(row.replayResponsePayload).toBeNull();
  });

  it("round-trips succeeded records and rejects corrupt persistence records", () => {
    const reservation = PortfolioWorkspaceIdempotencyRecordMapper.reservationToRow(reservationInput());
    const success = PortfolioWorkspaceIdempotencyRecordMapper.successUpdate({
      scope,
      fingerprint: fingerprintA,
      completedAt,
      replayPayload
    });
    const succeededRow: PortfolioWorkspaceIdempotencyRow = {
      ...reservation,
      status: success.status,
      replayContractVersion: success.replayContractVersion ?? null,
      replayResponsePayload: success.replayResponsePayload ?? null,
      updatedAt: success.updatedAt,
      completedAt: success.completedAt ?? null
    };
    const mapped = PortfolioWorkspaceIdempotencyRecordMapper.fromRow(succeededRow);

    expect(mapped.isSuccess).toBe(true);
    expect(mapped.value?.replayContractVersion).toBe("portfolio-workspace-initialize:v1");
    expect(mapped.value?.originalCorrelationId).toBe("correlation:original");
    expect(mapped.value?.originalCommandId).toBe("command:original");
    expect(mapped.value?.replayResponsePayload).toEqual(replayPayload.responsePayload);

    expect(PortfolioWorkspaceIdempotencyRecordMapper.fromRow({
      ...reservation,
      recordVersion: 99
    } as PortfolioWorkspaceIdempotencyRow).error).toBeInstanceOf(PortfolioWorkspaceIdempotencyPersistenceError);
    expect(PortfolioWorkspaceIdempotencyRecordMapper.fromRow({
      ...reservation,
      requestFingerprintValue: "not-a-hash"
    } as PortfolioWorkspaceIdempotencyRow).error?.reason).toBe("invalid-record");
  });

  it("keeps reservation results immutable and safely serializable", () => {
    const result = new PortfolioWorkspaceIdempotencyReservationResult({
      kind: PortfolioWorkspaceIdempotencyReservationKind.ReplaySucceeded,
      replayPayload
    });

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.replayPayload)).toBe(true);
    expect(result.toJSON()).toEqual({
      kind: "replay-succeeded",
      replayPayload
    });
    expect(JSON.stringify(result)).not.toContain("SQL");
    expect(JSON.stringify(result)).not.toContain("stack");
  });

  it("defines schema and migration boundaries for the idempotency table", () => {
    const migrationSql = migration("0001_workable_molly_hayes.sql");

    expect(portfolioWorkspaceIdempotencyRecords).toBeDefined();
    expect(migrationSql).toContain("CREATE TABLE \"portfolio_workspace_idempotency_records\"");
    expect(migrationSql).toContain("\"scope_hash\" text PRIMARY KEY NOT NULL");
    expect(migrationSql).toContain("\"idempotency_key_hash\" text NOT NULL");
    expect(migrationSql).toContain("\"original_command_id\" text NOT NULL");
    expect(migrationSql).toContain("\"replay_response_payload\" jsonb");
    expect(migrationSql).toContain("CREATE UNIQUE INDEX \"portfolio_workspace_idempotency_scope_unique\"");
    expect(migrationSql).toContain("CREATE INDEX \"portfolio_workspace_idempotency_expires_at_idx\"");
    expect(migrationSql).not.toContain("portfolio_workspace_idempotency_records\".\"idempotency_key\"");
    expect(migrationSql).not.toContain("authorization_header");
    expect(migrationSql).not.toContain("cookie");
    expect(migrationSql).not.toContain("session");
    expect(migrationSql).not.toContain("actor_reference");
    expect(migrationSql).not.toContain("command_context");
  });

  it("keeps idempotency out of Domain while allowing Application semantic contracts only", () => {
    const workspaceRoot = join(packageRoot(), "..", "..");
    const domainSource = readSourceTree(join(workspaceRoot, "packages", "portfolio-workspace", "src"));
    const applicationSource = readSourceTree(join(workspaceRoot, "packages", "portfolio-workspace-application", "src"));
    const apiContracts = readSourceTree(join(workspaceRoot, "apps", "api", "src", "portfolio-workspace", "idempotency"));
    const infrastructureIdempotencySource = readSourceTree(join(packageRoot(), "src", "portfolio-workspace", "idempotency"));

    expect(domainSource).not.toContain("Idempotency");
    expect(applicationSource).toContain("PortfolioWorkspaceIdempotencyIdentity");
    expect(applicationSource).toContain("PortfolioWorkspaceIdempotencyPort");
    expect(applicationSource).not.toContain("Idempotency-Key");
    expect(applicationSource).not.toContain("HttpRequest");
    expect(applicationSource).not.toContain("statusCode");
    expect(applicationSource).not.toContain("drizzle-orm");
    expect(applicationSource).not.toContain("from \"pg\"");
    expect(applicationSource).not.toContain("Pool");
    expect(applicationSource).not.toContain("TransactionManager");
    expect(applicationSource).not.toContain("UnitOfWork");
    expect(apiContracts).not.toContain("drizzle-orm");
    expect(apiContracts).not.toContain("from \"pg\"");
    for (const token of [
      ["express"].join(""),
      ["fast", "ify"].join(""),
      ["next", "/"].join(""),
      ["Service", "Locator"].join(""),
      ["Command", "Bus"].join("")
    ]) {
      expect(infrastructureIdempotencySource).not.toContain(token);
    }
  });

  it("exports only the approved durable idempotency public API", () => {
    expect(Object.keys(publicApi).sort()).toContain("PostgresPortfolioWorkspaceIdempotencyStore");
    expect(Object.keys(publicApi).sort()).toContain("PostgresPortfolioWorkspaceIdempotentMutationOrchestrator");
    expect(Object.keys(publicApi).sort()).toContain("PortfolioWorkspaceIdempotentMutationResultKind");
    expect(Object.keys(publicApi).sort()).toContain("PortfolioWorkspaceIdempotencyRecordMapper");
    expect(Object.keys(publicApi).sort()).toContain("PORTFOLIO_WORKSPACE_IDEMPOTENCY_RECORD_VERSION");
    expect(Object.keys(publicApi).sort()).not.toContain("portfolioWorkspaceIdempotencyRecords");
    expect(Object.keys(publicApi).sort()).not.toContain("PortfolioWorkspaceIdempotencyRow");
  });
});

const now = new Date("2026-08-11T00:00:00.000Z");
const completedAt = new Date("2026-08-11T00:00:01.000Z");
const expiresAt = new Date("2026-08-12T00:00:00.000Z");
const fingerprintA = {
  algorithm: "sha256" as const,
  value: "a".repeat(64)
};
const scope = {
  operation: PortfolioWorkspaceIdempotencyPersistenceOperation.InitializeExecution,
  authorizationResourceReference: "portfolio-workspace:owner-hash",
  resourceIdentity: "execution:idempotent",
  idempotencyKeyHash: "c".repeat(64)
};
const replayPayload = {
  replayContractVersion: "portfolio-workspace-initialize:v1",
  responsePayload: {
    v: "1",
    executionId: "execution:idempotent"
  }
};

function reservationInput(): PortfolioWorkspaceIdempotencyReservationInput {
  return {
    scope,
    fingerprint: fingerprintA,
    originalCommandId: "command:original",
    originalCorrelationId: "correlation:original",
    now,
    expiresAt
  };
}

function migration(fileName: string): string {
  return readFileSync(join(packageRoot(), "drizzle", "portfolio-workspace", fileName), "utf8");
}

function packageRoot(): string {
  const packageLocal = process.cwd();
  if (packageLocal.endsWith("infrastructure")) return packageLocal;
  return join(process.cwd(), "packages", "infrastructure");
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
