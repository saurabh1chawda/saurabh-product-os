import type { PortfolioWorkspaceRuntime } from "@career-companion/infrastructure";

import {
  InitializePortfolioExecutionPresentationRequest,
  PortfolioWorkspaceCommandContextFactory,
  createInvalidRequestPresentationError,
  mapInitializePortfolioExecutionRequestToInput,
  mapInitializePortfolioExecutionResult,
  type PortfolioWorkspaceCorrelationIdGenerator,
  type PortfolioWorkspacePresentationPrincipal
} from "../presentation";
import type { PortfolioWorkspaceInternalAuthorization } from "./authorization";
import {
  failureResponse,
  hostCorrelation,
  parseBodyObject,
  presentationErrorResponse
} from "./handler-support";
import {
  internalSuccessResponse,
  type PortfolioWorkspaceInternalRequest,
  type PortfolioWorkspaceInternalResponse
} from "./internal-transport";
import { createPortfolioWorkspaceUnavailablePresentationError } from "../presentation";

export class InitializePortfolioExecutionInternalHandler {
  readonly #runtime: PortfolioWorkspaceRuntime;
  readonly #authorization: PortfolioWorkspaceInternalAuthorization;
  readonly #commandContextFactory: PortfolioWorkspaceCommandContextFactory;
  readonly #correlationIdGenerator: PortfolioWorkspaceCorrelationIdGenerator;

  constructor(input: {
    readonly runtime: PortfolioWorkspaceRuntime;
    readonly authorization: PortfolioWorkspaceInternalAuthorization;
    readonly commandContextFactory: PortfolioWorkspaceCommandContextFactory;
    readonly correlationIdGenerator: PortfolioWorkspaceCorrelationIdGenerator;
  }) {
    this.#runtime = input.runtime;
    this.#authorization = input.authorization;
    this.#commandContextFactory = input.commandContextFactory;
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

    const bodyResult = parseBodyObject({
      body: input.request.body,
      correlationId,
      field: "body"
    });
    if (bodyResult.isFailure) {
      return presentationErrorResponse(bodyResult.error!);
    }

    let request: InitializePortfolioExecutionPresentationRequest;
    try {
      request = new InitializePortfolioExecutionPresentationRequest({
        ...bodyResult.value!,
        incomingCorrelationId: correlationId
      } as ConstructorParameters<typeof InitializePortfolioExecutionPresentationRequest>[0]);
    } catch {
      return presentationErrorResponse(createInvalidRequestPresentationError({
        correlationId,
        issues: [{
          field: "body",
          code: "invalid-request",
          message: "Initialization request is malformed."
        }]
      }));
    }

    const authorizationResult = await this.#authorization.authorizeInitialize({
      principal: input.principal,
      request,
      correlationId
    });
    if (authorizationResult.isFailure) {
      return presentationErrorResponse(authorizationResult.error!);
    }

    const commandContextResult = this.#commandContextFactory.createCommandContext({
      principal: input.principal,
      incomingCorrelationId: correlationId
    });
    if (commandContextResult.isFailure) {
      return failureResponse({
        failure: commandContextResult.error,
        correlationId
      });
    }

    const applicationInputResult = mapInitializePortfolioExecutionRequestToInput(
      request,
      commandContextResult.value!,
      authorizationResult.value!,
      correlationId
    );
    if (applicationInputResult.isFailure) {
      return presentationErrorResponse(applicationInputResult.error!);
    }

    const result = await this.#runtime.initializePortfolioExecution.initialize(applicationInputResult.value!);
    if (result.isFailure) {
      return failureResponse({
        failure: result.error,
        correlationId
      });
    }

    const response = mapInitializePortfolioExecutionResult(result.value!);
    return internalSuccessResponse({
      status: 201,
      body: response,
      correlationId: response.correlationId
    });
  }
}
