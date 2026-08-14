import { inspect } from "node:util";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Result } from "@career-companion/kernel";
import {
  ApprovalReference,
  ExecutionId,
  PlanSnapshotReference,
  PortfolioExecution,
  PortfolioExecutionCommandContext,
  PortfolioExecutionLifecycle,
  PortfolioPlanReference,
  PortfolioWorkspaceAuthorizationResourceReference
} from "@career-companion/portfolio-workspace";
import type { PortfolioExecutionRepository } from "@career-companion/portfolio-workspace-application";
import {
  AcceptCandidateApplicationService,
  ActivateWorkItemApplicationService,
  BeginExecutionApplicationService,
  CancelExecutionApplicationService,
  CancelWorkItemApplicationService,
  CompleteExecutionApplicationService,
  CompleteWorkItemApplicationService,
  GetPortfolioExecutionApplicationService,
  GetPortfolioExecutionInput,
  InitializePortfolioExecutionApplicationService,
  LoadedPortfolioExecution,
  type PortfolioExecutionRepositorySaveFailure,
  PortfolioExecutionRevision,
  PortfolioExecutionSaveResult,
  RejectCandidateApplicationService,
  ResolvePortfolioExecutionAuthorizationResourceApplicationService
} from "@career-companion/portfolio-workspace-application";
import type { Pool } from "pg";
import { describe, expect, it } from "vitest";
import {
  createPortfolioWorkspaceApplicationServices,
  createPortfolioWorkspaceRuntimeWithDependencies,
  PortfolioWorkspaceRuntime,
  PortfolioWorkspaceRuntimeCompositionError,
  PortfolioWorkspaceRuntimeDisposalError,
  PortfolioWorkspaceRuntimeLifecycle,
  PortfolioWorkspaceRuntimeStatus
} from "../src/portfolio-workspace/runtime/PortfolioWorkspaceRuntime";
import {
  PortfolioWorkspacePostgresDatabaseRuntime,
  PortfolioWorkspaceRuntimeConstructionError,
  type PortfolioWorkspacePostgresDatabase
} from "../src/portfolio-workspace/runtime/PortfolioWorkspacePostgresDatabaseRuntime";
import {
  PortfolioWorkspaceMigrationMode,
  PortfolioWorkspaceRuntimeConfiguration,
  PortfolioWorkspaceRuntimeEnvironment
} from "../src/portfolio-workspace/runtime/PortfolioWorkspaceRuntimeConfiguration";
import {
  PortfolioWorkspaceMigrationReadinessError,
  PortfolioWorkspaceMigrationReadinessResult
} from "../src/portfolio-workspace/runtime/PortfolioWorkspaceMigrationReadiness";
import {
  PortfolioWorkspaceRuntime as PublicPortfolioWorkspaceRuntime,
  createPortfolioWorkspaceRuntime
} from "../src";
import * as publicApi from "../src";

const secretUrl = "postgresql://portfolio_user:super-secret-password@localhost:5432/portfolio_workspace";

