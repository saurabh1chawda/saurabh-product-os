import type {
  AcceptedArtifactSummaryProjectionJson,
  ArtifactCandidateSummaryProjectionJson,
  PortfolioExecutionSummaryProjectionJson,
  PortfolioWorkItemSummaryProjectionJson
} from "@career-companion/portfolio-workspace";
import { PortfolioWorkspacePresentationOutcome, type PortfolioWorkspacePresentationOutcomeValue } from "./outcomes";
import { PORTFOLIO_WORKSPACE_PRESENTATION_VERSION, type PortfolioWorkspacePresentationVersion } from "./version";

export interface PortfolioExecutionSummaryResponse {
  readonly executionId: string;
  readonly lifecycle: PortfolioExecutionSummaryProjectionJson["lifecycle"];
  readonly portfolioPlanReference: PortfolioExecutionSummaryProjectionJson["portfolioPlanReference"];
  readonly planSnapshotReference: PortfolioExecutionSummaryProjectionJson["planSnapshotReference"];
  readonly approvalReference: PortfolioExecutionSummaryProjectionJson["approvalReference"];
  readonly workItemCount: number;
  readonly candidateCount: number;
  readonly acceptedArtifactCount: number;
  readonly workItemsByLifecycle: PortfolioExecutionSummaryProjectionJson["workItemsByLifecycle"];
  readonly candidatesByLifecycle: PortfolioExecutionSummaryProjectionJson["candidatesByLifecycle"];
  readonly outcomes: readonly PortfolioWorkspacePresentationOutcomeValue[];
}

export interface PortfolioWorkItemSummaryResponse {
  readonly id: string;
  readonly lifecycle: PortfolioWorkItemSummaryProjectionJson["lifecycle"];
}

export interface ArtifactCandidateSummaryResponse {
  readonly id: string;
  readonly lifecycle: ArtifactCandidateSummaryProjectionJson["lifecycle"];
}

export interface AcceptedArtifactSummaryResponse {
  readonly id: string;
}

interface BasePresentationResponse {
  readonly version: PortfolioWorkspacePresentationVersion;
  readonly correlationId: string;
  readonly outcome: PortfolioWorkspacePresentationOutcomeValue;
  readonly execution: PortfolioExecutionSummaryResponse;
}

export interface BeginExecutionPresentationResponse extends BasePresentationResponse {
  readonly outcome: typeof PortfolioWorkspacePresentationOutcome.ExecutionStarted;
}

export interface InitializePortfolioExecutionPresentationResponse extends BasePresentationResponse {
  readonly outcome: typeof PortfolioWorkspacePresentationOutcome.ExecutionInitialized;
}

export interface GetPortfolioExecutionPresentationResponse {
  readonly version: PortfolioWorkspacePresentationVersion;
  readonly correlationId?: string;
  readonly execution: PortfolioExecutionSummaryResponse;
}

export interface ActivateWorkItemPresentationResponse extends BasePresentationResponse {
  readonly outcome: typeof PortfolioWorkspacePresentationOutcome.WorkItemActivated;
  readonly workItem: PortfolioWorkItemSummaryResponse;
}

export interface CompleteWorkItemPresentationResponse extends BasePresentationResponse {
  readonly outcome: typeof PortfolioWorkspacePresentationOutcome.WorkItemCompleted;
}

export interface CancelWorkItemPresentationResponse extends BasePresentationResponse {
  readonly outcome: typeof PortfolioWorkspacePresentationOutcome.WorkItemCancelled;
  readonly workItem: PortfolioWorkItemSummaryResponse;
}

export interface AcceptCandidatePresentationResponse extends BasePresentationResponse {
  readonly outcome: typeof PortfolioWorkspacePresentationOutcome.CandidateAccepted;
  readonly acceptedArtifact: AcceptedArtifactSummaryResponse;
}

export interface RejectCandidatePresentationResponse extends BasePresentationResponse {
  readonly outcome: typeof PortfolioWorkspacePresentationOutcome.CandidateRejected;
}

