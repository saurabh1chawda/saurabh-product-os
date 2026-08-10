import {
  PortfolioWorkspacePresentationErrorCategory,
  type PortfolioWorkspacePresentationError
} from "../presentation";

export type PortfolioWorkspaceInternalStatus =
  | 200
  | 201
  | 400
  | 401
  | 403
  | 404
  | 409
  | 500
  | 503;

export function mapPortfolioWorkspacePresentationErrorToInternalStatus(
  error: PortfolioWorkspacePresentationError
): PortfolioWorkspaceInternalStatus {
  switch (error.category) {
    case PortfolioWorkspacePresentationErrorCategory.InvalidInput:
      return 400;
    case PortfolioWorkspacePresentationErrorCategory.Unauthenticated:
      return 401;
    case PortfolioWorkspacePresentationErrorCategory.Forbidden:
      return 403;
    case PortfolioWorkspacePresentationErrorCategory.NotFound:
      return 404;
    case PortfolioWorkspacePresentationErrorCategory.Conflict:
      return 409;
    case PortfolioWorkspacePresentationErrorCategory.Unavailable:
      return 503;
    case PortfolioWorkspacePresentationErrorCategory.Internal:
      return 500;
  }
}
