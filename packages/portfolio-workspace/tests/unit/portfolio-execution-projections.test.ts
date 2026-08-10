import { describe, expect, it } from "vitest";
import {
  AcceptedArtifact,
  AcceptedArtifactId,
  AcceptedArtifactSummaryProjection,
  ApprovalReference,
  ArtifactCandidate,
  ArtifactCandidateLifecycle,
  ArtifactCandidateSummaryProjection,
  CandidateId,
  ExecutionId,
  PlanSnapshotReference,
  PortfolioExecution,
  PortfolioExecutionCommandContext,
  PortfolioExecutionLifecycle,
  PortfolioExecutionSummaryProjection,
  PortfolioPlanReference,
  PortfolioWorkItem,
  PortfolioWorkItemLifecycle,
  PortfolioWorkItemSummaryProjection,
  WorkItemId
} from "../../src";

describe("Portfolio Workspace pure domain projections", () => {
  it("derives an immutable execution summary from aggregate read-only state", () => {
    const aggregate = createAggregate({
      lifecycle: PortfolioExecutionLifecycle.Active,
      acceptedArtifacts: [createAcceptedArtifact("accepted-artifact-1")],
      candidates: [
        createCandidate("candidate-1", ArtifactCandidateLifecycle.Registered),
        createCandidate("candidate-2", ArtifactCandidateLifecycle.Accepted)
      ],
      workItems: [
        createWorkItem("work-item-1", PortfolioWorkItemLifecycle.Active),
        createWorkItem("work-item-2", PortfolioWorkItemLifecycle.Completed),
        createWorkItem("work-item-3", PortfolioWorkItemLifecycle.Cancelled)
      ]
    });
    const before = aggregate.toJSON();

    const projection = PortfolioExecutionSummaryProjection.fromExecution(aggregate);
    const equivalent = PortfolioExecutionSummaryProjection.fromExecution(aggregate);

    expect(Object.isFrozen(projection)).toBe(true);
    expect(Object.isFrozen(projection.portfolioPlanReference)).toBe(true);
    expect(Object.isFrozen(projection.planSnapshotReference)).toBe(true);
    expect(Object.isFrozen(projection.approvalReference)).toBe(true);
    expect(Object.isFrozen(projection.workItemsByLifecycle)).toBe(true);
    expect(Object.isFrozen(projection.candidatesByLifecycle)).toBe(true);
    expect(Object.isFrozen(projection.factTypes)).toBe(true);
    expect(projection.equals(equivalent)).toBe(true);
    expect(projection.toJSON()).toEqual({
      executionId: "execution-1",
      lifecycle: "Active",
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
      workItemCount: 3,
      candidateCount: 2,
      acceptedArtifactCount: 1,
      workItemsByLifecycle: {
        Pending: 0,
        Active: 1,
        Blocked: 0,
        ReadyForReview: 0,
        Completed: 1,
        Cancelled: 1
      },
      candidatesByLifecycle: {
        Registered: 1,
        Accepted: 1,
        Rejected: 0
      },
      factTypes: []
    });
    expect(aggregate.toJSON()).toEqual(before);
  });

  it("derives execution summaries from immutable facts without retaining queues", () => {
    const aggregate = createAggregate({
      lifecycle: PortfolioExecutionLifecycle.Active,
      workItems: [createWorkItem("work-item-1", PortfolioWorkItemLifecycle.Active)]
    });
    const fact = aggregate.completeWorkItem(new WorkItemId("work-item-1"), commandContext());

    const projection = PortfolioExecutionSummaryProjection.fromExecution(aggregate, [fact]);

    expect(projection.toJSON().factTypes).toEqual(["PortfolioWorkItemCompleted"]);
    expect(projection).not.toHaveProperty("facts");
    expect(projection).not.toHaveProperty("pendingFacts");
    expect(projection).not.toHaveProperty("events");
    expect(projection).not.toHaveProperty("repository");
    expect(projection).not.toHaveProperty("refresh");
    expect(projection).not.toHaveProperty("cache");
  });

  it("derives supporting entity summaries without composing projections of projections", () => {
    const workItem = createWorkItem("work-item-1", PortfolioWorkItemLifecycle.ReadyForReview);
    const candidate = createCandidate("candidate-1", ArtifactCandidateLifecycle.Rejected);
    const acceptedArtifact = createAcceptedArtifact("accepted-artifact-1");

    const workItemProjection = PortfolioWorkItemSummaryProjection.fromWorkItem(workItem);
    const candidateProjection = ArtifactCandidateSummaryProjection.fromCandidate(candidate);
    const acceptedArtifactProjection = AcceptedArtifactSummaryProjection.fromAcceptedArtifact(acceptedArtifact);

    expect(workItemProjection.toJSON()).toEqual({
      id: "work-item-1",
      lifecycle: "ReadyForReview"
    });
    expect(candidateProjection.toJSON()).toEqual({
      id: "candidate-1",
      lifecycle: "Rejected"
    });
    expect(acceptedArtifactProjection.toJSON()).toEqual({
      id: "accepted-artifact-1"
    });
    expect(workItemProjection).not.toHaveProperty("candidateProjections");
    expect(candidateProjection).not.toHaveProperty("acceptedArtifactProjections");
    expect(acceptedArtifactProjection).not.toHaveProperty("workItemProjection");
  });

  it("supports value equality and deterministic serialization for entity summaries", () => {
    const first = PortfolioWorkItemSummaryProjection.fromWorkItem(
      createWorkItem("work-item-1", PortfolioWorkItemLifecycle.Completed)
    );
    const equivalent = PortfolioWorkItemSummaryProjection.fromWorkItem(
      createWorkItem("work-item-1", PortfolioWorkItemLifecycle.Completed)
    );
    const different = PortfolioWorkItemSummaryProjection.fromWorkItem(
      createWorkItem("work-item-2", PortfolioWorkItemLifecycle.Completed)
    );

    expect(Object.isFrozen(first)).toBe(true);
    expect(first.equals(equivalent)).toBe(true);
    expect(first.equals(different)).toBe(false);
    expect(first.toJSON()).toEqual(equivalent.toJSON());
  });

  it("keeps projections free of policy, persistence, UI, and integration behavior", () => {
    const projection = PortfolioExecutionSummaryProjection.fromExecution(createAggregate());

    expect(projection).not.toHaveProperty("evaluate");
    expect(projection).not.toHaveProperty("decide");
    expect(projection).not.toHaveProperty("save");
    expect(projection).not.toHaveProperty("load");
    expect(projection).not.toHaveProperty("publish");
    expect(projection).not.toHaveProperty("render");
    expect(projection).not.toHaveProperty("toDto");
    expect(projection).not.toHaveProperty("searchIndex");
    expect(projection).not.toHaveProperty("query");
    expect(projection).not.toHaveProperty("repository");
  });
});

