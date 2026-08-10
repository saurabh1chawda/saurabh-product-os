import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { inspect } from "node:util";
import { Client } from "pg";
import { afterEach, describe, expect, it } from "vitest";
import { Result } from "@career-companion/kernel";
import {
  PORTFOLIO_WORKSPACE_CORRELATION_HEADER,
  PortfolioWorkspaceApiHost,
  PortfolioWorkspaceApiHostConstructionError,
  PortfolioWorkspaceApiHostLifecycle,
  PortfolioWorkspacePresentationErrorCode,
  PortfolioWorkspacePresentationOutcome,
  PortfolioWorkspacePresentationPrincipal,
  PortfolioWorkspacePresentationPrincipalType,
  createForbiddenPresentationError,
  createPortfolioWorkspaceApiHostFromEnvironment,
  type PortfolioWorkspaceInternalAuthorization,
  type PortfolioWorkspaceInternalRequest,
  type PortfolioWorkspacePresentationPrincipal as TrustedPrincipal
} from "../src";

const liveDatabaseUrl = process.env.PORTFOLIO_WORKSPACE_TEST_DATABASE_URL?.trim();
const describeLive = liveDatabaseUrl === undefined ? describe.skip : describe;
const liveHarnesses: ApiHostLiveHarness[] = [];
const TEST_PASSWORD_MARKERS = ["portfolio_workspace_test_password", "temporary-test-password", "secret"];

