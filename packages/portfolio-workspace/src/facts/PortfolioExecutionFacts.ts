import { InvalidExecutionOperationError } from "../errors/PortfolioWorkspaceDomainErrors";
import { CandidateId } from "../value-objects/CandidateId";
import { ExecutionId } from "../value-objects/ExecutionId";
import { ApprovalReference } from "../value-objects/ApprovalReference";
import { PlanSnapshotReference } from "../value-objects/PlanSnapshotReference";
import { PortfolioExecutionCommandContext } from "../value-objects/PortfolioExecutionCommandContext";
import { PortfolioPlanReference } from "../value-objects/PortfolioPlanReference";
import { PortfolioWorkspaceAuthorizationResourceReference } from "../value-objects/PortfolioWorkspaceAuthorizationResourceReference";
import { WorkItemId } from "../value-objects/WorkItemId";
import { AcceptedArtifactId } from "../value-objects/AcceptedArtifactId";

type WorkItemFactType =
  | "PortfolioWorkItemActivated"
  | "PortfolioWorkItemCompleted"
  | "PortfolioWorkItemCancelled";

type CandidateFactType =
  | "ArtifactCandidateAccepted"
  | "ArtifactCandidateRejected";

type ExecutionFactType =
  | "PortfolioExecutionInitialized"
  | "PortfolioExecutionStarted"
  | "PortfolioExecutionCompleted"
  | "PortfolioExecutionCancelled";

type PortfolioExecutionFactType =
  | WorkItemFactType
  | CandidateFactType
  | ExecutionFactType;

interface ExecutionFactInput {
  readonly executionId: ExecutionId;
  readonly commandContext: PortfolioExecutionCommandContext;
}

interface ExecutionInitializedFactInput extends ExecutionFactInput {
  readonly portfolioPlanReference: PortfolioPlanReference;
  readonly planSnapshotReference: PlanSnapshotReference;
  readonly approvalReference: ApprovalReference;
  readonly authorizationResourceReference: PortfolioWorkspaceAuthorizationResourceReference;
}

interface WorkItemFactInput extends ExecutionFactInput {
  readonly workItemId: WorkItemId;
}

interface CandidateFactInput extends ExecutionFactInput {
  readonly candidateId: CandidateId;
}

interface CandidateAcceptedFactInput extends CandidateFactInput {
  readonly acceptedArtifactId: AcceptedArtifactId;
}

export class PortfolioWorkItemActivatedFact {
  private readonly __portfolioWorkItemActivatedFactBrand!: never;

  readonly type = "PortfolioWorkItemActivated";
  readonly executionId: ExecutionId;
  readonly workItemId: WorkItemId;
  readonly commandContext: PortfolioExecutionCommandContext;

  constructor(input: WorkItemFactInput) {
    assertExecutionFactInput(input);
    assertInstance(input.workItemId, WorkItemId);

    this.executionId = input.executionId;
    this.workItemId = input.workItemId;
    this.commandContext = input.commandContext;
    Object.freeze(this);
  }

  equals(other: PortfolioWorkItemActivatedFact | undefined): boolean {
    return other instanceof PortfolioWorkItemActivatedFact
      && workItemFactEquals(this, other);
  }

  toJSON(): WorkItemFactJson<"PortfolioWorkItemActivated"> {
    return workItemFactJson(this);
  }
}

export class PortfolioWorkItemCompletedFact {
  private readonly __portfolioWorkItemCompletedFactBrand!: never;

  readonly type = "PortfolioWorkItemCompleted";
  readonly executionId: ExecutionId;
  readonly workItemId: WorkItemId;
  readonly commandContext: PortfolioExecutionCommandContext;

  constructor(input: WorkItemFactInput) {
    assertExecutionFactInput(input);
    assertInstance(input.workItemId, WorkItemId);

    this.executionId = input.executionId;
    this.workItemId = input.workItemId;
    this.commandContext = input.commandContext;
    Object.freeze(this);
  }

