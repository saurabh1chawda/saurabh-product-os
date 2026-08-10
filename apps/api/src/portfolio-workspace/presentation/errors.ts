import {
  PortfolioExecutionAlreadyExistsError,
  PortfolioExecutionConcurrencyConflictError,
  PortfolioExecutionNotFoundError,
  PortfolioExecutionPersistenceMappingError,
  PortfolioExecutionPersistenceUnavailableError,
  UnsupportedPortfolioExecutionRecordVersionError
} from "@career-companion/portfolio-workspace-application";
import {
  ApprovalReferenceMismatchError,
  DuplicateAcceptedArtifactError,
  DuplicateCandidateError,
  DuplicateWorkItemError,
  InvalidExecutionOperationError,
  InvalidPortfolioWorkspaceIdentifierError,
  InvalidPlanSnapshotReferenceError,
  PortfolioWorkspaceDomainError,
  UnknownAcceptedArtifactError,
  UnknownCandidateError,
  UnknownPortfolioPlanReferenceError,
  UnknownWorkItemError
} from "@career-companion/portfolio-workspace";
import { PORTFOLIO_WORKSPACE_PRESENTATION_VERSION, type PortfolioWorkspacePresentationVersion } from "./version";

export const PortfolioWorkspacePresentationErrorCategory = {
  InvalidInput: "invalid-input",
  Unauthenticated: "unauthenticated",
  Forbidden: "forbidden",
  NotFound: "not-found",
  Conflict: "conflict",
  Unavailable: "unavailable",
  Internal: "internal"
} as const;

export type PortfolioWorkspacePresentationErrorCategoryValue =
  typeof PortfolioWorkspacePresentationErrorCategory[keyof typeof PortfolioWorkspacePresentationErrorCategory];

export const PortfolioWorkspacePresentationErrorCode = {
  InvalidRequest: "invalid-request",
  InvalidInitializationRequest: "invalid-initialization-request",
  InvalidIdentifier: "invalid-identifier",
  Unauthenticated: "unauthenticated",
  Forbidden: "forbidden",
  PortfolioExecutionNotFound: "portfolio-execution-not-found",
  PortfolioExecutionAlreadyExists: "portfolio-execution-already-exists",
  ExecutionOperationNotAllowed: "execution-operation-not-allowed",
  WorkItemNotFound: "work-item-not-found",
  CandidateNotFound: "candidate-not-found",
  AcceptedArtifactConflict: "accepted-artifact-conflict",
  ExecutionNotCompletable: "execution-not-completable",
  PortfolioExecutionConcurrencyConflict: "portfolio-execution-concurrency-conflict",
  PortfolioWorkspacePersistenceUnavailable: "portfolio-workspace-persistence-unavailable",
  PortfolioWorkspaceUnavailable: "portfolio-workspace-unavailable",
  PortfolioWorkspacePersistenceCorrupt: "portfolio-workspace-persistence-corrupt",
  PortfolioWorkspaceRecordVersionUnsupported: "portfolio-workspace-record-version-unsupported",
  PortfolioWorkspaceInternalError: "portfolio-workspace-internal-error"
} as const;

export type PortfolioWorkspacePresentationErrorCodeValue =
  typeof PortfolioWorkspacePresentationErrorCode[keyof typeof PortfolioWorkspacePresentationErrorCode];

export interface PortfolioWorkspacePresentationIssueJson {
  readonly field: string;
  readonly code: typeof PortfolioWorkspacePresentationErrorCode.InvalidRequest | typeof PortfolioWorkspacePresentationErrorCode.InvalidIdentifier;
  readonly message: string;
}

export interface PortfolioWorkspacePresentationErrorJson {
  readonly version: PortfolioWorkspacePresentationVersion;
  readonly category: PortfolioWorkspacePresentationErrorCategoryValue;
  readonly code: PortfolioWorkspacePresentationErrorCodeValue;
  readonly message: string;
  readonly correlationId: string;
  readonly retryable: boolean;
  readonly issues?: readonly PortfolioWorkspacePresentationIssueJson[];
}

export class PortfolioWorkspacePresentationError {
  readonly version = PORTFOLIO_WORKSPACE_PRESENTATION_VERSION;
  readonly category: PortfolioWorkspacePresentationErrorCategoryValue;
  readonly code: PortfolioWorkspacePresentationErrorCodeValue;
  readonly message: string;
  readonly correlationId: string;
  readonly retryable: boolean;
  readonly issues: readonly PortfolioWorkspacePresentationIssueJson[] | undefined;

