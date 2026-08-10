import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { PortfolioWorkspaceRuntime } from "@career-companion/infrastructure";
import { Result } from "@career-companion/kernel";
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
  PortfolioWorkItem,
  PortfolioWorkItemLifecycle,
  WorkItemId
} from "@career-companion/portfolio-workspace";
import { describe, expect, it } from "vitest";
import {
  GetPortfolioExecutionInternalHandler,
  InitializePortfolioExecutionInternalHandler,
  PORTFOLIO_WORKSPACE_CORRELATION_HEADER,
  PortfolioWorkspaceCommandContextFactory,
  PortfolioWorkspacePresentationError,
  PortfolioWorkspacePresentationErrorCategory,
  PortfolioWorkspacePresentationErrorCode,
  PortfolioWorkspacePresentationOutcome,
  PortfolioWorkspacePresentationPrincipal,
  PortfolioWorkspacePresentationPrincipalType,
  createForbiddenPresentationError,
  createUnauthenticatedPresentationError,
  mapPortfolioWorkspacePresentationErrorToInternalStatus,
  type PortfolioWorkspaceInternalAuthorization
} from "../src";

describe("Portfolio Workspace presentation integration", () => {
  it("initializes through the full internal presentation pipeline", async () => {
    const runtime = fakeRuntime();
    const authorization = new RecordingAuthorization();
    const commandContextFactory = deterministicCommandContextFactory();
    const handler = initializeHandler({ runtime, authorization, commandContextFactory });

    const response = await handler.handle({
      principal: trustedPrincipal("trusted"),
      request: {
        headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "correlation:init-success" },
        body: {
          ...initializationBody("init-success"),
          actorReference: "actor:spoofed",
          commandId: "command:spoofed",
          occurredAt: "1999-01-01T00:00:00.000Z",
          principal: { principalId: "spoofed" },
          revision: 99
        }
      }
    });

    const body = response.body as Record<string, unknown>;
    expect(runtime.readyChecks).toBe(1);
    expect(authorization.initializeCalls).toHaveLength(1);
    expect(runtime.initializeService.calls).toBe(1);
    expect(runtime.initializeService.lastInput?.toJSON()).toMatchObject({
      executionId: "execution:init-success",
      commandContext: {
        commandId: "command:generated-1",
        correlationId: "correlation:init-success",
        actorReference: "user:career-auth:principal-trusted",
        occurredAt: "2026-08-06T12:00:00.000Z"
      }
    });
    expect(response.status).toBe(201);
    expect(response.headers[PORTFOLIO_WORKSPACE_CORRELATION_HEADER]).toBe("correlation:init-success");
    expect(body).toMatchObject({
      version: "v1",
      correlationId: "correlation:init-success",
      outcome: PortfolioWorkspacePresentationOutcome.ExecutionInitialized,
      execution: {
        executionId: "execution:init-success",
        lifecycle: PortfolioExecutionLifecycle.Initialized
      }
    });
    expect(JSON.stringify(body)).not.toContain("commandContext");
    expect(JSON.stringify(body)).not.toContain("actorReference");
    expect(JSON.stringify(body)).not.toContain("revision");
    expect(body).not.toHaveProperty("fact");
    expect(body).not.toHaveProperty("aggregate");
  });

  it("replaces unsafe initialization correlation before context creation and response mapping", async () => {
    const runtime = fakeRuntime();
    const handler = initializeHandler({ runtime });

    const response = await handler.handle({
      principal: trustedPrincipal("unsafe"),
      request: {
        headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "correlation:bad\r\nInjected" },
        body: initializationBody("unsafe")
      }
    });

    expect(response.status).toBe(201);
    expect(runtime.initializeService.lastInput?.commandContext.correlationId).toBe("correlation:generated-1");
    expect(response.headers[PORTFOLIO_WORKSPACE_CORRELATION_HEADER]).toBe("correlation:generated-1");
    expect(JSON.stringify(response)).not.toContain("Injected");
  });

  it("denies initialization before command-context creation or service invocation", async () => {
    const runtime = fakeRuntime();
    const authorization = new RecordingAuthorization({ initializeDenied: true });
    const commandContextFactory = deterministicCommandContextFactory();
    const handler = initializeHandler({ runtime, authorization, commandContextFactory });

    const response = await handler.handle({
      principal: trustedPrincipal("denied"),
      request: {
        headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "correlation:init-denied" },
        body: initializationBody("denied")
      }
    });

    expect(response.status).toBe(403);
    expect(runtime.readyChecks).toBe(1);
    expect(authorization.initializeCalls).toHaveLength(1);
    expect(commandContextFactory.commandIdCalls()).toBe(0);
    expect(runtime.initializeService.calls).toBe(0);
  });

  it("maps representative invalid initialization requests without invoking runtime services", async () => {
    const runtime = fakeRuntime();
    const authorization = new RecordingAuthorization();
    const handler = initializeHandler({ runtime, authorization });

    const missingBody = await handler.handle({
      principal: trustedPrincipal("missing-body"),
      request: {
        headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "correlation:missing-body" }
      }
    });
    const invalidIdentifier = await handler.handle({
      principal: trustedPrincipal("invalid-id"),
      request: {
        headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "correlation:invalid-id" },
        body: { ...initializationBody("invalid-id"), executionId: " " }
      }
    });
    const malformedCandidate = await handler.handle({
      principal: trustedPrincipal("bad-candidate"),
      request: {
        headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "correlation:bad-candidate" },
        body: { ...initializationBody("bad-candidate"), initialCandidates: [{ candidateId: 42 }] }
      }
    });

    expect(missingBody.status).toBe(400);
    expect(invalidIdentifier.status).toBe(400);
    expect(malformedCandidate.status).toBe(400);
    expect(missingBody.body).toMatchObject({
      category: PortfolioWorkspacePresentationErrorCategory.InvalidInput,
      code: PortfolioWorkspacePresentationErrorCode.InvalidRequest
    });
    expect(invalidIdentifier.body).toMatchObject({
      category: PortfolioWorkspacePresentationErrorCategory.InvalidInput,
      code: PortfolioWorkspacePresentationErrorCode.InvalidInitializationRequest
    });
    expect(malformedCandidate.body).toMatchObject({
      category: PortfolioWorkspacePresentationErrorCategory.InvalidInput,
      code: PortfolioWorkspacePresentationErrorCode.InvalidRequest
    });
    expect(runtime.initializeService.calls).toBe(0);
    expect(authorization.initializeCalls).toHaveLength(1);
    expect(JSON.stringify([missingBody.body, invalidIdentifier.body, malformedCandidate.body])).not.toContain("InvalidPortfolioWorkspaceIdentifierError");
  });

  it("maps initialization application failures without retries or infrastructure leakage", async () => {
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
    expect(alreadyExistsRuntime.initializeService.calls).toBe(1);
    expect(unavailableRuntime.initializeService.calls).toBe(1);
    expect(JSON.stringify([alreadyExists.body, unavailable.body])).not.toMatch(/SQLSTATE|postgres|database URL|password|revision/i);
  });

  it("returns unavailable before authorization or service work when runtime is not ready", async () => {
    const runtime = fakeRuntime({ ready: false });
    const authorization = new RecordingAuthorization();
    const initialize = initializeHandler({ runtime, authorization });
    const get = getHandler({ runtime, authorization });

    const initializeResponse = await initialize.handle({
      principal: trustedPrincipal("not-ready-init"),
      request: {
        headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "correlation:not-ready-init" },
        body: initializationBody("not-ready-init")
      }
    });
    const getResponse = await get.handle({
      principal: trustedPrincipal("not-ready-get"),
      request: {
        headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "correlation:not-ready-get" },
        pathParameters: { executionId: "execution:not-ready-get" }
      }
    });

    expect(initializeResponse.status).toBe(503);
    expect(getResponse.status).toBe(503);
    expect(runtime.initializeService.calls).toBe(0);
    expect(runtime.getService.calls).toBe(0);
    expect(authorization.initializeCalls).toHaveLength(0);
    expect(authorization.getCalls).toHaveLength(0);
  });

  it("gets a PortfolioExecution summary through the query presentation pipeline", async () => {
    const runtime = fakeRuntime();
    const authorization = new RecordingAuthorization();
    const commandContextFactory = deterministicCommandContextFactory();
    const handler = getHandler({ runtime, authorization });

    const response = await handler.handle({
      principal: trustedPrincipal("get-success"),
      request: {
        headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "correlation:get-success" },
        pathParameters: { executionId: "execution:get-success" }
      }
    });

    const body = response.body as Record<string, unknown>;
    expect(runtime.readyChecks).toBe(1);
    expect(authorization.getCalls).toHaveLength(1);
    expect(runtime.getService.calls).toBe(1);
    expect(runtime.initializeService.calls).toBe(0);
    expect(commandContextFactory.commandIdCalls()).toBe(0);
    expect(runtime.getService.lastInput?.toJSON()).toEqual({
      executionId: "execution:get-success",
      correlationId: "correlation:get-success"
    });
    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      version: "v1",
      correlationId: "correlation:get-success",
      execution: {
        executionId: "execution:get-success",
        lifecycle: PortfolioExecutionLifecycle.Initialized
      }
    });
    expect(body).not.toHaveProperty("fact");
    expect(body).not.toHaveProperty("aggregate");
    expect(JSON.stringify(body)).not.toMatch(/revision|commandContext/i);
  });

  it("maps get failures and invalid IDs safely", async () => {
    const missingRuntime = fakeRuntime({
      getFailure: new PortfolioExecutionNotFoundError(new ExecutionId("execution:missing"))
    });
    const deniedAuthorization = new RecordingAuthorization({ getDenied: true });

    const missing = await getHandler({ runtime: missingRuntime }).handle({
      principal: trustedPrincipal("missing"),
      request: {
        headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "correlation:missing" },
        pathParameters: { executionId: "execution:missing" }
      }
    });
    const invalid = await getHandler({ runtime: fakeRuntime() }).handle({
      principal: trustedPrincipal("invalid-get"),
      request: {
        headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "correlation:invalid-get" },
        pathParameters: { executionId: " " }
      }
    });
    const denied = await getHandler({ runtime: fakeRuntime(), authorization: deniedAuthorization }).handle({
      principal: trustedPrincipal("denied-get"),
      request: {
        headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "correlation:denied-get" },
        pathParameters: { executionId: "execution:denied-get" }
      }
    });

    expect(missing.status).toBe(404);
    expect(missing.body).toMatchObject({
      category: PortfolioWorkspacePresentationErrorCategory.NotFound,
      code: PortfolioWorkspacePresentationErrorCode.PortfolioExecutionNotFound
    });
    expect(invalid.status).toBe(400);
    expect(invalid.body).toMatchObject({
      category: PortfolioWorkspacePresentationErrorCategory.InvalidInput,
      code: PortfolioWorkspacePresentationErrorCode.InvalidIdentifier
    });
    expect(denied.status).toBe(403);
    expect(deniedAuthorization.getCalls).toHaveLength(1);
  });

  it("isolates sequential requests through shared handler instances", async () => {
    const runtime = fakeRuntime();
    const initialize = initializeHandler({ runtime });
    const get = getHandler({ runtime });

    const first = await initialize.handle({
      principal: trustedPrincipal("first"),
      request: {
        headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "correlation:first" },
        body: initializationBody("first")
      }
    });
    const second = await initialize.handle({
      principal: trustedPrincipal("second"),
      request: {
        headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "correlation:second" },
        body: initializationBody("second")
      }
    });
    const queried = await get.handle({
      principal: trustedPrincipal("query"),
      request: {
        headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "correlation:query" },
        pathParameters: { executionId: "execution:query" }
      }
    });

    expect(first.headers[PORTFOLIO_WORKSPACE_CORRELATION_HEADER]).toBe("correlation:first");
    expect(second.headers[PORTFOLIO_WORKSPACE_CORRELATION_HEADER]).toBe("correlation:second");
    expect(queried.headers[PORTFOLIO_WORKSPACE_CORRELATION_HEADER]).toBe("correlation:query");
    expect(runtime.initializeService.inputs.map((input) => input.commandContext.actorReference)).toEqual([
      "user:career-auth:principal-first",
      "user:career-auth:principal-second"
    ]);
    expect(runtime.initializeService.inputs.map((input) => input.executionId.toJSON())).toEqual([
      "execution:first",
      "execution:second"
    ]);
    expect(runtime.getService.lastInput?.executionId.toJSON()).toBe("execution:query");
  });

  it("isolates concurrent calls made through the same handler instance", async () => {
    const runtime = fakeRuntime();
    const handler = initializeHandler({ runtime });

    const [alpha, beta] = await Promise.all([
      handler.handle({
        principal: trustedPrincipal("alpha"),
        request: {
          headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "correlation:alpha" },
          body: initializationBody("alpha")
        }
      }),
      handler.handle({
        principal: trustedPrincipal("beta"),
        request: {
          headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "correlation:beta" },
          body: initializationBody("beta")
        }
      })
    ]);

    expect(alpha.status).toBe(201);
    expect(beta.status).toBe(201);
    const contextsByExecutionId = new Map(runtime.initializeService.inputs.map((input) => [
      input.executionId.toJSON(),
      input.commandContext.toJSON()
    ]));
    expect(contextsByExecutionId.get("execution:alpha")).toMatchObject({
      correlationId: "correlation:alpha",
      actorReference: "user:career-auth:principal-alpha"
    });
    expect(contextsByExecutionId.get("execution:beta")).toMatchObject({
      correlationId: "correlation:beta",
      actorReference: "user:career-auth:principal-beta"
    });
  });

  it("keeps representative error responses private", async () => {
    const runtime = fakeRuntime({
      initializeFailure: new PortfolioExecutionPersistenceUnavailableError()
    });
    const response = await initializeHandler({ runtime }).handle({
      principal: trustedPrincipal("privacy"),
      request: {
        headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "correlation:privacy" },
        body: {
          ...initializationBody("privacy"),
          token: "secret-token",
          session: "secret-session"
        }
      }
    });

    const serialized = JSON.stringify(response);
    expect(response.status).toBe(503);
    expect(serialized).not.toMatch(/stack|cause|SQL|SQLSTATE|database URL|password|revision|PortfolioExecutionPersistenceUnavailableError|commandContext|principal|secret-token|secret-session/i);
  });

  it("maps host-local statuses deterministically", () => {
    const errors = [
      new PortfolioWorkspacePresentationError({
        category: PortfolioWorkspacePresentationErrorCategory.InvalidInput,
        code: PortfolioWorkspacePresentationErrorCode.InvalidRequest,
        message: "invalid",
        correlationId: "correlation:status"
      }),
      createUnauthenticatedPresentationError("correlation:status"),
      createForbiddenPresentationError("correlation:status"),
      new PortfolioWorkspacePresentationError({
        category: PortfolioWorkspacePresentationErrorCategory.NotFound,
        code: PortfolioWorkspacePresentationErrorCode.PortfolioExecutionNotFound,
        message: "missing",
        correlationId: "correlation:status"
      }),
      new PortfolioWorkspacePresentationError({
        category: PortfolioWorkspacePresentationErrorCategory.Conflict,
        code: PortfolioWorkspacePresentationErrorCode.PortfolioExecutionAlreadyExists,
        message: "conflict",
        correlationId: "correlation:status"
      }),
      new PortfolioWorkspacePresentationError({
        category: PortfolioWorkspacePresentationErrorCategory.Unavailable,
        code: PortfolioWorkspacePresentationErrorCode.PortfolioWorkspaceUnavailable,
        message: "unavailable",
        correlationId: "correlation:status"
      }),
      new PortfolioWorkspacePresentationError({
        category: PortfolioWorkspacePresentationErrorCategory.Internal,
        code: PortfolioWorkspacePresentationErrorCode.PortfolioWorkspaceInternalError,
        message: "internal",
        correlationId: "correlation:status"
      })
    ];

    expect(errors.map(mapPortfolioWorkspacePresentationErrorToInternalStatus)).toEqual([
      400,
      401,
      403,
      404,
      409,
      503,
      500
    ]);
  });

  it("keeps trust boundaries centralized and production handlers free of forbidden dependencies", () => {
    const internalSource = readSource(portfolioWorkspaceInternalSourcePath());
    const presentationSource = readSource(portfolioWorkspacePresentationSourcePath());

    expect(internalSource).toContain("PortfolioWorkspaceCommandContextFactory");
    expect(internalSource).toContain("mapInitializePortfolioExecutionResult");
    expect(internalSource).toContain("mapGetPortfolioExecutionResult");
    expect(internalSource).not.toContain("PostgresPortfolioExecutionRepository");
    expect(internalSource).not.toContain("PortfolioExecutionRepository");
    expect(internalSource).not.toContain("drizzle");
    expect(internalSource).not.toContain("Pool");
    expect(internalSource).not.toContain("new PortfolioExecution(");
    expect(internalSource).not.toContain("new PortfolioWorkItem(");
    expect(internalSource).not.toContain("new ArtifactCandidate(");
    expect(internalSource).not.toContain("new PortfolioExecutionCommandContext");
    expect(internalSource).not.toContain("express");
    expect(internalSource).not.toContain("fastify");
    expect(internalSource).not.toContain("next/");
    expect(internalSource).not.toContain("jwt");
    expect(internalSource).not.toContain("idempotency");
    expect(internalSource).not.toContain("retry");
    expect(internalSource).not.toContain("listPortfolio");
    expect(internalSource).not.toContain("searchPortfolio");
    expect(internalSource).not.toContain("ServiceLocator");
    expect(internalSource).not.toContain("Container");
    expect(internalSource).not.toContain("globalThis");
    expect(presentationSource).toContain("mapPortfolioWorkspaceFailureToPresentationError");
  });
});