describeLive("PortfolioWorkspaceApiHost live PostgreSQL integration", () => {
  afterEach(async () => {
    while (liveHarnesses.length > 0) {
      await liveHarnesses.pop()?.dispose();
    }
  });

  it("starts from a clean schema with apply mode and exposes no infrastructure internals", async () => {
    const harness = await createHarness();
    const host = await expectHost(harness, {
      migrationMode: "apply"
    });

    expect(host).toBeInstanceOf(PortfolioWorkspaceApiHost);
    expect(host.isReady()).toBe(true);
    expect(host.isLive()).toBe(true);
    expect(host.status().toJSON()).toEqual({
      live: true,
      ready: true,
      lifecycle: PortfolioWorkspaceApiHostLifecycle.Ready,
      disposed: false
    });
    expect(host).not.toHaveProperty("runtime");
    expect(host).not.toHaveProperty("repository");
    expect(host).not.toHaveProperty("database");
    expect(await harness.tableExists("portfolio_executions")).toBe(true);
    expect(await harness.appliedMigrationCount()).toBe(1);
    expectNoSensitiveLeak(host, harness);

    await host.dispose();
  });

  it("fails verify-only before migration and succeeds verify-only after apply", async () => {
    const harness = await createHarness();

    const cleanVerify = await createHostResult(harness, {
      migrationMode: "verify-only"
    });
    expect(cleanVerify.isFailure).toBe(true);
    expect(cleanVerify.error).toBeDefined();
    expect(cleanVerify.error).toBeInstanceOf(PortfolioWorkspaceApiHostConstructionError);
    expect((cleanVerify.error as PortfolioWorkspaceApiHostConstructionError).toJSON()).toMatchObject({
      reason: "runtime-construction-failed",
      startupFailureName: "PortfolioWorkspaceMigrationReadinessError",
      startupFailureCode: "PORTFOLIO_WORKSPACE_MIGRATION_READINESS_FAILED"
    });
    expect(safeOutput(cleanVerify.error)).not.toContain("migration-required");
    expectNoSensitiveLeak(cleanVerify.error, harness);

    const applyingHost = await expectHost(harness, {
      migrationMode: "apply"
    });
    expect(await harness.appliedMigrationCount()).toBe(1);
    await applyingHost.dispose();

    const verifyingHost = await expectHost(harness, {
      migrationMode: "verify-only"
    });
    expect(verifyingHost.isReady()).toBe(true);
    expect(await harness.appliedMigrationCount()).toBe(1);
    await verifyingHost.dispose();
  });

  it("initializes and gets an execution through the real host handlers against PostgreSQL", async () => {
    const harness = await createHarness();
    const host = await expectHost(harness, {
      migrationMode: "apply",
      correlationIdGenerator: sequentialGenerator("correlation"),
      commandIdGenerator: sequentialGenerator("command"),
      clock: fixedClock()
    });
    const principal = trustedPrincipal("live-flow");
    const executionId = uniqueExecutionId("live-flow");

    const initialized = await host.initializePortfolioExecutionHandler.handle({
      principal,
      request: initializeRequest(executionId, "live-flow", "correlation:live-initialize")
    });

    expect(initialized.status).toBe(201);
    expect(initialized.headers[PORTFOLIO_WORKSPACE_CORRELATION_HEADER]).toBe("correlation:live-initialize");
    expect(initialized.body).toMatchObject({
      version: "v1",
      outcome: PortfolioWorkspacePresentationOutcome.ExecutionInitialized,
      correlationId: "correlation:live-initialize",
      execution: {
        executionId,
        lifecycle: "Initialized",
        workItemCount: 2,
        candidateCount: 2,
        acceptedArtifactCount: 0
      }
    });
    expect((initialized.body as Record<string, unknown>).fact).toBeUndefined();
    expect((initialized.body as Record<string, unknown>).commandContext).toBeUndefined();
    expect((initialized.body as Record<string, unknown>).revision).toBeUndefined();
    expectNoSensitiveLeak(initialized, harness);

    const queried = await host.getPortfolioExecutionHandler.handle({
      principal,
      request: getRequest(executionId, "correlation:live-get")
    });

    expect(queried.status).toBe(200);
    expect(queried.headers[PORTFOLIO_WORKSPACE_CORRELATION_HEADER]).toBe("correlation:live-get");
    expect(queried.body).toMatchObject({
      version: "v1",
      correlationId: "correlation:live-get",
      execution: {
        executionId,
        lifecycle: "Initialized",
        workItemCount: 2,
        candidateCount: 2,
        acceptedArtifactCount: 0
      }
    });
    expect((queried.body as Record<string, unknown>).fact).toBeUndefined();
    expect((queried.body as Record<string, unknown>).revision).toBeUndefined();
    expectNoSensitiveLeak(queried, harness);

    await host.dispose();
  });

  it("maps duplicate initialization, missing execution, and invalid input safely", async () => {
    const harness = await createHarness();
    const host = await expectHost(harness, {
      migrationMode: "apply",
      correlationIdGenerator: sequentialGenerator("correlation"),
      commandIdGenerator: sequentialGenerator("command"),
      clock: fixedClock()
    });
    const principal = trustedPrincipal("failure-flow");
    const executionId = uniqueExecutionId("failure-flow");

    expect((await host.initializePortfolioExecutionHandler.handle({
      principal,
      request: initializeRequest(executionId, "failure-flow", "correlation:failure-init")
    })).status).toBe(201);

    const duplicate = await host.initializePortfolioExecutionHandler.handle({
      principal,
      request: initializeRequest(executionId, "failure-flow", "correlation:failure-duplicate")
    });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body).toMatchObject({
      category: "conflict",
      code: PortfolioWorkspacePresentationErrorCode.PortfolioExecutionAlreadyExists,
      correlationId: "correlation:failure-duplicate"
    });
    expectNoSensitiveLeak(duplicate, harness);

    const missing = await host.getPortfolioExecutionHandler.handle({
      principal,
      request: getRequest(uniqueExecutionId("missing"), "correlation:failure-missing")
    });
    expect(missing.status).toBe(404);
    expect(missing.body).toMatchObject({
      category: "not-found",
      code: PortfolioWorkspacePresentationErrorCode.PortfolioExecutionNotFound,
      correlationId: "correlation:failure-missing"
    });
    expectNoSensitiveLeak(missing, harness);

    const invalidInitialize = await host.initializePortfolioExecutionHandler.handle({
      principal,
      request: {
        headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "correlation:invalid-initialize" },
        body: { executionId: 123 }
      }
    });
    expect(invalidInitialize.status).toBe(400);
    expect(invalidInitialize.body).toMatchObject({
      category: "invalid-input",
      code: PortfolioWorkspacePresentationErrorCode.InvalidRequest,
      correlationId: "correlation:invalid-initialize"
    });

    const invalidGet = await host.getPortfolioExecutionHandler.handle({
      principal,
      request: getRequest(" ", "correlation:invalid-get")
    });
    expect(invalidGet.status).toBe(400);
    expect(invalidGet.body).toMatchObject({
      category: "invalid-input",
      code: PortfolioWorkspacePresentationErrorCode.InvalidIdentifier,
      correlationId: "correlation:invalid-get"
    });
    expectNoSensitiveLeak([invalidInitialize, invalidGet], harness);

    await host.dispose();
  });

  it("enforces authorization denial and preserves safe correlation behavior", async () => {
    const harness = await createHarness();
    const authorization = new ControlledAuthorization({
      initializeAllowed: false,
      getAllowed: false
    });
    const host = await expectHost(harness, {
      authorization,
      migrationMode: "apply",
      correlationIdGenerator: sequentialGenerator("correlation"),
      commandIdGenerator: sequentialGenerator("command"),
      clock: fixedClock()
    });
    const principal = trustedPrincipal("denied");
    const executionId = uniqueExecutionId("denied");

    const deniedInitialize = await host.initializePortfolioExecutionHandler.handle({
      principal,
      request: initializeRequest(executionId, "denied", "correlation:denied-init")
    });
    expect(deniedInitialize.status).toBe(403);
    expect(deniedInitialize.body).toMatchObject({
      category: "forbidden",
      code: PortfolioWorkspacePresentationErrorCode.Forbidden,
      correlationId: "correlation:denied-init"
    });

    const deniedGet = await host.getPortfolioExecutionHandler.handle({
      principal,
      request: getRequest(executionId, "correlation:denied-get")
    });
    expect(deniedGet.status).toBe(403);
    expect(deniedGet.body).toMatchObject({
      category: "forbidden",
      code: PortfolioWorkspacePresentationErrorCode.Forbidden
    });

    const allowedHost = await expectHost(harness, {
      migrationMode: "verify-only",
      correlationIdGenerator: sequentialGenerator("correlation"),
      commandIdGenerator: sequentialGenerator("command"),
      clock: fixedClock()
    });
    const unsafeCorrelation = await allowedHost.initializePortfolioExecutionHandler.handle({
      principal,
      request: initializeRequest(uniqueExecutionId("unsafe-correlation"), "unsafe-correlation", "unsafe value with spaces")
    });
    expect(unsafeCorrelation.status).toBe(201);
    expect(unsafeCorrelation.headers[PORTFOLIO_WORKSPACE_CORRELATION_HEADER]).toBe("correlation:generated-1");
    expect(JSON.stringify(unsafeCorrelation)).not.toContain("unsafe value with spaces");
    expectNoSensitiveLeak([deniedInitialize, deniedGet, unsafeCorrelation], harness);

    await host.dispose();
    await allowedHost.dispose();
  });

  it("reports readiness, liveness, repeated disposal, and partial startup cleanup with real resources", async () => {
    const harness = await createHarness();
    const host = await expectHost(harness, {
      migrationMode: "apply"
    });

    expect(host.isReady()).toBe(true);
    expect(host.isLive()).toBe(true);

    const firstDispose = host.dispose();
    const secondDispose = host.dispose();
    expect(host.status().toJSON()).toMatchObject({
      ready: false,
      lifecycle: PortfolioWorkspaceApiHostLifecycle.Disposing,
      notReadyReason: "disposing"
    });
    await Promise.all([firstDispose, secondDispose]);
    await host.dispose();
    expect(host.status().toJSON()).toEqual({
      live: false,
      ready: false,
      lifecycle: PortfolioWorkspaceApiHostLifecycle.Disposed,
      disposed: true,
      notReadyReason: "disposed"
    });
    expectNoSensitiveLeak(host, harness);

    const incompatibleHarness = await createHarness();
    const applyingHost = await expectHost(incompatibleHarness, {
      migrationMode: "apply"
    });
    await applyingHost.dispose();
    await incompatibleHarness.query("DROP TABLE portfolio_executions");

    const incompatible = await createHostResult(incompatibleHarness, {
      migrationMode: "verify-only"
    });
    expect(incompatible.isFailure).toBe(true);
    expect(incompatible.error).toBeInstanceOf(PortfolioWorkspaceApiHostConstructionError);
    expect((incompatible.error as PortfolioWorkspaceApiHostConstructionError).toJSON()).toMatchObject({
      reason: "runtime-construction-failed",
      startupFailureName: "PortfolioWorkspaceMigrationReadinessError",
      startupFailureCode: "PORTFOLIO_WORKSPACE_MIGRATION_READINESS_FAILED"
    });
    expect(safeOutput(incompatible.error)).not.toContain("schema-incompatible");
    expect(await incompatibleHarness.dropAndRecreateSchema()).toBe(true);
    expectNoSensitiveLeak(incompatible.error, incompatibleHarness);
  });

  it("rejects unsafe migration policy before opening database resources", async () => {
    for (const environment of ["staging", "production"] as const) {
      const harness = await createHarness();
      const result = await createHostResult(harness, {
        environment,
        migrationMode: "apply"
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(PortfolioWorkspaceApiHostConstructionError);
      expect((result.error as PortfolioWorkspaceApiHostConstructionError).toJSON()).toMatchObject({
        reason: "runtime-construction-failed",
        startupFailureName: "PortfolioWorkspaceRuntimeCompositionError",
        startupFailureCode: "PORTFOLIO_WORKSPACE_RUNTIME_COMPOSITION_FAILED"
      });
      expect(safeOutput(result.error)).not.toContain("invalid-migration-policy");
      expect(await harness.appliedMigrationSchemaExists()).toBe(false);
      expectNoSensitiveLeak(result.error, harness);
    }
  });

  it("persists across host recreation and keeps the live host source inside approved boundaries", async () => {
    const harness = await createHarness();
    const hostA = await expectHost(harness, {
      migrationMode: "apply",
      correlationIdGenerator: sequentialGenerator("correlation"),
      commandIdGenerator: sequentialGenerator("command"),
      clock: fixedClock()
    });
    const principal = trustedPrincipal("cross-host");
    const executionId = uniqueExecutionId("cross-host");

    const initialized = await hostA.initializePortfolioExecutionHandler.handle({
      principal,
      request: initializeRequest(executionId, "cross-host", "correlation:cross-host-init")
    });
    expect(initialized.status).toBe(201);
    await hostA.dispose();

    const hostB = await expectHost(harness, {
      migrationMode: "verify-only",
      correlationIdGenerator: sequentialGenerator("correlation"),
      commandIdGenerator: sequentialGenerator("command"),
      clock: fixedClock()
    });
    const queried = await hostB.getPortfolioExecutionHandler.handle({
      principal,
      request: getRequest(executionId, "correlation:cross-host-get")
    });
    expect(queried.status).toBe(200);
    expect(queried.body).toMatchObject({
      execution: {
        executionId,
        lifecycle: "Initialized",
        workItemCount: 2,
        candidateCount: 2
      }
    });
    expect((queried.body as Record<string, unknown>).revision).toBeUndefined();
    await hostB.dispose();

    const source = readFileSync(join(packageRoot(), "tests", "portfolio-workspace-api-host-live.test.ts"), "utf8");
    expect(source).not.toContain(["new", "Pool"].join(" "));
    expect(source).not.toContain(["drizzle", "("].join(""));
    expect(source).not.toContain(["Postgres", "PortfolioExecutionRepository"].join(""));
    expect(source).not.toContain(["new", "PortfolioExecution("].join(" "));
    expect(source).not.toContain(["Application", "Service("].join(""));
    expect(source).not.toContain(["InMemory", "PortfolioExecutionRepository"].join(""));
    expect(source).not.toContain(["ex", "press"].join(""));
    expect(source).not.toContain(["fast", "ify"].join(""));
    expect(source).not.toContain(["next", "/"].join(""));
    expect(source).not.toContain(["Service", "Locator"].join(""));
    expect(source).not.toContain(["Command", "Bus"].join(""));
  });
});

