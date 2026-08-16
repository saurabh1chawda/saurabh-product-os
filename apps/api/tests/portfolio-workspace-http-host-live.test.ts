import { createHash } from "node:crypto";
import { request } from "node:http";
import { inspect } from "node:util";
import { Client } from "pg";
import { afterEach, describe, expect, it } from "vitest";
import { Result } from "@career-companion/kernel";
import { PortfolioWorkspaceAuthorizationResourceReference } from "@career-companion/portfolio-workspace";
import {
  PORTFOLIO_WORKSPACE_CORRELATION_HEADER,
  PortfolioWorkspaceApiHost,
  PortfolioWorkspaceExecutableHttpHost,
  PortfolioWorkspacePresentationPrincipal,
  PortfolioWorkspacePresentationPrincipalType,
  createForbiddenPresentationError,
  createPortfolioWorkspaceApiHostFromEnvironment,
  createPortfolioWorkspaceExecutableHttpHost,
  type PortfolioWorkspaceInternalAuthorization,
  type PortfolioWorkspaceInternalRequest,
  type PortfolioWorkspaceTrustedPrincipalResolver
} from "../src";

const liveDatabaseUrl = process.env.PORTFOLIO_WORKSPACE_TEST_DATABASE_URL?.trim();
const describeLive = liveDatabaseUrl === undefined ? describe.skip : describe;
const liveHarnesses: HttpHostLiveHarness[] = [];
const TEST_PASSWORD_MARKERS = ["portfolio_workspace_test_password", "temporary-test-password", "secret"];

describeLive("Portfolio Workspace executable HTTP host live PostgreSQL integration", () => {
  afterEach(async () => {
    while (liveHarnesses.length > 0) {
      await liveHarnesses.pop()?.dispose();
    }
  });

  it("serves health and public GET through the concrete host against PostgreSQL", async () => {
    const harness = await createHarness();
    const principal = trustedPrincipal("http-host");
    const executionId = uniqueExecutionId("http-host");

    const seedingHost = await expectApiHost(harness, {
      migrationMode: "apply",
      authorization: new ControlledAuthorization()
    });
    const initialized = await seedingHost.initializePortfolioExecutionHandler.handle({
      principal,
      request: initializeRequest(executionId, "http-host", "correlation:http-host-initialize")
    });
    expect(initialized.status).toBe(201);
    await seedingHost.dispose();

    const httpHost = await expectHttpHost(harness, {
      migrationMode: "verify-only",
      trustedPrincipalResolver: new StaticPrincipalResolver(principal),
      authorization: new ControlledAuthorization()
    });

    try {
      const live = await send({
        port: httpHost.port()!,
        path: "/health/live"
      });
      const ready = await send({
        port: httpHost.port()!,
        path: "/health/ready"
      });
      const get = await send({
        port: httpHost.port()!,
        path: `/v1/portfolio-workspace/executions/${encodeURIComponent(executionId)}`,
        headers: { "x-correlation-id": "correlation:http-host-get" }
      });
      const missing = await send({
        port: httpHost.port()!,
        path: `/v1/portfolio-workspace/executions/${encodeURIComponent(uniqueExecutionId("missing"))}`,
        headers: { "x-correlation-id": "correlation:http-host-missing" }
      });
      const publicMutation = await send({
        port: httpHost.port()!,
        path: "/v1/portfolio-workspace/executions",
        method: "POST"
      });

      expect(live).toMatchObject({
        status: 200,
        body: { status: "live" }
      });
      expect(ready).toMatchObject({
        status: 200,
        body: { status: "ready" }
      });
      expect(get.status).toBe(200);
      expect(get.headers["x-correlation-id"]).toBe("correlation:http-host-get");
      expect(get.body).toMatchObject({
        version: "v1",
        correlationId: "correlation:http-host-get",
        execution: {
          executionId,
          lifecycle: "Initialized",
          workItemCount: 2,
          candidateCount: 2
        }
      });
      expect(missing.status).toBe(404);
      expect(publicMutation.status).toBe(404);
      expectNoSensitiveLeak([live, ready, get, missing, publicMutation, httpHost], harness);
    } finally {
      await httpHost.dispose();
    }

    const recreated = await expectHttpHost(harness, {
      migrationMode: "verify-only",
      trustedPrincipalResolver: new StaticPrincipalResolver(principal),
      authorization: new ControlledAuthorization()
    });
    try {
      const persisted = await send({
        port: recreated.port()!,
        path: `/v1/portfolio-workspace/executions/${encodeURIComponent(executionId)}`,
        headers: { "x-correlation-id": "correlation:http-host-recreated" }
      });
      expect(persisted.status).toBe(200);
      expect(persisted.body).toMatchObject({
        execution: {
          executionId,
          lifecycle: "Initialized"
        }
      });
    } finally {
      await recreated.dispose();
    }
  });
});

class StaticPrincipalResolver implements PortfolioWorkspaceTrustedPrincipalResolver {
  constructor(private readonly principal: PortfolioWorkspacePresentationPrincipal) {}

  async resolve() {
    return Result.success(this.principal);
  }
}

class ControlledAuthorization implements PortfolioWorkspaceInternalAuthorization {
  constructor(private readonly input: {
    readonly initializeAllowed?: boolean;
    readonly getAllowed?: boolean;
  } = {}) {}

