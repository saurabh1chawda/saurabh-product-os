import { Result } from "@career-companion/kernel";

import {
  NodeHttpApiServer,
  NodeHttpApiServerConfigurationError,
  type NodeHttpApiServerListenOptions,
  type NodeHttpApiServerStatusJSON,
  type NodeHttpJsonValue,
  type NodeHttpRequest,
  type NodeHttpRequestHandler,
  type NodeHttpResponse
} from "../../http";
import {
  PortfolioWorkspaceApiHost,
  createPortfolioWorkspaceApiHostFromEnvironment,
  type PortfolioWorkspaceApiHostConstructionFailure,
  type PortfolioWorkspaceApiHostEnvironmentInput,
  type PortfolioWorkspaceApiHostStatusJSON
} from "../host";
import {
  createPortfolioWorkspacePublicGetExecutionHttpRoute,
  type PortfolioWorkspaceTrustedPrincipalResolver
} from "./get-portfolio-execution-route";

const INSPECT_SYMBOL = Symbol.for("nodejs.util.inspect.custom");

export const PORTFOLIO_WORKSPACE_HTTP_LIVENESS_ROUTE = "/health/live";
export const PORTFOLIO_WORKSPACE_HTTP_READINESS_ROUTE = "/health/ready";

export type PortfolioWorkspaceExecutableHttpHostStartupFailureReason =
  | "invalid-listen-configuration"
  | "missing-trusted-principal-resolver"
  | "api-host-construction-failed"
  | "api-host-not-ready"
  | "http-server-start-failed"
  | "startup-cleanup-failed";

export class PortfolioWorkspaceExecutableHttpHostStartupError extends Error {
  readonly code = "PORTFOLIO_WORKSPACE_EXECUTABLE_HTTP_HOST_STARTUP_FAILED";
  readonly reason: PortfolioWorkspaceExecutableHttpHostStartupFailureReason;
  readonly startupFailureName: string | undefined;
  readonly startupFailureCode: string | undefined;

  constructor(input: {
    readonly reason: PortfolioWorkspaceExecutableHttpHostStartupFailureReason;
    readonly startupFailure?: unknown;
  }) {
    super("Portfolio Workspace executable HTTP host startup failed.");
    this.name = "PortfolioWorkspaceExecutableHttpHostStartupError";
    this.reason = input.reason;
    this.startupFailureName = safeFailureName(input.startupFailure);
    this.startupFailureCode = safeFailureCode(input.startupFailure);
    Object.freeze(this);
  }

  toJSON(): {
    readonly name: "PortfolioWorkspaceExecutableHttpHostStartupError";
    readonly code: "PORTFOLIO_WORKSPACE_EXECUTABLE_HTTP_HOST_STARTUP_FAILED";
    readonly reason: PortfolioWorkspaceExecutableHttpHostStartupFailureReason;
    readonly startupFailureName?: string;
    readonly startupFailureCode?: string;
  } {
    return Object.freeze({
      name: "PortfolioWorkspaceExecutableHttpHostStartupError",
      code: this.code,
      reason: this.reason,
      ...(this.startupFailureName === undefined ? {} : { startupFailureName: this.startupFailureName }),
      ...(this.startupFailureCode === undefined ? {} : { startupFailureCode: this.startupFailureCode })
    });
  }

  [INSPECT_SYMBOL](): ReturnType<PortfolioWorkspaceExecutableHttpHostStartupError["toJSON"]> {
    return this.toJSON();
  }
}

export type PortfolioWorkspaceExecutableHttpHostShutdownFailureReason =
  | "http-server-stop-failed"
  | "api-host-disposal-failed";

export class PortfolioWorkspaceExecutableHttpHostShutdownError extends Error {
  readonly code = "PORTFOLIO_WORKSPACE_EXECUTABLE_HTTP_HOST_SHUTDOWN_FAILED";
  readonly reason: PortfolioWorkspaceExecutableHttpHostShutdownFailureReason;
  readonly shutdownFailureName: string | undefined;
  readonly shutdownFailureCode: string | undefined;

