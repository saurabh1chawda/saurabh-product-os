import { PortfolioExecution } from "../aggregate/PortfolioExecution";
import { AcceptedArtifact } from "../entities/AcceptedArtifact";
import { ArtifactCandidate } from "../entities/ArtifactCandidate";
import { PortfolioWorkItem } from "../entities/PortfolioWorkItem";
import type { PortfolioExecutionFact } from "../facts/PortfolioExecutionFacts";
import { ArtifactCandidateLifecycle } from "../models/ArtifactCandidateLifecycle";
import type { ArtifactCandidateLifecycleValue } from "../models/ArtifactCandidateLifecycle";
import type { PortfolioExecutionLifecycleValue } from "../models/PortfolioExecutionLifecycle";
import { PortfolioWorkItemLifecycle } from "../models/PortfolioWorkItemLifecycle";
import type { PortfolioWorkItemLifecycleValue } from "../models/PortfolioWorkItemLifecycle";

export interface PortfolioWorkItemSummaryProjectionJson {
  readonly id: string;
  readonly lifecycle: PortfolioWorkItemLifecycleValue;
}

export interface ArtifactCandidateSummaryProjectionJson {
  readonly id: string;
  readonly lifecycle: ArtifactCandidateLifecycleValue;
}

export interface AcceptedArtifactSummaryProjectionJson {
  readonly id: string;
}

export interface PortfolioExecutionSummaryProjectionJson {
  readonly executionId: string;
  readonly lifecycle: PortfolioExecutionLifecycleValue;
  readonly portfolioPlanReference: ReturnType<PortfolioExecution["portfolioPlanReference"]["toJSON"]>;
  readonly planSnapshotReference: ReturnType<PortfolioExecution["planSnapshotReference"]["toJSON"]>;
  readonly approvalReference: ReturnType<PortfolioExecution["approvalReference"]["toJSON"]>;
  readonly workItemCount: number;
  readonly candidateCount: number;
  readonly acceptedArtifactCount: number;
  readonly workItemsByLifecycle: Readonly<Record<PortfolioWorkItemLifecycleValue, number>>;
  readonly candidatesByLifecycle: Readonly<Record<ArtifactCandidateLifecycleValue, number>>;
  readonly factTypes: readonly PortfolioExecutionFact["type"][];
}

export class PortfolioWorkItemSummaryProjection {
  private readonly __portfolioWorkItemSummaryProjectionBrand!: never;

  readonly id: string;
  readonly lifecycle: PortfolioWorkItemLifecycleValue;

  private constructor(input: PortfolioWorkItemSummaryProjectionJson) {
    this.id = input.id;
    this.lifecycle = input.lifecycle;
    Object.freeze(this);
  }

  static fromWorkItem(workItem: PortfolioWorkItem): PortfolioWorkItemSummaryProjection {
    return new PortfolioWorkItemSummaryProjection({
      id: workItem.id.toJSON(),
      lifecycle: workItem.lifecycle
    });
  }

  equals(other: PortfolioWorkItemSummaryProjection | undefined): boolean {
    return other instanceof PortfolioWorkItemSummaryProjection
      && this.id === other.id
      && this.lifecycle === other.lifecycle;
  }

  toJSON(): PortfolioWorkItemSummaryProjectionJson {
    return {
      id: this.id,
      lifecycle: this.lifecycle
    };
  }
}

export class ArtifactCandidateSummaryProjection {
  private readonly __artifactCandidateSummaryProjectionBrand!: never;

  readonly id: string;
  readonly lifecycle: ArtifactCandidateLifecycleValue;

  private constructor(input: ArtifactCandidateSummaryProjectionJson) {
    this.id = input.id;
    this.lifecycle = input.lifecycle;
    Object.freeze(this);
  }

  static fromCandidate(candidate: ArtifactCandidate): ArtifactCandidateSummaryProjection {
    return new ArtifactCandidateSummaryProjection({
      id: candidate.id.toJSON(),
      lifecycle: candidate.lifecycle
    });
  }

  equals(other: ArtifactCandidateSummaryProjection | undefined): boolean {
    return other instanceof ArtifactCandidateSummaryProjection
      && this.id === other.id
      && this.lifecycle === other.lifecycle;
  }

  toJSON(): ArtifactCandidateSummaryProjectionJson {
    return {
      id: this.id,
      lifecycle: this.lifecycle
    };
  }
}

export class AcceptedArtifactSummaryProjection {
  private readonly __acceptedArtifactSummaryProjectionBrand!: never;

  readonly id: string;

  private constructor(input: AcceptedArtifactSummaryProjectionJson) {
    this.id = input.id;
    Object.freeze(this);
  }

  static fromAcceptedArtifact(acceptedArtifact: AcceptedArtifact): AcceptedArtifactSummaryProjection {
    return new AcceptedArtifactSummaryProjection({
      id: acceptedArtifact.id.toJSON()
    });
  }

  equals(other: AcceptedArtifactSummaryProjection | undefined): boolean {
    return other instanceof AcceptedArtifactSummaryProjection
      && this.id === other.id;
  }

