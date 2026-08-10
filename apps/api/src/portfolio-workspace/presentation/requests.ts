export interface PortfolioWorkspacePresentationRequestJson {
  readonly executionId: string;
  readonly incomingCorrelationId?: string;
}

export type GetPortfolioExecutionPresentationRequestJson = PortfolioWorkspacePresentationRequestJson;

export interface PortfolioWorkspaceWorkItemPresentationRequestJson extends PortfolioWorkspacePresentationRequestJson {
  readonly workItemId: string;
}

export interface PortfolioWorkspaceCandidatePresentationRequestJson extends PortfolioWorkspacePresentationRequestJson {
  readonly candidateId: string;
}

export interface AcceptCandidatePresentationRequestJson extends PortfolioWorkspaceCandidatePresentationRequestJson {
  readonly acceptedArtifactId: string;
}

export interface PortfolioPlanReferencePresentationRequestJson {
  readonly planId: string;
  readonly roadmapId: string;
  readonly planArtifactReference: string;
}

export interface PlanSnapshotReferencePresentationRequestJson {
  readonly snapshotReference: string;
}

export interface ApprovalReferencePresentationRequestJson {
  readonly approvalReference: string;
}

export interface InitializePortfolioWorkItemPresentationDefinitionJson {
  readonly workItemId: string;
}

export interface InitializeArtifactCandidatePresentationDefinitionJson {
  readonly candidateId: string;
}

export interface InitializePortfolioExecutionPresentationRequestJson extends PortfolioWorkspacePresentationRequestJson {
  readonly portfolioPlanReference: PortfolioPlanReferencePresentationRequestJson;
  readonly planSnapshotReference: PlanSnapshotReferencePresentationRequestJson;
  readonly approvalReference: ApprovalReferencePresentationRequestJson;
  readonly initialWorkItems?: readonly InitializePortfolioWorkItemPresentationDefinitionJson[];
  readonly initialCandidates?: readonly InitializeArtifactCandidatePresentationDefinitionJson[];
}

export class InitializePortfolioWorkItemPresentationDefinition {
  readonly workItemId: string;

  constructor(input: InitializePortfolioWorkItemPresentationDefinitionJson) {
    assertString(input.workItemId, "initialWorkItems[].workItemId");

    this.workItemId = input.workItemId;
    Object.freeze(this);
  }

  toJSON(): InitializePortfolioWorkItemPresentationDefinitionJson {
    return Object.freeze({
      workItemId: this.workItemId
    });
  }
}

export class InitializeArtifactCandidatePresentationDefinition {
  readonly candidateId: string;

  constructor(input: InitializeArtifactCandidatePresentationDefinitionJson) {
    assertString(input.candidateId, "initialCandidates[].candidateId");

    this.candidateId = input.candidateId;
    Object.freeze(this);
  }

  toJSON(): InitializeArtifactCandidatePresentationDefinitionJson {
    return Object.freeze({
      candidateId: this.candidateId
    });
  }
}

export class InitializePortfolioExecutionPresentationRequest {
  readonly executionId: string;
  readonly portfolioPlanReference: PortfolioPlanReferencePresentationRequestJson;
  readonly planSnapshotReference: PlanSnapshotReferencePresentationRequestJson;
  readonly approvalReference: ApprovalReferencePresentationRequestJson;
  readonly initialWorkItems: readonly InitializePortfolioWorkItemPresentationDefinition[];
  readonly initialCandidates: readonly InitializeArtifactCandidatePresentationDefinition[];
  readonly incomingCorrelationId: string | undefined;

