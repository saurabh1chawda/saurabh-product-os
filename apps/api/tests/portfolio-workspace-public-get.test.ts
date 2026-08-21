import { readFileSync, readdirSync, statSync } from "node:fs";
import { inspect } from "node:util";
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
  GetPortfolioExecutionPublicBinding,
  PORTFOLIO_WORKSPACE_PUBLIC_CORRELATION_HEADER,
  PORTFOLIO_WORKSPACE_WWW_AUTHENTICATE_HEADER,
  PortfolioWorkspaceAuthenticatedIdentity,
  PortfolioWorkspaceAuthenticationError,
  PortfolioWorkspacePresentationErrorCategory,
  PortfolioWorkspacePresentationErrorCode,
  PortfolioWorkspacePresentationPrincipalType,
  PortfolioWorkspacePublicAuthenticationBoundary,
  createForbiddenPresentationError,
  type PortfolioWorkspaceAuthenticationAdapter,
  type PortfolioWorkspaceExternalAuthenticationContext,
  type PortfolioWorkspaceInternalAuthorization
} from "../src";

const SECRET_TOKEN = "public-get-secret-token-never-leak";

describe("Portfolio Workspace public Get Portfolio Execution binding", () => {
  it("returns a safe get response for valid bearer, authorized principal, and valid execution", async () => {
    const runtime = fakeRuntime();
    const authorization = new RecordingAuthorization();
    const binding = publicGetBinding({
      runtime,
      authorization,
      adapter: new RecordingAuthenticationAdapter(Result.success(identity("reader")))
    });

    const response = await binding.handle({
      executionId: "execution:public-get",
      headers: {
        Authorization: `Bearer ${SECRET_TOKEN}`,
        [PORTFOLIO_WORKSPACE_PUBLIC_CORRELATION_HEADER]: "correlation:public-get"
      }
    });

    expect(response.status).toBe(200);
    expect(response.headers).toEqual({
      [PORTFOLIO_WORKSPACE_PUBLIC_CORRELATION_HEADER]: "correlation:public-get"
    });
    expect(response.body).toMatchObject({
      version: "v1",
      correlationId: "correlation:public-get",
      execution: {
        executionId: "execution:public-get",
        lifecycle: PortfolioExecutionLifecycle.Initialized
      }
    });
    expect(authorization.getCalls).toBe(1);
    expect(runtime.getService.calls).toBe(1);
    expect(runtime.getService.lastInput?.toJSON()).toEqual({
      executionId: "execution:public-get",
      correlationId: "correlation:public-get"
    });
    expect(JSON.stringify(response)).not.toMatch(/token|Authorization|claims|revision|commandContext|aggregate/i);
  });

  it("maps missing, malformed, invalid, and unavailable authentication before authorization or get", async () => {
    const missing = await publicGetBinding().handle({
      executionId: "execution:missing-auth",
      headers: {}
    });
    const malformed = await publicGetBinding().handle({
      executionId: "execution:malformed-auth",
      headers: { authorization: `Bearer  ${SECRET_TOKEN}` }
    });
    const invalid = await publicGetBinding({
      adapter: new RecordingAuthenticationAdapter(Result.failure(PortfolioWorkspaceAuthenticationError.authenticationInvalid()))
    }).handle({
      executionId: "execution:invalid-auth",
      headers: { authorization: `Bearer ${SECRET_TOKEN}` }
    });
    const unavailable = await publicGetBinding({
      adapter: new RecordingAuthenticationAdapter(Result.failure(PortfolioWorkspaceAuthenticationError.verifierUnavailable(new Error("jwks secret"))))
    }).handle({
      executionId: "execution:auth-unavailable",
      headers: { authorization: `Bearer ${SECRET_TOKEN}` }
    });

    expect(missing.status).toBe(401);
    expect(malformed.status).toBe(401);
    expect(invalid.status).toBe(401);
    expect(unavailable.status).toBe(503);
    expect(missing.headers[PORTFOLIO_WORKSPACE_WWW_AUTHENTICATE_HEADER]).toBe("Bearer");
    expect(malformed.headers[PORTFOLIO_WORKSPACE_WWW_AUTHENTICATE_HEADER]).toBe("Bearer");
    expect(invalid.headers[PORTFOLIO_WORKSPACE_WWW_AUTHENTICATE_HEADER]).toBe("Bearer");
    expect(unavailable.headers).not.toHaveProperty(PORTFOLIO_WORKSPACE_WWW_AUTHENTICATE_HEADER);
    expect(JSON.stringify(unavailable)).not.toMatch(/jwks|secret/i);
  });

  it("short-circuits authorization and get on authentication failure", async () => {
    const runtime = fakeRuntime();
    const authorization = new RecordingAuthorization();
    const adapter = new RecordingAuthenticationAdapter(Result.failure(PortfolioWorkspaceAuthenticationError.credentialExpired()));
    const binding = publicGetBinding({ runtime, authorization, adapter });

    const response = await binding.handle({
      executionId: "execution:auth-fails",
      headers: { authorization: `Bearer ${SECRET_TOKEN}` }
    });

    expect(response.status).toBe(401);
    expect(adapter.contexts).toHaveLength(1);
    expect(authorization.getCalls).toBe(0);
    expect(runtime.getService.calls).toBe(0);
  });

  it("uses internal authorization and short-circuits get when access is forbidden", async () => {
    const runtime = fakeRuntime();
    const authorization = new RecordingAuthorization({ deny: true });
    const binding = publicGetBinding({ runtime, authorization });

    const response = await binding.handle({
      executionId: "execution:denied",
      headers: { authorization: `Bearer ${SECRET_TOKEN}` },
      incomingCorrelationId: "correlation:denied"
    });

    expect(response.status).toBe(403);
    expect(response.headers).toEqual({
      [PORTFOLIO_WORKSPACE_PUBLIC_CORRELATION_HEADER]: "correlation:denied"
    });
    expect(response.body).toMatchObject({
      category: PortfolioWorkspacePresentationErrorCategory.Forbidden,
      code: PortfolioWorkspacePresentationErrorCode.Forbidden,
      correlationId: "correlation:denied"
    });
    expect(authorization.getCalls).toBe(1);
    expect(runtime.getService.calls).toBe(0);
    expect(response.headers).not.toHaveProperty(PORTFOLIO_WORKSPACE_WWW_AUTHENTICATE_HEADER);
  });

  it("maps invalid execution IDs, missing executions, and persistence unavailability safely", async () => {
    const invalidRuntime = fakeRuntime();
    const invalidAuthorization = new RecordingAuthorization();
    const invalid = await publicGetBinding({
      runtime: invalidRuntime,
      authorization: invalidAuthorization
    }).handle({
      executionId: " ",
      headers: { authorization: `Bearer ${SECRET_TOKEN}` },
      incomingCorrelationId: "correlation:invalid-id"
    });

    const notFound = await publicGetBinding({
      runtime: fakeRuntime({ getFailure: new PortfolioExecutionNotFoundError(new ExecutionId("execution:not-found")) })
    }).handle({
      executionId: "execution:not-found",
      headers: { authorization: `Bearer ${SECRET_TOKEN}` },
      incomingCorrelationId: "correlation:not-found"
    });

    const unavailable = await publicGetBinding({
      runtime: fakeRuntime({ getFailure: new PortfolioExecutionPersistenceUnavailableError() })
    }).handle({
      executionId: "execution:unavailable",
      headers: { authorization: `Bearer ${SECRET_TOKEN}` },
      incomingCorrelationId: "correlation:unavailable"
    });

    expect(invalid.status).toBe(400);
    expect(invalid.body).toMatchObject({
      category: PortfolioWorkspacePresentationErrorCategory.InvalidInput,
      code: PortfolioWorkspacePresentationErrorCode.InvalidIdentifier
    });
    expect(invalidAuthorization.getCalls).toBe(0);
    expect(invalidRuntime.getService.calls).toBe(0);
    expect(notFound.status).toBe(404);
    expect(notFound.body).toMatchObject({
      category: PortfolioWorkspacePresentationErrorCategory.NotFound,
      code: PortfolioWorkspacePresentationErrorCode.PortfolioExecutionNotFound
    });
    expect(unavailable.status).toBe(503);
    expect(unavailable.body).toMatchObject({
      category: PortfolioWorkspacePresentationErrorCategory.Unavailable,
      code: PortfolioWorkspacePresentationErrorCode.PortfolioWorkspacePersistenceUnavailable
    });
    expect(unavailable.headers).not.toHaveProperty(PORTFOLIO_WORKSPACE_WWW_AUTHENTICATE_HEADER);
  });

  it("uses one safe correlation across auth, authorization, get, and response", async () => {
    const runtime = fakeRuntime();
    const authorization = new RecordingAuthorization();
    const binding = publicGetBinding({ runtime, authorization });

    const response = await binding.handle({
      executionId: "execution:correlated",
      headers: {
        authorization: `Bearer ${SECRET_TOKEN}`,
        [PORTFOLIO_WORKSPACE_PUBLIC_CORRELATION_HEADER]: "unsafe correlation with spaces"
      }
    });

    expect(response.status).toBe(200);
    expect(response.headers[PORTFOLIO_WORKSPACE_PUBLIC_CORRELATION_HEADER]).toBe("correlation:generated-1");
    expect((response.body as { readonly correlationId?: string }).correlationId).toBe("correlation:generated-1");
    expect(authorization.lastCorrelationId).toBe("correlation:generated-1");
    expect(runtime.getService.lastInput?.correlationId).toBe("correlation:generated-1");
    expect(JSON.stringify(response)).not.toContain("unsafe correlation");
  });

  it("does not expose token, auth provider internals, aggregate, revision, or command context", async () => {
    const response = await publicGetBinding().handle({
      executionId: "execution:privacy",
      headers: { authorization: `Bearer ${SECRET_TOKEN}` }
    });
    const serialized = JSON.stringify(response);
    const inspected = inspect(response);

    expect(serialized).not.toContain(SECRET_TOKEN);
    expect(inspected).not.toContain(SECRET_TOKEN);
    expect(serialized).not.toMatch(/Authorization|jwt|jwks|provider object|password|sql|stack|cause|revision|commandContext|aggregate/i);
    expect(response).not.toHaveProperty("principal");
    expect(response).not.toHaveProperty("runtime");
  });

  it("does not leak principal, request, token, or correlation state across sequential and concurrent calls", async () => {
    const adapter = new SequenceAuthenticationAdapter([
      Result.success(identity("first")),
      Result.success(identity("second")),
      Result.success(identity("third"))
    ]);
    const runtime = fakeRuntime();
    const authorization = new RecordingAuthorization();
    const binding = publicGetBinding({ adapter, runtime, authorization });

    const first = await binding.handle({
      executionId: "execution:first",
      headers: { authorization: "Bearer first-token" },
      incomingCorrelationId: "correlation:first"
    });
    const [second, third] = await Promise.all([
      binding.handle({
        executionId: "execution:second",
        headers: { authorization: "Bearer second-token" },
        incomingCorrelationId: "correlation:second"
      }),
      binding.handle({
        executionId: "execution:third",
        headers: { authorization: "Bearer third-token" },
        incomingCorrelationId: "correlation:third"
      })
    ]);

    expect((first.body as { readonly correlationId?: string }).correlationId).toBe("correlation:first");
    expect((second.body as { readonly correlationId?: string }).correlationId).toBe("correlation:second");
    expect((third.body as { readonly correlationId?: string }).correlationId).toBe("correlation:third");
    expect(authorization.principalIds.sort()).toEqual(["first", "second", "third"]);
    expect(runtime.getService.inputs.map((input) => input.executionId.toJSON()).sort()).toEqual([
      "execution:first",
      "execution:second",
      "execution:third"
    ]);
  });

  it("keeps public source GET-only, framework-neutral, and free of runtime or persistence construction", () => {
    const publicSource = readSource(join(packageRoot(), "apps", "api", "src", "portfolio-workspace", "public"));

    expect(publicSource).not.toContain("@career-companion/infrastructure");
    expect(publicSource).not.toContain("@career-companion/portfolio-workspace-application");
    expect(publicSource).not.toContain("@career-companion/portfolio-workspace\"");
    expect(publicSource).not.toContain("new PortfolioWorkspaceRuntime");
    expect(publicSource).not.toContain("new GetPortfolioExecutionApplicationService");
    expect(publicSource).not.toContain("new PortfolioExecution(");
    expect(publicSource).not.toContain("Postgres");
    expect(publicSource).not.toContain("drizzle");
    expect(publicSource).not.toContain("Pool");
    expect(publicSource).not.toContain("PostgresPortfolioExecutionRepository");
    expect(publicSource).not.toContain("PortfolioExecutionRepository");
    expect(publicSource).not.toContain("process.env");
    expect(publicSource).not.toContain("cookie");
    expect(publicSource).not.toContain("session");
    expect(publicSource).not.toContain("Idempotency");
    expect(publicSource).not.toContain("InitializePortfolioExecutionPublic");
    expect(publicSource).not.toContain("initializePortfolioExecution");
    expect(publicSource).not.toContain(["Retry", "Policy"].join(""));
    expect(publicSource).not.toContain(["retry", "Loop"].join(""));
    expect(publicSource).not.toContain("express");
    expect(publicSource).not.toContain("fastify");
    expect(publicSource).not.toContain("next/");
    expect(publicSource).not.toContain(["Service", "Locator"].join(""));
    expect(publicSource).not.toContain(["Command", "Bus"].join(""));
    expect(publicSource).not.toContain(["Container"].join(""));
  });
});

