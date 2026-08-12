import type {
  AcceptCandidateResult,
  ActivateWorkItemResult,
  BeginExecutionResult,
  CancelExecutionResult,
  CancelWorkItemResult,
  CompleteExecutionResult,
  CompleteWorkItemResult,
  GetPortfolioExecutionResult,
  InitializePortfolioExecutionResult,
  RejectCandidateResult
} from "@career-companion/portfolio-workspace-application";
import {
  GetPortfolioExecutionInput,
  InitializeArtifactCandidateDefinition,
  InitializePortfolioExecutionInput,
  InitializePortfolioWorkItemDefinition
} from "@career-companion/portfolio-workspace-application";
import { Result } from "@career-companion/kernel";
import {
  ApprovalReference,
  CandidateId,
  ExecutionId,
  InvalidPortfolioWorkspaceIdentifierError,
  PlanSnapshotReference,
  PortfolioExecutionCommandContext,
  PortfolioPlanReference,
  PortfolioWorkspaceAuthorizationResourceReference,
  WorkItemId
} from "@career-companion/portfolio-workspace";
import {
  type GetPortfolioExecutionPresentationRequest,
  type InitializePortfolioExecutionPresentationRequest
} from "./requests";
import {
  createInvalidIdentifierPresentationError,
  PortfolioWorkspacePresentationError,
  PortfolioWorkspacePresentationErrorCategory,
  PortfolioWorkspacePresentationErrorCode
} from "./errors";
import { PortfolioWorkspacePresentationOutcome } from "./outcomes";
import {
  type AcceptCandidatePresentationResponse,
  type ActivateWorkItemPresentationResponse,
  type BeginExecutionPresentationResponse,
  type CancelExecutionPresentationResponse,
  type CancelWorkItemPresentationResponse,
  type CompleteExecutionPresentationResponse,
  type CompleteWorkItemPresentationResponse,
  type GetPortfolioExecutionPresentationResponse,
  createBasePresentationResponse,
  mapAcceptedArtifactSummaryProjection,
  mapExecutionSummaryProjection,
  mapWorkItemSummaryProjection,
  type InitializePortfolioExecutionPresentationResponse,
  type RejectCandidatePresentationResponse
} from "./responses";

export function mapInitializePortfolioExecutionRequestToInput(
  request: InitializePortfolioExecutionPresentationRequest,
  commandContext: PortfolioExecutionCommandContext,
  authorizationResourceReference: PortfolioWorkspaceAuthorizationResourceReference,
  correlationId: string
): Result<InitializePortfolioExecutionInput, PortfolioWorkspacePresentationError> {
  const executionIdResult = createDomainValue("executionId", () => new ExecutionId(request.executionId), correlationId);
  if (executionIdResult.isFailure) {
    return Result.failure(executionIdResult.error as PortfolioWorkspacePresentationError);
  }

  const portfolioPlanReferenceResult = createDomainValue("portfolioPlanReference", () => new PortfolioPlanReference(request.portfolioPlanReference), correlationId);
  if (portfolioPlanReferenceResult.isFailure) {
    return Result.failure(portfolioPlanReferenceResult.error as PortfolioWorkspacePresentationError);
  }

  const planSnapshotReferenceResult = createDomainValue("planSnapshotReference", () => new PlanSnapshotReference(request.planSnapshotReference), correlationId);
  if (planSnapshotReferenceResult.isFailure) {
    return Result.failure(planSnapshotReferenceResult.error as PortfolioWorkspacePresentationError);
  }

  const approvalReferenceResult = createDomainValue("approvalReference", () => new ApprovalReference(request.approvalReference), correlationId);
  if (approvalReferenceResult.isFailure) {
    return Result.failure(approvalReferenceResult.error as PortfolioWorkspacePresentationError);
  }

  const workItems: InitializePortfolioWorkItemDefinition[] = [];
  for (const [index, definition] of request.initialWorkItems.entries()) {
    const workItemResult = createDomainValue(
      `initialWorkItems[${index}].workItemId`,
      () => new InitializePortfolioWorkItemDefinition({
        workItemId: new WorkItemId(definition.workItemId)
      }),
      correlationId
    );
    if (workItemResult.isFailure) {
      return Result.failure(workItemResult.error as PortfolioWorkspacePresentationError);
    }
    workItems.push(workItemResult.value as InitializePortfolioWorkItemDefinition);
  }

  const candidates: InitializeArtifactCandidateDefinition[] = [];
  for (const [index, definition] of request.initialCandidates.entries()) {
    const candidateResult = createDomainValue(
      `initialCandidates[${index}].candidateId`,
      () => new InitializeArtifactCandidateDefinition({
        candidateId: new CandidateId(definition.candidateId)
      }),
      correlationId
    );
    if (candidateResult.isFailure) {
      return Result.failure(candidateResult.error as PortfolioWorkspacePresentationError);
    }
    candidates.push(candidateResult.value as InitializeArtifactCandidateDefinition);
  }

  try {
    return Result.success(new InitializePortfolioExecutionInput({
      executionId: executionIdResult.value as ExecutionId,
      portfolioPlanReference: portfolioPlanReferenceResult.value as PortfolioPlanReference,
      planSnapshotReference: planSnapshotReferenceResult.value as PlanSnapshotReference,
      approvalReference: approvalReferenceResult.value as ApprovalReference,
      authorizationResourceReference,
      commandContext,
      workItems,
      candidates
    }));
  } catch {
    return Result.failure(invalidInitializationRequest(correlationId, "initializePortfolioExecution"));
  }
}

