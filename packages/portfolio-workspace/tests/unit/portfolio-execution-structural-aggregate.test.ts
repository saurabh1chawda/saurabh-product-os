import { describe, expect, it } from "vitest";
import {
  AcceptedArtifact,
  AcceptedArtifactId,
  ApprovalReference,
  ArtifactCandidate,
  ArtifactCandidateLifecycle,
  CandidateId,
  DuplicateAcceptedArtifactError,
  DuplicateCandidateError,
  DuplicateWorkItemError,
  ExecutionId,
  InvalidExecutionOperationError,
  PlanSnapshotReference,
  PortfolioExecution,
  PortfolioExecutionCommandContext,
  PortfolioExecutionLifecycle,
  PortfolioPlanReference,
  PortfolioWorkItem,
  PortfolioWorkItemLifecycle,
  WorkItemId
} from "../../src";

describe("PortfolioExecution structural aggregate", () => {
  it("constructs with identity, references, command context, lifecycle, and deterministic serialization", () => {
    const aggregate = createAggregate();

    expect(aggregate.id.equals(new ExecutionId("execution-1"))).toBe(true);
    expect(aggregate.portfolioPlanReference.equals(createPlanReference())).toBe(true);
    expect(aggregate.planSnapshotReference.equals(createSnapshotReference())).toBe(true);
    expect(aggregate.approvalReference.equals(createApprovalReference())).toBe(true);
    expect(aggregate.commandContext.equals(createCommandContext())).toBe(true);
    expect(aggregate.lifecycle).toBe(PortfolioExecutionLifecycle.Initialized);
    expect(aggregate.toJSON()).toEqual({
      id: "execution-1",
      portfolioPlanReference: {
        planId: "portfolio-plan-1",
        roadmapId: "roadmap-1",
        planArtifactReference: "artifact:portfolio-plan-1"
      },
      planSnapshotReference: {
        snapshotReference: "snapshot:portfolio-plan-1:v1"
      },
      approvalReference: {
        approvalReference: "approval:portfolio-plan-1"
      },
      commandContext: {
        commandId: "command-1",
        correlationId: "correlation-1",
        actorReference: "actor:1",
        occurredAt: "2026-07-29T00:00:00.000Z"
      },
      lifecycle: "Initialized",
      workItems: [],
      candidates: [],
      acceptedArtifacts: []
    });
  });

  it("constructs and looks up aggregate-owned collections without exposing mutable internals", () => {
    const workItem = createWorkItem("work-item-1");
    const candidate = createCandidate("candidate-1");
    const acceptedArtifact = createAcceptedArtifact("accepted-artifact-1");
    const aggregate = createAggregate({
      workItems: [workItem],
      candidates: [candidate],
      acceptedArtifacts: [acceptedArtifact]
    });

    expect(aggregate.hasWorkItem(new WorkItemId("work-item-1"))).toBe(true);
    expect(aggregate.hasCandidate(new CandidateId("candidate-1"))).toBe(true);
    expect(aggregate.hasAcceptedArtifact(new AcceptedArtifactId("accepted-artifact-1"))).toBe(true);
    expect(aggregate.findWorkItem(new WorkItemId("work-item-1"))).toBe(workItem);
    expect(aggregate.findCandidate(new CandidateId("candidate-1"))).toBe(candidate);
    expect(aggregate.findAcceptedArtifact(new AcceptedArtifactId("accepted-artifact-1"))).toBe(acceptedArtifact);

    const workItems = aggregate.workItems() as PortfolioWorkItem[];
    workItems.push(createWorkItem("work-item-2"));

    expect(workItems).toHaveLength(2);
    expect(aggregate.workItems()).toHaveLength(1);
    expect(aggregate.toJSON().workItems).toEqual([{
      id: "work-item-1",
      lifecycle: "Pending"
    }]);
  });

  it("detects duplicate collection ownership during registration and construction", () => {
    expect(() => createAggregate({
      workItems: [
        createWorkItem("work-item-1"),
        createWorkItem("work-item-1")
      ]
    })).toThrow(DuplicateWorkItemError);
    expect(() => createAggregate({
      candidates: [
        createCandidate("candidate-1"),
        createCandidate("candidate-1")
      ]
    })).toThrow(DuplicateCandidateError);
    expect(() => createAggregate({
      acceptedArtifacts: [
        createAcceptedArtifact("accepted-artifact-1"),
        createAcceptedArtifact("accepted-artifact-1")
      ]
    })).toThrow(DuplicateAcceptedArtifactError);
  });

  it("rejects invalid aggregate-local construction and lookup inputs", () => {
    expect(() => createAggregate({
      id: new WorkItemId("work-item-1") as never
    })).toThrow(InvalidExecutionOperationError);
    expect(() => createAggregate({
      lifecycle: "ActiveButNotCanonical" as never
    })).toThrow(InvalidExecutionOperationError);
    expect(() => createAggregate({
      workItems: [createCandidate("candidate-1") as never]
    })).toThrow(InvalidExecutionOperationError);
    expect(() => createAggregate({
      candidates: [createWorkItem("work-item-1") as never]
    })).toThrow(InvalidExecutionOperationError);
    expect(() => createAggregate({
      acceptedArtifacts: [createCandidate("candidate-1") as never]
    })).toThrow(InvalidExecutionOperationError);
    expect(() => createAggregate().findWorkItem(new CandidateId("candidate-1") as never)).toThrow(InvalidExecutionOperationError);
    expect(() => createAggregate().findCandidate(new WorkItemId("work-item-1") as never)).toThrow(InvalidExecutionOperationError);
    expect(() => createAggregate().findAcceptedArtifact(new CandidateId("candidate-1") as never)).toThrow(InvalidExecutionOperationError);
  });

  it("keeps generic transition APIs, facts, policies, projections, and persistence absent", () => {
    const aggregate = createAggregate();

    expect(aggregate).not.toHaveProperty("begin");
    expect(aggregate).not.toHaveProperty("complete");
    expect(aggregate).not.toHaveProperty("cancel");
    expect(aggregate).not.toHaveProperty("transition");
    expect(aggregate).not.toHaveProperty("activate");
    expect(aggregate).not.toHaveProperty("resume");
    expect(aggregate).not.toHaveProperty("pause");
    expect(aggregate).not.toHaveProperty("promoteCandidate");
    expect(aggregate).not.toHaveProperty("pullFacts");
    expect(aggregate).not.toHaveProperty("facts");
    expect(aggregate).not.toHaveProperty("progress");
    expect(aggregate).not.toHaveProperty("repository");
    expect(aggregate).not.toHaveProperty("save");
    const structuralMethodsArePrivate: StructuralMethodsArePrivate = true;
    expect(structuralMethodsArePrivate).toBe(true);
  });
});

