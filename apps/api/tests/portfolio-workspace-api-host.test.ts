import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  PortfolioWorkspaceMigrationMode,
  PortfolioWorkspaceRuntimeConfiguration,
  PortfolioWorkspaceRuntimeEnvironment,
  type PortfolioWorkspaceRuntime
} from "@career-companion/infrastructure";
import { Result } from "@career-companion/kernel";
import {
  GetPortfolioExecutionInput,
  GetPortfolioExecutionResult,
  InitializePortfolioExecutionInput,
  InitializePortfolioExecutionResult
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
  PortfolioWorkspaceApiHostConstructionError,
  PortfolioWorkspaceApiHostDisposalError,
  PortfolioWorkspaceApiHostLifecycle,
  PortfolioWorkspacePresentationOutcome,
  PortfolioWorkspacePresentationPrincipal,
  PortfolioWorkspacePresentationPrincipalType,
  type PortfolioWorkspaceInternalAuthorization
} from "../src";
import {
  createPortfolioWorkspaceApiHostFromEnvironmentWithDependencies,
  createPortfolioWorkspaceApiHostWithDependencies,
  type PortfolioWorkspaceApiHostFactoryDependencies
} from "../src/portfolio-workspace/host/PortfolioWorkspaceApiHost";

describe("Portfolio Workspace API host runtime integration", () => {
  it("creates one ready host from an environment map and assembles internal handlers once", async () => {
    const runtime = fakeRuntime();
    const authorization = new RecordingAuthorization();
    const created: unknown[] = [];
    const dependencies = dependenciesWith({
      createRuntime: async (configuration) => {
        created.push(configuration);
        return Result.success(runtime);
      }
    });

    const result = await createPortfolioWorkspaceApiHostFromEnvironmentWithDependencies({
      environment: environmentMap(),
      authorization,
      commandIdGenerator: sequentialGenerator("command"),
      correlationIdGenerator: sequentialGenerator("correlation"),
      clock: fixedClock()
    }, dependencies);

    const host = expectSuccess(result);
    expect(created).toHaveLength(1);
    expect(dependencies.handlerInputs).toHaveLength(1);
    expect(dependencies.handlerInputs[0]?.runtime).toBe(runtime);
    expect(dependencies.handlerInputs[0]?.authorization).toBe(authorization);
    expect(host.initializePortfolioExecutionHandler).toBeInstanceOf(InitializePortfolioExecutionInternalHandler);
    expect(host.getPortfolioExecutionHandler).toBeInstanceOf(GetPortfolioExecutionInternalHandler);
    expect(host.isReady()).toBe(true);
    expect(host.isLive()).toBe(true);
    expect(host.status().toJSON()).toEqual({
      live: true,
      ready: true,
      lifecycle: PortfolioWorkspaceApiHostLifecycle.Ready,
      disposed: false
    });
    expect(JSON.stringify(host)).not.toMatch(/postgres:\/\/|secret|Pool|Drizzle|runtime|authorization/i);
  });

  it("fails safely for invalid configuration before runtime construction", async () => {
    const dependencies = dependenciesWith();

    const result = await createPortfolioWorkspaceApiHostFromEnvironmentWithDependencies({
      environment: {
        PORTFOLIO_WORKSPACE_DATABASE_URL: "postgres://user:secret@example.test"
      },
      authorization: new RecordingAuthorization()
    }, dependencies);

    expect(result.isFailure).toBe(true);
    expect(dependencies.createRuntimeCalls).toBe(0);
    expect(dependencies.handlerInputs).toHaveLength(0);
    expect(JSON.stringify(result.error)).not.toContain("secret");
  });

  it("fails safely when runtime creation fails", async () => {
    const dependencies = dependenciesWith({
      createRuntime: async () => Result.failure(new Error("vendor password=secret SQLSTATE 08006")) as never
    });

    const result = await createPortfolioWorkspaceApiHostWithDependencies({
      configuration: configuration(),
      authorization: new RecordingAuthorization()
    }, dependencies);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(PortfolioWorkspaceApiHostConstructionError);
    expect((result.error as PortfolioWorkspaceApiHostConstructionError).reason).toBe("runtime-construction-failed");
    expect(dependencies.handlerInputs).toHaveLength(0);
    expect(JSON.stringify(result.error)).not.toMatch(/secret|SQLSTATE|08006/i);
  });

  it("requires explicit authorization and never defaults to allow-all", async () => {
    const dependencies = dependenciesWith();

    const result = await createPortfolioWorkspaceApiHostWithDependencies({
      configuration: configuration(),
      authorization: undefined as unknown as PortfolioWorkspaceInternalAuthorization
    }, dependencies);

    expect(result.isFailure).toBe(true);
    expect((result.error as PortfolioWorkspaceApiHostConstructionError).reason).toBe("authorization-required");
    expect(dependencies.createRuntimeCalls).toBe(0);
  });

  it("disposes runtime and returns no host when runtime is not ready or handler composition fails", async () => {
    const notReadyRuntime = fakeRuntime({ ready: false });
    const notReady = await createPortfolioWorkspaceApiHostWithDependencies({
      configuration: configuration(),
      authorization: new RecordingAuthorization()
    }, dependenciesWith({ runtime: notReadyRuntime }));

    const handlerFailureRuntime = fakeRuntime();
    const handlerFailure = await createPortfolioWorkspaceApiHostWithDependencies({
      configuration: configuration(),
      authorization: new RecordingAuthorization()
    }, dependenciesWith({
      runtime: handlerFailureRuntime,
      createHandlers: () => {
        throw new Error("handler failure secret");
      }
    }));

    expect(notReady.isFailure).toBe(true);
    expect((notReady.error as PortfolioWorkspaceApiHostConstructionError).reason).toBe("runtime-not-ready");
    expect(notReadyRuntime.disposeCalls).toBe(1);
    expect(handlerFailure.isFailure).toBe(true);
    expect((handlerFailure.error as PortfolioWorkspaceApiHostConstructionError).reason).toBe("handler-composition-failed");
    expect(handlerFailureRuntime.disposeCalls).toBe(1);
    expect(JSON.stringify(handlerFailure.error)).not.toContain("secret");
  });

  it("uses production host command and correlation generators without Math.random", async () => {
    const runtime = fakeRuntime();
    const host = expectSuccess(await createPortfolioWorkspaceApiHostWithDependencies({
      configuration: configuration(),
      authorization: new RecordingAuthorization()
    }, dependenciesWith({ runtime })));

    const first = await host.initializePortfolioExecutionHandler.handle({
      principal: trustedPrincipal("first"),
      request: { body: initializationBody("first") }
    });
    const second = await host.initializePortfolioExecutionHandler.handle({
      principal: trustedPrincipal("second"),
      request: { body: initializationBody("second") }
    });

    const commandIds = runtime.initializeService.inputs.map((input) => input.commandContext.commandId);
    const correlationIds = runtime.initializeService.inputs.map((input) => input.commandContext.correlationId);
    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(commandIds[0]).toMatch(/^command:[0-9a-f-]{36}$/u);
    expect(commandIds[1]).toMatch(/^command:[0-9a-f-]{36}$/u);
    expect(commandIds[0]).not.toBe(commandIds[1]);
    expect(correlationIds[0]).toMatch(/^correlation:[0-9a-f-]{36}$/u);
    expect(correlationIds[1]).toMatch(/^correlation:[0-9a-f-]{36}$/u);
    expect(correlationIds[0]).not.toBe(correlationIds[1]);
    expect(readFileSync(hostSourcePath(), "utf8")).not.toContain("Math.random");
  });

  it("routes initialize and get through host-assembled real handlers", async () => {
    const runtime = fakeRuntime();
    const authorization = new RecordingAuthorization();
    const host = expectSuccess(await createPortfolioWorkspaceApiHostWithDependencies({
      configuration: configuration(),
      authorization,
      commandIdGenerator: sequentialGenerator("command"),
      correlationIdGenerator: sequentialGenerator("correlation"),
      clock: fixedClock()
    }, dependenciesWith({ runtime })));

    const initialized = await host.initializePortfolioExecutionHandler.handle({
      principal: trustedPrincipal("handler"),
      request: {
        headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "correlation:handler-init" },
        body: initializationBody("handler")
      }
    });
    const queried = await host.getPortfolioExecutionHandler.handle({
      principal: trustedPrincipal("handler"),
      request: {
        headers: { [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: "correlation:handler-get" },
        pathParameters: { executionId: "execution:handler" }
      }
    });

    expect(initialized.status).toBe(201);
    expect(initialized.body).toMatchObject({
      outcome: PortfolioWorkspacePresentationOutcome.ExecutionInitialized,
      correlationId: "correlation:handler-init"
    });
    expect(queried.status).toBe(200);
    expect(queried.body).toMatchObject({
      version: "v1",
      correlationId: "correlation:handler-get"
    });
    expect(runtime.initializeService.calls).toBe(1);
    expect(runtime.getService.calls).toBe(1);
    expect(authorization.initializeCalls).toBe(1);
    expect(authorization.getCalls).toBe(1);
  });

  it("derives readiness and liveness from host and runtime lifecycle", async () => {
    const runtime = fakeRuntime();
    const host = expectSuccess(await createPortfolioWorkspaceApiHostWithDependencies({
      configuration: configuration(),
      authorization: new RecordingAuthorization()
    }, dependenciesWith({ runtime })));

    const disposing = host.dispose();
    expect(host.isReady()).toBe(false);
    expect(host.status().toJSON()).toMatchObject({
      live: true,
      ready: false,
      lifecycle: PortfolioWorkspaceApiHostLifecycle.Disposing,
      notReadyReason: "disposing"
    });
    await disposing;
    expect(host.isReady()).toBe(false);
    expect(host.isLive()).toBe(false);
    expect(host.isDisposed()).toBe(true);
    expect(host.status().toJSON()).toMatchObject({
      live: false,
      ready: false,
      lifecycle: PortfolioWorkspaceApiHostLifecycle.Disposed,
      disposed: true,
      notReadyReason: "disposed"
    });
  });

  it("delegates deterministic idempotent and concurrent disposal to runtime", async () => {
    const runtime = fakeRuntime();
    const host = expectSuccess(await createPortfolioWorkspaceApiHostWithDependencies({
      configuration: configuration(),
      authorization: new RecordingAuthorization()
    }, dependenciesWith({ runtime })));

    await Promise.all([host.dispose(), host.dispose()]);
    await host.dispose();

    expect(runtime.disposeCalls).toBe(1);
    expect(host.isDisposed()).toBe(true);
  });

  it("reports disposal failure safely without retrying automatically", async () => {
    const runtime = fakeRuntime({ disposeFailure: new Error("password=secret SQLSTATE 53300") });
    const host = expectSuccess(await createPortfolioWorkspaceApiHostWithDependencies({
      configuration: configuration(),
      authorization: new RecordingAuthorization()
    }, dependenciesWith({ runtime })));

    await expect(host.dispose()).rejects.toBeInstanceOf(PortfolioWorkspaceApiHostDisposalError);
    await expect(host.dispose()).rejects.toBeInstanceOf(PortfolioWorkspaceApiHostDisposalError);

    expect(runtime.disposeCalls).toBe(1);
    expect(host.status().toJSON()).toMatchObject({
      live: false,
      ready: false,
      lifecycle: PortfolioWorkspaceApiHostLifecycle.DisposalFailed,
      notReadyReason: "disposal-failed"
    });
    expect(JSON.stringify(host)).not.toMatch(/secret|SQLSTATE|Pool|Drizzle|authorization|postgres:\/\//i);
  });

  it("keeps host source free of runtime internals, auth providers, retries, and framework concerns", () => {
    const source = readSource(hostDirectoryPath());

    expect(source).toContain("createPortfolioWorkspaceRuntime");
    expect(source).not.toContain("PostgresPortfolioExecutionRepository");
    expect(source).not.toContain("new Pool");
    expect(source).not.toContain("drizzle(");
    expect(source).not.toContain("verifyPortfolioWorkspaceMigrationReadiness");
    expect(source).not.toContain("new PortfolioExecution(");
    expect(source).not.toContain("new InitializePortfolioExecutionApplicationService");
    expect(source).not.toContain("new GetPortfolioExecutionApplicationService");
    expect(source).not.toContain("process.env");
    expect(source).not.toContain("process.exit");
    expect(source).not.toContain("SIGTERM");
    expect(source).not.toContain("SIGINT");
    expect(source).not.toContain("jwt");
    expect(source).not.toContain("idempotency");
    expect(source).not.toContain("retry");
    expect(source).not.toContain("ServiceLocator");
    expect(source).not.toContain("Container");
    expect(source).not.toContain("express");
    expect(source).not.toContain("fastify");
    expect(source).not.toContain("next/");
  });
});

class RecordingAuthorization implements PortfolioWorkspaceInternalAuthorization {
  initializeCalls = 0;
  getCalls = 0;

  async authorizeInitialize() {
    this.initializeCalls += 1;
    return Result.success(undefined);
  }

  async authorizeGet() {
    this.getCalls += 1;
    return Result.success(undefined);
  }
}

class FakeInitializeService {
  calls = 0;
  readonly inputs: InitializePortfolioExecutionInput[] = [];

  async initialize(input: InitializePortfolioExecutionInput) {
    this.calls += 1;
    this.inputs.push(input);
    return Result.success(initializeResultFromInput(input));
  }
}

class FakeGetService {
  calls = 0;
  readonly inputs: GetPortfolioExecutionInput[] = [];

  async get(input: GetPortfolioExecutionInput) {
    this.calls += 1;
    this.inputs.push(input);
    return Result.success(new GetPortfolioExecutionResult({
      summary: PortfolioExecutionSummaryProjection.fromExecution(executionFixture(input.executionId.toJSON().replace("execution:", ""))),
      correlationId: input.correlationId
    }));
  }
}

function fakeRuntime(input: {
  readonly ready?: boolean;
  readonly disposeFailure?: Error;
} = {}) {
  let lifecycle: "ready" | "disposing" | "disposed" | "failed" = input.ready === false ? "failed" : "ready";
  let disposalPromise: Promise<void> | undefined;
  let disposeCalls = 0;
  const runtime = {
    initializePortfolioExecution: new FakeInitializeService(),
    getPortfolioExecution: new FakeGetService(),
    get disposeCalls() {
      return disposeCalls;
    },
    isReady: () => lifecycle === "ready",
    isLive: () => lifecycle === "ready" || lifecycle === "disposing",
    async dispose() {
      if (lifecycle === "disposed") {
        return;
      }
      if (disposalPromise !== undefined) {
        return disposalPromise;
      }
      disposeCalls += 1;
      lifecycle = "disposing";
      disposalPromise = Promise.resolve().then(() => {
        if (input.disposeFailure !== undefined) {
          lifecycle = "failed";
          throw input.disposeFailure;
        }
        lifecycle = "disposed";
      });
      return disposalPromise;
    }
  } as unknown as PortfolioWorkspaceRuntime & {
    readonly initializePortfolioExecution: FakeInitializeService;
    readonly getPortfolioExecution: FakeGetService;
    readonly initializeService: FakeInitializeService;
    readonly getService: FakeGetService;
    disposeCalls: number;
  };

  return Object.assign(runtime, {
    initializeService: runtime.initializePortfolioExecution,
    getService: runtime.getPortfolioExecution
  });
}

function dependenciesWith(input: {
  readonly runtime?: ReturnType<typeof fakeRuntime>;
  readonly createRuntime?: PortfolioWorkspaceApiHostFactoryDependencies["createRuntime"];
  readonly createHandlers?: PortfolioWorkspaceApiHostFactoryDependencies["createHandlers"];
} = {}): PortfolioWorkspaceApiHostFactoryDependencies & {
  createRuntimeCalls: number;
  readonly handlerInputs: Parameters<PortfolioWorkspaceApiHostFactoryDependencies["createHandlers"]>[0][];
} {
  const handlerInputs: Parameters<PortfolioWorkspaceApiHostFactoryDependencies["createHandlers"]>[0][] = [];
  const dependencies = {
    createRuntimeCalls: 0,
    handlerInputs,
    createRuntime: async (configuration: PortfolioWorkspaceRuntimeConfiguration) => {
      dependencies.createRuntimeCalls += 1;
      if (input.createRuntime !== undefined) {
        return input.createRuntime(configuration);
      }
      return Result.success(input.runtime ?? fakeRuntime());
    },
    createHandlers: (handlerInput: Parameters<PortfolioWorkspaceApiHostFactoryDependencies["createHandlers"]>[0]) => {
      handlerInputs.push(handlerInput);
      if (input.createHandlers !== undefined) {
        return input.createHandlers(handlerInput);
      }
      return {
        initializePortfolioExecutionHandler: new InitializePortfolioExecutionInternalHandler({
          runtime: handlerInput.runtime,
          authorization: handlerInput.authorization,
          commandContextFactory: handlerInput.commandContextFactory,
          correlationIdGenerator: handlerInput.correlationIdGenerator
        }),
        getPortfolioExecutionHandler: new GetPortfolioExecutionInternalHandler({
          runtime: handlerInput.runtime,
          authorization: handlerInput.authorization,
          correlationIdGenerator: handlerInput.correlationIdGenerator
        })
      };
    }
  };

  return dependencies;
}

function configuration(): PortfolioWorkspaceRuntimeConfiguration {
  const result = PortfolioWorkspaceRuntimeConfiguration.create({
    databaseUrl: "postgres://user:secret@localhost:5432/portfolio_workspace_test",
    environment: PortfolioWorkspaceRuntimeEnvironment.Test,
    migrationMode: PortfolioWorkspaceMigrationMode.VerifyOnly
  });

  return expectSuccess(result);
}

function environmentMap(): Record<string, string> {
  return {
    PORTFOLIO_WORKSPACE_DATABASE_URL: "postgres://user:secret@localhost:5432/portfolio_workspace_test",
    PORTFOLIO_WORKSPACE_ENVIRONMENT: PortfolioWorkspaceRuntimeEnvironment.Test,
    PORTFOLIO_WORKSPACE_MIGRATION_MODE: PortfolioWorkspaceMigrationMode.VerifyOnly
  };
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
    now: () => new Date("2026-08-06T12:00:00.000Z")
  };
}

function trustedPrincipal(suffix: string): PortfolioWorkspacePresentationPrincipal {
  const result = PortfolioWorkspacePresentationPrincipal.create({
    principalId: `principal-${suffix}`,
    principalType: PortfolioWorkspacePresentationPrincipalType.User,
    authenticationProvider: "career-auth"
  });

  return expectSuccess(result);
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

function expectSuccess<T, E>(result: Result<T, E>): T {
  if (result.isFailure || result.value === undefined) {
    throw new Error("Expected Result success.");
  }

  return result.value;
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

function hostDirectoryPath(): string {
  const cwd = process.cwd();

  if (cwd.endsWith(`${join("apps", "api")}`)) {
    return join(cwd, "src", "portfolio-workspace", "host");
  }

  return join(cwd, "apps", "api", "src", "portfolio-workspace", "host");
}

function hostSourcePath(): string {
  return join(hostDirectoryPath(), "PortfolioWorkspaceApiHost.ts");
}