describe("Portfolio Workspace runtime composition", () => {
  it("composes the PostgreSQL runtime, readiness verifier, repository, and all services", async () => {
    const configuration = configurationWith({ migrationMode: PortfolioWorkspaceMigrationMode.VerifyOnly });
    const databaseRuntime = runtimeFor(configuration);
    const repository = fakeRepository();
    const dependencies = dependenciesWith({
      databaseRuntime,
      repository
    });

    const result = await createPortfolioWorkspaceRuntimeWithDependencies(configuration, dependencies);

    expect(result.isSuccess).toBe(true);
    const runtime = expectSuccess(result);
    expect(runtime).toBeInstanceOf(PortfolioWorkspaceRuntime);
    expect(runtime.initializePortfolioExecution).toBeInstanceOf(InitializePortfolioExecutionApplicationService);
    expect(runtime.getPortfolioExecution).toBeInstanceOf(GetPortfolioExecutionApplicationService);
    expect(runtime.resolvePortfolioExecutionAuthorizationResource).toBeInstanceOf(ResolvePortfolioExecutionAuthorizationResourceApplicationService);
    expect(runtime.beginExecution).toBeInstanceOf(BeginExecutionApplicationService);
    expect(runtime.activateWorkItem).toBeInstanceOf(ActivateWorkItemApplicationService);
    expect(runtime.completeWorkItem).toBeInstanceOf(CompleteWorkItemApplicationService);
    expect(runtime.cancelWorkItem).toBeInstanceOf(CancelWorkItemApplicationService);
    expect(runtime.acceptCandidate).toBeInstanceOf(AcceptCandidateApplicationService);
    expect(runtime.rejectCandidate).toBeInstanceOf(RejectCandidateApplicationService);
    expect(runtime.completeExecution).toBeInstanceOf(CompleteExecutionApplicationService);
    expect(runtime.cancelExecution).toBeInstanceOf(CancelExecutionApplicationService);
    expect(Object.keys(runtime).sort()).toEqual([
      "acceptCandidate",
      "activateWorkItem",
      "beginExecution",
      "cancelExecution",
      "cancelWorkItem",
      "completeExecution",
      "completeWorkItem",
      "getPortfolioExecution",
      "initializePortfolioExecution",
      "rejectCandidate",
      "resolvePortfolioExecutionAuthorizationResource"
    ]);
    expect(serviceRepository(runtime.initializePortfolioExecution)).toBe(repository);
    expect(serviceRepository(runtime.getPortfolioExecution)).toBe(repository);
    expect(serviceRepository(runtime.resolvePortfolioExecutionAuthorizationResource)).toBe(repository);
    expect(serviceRepository(runtime.beginExecution)).toBe(repository);
    expect(serviceRepository(runtime.activateWorkItem)).toBe(repository);
    expect(serviceRepository(runtime.completeWorkItem)).toBe(repository);
    expect(serviceRepository(runtime.cancelWorkItem)).toBe(repository);
    expect(serviceRepository(runtime.acceptCandidate)).toBe(repository);
    expect(serviceRepository(runtime.rejectCandidate)).toBe(repository);
    expect(serviceRepository(runtime.completeExecution)).toBe(repository);
    expect(serviceRepository(runtime.cancelExecution)).toBe(repository);
    expect(dependencies.calls).toEqual({
      createDatabaseRuntime: 1,
      verifyMigrationReadiness: 1,
      createRepository: 1,
      createServices: 1
    });
    expect(runtime).not.toHaveProperty("database");
    expect(runtime).not.toHaveProperty("pool");
    expect(runtime).not.toHaveProperty("repository");
    expect(runtime).not.toHaveProperty("schema");
    expect(runtime).not.toHaveProperty("getService");
  });

  it("queries PortfolioExecution through the runtime without saving or mutating", async () => {
    const configuration = configurationWith({ migrationMode: PortfolioWorkspaceMigrationMode.VerifyOnly });
    const execution = initializedExecution(new ExecutionId("execution:runtime-query"));
    const repository = new QueryOnlyRepository(execution);
    const result = await createPortfolioWorkspaceRuntimeWithDependencies(configuration, dependenciesWith({
      databaseRuntime: runtimeFor(configuration),
      repository
    }));
    const runtime = expectSuccess(result);
    const beforeQuery = execution.toJSON();

    const queried = await runtime.getPortfolioExecution.get(new GetPortfolioExecutionInput({
      executionId: execution.id,
      correlationId: "correlation:runtime-query"
    }));

    expect(queried.isSuccess).toBe(true);
    expect(expectSuccess(queried).summary.lifecycle).toBe(PortfolioExecutionLifecycle.Initialized);
    expect(expectSuccess(queried).correlationId).toBe("correlation:runtime-query");
    expect(repository.loadCalls).toBe(1);
    expect(repository.saveCalls).toBe(0);
    expect(execution.toJSON()).toEqual(beforeQuery);
  });

  it("returns safe runtime metadata without leaking secrets or internals", async () => {
    const configuration = configurationWith({
      environment: PortfolioWorkspaceRuntimeEnvironment.Production,
      migrationMode: PortfolioWorkspaceMigrationMode.VerifyOnly
    });
    const result = await createPortfolioWorkspaceRuntimeWithDependencies(configuration, dependenciesWith({
      databaseRuntime: runtimeFor(configuration)
    }));
    const runtime = expectSuccess(result);

    expect(runtime.toJSON()).toEqual({
      live: true,
      ready: true,
      lifecycle: PortfolioWorkspaceRuntimeLifecycle.Ready,
      environment: PortfolioWorkspaceRuntimeEnvironment.Production,
      migrationMode: PortfolioWorkspaceMigrationMode.VerifyOnly,
      migrationState: "compatible",
      disposed: false
    });
    for (const output of [JSON.stringify(runtime), String(runtime), inspect(runtime)]) {
      expect(output).not.toContain(secretUrl);
      expect(output).not.toContain("super-secret-password");
      expect(output).not.toContain("portfolio_user");
      expect(output).not.toContain("localhost");
    }
  });

  it("reports immutable lifecycle status without probing the database", async () => {
    const configuration = configurationWith();
    const runtime = expectSuccess(await createPortfolioWorkspaceRuntimeWithDependencies(configuration, dependenciesWith({
      databaseRuntime: runtimeFor(configuration)
    })));

    const status = runtime.status();

    expect(runtime.lifecycle()).toBe(PortfolioWorkspaceRuntimeLifecycle.Ready);
    expect(runtime.isLive()).toBe(true);
    expect(runtime.isReady()).toBe(true);
    expect(runtime.isDisposed()).toBe(false);
    expect(status).toBeInstanceOf(PortfolioWorkspaceRuntimeStatus);
    expect(Object.isFrozen(status)).toBe(true);
    expect(status.equals(new PortfolioWorkspaceRuntimeStatus({
      lifecycle: PortfolioWorkspaceRuntimeLifecycle.Ready
    }))).toBe(true);
    expect(status.toJSON()).toEqual({
      live: true,
      ready: true,
      lifecycle: PortfolioWorkspaceRuntimeLifecycle.Ready,
      disposed: false
    });
  });

  it("rejects unsafe migration policy before creating database resources", async () => {
    for (const environment of [
      PortfolioWorkspaceRuntimeEnvironment.Production,
      PortfolioWorkspaceRuntimeEnvironment.Staging
    ]) {
      const configuration = configurationWith({
        environment,
        migrationMode: PortfolioWorkspaceMigrationMode.Apply
      });
      const dependencies = dependenciesWith({
        databaseRuntime: runtimeFor(configuration)
      });

      const result = await createPortfolioWorkspaceRuntimeWithDependencies(configuration, dependencies);

      expect(result.isFailure).toBe(true);
      expect(expectFailure(result)).toBeInstanceOf(PortfolioWorkspaceRuntimeCompositionError);
      expect((expectFailure(result) as PortfolioWorkspaceRuntimeCompositionError).toJSON()).toEqual({
        name: "PortfolioWorkspaceRuntimeCompositionError",
        code: "PORTFOLIO_WORKSPACE_RUNTIME_COMPOSITION_FAILED",
        reason: "invalid-migration-policy",
        environment,
        migrationMode: PortfolioWorkspaceMigrationMode.Apply
      });
      expect(dependencies.calls.createDatabaseRuntime).toBe(0);
    }
  });

  it("allows documented migration mode combinations", async () => {
    for (const [environment, migrationMode] of [
      [PortfolioWorkspaceRuntimeEnvironment.Development, PortfolioWorkspaceMigrationMode.Apply],
      [PortfolioWorkspaceRuntimeEnvironment.Development, PortfolioWorkspaceMigrationMode.VerifyOnly],
      [PortfolioWorkspaceRuntimeEnvironment.Test, PortfolioWorkspaceMigrationMode.Apply],
      [PortfolioWorkspaceRuntimeEnvironment.Test, PortfolioWorkspaceMigrationMode.VerifyOnly],
      [PortfolioWorkspaceRuntimeEnvironment.Staging, PortfolioWorkspaceMigrationMode.VerifyOnly],
      [PortfolioWorkspaceRuntimeEnvironment.Production, PortfolioWorkspaceMigrationMode.VerifyOnly]
    ] as const) {
      const configuration = configurationWith({ environment, migrationMode });
      const result = await createPortfolioWorkspaceRuntimeWithDependencies(configuration, dependenciesWith({
        databaseRuntime: runtimeFor(configuration)
      }));

      expect(result.isSuccess).toBe(true);
      expect(expectSuccess(result).toJSON().migrationMode).toBe(migrationMode);
    }
  });

  it("returns database runtime construction failure without verifying readiness or constructing services", async () => {
    const configuration = configurationWith();
    const dependencies = dependenciesWith({
      databaseRuntimeFailure: new PortfolioWorkspaceRuntimeConstructionError("pool-creation-failed")
    });

    const result = await createPortfolioWorkspaceRuntimeWithDependencies(configuration, dependencies);

    expect(result.isFailure).toBe(true);
    expect(expectFailure(result)).toBeInstanceOf(PortfolioWorkspaceRuntimeConstructionError);
    expect(dependencies.calls).toEqual({
      createDatabaseRuntime: 1,
      verifyMigrationReadiness: 0,
      createRepository: 0,
      createServices: 0
    });
  });

  it("disposes the database runtime after migration readiness failure", async () => {
    const configuration = configurationWith();
    const pool = new FakePool();
    const databaseRuntime = runtimeFor(configuration, pool);
    const readinessFailure = new PortfolioWorkspaceMigrationReadinessError({
      reason: "migration-required",
      migrationMode: configuration.migrationMode
    });

    const result = await createPortfolioWorkspaceRuntimeWithDependencies(configuration, dependenciesWith({
      databaseRuntime,
      readinessFailure
    }));

    expect(result.isFailure).toBe(true);
    expect(expectFailure(result)).toBe(readinessFailure);
    expect(pool.endCalls).toBe(1);
    expect(databaseRuntime.isDisposed()).toBe(true);
  });

  it("disposes the database runtime after repository or service construction failure", async () => {
    const configuration = configurationWith();
    const pool = new FakePool();
    const databaseRuntime = runtimeFor(configuration, pool);

    const result = await createPortfolioWorkspaceRuntimeWithDependencies(configuration, dependenciesWith({
      databaseRuntime,
      createServicesFailure: new Error("service construction failed")
    }));

    expect(result.isFailure).toBe(true);
    expect(expectFailure(result)).toBeInstanceOf(PortfolioWorkspaceRuntimeCompositionError);
    expect((expectFailure(result) as PortfolioWorkspaceRuntimeCompositionError).reason).toBe("service-composition-failed");
    expect(pool.endCalls).toBe(1);
    expect(databaseRuntime.isDisposed()).toBe(true);
  });

  it("returns cleanup failure if partial startup disposal fails", async () => {
    const configuration = configurationWith();
    const pool = new FakePool(new Error("close failed"));
    const readinessFailure = new PortfolioWorkspaceMigrationReadinessError({
      reason: "schema-incompatible",
      migrationMode: configuration.migrationMode
    });

    const result = await createPortfolioWorkspaceRuntimeWithDependencies(configuration, dependenciesWith({
      databaseRuntime: runtimeFor(configuration, pool),
      readinessFailure
    }));

    expect(result.isFailure).toBe(true);
    const error = expectFailure(result) as PortfolioWorkspaceRuntimeCompositionError;
    expect(error).toBeInstanceOf(PortfolioWorkspaceRuntimeCompositionError);
    expect(error.toJSON()).toEqual({
      name: "PortfolioWorkspaceRuntimeCompositionError",
      code: "PORTFOLIO_WORKSPACE_RUNTIME_COMPOSITION_FAILED",
      reason: "startup-cleanup-failed",
      environment: PortfolioWorkspaceRuntimeEnvironment.Development,
      migrationMode: PortfolioWorkspaceMigrationMode.VerifyOnly,
      startupFailureName: "PortfolioWorkspaceMigrationReadinessError",
      startupFailureCode: "PORTFOLIO_WORKSPACE_MIGRATION_READINESS_FAILED"
    });
    expect(pool.endCalls).toBe(1);
  });

  it("disposes the ready runtime deterministically and reports lifecycle state", async () => {
    const configuration = configurationWith();
    const pool = new DeferredPool();
    const runtime = expectSuccess(await createPortfolioWorkspaceRuntimeWithDependencies(configuration, dependenciesWith({
      databaseRuntime: runtimeFor(configuration, pool)
    })));

    const serviceReference = runtime.initializePortfolioExecution;
    const firstDispose = runtime.dispose();
    const secondDispose = runtime.dispose();

    expect(pool.endCalls).toBe(1);
    expect(runtime.lifecycle()).toBe(PortfolioWorkspaceRuntimeLifecycle.Disposing);
    expect(runtime.isLive()).toBe(true);
    expect(runtime.isReady()).toBe(false);
    expect(runtime.status().toJSON()).toEqual({
      live: true,
      ready: false,
      lifecycle: PortfolioWorkspaceRuntimeLifecycle.Disposing,
      disposed: false,
      notReadyReason: "disposing"
    });

    pool.succeed();
    await firstDispose;
    await secondDispose;
    await runtime.dispose();

    expect(pool.endCalls).toBe(1);
    expect(runtime.isDisposed()).toBe(true);
    expect(runtime.lifecycle()).toBe(PortfolioWorkspaceRuntimeLifecycle.Disposed);
    expect(runtime.isLive()).toBe(false);
    expect(runtime.isReady()).toBe(false);
    expect(runtime.status().toJSON()).toEqual({
      live: false,
      ready: false,
      lifecycle: PortfolioWorkspaceRuntimeLifecycle.Disposed,
      disposed: true,
      notReadyReason: "disposed"
    });
    expect(runtime.toJSON()).toMatchObject({
      live: false,
      ready: false,
      lifecycle: PortfolioWorkspaceRuntimeLifecycle.Disposed,
      disposed: true,
      notReadyReason: "disposed"
    });
    expect(runtime.initializePortfolioExecution).toBe(serviceReference);
    expect(runtime.getPortfolioExecution).toBeInstanceOf(GetPortfolioExecutionApplicationService);
  });

  it("records safe disposal failure state without leaking vendor details or retrying", async () => {
    const configuration = configurationWith();
    const failingPool = new FakePool(new VendorPoolError("close failed"));
    const failingRuntime = expectSuccess(await createPortfolioWorkspaceRuntimeWithDependencies(configuration, dependenciesWith({
      databaseRuntime: runtimeFor(configuration, failingPool)
    })));

    const firstFailure = failingRuntime.dispose();
    const secondFailure = failingRuntime.dispose();
    const capturedFailure = firstFailure.then(
      () => {
        throw new Error("Expected runtime disposal to fail.");
      },
      (failure: unknown) => failure as PortfolioWorkspaceRuntimeDisposalError
    );

    await expect(firstFailure).rejects.toBeInstanceOf(PortfolioWorkspaceRuntimeDisposalError);
    await expect(secondFailure).rejects.toBeInstanceOf(PortfolioWorkspaceRuntimeDisposalError);
    await expect(failingRuntime.dispose()).rejects.toBeInstanceOf(PortfolioWorkspaceRuntimeDisposalError);
    const error = await capturedFailure;

    expect(failingPool.endCalls).toBe(1);
    expect(failingRuntime.isDisposed()).toBe(false);
    expect(failingRuntime.isLive()).toBe(false);
    expect(failingRuntime.isReady()).toBe(false);
    expect(failingRuntime.lifecycle()).toBe(PortfolioWorkspaceRuntimeLifecycle.DisposalFailed);
    expect(failingRuntime.status().toJSON()).toEqual({
      live: false,
      ready: false,
      lifecycle: PortfolioWorkspaceRuntimeLifecycle.DisposalFailed,
      disposed: false,
      notReadyReason: "disposal-failed"
    });
    expect(error.toJSON()).toEqual({
      name: "PortfolioWorkspaceRuntimeDisposalError",
      code: "PORTFOLIO_WORKSPACE_RUNTIME_DISPOSAL_FAILED",
      reason: "database-runtime-disposal-failed",
      causeName: "VendorPoolError",
      causeCode: "VENDOR_POOL_CLOSE_FAILED"
    });
    for (const output of [JSON.stringify(error), String(error), inspect(error)]) {
      expect(output).not.toContain(secretUrl);
      expect(output).not.toContain("super-secret-password");
      expect(output).not.toContain("localhost");
    }
  });

  it("keeps the public runtime API explicit", () => {
    expect(PublicPortfolioWorkspaceRuntime).toBe(PortfolioWorkspaceRuntime);
    expect(createPortfolioWorkspaceRuntime).toBeDefined();
    expect(Object.keys(publicApi).sort()).toEqual(expectedPublicApi());
  });

  it("keeps runtime composition inside Infrastructure boundaries", () => {
    const runtimeSource = readSourceTree(join(packageRoot(), "src", "portfolio-workspace", "runtime"));
    const domainSource = readSourceTree(join(workspaceRoot(), "packages", "portfolio-workspace", "src"));
    const applicationSource = readSourceTree(join(workspaceRoot(), "packages", "portfolio-workspace-application", "src"));

    expect(runtimeSource).not.toContain("process.env");
    expect(runtimeSource).not.toContain("setInterval");
    expect(runtimeSource).not.toContain("setTimeout");
    expect(runtimeSource).not.toContain("SIGTERM");
    expect(runtimeSource).not.toContain("SIGINT");
    expect(runtimeSource).not.toContain("getService(");
    expect(runtimeSource).not.toContain("ServiceLocator");
    expect(runtimeSource).not.toContain("Container");
    expect(runtimeSource).not.toContain("CommandBus");
    expect(runtimeSource).not.toContain("Controller");
    expect(runtimeSource).not.toContain("GraphQL");
    expect(runtimeSource).not.toContain("InitializePortfolioExecutionInput");
    expect(runtimeSource).not.toContain("InitializePortfolioExecutionResult");
    expect(runtimeSource).not.toContain("PortfolioExecution.initialize");
    expect(runtimeSource).not.toContain("new PortfolioExecution");
    expect(runtimeSource).not.toContain("health");
    expect(runtimeSource).not.toContain("telemetry");
    expect(runtimeSource).not.toContain("retry");
    expect(runtimeSource).not.toContain("InMemoryPortfolioExecutionRepository");
    expect(runtimeSource).not.toContain(".query(");
    expect(domainSource).not.toContain("@career-companion/infrastructure");
    expect(applicationSource).not.toContain("@career-companion/infrastructure");
  });
});

