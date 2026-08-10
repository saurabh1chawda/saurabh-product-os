import { describe, expect, it } from "vitest";
import {
  AcceptedArtifact,
  AcceptedArtifactId,
  ApprovalReference,
  ArtifactCandidate,
  ArtifactCandidateLifecycle,
  CandidateAcceptancePolicy,
  CandidateId,
  ExecutionCompletionPolicy,
  ExecutionConsistencyPolicy,
  ExecutionId,
  NoActionDecision,
  PlanSnapshotReference,
  PolicyDecision,
  PolicyDecisionKind,
  PortfolioExecution,
  PortfolioExecutionCommandContext,
  PortfolioExecutionLifecycle,
  PortfolioPlanReference,
  PortfolioWorkItem,
  PortfolioWorkItemLifecycle,
  RecommendationDecision,
  WorkItemId
} from "../../src";

describe("Portfolio Workspace pure domain policies", () => {
  it("creates immutable policy decisions with deterministic serialization and value equality", () => {
    const recommendation = new RecommendationDecision({
      decisionName: "PortfolioExecutionCompletion",
      reason: "Portfolio execution can be reviewed for completion.",
      references: ["execution-1"],
      factTypes: ["PortfolioWorkItemCompleted"]
    });
    const equivalent = new RecommendationDecision({
      decisionName: "PortfolioExecutionCompletion",
      reason: "Portfolio execution can be reviewed for completion.",
      references: ["execution-1"],
      factTypes: ["PortfolioWorkItemCompleted"]
    });
    const noAction = new NoActionDecision({
      decisionName: "PortfolioExecutionCompletion",
      reason: "Portfolio execution has unresolved work items.",
      references: ["execution-1", "work-item-1"],
      factTypes: []
    });

    expect(Object.isFrozen(recommendation)).toBe(true);
    expect(Object.isFrozen(recommendation.references)).toBe(true);
    expect(Object.isFrozen(recommendation.factTypes)).toBe(true);
    expect(recommendation).toBeInstanceOf(PolicyDecision);
    expect(recommendation.kind).toBe(PolicyDecisionKind.Recommendation);
    expect(noAction.kind).toBe(PolicyDecisionKind.NoAction);
    expect(recommendation.equals(equivalent)).toBe(true);
    expect(recommendation.equals(noAction)).toBe(false);
    expect(recommendation.toJSON()).toEqual({
      decisionName: "PortfolioExecutionCompletion",
      kind: "Recommendation",
      reason: "Portfolio execution can be reviewed for completion.",
      references: ["execution-1"],
      factTypes: ["PortfolioWorkItemCompleted"]
    });
  });

  it("recommends execution completion only when active execution work is resolved", () => {
    const policy = new ExecutionCompletionPolicy();
    const aggregate = createAggregate({
      lifecycle: PortfolioExecutionLifecycle.Active,
      workItems: [
        createWorkItem("work-item-1", PortfolioWorkItemLifecycle.Completed),
        createWorkItem("work-item-2", PortfolioWorkItemLifecycle.Cancelled)
      ]
    });
    const before = aggregate.toJSON();

    const firstDecision = policy.evaluate(aggregate);
    const secondDecision = policy.evaluate(aggregate);

    expect(Object.isFrozen(policy)).toBe(true);
    expect(firstDecision).toBeInstanceOf(RecommendationDecision);
    expect(firstDecision.equals(secondDecision)).toBe(true);
    expect(firstDecision.toJSON()).toMatchObject({
      decisionName: "PortfolioExecutionCompletion",
      kind: "Recommendation",
      references: ["execution-1"]
    });
    expect(aggregate.toJSON()).toEqual(before);
  });

  it("returns no action for unresolved or terminal execution completion evaluations", () => {
    const policy = new ExecutionCompletionPolicy();

    expect(policy.evaluate(createAggregate({
      lifecycle: PortfolioExecutionLifecycle.Active,
      workItems: [createWorkItem("work-item-1", PortfolioWorkItemLifecycle.Active)]
    }))).toBeInstanceOf(NoActionDecision);
    expect(policy.evaluate(createAggregate({
      lifecycle: PortfolioExecutionLifecycle.Initialized,
      workItems: [createWorkItem("work-item-1", PortfolioWorkItemLifecycle.Completed)]
    }))).toBeInstanceOf(NoActionDecision);
    expect(policy.evaluate(createAggregate({
      lifecycle: PortfolioExecutionLifecycle.Completed,
      workItems: [createWorkItem("work-item-1", PortfolioWorkItemLifecycle.Completed)]
    }))).toBeInstanceOf(NoActionDecision);
  });

  it("recommends candidate acceptance review only for registered candidates in active executions", () => {
    const policy = new CandidateAcceptancePolicy();
    const aggregate = createAggregate({
      lifecycle: PortfolioExecutionLifecycle.Active,
      candidates: [
        createCandidate("candidate-1", ArtifactCandidateLifecycle.Registered),
        createCandidate("candidate-2", ArtifactCandidateLifecycle.Accepted)
      ]
    });
    const before = aggregate.toJSON();

    const decision = policy.evaluate(aggregate, new CandidateId("candidate-1"));
    const acceptedDecision = policy.evaluate(aggregate, new CandidateId("candidate-2"));
    const unknownDecision = policy.evaluate(aggregate, new CandidateId("candidate-3"));

    expect(Object.isFrozen(policy)).toBe(true);
    expect(decision).toBeInstanceOf(RecommendationDecision);
    expect(decision.toJSON()).toMatchObject({
      decisionName: "ArtifactCandidateAcceptance",
      kind: "Recommendation",
      references: ["execution-1", "candidate-1"]
    });
    expect(acceptedDecision).toBeInstanceOf(NoActionDecision);
    expect(unknownDecision).toBeInstanceOf(NoActionDecision);
    expect(aggregate.toJSON()).toEqual(before);
  });

  it("evaluates aggregate consistency without conflating distinct identifier concepts", () => {
    const policy = new ExecutionConsistencyPolicy();
    const aggregate = createAggregate({
      acceptedArtifacts: [new AcceptedArtifact({ id: new AcceptedArtifactId("shared-raw-id") })],
      candidates: [createCandidate("shared-raw-id", ArtifactCandidateLifecycle.Registered)],
      workItems: [createWorkItem("shared-raw-id", PortfolioWorkItemLifecycle.Pending)]
    });
    const before = aggregate.toJSON();

    const decision = policy.evaluate(aggregate);

    expect(Object.isFrozen(policy)).toBe(true);
    expect(decision).toBeInstanceOf(NoActionDecision);
    expect(decision.toJSON()).toMatchObject({
      decisionName: "PortfolioExecutionConsistency",
      kind: "NoAction",
      references: ["execution-1"]
    });
    expect(aggregate.toJSON()).toEqual(before);
  });

  it("can evaluate immutable facts without retaining or publishing them", () => {
    const aggregate = createAggregate({
      lifecycle: PortfolioExecutionLifecycle.Active,
      workItems: [createWorkItem("work-item-1", PortfolioWorkItemLifecycle.Active)]
    });
    const fact = aggregate.completeWorkItem(new WorkItemId("work-item-1"), commandContext());
    const policy = new ExecutionCompletionPolicy();

    const decision = policy.evaluate(aggregate, [fact]);

    expect(decision.toJSON().factTypes).toEqual(["PortfolioWorkItemCompleted"]);
    expect(policy).not.toHaveProperty("facts");
    expect(policy).not.toHaveProperty("pendingDecisions");
    expect(policy).not.toHaveProperty("repository");
    expect(policy).not.toHaveProperty("publish");
    expect(policy).not.toHaveProperty("schedule");
    expect(policy).not.toHaveProperty("execute");
    expect(policy).not.toHaveProperty("registry");
    expect(policy).not.toHaveProperty("engine");
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

function commandContext(): PortfolioExecutionCommandContext {
  return new PortfolioExecutionCommandContext({
    commandId: "operation-command-1",
    correlationId: "operation-correlation-1",
    actorReference: "actor:operation",
    occurredAt: "2026-07-30T00:00:01.000Z"
  });
}