  toJSON(): AcceptedArtifactSummaryProjectionJson {
    return {
      id: this.id
    };
  }
}

export class PortfolioExecutionSummaryProjection {
  private readonly __portfolioExecutionSummaryProjectionBrand!: never;

  readonly executionId: string;
  readonly lifecycle: PortfolioExecutionLifecycleValue;
  readonly portfolioPlanReference: ReturnType<PortfolioExecution["portfolioPlanReference"]["toJSON"]>;
  readonly planSnapshotReference: ReturnType<PortfolioExecution["planSnapshotReference"]["toJSON"]>;
  readonly approvalReference: ReturnType<PortfolioExecution["approvalReference"]["toJSON"]>;
  readonly workItemCount: number;
  readonly candidateCount: number;
  readonly acceptedArtifactCount: number;
  readonly workItemsByLifecycle: Readonly<Record<PortfolioWorkItemLifecycleValue, number>>;
  readonly candidatesByLifecycle: Readonly<Record<ArtifactCandidateLifecycleValue, number>>;
  readonly factTypes: readonly PortfolioExecutionFact["type"][];

  private constructor(input: PortfolioExecutionSummaryProjectionJson) {
    this.executionId = input.executionId;
    this.lifecycle = input.lifecycle;
    this.portfolioPlanReference = Object.freeze({ ...input.portfolioPlanReference });
    this.planSnapshotReference = Object.freeze({ ...input.planSnapshotReference });
    this.approvalReference = Object.freeze({ ...input.approvalReference });
    this.workItemCount = input.workItemCount;
    this.candidateCount = input.candidateCount;
    this.acceptedArtifactCount = input.acceptedArtifactCount;
    this.workItemsByLifecycle = Object.freeze({ ...input.workItemsByLifecycle });
    this.candidatesByLifecycle = Object.freeze({ ...input.candidatesByLifecycle });
    this.factTypes = Object.freeze([...input.factTypes]);
    Object.freeze(this);
  }

  static fromExecution(
    execution: PortfolioExecution,
    facts: readonly PortfolioExecutionFact[] = []
  ): PortfolioExecutionSummaryProjection {
    const workItems = execution.workItems();
    const candidates = execution.candidates();

    return new PortfolioExecutionSummaryProjection({
      executionId: execution.id.toJSON(),
      lifecycle: execution.lifecycle,
      portfolioPlanReference: execution.portfolioPlanReference.toJSON(),
      planSnapshotReference: execution.planSnapshotReference.toJSON(),
      approvalReference: execution.approvalReference.toJSON(),
      workItemCount: workItems.length,
      candidateCount: candidates.length,
      acceptedArtifactCount: execution.acceptedArtifacts().length,
      workItemsByLifecycle: countWorkItemsByLifecycle(workItems),
      candidatesByLifecycle: countCandidatesByLifecycle(candidates),
      factTypes: facts.map((fact) => fact.type)
    });
  }

  equals(other: PortfolioExecutionSummaryProjection | undefined): boolean {
    return other instanceof PortfolioExecutionSummaryProjection
      && JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON());
  }

  toJSON(): PortfolioExecutionSummaryProjectionJson {
    return {
      executionId: this.executionId,
      lifecycle: this.lifecycle,
      portfolioPlanReference: { ...this.portfolioPlanReference },
      planSnapshotReference: { ...this.planSnapshotReference },
      approvalReference: { ...this.approvalReference },
      workItemCount: this.workItemCount,
      candidateCount: this.candidateCount,
      acceptedArtifactCount: this.acceptedArtifactCount,
      workItemsByLifecycle: { ...this.workItemsByLifecycle },
      candidatesByLifecycle: { ...this.candidatesByLifecycle },
      factTypes: [...this.factTypes]
    };
  }
}

function countWorkItemsByLifecycle(
  workItems: readonly PortfolioWorkItem[]
): Readonly<Record<PortfolioWorkItemLifecycleValue, number>> {
  const counts = {
    [PortfolioWorkItemLifecycle.Pending]: 0,
    [PortfolioWorkItemLifecycle.Active]: 0,
    [PortfolioWorkItemLifecycle.Blocked]: 0,
    [PortfolioWorkItemLifecycle.ReadyForReview]: 0,
    [PortfolioWorkItemLifecycle.Completed]: 0,
    [PortfolioWorkItemLifecycle.Cancelled]: 0
  };

  for (const workItem of workItems) {
    counts[workItem.lifecycle] += 1;
  }

  return Object.freeze(counts);
}

function countCandidatesByLifecycle(
  candidates: readonly ArtifactCandidate[]
): Readonly<Record<ArtifactCandidateLifecycleValue, number>> {
  const counts = {
    [ArtifactCandidateLifecycle.Registered]: 0,
    [ArtifactCandidateLifecycle.Accepted]: 0,
    [ArtifactCandidateLifecycle.Rejected]: 0
  };

  for (const candidate of candidates) {
    counts[candidate.lifecycle] += 1;
  }

  return Object.freeze(counts);
}
