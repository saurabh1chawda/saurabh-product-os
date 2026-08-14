import { createHash } from "node:crypto";
import { Result } from "@career-companion/kernel";
import {
  ExecutionId,
  PortfolioWorkspaceAuthorizationResourceReference
} from "@career-companion/portfolio-workspace";
import { ResolvePortfolioExecutionAuthorizationResourceInput } from "@career-companion/portfolio-workspace-application";
import type { PortfolioWorkspaceRuntime } from "@career-companion/infrastructure";

import {
  createForbiddenPresentationError,
  mapPortfolioWorkspaceFailureToPresentationError,
  type InitializePortfolioExecutionPresentationRequest,
  type PortfolioWorkspacePresentationError,
  type PortfolioWorkspacePresentationPrincipal
} from "../presentation";
import type { PortfolioWorkspaceInternalAuthorization } from "./authorization";

export interface PortfolioWorkspaceAuthorizationResourceResolver {
  resolve(input: {
    readonly executionId: ExecutionId;
    readonly correlationId: string;
  }): Promise<Result<PortfolioWorkspaceAuthorizationResourceReference, PortfolioWorkspacePresentationError>>;
}

export class PortfolioWorkspaceRuntimeAuthorizationResourceResolver implements PortfolioWorkspaceAuthorizationResourceResolver {
  readonly #runtime: PortfolioWorkspaceRuntime;

  constructor(input: {
    readonly runtime: PortfolioWorkspaceRuntime;
  }) {
    this.#runtime = input.runtime;
    Object.freeze(this);
  }

  async resolve(input: {
    readonly executionId: ExecutionId;
    readonly correlationId: string;
  }): Promise<Result<PortfolioWorkspaceAuthorizationResourceReference, PortfolioWorkspacePresentationError>> {
    const result = await this.#runtime.resolvePortfolioExecutionAuthorizationResource.resolve(
      new ResolvePortfolioExecutionAuthorizationResourceInput({
        executionId: input.executionId,
        correlationId: input.correlationId
      })
    );

    if (result.isFailure) {
      return Result.failure(mapPortfolioWorkspaceFailureToPresentationError(result.error, input.correlationId));
    }

    return Result.success(result.value!.authorizationResourceReference);
  }
}

export class PortfolioWorkspaceProductionAuthorization implements PortfolioWorkspaceInternalAuthorization {
  readonly #resourceResolver: PortfolioWorkspaceAuthorizationResourceResolver;

  constructor(input: {
    readonly resourceResolver: PortfolioWorkspaceAuthorizationResourceResolver;
  }) {
    this.#resourceResolver = input.resourceResolver;
    Object.freeze(this);
  }

  async authorizeInitialize(input: {
    readonly principal: PortfolioWorkspacePresentationPrincipal;
    readonly request: InitializePortfolioExecutionPresentationRequest;
    readonly correlationId: string;
  }): Promise<Result<PortfolioWorkspaceAuthorizationResourceReference, PortfolioWorkspacePresentationError>> {
    void input.request;

    return Result.success(authorizationResourceReferenceForPrincipal(input.principal));
  }

  async authorizeGet(input: {
    readonly principal: PortfolioWorkspacePresentationPrincipal;
    readonly executionId: ExecutionId;
    readonly correlationId: string;
  }): Promise<Result<void, PortfolioWorkspacePresentationError>> {
    const resourceResult = await this.#resourceResolver.resolve({
      executionId: input.executionId,
      correlationId: input.correlationId
    });
    if (resourceResult.isFailure) {
      return Result.failure(resourceResult.error!);
    }

    const expectedReference = authorizationResourceReferenceForPrincipal(input.principal);
    if (!resourceResult.value!.equals(expectedReference)) {
      return Result.failure(createForbiddenPresentationError(input.correlationId));
    }

    return Result.success(undefined);
  }
}

export function authorizationResourceReferenceForPrincipal(
  principal: PortfolioWorkspacePresentationPrincipal
): PortfolioWorkspaceAuthorizationResourceReference {
  return new PortfolioWorkspaceAuthorizationResourceReference({
    authorizationResourceReference: [
      "portfolio-workspace",
      "principal",
      principal.principalType,
      hashPrincipalIdentity(principal)
    ].join(":")
  });
}

function hashPrincipalIdentity(principal: PortfolioWorkspacePresentationPrincipal): string {
  return createHash("sha256")
    .update(principal.authenticationProvider, "utf8")
    .update("\0")
    .update(principal.principalId, "utf8")
    .digest("hex");
}