  async authorizeInitialize(input: Parameters<PortfolioWorkspaceInternalAuthorization["authorizeInitialize"]>[0]) {
    if (this.input.initializeAllowed === false) {
      return Result.failure(createForbiddenPresentationError(input.correlationId));
    }

    return Result.success(authorizationResourceReference());
  }

  async authorizeGet(input: Parameters<PortfolioWorkspaceInternalAuthorization["authorizeGet"]>[0]) {
    if (this.input.getAllowed === false) {
      return Result.failure(createForbiddenPresentationError(input.correlationId));
    }

    return Result.success(undefined);
  }
}

async function createHarness(): Promise<HttpHostLiveHarness> {
  if (liveDatabaseUrl === undefined) {
    throw new Error("PORTFOLIO_WORKSPACE_TEST_DATABASE_URL is required.");
  }
  const harness = await HttpHostLiveHarness.create(liveDatabaseUrl);
  liveHarnesses.push(harness);
  expect(await harness.postgresMajorVersion()).toBe(17);
  return harness;
}

async function expectApiHost(
  harness: HttpHostLiveHarness,
  overrides: Partial<HostOptions> = {}
): Promise<PortfolioWorkspaceApiHost> {
  const result = await createPortfolioWorkspaceApiHostFromEnvironment({
    environment: environmentMap(harness, overrides),
    authorization: overrides.authorization ?? new ControlledAuthorization(),
    commandIdGenerator: overrides.commandIdGenerator ?? sequentialGenerator("command"),
    correlationIdGenerator: overrides.correlationIdGenerator ?? sequentialGenerator("correlation"),
    clock: overrides.clock ?? fixedClock()
  });
  if (result.isFailure || result.value === undefined) {
    throw new Error(`Expected API host creation success: ${safeOutput(result.error)}`);
  }

  return result.value;
}

async function expectHttpHost(
  harness: HttpHostLiveHarness,
  overrides: Partial<HostOptions> & {
    readonly trustedPrincipalResolver: PortfolioWorkspaceTrustedPrincipalResolver;
  }
): Promise<PortfolioWorkspaceExecutableHttpHost> {
  const result = await createPortfolioWorkspaceExecutableHttpHost({
    apiHostEnvironment: {
      environment: environmentMap(harness, overrides),
      authorization: overrides.authorization ?? new ControlledAuthorization(),
      commandIdGenerator: overrides.commandIdGenerator ?? sequentialGenerator("command"),
      correlationIdGenerator: overrides.correlationIdGenerator ?? sequentialGenerator("correlation"),
      clock: overrides.clock ?? fixedClock()
    },
    listen: { port: 0, host: "127.0.0.1" },
    trustedPrincipalResolver: overrides.trustedPrincipalResolver
  });
  if (result.isFailure || result.value === undefined) {
    throw new Error(`Expected HTTP host creation success: ${safeOutput(result.error)}`);
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
  harness: HttpHostLiveHarness,
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

function trustedPrincipal(suffix: string): PortfolioWorkspacePresentationPrincipal {
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
    now: () => new Date("2026-08-16T00:00:00.000Z")
  };
}

function uniqueExecutionId(suffix: string): string {
  return `execution:http-host:${process.pid}:${Date.now()}:${suffix}`;
}

function send(input: {
  readonly port: number;
  readonly path: string;
  readonly method?: string;
  readonly headers?: Record<string, string>;
}): Promise<{
  readonly status: number;
  readonly headers: Record<string, string | string[] | undefined>;
  readonly body: unknown;
}> {
  return new Promise((resolve, reject) => {
    const clientRequest = request({
      host: "127.0.0.1",
      port: input.port,
      path: input.path,
      method: input.method ?? "GET",
      headers: input.headers
    }, (response) => {
      const chunks: Buffer[] = [];

      response.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });
      response.on("end", () => {
        const rawBody = Buffer.concat(chunks).toString("utf8");
        resolve({
          status: response.statusCode ?? 0,
          headers: response.headers,
          body: rawBody.length === 0 ? undefined : JSON.parse(rawBody)
        });
      });
    });

    clientRequest.on("error", reject);
    clientRequest.end();
  });
}

class HttpHostLiveHarness {
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

  static async create(connectionString: string): Promise<HttpHostLiveHarness> {
    assertSafePortfolioWorkspaceTestDatabaseUrl(connectionString);
    const schemaName = uniquePostgresSchemaName("pwh");
    const client = new Client({ connectionString });
    try {
      await client.connect();
      await client.query(`CREATE SCHEMA ${quoteIdentifier(schemaName)}`);
      return new HttpHostLiveHarness({
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

  async postgresMajorVersion(): Promise<number> {
    const rows = await this.#client.query<{ readonly server_version_num: string }>(
      "SHOW server_version_num"
    );
    return Math.trunc(Number(rows.rows[0]?.server_version_num ?? 0) / 10_000);
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

function expectNoSensitiveLeak(value: unknown, harness: HttpHostLiveHarness): void {
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
    throw new Error("Refusing to run PostgreSQL API HTTP host integration tests: database name must contain 'test'.");
  }
  if (databaseName.includes("prod") || databaseName.includes("production")) {
    throw new Error("Refusing to run PostgreSQL API HTTP host integration tests against a database name that appears production-related.");
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

function authorizationResourceReference(): PortfolioWorkspaceAuthorizationResourceReference {
  return new PortfolioWorkspaceAuthorizationResourceReference({
    authorizationResourceReference: "portfolio-workspace:execution-owner-1"
  });
}
