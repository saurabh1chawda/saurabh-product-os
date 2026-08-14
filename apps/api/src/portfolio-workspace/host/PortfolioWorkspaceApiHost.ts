import { randomUUID } from "node:crypto";
import {
  createPortfolioWorkspaceRuntime,
  InvalidPortfolioWorkspaceRuntimeConfigurationError,
  PortfolioWorkspaceRuntimeConfiguration,
  type PortfolioWorkspaceRuntime,
  type PortfolioWorkspaceRuntimeCreationFailure,
  type PortfolioWorkspaceRuntimeEnvironmentInput
} from "@career-companion/infrastructure";
import { Result } from "@career-companion/kernel";

import {
  GetPortfolioExecutionInternalHandler,
  InitializePortfolioExecutionInternalHandler,
  PortfolioWorkspaceProductionAuthorization,
  PortfolioWorkspaceRuntimeAuthorizationResourceResolver,
  type PortfolioWorkspaceInternalAuthorization
} from "../internal";
import {
  PortfolioWorkspaceCommandContextFactory,
  type PortfolioWorkspaceActorReferenceMapper,
  type PortfolioWorkspaceCommandIdGenerator,
  type PortfolioWorkspaceCorrelationIdGenerator,
  type PortfolioWorkspacePresentationClock
} from "../presentation";

const INSPECT_SYMBOL = Symbol.for("nodejs.util.inspect.custom");

export const PortfolioWorkspaceApiHostLifecycle = Object.freeze({
  Ready: "ready",
  Disposing: "disposing",
  Disposed: "disposed",
  DisposalFailed: "disposal-failed"
} as const);

export type PortfolioWorkspaceApiHostLifecycleValue =
  typeof PortfolioWorkspaceApiHostLifecycle[keyof typeof PortfolioWorkspaceApiHostLifecycle];

export type PortfolioWorkspaceApiHostNotReadyReason =
  | "runtime-not-ready"
  | "disposing"
  | "disposed"
  | "disposal-failed";

export interface PortfolioWorkspaceApiHostStatusJSON {
  readonly live: boolean;
  readonly ready: boolean;
  readonly lifecycle: PortfolioWorkspaceApiHostLifecycleValue;
  readonly disposed: boolean;
  readonly notReadyReason?: PortfolioWorkspaceApiHostNotReadyReason;
}

export class PortfolioWorkspaceApiHostStatus {
  readonly live: boolean;
  readonly ready: boolean;
  readonly lifecycle: PortfolioWorkspaceApiHostLifecycleValue;
  readonly disposed: boolean;
  readonly notReadyReason: PortfolioWorkspaceApiHostNotReadyReason | undefined;

  constructor(input: {
    readonly lifecycle: PortfolioWorkspaceApiHostLifecycleValue;
    readonly runtimeReady: boolean;
    readonly runtimeLive: boolean;
  }) {
    this.lifecycle = input.lifecycle;
    this.ready = input.lifecycle === PortfolioWorkspaceApiHostLifecycle.Ready && input.runtimeReady;
    this.live = (
      input.lifecycle === PortfolioWorkspaceApiHostLifecycle.Ready
      || input.lifecycle === PortfolioWorkspaceApiHostLifecycle.Disposing
    ) && input.runtimeLive;
    this.disposed = input.lifecycle === PortfolioWorkspaceApiHostLifecycle.Disposed;
    this.notReadyReason = notReadyReasonFor({
      lifecycle: input.lifecycle,
      runtimeReady: input.runtimeReady
    });
    Object.freeze(this);
  }

  toJSON(): PortfolioWorkspaceApiHostStatusJSON {
    return Object.freeze({
      live: this.live,
      ready: this.ready,
      lifecycle: this.lifecycle,
      disposed: this.disposed,
      ...(this.notReadyReason === undefined ? {} : { notReadyReason: this.notReadyReason })
    });
  }

  [INSPECT_SYMBOL](): PortfolioWorkspaceApiHostStatusJSON {
    return this.toJSON();
  }
}