  constructor(input: {
    readonly category: PortfolioWorkspacePresentationErrorCategoryValue;
    readonly code: PortfolioWorkspacePresentationErrorCodeValue;
    readonly message: string;
    readonly correlationId: string;
    readonly retryable?: boolean;
    readonly issues?: readonly PortfolioWorkspacePresentationIssueJson[];
  }) {
    this.category = input.category;
    this.code = input.code;
    this.message = input.message;
    this.correlationId = input.correlationId;
    this.retryable = input.retryable ?? false;
    this.issues = input.issues === undefined
      ? undefined
      : Object.freeze(input.issues.map((issue) => Object.freeze({ ...issue })));
    Object.freeze(this);
  }

  toJSON(): PortfolioWorkspacePresentationErrorJson {
    return Object.freeze({
      version: this.version,
      category: this.category,
      code: this.code,
      message: this.message,
      correlationId: this.correlationId,
      retryable: this.retryable,
      ...(this.issues === undefined ? {} : { issues: this.issues.map((issue) => Object.freeze({ ...issue })) })
    });
  }
}

export function createInvalidRequestPresentationError(input: {
  readonly correlationId: string;
  readonly issues: readonly PortfolioWorkspacePresentationIssueJson[];
}): PortfolioWorkspacePresentationError {
  return new PortfolioWorkspacePresentationError({
    category: PortfolioWorkspacePresentationErrorCategory.InvalidInput,
    code: PortfolioWorkspacePresentationErrorCode.InvalidRequest,
    message: "The request is invalid.",
    correlationId: input.correlationId,
    issues: input.issues
  });
}

export function createInvalidIdentifierPresentationError(input: {
  readonly correlationId: string;
  readonly field: string;
}): PortfolioWorkspacePresentationError {
  return new PortfolioWorkspacePresentationError({
    category: PortfolioWorkspacePresentationErrorCategory.InvalidInput,
    code: PortfolioWorkspacePresentationErrorCode.InvalidIdentifier,
    message: "A request identifier is invalid.",
    correlationId: input.correlationId,
    issues: [{
      field: input.field,
      code: PortfolioWorkspacePresentationErrorCode.InvalidIdentifier,
      message: "Identifier is invalid."
    }]
  });
}

export function createUnauthenticatedPresentationError(correlationId: string): PortfolioWorkspacePresentationError {
  return new PortfolioWorkspacePresentationError({
    category: PortfolioWorkspacePresentationErrorCategory.Unauthenticated,
    code: PortfolioWorkspacePresentationErrorCode.Unauthenticated,
    message: "Authentication is required.",
    correlationId
  });
}

export function createForbiddenPresentationError(correlationId: string): PortfolioWorkspacePresentationError {
  return new PortfolioWorkspacePresentationError({
    category: PortfolioWorkspacePresentationErrorCategory.Forbidden,
    code: PortfolioWorkspacePresentationErrorCode.Forbidden,
    message: "You are not allowed to perform this operation.",
    correlationId
  });
}

export function createPortfolioWorkspaceUnavailablePresentationError(
  correlationId: string
): PortfolioWorkspacePresentationError {
  return new PortfolioWorkspacePresentationError({
    category: PortfolioWorkspacePresentationErrorCategory.Unavailable,
    code: PortfolioWorkspacePresentationErrorCode.PortfolioWorkspaceUnavailable,
    message: "Portfolio Workspace is temporarily unavailable.",
    correlationId
  });
}

