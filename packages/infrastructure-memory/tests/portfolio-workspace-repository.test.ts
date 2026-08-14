import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ApprovalReference,
  ExecutionId,
  PlanSnapshotReference,
  PortfolioExecution,
  PortfolioExecutionCommandContext,
  PortfolioExecutionLifecycle,
  PortfolioExecutionSummaryProjection,
  PortfolioPlanReference,
  PortfolioWorkspaceAuthorizationResourceReference,
  PortfolioWorkItem,
  PortfolioWorkItemLifecycle,
  WorkItemId
} from "@career-companion/portfolio-workspace";
import { definePortfolioExecutionRepositoryContract } from "@career-companion/portfolio-workspace-application/testing";
import { LoadedPortfolioExecution, PortfolioExecutionRevision } from "../../portfolio-workspace-application/src";
import applicationPackageJson from "../../portfolio-workspace-application/package.json";
import domainPackageJson from "../../portfolio-workspace/package.json";
import packageJson from "../package.json";
import { InMemoryPortfolioExecutionRepository } from "../src";

const domainManifest = domainPackageJson as { readonly dependencies?: Readonly<Record<string, string>> };

definePortfolioExecutionRepositoryContract("InMemoryPortfolioExecutionRepository", {
  createRepository: () => new InMemoryPortfolioExecutionRepository()
});

describe("InMemoryPortfolioExecutionRepository reference isolation", () => {
  it("stores an independent representation when saving an aggregate", async () => {
    const execution = createExecution();
    const repository = new InMemoryPortfolioExecutionRepository();

    expect((await repository.save(execution)).isSuccess).toBe(true);
    execution.beginExecution(commandContext("begin-after-save"));

    const loaded = expectLoaded(await repository.loadByExecutionId(execution.id)).execution;

    expect(loaded).not.toBe(execution);
    expect(loaded.lifecycle).toBe(PortfolioExecutionLifecycle.Initialized);
    expect(loaded.workItems()[0]?.lifecycle).toBe(PortfolioWorkItemLifecycle.Pending);
  });

  it("does not persist mutations to a loaded aggregate until save is called", async () => {
    const execution = createExecution({ lifecycle: PortfolioExecutionLifecycle.Active });
    const repository = new InMemoryPortfolioExecutionRepository([execution]);
    const loaded = expectLoaded(await repository.loadByExecutionId(execution.id));

    loaded.execution.activateWorkItem(new WorkItemId("work-item:one"), commandContext("activate-loaded"));

    const reloadedBeforeSave = expectLoaded(await repository.loadByExecutionId(execution.id));
    expect(reloadedBeforeSave.execution.workItems()[0]?.lifecycle).toBe(PortfolioWorkItemLifecycle.Pending);

    expect((await repository.save(loaded.execution, loaded.revision)).isSuccess).toBe(true);
    const reloadedAfterSave = expectLoaded(await repository.loadByExecutionId(execution.id));
    expect(reloadedAfterSave.execution.workItems()[0]?.lifecycle).toBe(PortfolioWorkItemLifecycle.Active);
    expect(reloadedAfterSave.revision.toJSON()).toBe(2);
  });

  it("returns independently mutable aggregate and entity instances for repeated loads", async () => {
    const execution = createExecution();
    const repository = new InMemoryPortfolioExecutionRepository([execution]);

    const firstLoad = expectLoaded(await repository.loadByExecutionId(execution.id));
    const secondLoad = expectLoaded(await repository.loadByExecutionId(execution.id));

    expect(firstLoad).not.toBe(secondLoad);
    expect(firstLoad.execution.toJSON()).toEqual(secondLoad.execution.toJSON());
    expect(firstLoad.revision.equals(secondLoad.revision)).toBe(true);
    expect(firstLoad.execution.workItems()[0]).not.toBe(secondLoad.execution.workItems()[0]);
    expect(firstLoad.execution.workItems()[0]).not.toBe(execution.workItems()[0]);

    firstLoad.execution.beginExecution(commandContext("begin-first-load"));

    expect(firstLoad.execution.lifecycle).toBe(PortfolioExecutionLifecycle.Active);
    expect(secondLoad.execution.lifecycle).toBe(PortfolioExecutionLifecycle.Initialized);
    expect(expectLoaded(await repository.loadByExecutionId(execution.id)).execution.lifecycle).toBe(PortfolioExecutionLifecycle.Initialized);
  });

  it("replaces stored state deterministically on repeated save of the same aggregate identity", async () => {
    const execution = createExecution();
    const repository = new InMemoryPortfolioExecutionRepository();

    const createResult = await repository.save(execution);
    expect(createResult.isSuccess).toBe(true);
    expect(expectLoaded(await repository.loadByExecutionId(execution.id)).execution.lifecycle).toBe(PortfolioExecutionLifecycle.Initialized);

    execution.beginExecution(commandContext("begin-replacement"));
    expect((await repository.save(execution, createResult.value?.revision)).isSuccess).toBe(true);

    expect(expectLoaded(await repository.loadByExecutionId(execution.id)).execution.toJSON()).toEqual(execution.toJSON());
    expect(expectLoaded(await repository.loadByExecutionId(execution.id)).execution.lifecycle).toBe(PortfolioExecutionLifecycle.Active);
  });

  it("keeps multiple aggregate identities isolated", async () => {
    const first = createExecution({ id: "execution:one" });
    const second = createExecution({ id: "execution:two" });
    const repository = new InMemoryPortfolioExecutionRepository([first, second]);

    const firstLoaded = expectLoaded(await repository.loadByExecutionId(first.id));
    first.beginExecution(commandContext("begin-one"));
    expect((await repository.save(first, firstLoaded.revision)).isSuccess).toBe(true);

    expect(expectLoaded(await repository.loadByExecutionId(first.id)).execution.lifecycle).toBe(PortfolioExecutionLifecycle.Active);
    expect(expectLoaded(await repository.loadByExecutionId(second.id)).execution.lifecycle).toBe(PortfolioExecutionLifecycle.Initialized);
    await expect(repository.loadByExecutionId(new ExecutionId("execution:missing"))).resolves.toBeUndefined();
  });
});

