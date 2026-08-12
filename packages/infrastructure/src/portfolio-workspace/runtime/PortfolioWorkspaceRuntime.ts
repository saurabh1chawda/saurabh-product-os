import { Result } from "@career-companion/kernel";
import {
  AcceptCandidateApplicationService,
  ActivateWorkItemApplicationService,
  BeginExecutionApplicationService,
  CancelExecutionApplicationService,
  CancelWorkItemApplicationService,
  CompleteExecutionApplicationService,
  CompleteWorkItemApplicationService,
  GetPortfolioExecutionApplicationService,
  InitializePortfolioExecutionApplicationService,
  ResolvePortfolioExecutionAuthorizationResourceApplicationService,
  RejectCandidateApplicationService,
  type PortfolioExecutionRepository
} from "@career-companion/portfolio-workspace-application";
import { PostgresPortfolioExecutionRepository } from "../postgres";
import {
  PortfolioWorkspaceMigrationMode,
  PortfolioWorkspaceRuntimeEnvironment,
  type PortfolioWorkspaceRuntimeConfiguration
} from "./PortfolioWorkspaceRuntimeConfiguration";
import {
  createPortfolioWorkspacePostgresDatabaseRuntime,
  type PortfolioWorkspacePostgresDatabase,
  type PortfolioWorkspacePostgresDatabaseRuntime,
  type PortfolioWorkspaceRuntimeConstructionError
} from "./PortfolioWorkspacePostgresDatabaseRuntime";
import {
  verifyPortfolioWorkspaceMigrationReadiness,
  type PortfolioWorkspaceMigrationReadinessError,
  type PortfolioWorkspaceMigrationReadinessResult
} from "./PortfolioWorkspaceMigrationReadiness";

const INSPECT_SYMBOL = Symbol.for("nodejs.util.inspect.custom");

export interface PortfolioWorkspaceRuntimeJSON {
  readonly live: boolean;
  readonly ready: boolean;
  readonly lifecycle: PortfolioWorkspaceRuntimeLifecycleValue;
  readonly environment: typeof PortfolioWorkspaceRuntimeEnvironment[keyof typeof PortfolioWorkspaceRuntimeEnvironment];
  readonly migrationMode: typeof PortfolioWorkspaceMigrationMode[keyof typeof PortfolioWorkspaceMigrationMode];
  readonly migrationState: ReturnType<PortfolioWorkspaceMigrationReadinessResult["toJSON"]>["migrationState"];
  readonly disposed: boolean;
  readonly notReadyReason?: PortfolioWorkspaceRuntimeNotReadyReason;
}

export const PortfolioWorkspaceRuntimeLifecycle = Object.freeze({
  Ready: "ready",
  Disposing: "disposing",
  Disposed: "disposed",
  DisposalFailed: "disposal-failed"
} as const);

export type PortfolioWorkspaceRuntimeLifecycleValue =
  typeof PortfolioWorkspaceRuntimeLifecycle[keyof typeof PortfolioWorkspaceRuntimeLifecycle];

export type PortfolioWorkspaceRuntimeNotReadyReason =
  | "disposing"
  | "disposed"
  | "disposal-failed";

export interface PortfolioWorkspaceRuntimeStatusJSON {
  readonly live: boolean;
  readonly ready: boolean;
  readonly lifecycle: PortfolioWorkspaceRuntimeLifecycleValue;
  readonly disposed: boolean;
  readonly notReadyReason?: PortfolioWorkspaceRuntimeNotReadyReason;
}

export class PortfolioWorkspaceRuntimeStatus {
  readonly live: boolean;
  readonly ready: boolean;
  readonly lifecycle: PortfolioWorkspaceRuntimeLifecycleValue;
  readonly disposed: boolean;
  readonly notReadyReason: PortfolioWorkspaceRuntimeNotReadyReason | undefined;

  constructor(input: {
    readonly lifecycle: PortfolioWorkspaceRuntimeLifecycleValue;
  }) {
    this.lifecycle = input.lifecycle;
    this.live = input.lifecycle === PortfolioWorkspaceRuntimeLifecycle.Ready
      || input.lifecycle === PortfolioWorkspaceRuntimeLifecycle.Disposing;
    this.ready = input.lifecycle === PortfolioWorkspaceRuntimeLifecycle.Ready;
    this.disposed = input.lifecycle === PortfolioWorkspaceRuntimeLifecycle.Disposed;
    this.notReadyReason = notReadyReasonFor(input.lifecycle);
    Object.freeze(this);
  }

