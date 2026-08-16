import { Result } from "@career-companion/kernel";

import {
  PortfolioWorkspaceAuthenticationError,
  PortfolioWorkspaceAuthenticationFailureReason,
  PortfolioWorkspaceBearerTokenCredential,
  authenticatePortfolioWorkspacePrincipal,
  type PortfolioWorkspaceAuthenticationAdapter
} from "../authentication";
import {
  PortfolioWorkspacePresentationError,
  PortfolioWorkspacePresentationErrorCategory,
  PortfolioWorkspacePresentationErrorCode,
  normalizePortfolioWorkspaceCorrelationId,
  type PortfolioWorkspaceCorrelationIdGenerator,
  type PortfolioWorkspacePresentationErrorJson,
  type PortfolioWorkspacePresentationPrincipal,
  type PortfolioWorkspacePresentationPrincipalJson
} from "../presentation";

const INSPECT_SYMBOL = Symbol.for("nodejs.util.inspect.custom");

export const PORTFOLIO_WORKSPACE_PUBLIC_AUTHORIZATION_HEADER = "authorization";
export const PORTFOLIO_WORKSPACE_PUBLIC_CORRELATION_HEADER = "x-correlation-id";
export const PORTFOLIO_WORKSPACE_WWW_AUTHENTICATE_HEADER = "www-authenticate";
export const PORTFOLIO_WORKSPACE_BEARER_CHALLENGE = "Bearer";
export const PORTFOLIO_WORKSPACE_AUTHORIZATION_HEADER_MAX_LENGTH = 8_192;
const PORTFOLIO_WORKSPACE_BEARER_TOKEN_MAX_LENGTH = 4_096;
const FALLBACK_CORRELATION_ID = "correlation:portfolio-workspace-public-authentication";

export type PortfolioWorkspacePublicHeaderValue = string | readonly string[] | undefined;
export type PortfolioWorkspacePublicHeaders = Readonly<Record<string, PortfolioWorkspacePublicHeaderValue>>;

export interface PortfolioWorkspacePublicAuthenticationRequest {
  readonly headers?: PortfolioWorkspacePublicHeaders;
  readonly incomingCorrelationId?: string;
}

export type PortfolioWorkspacePublicAuthenticationStatus = 401 | 500 | 503;

export interface PortfolioWorkspacePublicAuthenticationResponseHeaders {
  readonly [PORTFOLIO_WORKSPACE_PUBLIC_CORRELATION_HEADER]: string;
  readonly [PORTFOLIO_WORKSPACE_WWW_AUTHENTICATE_HEADER]?: typeof PORTFOLIO_WORKSPACE_BEARER_CHALLENGE;
}

export interface PortfolioWorkspacePublicAuthenticationSuccessJson {
  readonly correlationId: string;
  readonly principal: PortfolioWorkspacePresentationPrincipalJson;
}

export class PortfolioWorkspacePublicAuthenticationSuccess {
  readonly correlationId: string;
  readonly principal: PortfolioWorkspacePresentationPrincipal;
  readonly headers: PortfolioWorkspacePublicAuthenticationResponseHeaders;

  constructor(input: {
    readonly correlationId: string;
    readonly principal: PortfolioWorkspacePresentationPrincipal;
  }) {
    this.correlationId = input.correlationId;
    this.principal = input.principal;
    this.headers = responseHeaders(input.correlationId);

    Object.freeze(this);
  }

  toJSON(): PortfolioWorkspacePublicAuthenticationSuccessJson {
    return Object.freeze({
      correlationId: this.correlationId,
      principal: this.principal.toJSON()
    });
  }

  [INSPECT_SYMBOL](): PortfolioWorkspacePublicAuthenticationSuccessJson {
    return this.toJSON();
  }
}

export interface PortfolioWorkspacePublicAuthenticationFailureJson {
  readonly status: PortfolioWorkspacePublicAuthenticationStatus;
  readonly error: PortfolioWorkspacePresentationErrorJson;
  readonly headers: PortfolioWorkspacePublicAuthenticationResponseHeaders;
}

export class PortfolioWorkspacePublicAuthenticationFailure {
  readonly status: PortfolioWorkspacePublicAuthenticationStatus;
  readonly error: PortfolioWorkspacePresentationError;
  readonly headers: PortfolioWorkspacePublicAuthenticationResponseHeaders;

