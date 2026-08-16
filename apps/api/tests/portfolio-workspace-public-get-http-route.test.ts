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
  PortfolioWorkspacePresentationErrorCategory,
  PortfolioWorkspacePresentationErrorCode,
  PortfolioWorkspacePresentationPrincipal,
  PortfolioWorkspacePresentationPrincipalType,
  createForbiddenPresentationError,
  createPortfolioWorkspacePublicGetExecutionHttpRoute,
  createUnauthenticatedPresentationError,
  type PortfolioWorkspaceInternalAuthorization,
  type PortfolioWorkspaceTrustedPrincipalResolver
} from "../src";

describe("Portfolio Workspace public Get HTTP route", () => {
  it("returns a safe v1 response for GET success", async () => {
    const runtime = fakeRuntime();
    const authorization = new RecordingAuthorization();
    const resolver = new RecordingPrincipalResolver({ principal: trustedPrincipal("reader") });
    const server = await startedRouteServer({ runtime, authorization, resolver });

    try {
      const response = await send({
        port: server.status().port!,
        path: "/v1/portfolio-workspace/executions/execution%3Ahttp-success",
        headers: { "x-correlation-id": "correlation:http-success" }
      });

      expect(response.status).toBe(200);
      expect(response.headers["x-correlation-id"]).toBe("correlation:http-success");
      expect(response.body).toMatchObject({
        version: "v1",
        correlationId: "correlation:http-success",
        execution: {
          executionId: "execution:http-success",
          lifecycle: PortfolioExecutionLifecycle.Initialized
        }
      });
      expect(resolver.calls).toBe(1);
      expect(authorization.getCalls).toBe(1);
      expect(runtime.getService.calls).toBe(1);
      expect(runtime.getService.lastInput?.toJSON()).toEqual({
        executionId: "execution:http-success",
        correlationId: "correlation:http-success"
      });
    } finally {
      await server.stop();
    }
  });

  it("extracts executionId from the path and ignores query identity data", async () => {
    const runtime = fakeRuntime();
    const authorization = new RecordingAuthorization();
    const resolver = new RecordingPrincipalResolver({ principal: trustedPrincipal("trusted") });
    const server = await startedRouteServer({ runtime, authorization, resolver });

    try {
      const response = await send({
        port: server.status().port!,
        path: "/v1/portfolio-workspace/executions/execution%3Apath-only?executionId=execution:query&principalId=evil&commandContext=bad",
        headers: { "x-correlation-id": "correlation:path-only" }
      });

      expect(response.status).toBe(200);
      expect(runtime.getService.lastInput?.executionId.toJSON()).toBe("execution:path-only");
      expect(authorization.principalIds).toEqual(["trusted"]);
      expect(JSON.stringify(response.body)).not.toMatch(/evil|commandContext|query/i);
    } finally {
      await server.stop();
    }
  });

  it("maps missing, invalid, malformed, and unsupported routes safely", async () => {
    const server = await startedRouteServer();

    try {
      const notFound = await send({
        port: server.status().port!,
        path: "/v1/portfolio-workspace/other/execution%3Aone",
        headers: { "x-correlation-id": "correlation:not-found-route" }
      });
      const extraSegment = await send({
        port: server.status().port!,
        path: "/v1/portfolio-workspace/executions/execution%3Aone/extra"
      });
      const blank = await send({
        port: server.status().port!,
        path: "/v1/portfolio-workspace/executions/%20",
        headers: { "x-correlation-id": "correlation:blank-id" }
      });
      const malformed = await send({
        port: server.status().port!,
        path: "/v1/portfolio-workspace/executions/%E0%A4%A",
        headers: { "x-correlation-id": "correlation:malformed-id" }
      });
      const wrongMethod = await send({
        port: server.status().port!,
        path: "/v1/portfolio-workspace/executions/execution%3Awrong-method",
        method: "POST",
        headers: { "x-correlation-id": "correlation:wrong-method" }
      });

      expect(notFound.status).toBe(404);
      expect(extraSegment.status).toBe(404);
      expect(blank.status).toBe(400);
      expect(malformed.status).toBe(400);
      expect(wrongMethod.status).toBe(405);
      expect(wrongMethod.headers.allow).toBe("GET");
      expect(notFound.body).toMatchObject({ category: PortfolioWorkspacePresentationErrorCategory.InvalidInput });
      expect(blank.body).toMatchObject({
        category: PortfolioWorkspacePresentationErrorCategory.InvalidInput,
        code: PortfolioWorkspacePresentationErrorCode.InvalidRequest
      });
    } finally {
      await server.stop();
    }
  });

  it("maps missing executions through the existing Get flow", async () => {
    const notFound = await withRouteServer({
      runtime: fakeRuntime({ failure: new PortfolioExecutionNotFoundError(new ExecutionId("execution:not-found")) })
    }, (server) => send({
      port: server.status().port!,
      path: "/v1/portfolio-workspace/executions/execution%3Anot-found",
      headers: { "x-correlation-id": "correlation:not-found" }
    }));

    expect(notFound.status).toBe(404);
    expect(notFound.body).toMatchObject({
      category: PortfolioWorkspacePresentationErrorCategory.NotFound,
      code: PortfolioWorkspacePresentationErrorCode.PortfolioExecutionNotFound
    });
  });

  it("maps unauthenticated, forbidden, unavailable, and unexpected failures safely", async () => {
    const unauthenticated = await withRouteServer({
      resolver: new RecordingPrincipalResolver({ authenticated: false })
    }, (server) => send({
      port: server.status().port!,
      path: "/v1/portfolio-workspace/executions/execution%3Aunauthenticated",
      headers: { "x-correlation-id": "correlation:unauthenticated" }
    }));

    const deniedRuntime = fakeRuntime();
    const forbidden = await withRouteServer({
      runtime: deniedRuntime,
      authorization: new RecordingAuthorization({ deny: true })
    }, (server) => send({
      port: server.status().port!,
      path: "/v1/portfolio-workspace/executions/execution%3Aforbidden",
      headers: { "x-correlation-id": "correlation:forbidden" }
    }));

    const runtimeUnavailable = await withRouteServer({
      runtime: fakeRuntime({ ready: false })
    }, (server) => send({
      port: server.status().port!,
      path: "/v1/portfolio-workspace/executions/execution%3Aruntime-unavailable",
      headers: { "x-correlation-id": "correlation:runtime-unavailable" }
    }));

    const persistenceUnavailable = await withRouteServer({
      runtime: fakeRuntime({ failure: new PortfolioExecutionPersistenceUnavailableError() })
    }, (server) => send({
      port: server.status().port!,
      path: "/v1/portfolio-workspace/executions/execution%3Apersistence-unavailable",
      headers: { "x-correlation-id": "correlation:persistence-unavailable" }
    }));

    const unexpected = await withRouteServer({
      getHandler: throwingGetHandler()
    }, (server) => send({
      port: server.status().port!,
      path: "/v1/portfolio-workspace/executions/execution%3Aunexpected",
      headers: { "x-correlation-id": "correlation:unexpected" }
    }));

    expect(unauthenticated.status).toBe(401);
    expect(unauthenticated.body).toMatchObject({ category: PortfolioWorkspacePresentationErrorCategory.Unauthenticated });
    expect(forbidden.status).toBe(403);
    expect(forbidden.body).toMatchObject({ category: PortfolioWorkspacePresentationErrorCategory.Forbidden });
    expect(deniedRuntime.getService.calls).toBe(0);
    expect(runtimeUnavailable.status).toBe(503);
    expect(persistenceUnavailable.status).toBe(503);
    expect(unexpected.status).toBe(500);
    expect(JSON.stringify(unexpected.body)).not.toMatch(/secret|stack|SQLSTATE|cause/i);
  });

  it("normalizes unsafe correlation and isolates sequential and concurrent requests", async () => {
    const runtime = fakeRuntime();
    const authorization = new RecordingAuthorization();
    const resolver = new SequencePrincipalResolver([
      trustedPrincipal("first"),
      trustedPrincipal("second"),
      trustedPrincipal("third")
    ]);
    const server = await startedRouteServer({ runtime, authorization, resolver });

    try {
      const first = await send({
        port: server.status().port!,
        path: "/v1/portfolio-workspace/executions/execution%3Afirst",
        headers: { "x-correlation-id": "unsafe correlation" }
      });
      const [second, third] = await Promise.all([
        send({
          port: server.status().port!,
          path: "/v1/portfolio-workspace/executions/execution%3Asecond",
          headers: { "x-correlation-id": "correlation:second" }
        }),
        send({
          port: server.status().port!,
          path: "/v1/portfolio-workspace/executions/execution%3Athird",
          headers: { "x-correlation-id": "correlation:third" }
        })
      ]);

      expect(first.headers["x-correlation-id"]).toBe("correlation:generated-1");
      expect(JSON.stringify(first.body)).not.toContain("unsafe correlation");
      expect(second.headers["x-correlation-id"]).toBe("correlation:second");
      expect(third.headers["x-correlation-id"]).toBe("correlation:third");
      expect(runtime.getService.inputs.map((input) => input.executionId.toJSON()).sort()).toEqual([
        "execution:first",
        "execution:second",
        "execution:third"
      ]);
      expect(authorization.principalIds.sort()).toEqual(["first", "second", "third"]);
    } finally {
      await server.stop();
    }
  });

  it("does not leak secrets, principal objects, revision, facts, command context, or internals", async () => {
    const response = await withRouteServer({}, (server) => send({
      port: server.status().port!,
      path: "/v1/portfolio-workspace/executions/execution%3Aprivacy?token=secret&actorReference=evil",
      headers: {
        authorization: "Bearer route-secret-token",
        "x-correlation-id": "correlation:privacy"
      }
    }));
    const serialized = JSON.stringify(response);

    expect(serialized).not.toMatch(/route-secret-token|actorReference|principal|revision|commandContext|aggregate|runtime|repository|Pool|Drizzle|SQLSTATE|stack|cause/i);
  });

  it("keeps public route source GET-only and boundary-clean", () => {
    const source = readSource(routeSourceDirectoryPath());

    expect(source).toContain("GET");
    expect(source).not.toContain(["pg"].join(""));
    expect(source).not.toContain(["Pool"].join(""));
    expect(source).not.toContain(["Drizzle"].join(""));
    expect(source).not.toContain(["drizzle", "("].join(""));
    expect(source).not.toContain(["Postgres", "PortfolioExecutionRepository"].join(""));
    expect(source).not.toContain(["PortfolioExecution", "Repository"].join(""));
    expect(source).not.toContain(["new ", "PortfolioExecution"].join(""));
    expect(source).not.toContain(["Initialize", "PortfolioExecution"].join(""));
    expect(source).not.toContain(["initialize", "PortfolioExecution"].join(""));
    expect(source).not.toContain("process.env");
    expect(source).not.toContain("SIGTERM");
    expect(source).not.toContain("SIGINT");
    expect(source).not.toContain(["express"].join(""));
    expect(source).not.toContain(["fast", "ify"].join(""));
    expect(source).not.toContain(["H", "ono"].join(""));
    expect(source).not.toContain(["Service", "Locator"].join(""));
    expect(source).not.toContain(["Command", "Bus"].join(""));
    expect(source).not.toContain(["retry", "Loop"].join(""));
    expect(source).not.toContain(["direct ", "SQL"].join(""));
    expect(source).not.toContain(["Oidc", "Jwt"].join(""));
    expect(source).not.toContain(["Jose", "Jwt"].join(""));
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

class SequencePrincipalResolver implements PortfolioWorkspaceTrustedPrincipalResolver {
  constructor(private readonly principals: PortfolioWorkspacePresentationPrincipal[]) {}

  async resolve() {
    const principal = this.principals.shift();
    if (principal === undefined) {
      throw new Error("Unexpected principal resolution.");
    }

    return Result.success(principal);
  }
}

class RecordingAuthorization implements PortfolioWorkspaceInternalAuthorization {
  getCalls = 0;
  readonly principalIds: string[] = [];

  constructor(private readonly input: { readonly deny?: boolean } = {}) {}

  async authorizeInitialize() {
    return Result.failure(createForbiddenPresentationError("correlation:unexpected-initialize"));
  }

  async authorizeGet(input: Parameters<PortfolioWorkspaceInternalAuthorization["authorizeGet"]>[0]) {
    this.getCalls += 1;
    this.principalIds.push(input.principal.principalId);

    if (this.input.deny === true) {
      return Result.failure(createForbiddenPresentationError(input.correlationId));
    }

    return Result.success(undefined);
  }
}

class FakeGetService {
  calls = 0;
  readonly inputs: GetPortfolioExecutionInput[] = [];
  lastInput: GetPortfolioExecutionInput | undefined;

  constructor(private readonly failure?: unknown) {}

  async get(input: GetPortfolioExecutionInput) {
    this.calls += 1;
    this.inputs.push(input);
    this.lastInput = input;

    if (this.failure !== undefined) {
      return Result.failure(this.failure);
    }

    return Result.success(new GetPortfolioExecutionResult({
      summary: PortfolioExecutionSummaryProjection.fromExecution(executionFixture(input.executionId.toJSON())),
      correlationId: input.correlationId
    }));
  }
}

function startedRouteServer(input: {
  readonly runtime?: ReturnType<typeof fakeRuntime>;
  readonly authorization?: PortfolioWorkspaceInternalAuthorization;
  readonly resolver?: PortfolioWorkspaceTrustedPrincipalResolver;
  readonly getHandler?: GetPortfolioExecutionInternalHandler;
} = {}): Promise<NodeHttpApiServer> {
  const server = new NodeHttpApiServer({
    handler: createPortfolioWorkspacePublicGetExecutionHttpRoute({
      getHandler: input.getHandler ?? new GetPortfolioExecutionInternalHandler({
        runtime: input.runtime ?? fakeRuntime(),
        authorization: input.authorization ?? new RecordingAuthorization(),
        correlationIdGenerator: sequentialCorrelationGenerator("handler")
      }),
      principalResolver: input.resolver ?? new RecordingPrincipalResolver(),
      correlationIdGenerator: sequentialCorrelationGenerator("generated")
    })
  });

  return server.start({ port: 0, host: "127.0.0.1" }).then(() => server);
}

async function withRouteServer<T>(
  input: Parameters<typeof startedRouteServer>[0],
  callback: (server: NodeHttpApiServer) => Promise<T>
): Promise<T> {
  const server = await startedRouteServer(input);
  try {
    return await callback(server);
  } finally {
    await server.stop();
  }
}

function throwingGetHandler(): GetPortfolioExecutionInternalHandler {
  return {
    async handle() {
      throw new Error("secret SQLSTATE stack");
    }
  } as unknown as GetPortfolioExecutionInternalHandler;
}

function fakeRuntime(input: {
  readonly ready?: boolean;
  readonly failure?: unknown;
} = {}) {
  const getService = new FakeGetService(input.failure);
  const runtime = {
    isReady: () => input.ready ?? true,
    getPortfolioExecution: getService
  } as unknown as PortfolioWorkspaceRuntime;

  return Object.assign(runtime, { getService });
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

function routeSourceDirectoryPath(): string {
  const cwd = process.cwd();

  if (cwd.endsWith(`${join("apps", "api")}`)) {
    return join(cwd, "src", "portfolio-workspace", "http");
  }

  return join(cwd, "apps", "api", "src", "portfolio-workspace", "http");
}
