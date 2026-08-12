import type { Result } from "@career-companion/kernel";
import type {
  ExecutionId,
  PortfolioWorkspaceAuthorizationResourceReference
} from "@career-companion/portfolio-workspace";

import type {
  InitializePortfolioExecutionPresentationRequest,
  PortfolioWorkspacePresentationError,
  PortfolioWorkspacePresentationPrincipal
} from "../presentation";

export interface PortfolioWorkspaceInternalAuthorization {
  authorizeInitialize(input: {
    readonly principal: PortfolioWorkspacePresentationPrincipal;
    readonly request: InitializePortfolioExecutionPresentationRequest;
    readonly correlationId: string;
  }): Promise<Result<PortfolioWorkspaceAuthorizationResourceReference, PortfolioWorkspacePresentationError>>;

  authorizeGet(input: {
    readonly principal: PortfolioWorkspacePresentationPrincipal;
    readonly executionId: ExecutionId;
    readonly correlationId: string;
  }): Promise<Result<void, PortfolioWorkspacePresentationError>>;
}
