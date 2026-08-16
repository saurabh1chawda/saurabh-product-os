import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";

const INSPECT_SYMBOL = Symbol.for("nodejs.util.inspect.custom");
const DEFAULT_MAX_HEADER_VALUE_LENGTH = 8192;
const DEFAULT_INTERNAL_ERROR_BODY = Object.freeze({
  error: Object.freeze({
    code: "internal-error",
    message: "Internal server error."
  })
});

export const NodeHttpApiServerLifecycle = Object.freeze({
  Created: "created",
  Starting: "starting",
  Listening: "listening",
  Stopping: "stopping",
  Stopped: "stopped",
  Failed: "failed"
} as const);

export type NodeHttpApiServerLifecycleValue =
  typeof NodeHttpApiServerLifecycle[keyof typeof NodeHttpApiServerLifecycle];

export type NodeHttpHeaderValue = string | readonly string[];

export type NodeHttpHeaders = Readonly<Record<string, NodeHttpHeaderValue>>;

export type NodeHttpJsonPrimitive = string | number | boolean | null;
export type NodeHttpJsonValue =
  | NodeHttpJsonPrimitive
  | readonly NodeHttpJsonValue[]
  | { readonly [key: string]: NodeHttpJsonValue };

export interface NodeHttpRequest {
  readonly method: string;
  readonly pathname: string;
  readonly search: string;
  readonly headers: NodeHttpHeaders;
}

export interface NodeHttpResponse {
  readonly status: number;
  readonly headers?: NodeHttpHeaders;
  readonly body?: NodeHttpJsonValue;
}

export type NodeHttpRequestHandler = (
  request: NodeHttpRequest
) => NodeHttpResponse | Promise<NodeHttpResponse>;

export interface NodeHttpApiServerListenOptions {
  readonly port: number;
  readonly host?: string;
}

export interface NodeHttpApiServerStatusJSON {
  readonly lifecycle: NodeHttpApiServerLifecycleValue;
  readonly listening: boolean;
  readonly host?: string;
  readonly port?: number;
}

export class NodeHttpApiServerStatus {
  readonly lifecycle: NodeHttpApiServerLifecycleValue;
  readonly listening: boolean;
  readonly host: string | undefined;
  readonly port: number | undefined;

  constructor(input: NodeHttpApiServerStatusJSON) {
    this.lifecycle = input.lifecycle;
    this.listening = input.listening;
    this.host = input.host;
    this.port = input.port;
    Object.freeze(this);
  }

  toJSON(): NodeHttpApiServerStatusJSON {
    return Object.freeze({
      lifecycle: this.lifecycle,
      listening: this.listening,
      ...(this.host === undefined ? {} : { host: this.host }),
      ...(this.port === undefined ? {} : { port: this.port })
    });
  }

  [INSPECT_SYMBOL](): NodeHttpApiServerStatusJSON {
    return this.toJSON();
  }
}

export type NodeHttpApiServerConfigurationErrorReason =
  | "invalid-port"
  | "invalid-host"
  | "server-already-started"
  | "server-start-failed";

export class NodeHttpApiServerConfigurationError extends Error {
  readonly code = "NODE_HTTP_API_SERVER_CONFIGURATION_ERROR";
  readonly reason: NodeHttpApiServerConfigurationErrorReason;

  constructor(reason: NodeHttpApiServerConfigurationErrorReason) {
    super("Node HTTP API server configuration is invalid.");
    this.name = "NodeHttpApiServerConfigurationError";
    this.reason = reason;
    Object.freeze(this);
  }

  toJSON(): {
    readonly name: "NodeHttpApiServerConfigurationError";
    readonly code: "NODE_HTTP_API_SERVER_CONFIGURATION_ERROR";
    readonly reason: NodeHttpApiServerConfigurationErrorReason;
  } {
    return Object.freeze({
      name: "NodeHttpApiServerConfigurationError",
      code: this.code,
      reason: this.reason
    });
  }

  [INSPECT_SYMBOL](): ReturnType<NodeHttpApiServerConfigurationError["toJSON"]> {
    return this.toJSON();
  }
}

export class NodeHttpApiServer {
  readonly #handler: NodeHttpRequestHandler;
  readonly #maxHeaderValueLength: number;
  readonly #server: Server;
  #lifecycle: NodeHttpApiServerLifecycleValue = NodeHttpApiServerLifecycle.Created;
  #startPromise: Promise<NodeHttpApiServerStatus> | undefined;
  #stopPromise: Promise<void> | undefined;