  constructor(input: InitializePortfolioExecutionPresentationRequestJson) {
    assertString(input.executionId, "executionId");
    assertSourceReference(input.portfolioPlanReference, ["planId", "roadmapId", "planArtifactReference"], "portfolioPlanReference");
    assertSourceReference(input.planSnapshotReference, ["snapshotReference"], "planSnapshotReference");
    assertSourceReference(input.approvalReference, ["approvalReference"], "approvalReference");
    if (input.incomingCorrelationId !== undefined) {
      assertString(input.incomingCorrelationId, "incomingCorrelationId");
    }

    this.executionId = input.executionId;
    this.portfolioPlanReference = Object.freeze({ ...input.portfolioPlanReference });
    this.planSnapshotReference = Object.freeze({ ...input.planSnapshotReference });
    this.approvalReference = Object.freeze({ ...input.approvalReference });
    this.initialWorkItems = Object.freeze((input.initialWorkItems ?? []).map(
      (definition) => new InitializePortfolioWorkItemPresentationDefinition(definition)
    ));
    this.initialCandidates = Object.freeze((input.initialCandidates ?? []).map(
      (definition) => new InitializeArtifactCandidatePresentationDefinition(definition)
    ));
    this.incomingCorrelationId = input.incomingCorrelationId;
    Object.freeze(this);
  }

  toJSON(): InitializePortfolioExecutionPresentationRequestJson {
    return optionalCorrelation({
      executionId: this.executionId,
      portfolioPlanReference: Object.freeze({ ...this.portfolioPlanReference }),
      planSnapshotReference: Object.freeze({ ...this.planSnapshotReference }),
      approvalReference: Object.freeze({ ...this.approvalReference }),
      initialWorkItems: Object.freeze(this.initialWorkItems.map((definition) => definition.toJSON())),
      initialCandidates: Object.freeze(this.initialCandidates.map((definition) => definition.toJSON()))
    }, this.incomingCorrelationId);
  }
}

export class BeginExecutionPresentationRequest {
  readonly executionId: string;
  readonly incomingCorrelationId: string | undefined;

  constructor(input: PortfolioWorkspacePresentationRequestJson) {
    this.executionId = input.executionId;
    this.incomingCorrelationId = input.incomingCorrelationId;
    Object.freeze(this);
  }

  toJSON(): PortfolioWorkspacePresentationRequestJson {
    return optionalCorrelation({
      executionId: this.executionId
    }, this.incomingCorrelationId);
  }
}

export class GetPortfolioExecutionPresentationRequest {
  readonly executionId: string;
  readonly incomingCorrelationId: string | undefined;

  constructor(input: GetPortfolioExecutionPresentationRequestJson) {
    assertString(input.executionId, "executionId");
    if (input.incomingCorrelationId !== undefined) {
      assertString(input.incomingCorrelationId, "incomingCorrelationId");
    }

    this.executionId = input.executionId;
    this.incomingCorrelationId = input.incomingCorrelationId;
    Object.freeze(this);
  }

  toJSON(): GetPortfolioExecutionPresentationRequestJson {
    return optionalCorrelation({
      executionId: this.executionId
    }, this.incomingCorrelationId);
  }
}

export class ActivateWorkItemPresentationRequest {
  readonly executionId: string;
  readonly workItemId: string;
  readonly incomingCorrelationId: string | undefined;

  constructor(input: PortfolioWorkspaceWorkItemPresentationRequestJson) {
    this.executionId = input.executionId;
    this.workItemId = input.workItemId;
    this.incomingCorrelationId = input.incomingCorrelationId;
    Object.freeze(this);
  }

  toJSON(): PortfolioWorkspaceWorkItemPresentationRequestJson {
    return optionalCorrelation({
      executionId: this.executionId,
      workItemId: this.workItemId
    }, this.incomingCorrelationId);
  }
}

export class CompleteWorkItemPresentationRequest {
  readonly executionId: string;
  readonly workItemId: string;
  readonly incomingCorrelationId: string | undefined;

  constructor(input: PortfolioWorkspaceWorkItemPresentationRequestJson) {
    this.executionId = input.executionId;
    this.workItemId = input.workItemId;
    this.incomingCorrelationId = input.incomingCorrelationId;
    Object.freeze(this);
  }

  toJSON(): PortfolioWorkspaceWorkItemPresentationRequestJson {
    return optionalCorrelation({
      executionId: this.executionId,
      workItemId: this.workItemId
    }, this.incomingCorrelationId);
  }
}

