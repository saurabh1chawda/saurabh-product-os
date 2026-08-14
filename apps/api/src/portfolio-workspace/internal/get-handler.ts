import type { PortfolioWorkspaceRuntime } from "@career-companion/infrastructure";

import {
  GetPortfolioExecutionPresentationRequest,
  createInvalidRequestPresentationError,
  createPortfolioWorkspaceUnavailablePresentationError,
  mapGetPortfolioExecutionRequestToInput,
  mapGetPortfolioExecutionResult,
  type PortfolioWorkspaceCorrelationIdGenerator,
  type PortfolioWorkspacePresentationPrincipal
} from "../presentation";
import type { PortfolioWorkspaceInternalAuthorization } from "./authorization";
import {
  failureResponse,
  hostCorrelation,
  presentationErrorResponse
} from "./handler-support";
import {
  internalSuccessResponse,
  type PortfolioWorkspaceInternalRequest,
  type PortfolioWorkspaceInternalResponse
} from "./internal-transport";

export class GetPortfolioExecutionInternalHandler {
  readonly #runtime: PortfolioWorkspaceRuntime;
  readonly #authorization: PortfolioWorkspaceInternalAuthorization;
  readonly #correlationIdGenerator: PortfolioWorkspaceCorrelationIdGenerator;

  constructor(input: {
    readonly runtime: PortfolioWorkspaceRuntime;
    readonly authorization: PortfolioWorkspaceInternalAuthorization;
    readonly correlationIdGenerator: PortfolioWorkspaceCorrelationIdGenerator;
  }) {
    this.#runtime = input.runtime;
    this.#authorization = input.authorization;
    this.#correlationIdGenerator = input.correlationIdGenerator;
    Object.freeze(this);
  }

  async handle(input: {
    readonly request: PortfolioWorkspaceInternalRequest;
    readonly principal: PortfolioWorkspacePresentationPrincipal;
  }): Promise<PortfolioWorkspaceInternalResponse> {
    const correlationId = hostCorrelation({
      request: input.request,
      generator: this.#correlationIdGenerator
    });

    if (!this.#runtime.isReady()) {
      return presentationErrorResponse(createPortfolioWorkspaceUnavailablePresentationError(correlationId));
    }

    const executionId = input.request.pathParameters?.executionId;
    if (typeof executionId !== "string") {
      return presentationErrorResponse(createInvalidRequestPresentationError({
        correlationId,
        issues: [{
          field: "executionId",
          code: "invalid-request",
          message: "Execution ID path parameter is required."
        }]
      }));
    }

    const presentationRequest = new GetPortfolioExecutionPresentationRequest({
      executionId,
      incomingCorrelationId: correlationId
    });
    const applicationInputResult = mapGetPortfolioExecutionRequestToInput(
      presentationRequest,
      correlationId
    );
    if (applicationInputResult.isFailure) {
      return presentationErrorResponse(applicationInputResult.error!);
    }

    const authorizationResult = await this.#authorization.authorizeGet({
      principal: input.principal,
      executionId: applicationInputResult.value!.executionId,
      correlationId
    });
    if (authorizationResult.isFailure) {
      return presentationErrorResponse(authorizationResult.error!);
    }

    const result = await this.#runtime.getPortfolioExecution.get(applicationInputResult.value!);
    if (result.isFailure) {
      return failureResponse({
        failure: result.error,
        correlationId
      });
    }

    const response = mapGetPortfolioExecutionResult(result.value!);
    return internalSuccessResponse({
      status: 200,
      body: response,
      correlationId
    });
  }
}
