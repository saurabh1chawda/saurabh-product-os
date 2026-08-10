import { describe, expect, it } from "vitest";
import {
  ArtifactCandidateLifecycle,
  PortfolioExecutionLifecycle,
  PortfolioWorkItemLifecycle
} from "../../src";
import type {
  ArtifactCandidateLifecycleValue,
  PortfolioExecutionLifecycleValue,
  PortfolioWorkItemLifecycleValue
} from "../../src";

describe("portfolio workspace lifecycle vocabulary", () => {
  it("defines the exact PortfolioExecutionLifecycle values", () => {
    expect(Object.values(PortfolioExecutionLifecycle)).toEqual([
      "Initialized",
      "Active",
      "Completed",
      "Cancelled"
    ]);
    expect(Object.isFrozen(PortfolioExecutionLifecycle)).toBe(true);
    expect(JSON.stringify(PortfolioExecutionLifecycle.Completed)).toBe("\"Completed\"");
  });

  it("defines the exact PortfolioWorkItemLifecycle values", () => {
    expect(Object.values(PortfolioWorkItemLifecycle)).toEqual([
      "Pending",
      "Active",
      "Blocked",
      "ReadyForReview",
      "Completed",
      "Cancelled"
    ]);
    expect(Object.isFrozen(PortfolioWorkItemLifecycle)).toBe(true);
    expect(JSON.stringify(PortfolioWorkItemLifecycle.ReadyForReview)).toBe("\"ReadyForReview\"");
  });

  it("defines the exact ArtifactCandidateLifecycle values", () => {
    expect(Object.values(ArtifactCandidateLifecycle)).toEqual([
      "Registered",
      "Accepted",
      "Rejected"
    ]);
    expect(Object.isFrozen(ArtifactCandidateLifecycle)).toBe(true);
    expect(JSON.stringify(ArtifactCandidateLifecycle.Registered)).toBe("\"Registered\"");
  });

  it("supports exhaustive handling for each lifecycle concept", () => {
    const execution: PortfolioExecutionLifecycleValue = PortfolioExecutionLifecycle.Initialized;
    const workItem: PortfolioWorkItemLifecycleValue = PortfolioWorkItemLifecycle.Pending;
    const candidate: ArtifactCandidateLifecycleValue = ArtifactCandidateLifecycle.Registered;

    expect(describeExecutionLifecycle(execution)).toBe("execution initialized");
    expect(describeWorkItemLifecycle(workItem)).toBe("work item pending");
    expect(describeCandidateLifecycle(candidate)).toBe("candidate registered");
  });

  it("keeps lifecycle concepts distinct at compile time", () => {
    const workItem: PortfolioWorkItemLifecycleValue = PortfolioWorkItemLifecycle.Pending;
    const candidate: ArtifactCandidateLifecycleValue = ArtifactCandidateLifecycle.Registered;

    // @ts-expect-error Work item lifecycle is intentionally not assignable to execution lifecycle.
    const notExecution: PortfolioExecutionLifecycleValue = workItem;
    // @ts-expect-error Candidate lifecycle is intentionally not assignable to work item lifecycle.
    const notWorkItem: PortfolioWorkItemLifecycleValue = candidate;

    expect(notExecution).toBe("Pending");
    expect(notWorkItem).toBe("Registered");
  });

  it("does not expose transition behavior, state machines, UI metadata, or persistence metadata", () => {
    const vocabularies = [
      PortfolioExecutionLifecycle,
      PortfolioWorkItemLifecycle,
      ArtifactCandidateLifecycle
    ];

    for (const vocabulary of vocabularies) {
      expect(vocabulary).not.toHaveProperty("canTransitionTo");
      expect(vocabulary).not.toHaveProperty("transitionTo");
      expect(vocabulary).not.toHaveProperty("allowedTransitions");
      expect(vocabulary).not.toHaveProperty("nextStates");
      expect(vocabulary).not.toHaveProperty("labels");
      expect(vocabulary).not.toHaveProperty("colors");
      expect(vocabulary).not.toHaveProperty("icons");
      expect(vocabulary).not.toHaveProperty("databaseColumn");
      expect(vocabulary).not.toHaveProperty("schema");
    }
  });
});

function describeExecutionLifecycle(value: PortfolioExecutionLifecycleValue): string {
  switch (value) {
    case "Initialized":
      return "execution initialized";
    case "Active":
      return "execution active";
    case "Completed":
      return "execution completed";
    case "Cancelled":
      return "execution cancelled";
    default:
      return assertNever(value);
  }
}

function describeWorkItemLifecycle(value: PortfolioWorkItemLifecycleValue): string {
  switch (value) {
    case "Pending":
      return "work item pending";
    case "Active":
      return "work item active";
    case "Blocked":
      return "work item blocked";
    case "ReadyForReview":
      return "work item ready for review";
    case "Completed":
      return "work item completed";
    case "Cancelled":
      return "work item cancelled";
    default:
      return assertNever(value);
  }
}

function describeCandidateLifecycle(value: ArtifactCandidateLifecycleValue): string {
  switch (value) {
    case "Registered":
      return "candidate registered";
    case "Accepted":
      return "candidate accepted";
    case "Rejected":
      return "candidate rejected";
    default:
      return assertNever(value);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unhandled lifecycle value: ${String(value)}`);
}