  equals(other: PortfolioWorkspaceRuntimeStatus | undefined): boolean {
    return other instanceof PortfolioWorkspaceRuntimeStatus
      && this.live === other.live
      && this.ready === other.ready
      && this.lifecycle === other.lifecycle
      && this.disposed === other.disposed
      && this.notReadyReason === other.notReadyReason;
  }

  toJSON(): PortfolioWorkspaceRuntimeStatusJSON {
    return {
      live: this.live,
      ready: this.ready,
      lifecycle: this.lifecycle,
      disposed: this.disposed,
      ...(this.notReadyReason === undefined ? {} : { notReadyReason: this.notReadyReason })
    };
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }

  [INSPECT_SYMBOL](): PortfolioWorkspaceRuntimeStatusJSON {
    return this.toJSON();
  }
}

export interface PortfolioWorkspaceRuntimeServices {
  readonly initializePortfolioExecution: InitializePortfolioExecutionApplicationService;
  readonly getPortfolioExecution: GetPortfolioExecutionApplicationService;
  readonly resolvePortfolioExecutionAuthorizationResource: ResolvePortfolioExecutionAuthorizationResourceApplicationService;
  readonly beginExecution: BeginExecutionApplicationService;
  readonly activateWorkItem: ActivateWorkItemApplicationService;
  readonly completeWorkItem: CompleteWorkItemApplicationService;
  readonly cancelWorkItem: CancelWorkItemApplicationService;
  readonly acceptCandidate: AcceptCandidateApplicationService;
  readonly rejectCandidate: RejectCandidateApplicationService;
  readonly completeExecution: CompleteExecutionApplicationService;
  readonly cancelExecution: CancelExecutionApplicationService;
}

export class PortfolioWorkspaceRuntime {
  readonly initializePortfolioExecution: InitializePortfolioExecutionApplicationService;
  readonly getPortfolioExecution: GetPortfolioExecutionApplicationService;
  readonly resolvePortfolioExecutionAuthorizationResource: ResolvePortfolioExecutionAuthorizationResourceApplicationService;
  readonly beginExecution: BeginExecutionApplicationService;
  readonly activateWorkItem: ActivateWorkItemApplicationService;
  readonly completeWorkItem: CompleteWorkItemApplicationService;
  readonly cancelWorkItem: CancelWorkItemApplicationService;
  readonly acceptCandidate: AcceptCandidateApplicationService;
  readonly rejectCandidate: RejectCandidateApplicationService;
  readonly completeExecution: CompleteExecutionApplicationService;
  readonly cancelExecution: CancelExecutionApplicationService;

  readonly #configuration: PortfolioWorkspaceRuntimeConfiguration;
  readonly #databaseRuntime: PortfolioWorkspacePostgresDatabaseRuntime;
  readonly #readiness: PortfolioWorkspaceMigrationReadinessResult;
  #lifecycle: PortfolioWorkspaceRuntimeLifecycleValue = PortfolioWorkspaceRuntimeLifecycle.Ready;
  #disposalPromise: Promise<void> | undefined;
  #disposalFailure: PortfolioWorkspaceRuntimeDisposalError | undefined;

  constructor(input: {
    readonly configuration: PortfolioWorkspaceRuntimeConfiguration;
    readonly databaseRuntime: PortfolioWorkspacePostgresDatabaseRuntime;
    readonly readiness: PortfolioWorkspaceMigrationReadinessResult;
    readonly services: PortfolioWorkspaceRuntimeServices;
  }) {
    this.#configuration = input.configuration;
    this.#databaseRuntime = input.databaseRuntime;
    this.#readiness = input.readiness;
    this.initializePortfolioExecution = input.services.initializePortfolioExecution;
    this.getPortfolioExecution = input.services.getPortfolioExecution;
    this.resolvePortfolioExecutionAuthorizationResource = input.services.resolvePortfolioExecutionAuthorizationResource;
    this.beginExecution = input.services.beginExecution;
    this.activateWorkItem = input.services.activateWorkItem;
    this.completeWorkItem = input.services.completeWorkItem;
    this.cancelWorkItem = input.services.cancelWorkItem;
    this.acceptCandidate = input.services.acceptCandidate;
    this.rejectCandidate = input.services.rejectCandidate;
    this.completeExecution = input.services.completeExecution;
    this.cancelExecution = input.services.cancelExecution;
    Object.freeze(this);
  }