export interface CompleteExecutionPresentationResponse extends BasePresentationResponse {
  readonly outcome: typeof PortfolioWorkspacePresentationOutcome.ExecutionCompleted;
}

export interface CancelExecutionPresentationResponse extends BasePresentationResponse {
  readonly outcome: typeof PortfolioWorkspacePresentationOutcome.ExecutionCancelled;
}

export function mapExecutionSummaryProjection(
  summary: PortfolioExecutionSummaryProjectionJson
): PortfolioExecutionSummaryResponse {
  return Object.freeze({
    executionId: summary.executionId,
    lifecycle: summary.lifecycle,
    portfolioPlanReference: Object.freeze({ ...summary.portfolioPlanReference }),
    planSnapshotReference: Object.freeze({ ...summary.planSnapshotReference }),
    approvalReference: Object.freeze({ ...summary.approvalReference }),
    workItemCount: summary.workItemCount,
    candidateCount: summary.candidateCount,
    acceptedArtifactCount: summary.acceptedArtifactCount,
    workItemsByLifecycle: Object.freeze({ ...summary.workItemsByLifecycle }),
    candidatesByLifecycle: Object.freeze({ ...summary.candidatesByLifecycle }),
    outcomes: Object.freeze(summary.factTypes.map(mapFactTypeToOutcome))
  });
}

export function mapWorkItemSummaryProjection(
  summary: PortfolioWorkItemSummaryProjectionJson
): PortfolioWorkItemSummaryResponse {
  return Object.freeze({
    id: summary.id,
    lifecycle: summary.lifecycle
  });
}

export function mapAcceptedArtifactSummaryProjection(
  summary: AcceptedArtifactSummaryProjectionJson
): AcceptedArtifactSummaryResponse {
  return Object.freeze({
    id: summary.id
  });
}

export function createBasePresentationResponse<TOutcome extends PortfolioWorkspacePresentationOutcomeValue>(input: {
  readonly correlationId: string;
  readonly outcome: TOutcome;
  readonly summary: PortfolioExecutionSummaryProjectionJson;
}): {
  readonly version: PortfolioWorkspacePresentationVersion;
  readonly correlationId: string;
  readonly outcome: TOutcome;
  readonly execution: PortfolioExecutionSummaryResponse;
} {
  return Object.freeze({
    version: PORTFOLIO_WORKSPACE_PRESENTATION_VERSION,
    correlationId: input.correlationId,
    outcome: input.outcome,
    execution: mapExecutionSummaryProjection(input.summary)
  });
}

function mapFactTypeToOutcome(factType: PortfolioExecutionSummaryProjectionJson["factTypes"][number]): PortfolioWorkspacePresentationOutcomeValue {
  switch (factType) {
    case "PortfolioExecutionInitialized":
      return PortfolioWorkspacePresentationOutcome.ExecutionInitialized;
    case "PortfolioExecutionStarted":
      return PortfolioWorkspacePresentationOutcome.ExecutionStarted;
    case "PortfolioWorkItemActivated":
      return PortfolioWorkspacePresentationOutcome.WorkItemActivated;
    case "PortfolioWorkItemCompleted":
      return PortfolioWorkspacePresentationOutcome.WorkItemCompleted;
    case "PortfolioWorkItemCancelled":
      return PortfolioWorkspacePresentationOutcome.WorkItemCancelled;
    case "ArtifactCandidateAccepted":
      return PortfolioWorkspacePresentationOutcome.CandidateAccepted;
    case "ArtifactCandidateRejected":
      return PortfolioWorkspacePresentationOutcome.CandidateRejected;
    case "PortfolioExecutionCompleted":
      return PortfolioWorkspacePresentationOutcome.ExecutionCompleted;
    case "PortfolioExecutionCancelled":
      return PortfolioWorkspacePresentationOutcome.ExecutionCancelled;
  }
}
