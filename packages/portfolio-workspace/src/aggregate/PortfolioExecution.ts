import { AcceptedArtifact } from "../entities/AcceptedArtifact";
import { ArtifactCandidate } from "../entities/ArtifactCandidate";
import { PortfolioWorkItem } from "../entities/PortfolioWorkItem";
import {
  DuplicateAcceptedArtifactError,
  DuplicateCandidateError,
  DuplicateWorkItemError,
  InvalidExecutionOperationError,
  UnknownCandidateError,
  UnknownWorkItemError
} from "../errors/PortfolioWorkspaceDomainErrors";
import {
  ArtifactCandidateAcceptedFact,
  ArtifactCandidateRejectedFact,
  PortfolioExecutionCancelledFact,
  PortfolioExecutionCompletedFact,
  PortfolioExecutionInitializedFact,
  PortfolioExecutionStartedFact,
  PortfolioWorkItemActivatedFact,
  PortfolioWorkItemCancelledFact,
  PortfolioWorkItemCompletedFact
} from "../facts/PortfolioExecutionFacts";
import {
  PortfolioExecutionLifecycle,
  type PortfolioExecutionLifecycleValue
} from "../models/PortfolioExecutionLifecycle";
import { AcceptedArtifactId } from "../value-objects/AcceptedArtifactId";
import { ApprovalReference } from "../value-objects/ApprovalReference";
import { CandidateId } from "../value-objects/CandidateId";
import { ExecutionId } from "../value-objects/ExecutionId";
import { PlanSnapshotReference } from "../value-objects/PlanSnapshotReference";
import { PortfolioExecutionCommandContext } from "../value-objects/PortfolioExecutionCommandContext";
import { PortfolioPlanReference } from "../value-objects/PortfolioPlanReference";
import { PortfolioWorkspaceAuthorizationResourceReference } from "../value-objects/PortfolioWorkspaceAuthorizationResourceReference";
import { WorkItemId } from "../value-objects/WorkItemId";

export class PortfolioExecution {
  private readonly __portfolioExecutionBrand!: never;

  readonly id: ExecutionId;
  readonly portfolioPlanReference: PortfolioPlanReference;
  readonly planSnapshotReference: PlanSnapshotReference;
  readonly approvalReference: ApprovalReference;
  readonly authorizationResourceReference: PortfolioWorkspaceAuthorizationResourceReference;
  readonly commandContext: PortfolioExecutionCommandContext;

  private readonly ownedWorkItems: PortfolioWorkItem[] = [];
  private readonly ownedCandidates: ArtifactCandidate[] = [];
  private readonly ownedAcceptedArtifacts: AcceptedArtifact[] = [];
  private currentLifecycle: PortfolioExecutionLifecycleValue;

  constructor(input: {
    readonly id: ExecutionId;
    readonly portfolioPlanReference: PortfolioPlanReference;
    readonly planSnapshotReference: PlanSnapshotReference;
    readonly approvalReference: ApprovalReference;
    readonly authorizationResourceReference: PortfolioWorkspaceAuthorizationResourceReference;
    readonly commandContext: PortfolioExecutionCommandContext;
    readonly lifecycle: PortfolioExecutionLifecycleValue;
    readonly workItems?: readonly PortfolioWorkItem[];
    readonly candidates?: readonly ArtifactCandidate[];
    readonly acceptedArtifacts?: readonly AcceptedArtifact[];
  }) {
    assertInstance(input.id, ExecutionId);
    assertInstance(input.portfolioPlanReference, PortfolioPlanReference);
    assertInstance(input.planSnapshotReference, PlanSnapshotReference);
    assertInstance(input.approvalReference, ApprovalReference);
    assertInstance(input.authorizationResourceReference, PortfolioWorkspaceAuthorizationResourceReference);
    assertInstance(input.commandContext, PortfolioExecutionCommandContext);
    if (!isPortfolioExecutionLifecycle(input.lifecycle)) {
      throw new InvalidExecutionOperationError();
    }

    this.id = input.id;
    this.portfolioPlanReference = input.portfolioPlanReference;
    this.planSnapshotReference = input.planSnapshotReference;
    this.approvalReference = input.approvalReference;
    this.authorizationResourceReference = input.authorizationResourceReference;
    this.commandContext = input.commandContext;
    this.currentLifecycle = input.lifecycle;

    for (const workItem of input.workItems ?? []) {
      this.registerWorkItem(workItem);
    }
    for (const candidate of input.candidates ?? []) {
      this.registerCandidate(candidate);
    }
    for (const acceptedArtifact of input.acceptedArtifacts ?? []) {
      this.recordAcceptedArtifact(acceptedArtifact);
    }
  }