describe("InMemoryPortfolioExecutionRepository boundaries", () => {
  it("exports only the concrete Portfolio Workspace adapter from its module", async () => {
    expect(InMemoryPortfolioExecutionRepository).toBeTypeOf("function");
    expect(packageJson.exports).toEqual({
      ".": {
        types: "./src/index.ts",
        default: "./src/index.ts"
      }
    });
  });

  it("does not expose facts, projections, policies, transaction APIs, or infrastructure state from the adapter", async () => {
    const repository = new InMemoryPortfolioExecutionRepository([createExecution()]);
    const loaded = expectLoaded(await repository.loadByExecutionId(new ExecutionId("execution:one"))).execution;
    const summary = PortfolioExecutionSummaryProjection.fromExecution(loaded);

    expect(summary.factTypes).toEqual([]);
    expect(repository).not.toHaveProperty("beginTransaction");
    expect(repository).not.toHaveProperty("commit");
    expect(repository).not.toHaveProperty("rollback");
    expect(repository).not.toHaveProperty("publish");
    expect(repository).not.toHaveProperty("eventBus");
    expect(repository).not.toHaveProperty("outbox");
    expect(repository).not.toHaveProperty("policy");
    expect(repository).not.toHaveProperty("projection");
    expect(repository).not.toHaveProperty("database");
    expect(repository).not.toHaveProperty("orm");
  });

  it("simulates optimistic concurrency deterministically without durable storage", async () => {
    const repository = new InMemoryPortfolioExecutionRepository([createExecution()]);
    const first = expectLoaded(await repository.loadByExecutionId(new ExecutionId("execution:one")));
    const second = expectLoaded(await repository.loadByExecutionId(new ExecutionId("execution:one")));

    first.execution.beginExecution(commandContext("first-concurrency"));
    const firstSave = await repository.save(first.execution, first.revision);
    expect(firstSave.isSuccess).toBe(true);
    expect(firstSave.value?.revision.equals(new PortfolioExecutionRevision(2))).toBe(true);

    second.execution.beginExecution(commandContext("second-concurrency"));
    const secondSave = await repository.save(second.execution, second.revision);
    expect(secondSave.isFailure).toBe(true);

    const reloaded = expectLoaded(await repository.loadByExecutionId(new ExecutionId("execution:one")));
    expect(reloaded.revision.toJSON()).toBe(2);
    expect(reloaded.execution.toJSON()).toEqual(first.execution.toJSON());
  });

  it("satisfies the asynchronous repository port without delayed or background behavior", async () => {
    const repository = new InMemoryPortfolioExecutionRepository([createExecution()]);
    const loadPromise = repository.loadByExecutionId(new ExecutionId("execution:one"));
    const savePromise = repository.save(createExecution({ id: "execution:async" }));

    expect(loadPromise).toBeInstanceOf(Promise);
    expect(savePromise).toBeInstanceOf(Promise);
    expect(expectLoaded(await loadPromise).execution.id.toJSON()).toBe("execution:one");
    expect((await savePromise).isSuccess).toBe(true);
    expect(repository).not.toHaveProperty("timer");
    expect(repository).not.toHaveProperty("queue");
    expect(repository).not.toHaveProperty("worker");
    expect(repository).not.toHaveProperty("scheduler");
  });

  it("keeps dependency direction inward and does not add external infrastructure dependencies", async () => {
    expect(packageJson.dependencies).toMatchObject({
      "@career-companion/portfolio-workspace": "workspace:*",
      "@career-companion/portfolio-workspace-application": "workspace:*"
    });
    expect(applicationPackageJson.dependencies).not.toHaveProperty("@career-companion/infrastructure-memory");
    expect(domainManifest.dependencies ?? {}).not.toHaveProperty("@career-companion/infrastructure-memory");

    expect(packageJson.dependencies).not.toHaveProperty("typeorm");
    expect(packageJson.dependencies).not.toHaveProperty("prisma");
    expect(packageJson.dependencies).not.toHaveProperty("sequelize");
    expect(packageJson.dependencies).not.toHaveProperty("sqlite3");
    expect(packageJson.dependencies).not.toHaveProperty("pg");
    expect(packageJson.dependencies).not.toHaveProperty("express");
    expect(packageJson.dependencies).not.toHaveProperty("react");
    expect(packageJson.dependencies).not.toHaveProperty("openai");
  });

  it("keeps the Portfolio Workspace adapter source free of forbidden implementation concepts", async () => {
    const source = readFileSync(
      join(packageRoot(), "src", "portfolio-workspace", "InMemoryPortfolioExecutionRepository.ts"),
      "utf8"
    ).toLowerCase();

    expect(source).not.toContain("beginexecution(");
    expect(source).not.toContain("activateworkitem(");
    expect(source).not.toContain("completeworkitem(");
    expect(source).not.toContain("cancelworkitem(");
    expect(source).not.toContain("acceptcandidate(");
    expect(source).not.toContain("rejectcandidate(");
    expect(source).not.toContain("completeexecution(");
    expect(source).not.toContain("cancelexecution(");
    expect(source).not.toContain("portfolioexecutionsummaryprojection");
    expect(source).not.toContain("policy");
    expect(source).not.toContain("eventbus");
    expect(source).not.toContain("outbox");
    expect(source).not.toContain("messagebroker");
    expect(source).not.toContain("transaction");
    expect(source).not.toContain("unitofwork");
    expect(source).not.toContain("typeorm");
    expect(source).not.toContain("prisma");
    expect(source).not.toContain("sql");
    expect(source).not.toContain("http");
    expect(source).not.toContain("react");
    expect(source).not.toContain("openai");
    expect(source).not.toContain("workflow");
  });
});