export type PortfolioWorkspaceApiHostJSON = PortfolioWorkspaceApiHostStatusJSON;

export class PortfolioWorkspaceApiHost {
  readonly initializePortfolioExecutionHandler: InitializePortfolioExecutionInternalHandler;
  readonly getPortfolioExecutionHandler: GetPortfolioExecutionInternalHandler;

  readonly #runtime: PortfolioWorkspaceRuntime;
  #lifecycle: PortfolioWorkspaceApiHostLifecycleValue = PortfolioWorkspaceApiHostLifecycle.Ready;
  #disposalPromise: Promise<void> | undefined;
  #disposalFailure: PortfolioWorkspaceApiHostDisposalError | undefined;

  constructor(input: {
    readonly runtime: PortfolioWorkspaceRuntime;
    readonly initializePortfolioExecutionHandler: InitializePortfolioExecutionInternalHandler;
    readonly getPortfolioExecutionHandler: GetPortfolioExecutionInternalHandler;
  }) {
    this.#runtime = input.runtime;
    this.initializePortfolioExecutionHandler = input.initializePortfolioExecutionHandler;
    this.getPortfolioExecutionHandler = input.getPortfolioExecutionHandler;
    Object.freeze(this);
  }

  isReady(): boolean {
    return this.status().ready;
  }

  isLive(): boolean {
    return this.status().live;
  }

  isDisposed(): boolean {
    return this.#lifecycle === PortfolioWorkspaceApiHostLifecycle.Disposed;
  }

  status(): PortfolioWorkspaceApiHostStatus {
    return new PortfolioWorkspaceApiHostStatus({
      lifecycle: this.#lifecycle,
      runtimeReady: this.#runtime.isReady(),
      runtimeLive: this.#runtime.isLive()
    });
  }

  async dispose(): Promise<void> {
    if (this.#lifecycle === PortfolioWorkspaceApiHostLifecycle.Disposed) {
      return;
    }

    if (this.#disposalFailure !== undefined) {
      throw this.#disposalFailure;
    }

    if (this.#disposalPromise !== undefined) {
      return this.#disposalPromise;
    }

    this.#lifecycle = PortfolioWorkspaceApiHostLifecycle.Disposing;
    this.#disposalPromise = this.#runtime.dispose()
      .then(() => {
        this.#lifecycle = PortfolioWorkspaceApiHostLifecycle.Disposed;
      })
      .catch((error: unknown) => {
        this.#lifecycle = PortfolioWorkspaceApiHostLifecycle.DisposalFailed;
        this.#disposalFailure = new PortfolioWorkspaceApiHostDisposalError({
          reason: "runtime-disposal-failed",
          causeName: safeFailureName(error),
          causeCode: safeFailureCode(error)
        });
        throw this.#disposalFailure;
      });

    return this.#disposalPromise;
  }

  toJSON(): PortfolioWorkspaceApiHostJSON {
    return this.status().toJSON();
  }

  [INSPECT_SYMBOL](): PortfolioWorkspaceApiHostJSON {
    return this.toJSON();
  }
}

export type PortfolioWorkspaceApiHostConstructionFailure =
  | InvalidPortfolioWorkspaceRuntimeConfigurationError
  | PortfolioWorkspaceApiHostConstructionError;

export type PortfolioWorkspaceApiHostConstructionFailureReason =
  | "runtime-construction-failed"
  | "runtime-not-ready"
  | "handler-composition-failed"
  | "startup-cleanup-failed";

export class PortfolioWorkspaceApiHostConstructionError extends Error {
  readonly code = "PORTFOLIO_WORKSPACE_API_HOST_CONSTRUCTION_FAILED";
  readonly reason: PortfolioWorkspaceApiHostConstructionFailureReason;
  readonly startupFailureName: string | undefined;
  readonly startupFailureCode: string | undefined;