class RecordingAuthenticationAdapter implements PortfolioWorkspaceAuthenticationAdapter {
  readonly contexts: PortfolioWorkspaceExternalAuthenticationContext[] = [];

  constructor(
    private readonly result: Result<PortfolioWorkspaceAuthenticatedIdentity, PortfolioWorkspaceAuthenticationError>
  ) {}

  async authenticate(
    context: PortfolioWorkspaceExternalAuthenticationContext
  ): Promise<Result<PortfolioWorkspaceAuthenticatedIdentity, PortfolioWorkspaceAuthenticationError>> {
    this.contexts.push(context);

    return this.result;
  }
}

class SequenceAuthenticationAdapter implements PortfolioWorkspaceAuthenticationAdapter {
  readonly contexts: PortfolioWorkspaceExternalAuthenticationContext[] = [];

  constructor(
    private readonly results: Result<PortfolioWorkspaceAuthenticatedIdentity, PortfolioWorkspaceAuthenticationError>[]
  ) {}

  async authenticate(
    context: PortfolioWorkspaceExternalAuthenticationContext
  ): Promise<Result<PortfolioWorkspaceAuthenticatedIdentity, PortfolioWorkspaceAuthenticationError>> {
    this.contexts.push(context);
    const result = this.results.shift();
    if (result === undefined) {
      throw new Error("Unexpected authentication call.");
    }

    return result;
  }
}