  constructor(input: {
    readonly handler: NodeHttpRequestHandler;
    readonly maxHeaderValueLength?: number;
  }) {
    this.#handler = input.handler;
    this.#maxHeaderValueLength = input.maxHeaderValueLength ?? DEFAULT_MAX_HEADER_VALUE_LENGTH;
    this.#server = createServer((request, response) => {
      void this.#handleRequest(request, response);
    });
    Object.freeze(this);
  }

  async start(options: NodeHttpApiServerListenOptions): Promise<NodeHttpApiServerStatus> {
    validateListenOptions(options);

    if (this.#lifecycle === NodeHttpApiServerLifecycle.Listening) {
      return this.status();
    }

    if (this.#lifecycle === NodeHttpApiServerLifecycle.Starting && this.#startPromise !== undefined) {
      return this.#startPromise;
    }

    if (
      this.#lifecycle !== NodeHttpApiServerLifecycle.Created
      && this.#lifecycle !== NodeHttpApiServerLifecycle.Stopped
    ) {
      throw new NodeHttpApiServerConfigurationError("server-already-started");
    }

    this.#lifecycle = NodeHttpApiServerLifecycle.Starting;
    this.#startPromise = new Promise<NodeHttpApiServerStatus>((resolve, reject) => {
      const onError = () => {
        this.#lifecycle = NodeHttpApiServerLifecycle.Failed;
        this.#server.off("listening", onListening);
        reject(new NodeHttpApiServerConfigurationError("server-start-failed"));
      };
      const onListening = () => {
        this.#server.off("error", onError);
        this.#lifecycle = NodeHttpApiServerLifecycle.Listening;
        resolve(this.status());
      };

      this.#server.once("error", onError);
      this.#server.once("listening", onListening);
      this.#server.listen(options.port, options.host);
    });

    return this.#startPromise;
  }

  async stop(): Promise<void> {
    if (
      this.#lifecycle === NodeHttpApiServerLifecycle.Created
      || this.#lifecycle === NodeHttpApiServerLifecycle.Stopped
    ) {
      this.#lifecycle = NodeHttpApiServerLifecycle.Stopped;
      return;
    }

    if (this.#stopPromise !== undefined) {
      return this.#stopPromise;
    }

    this.#lifecycle = NodeHttpApiServerLifecycle.Stopping;
    this.#stopPromise = new Promise<void>((resolve, reject) => {
      this.#server.close((error) => {
        if (error !== undefined) {
          this.#lifecycle = NodeHttpApiServerLifecycle.Failed;
          reject(error);
          return;
        }

        this.#lifecycle = NodeHttpApiServerLifecycle.Stopped;
        resolve();
      });
    });

    return this.#stopPromise;
  }

  isListening(): boolean {
    return this.#lifecycle === NodeHttpApiServerLifecycle.Listening;
  }

  status(): NodeHttpApiServerStatus {
    const address = this.#server.address();
    const host = typeof address === "object" && address !== null ? address.address : undefined;
    const port = typeof address === "object" && address !== null ? address.port : undefined;

    return new NodeHttpApiServerStatus({
      lifecycle: this.#lifecycle,
      listening: this.isListening(),
      ...(host === undefined ? {} : { host }),
      ...(port === undefined ? {} : { port })
    });
  }

  toJSON(): NodeHttpApiServerStatusJSON {
    return this.status().toJSON();
  }

  [INSPECT_SYMBOL](): NodeHttpApiServerStatusJSON {
    return this.toJSON();
  }

  async #handleRequest(request: IncomingMessage, response: ServerResponse): Promise<void> {
    try {
      const normalizedRequest = normalizeIncomingRequest(request, this.#maxHeaderValueLength);
      const handlerResponse = await this.#handler(normalizedRequest);
      writeNodeHttpResponse(response, handlerResponse);
    } catch (error) {
      if (error instanceof NodeHttpRequestNormalizationError) {
        writeNodeHttpResponse(response, {
          status: 400,
          body: {
            error: {
              code: "invalid-request",
              message: "Invalid request."
            }
          }
        });
        return;
      }

      writeNodeHttpResponse(response, {
        status: 500,
        body: DEFAULT_INTERNAL_ERROR_BODY
      });
    }
  }
}

class NodeHttpRequestNormalizationError extends Error {
  constructor() {
    super("Invalid HTTP request.");
    this.name = "NodeHttpRequestNormalizationError";
  }
}

function normalizeIncomingRequest(
  request: IncomingMessage,
  maxHeaderValueLength: number
): NodeHttpRequest {
  const target = request.url ?? "/";
  let url: URL;

  try {
    url = new URL(target, "http://localhost");
  } catch {
    throw new NodeHttpRequestNormalizationError();
  }

  return Object.freeze({
    method: (request.method ?? "GET").toUpperCase(),
    pathname: url.pathname,
    search: url.search,
    headers: normalizeHeaders(request.headers, maxHeaderValueLength)
  });
}

function normalizeHeaders(
  headers: IncomingMessage["headers"],
  maxHeaderValueLength: number
): NodeHttpHeaders {
  const normalized: Record<string, NodeHttpHeaderValue> = {};

  for (const [name, value] of Object.entries(headers)) {
    if (value === undefined) {
      continue;
    }

    const key = name.toLowerCase();
    const normalizedValue = Array.isArray(value)
      ? Object.freeze(value.map((item) => boundedHeaderValue(item, maxHeaderValueLength)))
      : boundedHeaderValue(value, maxHeaderValueLength);

    normalized[key] = normalizedValue;
  }

  return Object.freeze(normalized);
}

function boundedHeaderValue(value: string, maxHeaderValueLength: number): string {
  if (value.length > maxHeaderValueLength) {
    throw new NodeHttpRequestNormalizationError();
  }

  return value;
}

function writeNodeHttpResponse(
  response: ServerResponse,
  output: NodeHttpResponse
): void {
  response.statusCode = safeStatus(output.status);
  response.setHeader("content-type", "application/json; charset=utf-8");

  for (const [name, value] of Object.entries(output.headers ?? {})) {
    response.setHeader(name, Array.isArray(value) ? [...value] : value);
  }

  if (output.body === undefined) {
    response.end();
    return;
  }

  response.end(JSON.stringify(output.body));
}

function safeStatus(status: number): number {
  if (!Number.isInteger(status) || status < 100 || status > 599) {
    return 500;
  }

  return status;
}

function validateListenOptions(options: NodeHttpApiServerListenOptions): void {
  if (!Number.isInteger(options.port) || options.port < 0 || options.port > 65535) {
    throw new NodeHttpApiServerConfigurationError("invalid-port");
  }

  if (options.host !== undefined && options.host.trim().length === 0) {
    throw new NodeHttpApiServerConfigurationError("invalid-host");
  }
}