  constructor(input: {
    readonly reason: PortfolioWorkspaceExecutableHttpHostShutdownFailureReason;
    readonly shutdownFailure?: unknown;
  }) {
    super("Portfolio Workspace executable HTTP host shutdown failed.");
    this.name = "PortfolioWorkspaceExecutableHttpHostShutdownError";
    this.reason = input.reason;
    this.shutdownFailureName = safeFailureName(input.shutdownFailure);
    this.shutdownFailureCode = safeFailureCode(input.shutdownFailure);
    Object.freeze(this);
  }

  toJSON(): {
    readonly name: "PortfolioWorkspaceExecutableHttpHostShutdownError";
    readonly code: "PORTFOLIO_WORKSPACE_EXECUTABLE_HTTP_HOST_SHUTDOWN_FAILED";
    readonly reason: PortfolioWorkspaceExecutableHttpHostShutdownFailureReason;
    readonly shutdownFailureName?: string;
    readonly shutdownFailureCode?: string;
  } {
    return Object.freeze({
      name: "PortfolioWorkspaceExecutableHttpHostShutdownError",
      code: this.code,
      reason: this.reason,
      ...(this.shutdownFailureName === undefined ? {} : { shutdownFailureName: this.shutdownFailureName }),
      ...(this.shutdownFailureCode === undefined ? {} : { shutdownFailureCode: this.shutdownFailureCode })
    });
  }

  [INSPECT_SYMBOL](): ReturnType<PortfolioWorkspaceExecutableHttpHostShutdownError["toJSON"]> {
    return this.toJSON();
  }
}

export interface PortfolioWorkspaceExecutableHttpHostStatusJSON {
  readonly live: boolean;
  readonly ready: boolean;
  readonly disposed: boolean;
  readonly http: NodeHttpApiServerStatusJSON;
  readonly api: PortfolioWorkspaceApiHostStatusJSON;
}

export class PortfolioWorkspaceExecutableHttpHostStatus {
  readonly live: boolean;
  readonly ready: boolean;
  readonly disposed: boolean;
  readonly http: NodeHttpApiServerStatusJSON;
  readonly api: PortfolioWorkspaceApiHostStatusJSON;

  constructor(input: PortfolioWorkspaceExecutableHttpHostStatusJSON) {
    this.live = input.live;
    this.ready = input.ready;
    this.disposed = input.disposed;
    this.http = Object.freeze({ ...input.http });
    this.api = Object.freeze({ ...input.api });
    Object.freeze(this);
  }

  toJSON(): PortfolioWorkspaceExecutableHttpHostStatusJSON {
    return Object.freeze({
      live: this.live,
      ready: this.ready,
      disposed: this.disposed,
      http: this.http,
      api: this.api
    });
  }

  [INSPECT_SYMBOL](): PortfolioWorkspaceExecutableHttpHostStatusJSON {
    return this.toJSON();
  }
}

export interface PortfolioWorkspaceExecutableHttpHostInput {
  readonly apiHostEnvironment: PortfolioWorkspaceApiHostEnvironmentInput;
  readonly listen: NodeHttpApiServerListenOptions;
  readonly trustedPrincipalResolver: PortfolioWorkspaceTrustedPrincipalResolver;
}

export type PortfolioWorkspaceExecutableHttpHostStartupFailure =
  | PortfolioWorkspaceExecutableHttpHostStartupError;

export class PortfolioWorkspaceExecutableHttpHost {
  readonly #apiHost: PortfolioWorkspaceApiHost;
  readonly #httpServer: NodeHttpApiServer;
  #disposed = false;
  #disposalPromise: Promise<void> | undefined;

  constructor(input: {
    readonly apiHost: PortfolioWorkspaceApiHost;
    readonly httpServer: NodeHttpApiServer;
  }) {
    this.#apiHost = input.apiHost;
    this.#httpServer = input.httpServer;
    Object.freeze(this);
  }

  isLive(): boolean {
    return !this.#disposed && this.#httpServer.isListening() && this.#apiHost.isLive();
  }

  isReady(): boolean {
    return !this.#disposed && this.#httpServer.isListening() && this.#apiHost.isReady();
  }

  port(): number | undefined {
    return this.#httpServer.status().port;
  }