class RecordingAuthorization implements PortfolioWorkspaceInternalAuthorization {
  getCalls = 0;
  lastCorrelationId: string | undefined;
  readonly principalIds: string[] = [];

  constructor(private readonly input: { readonly deny?: boolean } = {}) {}

  async authorizeInitialize() {
    return Result.failure(createForbiddenPresentationError("correlation:unexpected-initialize"));
  }

  async authorizeGet(input: Parameters<PortfolioWorkspaceInternalAuthorization["authorizeGet"]>[0]) {
    this.getCalls += 1;
    this.lastCorrelationId = input.correlationId;
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
    this.lastInput = input;
    this.inputs.push(input);

    if (this.failure !== undefined) {
      return Result.failure(this.failure);
    }

    return Result.success(new GetPortfolioExecutionResult({
      summary: PortfolioExecutionSummaryProjection.fromExecution(executionFixture(input.executionId.toJSON())),
      correlationId: input.correlationId
    }));
  }
}

function publicGetBinding(input: {
  readonly adapter?: PortfolioWorkspaceAuthenticationAdapter;
  readonly runtime?: ReturnType<typeof fakeRuntime>;
  readonly authorization?: PortfolioWorkspaceInternalAuthorization;
} = {}): GetPortfolioExecutionPublicBinding {
  const runtime = input.runtime ?? fakeRuntime();
  return new GetPortfolioExecutionPublicBinding({
    authentication: publicAuthenticationBoundary(input.adapter ?? new RecordingAuthenticationAdapter(Result.success(identity("default-user")))),
    getHandler: new GetPortfolioExecutionInternalHandler({
      runtime,
      authorization: input.authorization ?? new RecordingAuthorization(),
      correlationIdGenerator: sequentialCorrelationGenerator()
    })
  });
}