type StructuralMethodsArePrivate =
  "registerWorkItem" extends keyof PortfolioExecution ? false
    : "registerCandidate" extends keyof PortfolioExecution ? false
      : "recordAcceptedArtifact" extends keyof PortfolioExecution ? false
        : true;

function createAggregate(overrides: Partial<ConstructorParameters<typeof PortfolioExecution>[0]> = {}): PortfolioExecution {
  return new PortfolioExecution({
    id: new ExecutionId("execution-1"),
    portfolioPlanReference: createPlanReference(),
    planSnapshotReference: createSnapshotReference(),
    approvalReference: createApprovalReference(),
    commandContext: createCommandContext(),
    lifecycle: PortfolioExecutionLifecycle.Initialized,
    ...overrides
  });
}

function createPlanReference(): PortfolioPlanReference {
  return new PortfolioPlanReference({
    planId: "portfolio-plan-1",
    roadmapId: "roadmap-1",
    planArtifactReference: "artifact:portfolio-plan-1"
  });
}

function createSnapshotReference(): PlanSnapshotReference {
  return new PlanSnapshotReference({
    snapshotReference: "snapshot:portfolio-plan-1:v1"
  });
}

function createApprovalReference(): ApprovalReference {
  return new ApprovalReference({
    approvalReference: "approval:portfolio-plan-1"
  });
}

function createCommandContext(): PortfolioExecutionCommandContext {
  return new PortfolioExecutionCommandContext({
    commandId: "command-1",
    correlationId: "correlation-1",
    actorReference: "actor:1",
    occurredAt: "2026-07-29T00:00:00.000Z"
  });
}

function createWorkItem(id: string): PortfolioWorkItem {
  return new PortfolioWorkItem({
    id: new WorkItemId(id),
    lifecycle: PortfolioWorkItemLifecycle.Pending
  });
}

function createCandidate(id: string): ArtifactCandidate {
  return new ArtifactCandidate({
    id: new CandidateId(id),
    lifecycle: ArtifactCandidateLifecycle.Registered
  });
}

function createAcceptedArtifact(id: string): AcceptedArtifact {
  return new AcceptedArtifact({
    id: new AcceptedArtifactId(id)
  });
}