  static initialize(input: {
    readonly id: ExecutionId;
    readonly portfolioPlanReference: PortfolioPlanReference;
    readonly planSnapshotReference: PlanSnapshotReference;
    readonly approvalReference: ApprovalReference;
    readonly authorizationResourceReference: PortfolioWorkspaceAuthorizationResourceReference;
    readonly commandContext: PortfolioExecutionCommandContext;
    readonly workItems?: readonly PortfolioWorkItem[];
    readonly candidates?: readonly ArtifactCandidate[];
  }): PortfolioExecutionInitializationResult {
    assertInstance(input.id, ExecutionId);
    assertInstance(input.portfolioPlanReference, PortfolioPlanReference);
    assertInstance(input.planSnapshotReference, PlanSnapshotReference);
    assertInstance(input.approvalReference, ApprovalReference);
    assertInstance(input.authorizationResourceReference, PortfolioWorkspaceAuthorizationResourceReference);
    assertInstance(input.commandContext, PortfolioExecutionCommandContext);

    const execution = new PortfolioExecution({
      id: input.id,
      portfolioPlanReference: input.portfolioPlanReference,
      planSnapshotReference: input.planSnapshotReference,
      approvalReference: input.approvalReference,
      authorizationResourceReference: input.authorizationResourceReference,
      commandContext: input.commandContext,
      lifecycle: PortfolioExecutionLifecycle.Initialized,
      workItems: input.workItems,
      candidates: input.candidates,
      acceptedArtifacts: []
    });

    return new PortfolioExecutionInitializationResult({
      execution,
      fact: new PortfolioExecutionInitializedFact({
        executionId: input.id,
        portfolioPlanReference: input.portfolioPlanReference,
        planSnapshotReference: input.planSnapshotReference,
        approvalReference: input.approvalReference,
        authorizationResourceReference: input.authorizationResourceReference,
        commandContext: input.commandContext
      })
    });
  }

  get lifecycle(): PortfolioExecutionLifecycleValue {
    return this.currentLifecycle;
  }

  private registerWorkItem(workItem: PortfolioWorkItem): void {
    assertInstance(workItem, PortfolioWorkItem);
    if (this.hasWorkItem(workItem.id)) {
      throw new DuplicateWorkItemError();
    }

    this.ownedWorkItems.push(workItem);
  }

  private registerCandidate(candidate: ArtifactCandidate): void {
    assertInstance(candidate, ArtifactCandidate);
    if (this.hasCandidate(candidate.id)) {
      throw new DuplicateCandidateError();
    }

    this.ownedCandidates.push(candidate);
  }

  private recordAcceptedArtifact(acceptedArtifact: AcceptedArtifact): void {
    assertInstance(acceptedArtifact, AcceptedArtifact);
    if (this.hasAcceptedArtifact(acceptedArtifact.id)) {
      throw new DuplicateAcceptedArtifactError();
    }

    this.ownedAcceptedArtifacts.push(acceptedArtifact);
  }

  beginExecution(commandContext: PortfolioExecutionCommandContext): PortfolioExecutionStartedFact {
    assertInstance(commandContext, PortfolioExecutionCommandContext);
    if (this.lifecycle !== PortfolioExecutionLifecycle.Initialized) {
      throw new InvalidExecutionOperationError();
    }

    this.currentLifecycle = PortfolioExecutionLifecycle.Active;

    return new PortfolioExecutionStartedFact({
      executionId: this.id,
      commandContext
    });
  }

  activateWorkItem(id: WorkItemId, commandContext: PortfolioExecutionCommandContext): PortfolioWorkItemActivatedFact {
    assertInstance(commandContext, PortfolioExecutionCommandContext);
    this.assertExecutionActive();
    const workItem = this.findRequiredWorkItem(id);
    if (workItem.lifecycle !== "Pending") {
      throw new InvalidExecutionOperationError();
    }

    this.replaceWorkItem(new PortfolioWorkItem({
      id: workItem.id,
      lifecycle: "Active"
    }));

    return new PortfolioWorkItemActivatedFact({
      executionId: this.id,
      workItemId: workItem.id,
      commandContext
    });
  }

  completeWorkItem(id: WorkItemId, commandContext: PortfolioExecutionCommandContext): PortfolioWorkItemCompletedFact {
    assertInstance(commandContext, PortfolioExecutionCommandContext);
    this.assertExecutionActive();
    const workItem = this.findRequiredWorkItem(id);
    if (workItem.lifecycle !== "Active" && workItem.lifecycle !== "ReadyForReview") {
      throw new InvalidExecutionOperationError();
    }

    this.replaceWorkItem(new PortfolioWorkItem({
      id: workItem.id,
      lifecycle: "Completed"
    }));

    return new PortfolioWorkItemCompletedFact({
      executionId: this.id,
      workItemId: workItem.id,
      commandContext
    });
  }