class ApiHostLiveHarness {
  readonly #client: Client;
  readonly #schemaName: string;
  readonly #baseConnectionString: string;
  #disposed = false;

  private constructor(input: {
    readonly client: Client;
    readonly schemaName: string;
    readonly baseConnectionString: string;
  }) {
    this.#client = input.client;
    this.#schemaName = input.schemaName;
    this.#baseConnectionString = input.baseConnectionString;
  }

  static async create(connectionString: string): Promise<ApiHostLiveHarness> {
    assertSafePortfolioWorkspaceTestDatabaseUrl(connectionString);
    const schemaName = uniquePostgresSchemaName("pwa");
    const client = new Client({ connectionString });
    try {
      await client.connect();
      await client.query(`CREATE SCHEMA ${quoteIdentifier(schemaName)}`);
      return new ApiHostLiveHarness({
        client,
        schemaName,
        baseConnectionString: connectionString
      });
    } catch (error) {
      await client.end().catch(() => undefined);
      throw error;
    }
  }

  runtimeDatabaseUrl(): string {
    const parsed = new URL(this.#baseConnectionString);
    parsed.searchParams.set("options", `-c search_path=${this.#schemaName}`);
    return parsed.toString();
  }

  databaseName(): string {
    return decodeURIComponent(new URL(this.#baseConnectionString).pathname.replace(/^\//, ""));
  }

  async query<T extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    values: readonly unknown[] = []
  ): Promise<readonly T[]> {
    await this.#client.query(`SET search_path TO ${quoteIdentifier(this.#schemaName)}`);
    const result = await this.#client.query(text, [...values]);
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
    const rows = await this.#client.query<{ readonly count: string }>(
      `SELECT count(*)::text AS count FROM drizzle.${quoteIdentifier(this.migrationMetadataTableName())}`
    );
    return Number(rows.rows[0]?.count ?? 0);
  }

  async appliedMigrationSchemaExists(): Promise<boolean> {
    const rows = await this.#client.query<{ readonly exists: boolean }>(
      "SELECT to_regclass($1) IS NOT NULL AS exists",
      [`drizzle.${this.migrationMetadataTableName()}`]
    );
    return rows.rows[0]?.exists === true;
  }

