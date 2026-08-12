import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { Result } from "@career-companion/kernel";
import type { PortfolioWorkspaceRuntime } from "@career-companion/infrastructure";
import {
  GetPortfolioExecutionInput,
  GetPortfolioExecutionResult,
  InitializePortfolioExecutionInput,
  InitializePortfolioExecutionResult,
  PortfolioExecutionAlreadyExistsError,
  PortfolioExecutionNotFoundError,
  PortfolioExecutionPersistenceUnavailableError,
  PortfolioExecutionRevision
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
  InitializePortfolioExecutionPresentationRequest,
  InitializePortfolioExecutionInternalHandler,
  PORTFOLIO_WORKSPACE_CORRELATION_HEADER,
  PortfolioWorkspaceProductionAuthorization,
  PortfolioWorkspaceCommandContextFactory,
  PortfolioWorkspacePresentationErrorCategory,
  PortfolioWorkspacePresentationErrorCode,
  PortfolioWorkspacePresentationOutcome,
  PortfolioWorkspacePresentationPrincipal,
  PortfolioWorkspacePresentationPrincipalType,
  authorizationResourceReferenceForPrincipal,
  createForbiddenPresentationError,
  mapPortfolioWorkspacePresentationErrorToInternalStatus,
  type PortfolioWorkspaceAuthorizationResourceResolver,
  type PortfolioWorkspaceInternalAuthorization
} from "../src";