export function mapPortfolioWorkspaceFailureToPresentationError(
  failure: unknown,
  correlationId: string
): PortfolioWorkspacePresentationError {
  if (failure instanceof PortfolioExecutionNotFoundError) {
    return new PortfolioWorkspacePresentationError({
      category: PortfolioWorkspacePresentationErrorCategory.NotFound,
      code: PortfolioWorkspacePresentationErrorCode.PortfolioExecutionNotFound,
      message: "Portfolio execution was not found.",
      correlationId
    });
  }

  if (failure instanceof PortfolioExecutionConcurrencyConflictError) {
    return new PortfolioWorkspacePresentationError({
      category: PortfolioWorkspacePresentationErrorCategory.Conflict,
      code: PortfolioWorkspacePresentationErrorCode.PortfolioExecutionConcurrencyConflict,
      message: "Portfolio execution changed before this operation could be saved.",
      correlationId
    });
  }

  if (failure instanceof PortfolioExecutionPersistenceUnavailableError) {
    return new PortfolioWorkspacePresentationError({
      category: PortfolioWorkspacePresentationErrorCategory.Unavailable,
      code: PortfolioWorkspacePresentationErrorCode.PortfolioWorkspacePersistenceUnavailable,
      message: "Portfolio Workspace persistence is temporarily unavailable.",
      correlationId
    });
  }

  if (failure instanceof PortfolioExecutionPersistenceMappingError) {
    return new PortfolioWorkspacePresentationError({
      category: PortfolioWorkspacePresentationErrorCategory.Internal,
      code: PortfolioWorkspacePresentationErrorCode.PortfolioWorkspacePersistenceCorrupt,
      message: "Portfolio Workspace persisted state cannot be read safely.",
      correlationId
    });
  }

  if (failure instanceof UnsupportedPortfolioExecutionRecordVersionError) {
    return new PortfolioWorkspacePresentationError({
      category: PortfolioWorkspacePresentationErrorCategory.Internal,
      code: PortfolioWorkspacePresentationErrorCode.PortfolioWorkspaceRecordVersionUnsupported,
      message: "Portfolio Workspace persisted state is not compatible with this service version.",
      correlationId
    });
  }

  if (failure instanceof PortfolioExecutionAlreadyExistsError) {
    return new PortfolioWorkspacePresentationError({
      category: PortfolioWorkspacePresentationErrorCategory.Conflict,
      code: PortfolioWorkspacePresentationErrorCode.PortfolioExecutionAlreadyExists,
      message: "Portfolio execution already exists.",
      correlationId
    });
  }

  if (failure instanceof InvalidPortfolioWorkspaceIdentifierError) {
    return createInvalidIdentifierPresentationError({
      correlationId,
      field: "identifier"
    });
  }

  if (failure instanceof PortfolioWorkspaceDomainError) {
    return mapDomainFailure(failure, correlationId);
  }

  return new PortfolioWorkspacePresentationError({
    category: PortfolioWorkspacePresentationErrorCategory.Internal,
    code: PortfolioWorkspacePresentationErrorCode.PortfolioWorkspaceInternalError,
    message: "Portfolio Workspace could not complete the operation.",
    correlationId
  });
}

function mapDomainFailure(
  failure: PortfolioWorkspaceDomainError,
  correlationId: string
): PortfolioWorkspacePresentationError {
  if (failure instanceof UnknownWorkItemError) {
    return conflict(PortfolioWorkspacePresentationErrorCode.WorkItemNotFound, "Work item was not found in this execution.", correlationId);
  }
  if (failure instanceof UnknownCandidateError) {
    return conflict(PortfolioWorkspacePresentationErrorCode.CandidateNotFound, "Candidate was not found in this execution.", correlationId);
  }
  if (failure instanceof DuplicateAcceptedArtifactError || failure instanceof UnknownAcceptedArtifactError) {
    return conflict(PortfolioWorkspacePresentationErrorCode.AcceptedArtifactConflict, "Accepted artifact state conflicts with this operation.", correlationId);
  }
  if (failure instanceof InvalidExecutionOperationError) {
    return conflict(PortfolioWorkspacePresentationErrorCode.ExecutionOperationNotAllowed, "Portfolio execution cannot perform this operation now.", correlationId);
  }
  if (
    failure instanceof DuplicateWorkItemError
    || failure instanceof DuplicateCandidateError
    || failure instanceof UnknownPortfolioPlanReferenceError
    || failure instanceof InvalidPlanSnapshotReferenceError
    || failure instanceof ApprovalReferenceMismatchError
  ) {
    return conflict(PortfolioWorkspacePresentationErrorCode.ExecutionOperationNotAllowed, "Portfolio execution cannot perform this operation now.", correlationId);
  }

  return conflict(PortfolioWorkspacePresentationErrorCode.ExecutionOperationNotAllowed, "Portfolio Workspace rejected this operation.", correlationId);
}

function conflict(
  code: PortfolioWorkspacePresentationErrorCodeValue,
  message: string,
  correlationId: string
): PortfolioWorkspacePresentationError {
  return new PortfolioWorkspacePresentationError({
    category: PortfolioWorkspacePresentationErrorCategory.Conflict,
    code,
    message,
    correlationId
  });
}