  cancelWorkItem(id: WorkItemId, commandContext: PortfolioExecutionCommandContext): PortfolioWorkItemCancelledFact {
    assertInstance(commandContext, PortfolioExecutionCommandContext);
    this.assertExecutionActive();
    const workItem = this.findRequiredWorkItem(id);
    if (workItem.lifecycle === "Completed" || workItem.lifecycle === "Cancelled") {
      throw new InvalidExecutionOperationError();
    }

    this.replaceWorkItem(new PortfolioWorkItem({
      id: workItem.id,
      lifecycle: "Cancelled"
    }));

    return new PortfolioWorkItemCancelledFact({
      executionId: this.id,
      workItemId: workItem.id,
      commandContext
    });
  }

  acceptCandidate(
    id: CandidateId,
    acceptedArtifactId: AcceptedArtifactId,
    commandContext: PortfolioExecutionCommandContext
  ): ArtifactCandidateAcceptedFact {
    assertInstance(commandContext, PortfolioExecutionCommandContext);
    this.assertExecutionActive();
    assertInstance(acceptedArtifactId, AcceptedArtifactId);
    const candidate = this.findRequiredCandidate(id);
    if (candidate.lifecycle !== "Registered") {
      throw new InvalidExecutionOperationError();
    }
    if (this.hasAcceptedArtifact(acceptedArtifactId)) {
      throw new DuplicateAcceptedArtifactError();
    }

    const acceptedCandidate = new ArtifactCandidate({
      id: candidate.id,
      lifecycle: "Accepted"
    });
    const acceptedArtifact = new AcceptedArtifact({
      id: acceptedArtifactId
    });

    this.replaceCandidate(acceptedCandidate);
    this.ownedAcceptedArtifacts.push(acceptedArtifact);

    return new ArtifactCandidateAcceptedFact({
      executionId: this.id,
      candidateId: candidate.id,
      acceptedArtifactId,
      commandContext
    });
  }

  rejectCandidate(id: CandidateId, commandContext: PortfolioExecutionCommandContext): ArtifactCandidateRejectedFact {
    assertInstance(commandContext, PortfolioExecutionCommandContext);
    this.assertExecutionActive();
    const candidate = this.findRequiredCandidate(id);
    if (candidate.lifecycle !== "Registered") {
      throw new InvalidExecutionOperationError();
    }

    this.replaceCandidate(new ArtifactCandidate({
      id: candidate.id,
      lifecycle: "Rejected"
    }));

    return new ArtifactCandidateRejectedFact({
      executionId: this.id,
      candidateId: candidate.id,
      commandContext
    });
  }

  completeExecution(commandContext: PortfolioExecutionCommandContext): PortfolioExecutionCompletedFact {
    assertInstance(commandContext, PortfolioExecutionCommandContext);
    if (this.lifecycle !== PortfolioExecutionLifecycle.Active) {
      throw new InvalidExecutionOperationError();
    }
    if (this.ownedWorkItems.length === 0) {
      throw new InvalidExecutionOperationError();
    }
    if (this.ownedWorkItems.some((workItem) => workItem.lifecycle !== "Completed" && workItem.lifecycle !== "Cancelled")) {
      throw new InvalidExecutionOperationError();
    }

    this.currentLifecycle = PortfolioExecutionLifecycle.Completed;

    return new PortfolioExecutionCompletedFact({
      executionId: this.id,
      commandContext
    });
  }

  cancelExecution(commandContext: PortfolioExecutionCommandContext): PortfolioExecutionCancelledFact {
    assertInstance(commandContext, PortfolioExecutionCommandContext);
    if (this.lifecycle === PortfolioExecutionLifecycle.Completed || this.lifecycle === PortfolioExecutionLifecycle.Cancelled) {
      throw new InvalidExecutionOperationError();
    }

    this.currentLifecycle = PortfolioExecutionLifecycle.Cancelled;

    return new PortfolioExecutionCancelledFact({
      executionId: this.id,
      commandContext
    });
  }

  findWorkItem(id: WorkItemId): PortfolioWorkItem | undefined {
    assertInstance(id, WorkItemId);
    return this.ownedWorkItems.find((workItem) => workItem.id.equals(id));
  }

  findCandidate(id: CandidateId): ArtifactCandidate | undefined {
    assertInstance(id, CandidateId);
    return this.ownedCandidates.find((candidate) => candidate.id.equals(id));
  }

  findAcceptedArtifact(id: AcceptedArtifactId): AcceptedArtifact | undefined {
    assertInstance(id, AcceptedArtifactId);
    return this.ownedAcceptedArtifacts.find((acceptedArtifact) => acceptedArtifact.id.equals(id));
  }

