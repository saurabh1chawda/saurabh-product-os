import { Result } from "@career-companion/kernel";

import type {
  NodeHttpHeaders,
  NodeHttpJsonValue,
  NodeHttpRequest,
  NodeHttpRequestHandler,
  NodeHttpResponse
} from "../../http";
import {
  PORTFOLIO_WORKSPACE_CORRELATION_HEADER,
  type GetPortfolioExecutionInternalHandler
} from "../internal";
import {
  createInvalidRequestPresentationError,
  createUnauthenticatedPresentationError,
  normalizePortfolioWorkspaceCorrelationId,
  PortfolioWorkspacePresentationError,
  PortfolioWorkspacePresentationErrorCategory,
  PortfolioWorkspacePresentationErrorCode,
  type PortfolioWorkspaceCorrelationIdGenerator,
  type PortfolioWorkspacePresentationPrincipal
} from "../presentation";

export const PORTFOLIO_WORKSPACE_PUBLIC_GET_EXECUTION_ROUTE = "/v1/portfolio-workspace/executions/:executionId";

export interface PortfolioWorkspaceTrustedPrincipalResolutionRequest {
  readonly request: NodeHttpRequest;
  readonly correlationId: string;
}

export interface PortfolioWorkspaceTrustedPrincipalResolver {
  resolve(
    request: PortfolioWorkspaceTrustedPrincipalResolutionRequest
  ): Result<PortfolioWorkspacePresentationPrincipal, PortfolioWorkspacePresentationError>
    | Promise<Result<PortfolioWorkspacePresentationPrincipal, PortfolioWorkspacePresentationError>>;
}

export interface PortfolioWorkspacePublicGetExecutionHttpRouteInput {
  readonly getHandler: GetPortfolioExecutionInternalHandler;
  readonly principalResolver: PortfolioWorkspaceTrustedPrincipalResolver;
  readonly correlationIdGenerator: PortfolioWorkspaceCorrelationIdGenerator;
}

export function createPortfolioWorkspacePublicGetExecutionHttpRoute(
  input: PortfolioWorkspacePublicGetExecutionHttpRouteInput
): NodeHttpRequestHandler {
  return async (request) => {
    const correlationId = routeCorrelation({
      request,
      generator: input.correlationIdGenerator
    });
    const match = matchGetExecutionRoute(request.pathname);

    if (match.kind === "not-found") {
      return routeErrorResponse({
        status: 404,
        error: createInvalidRequestPresentationError({
          correlationId,
          issues: [{
            field: "path",
            code: "invalid-request",
            message: "Route was not found."
          }]
        })
      });
    }

    if (request.method !== "GET") {
      return routeErrorResponse({
        status: 405,
        error: createInvalidRequestPresentationError({
          correlationId,
          issues: [{
            field: "method",
            code: "invalid-request",
            message: "Method is not allowed for this route."
          }]
        }),
        headers: {
          allow: "GET"
        }
      });
    }

    if (match.kind === "invalid") {
      return routeErrorResponse({
        status: 400,
        error: createInvalidRequestPresentationError({
          correlationId,
          issues: [{
            field: "executionId",
            code: "invalid-request",
            message: "Execution ID path parameter is required."
          }]
        })
      });
    }

    const principalResult = await input.principalResolver.resolve({
      request,
      correlationId
    });
    if (principalResult.isFailure) {
      return routeErrorResponse({
        status: 401,
        error: principalResult.error ?? createUnauthenticatedPresentationError(correlationId)
      });
    }

    try {
      const internalResponse = await input.getHandler.handle({
        principal: principalResult.value!,
        request: {
          headers: {
            [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: correlationId
          },
          pathParameters: {
            executionId: match.executionId
          }
        }
      });

      return {
        status: internalResponse.status,
        headers: {
          [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: internalResponse.headers[PORTFOLIO_WORKSPACE_CORRELATION_HEADER]
        },
        body: internalResponse.body as NodeHttpJsonValue
      };
    } catch {
      return routeErrorResponse({
        status: 500,
        error: new PortfolioWorkspacePresentationError({
          category: PortfolioWorkspacePresentationErrorCategory.Internal,
          code: PortfolioWorkspacePresentationErrorCode.PortfolioWorkspaceInternalError,
          message: "Portfolio Workspace could not complete the operation.",
          correlationId,
        })
      });
    }
  };
}

type RouteMatch =
  | { readonly kind: "matched"; readonly executionId: string }
  | { readonly kind: "invalid" }
  | { readonly kind: "not-found" };

function matchGetExecutionRoute(pathname: string): RouteMatch {
  const segments = pathname.split("/");

  if (
    segments.length < 5
    || segments[0] !== ""
    || segments[1] !== "v1"
    || segments[2] !== "portfolio-workspace"
    || segments[3] !== "executions"
  ) {
    return { kind: "not-found" };
  }

  if (segments.length > 5) {
    return { kind: "not-found" };
  }

  if (segments[4] === undefined || segments[4].length === 0) {
    return { kind: "invalid" };
  }

  let executionId: string;
  try {
    executionId = decodeURIComponent(segments[4]);
  } catch {
    return { kind: "invalid" };
  }

  if (executionId.trim().length === 0) {
    return { kind: "invalid" };
  }

  return {
    kind: "matched",
    executionId
  };
}

function routeCorrelation(input: {
  readonly request: NodeHttpRequest;
  readonly generator: PortfolioWorkspaceCorrelationIdGenerator;
}): string {
  const result = normalizePortfolioWorkspaceCorrelationId({
    incomingCorrelationId: singleHeader(input.request.headers, PORTFOLIO_WORKSPACE_CORRELATION_HEADER),
    generator: input.generator
  });

  if (result.isSuccess && result.value !== undefined) {
    return result.value;
  }

  return "correlation:portfolio-workspace-http-route";
}

function routeErrorResponse(input: {
  readonly status: number;
  readonly error: PortfolioWorkspacePresentationError;
  readonly headers?: NodeHttpHeaders;
}): NodeHttpResponse {
  return Object.freeze({
    status: input.status,
    headers: Object.freeze({
      [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: input.error.correlationId,
      ...(input.headers ?? {})
    }),
    body: input.error.toJSON() as unknown as NodeHttpJsonValue
  });
}

function singleHeader(headers: NodeHttpHeaders, name: string): string | undefined {
  const value = headers[name.toLowerCase()];

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0];
  }

  return undefined;
}