describe("Portfolio Workspace internal API handlers", () => {
  it("initializes a PortfolioExecution through runtime with trusted context and presentation mapping", async () => {
    const runtime = fakeRuntime();
    const authorization = new FakeAuthorization();
    const commandContextFactory = deterministicCommandContextFactory();
    const handler = initializeHandler({ runtime, authorization, commandContextFactory });

    const response = await handler.handle({
      principal: trustedPrincipal("one"),
      request: {
        headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "correlation:incoming" },
        body: initializationBody("success")
      }
    });

    expect(response.status).toBe(201);
    expect(response.headers[PORTFOLIO_WORKSPACE_CORRELATION_HEADER]).toBe("correlation:incoming");
    expect(response.body).toMatchObject({
      version: "v1",
      correlationId: "correlation:incoming",
      outcome: PortfolioWorkspacePresentationOutcome.ExecutionInitialized,
      execution: {
        executionId: "execution:success",
        lifecycle: PortfolioExecutionLifecycle.Initialized
      }
    });
    expect(authorization.initializeCalls).toBe(1);
    expect(runtime.initializeService.calls).toBe(1);
    expect(runtime.initializeService.lastInput?.commandContext.toJSON()).toMatchObject({
      commandId: "command:generated-1",
      correlationId: "correlation:incoming",
      actorReference: "user:career-auth:principal-one"
    });
    expect(JSON.stringify(response.body)).not.toContain("commandContext");
    expect(JSON.stringify(response.body)).not.toContain("revision");
    expect(response.body).not.toHaveProperty("fact");
    expect((response.body as { readonly execution: Record<string, unknown> }).execution).not.toHaveProperty("factTypes");
  });

  it("rejects malformed initialization transport bodies before authorization or service invocation", async () => {
    const runtime = fakeRuntime();
    const authorization = new FakeAuthorization();
    const handler = initializeHandler({ runtime, authorization });

    const response = await handler.handle({
      principal: trustedPrincipal("malformed"),
      request: {
        headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "correlation:malformed" },
        body: null
      }
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      category: PortfolioWorkspacePresentationErrorCategory.InvalidInput,
      code: PortfolioWorkspacePresentationErrorCode.InvalidRequest,
      correlationId: "correlation:malformed"
    });
    expect(authorization.initializeCalls).toBe(0);
    expect(runtime.initializeService.calls).toBe(0);
    expect(JSON.stringify(response.body)).not.toContain("null");
  });

  it("denies initialization through the host authorization boundary without command or service work", async () => {
    const runtime = fakeRuntime();
    const authorization = new FakeAuthorization({ deniedCorrelationId: "correlation:denied" });
    const commandContextFactory = deterministicCommandContextFactory();
    const handler = initializeHandler({ runtime, authorization, commandContextFactory });

    const response = await handler.handle({
      principal: trustedPrincipal("denied"),
      request: {
        headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "correlation:denied" },
        body: initializationBody("denied")
      }
    });

    expect(response.status).toBe(403);
    expect(authorization.initializeCalls).toBe(1);
    expect(commandContextFactory.commandIdCalls()).toBe(0);
    expect(runtime.initializeService.calls).toBe(0);
  });

  it("maps initialization already-exists and persistence failures to safe host statuses", async () => {
    const alreadyExistsRuntime = fakeRuntime({
      initializeFailure: new PortfolioExecutionAlreadyExistsError({
        executionId: new ExecutionId("execution:exists"),
        currentRevision: new PortfolioExecutionRevision(1)
      })
    });
    const unavailableRuntime = fakeRuntime({
      initializeFailure: new PortfolioExecutionPersistenceUnavailableError()
    });

    const alreadyExists = await initializeHandler({ runtime: alreadyExistsRuntime }).handle({
      principal: trustedPrincipal("exists"),
      request: {
        headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "correlation:exists" },
        body: initializationBody("exists")
      }
    });
    const unavailable = await initializeHandler({ runtime: unavailableRuntime }).handle({
      principal: trustedPrincipal("unavailable"),
      request: {
        headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "correlation:unavailable" },
        body: initializationBody("unavailable")
      }
    });

    expect(alreadyExists.status).toBe(409);
    expect(alreadyExists.body).toMatchObject({
      category: PortfolioWorkspacePresentationErrorCategory.Conflict,
      code: PortfolioWorkspacePresentationErrorCode.PortfolioExecutionAlreadyExists,
      retryable: false
    });
    expect(unavailable.status).toBe(503);
    expect(unavailable.body).toMatchObject({
      category: PortfolioWorkspacePresentationErrorCategory.Unavailable,
      code: PortfolioWorkspacePresentationErrorCode.PortfolioWorkspacePersistenceUnavailable,
      retryable: false
    });
  });

  it("returns unavailable before authorization when runtime is not ready", async () => {
    const runtime = fakeRuntime({ ready: false });
    const authorization = new FakeAuthorization();
    const handler = initializeHandler({ runtime, authorization });

    const response = await handler.handle({
      principal: trustedPrincipal("not-ready"),
      request: {
        headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "correlation:not-ready" },
        body: initializationBody("not-ready")
      }
    });

    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({
      category: PortfolioWorkspacePresentationErrorCategory.Unavailable,
      code: PortfolioWorkspacePresentationErrorCode.PortfolioWorkspaceUnavailable,
      correlationId: "correlation:not-ready"
    });
    expect(authorization.initializeCalls).toBe(0);
    expect(runtime.initializeService.calls).toBe(0);
  });

  it("gets PortfolioExecution by ID through runtime without facts, revisions, or aggregates", async () => {
    const runtime = fakeRuntime();
    const authorization = new FakeAuthorization();
    const handler = getHandler({ runtime, authorization });

    const response = await handler.handle({
      principal: trustedPrincipal("get"),
      request: {
        headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "correlation:get" },
        pathParameters: { executionId: "execution:get" }
      }
    });

    expect(response.status).toBe(200);
    expect(response.headers[PORTFOLIO_WORKSPACE_CORRELATION_HEADER]).toBe("correlation:get");
    expect(response.body).toMatchObject({
      version: "v1",
      correlationId: "correlation:get",
      execution: {
        executionId: "execution:get",
        lifecycle: PortfolioExecutionLifecycle.Initialized
      }
    });
    expect(authorization.getCalls).toBe(1);
    expect(runtime.getService.calls).toBe(1);
    expect(runtime.getService.lastInput?.toJSON()).toEqual({
      executionId: "execution:get",
      correlationId: "correlation:get"
    });
    expect(JSON.stringify(response.body)).not.toContain("revision");
    expect(response.body).not.toHaveProperty("fact");
    expect((response.body as { readonly execution: Record<string, unknown> }).execution).not.toHaveProperty("factTypes");
    expect(response.body).not.toHaveProperty("aggregate");
  });

  it("maps get not-found, authorization denial, and invalid IDs safely", async () => {
    const notFoundRuntime = fakeRuntime({
      getFailure: new PortfolioExecutionNotFoundError(new ExecutionId("execution:missing"))
    });
    const deniedAuthorization = new FakeAuthorization({ deniedCorrelationId: "correlation:denied-get" });
    const deniedRuntime = fakeRuntime();

    const notFound = await getHandler({ runtime: notFoundRuntime }).handle({
      principal: trustedPrincipal("missing"),
      request: {
        headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "correlation:missing" },
        pathParameters: { executionId: "execution:missing" }
      }
    });
    const denied = await getHandler({ runtime: deniedRuntime, authorization: deniedAuthorization }).handle({
      principal: trustedPrincipal("denied-get"),
      request: {
        headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "correlation:denied-get" },
        pathParameters: { executionId: "execution:denied-get" }
      }
    });
    const invalid = await getHandler({ runtime: fakeRuntime() }).handle({
      principal: trustedPrincipal("invalid"),
      request: {
        headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "correlation:invalid" },
        pathParameters: { executionId: " " }
      }
    });

    expect(notFound.status).toBe(404);
    expect(notFound.body).toMatchObject({
      category: PortfolioWorkspacePresentationErrorCategory.NotFound,
      code: PortfolioWorkspacePresentationErrorCode.PortfolioExecutionNotFound
    });
    expect(denied.status).toBe(403);
    expect(deniedAuthorization.getCalls).toBe(1);
    expect(denied.body).toMatchObject({
      category: PortfolioWorkspacePresentationErrorCategory.Forbidden,
      code: PortfolioWorkspacePresentationErrorCode.Forbidden
    });
    expect(denied.body).not.toHaveProperty("execution");
    expect(denied.body).not.toHaveProperty("authorizationResourceReference");
    expect(deniedRuntime.getService.calls).toBe(0);
    expect(invalid.status).toBe(400);
    expect(invalid.body).toMatchObject({
      category: PortfolioWorkspacePresentationErrorCategory.InvalidInput,
      code: PortfolioWorkspacePresentationErrorCode.InvalidIdentifier
    });
  });

  it("preserves or safely replaces correlation and does not leak state across sequential requests", async () => {
    const runtime = fakeRuntime();
    const handler = initializeHandler({ runtime });

    const first = await handler.handle({
      principal: trustedPrincipal("first"),
      request: {
        headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "correlation:first" },
        body: initializationBody("first")
      }
    });
    const second = await handler.handle({
      principal: trustedPrincipal("second"),
      request: {
        headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "unsafe correlation" },
        body: initializationBody("second")
      }
    });

    expect(first.headers[PORTFOLIO_WORKSPACE_CORRELATION_HEADER]).toBe("correlation:first");
    expect(second.headers[PORTFOLIO_WORKSPACE_CORRELATION_HEADER]).toBe("correlation:generated-1");
    expect(runtime.initializeService.inputs.map((input) => input.commandContext.toJSON().actorReference)).toEqual([
      "user:career-auth:principal-first",
      "user:career-auth:principal-second"
    ]);
  });

  it("keeps status mapping host-local and deterministic", () => {
    expect(mapPortfolioWorkspacePresentationErrorToInternalStatus(createForbiddenPresentationError("correlation:status"))).toBe(403);
  });
});

