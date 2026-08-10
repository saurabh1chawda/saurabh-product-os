import { describe, expect, it } from "vitest";
import {
  AcceptedArtifact,
  AcceptedArtifactId,
  ArtifactCandidate,
  ArtifactCandidateLifecycle,
  CandidateId,
  InvalidExecutionOperationError,
  PortfolioWorkItem,
  PortfolioWorkItemLifecycle,
  WorkItemId
} from "../../src";

describe("portfolio workspace supporting entities", () => {
  it("constructs a PortfolioWorkItem with identity, lifecycle, serialization, and identity equality", () => {
    const workItem = new PortfolioWorkItem({
      id: new WorkItemId("work-item-1"),
      lifecycle: PortfolioWorkItemLifecycle.Pending
    });

    expect(workItem.id.equals(new WorkItemId("work-item-1"))).toBe(true);
    expect(workItem.lifecycle).toBe("Pending");
    expect(workItem.toJSON()).toEqual({
      id: "work-item-1",
      lifecycle: "Pending"
    });
    expect(workItem.equals(new PortfolioWorkItem({
      id: new WorkItemId("work-item-1"),
      lifecycle: PortfolioWorkItemLifecycle.Completed
    }))).toBe(true);
    expect(workItem.equals(new PortfolioWorkItem({
      id: new WorkItemId("work-item-2"),
      lifecycle: PortfolioWorkItemLifecycle.Pending
    }))).toBe(false);
    expect(Object.isFrozen(workItem)).toBe(true);
  });

  it("constructs an ArtifactCandidate with identity, lifecycle, serialization, and identity equality", () => {
    const candidate = new ArtifactCandidate({
      id: new CandidateId("candidate-1"),
      lifecycle: ArtifactCandidateLifecycle.Registered
    });

    expect(candidate.id.equals(new CandidateId("candidate-1"))).toBe(true);
    expect(candidate.lifecycle).toBe("Registered");
    expect(candidate.toJSON()).toEqual({
      id: "candidate-1",
      lifecycle: "Registered"
    });
    expect(candidate.equals(new ArtifactCandidate({
      id: new CandidateId("candidate-1"),
      lifecycle: ArtifactCandidateLifecycle.Rejected
    }))).toBe(true);
    expect(candidate.equals(new ArtifactCandidate({
      id: new CandidateId("candidate-2"),
      lifecycle: ArtifactCandidateLifecycle.Registered
    }))).toBe(false);
    expect(Object.isFrozen(candidate)).toBe(true);
  });

  it("constructs an immutable AcceptedArtifact without lifecycle or acceptance behavior", () => {
    const acceptedArtifact = new AcceptedArtifact({
      id: new AcceptedArtifactId("accepted-artifact-1")
    });

    expect(acceptedArtifact.id.equals(new AcceptedArtifactId("accepted-artifact-1"))).toBe(true);
    expect(acceptedArtifact.toJSON()).toEqual({ id: "accepted-artifact-1" });
    expect(acceptedArtifact.equals(new AcceptedArtifact({
      id: new AcceptedArtifactId("accepted-artifact-1")
    }))).toBe(true);
    expect(acceptedArtifact.equals(new AcceptedArtifact({
      id: new AcceptedArtifactId("accepted-artifact-2")
    }))).toBe(false);
    expect(Object.isFrozen(acceptedArtifact)).toBe(true);
    expect(acceptedArtifact).not.toHaveProperty("lifecycle");
    expect(acceptedArtifact).not.toHaveProperty("accept");
    expect(acceptedArtifact).not.toHaveProperty("reject");
  });

  it("rejects invalid local construction state without aggregate coordination", () => {
    expect(() => new PortfolioWorkItem({
      id: new CandidateId("candidate-1") as never,
      lifecycle: PortfolioWorkItemLifecycle.Pending
    })).toThrow(InvalidExecutionOperationError);

    expect(() => new PortfolioWorkItem({
      id: new WorkItemId("work-item-1"),
      lifecycle: "Ready" as never
    })).toThrow(InvalidExecutionOperationError);

    expect(() => new ArtifactCandidate({
      id: new WorkItemId("work-item-1") as never,
      lifecycle: ArtifactCandidateLifecycle.Registered
    })).toThrow(InvalidExecutionOperationError);

    expect(() => new ArtifactCandidate({
      id: new CandidateId("candidate-1"),
      lifecycle: "Draft" as never
    })).toThrow(InvalidExecutionOperationError);

    expect(() => new AcceptedArtifact({
      id: new CandidateId("candidate-1") as never
    })).toThrow(InvalidExecutionOperationError);
  });

  it("does not expose aggregate behavior, transitions, coordination, registration, or persistence concerns", () => {
    const entities = [
      new PortfolioWorkItem({
        id: new WorkItemId("work-item-1"),
        lifecycle: PortfolioWorkItemLifecycle.Pending
      }),
      new ArtifactCandidate({
        id: new CandidateId("candidate-1"),
        lifecycle: ArtifactCandidateLifecycle.Registered
      }),
      new AcceptedArtifact({
        id: new AcceptedArtifactId("accepted-artifact-1")
      })
    ];

    for (const entity of entities) {
      expect(entity).not.toHaveProperty("transitionTo");
      expect(entity).not.toHaveProperty("advance");
      expect(entity).not.toHaveProperty("complete");
      expect(entity).not.toHaveProperty("cancel");
      expect(entity).not.toHaveProperty("accept");
      expect(entity).not.toHaveProperty("reject");
      expect(entity).not.toHaveProperty("activate");
      expect(entity).not.toHaveProperty("pause");
      expect(entity).not.toHaveProperty("resume");
      expect(entity).not.toHaveProperty("registerCandidate");
      expect(entity).not.toHaveProperty("addAcceptedArtifact");
      expect(entity).not.toHaveProperty("repository");
      expect(entity).not.toHaveProperty("save");
    }
  });
});
