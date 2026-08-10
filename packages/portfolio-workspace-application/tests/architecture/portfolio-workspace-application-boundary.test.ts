import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import packageJson from "../../package.json";
import * as publicApi from "../../src";

describe("portfolio workspace application boundary", () => {
  it("exposes only the approved Portfolio Workspace application API", () => {
    expect(Object.keys(publicApi).sort()).toEqual([
      "AcceptCandidateApplicationService",
      "AcceptCandidateInput",
      "AcceptCandidateResult",
      "ActivateWorkItemApplicationService",
      "ActivateWorkItemInput",
      "ActivateWorkItemResult",
      "BeginExecutionApplicationService",
      "BeginExecutionInput",
      "BeginExecutionResult",
      "CancelExecutionApplicationService",
      "CancelExecutionInput",
      "CancelExecutionResult",
      "CancelWorkItemApplicationService",
      "CancelWorkItemInput",
      "CancelWorkItemResult",
      "CompleteExecutionApplicationService",
      "CompleteExecutionInput",
      "CompleteExecutionResult",
      "CompleteWorkItemApplicationService",
      "CompleteWorkItemInput",
      "CompleteWorkItemResult",
      "GetPortfolioExecutionApplicationService",
      "GetPortfolioExecutionInput",
      "GetPortfolioExecutionResult",
      "InitializeArtifactCandidateDefinition",
      "InitializePortfolioExecutionApplicationService",
      "InitializePortfolioExecutionInput",
      "InitializePortfolioExecutionResult",
      "InitializePortfolioWorkItemDefinition",
      "LoadedPortfolioExecution",
      "PortfolioExecutionAlreadyExistsError",
      "PortfolioExecutionConcurrencyConflictError",
      "PortfolioExecutionNotFoundError",
      "PortfolioExecutionPersistenceMappingError",
      "PortfolioExecutionPersistenceUnavailableError",
      "PortfolioExecutionRepositoryError",
      "PortfolioExecutionRevision",
      "PortfolioExecutionSaveResult",
      "RejectCandidateApplicationService",
      "RejectCandidateInput",
      "RejectCandidateResult",
      "UnsupportedPortfolioExecutionRecordVersionError"
    ].sort());

    expect(publicApi).not.toHaveProperty("PortfolioExecution");
    expect(publicApi).not.toHaveProperty("PortfolioWorkItem");
    expect(publicApi).not.toHaveProperty("ArtifactCandidate");
    expect(publicApi).not.toHaveProperty("AcceptedArtifact");
    expect(publicApi).not.toHaveProperty("RepositoryAdapter");
    expect(publicApi).not.toHaveProperty("TransactionManager");
    expect(publicApi).not.toHaveProperty("WorkflowEngine");
    expect(publicApi).not.toHaveProperty("Controller");
  });

  it("depends only on the domain package and standard foundation package", () => {
    expect(Object.keys(packageJson.dependencies ?? {}).sort()).toEqual([
      "@career-companion/kernel",
      "@career-companion/portfolio-workspace"
    ]);
    expect(packageJson.dependencies).not.toHaveProperty("@career-companion/persistence");
    expect(packageJson.dependencies).not.toHaveProperty("@career-companion/repositories");
    expect(packageJson.dependencies).not.toHaveProperty("@career-companion/infrastructure");
    expect(packageJson.dependencies).not.toHaveProperty("react");
    expect(packageJson.dependencies).not.toHaveProperty("next");
    expect(packageJson.dependencies).not.toHaveProperty("openai");
  });

  it("does not expose internal paths through package exports", () => {
    expect(Object.keys(packageJson.exports)).toEqual([".", "./testing"]);
    expect(packageJson.exports["./testing"]).toEqual({
      types: "./testing/index.ts",
      default: "./testing/index.ts"
    });
  });

  it("keeps source free of infrastructure, UI, AI, messaging, and workflow imports", () => {
    const source = [
      readFileSync(join(packageRoot(), "src", "inputs", "BeginExecutionInput.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "inputs", "ActivateWorkItemInput.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "inputs", "CompleteWorkItemInput.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "inputs", "CompleteExecutionInput.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "inputs", "CancelExecutionInput.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "inputs", "CancelWorkItemInput.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "inputs", "AcceptCandidateInput.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "inputs", "RejectCandidateInput.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "inputs", "InitializePortfolioExecutionInput.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "inputs", "GetPortfolioExecutionInput.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "results", "BeginExecutionResult.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "results", "ActivateWorkItemResult.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "results", "CompleteWorkItemResult.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "results", "CompleteExecutionResult.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "results", "CancelExecutionResult.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "results", "CancelWorkItemResult.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "results", "AcceptCandidateResult.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "results", "RejectCandidateResult.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "results", "InitializePortfolioExecutionResult.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "results", "GetPortfolioExecutionResult.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "ports", "PortfolioExecutionRepository.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "errors", "PortfolioExecutionNotFoundError.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "errors", "PortfolioExecutionRepositoryErrors.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "persistence", "LoadedPortfolioExecution.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "persistence", "PortfolioExecutionRevision.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "persistence", "PortfolioExecutionSaveResult.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "services", "BeginExecutionApplicationService.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "services", "ActivateWorkItemApplicationService.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "services", "CompleteWorkItemApplicationService.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "services", "CompleteExecutionApplicationService.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "services", "CancelExecutionApplicationService.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "services", "CancelWorkItemApplicationService.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "services", "AcceptCandidateApplicationService.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "services", "RejectCandidateApplicationService.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "services", "InitializePortfolioExecutionApplicationService.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "services", "GetPortfolioExecutionApplicationService.ts"), "utf8")
    ].join("\n").toLowerCase();

    expect(source).not.toContain("@career-companion/persistence");
    expect(source).not.toContain("@career-companion/repositories");
    expect(source).not.toContain("@career-companion/infrastructure");
    expect(source).not.toContain("typeorm");
    expect(source).not.toContain("prisma");
    expect(source).not.toContain("drizzle");
    expect(source).not.toContain("postgres");
    expect(source).not.toContain("express");
    expect(source).not.toContain("next/");
    expect(source).not.toContain("react");
    expect(source).not.toContain("openai");
    expect(source).not.toContain("eventbus");
    expect(source).not.toContain("workflowengine");
    expect(source).not.toContain("commandbus");
    expect(source).not.toContain("commandhandler");
    expect(source).not.toContain("commandenvelope");
    expect(source).not.toContain("session");
    expect(source).not.toContain("httprequest");
    expect(source).not.toContain("recordacceptedartifact");
    expect(source).not.toContain("new acceptedartifact(");
    expect(source).not.toContain("new artifactcandidateacceptedfact(");
    expect(onlyInitializationServiceContains("new artifactcandidate(")).toBe(true);
    expect(source).not.toContain("new artifactcandidaterejectedfact(");
    expect(source).not.toContain("new portfolioexecutioncompletedfact(");
    expect(source).not.toContain("new portfolioexecutioncancelledfact(");
    expect(source).not.toContain("cancelexecutionrepository");
    expect(source).not.toContain("executionlifecyclerepository");
    expect(source).not.toContain("portfolioworkitemrepository");
    expect(source).not.toContain("workitemlifecyclerepository");
    expect(source).not.toContain("workitemcancellationrepository");
    expect(onlyInitializationServiceContains("new portfolioworkitem(")).toBe(true);
    expect(source).not.toContain("new portfolioworkitemactivatedfact(");
    expect(source).not.toContain("new portfolioworkitemcancelledfact(");
    expect(source).not.toContain(".workitems(");
    expect(source).not.toContain("canactivate");
    expect(source).not.toContain("cancomplete");
    expect(source).not.toContain("cancancel");
    expect(source).not.toContain("setlifecycle");
    expect(source).not.toContain("sqlstate");
    expect(source).not.toContain("connectionstring");
    expect(source).not.toContain("syncportfolioexecutionrepository");
    expect(source).not.toContain("asyncportfolioexecutionrepository");
    expect(source).not.toContain("repositorymode");
    expect(source).not.toContain("scheduler");
    expect(source).not.toContain("planningrepository");
    expect(source).not.toContain("approvalrepository");
    expect(source).not.toContain("initializeworkflow");
    expect(source).not.toContain("idempotency");
    expect(readFileSync(join(packageRoot(), "src", "services", "InitializePortfolioExecutionApplicationService.ts"), "utf8").toLowerCase()).not.toContain(".beginexecution(");
  });

  it("defines PortfolioExecutionRepository as the single asynchronous repository port", () => {
    const portSource = readFileSync(join(packageRoot(), "src", "ports", "PortfolioExecutionRepository.ts"), "utf8").toLowerCase();
    const source = [
      portSource,
      readFileSync(join(packageRoot(), "src", "services", "BeginExecutionApplicationService.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "services", "ActivateWorkItemApplicationService.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "services", "CompleteWorkItemApplicationService.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "services", "CompleteExecutionApplicationService.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "services", "CancelExecutionApplicationService.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "services", "CancelWorkItemApplicationService.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "services", "AcceptCandidateApplicationService.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "services", "RejectCandidateApplicationService.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "services", "InitializePortfolioExecutionApplicationService.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "services", "GetPortfolioExecutionApplicationService.ts"), "utf8")
    ].join("\n").toLowerCase();

    expect(portSource).toContain("promise<loadedportfolioexecution | undefined>");
    expect(portSource).toContain("promise<result<portfolioexecutionsaveresult");
    expect(source).toContain("await this.repository.loadbyexecutionid");
    expect(source).toContain("await this.repository.save");
    expect(source).not.toContain("syncportfolioexecutionrepository");
    expect(source).not.toContain("asyncportfolioexecutionrepository");
    expect(source).not.toContain("repositoryframework");
  });

  it("documents the application architecture contract", () => {
    const readme = readFileSync(join(packageRoot(), "README.md"), "utf8");

    expect(readme).toContain("## Purpose");
    expect(readme).toContain("## Architectural Position");
    expect(readme).toContain("## Inputs");
    expect(readme).toContain("## Outputs");
    expect(readme).toContain("## Application Responsibilities");
    expect(readme).toContain("## Domain Boundary");
    expect(readme).toContain("## Repository Port Boundary");
    expect(readme).toContain("## Transaction Boundary");
    expect(readme).toContain("## Does Not Own");
    expect(readme).toContain("## Current Implementation Status");
    expect(readme).toContain("## Deferred Scope");
    expect(readme).toContain("Aggregates never leave the Application Layer");
    expect(readme).toContain("No repository implementation is provided");
    expect(readme).toContain("Repository operations are asynchronous");
    expect(readme).toContain("saves the aggregate with an expected revision");
  });
});

function packageRoot(): string {
  const packageLocal = process.cwd();
  if (packageLocal.endsWith("portfolio-workspace-application")) return packageLocal;
  return join(process.cwd(), "packages", "portfolio-workspace-application");
}

function onlyInitializationServiceContains(pattern: string): boolean {
  const serviceNames = [
    "BeginExecutionApplicationService.ts",
    "ActivateWorkItemApplicationService.ts",
    "CompleteWorkItemApplicationService.ts",
    "CompleteExecutionApplicationService.ts",
    "CancelExecutionApplicationService.ts",
    "CancelWorkItemApplicationService.ts",
    "AcceptCandidateApplicationService.ts",
    "RejectCandidateApplicationService.ts",
    "InitializePortfolioExecutionApplicationService.ts",
    "GetPortfolioExecutionApplicationService.ts"
  ];

  const matches = serviceNames.filter((serviceName) => readFileSync(
    join(packageRoot(), "src", "services", serviceName),
    "utf8"
  ).toLowerCase().includes(pattern));

  return matches.length === 1 && matches[0] === "InitializePortfolioExecutionApplicationService.ts";
}