function publicAuthenticationBoundary(
  adapter: PortfolioWorkspaceAuthenticationAdapter
): PortfolioWorkspacePublicAuthenticationBoundary {
  let sequence = 0;

  return new PortfolioWorkspacePublicAuthenticationBoundary({
    adapter,
    correlationIdGenerator: {
      generate: () => {
        sequence += 1;
        return `correlation:generated-${sequence}`;
      }
    }
  });
}

function fakeRuntime(input: {
  readonly ready?: boolean;
  readonly getFailure?: unknown;
} = {}) {
  const getService = new FakeGetService(input.getFailure);
  const runtime = {
    isReady: () => input.ready ?? true,
    getPortfolioExecution: getService
  } as unknown as PortfolioWorkspaceRuntime;

  return Object.assign(runtime, { getService });
}

function sequentialCorrelationGenerator(): { generate(): string } {
  let sequence = 0;

  return {
    generate: () => {
      sequence += 1;
      return `correlation:handler-generated-${sequence}`;
    }
  };
}

function identity(subject: string): PortfolioWorkspaceAuthenticatedIdentity {
  const result = PortfolioWorkspaceAuthenticatedIdentity.create({
    provider: "career-oidc",
    subject,
    principalType: PortfolioWorkspacePresentationPrincipalType.User,
    displayName: "Public User"
  });

  if (result.isFailure) {
    throw new Error("Expected valid identity fixture.");
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

function packageRoot(): string {
  return join(__dirname, "..", "..", "..");
}

function readSource(directory: string): string {
  return readdirSync(directory)
    .flatMap((entry) => {
      const path = join(directory, entry);
      if (statSync(path).isDirectory()) {
        return readSource(path);
      }

      return entry.endsWith(".ts") ? readFileSync(path, "utf8") : "";
    })
    .join("\n");
}