  hasWorkItem(id: WorkItemId): boolean {
    return this.findWorkItem(id) !== undefined;
  }

  hasCandidate(id: CandidateId): boolean {
    return this.findCandidate(id) !== undefined;
  }

  hasAcceptedArtifact(id: AcceptedArtifactId): boolean {
    return this.findAcceptedArtifact(id) !== undefined;
  }

  workItems(): readonly PortfolioWorkItem[] {
    return [...this.ownedWorkItems];
  }

  candidates(): readonly ArtifactCandidate[] {
    return [...this.ownedCandidates];
  }

  acceptedArtifacts(): readonly AcceptedArtifact[] {
    return [...this.ownedAcceptedArtifacts];
  }

  equals(other: PortfolioExecution | undefined): boolean {
    return other instanceof PortfolioExecution && this.id.equals(other.id);
  }

  toJSON(): {
    readonly id: string;
    readonly portfolioPlanReference: ReturnType<PortfolioPlanReference["toJSON"]>;
    readonly planSnapshotReference: ReturnType<PlanSnapshotReference["toJSON"]>;
    readonly approvalReference: ReturnType<ApprovalReference["toJSON"]>;
    readonly authorizationResourceReference: ReturnType<PortfolioWorkspaceAuthorizationResourceReference["toJSON"]>;
    readonly commandContext: ReturnType<PortfolioExecutionCommandContext["toJSON"]>;
    readonly lifecycle: PortfolioExecutionLifecycleValue;
    readonly workItems: readonly ReturnType<PortfolioWorkItem["toJSON"]>[];
    readonly candidates: readonly ReturnType<ArtifactCandidate["toJSON"]>[];
    readonly acceptedArtifacts: readonly ReturnType<AcceptedArtifact["toJSON"]>[];
  } {
    return {
      id: this.id.toJSON(),
      portfolioPlanReference: this.portfolioPlanReference.toJSON(),
      planSnapshotReference: this.planSnapshotReference.toJSON(),
      approvalReference: this.approvalReference.toJSON(),
      authorizationResourceReference: this.authorizationResourceReference.toJSON(),
      commandContext: this.commandContext.toJSON(),
      lifecycle: this.lifecycle,
      workItems: this.ownedWorkItems.map((workItem) => workItem.toJSON()),
      candidates: this.ownedCandidates.map((candidate) => candidate.toJSON()),
      acceptedArtifacts: this.ownedAcceptedArtifacts.map((acceptedArtifact) => acceptedArtifact.toJSON())
    };
  }

  private assertExecutionActive(): void {
    if (this.lifecycle !== PortfolioExecutionLifecycle.Active) {
      throw new InvalidExecutionOperationError();
    }
  }

  private findRequiredWorkItem(id: WorkItemId): PortfolioWorkItem {
    const workItem = this.findWorkItem(id);
    if (workItem === undefined) {
      throw new UnknownWorkItemError();
    }

    return workItem;
  }

  private findRequiredCandidate(id: CandidateId): ArtifactCandidate {
    const candidate = this.findCandidate(id);
    if (candidate === undefined) {
      throw new UnknownCandidateError();
    }

    return candidate;
  }

  private replaceWorkItem(replacement: PortfolioWorkItem): void {
    const index = this.ownedWorkItems.findIndex((workItem) => workItem.id.equals(replacement.id));
    if (index < 0) {
      throw new UnknownWorkItemError();
    }

    this.ownedWorkItems[index] = replacement;
  }

  private replaceCandidate(replacement: ArtifactCandidate): void {
    const index = this.ownedCandidates.findIndex((candidate) => candidate.id.equals(replacement.id));
    if (index < 0) {
      throw new UnknownCandidateError();
    }

    this.ownedCandidates[index] = replacement;
  }
}

export class PortfolioExecutionInitializationResult {
  private readonly __portfolioExecutionInitializationResultBrand!: never;

  readonly execution: PortfolioExecution;
  readonly fact: PortfolioExecutionInitializedFact;

  constructor(input: {
    readonly execution: PortfolioExecution;
    readonly fact: PortfolioExecutionInitializedFact;
  }) {
    assertInstance(input.execution, PortfolioExecution);
    assertInstance(input.fact, PortfolioExecutionInitializedFact);

    this.execution = input.execution;
    this.fact = input.fact;
    Object.freeze(this);
  }
}

function assertInstance<T>(value: unknown, constructor: new (...args: never[]) => T): asserts value is T {
  if (!(value instanceof constructor)) {
    throw new InvalidExecutionOperationError();
  }
}

function isPortfolioExecutionLifecycle(value: string): value is PortfolioExecutionLifecycleValue {
  return Object.values(PortfolioExecutionLifecycle).includes(value as PortfolioExecutionLifecycleValue);
}