class FakePool {
  endCalls = 0;

  constructor(private readonly failure?: Error) {}

  async end(): Promise<void> {
    this.endCalls += 1;
    if (this.failure !== undefined) {
      throw this.failure;
    }
  }

  asPool(): Pool {
    return this as unknown as Pool;
  }
}

class DeferredPool extends FakePool {
  readonly #deferred = deferred<void>();

  override async end(): Promise<void> {
    this.endCalls += 1;
    await this.#deferred.promise;
  }

  succeed(): void {
    this.#deferred.resolve();
  }
}

class VendorPoolError extends Error {
  readonly code = "VENDOR_POOL_CLOSE_FAILED";

  constructor(message: string) {
    super(message);
    this.name = "VendorPoolError";
  }
}

class QueryOnlyRepository implements PortfolioExecutionRepository {
  loadCalls = 0;
  saveCalls = 0;

  constructor(private readonly execution: PortfolioExecution) {}

  async loadByExecutionId(executionId: ExecutionId): Promise<LoadedPortfolioExecution | undefined> {
    this.loadCalls += 1;
    if (!executionId.equals(this.execution.id)) {
      return undefined;
    }

    return new LoadedPortfolioExecution({
      execution: this.execution,
      revision: new PortfolioExecutionRevision(1)
    });
  }