  equals(other: PortfolioWorkItemCompletedFact | undefined): boolean {
    return other instanceof PortfolioWorkItemCompletedFact
      && workItemFactEquals(this, other);
  }

  toJSON(): WorkItemFactJson<"PortfolioWorkItemCompleted"> {
    return workItemFactJson(this);
  }
}

export class PortfolioWorkItemCancelledFact {
  private readonly __portfolioWorkItemCancelledFactBrand!: never;

  readonly type = "PortfolioWorkItemCancelled";
  readonly executionId: ExecutionId;
  readonly workItemId: WorkItemId;
  readonly commandContext: PortfolioExecutionCommandContext;

  constructor(input: WorkItemFactInput) {
    assertExecutionFactInput(input);
    assertInstance(input.workItemId, WorkItemId);

    this.executionId = input.executionId;
    this.workItemId = input.workItemId;
    this.commandContext = input.commandContext;
    Object.freeze(this);
  }

  equals(other: PortfolioWorkItemCancelledFact | undefined): boolean {
    return other instanceof PortfolioWorkItemCancelledFact
      && workItemFactEquals(this, other);
  }

  toJSON(): WorkItemFactJson<"PortfolioWorkItemCancelled"> {
    return workItemFactJson(this);
  }
}

export class ArtifactCandidateAcceptedFact {
  private readonly __artifactCandidateAcceptedFactBrand!: never;

  readonly type = "ArtifactCandidateAccepted";
  readonly executionId: ExecutionId;
  readonly candidateId: CandidateId;
  readonly acceptedArtifactId: AcceptedArtifactId;
  readonly commandContext: PortfolioExecutionCommandContext;

  constructor(input: CandidateAcceptedFactInput) {
    assertExecutionFactInput(input);
    assertInstance(input.candidateId, CandidateId);
    assertInstance(input.acceptedArtifactId, AcceptedArtifactId);

    this.executionId = input.executionId;
    this.candidateId = input.candidateId;
    this.acceptedArtifactId = input.acceptedArtifactId;
    this.commandContext = input.commandContext;
    Object.freeze(this);
  }

  equals(other: ArtifactCandidateAcceptedFact | undefined): boolean {
    return other instanceof ArtifactCandidateAcceptedFact
      && candidateFactEquals(this, other)
      && this.acceptedArtifactId.equals(other.acceptedArtifactId);
  }

  toJSON(): CandidateAcceptedFactJson<"ArtifactCandidateAccepted"> {
    return {
      ...candidateFactJson(this),
      acceptedArtifactId: this.acceptedArtifactId.toJSON()
    };
  }
}

export class ArtifactCandidateRejectedFact {
  private readonly __artifactCandidateRejectedFactBrand!: never;

  readonly type = "ArtifactCandidateRejected";
  readonly executionId: ExecutionId;
  readonly candidateId: CandidateId;
  readonly commandContext: PortfolioExecutionCommandContext;

  constructor(input: CandidateFactInput) {
    assertExecutionFactInput(input);
    assertInstance(input.candidateId, CandidateId);

    this.executionId = input.executionId;
    this.candidateId = input.candidateId;
    this.commandContext = input.commandContext;
    Object.freeze(this);
  }

  equals(other: ArtifactCandidateRejectedFact | undefined): boolean {
    return other instanceof ArtifactCandidateRejectedFact
      && candidateFactEquals(this, other);
  }

  toJSON(): CandidateFactJson<"ArtifactCandidateRejected"> {
    return candidateFactJson(this);
  }
}

export class PortfolioExecutionStartedFact {
  private readonly __portfolioExecutionStartedFactBrand!: never;

  readonly type = "PortfolioExecutionStarted";
  readonly executionId: ExecutionId;
  readonly commandContext: PortfolioExecutionCommandContext;

  constructor(input: ExecutionFactInput) {
    assertExecutionFactInput(input);

    this.executionId = input.executionId;
    this.commandContext = input.commandContext;
    Object.freeze(this);
  }