export function mapGetPortfolioExecutionRequestToInput(
  request: GetPortfolioExecutionPresentationRequest,
  correlationId: string
): Result<GetPortfolioExecutionInput, PortfolioWorkspacePresentationError> {
  let executionId: ExecutionId;
  try {
    executionId = new ExecutionId(request.executionId);
  } catch {
    return Result.failure(createInvalidIdentifierPresentationError({
      correlationId,
      field: "executionId"
    }));
  }

  try {
    return Result.success(new GetPortfolioExecutionInput({
      executionId,
      correlationId
    }));
  } catch {
    return Result.failure(new PortfolioWorkspacePresentationError({
      category: PortfolioWorkspacePresentationErrorCategory.InvalidInput,
      code: PortfolioWorkspacePresentationErrorCode.InvalidRequest,
      message: "The get request is invalid.",
      correlationId,
      issues: [{
        field: "getPortfolioExecution",
        code: PortfolioWorkspacePresentationErrorCode.InvalidRequest,
        message: "Request value is invalid."
      }]
    }));
  }
}

export function mapGetPortfolioExecutionResult(
  result: GetPortfolioExecutionResult
): GetPortfolioExecutionPresentationResponse {
  return Object.freeze({
    version: "v1",
    ...(result.correlationId === undefined ? {} : { correlationId: result.correlationId }),
    execution: mapExecutionSummaryProjection(result.summary.toJSON())
  });
}

export function mapInitializePortfolioExecutionResult(
  result: InitializePortfolioExecutionResult
): InitializePortfolioExecutionPresentationResponse {
  return createBasePresentationResponse({
    correlationId: result.correlationId,
    outcome: PortfolioWorkspacePresentationOutcome.ExecutionInitialized,
    summary: result.summary.toJSON()
  });
}

export function mapBeginExecutionResult(result: BeginExecutionResult): BeginExecutionPresentationResponse {
  return createBasePresentationResponse({
    correlationId: result.correlationId,
    outcome: PortfolioWorkspacePresentationOutcome.ExecutionStarted,
    summary: result.summary.toJSON()
  });
}

export function mapActivateWorkItemResult(result: ActivateWorkItemResult): ActivateWorkItemPresentationResponse {
  return Object.freeze({
    ...createBasePresentationResponse({
      correlationId: result.correlationId,
      outcome: PortfolioWorkspacePresentationOutcome.WorkItemActivated,
      summary: result.summary.toJSON()
    }),
    workItem: mapWorkItemSummaryProjection(result.workItemSummary.toJSON())
  });
}

export function mapCompleteWorkItemResult(result: CompleteWorkItemResult): CompleteWorkItemPresentationResponse {
  return createBasePresentationResponse({
    correlationId: result.correlationId,
    outcome: PortfolioWorkspacePresentationOutcome.WorkItemCompleted,
    summary: result.summary.toJSON()
  });
}

export function mapCancelWorkItemResult(result: CancelWorkItemResult): CancelWorkItemPresentationResponse {
  return Object.freeze({
    ...createBasePresentationResponse({
      correlationId: result.correlationId,
      outcome: PortfolioWorkspacePresentationOutcome.WorkItemCancelled,
      summary: result.summary.toJSON()
    }),
    workItem: mapWorkItemSummaryProjection(result.workItemSummary.toJSON())
  });
}

export function mapAcceptCandidateResult(result: AcceptCandidateResult): AcceptCandidatePresentationResponse {
  return Object.freeze({
    ...createBasePresentationResponse({
      correlationId: result.correlationId,
      outcome: PortfolioWorkspacePresentationOutcome.CandidateAccepted,
      summary: result.summary.toJSON()
    }),
    acceptedArtifact: mapAcceptedArtifactSummaryProjection(result.acceptedArtifactSummary.toJSON())
  });
}

export function mapRejectCandidateResult(result: RejectCandidateResult): RejectCandidatePresentationResponse {
  return createBasePresentationResponse({
    correlationId: result.correlationId,
    outcome: PortfolioWorkspacePresentationOutcome.CandidateRejected,
    summary: result.summary.toJSON()
  });
}

export function mapCompleteExecutionResult(result: CompleteExecutionResult): CompleteExecutionPresentationResponse {
  return createBasePresentationResponse({
    correlationId: result.correlationId,
    outcome: PortfolioWorkspacePresentationOutcome.ExecutionCompleted,
    summary: result.summary.toJSON()
  });
}

export function mapCancelExecutionResult(result: CancelExecutionResult): CancelExecutionPresentationResponse {
  return createBasePresentationResponse({
    correlationId: result.correlationId,
    outcome: PortfolioWorkspacePresentationOutcome.ExecutionCancelled,
    summary: result.summary.toJSON()
  });
}

function createDomainValue<T>(
  field: string,
  create: () => T,
  correlationId: string
): Result<T, PortfolioWorkspacePresentationError> {
  try {
    return Result.success(create());
  } catch (error) {
    if (error instanceof InvalidPortfolioWorkspaceIdentifierError || error instanceof TypeError) {
      return Result.failure(invalidInitializationRequest(correlationId, field));
    }

    throw error;
  }
}

function invalidInitializationRequest(
  correlationId: string,
  field: string
): PortfolioWorkspacePresentationError {
  return new PortfolioWorkspacePresentationError({
    category: PortfolioWorkspacePresentationErrorCategory.InvalidInput,
    code: PortfolioWorkspacePresentationErrorCode.InvalidInitializationRequest,
    message: "The initialization request is invalid.",
    correlationId,
    issues: [{
      field,
      code: PortfolioWorkspacePresentationErrorCode.InvalidIdentifier,
      message: "Initialization value is invalid."
    }]
  });
}
