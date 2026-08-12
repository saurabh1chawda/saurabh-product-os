import { describe, expect, expectTypeOf, it } from "vitest";
import {
  AcceptedArtifactId,
  ArtifactCandidateAcceptedFact,
  ArtifactCandidateRejectedFact,
  ApprovalReference,
  CandidateId,
  ExecutionId,
  InvalidExecutionOperationError,
  PlanSnapshotReference,
  PortfolioExecutionCancelledFact,
  PortfolioExecutionCommandContext,
  PortfolioExecutionCompletedFact,
  PortfolioExecutionInitializedFact,
  type PortfolioExecutionFact,
  PortfolioExecutionStartedFact,
  PortfolioPlanReference,
  PortfolioWorkspaceAuthorizationResourceReference,
  PortfolioWorkItemActivatedFact,
  PortfolioWorkItemCancelledFact,
  PortfolioWorkItemCompletedFact,
  WorkItemId
} from "../../src";

describe("PortfolioExecution immutable domain facts", () => {
  it("constructs immutable work-item facts with deterministic serialization and value equality", () => {
    const activated = new PortfolioWorkItemActivatedFact({
      executionId: new ExecutionId("execution-1"),
      workItemId: new WorkItemId("work-item-1"),
      commandContext: createCommandContext()
    });
    const equivalent = new PortfolioWorkItemActivatedFact({
      executionId: new ExecutionId("execution-1"),
      workItemId: new WorkItemId("work-item-1"),
      commandContext: createCommandContext()
    });

    expect(Object.isFrozen(activated)).toBe(true);
    expect(activated.equals(equivalent)).toBe(true);
    expect(activated.equals(new PortfolioWorkItemActivatedFact({
      executionId: new ExecutionId("execution-1"),
      workItemId: new WorkItemId("work-item-2"),
      commandContext: createCommandContext()
    }))).toBe(false);
    expect(activated.toJSON()).toEqual({
      type: "PortfolioWorkItemActivated",
      executionId: "execution-1",
      commandContext: commandContextJson(),
      workItemId: "work-item-1"
    });

    expect(new PortfolioWorkItemCompletedFact({
      executionId: new ExecutionId("execution-1"),
      workItemId: new WorkItemId("work-item-1"),
      commandContext: createCommandContext()
    }).toJSON().type).toBe("PortfolioWorkItemCompleted");
    expect(new PortfolioWorkItemCancelledFact({
      executionId: new ExecutionId("execution-1"),
      workItemId: new WorkItemId("work-item-1"),
      commandContext: createCommandContext()
    }).toJSON().type).toBe("PortfolioWorkItemCancelled");
  });

  it("constructs immutable candidate facts with deterministic serialization and value equality", () => {
    const accepted = new ArtifactCandidateAcceptedFact({
      executionId: new ExecutionId("execution-1"),
      candidateId: new CandidateId("candidate-1"),
      acceptedArtifactId: new AcceptedArtifactId("accepted-artifact-1"),
      commandContext: createCommandContext()
    });
    const rejected = new ArtifactCandidateRejectedFact({
      executionId: new ExecutionId("execution-1"),
      candidateId: new CandidateId("candidate-1"),
      commandContext: createCommandContext()
    });

    expect(Object.isFrozen(accepted)).toBe(true);
    expect(accepted.equals(new ArtifactCandidateAcceptedFact({
      executionId: new ExecutionId("execution-1"),
      candidateId: new CandidateId("candidate-1"),
      acceptedArtifactId: new AcceptedArtifactId("accepted-artifact-1"),
      commandContext: createCommandContext()
    }))).toBe(true);
    expect(accepted.equals(new ArtifactCandidateAcceptedFact({
      executionId: new ExecutionId("execution-1"),
      candidateId: new CandidateId("candidate-1"),
      acceptedArtifactId: new AcceptedArtifactId("accepted-artifact-2"),
      commandContext: createCommandContext()
    }))).toBe(false);
    expect(accepted.toJSON()).toEqual({
      type: "ArtifactCandidateAccepted",
      executionId: "execution-1",
      commandContext: commandContextJson(),
      candidateId: "candidate-1",
      acceptedArtifactId: "accepted-artifact-1"
    });
    expect(rejected.toJSON()).toEqual({
      type: "ArtifactCandidateRejected",
      executionId: "execution-1",
      commandContext: commandContextJson(),
      candidateId: "candidate-1"
    });
  });

  it("constructs immutable execution facts with deterministic serialization and value equality", () => {
    const initialized = new PortfolioExecutionInitializedFact({
      executionId: new ExecutionId("execution-1"),
      portfolioPlanReference: portfolioPlanReference(),
      planSnapshotReference: planSnapshotReference(),
      approvalReference: approvalReference(),
      authorizationResourceReference: authorizationResourceReference(),
      commandContext: createCommandContext()
    });
    const started = new PortfolioExecutionStartedFact({
      executionId: new ExecutionId("execution-1"),
      commandContext: createCommandContext()
    });
    const completed = new PortfolioExecutionCompletedFact({
      executionId: new ExecutionId("execution-1"),
      commandContext: createCommandContext()
    });
    const cancelled = new PortfolioExecutionCancelledFact({
      executionId: new ExecutionId("execution-1"),
      commandContext: createCommandContext()
    });

    expect(Object.isFrozen(initialized)).toBe(true);
    expect(initialized.equals(new PortfolioExecutionInitializedFact({
      executionId: new ExecutionId("execution-1"),
      portfolioPlanReference: portfolioPlanReference(),
      planSnapshotReference: planSnapshotReference(),
      approvalReference: approvalReference(),
      authorizationResourceReference: authorizationResourceReference(),
      commandContext: createCommandContext()
    }))).toBe(true);
    expect(initialized.toJSON()).toEqual({
      type: "PortfolioExecutionInitialized",
      executionId: "execution-1",
      commandContext: commandContextJson(),
      portfolioPlanReference: portfolioPlanReference().toJSON(),
      planSnapshotReference: planSnapshotReference().toJSON(),
      approvalReference: approvalReference().toJSON(),
      authorizationResourceReference: authorizationResourceReference().toJSON()
    });
    expect(Object.isFrozen(started)).toBe(true);
    expect(started.equals(new PortfolioExecutionStartedFact({
      executionId: new ExecutionId("execution-1"),
      commandContext: createCommandContext()
    }))).toBe(true);
    expect(started.equals(new PortfolioExecutionStartedFact({
      executionId: new ExecutionId("execution-2"),
      commandContext: createCommandContext()
    }))).toBe(false);
    expect(started.toJSON()).toEqual({
      type: "PortfolioExecutionStarted",
      executionId: "execution-1",
      commandContext: commandContextJson()
    });
    expect(Object.isFrozen(completed)).toBe(true);
    expect(completed.equals(new PortfolioExecutionCompletedFact({
      executionId: new ExecutionId("execution-1"),
      commandContext: createCommandContext()
    }))).toBe(true);
    expect(completed.toJSON()).toEqual({
      type: "PortfolioExecutionCompleted",
      executionId: "execution-1",
      commandContext: commandContextJson()
    });
    expect(cancelled.toJSON()).toEqual({
      type: "PortfolioExecutionCancelled",
      executionId: "execution-1",
      commandContext: commandContextJson()
    });
  });

  it("includes initialized and started facts in the PortfolioExecutionFact union", () => {
    expectTypeOf<PortfolioExecutionInitializedFact>().toMatchTypeOf<PortfolioExecutionFact>();
    expectTypeOf<PortfolioExecutionStartedFact>().toMatchTypeOf<PortfolioExecutionFact>();
  });

  it("rejects invalid fact construction state", () => {
    expect(() => new PortfolioWorkItemActivatedFact({
      executionId: new WorkItemId("work-item-1") as never,
      workItemId: new WorkItemId("work-item-1"),
      commandContext: createCommandContext()
    })).toThrow(InvalidExecutionOperationError);
    expect(() => new PortfolioWorkItemActivatedFact({
      executionId: new ExecutionId("execution-1"),
      workItemId: new CandidateId("candidate-1") as never,
      commandContext: createCommandContext()
    })).toThrow(InvalidExecutionOperationError);
    expect(() => new ArtifactCandidateAcceptedFact({
      executionId: new ExecutionId("execution-1"),
      candidateId: new WorkItemId("work-item-1") as never,
      acceptedArtifactId: new AcceptedArtifactId("accepted-artifact-1"),
      commandContext: createCommandContext()
    })).toThrow(InvalidExecutionOperationError);
    expect(() => new ArtifactCandidateAcceptedFact({
      executionId: new ExecutionId("execution-1"),
      candidateId: new CandidateId("candidate-1"),
      acceptedArtifactId: new CandidateId("candidate-1") as never,
      commandContext: createCommandContext()
    })).toThrow(InvalidExecutionOperationError);
    expect(() => new PortfolioExecutionCompletedFact({
      executionId: new ExecutionId("execution-1"),
      commandContext: { commandId: "command-1" } as never
    })).toThrow(InvalidExecutionOperationError);
    expect(() => new PortfolioExecutionStartedFact({
      executionId: new WorkItemId("work-item-1") as never,
      commandContext: createCommandContext()
    })).toThrow(InvalidExecutionOperationError);
    expect(() => new PortfolioExecutionInitializedFact({
      executionId: new ExecutionId("execution-1"),
      portfolioPlanReference: new WorkItemId("work-item-1") as never,
      planSnapshotReference: planSnapshotReference(),
      approvalReference: approvalReference(),
      authorizationResourceReference: authorizationResourceReference(),
      commandContext: createCommandContext()
    })).toThrow(InvalidExecutionOperationError);
  });

  it("keeps facts free of infrastructure, transport, projection, and event-bus concerns", () => {
    const facts = [
      new PortfolioWorkItemActivatedFact({
        executionId: new ExecutionId("execution-1"),
        workItemId: new WorkItemId("work-item-1"),
        commandContext: createCommandContext()
      }),
      new PortfolioExecutionStartedFact({
        executionId: new ExecutionId("execution-1"),
        commandContext: createCommandContext()
      }),
      new PortfolioExecutionInitializedFact({
        executionId: new ExecutionId("execution-1"),
        portfolioPlanReference: portfolioPlanReference(),
        planSnapshotReference: planSnapshotReference(),
        approvalReference: approvalReference(),
        authorizationResourceReference: authorizationResourceReference(),
        commandContext: createCommandContext()
      }),
      new ArtifactCandidateAcceptedFact({
        executionId: new ExecutionId("execution-1"),
        candidateId: new CandidateId("candidate-1"),
        acceptedArtifactId: new AcceptedArtifactId("accepted-artifact-1"),
        commandContext: createCommandContext()
      }),
      new PortfolioExecutionCompletedFact({
        executionId: new ExecutionId("execution-1"),
        commandContext: createCommandContext()
      })
    ];

    for (const fact of facts) {
      expect(fact).not.toHaveProperty("repository");
      expect(fact).not.toHaveProperty("save");
      expect(fact).not.toHaveProperty("publish");
      expect(fact).not.toHaveProperty("subscribe");
      expect(fact).not.toHaveProperty("handler");
      expect(fact).not.toHaveProperty("projection");
      expect(fact).not.toHaveProperty("http");
      expect(fact).not.toHaveProperty("ui");
      expect(fact).not.toHaveProperty("ai");
    }
  });
});

function createCommandContext(): PortfolioExecutionCommandContext {
  return new PortfolioExecutionCommandContext(commandContextJson());
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

function authorizationResourceReference(): PortfolioWorkspaceAuthorizationResourceReference {
  return new PortfolioWorkspaceAuthorizationResourceReference({
    authorizationResourceReference: "portfolio-workspace:execution-owner-1"
  });
}

function commandContextJson(): {
  readonly commandId: string;
  readonly correlationId: string;
  readonly actorReference: string;
  readonly occurredAt: string;
} {
  return {
    commandId: "command-1",
    correlationId: "correlation-1",
    actorReference: "actor:1",
    occurredAt: "2026-07-30T00:00:00.000Z"
  };
}
