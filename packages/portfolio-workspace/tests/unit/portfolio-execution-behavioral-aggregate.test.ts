import { describe, expect, it } from "vitest";
import {
  AcceptedArtifact,
  AcceptedArtifactId,
  ApprovalReference,
  ArtifactCandidate,
  ArtifactCandidateAcceptedFact,
  ArtifactCandidateLifecycle,
  ArtifactCandidateRejectedFact,
  type ArtifactCandidateLifecycleValue,
  CandidateId,
  DuplicateAcceptedArtifactError,
  DuplicateCandidateError,
  DuplicateWorkItemError,
  ExecutionId,
  InvalidExecutionOperationError,
  PlanSnapshotReference,
  PortfolioExecution,
  PortfolioExecutionCancelledFact,
  PortfolioExecutionCommandContext,
  PortfolioExecutionCompletedFact,
  PortfolioExecutionInitializedFact,
  PortfolioExecutionInitializationResult,
  PortfolioExecutionLifecycle,
  PortfolioExecutionStartedFact,
  PortfolioPlanReference,
  PortfolioWorkItem,
  PortfolioWorkItemActivatedFact,
  PortfolioWorkItemCancelledFact,
  PortfolioWorkItemCompletedFact,
  PortfolioWorkItemLifecycle,
  type PortfolioWorkItemLifecycleValue,
  UnknownCandidateError,
  UnknownWorkItemError,
  WorkItemId
} from "../../src";