  async postgresMajorVersion(): Promise<number> {
    const rows = await this.#client.query<{ readonly server_version_num: string }>(
      "SHOW server_version_num"
    );
    return Math.trunc(Number(rows.rows[0]?.server_version_num ?? 0) / 10_000);
  }

  async dropAndRecreateSchema(): Promise<boolean> {
    await this.#client.query(`DROP SCHEMA ${quoteIdentifier(this.#schemaName)} CASCADE`);
    await this.#client.query(`CREATE SCHEMA ${quoteIdentifier(this.#schemaName)}`);
    return true;
  }

  async dispose(): Promise<void> {
    if (this.#disposed) {
      return;
    }
    this.#disposed = true;
    try {
      await this.#client.query(`DROP SCHEMA IF EXISTS ${quoteIdentifier(this.#schemaName)} CASCADE`);
      await this.#client.query(`DROP TABLE IF EXISTS drizzle.${quoteIdentifier(this.migrationMetadataTableName())}`);
    } finally {
      await this.#client.end();
    }
  }

  private migrationMetadataTableName(): string {
    return portfolioWorkspaceMigrationMetadataTableFor(this.#schemaName);
  }
}

class ControlledAuthorization implements PortfolioWorkspaceInternalAuthorization {
  constructor(private readonly input: {
    readonly initializeAllowed?: boolean;
    readonly getAllowed?: boolean;
  } = {}) {}

