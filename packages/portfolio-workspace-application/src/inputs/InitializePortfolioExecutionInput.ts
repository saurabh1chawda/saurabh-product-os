import {
  ApprovalReference,
  CandidateId,
  ExecutionId,
  PlanSnapshotReference,
  PortfolioExecutionCommandContext,
  PortfolioPlanReference,
  WorkItemId
} from "@career-companion/portfolio-workspace";

export class InitializePortfolioWorkItemDefinition {
  private readonly __initializePortfolioWorkItemDefinitionBrand!: never;

  readonly workItemId: WorkItemId;

  constructor(input: {
    readonly workItemId: WorkItemId;
  }) {
    assertInstance(input.workItemId, WorkItemId, "Invalid InitializePortfolioWorkItemDefinition workItemId.");

    this.workItemId = input.workItemId;
    Object.freeze(this);
  }

  equals(other: InitializePortfolioWorkItemDefinition | undefined): boolean {
    return other instanceof InitializePortfolioWorkItemDefinition
      && this.workItemId.equals(other.workItemId);
  }

  toJSON(): {
    readonly workItemId: string;
  } {
    return {
      workItemId: this.workItemId.toJSON()
    };
  }
}

export class InitializeArtifactCandidateDefinition {
  private readonly __initializeArtifactCandidateDefinitionBrand!: never;

  readonly candidateId: CandidateId;

  constructor(input: {
    readonly candidateId: CandidateId;
  }) {
    assertInstance(input.candidateId, CandidateId, "Invalid InitializeArtifactCandidateDefinition candidateId.");

    this.candidateId = input.candidateId;
    Object.freeze(this);
  }

  equals(other: InitializeArtifactCandidateDefinition | undefined): boolean {
    return other instanceof InitializeArtifactCandidateDefinition
      && this.candidateId.equals(other.candidateId);
  }

  toJSON(): {
    readonly candidateId: string;
  } {
    return {
      candidateId: this.candidateId.toJSON()
    };
  }
}

export class InitializePortfolioExecutionInput {
  private readonly __initializePortfolioExecutionInputBrand!: never;

  readonly executionId: ExecutionId;
  readonly portfolioPlanReference: PortfolioPlanReference;
  readonly planSnapshotReference: PlanSnapshotReference;
  readonly approvalReference: ApprovalReference;
  readonly commandContext: PortfolioExecutionCommandContext;
  readonly workItems: readonly InitializePortfolioWorkItemDefinition[];
  readonly candidates: readonly InitializeArtifactCandidateDefinition[];

  constructor(input: {
    readonly executionId: ExecutionId;
    readonly portfolioPlanReference: PortfolioPlanReference;
    readonly planSnapshotReference: PlanSnapshotReference;
    readonly approvalReference: ApprovalReference;
    readonly commandContext: PortfolioExecutionCommandContext;
    readonly workItems?: readonly InitializePortfolioWorkItemDefinition[];
    readonly candidates?: readonly InitializeArtifactCandidateDefinition[];
  }) {
    assertInstance(input.executionId, ExecutionId, "Invalid InitializePortfolioExecutionInput executionId.");
    assertInstance(input.portfolioPlanReference, PortfolioPlanReference, "Invalid InitializePortfolioExecutionInput portfolioPlanReference.");
    assertInstance(input.planSnapshotReference, PlanSnapshotReference, "Invalid InitializePortfolioExecutionInput planSnapshotReference.");
    assertInstance(input.approvalReference, ApprovalReference, "Invalid InitializePortfolioExecutionInput approvalReference.");
    assertInstance(input.commandContext, PortfolioExecutionCommandContext, "Invalid InitializePortfolioExecutionInput commandContext.");

    this.executionId = input.executionId;
    this.portfolioPlanReference = input.portfolioPlanReference;
    this.planSnapshotReference = input.planSnapshotReference;
    this.approvalReference = input.approvalReference;
    this.commandContext = input.commandContext;
    this.workItems = Object.freeze([...(input.workItems ?? [])]);
    this.candidates = Object.freeze([...(input.candidates ?? [])]);

    for (const workItem of this.workItems) {
      assertInstance(workItem, InitializePortfolioWorkItemDefinition, "Invalid InitializePortfolioExecutionInput workItems.");
    }
    for (const candidate of this.candidates) {
      assertInstance(candidate, InitializeArtifactCandidateDefinition, "Invalid InitializePortfolioExecutionInput candidates.");
    }

    Object.freeze(this);
  }

  equals(other: InitializePortfolioExecutionInput | undefined): boolean {
    return other instanceof InitializePortfolioExecutionInput
      && this.executionId.equals(other.executionId)
      && this.portfolioPlanReference.equals(other.portfolioPlanReference)
      && this.planSnapshotReference.equals(other.planSnapshotReference)
      && this.approvalReference.equals(other.approvalReference)
      && this.commandContext.equals(other.commandContext)
      && definitionsEqual(this.workItems, other.workItems)
      && definitionsEqual(this.candidates, other.candidates);
  }

  toJSON(): {
    readonly executionId: string;
    readonly portfolioPlanReference: ReturnType<PortfolioPlanReference["toJSON"]>;
    readonly planSnapshotReference: ReturnType<PlanSnapshotReference["toJSON"]>;
    readonly approvalReference: ReturnType<ApprovalReference["toJSON"]>;
    readonly commandContext: ReturnType<PortfolioExecutionCommandContext["toJSON"]>;
    readonly workItems: readonly ReturnType<InitializePortfolioWorkItemDefinition["toJSON"]>[];
    readonly candidates: readonly ReturnType<InitializeArtifactCandidateDefinition["toJSON"]>[];
  } {
    return {
      executionId: this.executionId.toJSON(),
      portfolioPlanReference: this.portfolioPlanReference.toJSON(),
      planSnapshotReference: this.planSnapshotReference.toJSON(),
      approvalReference: this.approvalReference.toJSON(),
      commandContext: this.commandContext.toJSON(),
      workItems: this.workItems.map((workItem) => workItem.toJSON()),
      candidates: this.candidates.map((candidate) => candidate.toJSON())
    };
  }
}

function definitionsEqual<T extends { equals(other: T | undefined): boolean }>(
  left: readonly T[],
  right: readonly T[]
): boolean {
  return left.length === right.length
    && left.every((definition, index) => definition.equals(right[index]));
}

function assertInstance<T>(
  value: unknown,
  constructor: new (...args: never[]) => T,
  message: string
): asserts value is T {
  if (!(value instanceof constructor)) {
    throw new TypeError(message);
  }
}
