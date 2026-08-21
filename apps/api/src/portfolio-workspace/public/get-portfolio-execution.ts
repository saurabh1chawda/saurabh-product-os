import type { GetPortfolioExecutionPresentationResponse, PortfolioWorkspacePresentationErrorJson } from "../presentation";
import {
  PORTFOLIO_WORKSPACE_CORRELATION_HEADER,
  type GetPortfolioExecutionInternalHandler
} from "../internal";
import {
  PORTFOLIO_WORKSPACE_PUBLIC_CORRELATION_HEADER,
  type PortfolioWorkspacePublicAuthenticationBoundary,
  type PortfolioWorkspacePublicAuthenticationRequest,
  type PortfolioWorkspacePublicAuthenticationResponseHeaders,
  type PortfolioWorkspacePublicHeaders
} from "./authentication";

const INSPECT_SYMBOL = Symbol.for("nodejs.util.inspect.custom");

export interface GetPortfolioExecutionPublicRequest extends PortfolioWorkspacePublicAuthenticationRequest {
  readonly executionId?: string;
  readonly headers?: PortfolioWorkspacePublicHeaders;
  readonly incomingCorrelationId?: string;
}

export type PortfolioWorkspacePublicGetResponseHeaders = PortfolioWorkspacePublicAuthenticationResponseHeaders;

export type GetPortfolioExecutionPublicResponseBody =
  | GetPortfolioExecutionPresentationResponse
  | PortfolioWorkspacePresentationErrorJson;

export interface GetPortfolioExecutionPublicResponseJson {
  readonly status: number;
  readonly body: GetPortfolioExecutionPublicResponseBody;
  readonly headers: PortfolioWorkspacePublicGetResponseHeaders;
}

export class GetPortfolioExecutionPublicResponse {
  readonly status: number;
  readonly body: GetPortfolioExecutionPublicResponseBody;
  readonly headers: PortfolioWorkspacePublicGetResponseHeaders;

  constructor(input: GetPortfolioExecutionPublicResponseJson) {
    this.status = input.status;
    this.body = input.body;
    this.headers = Object.freeze({ ...input.headers });

    Object.freeze(this);
  }

  toJSON(): GetPortfolioExecutionPublicResponseJson {
    return Object.freeze({
      status: this.status,
      body: this.body,
      headers: this.headers
    });
  }

  [INSPECT_SYMBOL](): GetPortfolioExecutionPublicResponseJson {
    return this.toJSON();
  }
}

export class GetPortfolioExecutionPublicBinding {
  readonly #authentication: PortfolioWorkspacePublicAuthenticationBoundary;
  readonly #getHandler: GetPortfolioExecutionInternalHandler;

  constructor(input: {
    readonly authentication: PortfolioWorkspacePublicAuthenticationBoundary;
    readonly getHandler: GetPortfolioExecutionInternalHandler;
  }) {
    this.#authentication = input.authentication;
    this.#getHandler = input.getHandler;

    Object.freeze(this);
  }

  async handle(
    request: GetPortfolioExecutionPublicRequest
  ): Promise<GetPortfolioExecutionPublicResponse> {
    const authentication = await this.#authentication.authenticate({
      headers: request.headers,
      incomingCorrelationId: request.incomingCorrelationId
    });

    if (authentication.isFailure) {
      return new GetPortfolioExecutionPublicResponse({
        status: authentication.error!.status,
        body: authentication.error!.error.toJSON(),
        headers: authentication.error!.headers
      });
    }

    const correlationId = authentication.value!.correlationId;
    const response = await this.#getHandler.handle({
      principal: authentication.value!.principal,
      request: {
        headers: {
          [PORTFOLIO_WORKSPACE_CORRELATION_HEADER]: correlationId
        },
        pathParameters: {
          executionId: request.executionId
        }
      }
    });

    return new GetPortfolioExecutionPublicResponse({
      status: response.status,
      body: response.body as GetPortfolioExecutionPublicResponseBody,
      headers: Object.freeze({
        [PORTFOLIO_WORKSPACE_PUBLIC_CORRELATION_HEADER]: response.headers[PORTFOLIO_WORKSPACE_CORRELATION_HEADER]
      })
    });
  }
}