  equals(other: PortfolioExecutionStartedFact | undefined): boolean {
    return other instanceof PortfolioExecutionStartedFact
      && executionFactEquals(this, other);
  }

  toJSON(): ExecutionFactJson<"PortfolioExecutionStarted"> {
    return executionFactJson(this);
  }
}

export class PortfolioExecutionInitializedFact {
  private readonly __portfolioExecutionInitializedFactBrand!: never;

  readonly type = "PortfolioExecutionInitialized";
  readonly executionId: ExecutionId;
  readonly portfolioPlanReference: PortfolioPlanReference;
  readonly planSnapshotReference: PlanSnapshotReference;
  readonly approvalReference: ApprovalReference;
  readonly authorizationResourceReference: PortfolioWorkspaceAuthorizationResourceReference;
  readonly commandContext: PortfolioExecutionCommandContext;

  constructor(input: ExecutionInitializedFactInput) {
    assertExecutionFactInput(input);
    assertInstance(input.portfolioPlanReference, PortfolioPlanReference);
    assertInstance(input.planSnapshotReference, PlanSnapshotReference);
    assertInstance(input.approvalReference, ApprovalReference);
    assertInstance(input.authorizationResourceReference, PortfolioWorkspaceAuthorizationResourceReference);

    this.executionId = input.executionId;
    this.portfolioPlanReference = input.portfolioPlanReference;
    this.planSnapshotReference = input.planSnapshotReference;
    this.approvalReference = input.approvalReference;
    this.authorizationResourceReference = input.authorizationResourceReference;
    this.commandContext = input.commandContext;
    Object.freeze(this);
  }

  equals(other: PortfolioExecutionInitializedFact | undefined): boolean {
    return other instanceof PortfolioExecutionInitializedFact
      && executionFactEquals(this, other)
      && this.portfolioPlanReference.equals(other.portfolioPlanReference)
      && this.planSnapshotReference.equals(other.planSnapshotReference)
      && this.approvalReference.equals(other.approvalReference)
      && this.authorizationResourceReference.equals(other.authorizationResourceReference);
  }

  toJSON(): ExecutionInitializedFactJson {
    return {
      ...executionFactJson(this),
      portfolioPlanReference: this.portfolioPlanReference.toJSON(),
      planSnapshotReference: this.planSnapshotReference.toJSON(),
      approvalReference: this.approvalReference.toJSON(),
      authorizationResourceReference: this.authorizationResourceReference.toJSON()
    };
  }
}

export class PortfolioExecutionCompletedFact {
  private readonly __portfolioExecutionCompletedFactBrand!: never;

  readonly type = "PortfolioExecutionCompleted";
  readonly executionId: ExecutionId;
  readonly commandContext: PortfolioExecutionCommandContext;

  constructor(input: ExecutionFactInput) {
    assertExecutionFactInput(input);

    this.executionId = input.executionId;
    this.commandContext = input.commandContext;
    Object.freeze(this);
  }

  equals(other: PortfolioExecutionCompletedFact | undefined): boolean {
    return other instanceof PortfolioExecutionCompletedFact
      && executionFactEquals(this, other);
  }

  toJSON(): ExecutionFactJson<"PortfolioExecutionCompleted"> {
    return executionFactJson(this);
  }
}

export class PortfolioExecutionCancelledFact {
  private readonly __portfolioExecutionCancelledFactBrand!: never;

  readonly type = "PortfolioExecutionCancelled";
  readonly executionId: ExecutionId;
  readonly commandContext: PortfolioExecutionCommandContext;

  constructor(input: ExecutionFactInput) {
    assertExecutionFactInput(input);

    this.executionId = input.executionId;
    this.commandContext = input.commandContext;
    Object.freeze(this);
  }

  equals(other: PortfolioExecutionCancelledFact | undefined): boolean {
    return other instanceof PortfolioExecutionCancelledFact
      && executionFactEquals(this, other);
  }

  toJSON(): ExecutionFactJson<"PortfolioExecutionCancelled"> {
    return executionFactJson(this);
  }
}