  async authorizeInitialize(input: Parameters<PortfolioWorkspaceInternalAuthorization["authorizeInitialize"]>[0]) {
    if (this.input.initializeAllowed === false) {
      return Result.failure(createForbiddenPresentationError(input.request.incomingCorrelationId ?? "correlation:authorization-denied"));
    }

    return Result.success(undefined);
  }

  async authorizeGet() {
    if (this.input.getAllowed === false) {
      return Result.failure(createForbiddenPresentationError("correlation:authorization-denied"));
    }

    return Result.success(undefined);
  }
}

async function createHarness(): Promise<ApiHostLiveHarness> {
  if (liveDatabaseUrl === undefined) {
    throw new Error("PORTFOLIO_WORKSPACE_TEST_DATABASE_URL is required.");
  }
  const harness = await ApiHostLiveHarness.create(liveDatabaseUrl);
  liveHarnesses.push(harness);
  expect(await harness.postgresMajorVersion()).toBe(17);
  return harness;
}

async function createHostResult(
  harness: ApiHostLiveHarness,
  overrides: Partial<HostOptions> = {}
) {
  return createPortfolioWorkspaceApiHostFromEnvironment({
    environment: environmentMap(harness, overrides),
    authorization: overrides.authorization ?? new ControlledAuthorization(),
    commandIdGenerator: overrides.commandIdGenerator ?? sequentialGenerator("command"),
    correlationIdGenerator: overrides.correlationIdGenerator ?? sequentialGenerator("correlation"),
    clock: overrides.clock ?? fixedClock()
  });
}