describe("Portfolio Workspace production authorization", () => {
  it("derives initialization ownership from the trusted principal and ignores request-shaped ownership", async () => {
    const principal = trustedPrincipal("owner");
    const authorization = new PortfolioWorkspaceProductionAuthorization({
      resourceResolver: new FakeAuthorizationResourceResolver(authorizationResourceReferenceForPrincipal(principal))
    });

    const result = await authorization.authorizeInitialize({
      principal,
      request: new InitializePortfolioExecutionPresentationRequest(initializationBody("owner")),
      correlationId: "correlation:owner"
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value!.equals(authorizationResourceReferenceForPrincipal(principal))).toBe(true);
    expect(result.value!.authorizationResourceReference).toMatch(/^portfolio-workspace:principal:user:[a-f0-9]{64}$/u);
    expect(result.value!.authorizationResourceReference).not.toContain(principal.principalId);
    expect(result.value!.authorizationResourceReference).not.toContain(principal.authenticationProvider);
  });

  it("allows get only when the durable resource matches the trusted principal", async () => {
    const principal = trustedPrincipal("allowed");
    const resolver = new FakeAuthorizationResourceResolver(authorizationResourceReferenceForPrincipal(principal));
    const authorization = new PortfolioWorkspaceProductionAuthorization({ resourceResolver: resolver });

    const result = await authorization.authorizeGet({
      principal,
      executionId: new ExecutionId("execution:allowed"),
      correlationId: "correlation:allowed"
    });

    expect(result.isSuccess).toBe(true);
    expect(resolver.calls).toBe(1);
    expect(resolver.lastExecutionId?.toJSON()).toBe("execution:allowed");
    expect(resolver.lastCorrelationId).toBe("correlation:allowed");
  });

  it("denies mismatched users and service principals without a privileged bypass", async () => {
    const owner = trustedPrincipal("owner");
    const otherUser = trustedPrincipal("other");
    const servicePrincipal = trustedServicePrincipal("worker");
    const authorization = new PortfolioWorkspaceProductionAuthorization({
      resourceResolver: new FakeAuthorizationResourceResolver(authorizationResourceReferenceForPrincipal(owner))
    });

    const userResult = await authorization.authorizeGet({
      principal: otherUser,
      executionId: new ExecutionId("execution:owned"),
      correlationId: "correlation:other"
    });
    const serviceResult = await authorization.authorizeGet({
      principal: servicePrincipal,
      executionId: new ExecutionId("execution:owned"),
      correlationId: "correlation:service"
    });

    expect(userResult.isFailure).toBe(true);
    expect(userResult.error).toMatchObject({
      category: PortfolioWorkspacePresentationErrorCategory.Forbidden,
      code: PortfolioWorkspacePresentationErrorCode.Forbidden,
      correlationId: "correlation:other"
    });
    expect(serviceResult.isFailure).toBe(true);
    expect(serviceResult.error).toMatchObject({
      category: PortfolioWorkspacePresentationErrorCategory.Forbidden,
      code: PortfolioWorkspacePresentationErrorCode.Forbidden,
      correlationId: "correlation:service"
    });
  });
});

describe("Portfolio Workspace internal handler architecture boundaries", () => {
  it("keeps internal handlers free of repositories, persistence internals, framework handlers, and command construction", () => {
    const source = readSource(portfolioWorkspaceInternalSourcePath());

    expect(source).toContain("@career-companion/infrastructure");
    expect(source).not.toContain("PostgresPortfolioExecutionRepository");
    expect(source).not.toContain("PortfolioExecutionRepository");
    expect(source).not.toContain("drizzle");
    expect(source).not.toContain("Pool");
    expect(source).not.toContain("sql");
    expect(source).not.toContain("new PortfolioExecution(");
    expect(source).not.toContain("new PortfolioWorkItem(");
    expect(source).not.toContain("new ArtifactCandidate(");
    expect(source).not.toContain("new PortfolioExecutionCommandContext");
    expect(source).not.toContain("new InitializePortfolioExecutionApplicationService");
    expect(source).not.toContain("new GetPortfolioExecutionApplicationService");
    expect(source).not.toContain("ServiceLocator");
    expect(source).not.toContain("Container");
    expect(source).not.toContain("CommandBus");
    expect(source).not.toContain("express");
    expect(source).not.toContain("fastify");
    expect(source).not.toContain("next/");
    expect(source).not.toContain("jwt");
    expect(source).not.toContain("idempotency");
    expect(source).not.toContain("retry");
    expect(source).not.toContain("listPortfolio");
    expect(source).not.toContain("searchPortfolio");
  });
});

class FakeAuthorization implements PortfolioWorkspaceInternalAuthorization {
  initializeCalls = 0;
  getCalls = 0;

  constructor(private readonly input: { readonly deniedCorrelationId?: string } = {}) {}

  async authorizeInitialize() {
    this.initializeCalls += 1;
    return this.decision();
  }

  async authorizeGet() {
    this.getCalls += 1;
    if (this.input.deniedCorrelationId !== undefined) {
      return Result.failure(createForbiddenPresentationError(this.input.deniedCorrelationId));
    }

    return Result.success(undefined);
  }

  private decision() {
    if (this.input.deniedCorrelationId !== undefined) {
      return Result.failure(createForbiddenPresentationError(this.input.deniedCorrelationId));
    }

    return Result.success(authorizationResourceReference());
  }
}

class FakeAuthorizationResourceResolver implements PortfolioWorkspaceAuthorizationResourceResolver {
  calls = 0;
  lastExecutionId: ExecutionId | undefined;
  lastCorrelationId: string | undefined;

  constructor(private readonly resource: PortfolioWorkspaceAuthorizationResourceReference) {}

  async resolve(input: {
    readonly executionId: ExecutionId;
    readonly correlationId: string;
  }) {
    this.calls += 1;
    this.lastExecutionId = input.executionId;
    this.lastCorrelationId = input.correlationId;
    return Result.success(this.resource);
  }
}

class FakeInitializeService {
  calls = 0;
  readonly inputs: InitializePortfolioExecutionInput[] = [];
  lastInput: InitializePortfolioExecutionInput | undefined;

  constructor(private readonly failure?: unknown) {}

  async initialize(input: InitializePortfolioExecutionInput) {
    this.calls += 1;
    this.lastInput = input;
    this.inputs.push(input);
    if (this.failure !== undefined) {
      return Result.failure(this.failure);
    }

    return Result.success(initializeResultFromInput(input));
  }
}

class FakeGetService {
  calls = 0;
  lastInput: GetPortfolioExecutionInput | undefined;

  constructor(private readonly failure?: unknown) {}

  async get(input: GetPortfolioExecutionInput) {
    this.calls += 1;
    this.lastInput = input;
    if (this.failure !== undefined) {
      return Result.failure(this.failure);
    }

    return Result.success(new GetPortfolioExecutionResult({
      summary: PortfolioExecutionSummaryProjection.fromExecution(executionFixture(input.executionId.toJSON().replace("execution:", ""))),
      correlationId: input.correlationId
    }));
  }
}

function fakeRuntime(input: {
  readonly ready?: boolean;
  readonly initializeFailure?: unknown;
  readonly getFailure?: unknown;
} = {}) {
  const initializeService = new FakeInitializeService(input.initializeFailure);
  const getService = new FakeGetService(input.getFailure);
  const runtime = {
    initializePortfolioExecution: initializeService,
    getPortfolioExecution: getService,
    isReady: () => input.ready ?? true
  } as unknown as PortfolioWorkspaceRuntime;

  return Object.assign(runtime, {
    initializeService,
    getService
  });
}

function initializeHandler(input: {
  readonly runtime: ReturnType<typeof fakeRuntime>;
  readonly authorization?: PortfolioWorkspaceInternalAuthorization;
  readonly commandContextFactory?: ReturnType<typeof deterministicCommandContextFactory>;
}): InitializePortfolioExecutionInternalHandler {
  return new InitializePortfolioExecutionInternalHandler({
    runtime: input.runtime,
    authorization: input.authorization ?? new FakeAuthorization(),
    commandContextFactory: input.commandContextFactory ?? deterministicCommandContextFactory(),
    correlationIdGenerator: sequentialCorrelationGenerator()
  });
}

function getHandler(input: {
  readonly runtime: ReturnType<typeof fakeRuntime>;
  readonly authorization?: PortfolioWorkspaceInternalAuthorization;
}): GetPortfolioExecutionInternalHandler {
  return new GetPortfolioExecutionInternalHandler({
    runtime: input.runtime,
    authorization: input.authorization ?? new FakeAuthorization(),
    correlationIdGenerator: sequentialCorrelationGenerator()
  });
}

function deterministicCommandContextFactory(): PortfolioWorkspaceCommandContextFactory & {
  readonly commandIdCalls: () => number;
} {
  let commandIds = 0;
  const factory = new PortfolioWorkspaceCommandContextFactory({
    commandIdGenerator: {
      generate: () => {
        commandIds += 1;
        return `command:generated-${commandIds}`;
      }
    },
    correlationIdGenerator: sequentialCorrelationGenerator(),
    clock: { now: () => new Date("2026-08-06T00:00:00.000Z") }
  });

  return Object.freeze({
    createCommandContext: factory.createCommandContext.bind(factory),
    commandIdCalls: () => commandIds
  }) as PortfolioWorkspaceCommandContextFactory & { commandIdCalls: () => number };
}

function sequentialCorrelationGenerator(): { generate(): string } {
  let correlations = 0;
  return {
    generate: () => {
      correlations += 1;
      return `correlation:generated-${correlations}`;
    }
  };
}

function trustedPrincipal(suffix: string): PortfolioWorkspacePresentationPrincipal {
  const result = PortfolioWorkspacePresentationPrincipal.create({
    principalId: `principal-${suffix}`,
    principalType: PortfolioWorkspacePresentationPrincipalType.User,
    authenticationProvider: "career-auth"
  });

  if (result.isFailure || result.value === undefined) {
    throw new Error("Expected trusted principal.");
  }

  return result.value;
}

function trustedServicePrincipal(suffix: string): PortfolioWorkspacePresentationPrincipal {
  const result = PortfolioWorkspacePresentationPrincipal.create({
    principalId: `service-${suffix}`,
    principalType: PortfolioWorkspacePresentationPrincipalType.Service,
    authenticationProvider: "career-auth"
  });

  if (result.isFailure || result.value === undefined) {
    throw new Error("Expected trusted service principal.");
  }

  return result.value;
}

function initializationBody(suffix: string) {
  return {
    executionId: `execution:${suffix}`,
    portfolioPlanReference: {
      planId: `plan:${suffix}`,
      roadmapId: `roadmap:${suffix}`,
      planArtifactReference: `artifact:${suffix}`
    },
    planSnapshotReference: {
      snapshotReference: `snapshot:${suffix}`
    },
    approvalReference: {
      approvalReference: `approval:${suffix}`
    },
    initialWorkItems: [{ workItemId: `work-item:${suffix}` }],
    initialCandidates: [{ candidateId: `candidate:${suffix}` }]
  };
}

function initializeResultFromInput(input: InitializePortfolioExecutionInput): InitializePortfolioExecutionResult {
  const initialized = PortfolioExecution.initialize({
    id: input.executionId,
    portfolioPlanReference: input.portfolioPlanReference,
    planSnapshotReference: input.planSnapshotReference,
    approvalReference: input.approvalReference,
    authorizationResourceReference: input.authorizationResourceReference,
    commandContext: input.commandContext,
    workItems: input.workItems.map((definition) => new PortfolioWorkItem({
      id: definition.workItemId,
      lifecycle: PortfolioWorkItemLifecycle.Pending
    })),
    candidates: input.candidates.map((definition) => new ArtifactCandidate({
      id: definition.candidateId,
      lifecycle: "Registered"
    }))
  });

  return new InitializePortfolioExecutionResult({
    summary: PortfolioExecutionSummaryProjection.fromExecution(initialized.execution, [initialized.fact]),
    fact: initialized.fact,
    correlationId: initialized.fact.commandContext.correlationId
  });
}

function executionFixture(suffix: string): PortfolioExecution {
  return new PortfolioExecution({
    id: new ExecutionId(`execution:${suffix}`),
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
    authorizationResourceReference: authorizationResourceReference(),
    commandContext: new PortfolioExecutionCommandContext({
      commandId: `command:${suffix}`,
      correlationId: `correlation:${suffix}`,
      actorReference: `actor:${suffix}`,
      occurredAt: "2026-08-06T00:00:00.000Z"
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

function readSource(directory: string): string {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      return readSource(path);
    }

    return entry.endsWith(".ts") ? readFileSync(path, "utf8") : "";
  }).join("\n");
}

function portfolioWorkspaceInternalSourcePath(): string {
  const cwd = process.cwd();

  if (cwd.endsWith(`${join("apps", "api")}`)) {
    return join(cwd, "src", "portfolio-workspace", "internal");
  }

  return join(cwd, "apps", "api", "src", "portfolio-workspace", "internal");
}


function authorizationResourceReference(): PortfolioWorkspaceAuthorizationResourceReference {
  return new PortfolioWorkspaceAuthorizationResourceReference({
    authorizationResourceReference: "portfolio-workspace:execution-owner-1"
  });
}