describe("PortfolioExecution behavioral aggregate", () => {
  it("initializes a PortfolioExecution with approved references, initial owned entities, and an initialization fact", () => {
    const workItem = createWorkItem("work-item-1", PortfolioWorkItemLifecycle.Pending);
    const candidate = createCandidate("candidate-1", ArtifactCandidateLifecycle.Registered);
    const initialized = PortfolioExecution.initialize({
      id: new ExecutionId("execution-1"),
      portfolioPlanReference: portfolioPlanReference(),
      planSnapshotReference: planSnapshotReference(),
      approvalReference: approvalReference(),
      commandContext: commandContext(),
      workItems: [workItem],
      candidates: [candidate]
    });

    expect(initialized).toBeInstanceOf(PortfolioExecutionInitializationResult);
    expect(Object.isFrozen(initialized)).toBe(true);
    expect(initialized.execution.lifecycle).toBe(PortfolioExecutionLifecycle.Initialized);
    expect(initialized.execution.workItems()).toEqual([workItem]);
    expect(initialized.execution.candidates()).toEqual([candidate]);
    expect(initialized.execution.acceptedArtifacts()).toHaveLength(0);
    expect(initialized.fact).toBeInstanceOf(PortfolioExecutionInitializedFact);
    expect(initialized.fact.commandContext.equals(commandContext())).toBe(true);
    expect(initialized.fact.toJSON()).toMatchObject({
      type: "PortfolioExecutionInitialized",
      executionId: "execution-1"
    });
    expect(initialized.execution).not.toHaveProperty("facts");
    expect(initialized.execution).not.toHaveProperty("pendingFacts");
  });

  it("rejects duplicate initial owned entity identities before returning initialization state", () => {
    expect(() => PortfolioExecution.initialize({
      id: new ExecutionId("execution-1"),
      portfolioPlanReference: portfolioPlanReference(),
      planSnapshotReference: planSnapshotReference(),
      approvalReference: approvalReference(),
      commandContext: commandContext(),
      workItems: [
        createWorkItem("work-item-1", PortfolioWorkItemLifecycle.Pending),
        createWorkItem("work-item-1", PortfolioWorkItemLifecycle.Pending)
      ]
    })).toThrow(DuplicateWorkItemError);
    expect(() => PortfolioExecution.initialize({
      id: new ExecutionId("execution-1"),
      portfolioPlanReference: portfolioPlanReference(),
      planSnapshotReference: planSnapshotReference(),
      approvalReference: approvalReference(),
      commandContext: commandContext(),
      candidates: [
        createCandidate("candidate-1", ArtifactCandidateLifecycle.Registered),
        createCandidate("candidate-1", ArtifactCandidateLifecycle.Registered)
      ]
    })).toThrow(DuplicateCandidateError);
  });

  it("begins execution and evolves work items by replacing immutable entity instances", () => {
    const workItem = createWorkItem("work-item-1", PortfolioWorkItemLifecycle.Pending);
    const aggregate = createAggregate({ workItems: [workItem] });

    const startedFact = aggregate.beginExecution(commandContext());

    expect(startedFact).toBeInstanceOf(PortfolioExecutionStartedFact);
    expect(startedFact.toJSON()).toEqual({
      type: "PortfolioExecutionStarted",
      executionId: "execution-1",
      commandContext: {
        commandId: "operation-command-1",
        correlationId: "operation-correlation-1",
        actorReference: "actor:1",
        occurredAt: "2026-07-29T00:00:01.000Z"
      }
    });
    expect(aggregate.lifecycle).toBe(PortfolioExecutionLifecycle.Active);

    const activatedFact = aggregate.activateWorkItem(new WorkItemId("work-item-1"), commandContext());
    const activeWorkItem = aggregate.findWorkItem(new WorkItemId("work-item-1"));

    expect(activatedFact).toBeInstanceOf(PortfolioWorkItemActivatedFact);
    expect(activatedFact.toJSON()).toMatchObject({
      type: "PortfolioWorkItemActivated",
      executionId: "execution-1",
      workItemId: "work-item-1"
    });
    expect(activeWorkItem).not.toBe(workItem);
    expect(activeWorkItem?.lifecycle).toBe(PortfolioWorkItemLifecycle.Active);

    const completedWorkItemFact = aggregate.completeWorkItem(new WorkItemId("work-item-1"), commandContext());
    expect(completedWorkItemFact).toBeInstanceOf(PortfolioWorkItemCompletedFact);
    expect(completedWorkItemFact.toJSON()).toMatchObject({
      type: "PortfolioWorkItemCompleted",
      executionId: "execution-1",
      workItemId: "work-item-1"
    });
    expect(aggregate.findWorkItem(new WorkItemId("work-item-1"))?.lifecycle).toBe(PortfolioWorkItemLifecycle.Completed);

    const completedExecutionFact = aggregate.completeExecution(commandContext());
    expect(completedExecutionFact).toBeInstanceOf(PortfolioExecutionCompletedFact);
    expect(completedExecutionFact.toJSON()).toMatchObject({
      type: "PortfolioExecutionCompleted",
      executionId: "execution-1"
    });
    expect(aggregate.lifecycle).toBe(PortfolioExecutionLifecycle.Completed);
  });

  it("uses the supplied operation context for each produced fact without leaking aggregate initialization context", () => {
    const aggregate = createAggregate({
      workItems: [
        createWorkItem("work-item-1", PortfolioWorkItemLifecycle.Pending),
        createWorkItem("work-item-2", PortfolioWorkItemLifecycle.Pending)
      ]
    });
    const startContext = commandContext("1");
    const activateContext = commandContext("2");
    const cancelContext = commandContext("3");

    const startedFact = aggregate.beginExecution(startContext);
    const activatedFact = aggregate.activateWorkItem(new WorkItemId("work-item-1"), activateContext);
    const cancelledFact = aggregate.cancelWorkItem(new WorkItemId("work-item-2"), cancelContext);

    expect(startedFact.commandContext.equals(startContext)).toBe(true);
    expect(activatedFact.commandContext.equals(activateContext)).toBe(true);
    expect(cancelledFact.commandContext.equals(cancelContext)).toBe(true);
    expect(startedFact.commandContext.equals(aggregate.commandContext)).toBe(false);
    expect(activatedFact.commandContext.equals(startedFact.commandContext)).toBe(false);
    expect(cancelledFact.commandContext.equals(activatedFact.commandContext)).toBe(false);
    expect(startedFact.toJSON().commandContext).toEqual(startContext.toJSON());
    expect(aggregate.toJSON().commandContext).toEqual({
      commandId: "command-1",
      correlationId: "correlation-1",
      actorReference: "actor:1",
      occurredAt: "2026-07-29T00:00:00.000Z"
    });
  });

  it("accepts and rejects registered candidates by replacing immutable entity instances", () => {
    const candidate = createCandidate("candidate-1", ArtifactCandidateLifecycle.Registered);
    const aggregate = createAggregate({ candidates: [candidate] });
    aggregate.beginExecution(commandContext());

    const acceptedFact = aggregate.acceptCandidate(new CandidateId("candidate-1"), new AcceptedArtifactId("accepted-artifact-1"), commandContext());
    const acceptedCandidate = aggregate.findCandidate(new CandidateId("candidate-1"));
    const acceptedArtifact = aggregate.findAcceptedArtifact(new AcceptedArtifactId("accepted-artifact-1"));

    expect(acceptedFact).toBeInstanceOf(ArtifactCandidateAcceptedFact);
    expect(acceptedFact.toJSON()).toMatchObject({
      type: "ArtifactCandidateAccepted",
      executionId: "execution-1",
      candidateId: "candidate-1",
      acceptedArtifactId: "accepted-artifact-1"
    });
    expect(acceptedCandidate).not.toBe(candidate);
    expect(acceptedCandidate?.lifecycle).toBe(ArtifactCandidateLifecycle.Accepted);
    expect(acceptedArtifact).toBeInstanceOf(AcceptedArtifact);
    expect(acceptedArtifact?.id.equals(new AcceptedArtifactId("accepted-artifact-1"))).toBe(true);
    expect(aggregate.acceptedArtifacts()).toHaveLength(1);

    const rejectAggregate = createAggregate({
      candidates: [createCandidate("candidate-2", ArtifactCandidateLifecycle.Registered)]
    });
    rejectAggregate.beginExecution(commandContext());

    const rejectedFact = rejectAggregate.rejectCandidate(new CandidateId("candidate-2"), commandContext());
    expect(rejectedFact).toBeInstanceOf(ArtifactCandidateRejectedFact);
    expect(rejectedFact.toJSON()).toMatchObject({
      type: "ArtifactCandidateRejected",
      executionId: "execution-1",
      candidateId: "candidate-2"
    });
    expect(rejectAggregate.findCandidate(new CandidateId("candidate-2"))?.lifecycle).toBe(ArtifactCandidateLifecycle.Rejected);
  });

  it("rejects unknown work-item and candidate operations", () => {
    const aggregate = createAggregate();
    aggregate.beginExecution(commandContext());

    expect(() => aggregate.activateWorkItem(new WorkItemId("missing-work-item"), commandContext())).toThrow(UnknownWorkItemError);
    expect(() => aggregate.completeWorkItem(new WorkItemId("missing-work-item"), commandContext())).toThrow(UnknownWorkItemError);
    expect(() => aggregate.cancelWorkItem(new WorkItemId("missing-work-item"), commandContext())).toThrow(UnknownWorkItemError);
    expect(() => aggregate.acceptCandidate(new CandidateId("missing-candidate"), new AcceptedArtifactId("accepted-artifact-1"), commandContext())).toThrow(UnknownCandidateError);
    expect(() => aggregate.rejectCandidate(new CandidateId("missing-candidate"), commandContext())).toThrow(UnknownCandidateError);
  });

  it("requires active execution before work-item and candidate behavior", () => {
    const aggregate = createAggregate({
      candidates: [createCandidate("candidate-1", ArtifactCandidateLifecycle.Registered)],
      workItems: [createWorkItem("work-item-1", PortfolioWorkItemLifecycle.Pending)]
    });

    expect(() => aggregate.activateWorkItem(new WorkItemId("work-item-1"), commandContext())).toThrow(InvalidExecutionOperationError);
    expect(() => aggregate.completeWorkItem(new WorkItemId("work-item-1"), commandContext())).toThrow(InvalidExecutionOperationError);
    expect(() => aggregate.cancelWorkItem(new WorkItemId("work-item-1"), commandContext())).toThrow(InvalidExecutionOperationError);
    expect(() => aggregate.acceptCandidate(new CandidateId("candidate-1"), new AcceptedArtifactId("accepted-artifact-1"), commandContext())).toThrow(InvalidExecutionOperationError);
    expect(() => aggregate.rejectCandidate(new CandidateId("candidate-1"), commandContext())).toThrow(InvalidExecutionOperationError);
  });

  it("rejects repeated begin execution without returning a fact or changing state", () => {
    const aggregate = createAggregate();

    const startedFact = aggregate.beginExecution(commandContext());
    const activeState = aggregate.toJSON();

    expect(startedFact).toBeInstanceOf(PortfolioExecutionStartedFact);
    expect(() => aggregate.beginExecution(commandContext())).toThrow(InvalidExecutionOperationError);
    expect(aggregate.toJSON()).toEqual(activeState);
    expect(aggregate).not.toHaveProperty("facts");
    expect(aggregate).not.toHaveProperty("pendingFacts");
    expect(aggregate).not.toHaveProperty("eventQueue");
  });

  it("enforces lifecycle-specific behavioral invariants", () => {
    const aggregate = createAggregate({
      candidates: [createCandidate("candidate-1", ArtifactCandidateLifecycle.Registered)],
      workItems: [createWorkItem("work-item-1", PortfolioWorkItemLifecycle.Pending)]
    });
    aggregate.beginExecution(commandContext());

    expect(() => aggregate.completeWorkItem(new WorkItemId("work-item-1"), commandContext())).toThrow(InvalidExecutionOperationError);

    aggregate.activateWorkItem(new WorkItemId("work-item-1"), commandContext());
    expect(() => aggregate.activateWorkItem(new WorkItemId("work-item-1"), commandContext())).toThrow(InvalidExecutionOperationError);

    aggregate.completeWorkItem(new WorkItemId("work-item-1"), commandContext());
    expect(() => aggregate.cancelWorkItem(new WorkItemId("work-item-1"), commandContext())).toThrow(InvalidExecutionOperationError);

    aggregate.acceptCandidate(new CandidateId("candidate-1"), new AcceptedArtifactId("accepted-artifact-1"), commandContext());
    expect(() => aggregate.rejectCandidate(new CandidateId("candidate-1"), commandContext())).toThrow(InvalidExecutionOperationError);
  });

  it("allows work-item cancellation while execution remains active", () => {
    const aggregate = createAggregate({
      workItems: [createWorkItem("work-item-1", PortfolioWorkItemLifecycle.Pending)]
    });
    aggregate.beginExecution(commandContext());

    const cancelledFact = aggregate.cancelWorkItem(new WorkItemId("work-item-1"), commandContext());

    expect(cancelledFact).toBeInstanceOf(PortfolioWorkItemCancelledFact);
    expect(cancelledFact.toJSON()).toMatchObject({
      type: "PortfolioWorkItemCancelled",
      executionId: "execution-1",
      workItemId: "work-item-1"
    });
    expect(aggregate.findWorkItem(new WorkItemId("work-item-1"))?.lifecycle).toBe(PortfolioWorkItemLifecycle.Cancelled);
    expect(aggregate.lifecycle).toBe(PortfolioExecutionLifecycle.Active);
  });

  it("requires required work to be resolved before completion", () => {
    const aggregate = createAggregate({
      workItems: [
        createWorkItem("work-item-1", PortfolioWorkItemLifecycle.Pending),
        createWorkItem("work-item-2", PortfolioWorkItemLifecycle.Pending)
      ]
    });
    aggregate.beginExecution(commandContext());

    aggregate.activateWorkItem(new WorkItemId("work-item-1"), commandContext());
    aggregate.completeWorkItem(new WorkItemId("work-item-1"), commandContext());

    expect(() => aggregate.completeExecution(commandContext())).toThrow(InvalidExecutionOperationError);

    aggregate.cancelWorkItem(new WorkItemId("work-item-2"), commandContext());
    aggregate.completeExecution(commandContext());

    expect(aggregate.lifecycle).toBe(PortfolioExecutionLifecycle.Completed);
  });

  it("keeps completed and cancelled executions terminal for behavioral operations", () => {
    const completed = createAggregate({
      workItems: [createWorkItem("work-item-1", PortfolioWorkItemLifecycle.Pending)]
    });
    completed.beginExecution(commandContext());
    completed.activateWorkItem(new WorkItemId("work-item-1"), commandContext());
    completed.completeWorkItem(new WorkItemId("work-item-1"), commandContext());
    completed.completeExecution(commandContext());

    expect(() => completed.completeExecution(commandContext())).toThrow(InvalidExecutionOperationError);
    expect(() => completed.cancelExecution(commandContext())).toThrow(InvalidExecutionOperationError);
    expect(() => completed.beginExecution(commandContext())).toThrow(InvalidExecutionOperationError);

    const cancelled = createAggregate();
    const cancelledExecutionFact = cancelled.cancelExecution(commandContext());

    expect(cancelledExecutionFact).toBeInstanceOf(PortfolioExecutionCancelledFact);
    expect(cancelledExecutionFact.toJSON()).toMatchObject({
      type: "PortfolioExecutionCancelled",
      executionId: "execution-1"
    });
    expect(cancelled.lifecycle).toBe(PortfolioExecutionLifecycle.Cancelled);
    expect(() => cancelled.beginExecution(commandContext())).toThrow(InvalidExecutionOperationError);
    expect(() => cancelled.completeExecution(commandContext())).toThrow(InvalidExecutionOperationError);
    expect(() => cancelled.cancelExecution(commandContext())).toThrow(InvalidExecutionOperationError);
  });

  it("preserves deterministic serialization after behavior", () => {
    const aggregate = createAggregate({
      acceptedArtifacts: [createAcceptedArtifact("accepted-artifact-1")],
      candidates: [createCandidate("candidate-1", ArtifactCandidateLifecycle.Registered)],
      workItems: [createWorkItem("work-item-1", PortfolioWorkItemLifecycle.Pending)]
    });

    aggregate.beginExecution(commandContext());
    aggregate.activateWorkItem(new WorkItemId("work-item-1"), commandContext());
    aggregate.completeWorkItem(new WorkItemId("work-item-1"), commandContext());
    aggregate.acceptCandidate(new CandidateId("candidate-1"), new AcceptedArtifactId("accepted-artifact-2"), commandContext());
    aggregate.completeExecution(commandContext());

    expect(aggregate.toJSON()).toMatchObject({
      lifecycle: "Completed",
      workItems: [{
        id: "work-item-1",
        lifecycle: "Completed"
      }],
      candidates: [{
        id: "candidate-1",
        lifecycle: "Accepted"
      }],
      acceptedArtifacts: [{
        id: "accepted-artifact-1"
      }, {
        id: "accepted-artifact-2"
      }]
    });
  });

  it("does not introduce facts, projections, repositories, events, or generic transition APIs", () => {
    const aggregate = createAggregate();

    expect(aggregate).not.toHaveProperty("facts");
    expect(aggregate).not.toHaveProperty("pullFacts");
    expect(aggregate).not.toHaveProperty("events");
    expect(aggregate).not.toHaveProperty("eventQueue");
    expect(aggregate).not.toHaveProperty("pendingFacts");
    expect(aggregate).not.toHaveProperty("recordedFacts");
    expect(aggregate).not.toHaveProperty("publish");
    expect(aggregate).not.toHaveProperty("progress");
    expect(aggregate).not.toHaveProperty("repository");
    expect(aggregate).not.toHaveProperty("save");
    expect(aggregate).not.toHaveProperty("transition");
    expect(aggregate).not.toHaveProperty("setLifecycle");
    expect(aggregate).not.toHaveProperty("setStatus");
    expect(aggregate).not.toHaveProperty("changeState");
    expect(aggregate).not.toHaveProperty("advance");
  });

  it("rejects duplicate accepted artifact identity atomically", () => {
    const aggregate = createAggregate({
      acceptedArtifacts: [createAcceptedArtifact("accepted-artifact-1")],
      candidates: [createCandidate("candidate-1", ArtifactCandidateLifecycle.Registered)]
    });
    aggregate.beginExecution(commandContext());
    const before = aggregate.toJSON();

    expect(() => aggregate.acceptCandidate(new CandidateId("candidate-1"), new AcceptedArtifactId("accepted-artifact-1"), commandContext())).toThrow(DuplicateAcceptedArtifactError);

    expect(aggregate.toJSON()).toEqual(before);
    expect(aggregate.findCandidate(new CandidateId("candidate-1"))?.lifecycle).toBe(ArtifactCandidateLifecycle.Registered);
    expect(aggregate.acceptedArtifacts()).toHaveLength(1);
  });

  it("rejects invalid candidate lifecycle atomically during acceptance", () => {
    const aggregate = createAggregate({
      candidates: [createCandidate("candidate-1", ArtifactCandidateLifecycle.Rejected)]
    });
    aggregate.beginExecution(commandContext());
    const before = aggregate.toJSON();

    expect(() => aggregate.acceptCandidate(new CandidateId("candidate-1"), new AcceptedArtifactId("accepted-artifact-1"), commandContext())).toThrow(InvalidExecutionOperationError);

    expect(aggregate.toJSON()).toEqual(before);
    expect(aggregate.acceptedArtifacts()).toHaveLength(0);
  });
});