async function expectHost(
  harness: ApiHostLiveHarness,
  overrides: Partial<HostOptions> = {}
): Promise<PortfolioWorkspaceApiHost> {
  const result = await createHostResult(harness, overrides);
  if (result.isFailure || result.value === undefined) {
    throw new Error(`Expected host creation success: ${safeOutput(result.error)}`);
  }

  return result.value;
}

interface HostOptions {
  readonly environment: "development" | "test" | "staging" | "production";
  readonly migrationMode: "verify-only" | "apply";
  readonly authorization: PortfolioWorkspaceInternalAuthorization;
  readonly commandIdGenerator: { generate(): string };
  readonly correlationIdGenerator: { generate(): string };
  readonly clock: { now(): Date };
}

function environmentMap(
  harness: ApiHostLiveHarness,
  overrides: Partial<HostOptions>
): Record<string, string> {
  return {
    PORTFOLIO_WORKSPACE_DATABASE_URL: harness.runtimeDatabaseUrl(),
    PORTFOLIO_WORKSPACE_ENVIRONMENT: overrides.environment ?? "test",
    PORTFOLIO_WORKSPACE_MIGRATION_MODE: overrides.migrationMode ?? "verify-only",
    PORTFOLIO_WORKSPACE_DB_POOL_MAX: "1",
    PORTFOLIO_WORKSPACE_DB_CONNECTION_TIMEOUT_MS: "5000",
    PORTFOLIO_WORKSPACE_DB_IDLE_TIMEOUT_MS: "1000",
    PORTFOLIO_WORKSPACE_SHUTDOWN_TIMEOUT_MS: "1000"
  };
}