  constructor(input: {
    readonly status: PortfolioWorkspacePublicAuthenticationStatus;
    readonly error: PortfolioWorkspacePresentationError;
    readonly headers: PortfolioWorkspacePublicAuthenticationResponseHeaders;
  }) {
    this.status = input.status;
    this.error = input.error;
    this.headers = input.headers;

    Object.freeze(this);
  }

  toJSON(): PortfolioWorkspacePublicAuthenticationFailureJson {
    return Object.freeze({
      status: this.status,
      error: this.error.toJSON(),
      headers: this.headers
    });
  }

  [INSPECT_SYMBOL](): PortfolioWorkspacePublicAuthenticationFailureJson {
    return this.toJSON();
  }
}

export class PortfolioWorkspacePublicAuthenticationBoundary {
  readonly #adapter: PortfolioWorkspaceAuthenticationAdapter;
  readonly #correlationIdGenerator: PortfolioWorkspaceCorrelationIdGenerator;

  constructor(input: {
    readonly adapter: PortfolioWorkspaceAuthenticationAdapter;
    readonly correlationIdGenerator: PortfolioWorkspaceCorrelationIdGenerator;
  }) {
    this.#adapter = input.adapter;
    this.#correlationIdGenerator = input.correlationIdGenerator;

    Object.freeze(this);
  }

  async authenticate(
    request: PortfolioWorkspacePublicAuthenticationRequest
  ): Promise<Result<PortfolioWorkspacePublicAuthenticationSuccess, PortfolioWorkspacePublicAuthenticationFailure>> {
    const correlationId = publicCorrelationId({
      request,
      generator: this.#correlationIdGenerator
    });
    const credential = extractPortfolioWorkspacePublicBearerCredential(request);

    if (credential.isFailure) {
      return Result.failure(publicAuthenticationFailure({
        error: credential.error!,
        correlationId
      }));
    }

    const principal = await authenticatePortfolioWorkspacePrincipal({
      adapter: this.#adapter,
      context: {
        credential: credential.value!
      }
    });

    if (principal.isFailure) {
      return Result.failure(publicAuthenticationFailure({
        error: principal.error!,
        correlationId
      }));
    }

    return Result.success(new PortfolioWorkspacePublicAuthenticationSuccess({
      correlationId,
      principal: principal.value!
    }));
  }
}

export function extractPortfolioWorkspacePublicBearerCredential(
  request: PortfolioWorkspacePublicAuthenticationRequest
): Result<PortfolioWorkspaceBearerTokenCredential, PortfolioWorkspaceAuthenticationError> {
  const header = readSingleAuthorizationHeader(request.headers ?? {});

  if (header === undefined) {
    return Result.failure(PortfolioWorkspaceAuthenticationError.authenticationRequired());
  }

  if (header === false || !isStructurallyValidAuthorizationHeader(header)) {
    return Result.failure(PortfolioWorkspaceAuthenticationError.credentialMalformed());
  }

  const token = header.slice("Bearer ".length);
  return PortfolioWorkspaceBearerTokenCredential.create({
    bearerToken: token
  });
}

export function publicCorrelationId(input: {
  readonly request: PortfolioWorkspacePublicAuthenticationRequest;
  readonly generator: PortfolioWorkspaceCorrelationIdGenerator;
}): string {
  const correlation = normalizePortfolioWorkspaceCorrelationId({
    incomingCorrelationId: input.request.incomingCorrelationId ?? readSingleCorrelationHeader(input.request.headers ?? {}),
    generator: input.generator
  });

  if (correlation.isSuccess) {
    return correlation.value!;
  }

  return FALLBACK_CORRELATION_ID;
}

export function mapPortfolioWorkspaceAuthenticationErrorToPublicFailure(input: {
  readonly error: PortfolioWorkspaceAuthenticationError;
  readonly correlationId: string;
}): PortfolioWorkspacePublicAuthenticationFailure {
  return publicAuthenticationFailure(input);
}

function publicAuthenticationFailure(input: {
  readonly error: PortfolioWorkspaceAuthenticationError;
  readonly correlationId: string;
}): PortfolioWorkspacePublicAuthenticationFailure {
  const status = publicAuthenticationStatus(input.error);
  const error = publicAuthenticationPresentationError({
    error: input.error,
    status,
    correlationId: input.correlationId
  });

  return new PortfolioWorkspacePublicAuthenticationFailure({
    status,
    error,
    headers: responseHeaders(input.correlationId, status === 401)
  });
}

