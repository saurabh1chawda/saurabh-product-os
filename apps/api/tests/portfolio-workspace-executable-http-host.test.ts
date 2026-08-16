import { request } from "node:http";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { Result } from "@career-companion/kernel";
import type { PortfolioWorkspaceRuntime } from "@career-companion/infrastructure";
import {
  GetPortfolioExecutionInput,
  GetPortfolioExecutionResult,
  PortfolioExecutionNotFoundError,
  PortfolioExecutionPersistenceUnavailableError
} from "@career-companion/portfolio-workspace-application";
import {
  ApprovalReference,
  ArtifactCandidate,
  CandidateId,
  ExecutionId,
  PlanSnapshotReference,
  PortfolioExecution,
  PortfolioExecutionCommandContext,
  PortfolioExecutionLifecycle,
  PortfolioExecutionSummaryProjection,
  PortfolioPlanReference,
  PortfolioWorkspaceAuthorizationResourceReference,
  PortfolioWorkItem,
  PortfolioWorkItemLifecycle,
  WorkItemId
} from "@career-companion/portfolio-workspace";
import { describe, expect, it } from "vitest";
import {
  GetPortfolioExecutionInternalHandler,
  NodeHttpApiServer,
  PortfolioWorkspaceApiHost,
  PortfolioWorkspaceApiHostConstructionError,
  PortfolioWorkspaceExecutableHttpHostStartupError,
  PortfolioWorkspacePresentationPrincipal,
  PortfolioWorkspacePresentationPrincipalType,
  createForbiddenPresentationError,
  createPortfolioWorkspaceExecutableHttpHostWithDependencies,
  createUnauthenticatedPresentationError,
  type PortfolioWorkspaceInternalAuthorization,
  type PortfolioWorkspaceTrustedPrincipalResolver
} from "../src";