function createExecution(overrides: {
  readonly id?: string;
  readonly lifecycle?: ConstructorParameters<typeof PortfolioExecution>[0]["lifecycle"];
} = {}): PortfolioExecution {
  const id = overrides.id ?? "execution:one";

  return new PortfolioExecution({
    id: new ExecutionId(id),
    portfolioPlanReference: new PortfolioPlanReference({
      planId: `plan:${id}`,
      roadmapId: `roadmap:${id}`,
      planArtifactReference: `artifact:plan:${id}`
    }),
    planSnapshotReference: new PlanSnapshotReference({
      snapshotReference: `snapshot:plan:${id}:v1`
    }),
    approvalReference: new ApprovalReference({
      approvalReference: `approval:plan:${id}`
    }),
    authorizationResourceReference: new PortfolioWorkspaceAuthorizationResourceReference({
      authorizationResourceReference: "portfolio-workspace:execution-owner-1"
    }),
    commandContext: commandContext(`initialization:${id}`),
    lifecycle: overrides.lifecycle ?? PortfolioExecutionLifecycle.Initialized,
    workItems: [
      new PortfolioWorkItem({
        id: new WorkItemId("work-item:one"),
        lifecycle: PortfolioWorkItemLifecycle.Pending
      })
    ]
  });
}

function commandContext(suffix: string): PortfolioExecutionCommandContext {
  return new PortfolioExecutionCommandContext({
    commandId: `command:${suffix}`,
    correlationId: `correlation:${suffix}`,
    actorReference: `actor:${suffix}`,
    occurredAt: "2026-08-01T00:00:00.000Z"
  });
}

function expectLoaded(loaded: LoadedPortfolioExecution | undefined): LoadedPortfolioExecution {
  if (loaded === undefined) {
    throw new Error("Expected repository to load PortfolioExecution.");
  }

  return loaded;
}

function packageRoot(): string {
  const packageLocal = process.cwd();
  if (packageLocal.endsWith("infrastructure-memory")) return packageLocal;
  return join(process.cwd(), "packages", "infrastructure-memory");
}