  status(): PortfolioWorkspaceExecutableHttpHostStatus {
    return new PortfolioWorkspaceExecutableHttpHostStatus({
      live: this.isLive(),
      ready: this.isReady(),
      disposed: this.#disposed,
      http: this.#httpServer.status().toJSON(),
      api: this.#apiHost.status().toJSON()
    });
  }

  async dispose(): Promise<void> {
    if (this.#disposed) {
      return;
    }

    if (this.#disposalPromise !== undefined) {
      return this.#disposalPromise;
    }

    this.#disposalPromise = this.#disposeOnce();
    return this.#disposalPromise;
  }

  toJSON(): PortfolioWorkspaceExecutableHttpHostStatusJSON {
    return this.status().toJSON();
  }

  [INSPECT_SYMBOL](): PortfolioWorkspaceExecutableHttpHostStatusJSON {
    return this.toJSON();
  }

  async #disposeOnce(): Promise<void> {
    try {
      await this.#httpServer.stop();
    } catch (error) {
      throw new PortfolioWorkspaceExecutableHttpHostShutdownError({
        reason: "http-server-stop-failed",
        shutdownFailure: error
      });
    }

    try {
      await this.#apiHost.dispose();
    } catch (error) {
      throw new PortfolioWorkspaceExecutableHttpHostShutdownError({
        reason: "api-host-disposal-failed",
        shutdownFailure: error
      });
    }

    this.#disposed = true;
  }
}

export async function createPortfolioWorkspaceExecutableHttpHost(
  input: PortfolioWorkspaceExecutableHttpHostInput
): Promise<Result<PortfolioWorkspaceExecutableHttpHost, PortfolioWorkspaceExecutableHttpHostStartupFailure>> {
  return createPortfolioWorkspaceExecutableHttpHostWithDependencies(input, {
    createApiHost: createPortfolioWorkspaceApiHostFromEnvironment,
    createHttpServer: (handler) => new NodeHttpApiServer({ handler })
  });
}

export interface PortfolioWorkspaceExecutableHttpHostFactoryDependencies {
  readonly createApiHost: (
    input: PortfolioWorkspaceApiHostEnvironmentInput
  ) => Promise<Result<PortfolioWorkspaceApiHost, PortfolioWorkspaceApiHostConstructionFailure>>;
  readonly createHttpServer: (handler: NodeHttpRequestHandler) => NodeHttpApiServer;
}

export async function createPortfolioWorkspaceExecutableHttpHostWithDependencies(
  input: PortfolioWorkspaceExecutableHttpHostInput,
  dependencies: PortfolioWorkspaceExecutableHttpHostFactoryDependencies
): Promise<Result<PortfolioWorkspaceExecutableHttpHost, PortfolioWorkspaceExecutableHttpHostStartupFailure>> {
  const listenValidation = validateListenConfiguration(input.listen);
  if (listenValidation.isFailure) {
    return Result.failure(listenValidation.error!);
  }

  if (input.trustedPrincipalResolver === undefined) {
    return Result.failure(new PortfolioWorkspaceExecutableHttpHostStartupError({
      reason: "missing-trusted-principal-resolver"
    }));
  }

  const apiHostResult = await dependencies.createApiHost(input.apiHostEnvironment);
  if (apiHostResult.isFailure) {
    return Result.failure(new PortfolioWorkspaceExecutableHttpHostStartupError({
      reason: "api-host-construction-failed",
      startupFailure: apiHostResult.error
    }));
  }

  const apiHost = apiHostResult.value!;
  if (!apiHost.isReady()) {
    return disposeApiHostAfterStartupFailure(
      apiHost,
      new PortfolioWorkspaceExecutableHttpHostStartupError({ reason: "api-host-not-ready" })
    );
  }

  const handler = createPortfolioWorkspaceExecutableHttpHandler({
    apiHost,
    trustedPrincipalResolver: input.trustedPrincipalResolver
  });
  const httpServer = dependencies.createHttpServer(handler);

  try {
    await httpServer.start(input.listen);
  } catch (error) {
    return disposeAfterHttpStartupFailure({
      apiHost,
      httpServer,
      startupFailure: new PortfolioWorkspaceExecutableHttpHostStartupError({
        reason: "http-server-start-failed",
        startupFailure: error
      })
    });
  }

  return Result.success(new PortfolioWorkspaceExecutableHttpHost({
    apiHost,
    httpServer
  }));
}

