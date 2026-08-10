import type {
  PortfolioWorkspacePresentationError,
  PortfolioWorkspacePresentationErrorJson
} from "../presentation";

export const PORTFOLIO_WORKSPACE_CORRELATION_HEADER = "x-correlation-id";

export type PortfolioWorkspaceInternalHeaders = Readonly<Record<string, string | undefined>>;

export interface PortfolioWorkspaceInternalRequest {
  readonly pathParameters?: Readonly<Record<string, string | undefined>>;
  readonly headers?: PortfolioWorkspaceInternalHeaders;
  readonly body?: unknown;
}

export interface PortfolioWorkspaceInternalResponse<TBody = unknown> {
  readonly status: number;
  readonly body: TBody;
  readonly headers: Readonly<Record<typeof PORTFOLIO_WORKSPACE_CORRELATION_HEADER, string>>;
}

export type PortfolioWorkspaceInternalErrorResponse =
  PortfolioWorkspaceInternalResponse<PortfolioWorkspacePresentationErrorJson>;

export function internalSuccessResponse<TBody extends { readonly correlationId?: string }>(input: {
  readonly status: number;
  readonly body: TBody;
  readonly correlationId: string;
}): PortfolioWorkspaceInternalResponse<TBody> {
  return Object.freeze({
    status: input.status,
    body: input.body,
    headers: Object.freeze({
      [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: input.correlationId
    })
  });
}

export function internalErrorResponse(input: {
  readonly status: number;
  readonly error: PortfolioWorkspacePresentationError;
}): PortfolioWorkspaceInternalErrorResponse {
  return Object.freeze({
    status: input.status,
    body: input.error.toJSON(),
    headers: Object.freeze({
      [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: input.error.correlationId
    })
  });
}

export function readInternalCorrelationHeader(
  request: PortfolioWorkspaceInternalRequest
): string | undefined {
  const headers = request.headers ?? {};
  return headers[PORTFOLIO_WORKSPACE_CORRELATION_HEADER]
    ?? headers[PORTFOLIO_WORKSPACE_CORRELATION_HEADER.toUpperCase()]
    ?? headers["X-Correlation-Id"];
}