function createAggregate(overrides: Partial<ConstructorParameters<typeof PortfolioExecution>[0]> = {}): PortfolioExecution {
  return new PortfolioExecution({
    id: new ExecutionId("execution-1"),
    portfolioPlanReference: portfolioPlanReference(),
    planSnapshotReference: planSnapshotReference(),
    approvalReference: approvalReference(),
    commandContext: new PortfolioExecutionCommandContext({
      commandId: "command-1",
      correlationId: "correlation-1",
      actorReference: "actor:1",
      occurredAt: "2026-07-29T00:00:00.000Z"
    }),
    lifecycle: PortfolioExecutionLifecycle.Initialized,
    ...overrides
  });
}

function portfolioPlanReference(): PortfolioPlanReference {
  return new PortfolioPlanReference({
    planId: "portfolio-plan-1",
    roadmapId: "roadmap-1",
    planArtifactReference: "artifact:portfolio-plan-1"
  });
}

function planSnapshotReference(): PlanSnapshotReference {
  return new PlanSnapshotReference({
    snapshotReference: "snapshot:portfolio-plan-1:v1"
  });
}

function approvalReference(): ApprovalReference {
  return new ApprovalReference({
    approvalReference: "approval:portfolio-plan-1"
  });
}

function createWorkItem(id: string, lifecycle: PortfolioWorkItemLifecycleValue): PortfolioWorkItem {
  return new PortfolioWorkItem({
    id: new WorkItemId(id),
    lifecycle
  });
}

function createCandidate(id: string, lifecycle: ArtifactCandidateLifecycleValue): ArtifactCandidate {
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

function commandContext(suffix = "1"): PortfolioExecutionCommandContext {
  return new PortfolioExecutionCommandContext({
    commandId: `operation-command-${suffix}`,
    correlationId: `operation-correlation-${suffix}`,
    actorReference: `actor:${suffix}`,
    occurredAt: `2026-07-29T00:00:0${suffix}.000Z`
  });
}