function publicAuthenticationStatus(
  error: PortfolioWorkspaceAuthenticationError
): PortfolioWorkspacePublicAuthenticationStatus {
  if (
    error.reason === PortfolioWorkspaceAuthenticationFailureReason.AuthenticationUnavailable
    || error.reason === PortfolioWorkspaceAuthenticationFailureReason.VerifierUnavailable
  ) {
    return 503;
  }

  if (error.reason === PortfolioWorkspaceAuthenticationFailureReason.InvalidAuthenticationConfiguration) {
    return 500;
  }

  return 401;
}

function publicAuthenticationPresentationError(input: {
  readonly error: PortfolioWorkspaceAuthenticationError;
  readonly status: PortfolioWorkspacePublicAuthenticationStatus;
  readonly correlationId: string;
}): PortfolioWorkspacePresentationError {
  if (input.status === 503) {
    return new PortfolioWorkspacePresentationError({
      category: PortfolioWorkspacePresentationErrorCategory.Unavailable,
      code: PortfolioWorkspacePresentationErrorCode.PortfolioWorkspaceUnavailable,
      message: "Portfolio Workspace authentication is temporarily unavailable.",
      correlationId: input.correlationId,
      retryable: true
    });
  }

  if (input.status === 500) {
    return new PortfolioWorkspacePresentationError({
      category: PortfolioWorkspacePresentationErrorCategory.Internal,
      code: PortfolioWorkspacePresentationErrorCode.PortfolioWorkspaceInternalError,
      message: "Portfolio Workspace authentication could not be completed.",
      correlationId: input.correlationId
    });
  }

  void input.error;

  return new PortfolioWorkspacePresentationError({
    category: PortfolioWorkspacePresentationErrorCategory.Unauthenticated,
    code: PortfolioWorkspacePresentationErrorCode.Unauthenticated,
    message: "Authentication is required.",
    correlationId: input.correlationId
  });
}

function responseHeaders(
  correlationId: string,
  includeBearerChallenge = false
): PortfolioWorkspacePublicAuthenticationResponseHeaders {
  return Object.freeze({
    [PORTFOLIO_WORKSPACE_PUBLIC_CORRELATION_HEADER]: correlationId,
    ...(includeBearerChallenge
      ? { [PORTFOLIO_WORKSPACE_WWW_AUTHENTICATE_HEADER]: PORTFOLIO_WORKSPACE_BEARER_CHALLENGE }
      : {})
  });
}

function readSingleAuthorizationHeader(
  headers: PortfolioWorkspacePublicHeaders
): string | undefined | false {
  return readSingleHeader(headers, PORTFOLIO_WORKSPACE_PUBLIC_AUTHORIZATION_HEADER);
}

function readSingleCorrelationHeader(
  headers: PortfolioWorkspacePublicHeaders
): string | undefined {
  const header = readSingleHeader(headers, PORTFOLIO_WORKSPACE_PUBLIC_CORRELATION_HEADER);
  return typeof header === "string" ? header : undefined;
}

function readSingleHeader(
  headers: PortfolioWorkspacePublicHeaders,
  headerName: string
): string | undefined | false {
  const matches = Object.entries(headers)
    .filter(([name]) => name.toLowerCase() === headerName);

  if (matches.length === 0) {
    return undefined;
  }

  if (matches.length !== 1) {
    return false;
  }

  const value = matches[0]![1];
  if (Array.isArray(value)) {
    return value.length === 1 ? value[0] ?? false : false;
  }

  return typeof value === "string" ? value : undefined;
}

function isStructurallyValidAuthorizationHeader(value: string): boolean {
  if (
    value.length === 0
    || value.length > PORTFOLIO_WORKSPACE_AUTHORIZATION_HEADER_MAX_LENGTH
    || containsControlCharacters(value)
    || value.includes(",")
  ) {
    return false;
  }

  const trimmed = value.trim();
  if (trimmed.length !== value.length) {
    return false;
  }

  const separatorIndex = value.indexOf(" ");
  if (separatorIndex <= 0 || separatorIndex !== value.lastIndexOf(" ")) {
    return false;
  }

  const scheme = value.slice(0, separatorIndex);
  const token = value.slice(separatorIndex + 1);

  return scheme.toLowerCase() === "bearer"
    && token.length > 0
    && token.length <= PORTFOLIO_WORKSPACE_BEARER_TOKEN_MAX_LENGTH
    && !/\s/u.test(token);
}

function containsControlCharacters(value: string): boolean {
  return /[\u0000-\u001F\u007F]/u.test(value);
}