  constructor(input: {
    readonly reason: PortfolioWorkspaceApiHostConstructionFailureReason;
    readonly startupFailure?: unknown;
  }) {
    super("Portfolio Workspace API host construction failed.");
    this.name = "PortfolioWorkspaceApiHostConstructionError";
    this.reason = input.reason;
    this.startupFailureName = safeFailureName(input.startupFailure);
    this.startupFailureCode = safeFailureCode(input.startupFailure);
    Object.freeze(this);
  }

  toJSON(): {
    readonly name: "PortfolioWorkspaceApiHostConstructionError";
    readonly code: "PORTFOLIO_WORKSPACE_API_HOST_CONSTRUCTION_FAILED";
    readonly reason: PortfolioWorkspaceApiHostConstructionFailureReason;
    readonly startupFailureName?: string;
    readonly startupFailureCode?: string;
  } {
    return Object.freeze({
      name: "PortfolioWorkspaceApiHostConstructionError",
      code: this.code,
      reason: this.reason,
      ...(this.startupFailureName === undefined ? {} : { startupFailureName: this.startupFailureName }),
      ...(this.startupFailureCode === undefined ? {} : { startupFailureCode: this.startupFailureCode })
    });
  }

  [INSPECT_SYMBOL](): ReturnType<PortfolioWorkspaceApiHostConstructionError["toJSON"]> {
    return this.toJSON();
  }
}

export type PortfolioWorkspaceApiHostDisposalFailureReason =
  | "runtime-disposal-failed";

export class PortfolioWorkspaceApiHostDisposalError extends Error {
  readonly code = "PORTFOLIO_WORKSPACE_API_HOST_DISPOSAL_FAILED";
  readonly reason: PortfolioWorkspaceApiHostDisposalFailureReason;
  readonly causeName: string | undefined;
  readonly causeCode: string | undefined;

  constructor(input: {
    readonly reason: PortfolioWorkspaceApiHostDisposalFailureReason;
    readonly causeName?: string;
    readonly causeCode?: string;
  }) {
    super("Portfolio Workspace API host disposal failed.");
    this.name = "PortfolioWorkspaceApiHostDisposalError";
    this.reason = input.reason;
    this.causeName = input.causeName;
    this.causeCode = input.causeCode;
    Object.freeze(this);
  }

  toJSON(): {
    readonly name: "PortfolioWorkspaceApiHostDisposalError";
    readonly code: "PORTFOLIO_WORKSPACE_API_HOST_DISPOSAL_FAILED";
    readonly reason: PortfolioWorkspaceApiHostDisposalFailureReason;
    readonly causeName?: string;
    readonly causeCode?: string;
  } {
    return Object.freeze({
      name: "PortfolioWorkspaceApiHostDisposalError",
      code: this.code,
      reason: this.reason,
      ...(this.causeName === undefined ? {} : { causeName: this.causeName }),
      ...(this.causeCode === undefined ? {} : { causeCode: this.causeCode })
    });
  }

  [INSPECT_SYMBOL](): ReturnType<PortfolioWorkspaceApiHostDisposalError["toJSON"]> {
    return this.toJSON();
  }
}

export interface PortfolioWorkspaceApiHostInput {
  readonly configuration: PortfolioWorkspaceRuntimeConfiguration;
  readonly authorization?: PortfolioWorkspaceInternalAuthorization;
  readonly commandIdGenerator?: PortfolioWorkspaceCommandIdGenerator;
  readonly correlationIdGenerator?: PortfolioWorkspaceCorrelationIdGenerator;
  readonly clock?: PortfolioWorkspacePresentationClock;
  readonly actorReferenceMapper?: PortfolioWorkspaceActorReferenceMapper;
}

export interface PortfolioWorkspaceApiHostEnvironmentInput {
  readonly environment: PortfolioWorkspaceRuntimeEnvironmentInput;
  readonly authorization?: PortfolioWorkspaceInternalAuthorization;
  readonly commandIdGenerator?: PortfolioWorkspaceCommandIdGenerator;
  readonly correlationIdGenerator?: PortfolioWorkspaceCorrelationIdGenerator;
  readonly clock?: PortfolioWorkspacePresentationClock;
  readonly actorReferenceMapper?: PortfolioWorkspaceActorReferenceMapper;
}

