import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import packageJson from "../../package.json";
import * as publicApi from "../../src";

describe("portfolio workspace scaffold", () => {
  it("allows importing the package public entry point", () => {
    expect(publicApi).toBeDefined();
    expect(Object.keys(publicApi).sort()).toEqual([
      "AcceptedArtifact",
      "AcceptedArtifactId",
      "AcceptedArtifactSummaryProjection",
      "ApprovalReferenceMismatchError",
      "ApprovalReference",
      "ArtifactCandidateAcceptedFact",
      "ArtifactCandidate",
      "ArtifactCandidateLifecycle",
      "ArtifactCandidateRejectedFact",
      "ArtifactCandidateSummaryProjection",
      "CandidateAcceptancePolicy",
      "CandidateId",
      "DuplicateAcceptedArtifactError",
      "DuplicateCandidateError",
      "DuplicateWorkItemError",
      "ExecutionId",
      "ExecutionCompletionPolicy",
      "ExecutionConsistencyPolicy",
      "InvalidExecutionOperationError",
      "InvalidPlanSnapshotReferenceError",
      "InvalidPortfolioWorkspaceIdentifierError",
      "PlanSnapshotReference",
      "NoActionDecision",
      "PolicyDecision",
      "PolicyDecisionKind",
      "PortfolioExecution",
      "PortfolioExecutionCancelledFact",
      "PortfolioExecutionCommandContext",
      "PortfolioExecutionCompletedFact",
      "PortfolioExecutionInitializationResult",
      "PortfolioExecutionInitializedFact",
      "PortfolioExecutionLifecycle",
      "PortfolioExecutionStartedFact",
      "PortfolioExecutionSummaryProjection",
      "PortfolioPlanReference",
      "PortfolioWorkspaceDomainError",
      "PortfolioWorkItemActivatedFact",
      "PortfolioWorkItemCancelledFact",
      "PortfolioWorkItemCompletedFact",
      "PortfolioWorkItem",
      "PortfolioWorkItemLifecycle",
      "PortfolioWorkItemSummaryProjection",
      "RecommendationDecision",
      "UnknownAcceptedArtifactError",
      "UnknownCandidateError",
      "UnknownPortfolioPlanReferenceError",
      "UnknownWorkItemError",
      "WorkItemId"
    ].sort());
  });

  it("exposes only approved identifiers, references, context, and minimal validation error", () => {
    expect(Object.keys(publicApi).sort()).toEqual([
      "AcceptedArtifact",
      "AcceptedArtifactId",
      "AcceptedArtifactSummaryProjection",
      "ApprovalReferenceMismatchError",
      "ApprovalReference",
      "ArtifactCandidateAcceptedFact",
      "ArtifactCandidate",
      "ArtifactCandidateLifecycle",
      "ArtifactCandidateRejectedFact",
      "ArtifactCandidateSummaryProjection",
      "CandidateAcceptancePolicy",
      "CandidateId",
      "DuplicateAcceptedArtifactError",
      "DuplicateCandidateError",
      "DuplicateWorkItemError",
      "ExecutionId",
      "ExecutionCompletionPolicy",
      "ExecutionConsistencyPolicy",
      "InvalidExecutionOperationError",
      "InvalidPlanSnapshotReferenceError",
      "InvalidPortfolioWorkspaceIdentifierError",
      "PlanSnapshotReference",
      "NoActionDecision",
      "PolicyDecision",
      "PolicyDecisionKind",
      "PortfolioExecution",
      "PortfolioExecutionCancelledFact",
      "PortfolioExecutionCommandContext",
      "PortfolioExecutionCompletedFact",
      "PortfolioExecutionInitializationResult",
      "PortfolioExecutionInitializedFact",
      "PortfolioExecutionLifecycle",
      "PortfolioExecutionStartedFact",
      "PortfolioExecutionSummaryProjection",
      "PortfolioPlanReference",
      "PortfolioWorkspaceDomainError",
      "PortfolioWorkItemActivatedFact",
      "PortfolioWorkItemCancelledFact",
      "PortfolioWorkItemCompletedFact",
      "PortfolioWorkItem",
      "PortfolioWorkItemLifecycle",
      "PortfolioWorkItemSummaryProjection",
      "RecommendationDecision",
      "UnknownAcceptedArtifactError",
      "UnknownCandidateError",
      "UnknownPortfolioPlanReferenceError",
      "UnknownWorkItemError",
      "WorkItemId"
    ].sort());
    expect(publicApi).not.toHaveProperty("ExecutionInitializationKey");
    expect(publicApi).not.toHaveProperty("CompletionSignalSnapshot");
    expect(publicApi).not.toHaveProperty("AcceptedArtifactLifecycle");
    expect(publicApi).not.toHaveProperty("PortfolioExecutionOutcome");
    expect(publicApi).not.toHaveProperty("PortfolioExecutionError");
    expect(publicApi).not.toHaveProperty("ExecutionAlreadyCompletedError");
    expect(publicApi).not.toHaveProperty("ExecutionOutcomeError");
    expect(publicApi).not.toHaveProperty("InvalidTransitionError");
    expect(publicApi).not.toHaveProperty("CannotTransitionError");
    expect(publicApi).not.toHaveProperty("CannotCompleteExecutionError");
    expect(publicApi).not.toHaveProperty("allowedTransitions");
    expect(publicApi).not.toHaveProperty("canTransitionTo");
    expect(publicApi).not.toHaveProperty("ArtifactCandidateRegisteredFact");
    expect(publicApi).not.toHaveProperty("PortfolioWorkItemBlockedFact");
    expect(publicApi).not.toHaveProperty("PortfolioWorkItemUnblockedFact");
    expect(publicApi).not.toHaveProperty("PortfolioExecutionProgress");
    expect(publicApi).not.toHaveProperty("ProjectionRepository");
    expect(publicApi).not.toHaveProperty("ProjectionCache");
    expect(publicApi).not.toHaveProperty("ProjectionRefresher");
    expect(publicApi).not.toHaveProperty("QueryService");
    expect(publicApi).not.toHaveProperty("ReadRepository");
    expect(publicApi).not.toHaveProperty("EventBus");
    expect(publicApi).not.toHaveProperty("PortfolioExecutionEvent");
    expect(publicApi).not.toHaveProperty("PortfolioExecutionPolicy");
    expect(publicApi).not.toHaveProperty("PolicyEngine");
    expect(publicApi).not.toHaveProperty("PolicyRegistry");
    expect(publicApi).not.toHaveProperty("PortfolioExecutionRepository");
  });

  it("does not introduce runtime dependencies at the scaffold stage", () => {
    expect(packageJson).not.toHaveProperty("dependencies");
  });

  it("does not expose internal paths through package exports", () => {
    expect(Object.keys(packageJson.exports)).toEqual(["."]);
  });

  it("documents the scaffold architecture contract", () => {
    const readme = readFileSync(join(packageRoot(), "README.md"), "utf8");

    expect(readme).toContain("## Purpose");
    expect(readme).toContain("## Architectural Position");
    expect(readme).toContain("## Aggregate Boundary");
    expect(readme).toContain("## Planning Boundary");
    expect(readme).toContain("## Human Approval Boundary");
    expect(readme).toContain("## AI Boundary");
    expect(readme).toContain("## Dependency Rules");
    expect(readme).toContain("## Pilot Scope");
    expect(readme).toContain("## Planned Internal Structure");
    expect(readme).toContain("## Current Implementation Status");
    expect(readme).toContain("## Deferred Scope");
  });

  it("keeps the package free of forbidden scaffold dependencies and technology claims", () => {
    const serializedPackage = JSON.stringify(packageJson).toLowerCase();
    const readme = readFileSync(join(packageRoot(), "README.md"), "utf8").toLowerCase();
    const combined = `${serializedPackage}\n${readme}`;

    expect(serializedPackage).not.toContain("@career-companion/portfolio-planner");
    expect(serializedPackage).not.toContain("@career-companion/kernel");
    expect(serializedPackage).not.toContain("@career-companion/persistence");
    expect(serializedPackage).not.toContain("@career-companion/repositories");
    expect(serializedPackage).not.toContain("react");
    expect(serializedPackage).not.toContain("next");
    expect(serializedPackage).not.toContain("openai");
    expect(combined).not.toContain("portfolioexecution is implemented");
    expect(combined).not.toContain("workflow engine dependency");
    expect(combined).not.toContain("browser automation dependency");
  });
});

function packageRoot(): string {
  const packageLocal = process.cwd();
  if (packageLocal.endsWith("portfolio-workspace")) return packageLocal;
  return join(process.cwd(), "packages", "portfolio-workspace");
}