export class CancelWorkItemPresentationRequest {
  readonly executionId: string;
  readonly workItemId: string;
  readonly incomingCorrelationId: string | undefined;

  constructor(input: PortfolioWorkspaceWorkItemPresentationRequestJson) {
    this.executionId = input.executionId;
    this.workItemId = input.workItemId;
    this.incomingCorrelationId = input.incomingCorrelationId;
    Object.freeze(this);
  }

  toJSON(): PortfolioWorkspaceWorkItemPresentationRequestJson {
    return optionalCorrelation({
      executionId: this.executionId,
      workItemId: this.workItemId
    }, this.incomingCorrelationId);
  }
}

export class AcceptCandidatePresentationRequest {
  readonly executionId: string;
  readonly candidateId: string;
  readonly acceptedArtifactId: string;
  readonly incomingCorrelationId: string | undefined;

  constructor(input: AcceptCandidatePresentationRequestJson) {
    this.executionId = input.executionId;
    this.candidateId = input.candidateId;
    this.acceptedArtifactId = input.acceptedArtifactId;
    this.incomingCorrelationId = input.incomingCorrelationId;
    Object.freeze(this);
  }

  toJSON(): AcceptCandidatePresentationRequestJson {
    return optionalCorrelation({
      executionId: this.executionId,
      candidateId: this.candidateId,
      acceptedArtifactId: this.acceptedArtifactId
    }, this.incomingCorrelationId);
  }
}

export class RejectCandidatePresentationRequest {
  readonly executionId: string;
  readonly candidateId: string;
  readonly incomingCorrelationId: string | undefined;

  constructor(input: PortfolioWorkspaceCandidatePresentationRequestJson) {
    this.executionId = input.executionId;
    this.candidateId = input.candidateId;
    this.incomingCorrelationId = input.incomingCorrelationId;
    Object.freeze(this);
  }

  toJSON(): PortfolioWorkspaceCandidatePresentationRequestJson {
    return optionalCorrelation({
      executionId: this.executionId,
      candidateId: this.candidateId
    }, this.incomingCorrelationId);
  }
}

export class CompleteExecutionPresentationRequest {
  readonly executionId: string;
  readonly incomingCorrelationId: string | undefined;

  constructor(input: PortfolioWorkspacePresentationRequestJson) {
    this.executionId = input.executionId;
    this.incomingCorrelationId = input.incomingCorrelationId;
    Object.freeze(this);
  }

  toJSON(): PortfolioWorkspacePresentationRequestJson {
    return optionalCorrelation({
      executionId: this.executionId
    }, this.incomingCorrelationId);
  }
}

export class CancelExecutionPresentationRequest {
  readonly executionId: string;
  readonly incomingCorrelationId: string | undefined;

  constructor(input: PortfolioWorkspacePresentationRequestJson) {
    this.executionId = input.executionId;
    this.incomingCorrelationId = input.incomingCorrelationId;
    Object.freeze(this);
  }

  toJSON(): PortfolioWorkspacePresentationRequestJson {
    return optionalCorrelation({
      executionId: this.executionId
    }, this.incomingCorrelationId);
  }
}

function optionalCorrelation<T extends PortfolioWorkspacePresentationRequestJson>(
  output: Omit<T, "incomingCorrelationId">,
  incomingCorrelationId: string | undefined
): T {
  return Object.freeze({
    ...output,
    ...(incomingCorrelationId === undefined ? {} : { incomingCorrelationId })
  }) as T;
}

function assertSourceReference<T extends string>(
  value: unknown,
  fields: readonly T[],
  fieldName: string
): asserts value is { readonly [K in T]: string } {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${fieldName} must be an object.`);
  }

  for (const field of fields) {
    assertString((value as Record<string, unknown>)[field], `${fieldName}.${field}`);
  }
}

function assertString(value: unknown, fieldName: string): asserts value is string {
  if (typeof value !== "string") {
    throw new TypeError(`${fieldName} must be a string.`);
  }
}