  isDisposed(): boolean {
    return this.#lifecycle === PortfolioWorkspaceRuntimeLifecycle.Disposed;
  }

  lifecycle(): PortfolioWorkspaceRuntimeLifecycleValue {
    return this.#lifecycle;
  }

  isLive(): boolean {
    return this.status().live;
  }

  isReady(): boolean {
    return this.status().ready;
  }

  status(): PortfolioWorkspaceRuntimeStatus {
    return new PortfolioWorkspaceRuntimeStatus({
      lifecycle: this.#lifecycle
    });
  }

  async dispose(): Promise<void> {
    if (this.#lifecycle === PortfolioWorkspaceRuntimeLifecycle.Disposed) {
      return;
    }

    if (this.#disposalFailure !== undefined) {
      throw this.#disposalFailure;
    }

    if (this.#disposalPromise !== undefined) {
      return this.#disposalPromise;
    }

    this.#lifecycle = PortfolioWorkspaceRuntimeLifecycle.Disposing;
    this.#disposalPromise = this.#databaseRuntime.dispose()
      .then(() => {
        this.#lifecycle = PortfolioWorkspaceRuntimeLifecycle.Disposed;
      })
      .catch((error: unknown) => {
        this.#lifecycle = PortfolioWorkspaceRuntimeLifecycle.DisposalFailed;
        this.#disposalFailure = new PortfolioWorkspaceRuntimeDisposalError({
          reason: "database-runtime-disposal-failed",
          causeName: safeFailureName(error),
          causeCode: safeFailureCode(error)
        });
        throw this.#disposalFailure;
      });

    return this.#disposalPromise;
  }

  toJSON(): PortfolioWorkspaceRuntimeJSON {
    const status = this.status();
    return {
      live: status.live,
      ready: status.ready,
      lifecycle: status.lifecycle,
      environment: this.#configuration.environment,
      migrationMode: this.#configuration.migrationMode,
      migrationState: this.#readiness.migrationState,
      disposed: status.disposed,
      ...(status.notReadyReason === undefined ? {} : { notReadyReason: status.notReadyReason })
    };
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }

  [INSPECT_SYMBOL](): PortfolioWorkspaceRuntimeJSON {
    return this.toJSON();
  }
}

export type PortfolioWorkspaceRuntimeDisposalFailureReason =
  | "database-runtime-disposal-failed";

export class PortfolioWorkspaceRuntimeDisposalError extends Error {
  readonly code = "PORTFOLIO_WORKSPACE_RUNTIME_DISPOSAL_FAILED";
  readonly reason: PortfolioWorkspaceRuntimeDisposalFailureReason;
  readonly causeName: string | undefined;
  readonly causeCode: string | undefined;

  constructor(input: {
    readonly reason: PortfolioWorkspaceRuntimeDisposalFailureReason;
    readonly causeName?: string;
    readonly causeCode?: string;
  }) {
    super("Portfolio Workspace runtime disposal failed.");
    this.name = "PortfolioWorkspaceRuntimeDisposalError";
    this.reason = input.reason;
    this.causeName = input.causeName;
    this.causeCode = input.causeCode;
    Object.freeze(this);
  }

  toJSON(): {
    readonly name: "PortfolioWorkspaceRuntimeDisposalError";
    readonly code: "PORTFOLIO_WORKSPACE_RUNTIME_DISPOSAL_FAILED";
    readonly reason: PortfolioWorkspaceRuntimeDisposalFailureReason;
    readonly causeName?: string;
    readonly causeCode?: string;
  } {
    return {
      name: "PortfolioWorkspaceRuntimeDisposalError",
      code: this.code,
      reason: this.reason,
      ...(this.causeName === undefined ? {} : { causeName: this.causeName }),
      ...(this.causeCode === undefined ? {} : { causeCode: this.causeCode })
    };
  }

  [INSPECT_SYMBOL](): ReturnType<PortfolioWorkspaceRuntimeDisposalError["toJSON"]> {
    return this.toJSON();
  }
}

export type PortfolioWorkspaceRuntimeCompositionFailureReason =
  | "invalid-migration-policy"
  | "service-composition-failed"
  | "startup-cleanup-failed";

export class PortfolioWorkspaceRuntimeCompositionError extends Error {
  readonly code = "PORTFOLIO_WORKSPACE_RUNTIME_COMPOSITION_FAILED";
  readonly reason: PortfolioWorkspaceRuntimeCompositionFailureReason;
  readonly environment: typeof PortfolioWorkspaceRuntimeEnvironment[keyof typeof PortfolioWorkspaceRuntimeEnvironment];
  readonly migrationMode: typeof PortfolioWorkspaceMigrationMode[keyof typeof PortfolioWorkspaceMigrationMode];
  readonly startupFailureName: string | undefined;
  readonly startupFailureCode: string | undefined;