export async function createPortfolioWorkspaceApiHostFromEnvironment(
  input: PortfolioWorkspaceApiHostEnvironmentInput
): Promise<Result<PortfolioWorkspaceApiHost, PortfolioWorkspaceApiHostConstructionFailure>> {
  return createPortfolioWorkspaceApiHostFromEnvironmentWithDependencies(input, {
    createRuntime: createPortfolioWorkspaceRuntime,
    createHandlers: createPortfolioWorkspaceApiHostHandlers
  });
}

export async function createPortfolioWorkspaceApiHostFromEnvironmentWithDependencies(
  input: PortfolioWorkspaceApiHostEnvironmentInput,
  dependencies: PortfolioWorkspaceApiHostFactoryDependencies
): Promise<Result<PortfolioWorkspaceApiHost, PortfolioWorkspaceApiHostConstructionFailure>> {
  const configurationResult = PortfolioWorkspaceRuntimeConfiguration.fromEnvironment(input.environment);
  if (configurationResult.isFailure) {
    return Result.failure(configurationResult.error!);
  }

  return createPortfolioWorkspaceApiHostWithDependencies({
    configuration: configurationResult.value!,
    authorization: input.authorization,
    commandIdGenerator: input.commandIdGenerator,
    correlationIdGenerator: input.correlationIdGenerator,
    clock: input.clock,
    actorReferenceMapper: input.actorReferenceMapper
  }, dependencies);
}

export async function createPortfolioWorkspaceApiHost(
  input: PortfolioWorkspaceApiHostInput
): Promise<Result<PortfolioWorkspaceApiHost, PortfolioWorkspaceApiHostConstructionFailure>> {
  return createPortfolioWorkspaceApiHostWithDependencies(input, {
    createRuntime: createPortfolioWorkspaceRuntime,
    createHandlers: createPortfolioWorkspaceApiHostHandlers
  });
}

export interface PortfolioWorkspaceApiHostFactoryDependencies {
  readonly createRuntime: (
    configuration: PortfolioWorkspaceRuntimeConfiguration
  ) => Promise<Result<PortfolioWorkspaceRuntime, PortfolioWorkspaceRuntimeCreationFailure>>;
  readonly createHandlers: (input: {
    readonly runtime: PortfolioWorkspaceRuntime;
    readonly authorization: PortfolioWorkspaceInternalAuthorization;
    readonly commandContextFactory: PortfolioWorkspaceCommandContextFactory;
    readonly correlationIdGenerator: PortfolioWorkspaceCorrelationIdGenerator;
  }) => PortfolioWorkspaceApiHostHandlers;
}

export interface PortfolioWorkspaceApiHostHandlers {
  readonly initializePortfolioExecutionHandler: InitializePortfolioExecutionInternalHandler;
  readonly getPortfolioExecutionHandler: GetPortfolioExecutionInternalHandler;
}

