import { describe, expect, it } from "vitest";
import {
  ApprovalReferenceMismatchError,
  DuplicateAcceptedArtifactError,
  DuplicateCandidateError,
  DuplicateWorkItemError,
  InvalidExecutionOperationError,
  InvalidPlanSnapshotReferenceError,
  InvalidPortfolioWorkspaceIdentifierError,
  PortfolioWorkspaceDomainError,
  UnknownAcceptedArtifactError,
  UnknownCandidateError,
  UnknownPortfolioPlanReferenceError,
  UnknownWorkItemError
} from "../../src";

const domainErrorConstructors = [
  {
    ErrorConstructor: DuplicateWorkItemError,
    code: "PORTFOLIO_WORKSPACE_DUPLICATE_WORK_ITEM",
    name: "DuplicateWorkItemError"
  },
  {
    ErrorConstructor: UnknownWorkItemError,
    code: "PORTFOLIO_WORKSPACE_UNKNOWN_WORK_ITEM",
    name: "UnknownWorkItemError"
  },
  {
    ErrorConstructor: DuplicateCandidateError,
    code: "PORTFOLIO_WORKSPACE_DUPLICATE_CANDIDATE",
    name: "DuplicateCandidateError"
  },
  {
    ErrorConstructor: UnknownCandidateError,
    code: "PORTFOLIO_WORKSPACE_UNKNOWN_CANDIDATE",
    name: "UnknownCandidateError"
  },
  {
    ErrorConstructor: DuplicateAcceptedArtifactError,
    code: "PORTFOLIO_WORKSPACE_DUPLICATE_ACCEPTED_ARTIFACT",
    name: "DuplicateAcceptedArtifactError"
  },
  {
    ErrorConstructor: UnknownAcceptedArtifactError,
    code: "PORTFOLIO_WORKSPACE_UNKNOWN_ACCEPTED_ARTIFACT",
    name: "UnknownAcceptedArtifactError"
  },
  {
    ErrorConstructor: InvalidExecutionOperationError,
    code: "PORTFOLIO_WORKSPACE_INVALID_EXECUTION_OPERATION",
    name: "InvalidExecutionOperationError"
  },
  {
    ErrorConstructor: UnknownPortfolioPlanReferenceError,
    code: "PORTFOLIO_WORKSPACE_UNKNOWN_PORTFOLIO_PLAN_REFERENCE",
    name: "UnknownPortfolioPlanReferenceError"
  },
  {
    ErrorConstructor: InvalidPlanSnapshotReferenceError,
    code: "PORTFOLIO_WORKSPACE_INVALID_PLAN_SNAPSHOT_REFERENCE",
    name: "InvalidPlanSnapshotReferenceError"
  },
  {
    ErrorConstructor: ApprovalReferenceMismatchError,
    code: "PORTFOLIO_WORKSPACE_APPROVAL_REFERENCE_MISMATCH",
    name: "ApprovalReferenceMismatchError"
  }
] as const;

describe("portfolio workspace domain error catalog", () => {
  it("defines immutable domain errors with stable names and codes", () => {
    for (const { ErrorConstructor, code, name } of domainErrorConstructors) {
      const error = new ErrorConstructor();

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(PortfolioWorkspaceDomainError);
      expect(error.name).toBe(name);
      expect(error.code).toBe(code);
      expect(error.message.length).toBeGreaterThan(0);
      expect(Object.isFrozen(error)).toBe(true);
    }
  });

  it("keeps each domain error concept distinct", () => {
    const names = domainErrorConstructors.map(({ ErrorConstructor }) => new ErrorConstructor().name);
    const codes = domainErrorConstructors.map(({ ErrorConstructor }) => new ErrorConstructor().code);

    expect(new Set(names).size).toBe(names.length);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("keeps identifier validation errors outside the domain error hierarchy", () => {
    const validationError = new InvalidPortfolioWorkspaceIdentifierError("ExecutionId");

    expect(validationError).toBeInstanceOf(Error);
    expect(validationError).not.toBeInstanceOf(PortfolioWorkspaceDomainError);
    expect(validationError.name).toBe("InvalidPortfolioWorkspaceIdentifierError");
  });

  it("does not expose infrastructure, transition, outcome, retry, or UI concerns", () => {
    for (const { ErrorConstructor } of domainErrorConstructors) {
      const error = new ErrorConstructor() as PortfolioWorkspaceDomainError & Record<string, unknown>;
      const serialized = JSON.stringify({
        code: error.code,
        message: error.message,
        name: error.name
      }).toLowerCase();

      expect(error).not.toHaveProperty("statusCode");
      expect(error).not.toHaveProperty("httpStatus");
      expect(error).not.toHaveProperty("retryable");
      expect(error).not.toHaveProperty("localizedMessage");
      expect(error).not.toHaveProperty("databaseCode");
      expect(serialized).not.toContain("transition");
      expect(serialized).not.toContain("outcome");
      expect(serialized).not.toContain("complete execution");
    }
  });
});