  constructor(input: {
    readonly reason: PortfolioWorkspaceRuntimeCompositionFailureReason;
    readonly configuration: PortfolioWorkspaceRuntimeConfiguration;
    readonly startupFailure?: unknown;
  }) {
    super("Portfolio Workspace runtime composition failed.");
    this.name = "PortfolioWorkspaceRuntimeCompositionError";
    this.reason = input.reason;
    this.environment = input.configuration.environment;
    this.migrationMode = input.configuration.migrationMode;
    this.startupFailureName = safeFailureName(input.startupFailure);
    this.startupFailureCode = safeFailureCode(input.startupFailure);
    Object.freeze(this);
  }

  toJSON(): {
    readonly name: "PortfolioWorkspaceRuntimeCompositionError";
    readonly code: "PORTFOLIO_WORKSPACE_RUNTIME_COMPOSITION_FAILED";
    readonly reason: PortfolioWorkspaceRuntimeCompositionFailureReason;
    readonly environment: typeof PortfolioWorkspaceRuntimeEnvironment[keyof typeof PortfolioWorkspaceRuntimeEnvironment];
    readonly migrationMode: typeof PortfolioWorkspaceMigrationMode[keyof typeof PortfolioWorkspaceMigrationMode];
    readonly startupFailureName?: string;
    readonly startupFailureCode?: string;
  } {
    return {
      name: "PortfolioWorkspaceRuntimeCompositionError",
      code: this.code,
      reason: this.reason,
      environment: this.environment,
      migrationMode: this.migrationMode,
      ...(this.startupFailureName === undefined ? {} : { startupFailureName: this.startupFailureName }),
      ...(this.startupFailureCode === undefined ? {} : { startupFailureCode: this.startupFailureCode })
    };
  }

  [INSPECT_SYMBOL](): ReturnType<PortfolioWorkspaceRuntimeCompositionError["toJSON"]> {
    return this.toJSON();
  }
}

export type PortfolioWorkspaceRuntimeCreationFailure =
  | PortfolioWorkspaceRuntimeCompositionError
  | PortfolioWorkspaceRuntimeConstructionError
  | PortfolioWorkspaceMigrationReadinessError;

export async function createPortfolioWorkspaceRuntime(
  configuration: PortfolioWorkspaceRuntimeConfiguration
): Promise<Result<PortfolioWorkspaceRuntime, PortfolioWorkspaceRuntimeCreationFailure>> {
  return createPortfolioWorkspaceRuntimeWithDependencies(configuration, {
    createDatabaseRuntime: createPortfolioWorkspacePostgresDatabaseRuntime,
    verifyMigrationReadiness: verifyPortfolioWorkspaceMigrationReadiness,
    createRepository: (database) => new PostgresPortfolioExecutionRepository(database),
    createServices: createPortfolioWorkspaceApplicationServices
  });
}

export async function createPortfolioWorkspaceRuntimeWithDependencies(
  configuration: PortfolioWorkspaceRuntimeConfiguration,
  dependencies: PortfolioWorkspaceRuntimeFactoryDependencies
): Promise<Result<PortfolioWorkspaceRuntime, PortfolioWorkspaceRuntimeCreationFailure>> {
  const policy = validateMigrationPolicy(configuration);
  if (policy.isFailure) {
    return Result.failure(policy.error!);
  }

  const databaseRuntimeResult = await dependencies.createDatabaseRuntime(configuration);
  if (databaseRuntimeResult.isFailure) {
    return Result.failure(databaseRuntimeResult.error!);
  }

  const databaseRuntime = databaseRuntimeResult.value!;
  const readinessResult = await dependencies.verifyMigrationReadiness({
    configuration,
    database: databaseRuntime.database()
  });
  if (readinessResult.isFailure) {
    return disposeAfterStartupFailure(databaseRuntime, readinessResult.error!, configuration);
  }

  try {
    const repository = dependencies.createRepository(databaseRuntime.database());
    const services = dependencies.createServices(repository);
    return Result.success(new PortfolioWorkspaceRuntime({
      configuration,
      databaseRuntime,
      readiness: readinessResult.value!,
      services
    }));
  } catch (error) {
    const serviceCompositionError = new PortfolioWorkspaceRuntimeCompositionError({
      reason: "service-composition-failed",
      configuration,
      startupFailure: error
    });
    return disposeAfterStartupFailure(databaseRuntime, serviceCompositionError, configuration);
  }
}