export type PortfolioExecutionFact =
  | PortfolioWorkItemActivatedFact
  | PortfolioWorkItemCompletedFact
  | PortfolioWorkItemCancelledFact
  | ArtifactCandidateAcceptedFact
  | ArtifactCandidateRejectedFact
  | PortfolioExecutionInitializedFact
  | PortfolioExecutionStartedFact
  | PortfolioExecutionCompletedFact
  | PortfolioExecutionCancelledFact;

interface ExecutionFactJson<TType extends PortfolioExecutionFactType> {
  readonly type: TType;
  readonly executionId: string;
  readonly commandContext: ReturnType<PortfolioExecutionCommandContext["toJSON"]>;
}

interface ExecutionInitializedFactJson extends ExecutionFactJson<"PortfolioExecutionInitialized"> {
  readonly portfolioPlanReference: ReturnType<PortfolioPlanReference["toJSON"]>;
  readonly planSnapshotReference: ReturnType<PlanSnapshotReference["toJSON"]>;
  readonly approvalReference: ReturnType<ApprovalReference["toJSON"]>;
  readonly authorizationResourceReference: ReturnType<PortfolioWorkspaceAuthorizationResourceReference["toJSON"]>;
}

interface WorkItemFactJson<TType extends WorkItemFactType> extends ExecutionFactJson<TType> {
  readonly workItemId: string;
}

interface CandidateFactJson<TType extends CandidateFactType> extends ExecutionFactJson<TType> {
  readonly candidateId: string;
}

interface CandidateAcceptedFactJson<TType extends "ArtifactCandidateAccepted"> extends CandidateFactJson<TType> {
  readonly acceptedArtifactId: string;
}

function assertExecutionFactInput(input: ExecutionFactInput): void {
  assertInstance(input.executionId, ExecutionId);
  assertInstance(input.commandContext, PortfolioExecutionCommandContext);
}

function assertInstance<T>(value: unknown, constructor: new (...args: never[]) => T): asserts value is T {
  if (!(value instanceof constructor)) {
    throw new InvalidExecutionOperationError();
  }
}

function executionFactEquals(
  left: Pick<ExecutionFactInput, "executionId" | "commandContext">,
  right: Pick<ExecutionFactInput, "executionId" | "commandContext">
): boolean {
  return left.executionId.equals(right.executionId)
    && left.commandContext.equals(right.commandContext);
}

function workItemFactEquals(
  left: Pick<WorkItemFactInput, "executionId" | "workItemId" | "commandContext">,
  right: Pick<WorkItemFactInput, "executionId" | "workItemId" | "commandContext">
): boolean {
  return executionFactEquals(left, right)
    && left.workItemId.equals(right.workItemId);
}

function candidateFactEquals(
  left: Pick<CandidateFactInput, "executionId" | "candidateId" | "commandContext">,
  right: Pick<CandidateFactInput, "executionId" | "candidateId" | "commandContext">
): boolean {
  return executionFactEquals(left, right)
    && left.candidateId.equals(right.candidateId);
}

function executionFactJson<TType extends PortfolioExecutionFactType>(
  fact: Pick<ExecutionFactJson<TType>, "type"> & ExecutionFactInput
): ExecutionFactJson<TType> {
  return {
    type: fact.type,
    executionId: fact.executionId.toJSON(),
    commandContext: fact.commandContext.toJSON()
  };
}

function workItemFactJson<TType extends WorkItemFactType>(
  fact: Pick<WorkItemFactJson<TType>, "type"> & WorkItemFactInput
): WorkItemFactJson<TType> {
  return {
    ...executionFactJson(fact),
    workItemId: fact.workItemId.toJSON()
  };
}

function candidateFactJson<TType extends CandidateFactType>(
  fact: Pick<CandidateFactJson<TType>, "type"> & CandidateFactInput
): CandidateFactJson<TType> {
  return {
    ...executionFactJson(fact),
    candidateId: fact.candidateId.toJSON()
  };
}