describe("Portfolio Workspace executable HTTP host", () => {
  it("starts a concrete host with health endpoints and the public GET route", async () => {
    const runtime = fakeRuntime();
    const resolver = new RecordingPrincipalResolver({ principal: trustedPrincipal("reader") });
    const host = await expectExecutableHost({
      apiHost: fakeApiHost({ runtime }),
      resolver
    });

    try {
      expect(host.isLive()).toBe(true);
      expect(host.isReady()).toBe(true);
      expect(host.status().toJSON()).toMatchObject({
        live: true,
        ready: true,
        disposed: false,
        http: {
          listening: true
        },
        api: {
          ready: true,
          live: true
        }
      });
      expect(host).not.toHaveProperty("runtime");
      expect(host).not.toHaveProperty("repository");
      expect(host).not.toHaveProperty("database");

      const live = await send({
        port: host.port()!,
        path: "/health/live"
      });
      const ready = await send({
        port: host.port()!,
        path: "/health/ready"
      });
      const get = await send({
        port: host.port()!,
        path: "/v1/portfolio-workspace/executions/execution%3Ahost-success",
        headers: { "x-correlation-id": "correlation:host-success" }
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
      expect(get.headers["x-correlation-id"]).toBe("correlation:host-success");
      expect(get.body).toMatchObject({
        version: "v1",
        correlationId: "correlation:host-success",
        execution: {
          executionId: "execution:host-success",
          lifecycle: PortfolioExecutionLifecycle.Initialized
        }
      });
      expect(resolver.calls).toBe(1);
      expect(runtime.getService.calls).toBe(1);
    } finally {
      await host.dispose();
    }
  });

  it("rejects invalid startup configuration and missing trusted principal resolver before creating resources", async () => {
    const invalidPort = await createPortfolioWorkspaceExecutableHttpHostWithDependencies({
      apiHostEnvironment: fakeEnvironment(),
      listen: { port: 70000, host: "127.0.0.1" },
      trustedPrincipalResolver: new RecordingPrincipalResolver()
    }, failingIfCalledDependencies());

    const missingResolver = await createPortfolioWorkspaceExecutableHttpHostWithDependencies({
      apiHostEnvironment: fakeEnvironment(),
      listen: { port: 0, host: "127.0.0.1" },
      trustedPrincipalResolver: undefined
    } as unknown as Parameters<typeof createPortfolioWorkspaceExecutableHttpHostWithDependencies>[0], failingIfCalledDependencies());

    expect(invalidPort.isFailure).toBe(true);
    expect(invalidPort.error).toBeInstanceOf(PortfolioWorkspaceExecutableHttpHostStartupError);
    expect(invalidPort.error?.toJSON()).toMatchObject({
      reason: "invalid-listen-configuration",
      startupFailureCode: "NODE_HTTP_API_SERVER_CONFIGURATION_ERROR"
    });
    expect(missingResolver.isFailure).toBe(true);
    expect(missingResolver.error?.toJSON()).toMatchObject({
      reason: "missing-trusted-principal-resolver"
    });
  });

  it("maps API-host construction and not-ready startup failures safely", async () => {
    const constructionFailure = await createPortfolioWorkspaceExecutableHttpHostWithDependencies({
      apiHostEnvironment: fakeEnvironment(),
      listen: { port: 0, host: "127.0.0.1" },
      trustedPrincipalResolver: new RecordingPrincipalResolver()
    }, {
      createApiHost: async () => Result.failure(new PortfolioWorkspaceApiHostConstructionError({
        reason: "runtime-construction-failed",
        startupFailure: new Error("postgres://user:secret@localhost/prod")
      })),
      createHttpServer: (handler) => new NodeHttpApiServer({ handler })
    });

    const runtime = fakeRuntime({ ready: false });
    const notReady = await createPortfolioWorkspaceExecutableHttpHostWithDependencies({
      apiHostEnvironment: fakeEnvironment(),
      listen: { port: 0, host: "127.0.0.1" },
      trustedPrincipalResolver: new RecordingPrincipalResolver()
    }, {
      createApiHost: async () => Result.success(fakeApiHost({ runtime })),
      createHttpServer: (handler) => new NodeHttpApiServer({ handler })
    });

    expect(constructionFailure.isFailure).toBe(true);
    expect(constructionFailure.error?.toJSON()).toMatchObject({
      reason: "api-host-construction-failed",
      startupFailureName: "PortfolioWorkspaceApiHostConstructionError",
      startupFailureCode: "PORTFOLIO_WORKSPACE_API_HOST_CONSTRUCTION_FAILED"
    });
    expect(JSON.stringify(constructionFailure.error)).not.toMatch(/secret|prod|postgres/i);
    expect(notReady.isFailure).toBe(true);
    expect(notReady.error?.toJSON()).toMatchObject({
      reason: "api-host-not-ready"
    });
    expect(runtime.disposeCalls).toBe(1);
  });

  it("cleans up API host resources when HTTP bind fails", async () => {
    const occupied = new NodeHttpApiServer({
      handler: () => ({ status: 200, body: { status: "occupied" } })
    });
    await occupied.start({ port: 0, host: "127.0.0.1" });
    const runtime = fakeRuntime();

    try {
      const result = await createPortfolioWorkspaceExecutableHttpHostWithDependencies({
        apiHostEnvironment: fakeEnvironment(),
        listen: { port: occupied.status().port!, host: "127.0.0.1" },
        trustedPrincipalResolver: new RecordingPrincipalResolver()
      }, {
        createApiHost: async () => Result.success(fakeApiHost({ runtime })),
        createHttpServer: (handler) => new NodeHttpApiServer({ handler })
      });

      expect(result.isFailure).toBe(true);
      expect(result.error?.toJSON()).toMatchObject({
        reason: "http-server-start-failed",
        startupFailureCode: "NODE_HTTP_API_SERVER_CONFIGURATION_ERROR"
      });
      expect(runtime.disposeCalls).toBe(1);
    } finally {
      await occupied.stop();
    }
  });

  it("maps health and route failures through real HTTP without leaking internals", async () => {
    const unavailableRuntime = fakeRuntime({ failure: new PortfolioExecutionPersistenceUnavailableError() });
    const unavailableHost = await expectExecutableHost({
      apiHost: fakeApiHost({ runtime: unavailableRuntime })
    });

    try {
      const wrongLiveMethod = await send({
        port: unavailableHost.port()!,
        path: "/health/live",
        method: "POST"
      });
      const persistenceUnavailable = await send({
        port: unavailableHost.port()!,
        path: "/v1/portfolio-workspace/executions/execution%3Aunavailable",
        headers: { "x-correlation-id": "correlation:unavailable" }
      });
      const unknownRoute = await send({
        port: unavailableHost.port()!,
        path: "/v1/portfolio-workspace/executions/execution%3Aone/extra"
      });
      const methodMismatch = await send({
        port: unavailableHost.port()!,
        path: "/v1/portfolio-workspace/executions/execution%3Aone",
        method: "POST"
      });
      const malformedId = await send({
        port: unavailableHost.port()!,
        path: "/v1/portfolio-workspace/executions/%E0%A4%A"
      });
      const publicMutation = await send({
        port: unavailableHost.port()!,
        path: "/v1/portfolio-workspace/executions",
        method: "POST"
      });

      expect(wrongLiveMethod.status).toBe(405);
      expect(wrongLiveMethod.headers.allow).toBe("GET");
      expect(persistenceUnavailable.status).toBe(503);
      expect(unknownRoute.status).toBe(404);
      expect(methodMismatch.status).toBe(405);
      expect(methodMismatch.headers.allow).toBe("GET");
      expect(malformedId.status).toBe(400);
      expect(publicMutation.status).toBe(404);
      expect(JSON.stringify([
        wrongLiveMethod.body,
        persistenceUnavailable.body,
        unknownRoute.body,
        methodMismatch.body,
        malformedId.body,
        publicMutation.body
      ])).not.toMatch(/secret|SQLSTATE|stack|cause|Pool|Drizzle|revision|commandContext/i);
    } finally {
      await unavailableHost.dispose();
    }
  });

  it("does not dispose runtime per request and supports repeated and concurrent disposal", async () => {
    const runtime = fakeRuntime();
    const host = await expectExecutableHost({
      apiHost: fakeApiHost({ runtime })
    });

    await send({
      port: host.port()!,
      path: "/health/live"
    });
    await send({
      port: host.port()!,
      path: "/v1/portfolio-workspace/executions/execution%3Adisposal",
      headers: { "x-correlation-id": "correlation:disposal" }
    });
    expect(runtime.disposeCalls).toBe(0);

    await Promise.all([
      host.dispose(),
      host.dispose()
    ]);
    await host.dispose();

    expect(runtime.disposeCalls).toBe(1);
    expect(host.status().toJSON()).toMatchObject({
      live: false,
      ready: false,
      disposed: true
    });
  });

  it("keeps executable host source inside approved boundaries", () => {
    const source = readSource(httpSourceDirectoryPath());

    expect(source).not.toContain(["new ", "Pool"].join(""));
    expect(source).not.toContain(["drizzle", "("].join(""));
    expect(source).not.toContain(["Postgres", "PortfolioExecutionRepository"].join(""));
    expect(source).not.toContain(["new ", "PortfolioExecution"].join(""));
    expect(source).not.toContain(["Initialize", "PortfolioExecutionPresentationRequest"].join(""));
    expect(source).not.toContain(["idempotency", "Store"].join(""));
    expect(source).not.toContain(["Service", "Locator"].join(""));
    expect(source).not.toContain(["Command", "Bus"].join(""));
    expect(source).not.toContain(["express"].join(""));
    expect(source).not.toContain(["fast", "ify"].join(""));
    expect(source).not.toContain(["next", "/"].join(""));
    expect(source).not.toContain(["process", ".env"].join(""));
    expect(source).not.toContain(["process", ".exit"].join(""));
  });
});

class RecordingPrincipalResolver implements PortfolioWorkspaceTrustedPrincipalResolver {
  calls = 0;

  constructor(private readonly input: {
    readonly principal?: PortfolioWorkspacePresentationPrincipal;
    readonly authenticated?: boolean;
  } = {}) {}

  async resolve(request: { readonly correlationId: string }) {
    this.calls += 1;
    if (this.input.authenticated === false) {
      return Result.failure(createUnauthenticatedPresentationError(request.correlationId));
    }

    return Result.success(this.input.principal ?? trustedPrincipal("default"));
  }
}

class RecordingAuthorization implements PortfolioWorkspaceInternalAuthorization {
  constructor(private readonly input: { readonly deny?: boolean } = {}) {}

  async authorizeInitialize() {
    return Result.failure(createForbiddenPresentationError("correlation:unexpected-initialize"));
  }

  async authorizeGet(input: Parameters<PortfolioWorkspaceInternalAuthorization["authorizeGet"]>[0]) {
    if (this.input.deny === true) {
      return Result.failure(createForbiddenPresentationError(input.correlationId));
    }

    return Result.success(undefined);
  }
}

class FakeGetService {
  calls = 0;

  constructor(private readonly failure?: unknown) {}

  async get(input: GetPortfolioExecutionInput) {
    this.calls += 1;

    if (this.failure !== undefined) {
      return Result.failure(this.failure);
    }

    if (input.executionId.toJSON().includes("missing")) {
      return Result.failure(new PortfolioExecutionNotFoundError(input.executionId));
    }

    return Result.success(new GetPortfolioExecutionResult({
      summary: PortfolioExecutionSummaryProjection.fromExecution(executionFixture(input.executionId.toJSON())),
      correlationId: input.correlationId
    }));
  }
}

function fakeRuntime(input: {
  readonly ready?: boolean;
  readonly live?: boolean;
  readonly failure?: unknown;
} = {}) {
  const getService = new FakeGetService(input.failure);
  let disposeCalls = 0;
  const runtime = {
    isReady: () => input.ready ?? true,
    isLive: () => input.live ?? true,
    dispose: async () => {
      disposeCalls += 1;
    },
    getPortfolioExecution: getService,
    getService,
    get disposeCalls() {
      return disposeCalls;
    }
  } as unknown as PortfolioWorkspaceRuntime;

  return runtime as PortfolioWorkspaceRuntime & {
    readonly getService: FakeGetService;
    readonly disposeCalls: number;
  };
}

function fakeApiHost(input: {
  readonly runtime?: ReturnType<typeof fakeRuntime>;
  readonly authorization?: PortfolioWorkspaceInternalAuthorization;
} = {}): PortfolioWorkspaceApiHost {
  const runtime = input.runtime ?? fakeRuntime();

  return new PortfolioWorkspaceApiHost({
    runtime,
    initializePortfolioExecutionHandler: {} as never,
    getPortfolioExecutionHandler: new GetPortfolioExecutionInternalHandler({
      runtime,
      authorization: input.authorization ?? new RecordingAuthorization(),
      correlationIdGenerator: sequentialCorrelationGenerator("handler")
    })
  });
}

async function expectExecutableHost(input: {
  readonly apiHost?: PortfolioWorkspaceApiHost;
  readonly resolver?: PortfolioWorkspaceTrustedPrincipalResolver;
}) {
  const result = await createPortfolioWorkspaceExecutableHttpHostWithDependencies({
    apiHostEnvironment: fakeEnvironment(),
    listen: { port: 0, host: "127.0.0.1" },
    trustedPrincipalResolver: input.resolver ?? new RecordingPrincipalResolver()
  }, {
    createApiHost: async () => Result.success(input.apiHost ?? fakeApiHost()),
    createHttpServer: (handler) => new NodeHttpApiServer({ handler })
  });

  if (result.isFailure) {
    throw result.error;
  }

  return result.value!;
}

function failingIfCalledDependencies() {
  return {
    createApiHost: async () => {
      throw new Error("createApiHost should not have been called.");
    },
    createHttpServer: () => {
      throw new Error("createHttpServer should not have been called.");
    }
  };
}

function fakeEnvironment() {
  return {
    environment: {
      PORTFOLIO_WORKSPACE_DATABASE_URL: "postgresql://user:password@localhost:5432/portfolio_workspace_test",
      PORTFOLIO_WORKSPACE_RUNTIME_ENVIRONMENT: "test",
      PORTFOLIO_WORKSPACE_MIGRATION_MODE: "verify-only"
    }
  };
}

function trustedPrincipal(suffix: string): PortfolioWorkspacePresentationPrincipal {
  const result = PortfolioWorkspacePresentationPrincipal.create({
    principalId: suffix,
    principalType: PortfolioWorkspacePresentationPrincipalType.User,
    authenticationProvider: "trusted-test-host"
  });

  if (result.isFailure) {
    throw new Error("Expected trusted principal fixture.");
  }

  return result.value!;
}

function executionFixture(executionId: string): PortfolioExecution {
  const suffix = executionId.replace("execution:", "");

  return new PortfolioExecution({
    id: new ExecutionId(executionId),
    portfolioPlanReference: new PortfolioPlanReference({
      planId: `plan:${suffix}`,
      roadmapId: `roadmap:${suffix}`,
      planArtifactReference: `artifact:${suffix}`
    }),
    planSnapshotReference: new PlanSnapshotReference({
      snapshotReference: `snapshot:${suffix}`
    }),
    approvalReference: new ApprovalReference({
      approvalReference: `approval:${suffix}`
    }),
    authorizationResourceReference: new PortfolioWorkspaceAuthorizationResourceReference({
      authorizationResourceReference: `portfolio-workspace:owner:${suffix}`
    }),
    commandContext: new PortfolioExecutionCommandContext({
      commandId: `command:${suffix}`,
      correlationId: `correlation:${suffix}`,
      actorReference: `actor:${suffix}`,
      occurredAt: "2026-08-16T00:00:00.000Z"
    }),
    lifecycle: PortfolioExecutionLifecycle.Initialized,
    workItems: [new PortfolioWorkItem({
      id: new WorkItemId(`work-item:${suffix}`),
      lifecycle: PortfolioWorkItemLifecycle.Pending
    })],
    candidates: [new ArtifactCandidate({
      id: new CandidateId(`candidate:${suffix}`),
      lifecycle: "Registered"
    })]
  });
}

function sequentialCorrelationGenerator(prefix: string) {
  let sequence = 0;

  return {
    generate: () => {
      sequence += 1;
      return `correlation:${prefix}-${sequence}`;
    }
  };
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

function readSource(directory: string): string {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      return readSource(path);
    }

    return entry.endsWith(".ts") ? readFileSync(path, "utf8") : "";
  }).join("\n");
}

function httpSourceDirectoryPath(): string {
  const cwd = process.cwd();

  if (cwd.endsWith(`${join("apps", "api")}`)) {
    return join(cwd, "src", "portfolio-workspace", "http");
  }

  return join(cwd, "apps", "api", "src", "portfolio-workspace", "http");
}
