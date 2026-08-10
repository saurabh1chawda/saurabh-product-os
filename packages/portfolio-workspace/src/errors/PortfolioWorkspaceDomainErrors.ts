import { PortfolioWorkspaceDomainError } from "./PortfolioWorkspaceDomainError";

export class DuplicateWorkItemError extends PortfolioWorkspaceDomainError {
  constructor() {
    super("DuplicateWorkItemError", "PORTFOLIO_WORKSPACE_DUPLICATE_WORK_ITEM", "Work item already exists in this portfolio execution.");
  }
}

export class UnknownWorkItemError extends PortfolioWorkspaceDomainError {
  constructor() {
    super("UnknownWorkItemError", "PORTFOLIO_WORKSPACE_UNKNOWN_WORK_ITEM", "Work item does not exist in this portfolio execution.");
  }
}

export class DuplicateCandidateError extends PortfolioWorkspaceDomainError {
  constructor() {
    super("DuplicateCandidateError", "PORTFOLIO_WORKSPACE_DUPLICATE_CANDIDATE", "Artifact candidate already exists in this portfolio execution.");
  }
}

export class UnknownCandidateError extends PortfolioWorkspaceDomainError {
  constructor() {
    super("UnknownCandidateError", "PORTFOLIO_WORKSPACE_UNKNOWN_CANDIDATE", "Artifact candidate does not exist in this portfolio execution.");
  }
}

export class DuplicateAcceptedArtifactError extends PortfolioWorkspaceDomainError {
  constructor() {
    super("DuplicateAcceptedArtifactError", "PORTFOLIO_WORKSPACE_DUPLICATE_ACCEPTED_ARTIFACT", "Accepted artifact already exists in this portfolio execution.");
  }
}

export class UnknownAcceptedArtifactError extends PortfolioWorkspaceDomainError {
  constructor() {
    super("UnknownAcceptedArtifactError", "PORTFOLIO_WORKSPACE_UNKNOWN_ACCEPTED_ARTIFACT", "Accepted artifact does not exist in this portfolio execution.");
  }
}

export class InvalidExecutionOperationError extends PortfolioWorkspaceDomainError {
  constructor() {
    super("InvalidExecutionOperationError", "PORTFOLIO_WORKSPACE_INVALID_EXECUTION_OPERATION", "Portfolio execution operation violates an aggregate invariant.");
  }
}

export class UnknownPortfolioPlanReferenceError extends PortfolioWorkspaceDomainError {
  constructor() {
    super("UnknownPortfolioPlanReferenceError", "PORTFOLIO_WORKSPACE_UNKNOWN_PORTFOLIO_PLAN_REFERENCE", "Portfolio plan reference is not known to this portfolio execution.");
  }
}

export class InvalidPlanSnapshotReferenceError extends PortfolioWorkspaceDomainError {
  constructor() {
    super("InvalidPlanSnapshotReferenceError", "PORTFOLIO_WORKSPACE_INVALID_PLAN_SNAPSHOT_REFERENCE", "Plan snapshot reference is invalid for this portfolio execution.");
  }
}

export class ApprovalReferenceMismatchError extends PortfolioWorkspaceDomainError {
  constructor() {
    super("ApprovalReferenceMismatchError", "PORTFOLIO_WORKSPACE_APPROVAL_REFERENCE_MISMATCH", "Approval reference does not match this portfolio execution.");
  }
}