  async save(): Promise<Result<PortfolioExecutionSaveResult, PortfolioExecutionRepositorySaveFailure>> {
    this.saveCalls += 1;
    throw new Error("Query-only runtime repository should not save.");
  }
}

function deferred<T>(): {
  readonly promise: Promise<T>;
  readonly resolve: (value: T | PromiseLike<T>) => void;
} {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

function dependenciesWith(input: {
  readonly databaseRuntime?: PortfolioWorkspacePostgresDatabaseRuntime;
  readonly databaseRuntimeFailure?: PortfolioWorkspaceRuntimeConstructionError;
  readonly readinessFailure?: PortfolioWorkspaceMigrationReadinessError;
  readonly repository?: PortfolioExecutionRepository;
  readonly createServicesFailure?: Error;
}): ReturnType<typeof createDependencies> {
  return createDependencies(input);
}

function createDependencies(input: {
  readonly databaseRuntime?: PortfolioWorkspacePostgresDatabaseRuntime;
  readonly databaseRuntimeFailure?: PortfolioWorkspaceRuntimeConstructionError;
  readonly readinessFailure?: PortfolioWorkspaceMigrationReadinessError;
  readonly repository?: PortfolioExecutionRepository;
  readonly createServicesFailure?: Error;
}) {
  const calls = {
    createDatabaseRuntime: 0,
    verifyMigrationReadiness: 0,
    createRepository: 0,
    createServices: 0
  };

  return {
    calls,
    createDatabaseRuntime: async () => {
      calls.createDatabaseRuntime += 1;
      if (input.databaseRuntimeFailure !== undefined) {
        return Result.failure(input.databaseRuntimeFailure);
      }
      return Result.success(input.databaseRuntime ?? runtimeFor(configurationWith()));
    },
    verifyMigrationReadiness: async () => {
      calls.verifyMigrationReadiness += 1;
      if (input.readinessFailure !== undefined) {
        return Result.failure(input.readinessFailure);
      }
      return Result.success(readinessResult());
    },
    createRepository: () => {
      calls.createRepository += 1;
      return input.repository ?? fakeRepository();
    },
    createServices: (repository: PortfolioExecutionRepository) => {
      calls.createServices += 1;
      if (input.createServicesFailure !== undefined) {
        throw input.createServicesFailure;
      }
      return createPortfolioWorkspaceApplicationServices(repository);
    }
  };
}

function configurationWith(
  overrides: Partial<Parameters<typeof PortfolioWorkspaceRuntimeConfiguration.create>[0]> = {}
): PortfolioWorkspaceRuntimeConfiguration {
  return expectSuccess(PortfolioWorkspaceRuntimeConfiguration.create({
    databaseUrl: secretUrl,
    environment: PortfolioWorkspaceRuntimeEnvironment.Development,
    migrationMode: PortfolioWorkspaceMigrationMode.VerifyOnly,
    ...overrides
  }));
}

function runtimeFor(
  configuration: PortfolioWorkspaceRuntimeConfiguration,
  pool = new FakePool()
): PortfolioWorkspacePostgresDatabaseRuntime {
  return new PortfolioWorkspacePostgresDatabaseRuntime({
    configuration,
    pool: pool.asPool(),
    database: fakeDatabase()
  });
}

function readinessResult(): PortfolioWorkspaceMigrationReadinessResult {
  return new PortfolioWorkspaceMigrationReadinessResult({
    migrationMode: PortfolioWorkspaceMigrationMode.VerifyOnly,
    migrationState: "compatible",
    committedMigrationCount: 1,
    appliedMigrationCount: 1,
    latestCommittedMigrationTimestamp: 1,
    latestAppliedMigrationTimestamp: 1
  });
}

function fakeDatabase(): PortfolioWorkspacePostgresDatabase {
  return Object.freeze({}) as PortfolioWorkspacePostgresDatabase;
}

function fakeRepository(): PortfolioExecutionRepository {
  return Object.freeze({}) as PortfolioExecutionRepository;
}

function initializedExecution(id: ExecutionId): PortfolioExecution {
  return new PortfolioExecution({
    id,
    portfolioPlanReference: new PortfolioPlanReference({
      planId: `plan:${id.toJSON()}`,
      roadmapId: `roadmap:${id.toJSON()}`,
      planArtifactReference: `artifact:plan:${id.toJSON()}`
    }),
    planSnapshotReference: new PlanSnapshotReference({
      snapshotReference: `snapshot:plan:${id.toJSON()}:v1`
    }),
    approvalReference: new ApprovalReference({
      approvalReference: `approval:plan:${id.toJSON()}`
    }),
    authorizationResourceReference: new PortfolioWorkspaceAuthorizationResourceReference({
      authorizationResourceReference: "portfolio-workspace:execution-owner-1"
    }),
    commandContext: new PortfolioExecutionCommandContext({
      commandId: "command:runtime-query-initialize",
      correlationId: "correlation:runtime-query-initialize",
      actorReference: "actor:runtime-query",
      occurredAt: "2026-08-04T00:00:00.000Z"
    }),
    lifecycle: PortfolioExecutionLifecycle.Initialized
  });
}

function serviceRepository(service: unknown): unknown {
  return (service as { readonly repository?: unknown }).repository;
}

function expectSuccess<T>(result: { readonly isSuccess: boolean; readonly value?: T }): T {
  if (!result.isSuccess || result.value === undefined) {
    throw new Error("Expected successful result.");
  }

  return result.value;
}

function expectFailure<E>(result: { readonly isFailure: boolean; readonly error?: E }): E {
  if (!result.isFailure || result.error === undefined) {
    throw new Error("Expected failure result.");
  }

  return result.error;
}

function expectedPublicApi(): readonly string[] {
  return [
    "InvalidPortfolioWorkspaceRuntimeConfigurationError",
    "PORTFOLIO_EXECUTION_RECORD_VERSION",
    "PORTFOLIO_WORKSPACE_RUNTIME_ENVIRONMENT_VARIABLES",
    "PortfolioExecutionRecordMapper",
    "PortfolioWorkspaceMigrationMode",
    "PortfolioWorkspaceMigrationReadinessError",
    "PortfolioWorkspaceMigrationReadinessResult",
    "PortfolioWorkspacePostgresDatabaseRuntime",
    "PortfolioWorkspaceRuntime",
    "PortfolioWorkspaceRuntimeCompositionError",
    "PortfolioWorkspaceRuntimeConfiguration",
    "PortfolioWorkspaceRuntimeConstructionError",
    "PortfolioWorkspaceRuntimeDisposalError",
    "PortfolioWorkspaceRuntimeEnvironment",
    "PortfolioWorkspaceRuntimeLifecycle",
    "PortfolioWorkspaceRuntimeStatus",
    "PostgresPortfolioExecutionRepository",
    "createPortfolioWorkspacePostgresDatabaseRuntime",
    "createPortfolioWorkspaceRuntime",
    "verifyPortfolioWorkspaceMigrationReadiness"
  ];
}

function packageRoot(): string {
  const packageLocal = process.cwd();
  if (packageLocal.endsWith("infrastructure")) return packageLocal;
  return join(process.cwd(), "packages", "infrastructure");
}

function workspaceRoot(): string {
  const packageLocal = process.cwd();
  if (packageLocal.endsWith("infrastructure")) return join(packageLocal, "..", "..");
  return process.cwd();
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