class RecordingAuthorization implements PortfolioWorkspaceInternalAuthorization {
  readonly initializeCalls: { readonly principal: PortfolioWorkspacePresentationPrincipal; readonly executionId: string }[] = [];
  readonly getCalls: { readonly principal: PortfolioWorkspacePresentationPrincipal; readonly executionId: string }[] = [];

  constructor(private readonly input: {
    readonly initializeDenied?: boolean;
    readonly getDenied?: boolean;
  } = {}) {}

  async authorizeInitialize(input: Parameters<PortfolioWorkspaceInternalAuthorization["authorizeInitialize"]>[0]) {
    this.initializeCalls.push({
      principal: input.principal,
      executionId: input.request.executionId
    });
    if (this.input.initializeDenied === true) {
      return Result.failure(createForbiddenPresentationError(input.request.incomingCorrelationId ?? "correlation:denied"));
    }

    return Result.success(undefined);
  }

  async authorizeGet(input: Parameters<PortfolioWorkspaceInternalAuthorization["authorizeGet"]>[0]) {
    this.getCalls.push({
      principal: input.principal,
      executionId: input.executionId.toJSON()
    });
    if (this.input.getDenied === true) {
      return Result.failure(createForbiddenPresentationError("correlation:denied-get"));
    }

    return Result.success(undefined);
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
  let readyChecks = 0;
  const runtime = {
    initializePortfolioExecution: initializeService,
    getPortfolioExecution: getService,
    get readyChecks() {
      return readyChecks;
    },
    isReady() {
      readyChecks += 1;
      return input.ready ?? true;
    }
  } as unknown as PortfolioWorkspaceRuntime & {
    readonly initializeService: FakeInitializeService;
    readonly getService: FakeGetService;
    readonly readyChecks: number;
  };

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
    authorization: input.authorization ?? new RecordingAuthorization(),
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
    authorization: input.authorization ?? new RecordingAuthorization(),
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
    clock: { now: () => new Date("2026-08-06T12:00:00.000Z") }
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
    commandContext: new PortfolioExecutionCommandContext({
      commandId: `command:${suffix}`,
      correlationId: `correlation:${suffix}`,
      actorReference: `actor:${suffix}`,
      occurredAt: "2026-08-06T12:00:00.000Z"
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

function portfolioWorkspacePresentationSourcePath(): string {
  const cwd = process.cwd();

  if (cwd.endsWith(`${join("apps", "api")}`)) {
    return join(cwd, "src", "portfolio-workspace", "presentation");
  }

  return join(cwd, "apps", "api", "src", "portfolio-workspace", "presentation");
}