export function createPortfolioWorkspaceExecutableHttpHandler(input: {
  readonly apiHost: PortfolioWorkspaceApiHost;
  readonly trustedPrincipalResolver: PortfolioWorkspaceTrustedPrincipalResolver;
}): NodeHttpRequestHandler {
  const getRoute = createPortfolioWorkspacePublicGetExecutionHttpRoute({
    getHandler: input.apiHost.getPortfolioExecutionHandler,
    principalResolver: input.trustedPrincipalResolver,
    correlationIdGenerator: {
      generate: () => "correlation:portfolio-workspace-http-host"
    }
  });

  return async (request) => {
    if (request.pathname === PORTFOLIO_WORKSPACE_HTTP_LIVENESS_ROUTE) {
      return healthResponse({
        request,
        status: input.apiHost.isLive() ? 200 : 503,
        body: {
          status: input.apiHost.isLive() ? "live" : "not-live"
        }
      });
    }

    if (request.pathname === PORTFOLIO_WORKSPACE_HTTP_READINESS_ROUTE) {
      return healthResponse({
        request,
        status: input.apiHost.isReady() ? 200 : 503,
        body: {
          status: input.apiHost.isReady() ? "ready" : "not-ready"
        }
      });
    }

    return getRoute(request);
  };
}

function healthResponse(input: {
  readonly request: NodeHttpRequest;
  readonly status: number;
  readonly body: NodeHttpJsonValue;
}): NodeHttpResponse {
  if (input.request.method !== "GET") {
    return Object.freeze({
      status: 405,
      headers: Object.freeze({
        allow: "GET"
      }),
      body: Object.freeze({
        status: "method-not-allowed"
      })
    });
  }

  return Object.freeze({
    status: input.status,
    body: input.body
  });
}

function validateListenConfiguration(
  listen: NodeHttpApiServerListenOptions
): Result<void, PortfolioWorkspaceExecutableHttpHostStartupError> {
  if (!Number.isInteger(listen.port) || listen.port < 0 || listen.port > 65535) {
    return Result.failure(new PortfolioWorkspaceExecutableHttpHostStartupError({
      reason: "invalid-listen-configuration",
      startupFailure: new NodeHttpApiServerConfigurationError("invalid-port")
    }));
  }

  if (listen.host !== undefined && (listen.host.trim().length === 0 || listen.host.length > 255)) {
    return Result.failure(new PortfolioWorkspaceExecutableHttpHostStartupError({
      reason: "invalid-listen-configuration",
      startupFailure: new NodeHttpApiServerConfigurationError("invalid-host")
    }));
  }

  return Result.success(undefined);
}

async function disposeApiHostAfterStartupFailure(
  apiHost: PortfolioWorkspaceApiHost,
  startupFailure: PortfolioWorkspaceExecutableHttpHostStartupError
): Promise<Result<never, PortfolioWorkspaceExecutableHttpHostStartupError>> {
  try {
    await apiHost.dispose();
  } catch {
    return Result.failure(new PortfolioWorkspaceExecutableHttpHostStartupError({
      reason: "startup-cleanup-failed",
      startupFailure
    }));
  }

  return Result.failure(startupFailure);
}

async function disposeAfterHttpStartupFailure(input: {
  readonly apiHost: PortfolioWorkspaceApiHost;
  readonly httpServer: NodeHttpApiServer;
  readonly startupFailure: PortfolioWorkspaceExecutableHttpHostStartupError;
}): Promise<Result<never, PortfolioWorkspaceExecutableHttpHostStartupError>> {
  try {
    await input.httpServer.stop().catch(() => undefined);
    await input.apiHost.dispose();
  } catch {
    return Result.failure(new PortfolioWorkspaceExecutableHttpHostStartupError({
      reason: "startup-cleanup-failed",
      startupFailure: input.startupFailure
    }));
  }

  return Result.failure(input.startupFailure);
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
