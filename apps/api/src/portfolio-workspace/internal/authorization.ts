import type { Result } from "@career-companion/kernel";
import type { ExecutionId } from "@career-companion/portfolio-workspace";

import type {
  InitializePortfolioExecutionPresentationRequest,
  PortfolioWorkspacePresentationError,
  PortfolioWorkspacePresentationPrincipal
} from "../presentation";

export interface PortfolioWorkspaceInternalAuthorization {
  authorizeInitialize(input: {
    readonly principal: PortfolioWorkspacePresentationPrincipal;
    readonly request: InitializePortfolioExecutionPresentationRequest;
  }): Promise<Result<void, PortfolioWorkspacePresentationError>>;

  authorizeGet(input: {
    readonly principal: PortfolioWorkspacePresentationPrincipal;
    readonly executionId: ExecutionId;
  }): Promise<Result<void, PortfolioWorkspacePresentationError>>;
}