export async function createPortfolioWorkspaceApiHostWithDependencies(
  input: PortfolioWorkspaceApiHostInput,
  dependencies: PortfolioWorkspaceApiHostFactoryDependencies
): Promise<Result<PortfolioWorkspaceApiHost, PortfolioWorkspaceApiHostConstructionFailure>> {
  const runtimeResult = await dependencies.createRuntime(input.configuration);
  if (runtimeResult.isFailure) {
    return Result.failure(new PortfolioWorkspaceApiHostConstructionError({
      reason: "runtime-construction-failed",
      startupFailure: runtimeResult.error
    }));
  }

  const runtime = runtimeResult.value!;
  if (!runtime.isReady()) {
    return disposeAfterStartupFailure(
      runtime,
      new PortfolioWorkspaceApiHostConstructionError({ reason: "runtime-not-ready" })
    );
  }

  try {
    const commandContextFactory = new PortfolioWorkspaceCommandContextFactory({
      commandIdGenerator: input.commandIdGenerator ?? new RandomUuidIdentifierGenerator("command"),
      correlationIdGenerator: input.correlationIdGenerator ?? new RandomUuidIdentifierGenerator("correlation"),
      clock: input.clock ?? new SystemPortfolioWorkspaceClock(),
      ...(input.actorReferenceMapper === undefined ? {} : { actorReferenceMapper: input.actorReferenceMapper })
    });
    const authorization = input.authorization ?? new PortfolioWorkspaceProductionAuthorization({
      resourceResolver: new PortfolioWorkspaceRuntimeAuthorizationResourceResolver({ runtime })
    });
    const handlers = dependencies.createHandlers({
      runtime,
      authorization,
      commandContextFactory,
      correlationIdGenerator: input.correlationIdGenerator ?? new RandomUuidIdentifierGenerator("correlation")
    });

    return Result.success(new PortfolioWorkspaceApiHost({
      runtime,
      initializePortfolioExecutionHandler: handlers.initializePortfolioExecutionHandler,
      getPortfolioExecutionHandler: handlers.getPortfolioExecutionHandler
    }));
  } catch (error) {
    return disposeAfterStartupFailure(
      runtime,
      new PortfolioWorkspaceApiHostConstructionError({
        reason: "handler-composition-failed",
        startupFailure: error
      })
    );
  }
}

function createPortfolioWorkspaceApiHostHandlers(input: {
  readonly runtime: PortfolioWorkspaceRuntime;
  readonly authorization: PortfolioWorkspaceInternalAuthorization;
  readonly commandContextFactory: PortfolioWorkspaceCommandContextFactory;
  readonly correlationIdGenerator: PortfolioWorkspaceCorrelationIdGenerator;
}): PortfolioWorkspaceApiHostHandlers {
  return Object.freeze({
    initializePortfolioExecutionHandler: new InitializePortfolioExecutionInternalHandler({
      runtime: input.runtime,
      authorization: input.authorization,
      commandContextFactory: input.commandContextFactory,
      correlationIdGenerator: input.correlationIdGenerator
    }),
    getPortfolioExecutionHandler: new GetPortfolioExecutionInternalHandler({
      runtime: input.runtime,
      authorization: input.authorization,
      correlationIdGenerator: input.correlationIdGenerator
    })
  });
}

async function disposeAfterStartupFailure(
  runtime: PortfolioWorkspaceRuntime,
  startupFailure: PortfolioWorkspaceApiHostConstructionError
): Promise<Result<never, PortfolioWorkspaceApiHostConstructionError>> {
  try {
    await runtime.dispose();
  } catch {
    return Result.failure(new PortfolioWorkspaceApiHostConstructionError({
      reason: "startup-cleanup-failed",
      startupFailure
    }));
  }

  return Result.failure(startupFailure);
}

class RandomUuidIdentifierGenerator implements PortfolioWorkspaceCommandIdGenerator, PortfolioWorkspaceCorrelationIdGenerator {
  constructor(private readonly prefix: "command" | "correlation") {}

  generate(): string {
    return `${this.prefix}:${randomUUID()}`;
  }
}

class SystemPortfolioWorkspaceClock implements PortfolioWorkspacePresentationClock {
  now(): Date {
    return new Date();
  }
}

function notReadyReasonFor(input: {
  readonly lifecycle: PortfolioWorkspaceApiHostLifecycleValue;
  readonly runtimeReady: boolean;
}): PortfolioWorkspaceApiHostNotReadyReason | undefined {
  if (input.lifecycle === PortfolioWorkspaceApiHostLifecycle.Disposing) {
    return "disposing";
  }
  if (input.lifecycle === PortfolioWorkspaceApiHostLifecycle.Disposed) {
    return "disposed";
  }
  if (input.lifecycle === PortfolioWorkspaceApiHostLifecycle.DisposalFailed) {
    return "disposal-failed";
  }
  if (!input.runtimeReady) {
    return "runtime-not-ready";
  }

  return undefined;
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