function createAggregate(overrides: Partial<ConstructorParameters<typeof PortfolioExecution>[0]> = {}): PortfolioExecution {
  return new PortfolioExecution({
    id: new ExecutionId("execution-1"),
    portfolioPlanReference: new PortfolioPlanReference({
      planId: "portfolio-plan-1",
      roadmapId: "roadmap-1",
      planArtifactReference: "artifact:portfolio-plan-1"
    }),
    planSnapshotReference: new PlanSnapshotReference({
      snapshotReference: "snapshot:portfolio-plan-1:v1"
    }),
    approvalReference: new ApprovalReference({
      approvalReference: "approval:portfolio-plan-1"
    }),
    commandContext: new PortfolioExecutionCommandContext({
      commandId: "command-1",
      correlationId: "correlation-1",
      actorReference: "actor:1",
      occurredAt: "2026-07-30T00:00:00.000Z"
    }),
    lifecycle: PortfolioExecutionLifecycle.Initialized,
    ...overrides
  });
}

function createWorkItem(id: string, lifecycle: typeof PortfolioWorkItemLifecycle[keyof typeof PortfolioWorkItemLifecycle]): PortfolioWorkItem {
  return new PortfolioWorkItem({
    id: new WorkItemId(id),
    lifecycle
  });
}

function createCandidate(id: string, lifecycle: typeof ArtifactCandidateLifecycle[keyof typeof ArtifactCandidateLifecycle]): ArtifactCandidate {
  return new ArtifactCandidate({
    id: new CandidateId(id),
    lifecycle
  });
}

function createAcceptedArtifact(id: string): AcceptedArtifact {
  return new AcceptedArtifact({
    id: new AcceptedArtifactId(id)
  });
}

function commandContext(): PortfolioExecutionCommandContext {
  return new PortfolioExecutionCommandContext({
    commandId: "operation-command-1",
    correlationId: "operation-correlation-1",
    actorReference: "actor:operation",
    occurredAt: "2026-07-30T00:00:01.000Z"
  });
}
