import { describe, expect, it } from "vitest";
import {
  AcceptedArtifactId,
  CandidateId,
  ExecutionId,
  InvalidPortfolioWorkspaceIdentifierError,
  WorkItemId
} from "../../src";

describe("portfolio workspace identifiers", () => {
  it("creates an ExecutionId from a nonempty stable string", () => {
    assertIdentifierContract(ExecutionId, "ExecutionId", "execution-1", "execution-2");
  });

  it("creates a WorkItemId from a nonempty stable string", () => {
    assertIdentifierContract(WorkItemId, "WorkItemId", "work-item-1", "work-item-2");
  });

  it("creates a CandidateId from a nonempty stable string", () => {
    assertIdentifierContract(CandidateId, "CandidateId", "candidate-1", "candidate-2");
  });

  it("creates an AcceptedArtifactId from a nonempty stable string", () => {
    assertIdentifierContract(AcceptedArtifactId, "AcceptedArtifactId", "accepted-artifact-1", "accepted-artifact-2");
  });

  it("preserves surrounding whitespace for otherwise nonempty values", () => {
    const id = new ExecutionId(" execution-1 ");

    expect(id.value).toBe(" execution-1 ");
    expect(id.toString()).toBe(" execution-1 ");
    expect(id.toJSON()).toBe(" execution-1 ");
  });

  it("prevents accidental cross-identifier substitution at compile time", () => {
    function acceptsWorkItemId(id: WorkItemId): string {
      return id.value;
    }

    expect(acceptsWorkItemId(new WorkItemId("work-item-1"))).toBe("work-item-1");

    // @ts-expect-error CandidateId is intentionally not assignable to WorkItemId.
    const notAWorkItemId: WorkItemId = new CandidateId("candidate-1");
    expect(notAWorkItemId.value).toBe("candidate-1");
  });

  it("does not embed generation or aggregate uniqueness policy", () => {
    const first = new CandidateId("candidate-1");
    const second = new CandidateId("candidate-1");

    expect(first.equals(second)).toBe(true);
    expect(typeof (CandidateId as unknown as { generate?: unknown }).generate).toBe("undefined");
    expect(typeof (CandidateId as unknown as { random?: unknown }).random).toBe("undefined");
    expect(typeof (CandidateId as unknown as { uuid?: unknown }).uuid).toBe("undefined");
  });
});

type IdentifierConstructor<TIdentifier> = new (value: string) => TIdentifier;

interface ScalarIdentifier {
  readonly value: string;
  equals(other: never): boolean;
  toString(): string;
  toJSON(): string;
}

function assertIdentifierContract<TIdentifier extends ScalarIdentifier>(
  Identifier: IdentifierConstructor<TIdentifier>,
  name: string,
  value: string,
  otherValue: string
): void {
  const id = new Identifier(value);
  const same = new Identifier(value);
  const different = new Identifier(otherValue);

  expect(id.value).toBe(value);
  expect(Object.isFrozen(id)).toBe(true);
  expect(id.toString()).toBe(value);
  expect(id.toJSON()).toBe(value);
  expect(JSON.stringify({ id })).toBe(JSON.stringify({ id: value }));
  expect(id.equals(same as never)).toBe(true);
  expect(id.equals(different as never)).toBe(false);
  expect(id.equals(undefined as never)).toBe(false);

  expect(() => new Identifier("")).toThrow(InvalidPortfolioWorkspaceIdentifierError);
  expect(() => new Identifier("")).toThrow(`${name} cannot be empty.`);
  expect(() => new Identifier("   ")).toThrow(InvalidPortfolioWorkspaceIdentifierError);
  expect(() => new Identifier("\t\n")).toThrow(`${name} cannot be empty.`);
}