function initializeRequest(
  executionId: string,
  suffix: string,
  correlationId: string
): PortfolioWorkspaceInternalRequest {
  return {
    headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: correlationId },
    body: {
      executionId,
      portfolioPlanReference: {
        planId: `plan:${suffix}`,
        roadmapId: `roadmap:${suffix}`,
        planArtifactReference: `artifact:${suffix}`
      },
      planSnapshotReference: {
        snapshotReference: `snapshot:${suffix}:v1`
      },
      approvalReference: {
        approvalReference: `approval:${suffix}`
      },
      initialWorkItems: [
        { workItemId: `work-item:${suffix}:one` },
        { workItemId: `work-item:${suffix}:two` }
      ],
      initialCandidates: [
        { candidateId: `candidate:${suffix}:one` },
        { candidateId: `candidate:${suffix}:two` }
      ]
    }
  };
}

function getRequest(
  executionId: string,
  correlationId: string
): PortfolioWorkspaceInternalRequest {
  return {
    headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: correlationId },
    pathParameters: { executionId }
  };
}

function trustedPrincipal(suffix: string): TrustedPrincipal {
  const result = PortfolioWorkspacePresentationPrincipal.create({
    principalId: `principal-${suffix}`,
    principalType: PortfolioWorkspacePresentationPrincipalType.User,
    authenticationProvider: "career-test-auth"
  });
  if (result.isFailure || result.value === undefined) {
    throw new Error("Expected trusted principal creation to succeed.");
  }
  return result.value;
}

function sequentialGenerator(prefix: "command" | "correlation") {
  let next = 0;
  return {
    generate: () => {
      next += 1;
      return `${prefix}:generated-${next}`;
    }
  };
}

function fixedClock() {
  return {
    now: () => new Date("2026-08-07T00:00:00.000Z")
  };
}

function uniqueExecutionId(suffix: string): string {
  return `execution:api-host:${process.pid}:${Date.now()}:${suffix}`;
}

function expectNoSensitiveLeak(value: unknown, harness: ApiHostLiveHarness): void {
  const output = safeOutput(value);
  expect(output).not.toContain(liveDatabaseUrl);
  expect(output).not.toContain(harness.runtimeDatabaseUrl());
  expect(output).not.toContain(harness.databaseName());
  for (const marker of TEST_PASSWORD_MARKERS) {
    expect(output).not.toContain(marker);
  }
  expect(output).not.toMatch(/SQLSTATE|select |insert |update |delete |portfolio_executions|aggregate_payload|record_version|Pool|Drizzle|stack|cause|token|session|commandContext|revision/iu);
  expect(output).not.toContain(["Postgres", "PortfolioExecutionRepository"].join(""));
}

function safeOutput(value: unknown): string {
  return [
    JSON.stringify(value),
    String(value),
    inspect(value)
  ].join("\n");
}

function assertSafePortfolioWorkspaceTestDatabaseUrl(value: string): void {
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
    throw new Error("Refusing to run PostgreSQL API host integration tests: database name must contain 'test'.");
  }
  if (databaseName.includes("prod") || databaseName.includes("production")) {
    throw new Error("Refusing to run PostgreSQL API host integration tests against a database name that appears production-related.");
  }
}

function quoteIdentifier(value: string): string {
  return `"${value.replace(/"/g, "\"\"")}"`;
}

function portfolioWorkspaceMigrationMetadataTableFor(currentSchema: string): string {
  const normalizedSchema = currentSchema.trim().length > 0 ? currentSchema.trim() : "public";
  const schemaHash = createHash("sha256")
    .update(normalizedSchema)
    .digest("hex")
    .slice(0, 16);
  return `__portfolio_workspace_migrations_${schemaHash}`;
}

function uniquePostgresSchemaName(prefix: string): string {
  const schemaName = `${prefix}_${process.pid.toString(36)}_${Date.now().toString(36)}_${Math.random().toString(16).slice(2, 10)}`;
  if (schemaName.length > 63) {
    throw new Error("Generated PostgreSQL test schema name exceeds the identifier limit.");
  }
  return schemaName;
}

function packageRoot(): string {
  const cwd = process.cwd();
  if (cwd.endsWith(join("apps", "api")) || cwd.endsWith("api")) {
    return cwd;
  }
  return join(cwd, "apps", "api");
}