export function createPortfolioWorkspaceApplicationServices(
  repository: PortfolioExecutionRepository
): PortfolioWorkspaceRuntimeServices {
  const input = { repository };
  return Object.freeze({
    initializePortfolioExecution: new InitializePortfolioExecutionApplicationService(input),
    getPortfolioExecution: new GetPortfolioExecutionApplicationService(input),
    resolvePortfolioExecutionAuthorizationResource: new ResolvePortfolioExecutionAuthorizationResourceApplicationService(input),
    beginExecution: new BeginExecutionApplicationService(input),
    activateWorkItem: new ActivateWorkItemApplicationService(input),
    completeWorkItem: new CompleteWorkItemApplicationService(input),
    cancelWorkItem: new CancelWorkItemApplicationService(input),
    acceptCandidate: new AcceptCandidateApplicationService(input),
    rejectCandidate: new RejectCandidateApplicationService(input),
    completeExecution: new CompleteExecutionApplicationService(input),
    cancelExecution: new CancelExecutionApplicationService(input)
  });
}

function validateMigrationPolicy(
  configuration: PortfolioWorkspaceRuntimeConfiguration
): Result<true, PortfolioWorkspaceRuntimeCompositionError> {
  const applyMode = configuration.migrationMode === PortfolioWorkspaceMigrationMode.Apply;
  const durableEnvironment =
    configuration.environment === PortfolioWorkspaceRuntimeEnvironment.Production
    || configuration.environment === PortfolioWorkspaceRuntimeEnvironment.Staging;

  if (applyMode && durableEnvironment) {
    return Result.failure(new PortfolioWorkspaceRuntimeCompositionError({
      reason: "invalid-migration-policy",
      configuration
    }));
  }

  return Result.success(true);
}

async function disposeAfterStartupFailure(
  databaseRuntime: PortfolioWorkspacePostgresDatabaseRuntime,
  startupFailure: PortfolioWorkspaceRuntimeCreationFailure,
  configuration: PortfolioWorkspaceRuntimeConfiguration
): Promise<Result<never, PortfolioWorkspaceRuntimeCreationFailure>> {
  try {
    await databaseRuntime.dispose();
  } catch {
    return Result.failure(new PortfolioWorkspaceRuntimeCompositionError({
      reason: "startup-cleanup-failed",
      configuration,
      startupFailure
    }));
  }

  return Result.failure(startupFailure);
}

function safeFailureName(failure: unknown): string | undefined {
  if (failure instanceof Error) {
    return failure.name;
  }

  return undefined;
}

function safeFailureCode(failure: unknown): string | undefined {
  if (typeof failure === "object" && failure !== null && "code" in failure) {
    const code = (failure as { readonly code?: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }

  return undefined;
}

function notReadyReasonFor(
  lifecycle: PortfolioWorkspaceRuntimeLifecycleValue
): PortfolioWorkspaceRuntimeNotReadyReason | undefined {
  if (lifecycle === PortfolioWorkspaceRuntimeLifecycle.Disposing) {
    return "disposing";
  }
  if (lifecycle === PortfolioWorkspaceRuntimeLifecycle.Disposed) {
    return "disposed";
  }
  if (lifecycle === PortfolioWorkspaceRuntimeLifecycle.DisposalFailed) {
    return "disposal-failed";
  }

  return undefined;
}

export interface PortfolioWorkspaceRuntimeFactoryDependencies {
  readonly createDatabaseRuntime: (
    configuration: PortfolioWorkspaceRuntimeConfiguration
  ) => Promise<Result<PortfolioWorkspacePostgresDatabaseRuntime, PortfolioWorkspaceRuntimeConstructionError>>;
  readonly verifyMigrationReadiness: (input: {
    readonly configuration: PortfolioWorkspaceRuntimeConfiguration;
    readonly database: PortfolioWorkspacePostgresDatabase;
  }) => Promise<Result<PortfolioWorkspaceMigrationReadinessResult, PortfolioWorkspaceMigrationReadinessError>>;
  readonly createRepository: (database: PortfolioWorkspacePostgresDatabase) => PortfolioExecutionRepository;
  readonly createServices: (repository: PortfolioExecutionRepository) => PortfolioWorkspaceRuntimeServices;
}
