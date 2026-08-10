import { Result } from "@career-companion/kernel";
import {
  createInvalidRequestPresentationError,
  mapPortfolioWorkspaceFailureToPresentationError,
  normalizePortfolioWorkspaceCorrelationId,
  type PortfolioWorkspaceCorrelationIdGenerator,
  type PortfolioWorkspacePresentationError
} from "../presentation";
import {
  internalErrorResponse,
  readInternalCorrelationHeader,
  type PortfolioWorkspaceInternalRequest,
  type PortfolioWorkspaceInternalResponse
} from "./internal-transport";
import { mapPortfolioWorkspacePresentationErrorToInternalStatus } from "./status-mapping";

const FALLBACK_CORRELATION_ID = "correlation:portfolio-workspace-unavailable";

export interface PortfolioWorkspaceInternalHandlerDependencies {
  readonly correlationIdGenerator: PortfolioWorkspaceCorrelationIdGenerator;
}

export function hostCorrelation(input: {
  readonly request: PortfolioWorkspaceInternalRequest;
  readonly generator: PortfolioWorkspaceCorrelationIdGenerator;
}): string {
  const result = normalizePortfolioWorkspaceCorrelationId({
    incomingCorrelationId: readInternalCorrelationHeader(input.request),
    generator: input.generator
  });

  if (result.isSuccess && result.value !== undefined) {
    return result.value;
  }

  return FALLBACK_CORRELATION_ID;
}

export function parseBodyObject(input: {
  readonly body: unknown;
  readonly correlationId: string;
  readonly field: string;
}): Result<Record<string, unknown>, PortfolioWorkspacePresentationError> {
  if (input.body === null || typeof input.body !== "object" || Array.isArray(input.body)) {
    return Result.failure(createInvalidRequestPresentationError({
      correlationId: input.correlationId,
      issues: [{
        field: input.field,
        code: "invalid-request",
        message: "Request body must be an object."
      }]
    }));
  }

  return Result.success(input.body as Record<string, unknown>);
}

export function presentationErrorResponse(
  error: PortfolioWorkspacePresentationError
): PortfolioWorkspaceInternalResponse {
  return internalErrorResponse({
    status: mapPortfolioWorkspacePresentationErrorToInternalStatus(error),
    error
  });
}

export function failureResponse(input: {
  readonly failure: unknown;
  readonly correlationId: string;
}): PortfolioWorkspaceInternalResponse {
  return presentationErrorResponse(mapPortfolioWorkspaceFailureToPresentationError(
    input.failure,
    input.correlationId
  ));
}
