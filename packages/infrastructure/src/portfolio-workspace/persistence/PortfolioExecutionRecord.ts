import type {
  ArtifactCandidateLifecycleValue,
  PortfolioExecutionLifecycleValue,
  PortfolioWorkItemLifecycleValue
} from "@career-companion/portfolio-workspace";

export const PORTFOLIO_EXECUTION_RECORD_VERSION = 1;

export type PortfolioExecutionRecordVersion = typeof PORTFOLIO_EXECUTION_RECORD_VERSION;

export interface PortfolioExecutionRecord {
  readonly recordVersion: PortfolioExecutionRecordVersion;
  readonly executionId: string;
  readonly aggregatePayload: PortfolioExecutionAggregatePayload;
}

export interface PortfolioExecutionAggregatePayload {
  readonly id: string;
  readonly portfolioPlanReference: {
    readonly planId: string;
    readonly roadmapId: string;
    readonly planArtifactReference: string;
  };
  readonly planSnapshotReference: {
    readonly snapshotReference: string;
  };
  readonly approvalReference: {
    readonly approvalReference: string;
  };
  readonly commandContext: {
    readonly commandId: string;
    readonly correlationId: string;
    readonly actorReference: string;
    readonly occurredAt: string;
  };
  readonly lifecycle: PortfolioExecutionLifecycleValue;
  readonly workItems: readonly {
    readonly id: string;
    readonly lifecycle: PortfolioWorkItemLifecycleValue;
  }[];
  readonly candidates: readonly {
    readonly id: string;
    readonly lifecycle: ArtifactCandidateLifecycleValue;
  }[];
  readonly acceptedArtifacts: readonly {
    readonly id: string;
  }[];
}
