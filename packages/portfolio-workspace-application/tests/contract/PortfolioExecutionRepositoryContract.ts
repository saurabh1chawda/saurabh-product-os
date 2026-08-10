import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  AcceptedArtifact,
  AcceptedArtifactId,
  ApprovalReference,
  ArtifactCandidate,
  ArtifactCandidateLifecycle,
  CandidateId,
  ExecutionId,
  PlanSnapshotReference,
  PortfolioExecution,
  PortfolioExecutionCommandContext,
  PortfolioExecutionLifecycle,
  PortfolioExecutionSummaryProjection,
  PortfolioPlanReference,
  PortfolioWorkItem,
  PortfolioWorkItemLifecycle,
  WorkItemId
} from "@career-companion/portfolio-workspace";
import {
  LoadedPortfolioExecution,
  PortfolioExecutionAlreadyExistsError,
  PortfolioExecutionConcurrencyConflictError,
  PortfolioExecutionRevision,
  PortfolioExecutionSaveResult,
  type PortfolioExecutionRepository
} from "../../src";

export interface PortfolioExecutionRepositoryContractOptions {
  readonly createRepository: () => PortfolioExecutionRepository | Promise<PortfolioExecutionRepository>;
  readonly reset?: () => void | Promise<void>;
  readonly dispose?: () => void | Promise<void>;
}

export function definePortfolioExecutionRepositoryContract(
  implementationName: string,
  options: PortfolioExecutionRepositoryContractOptions
): void {
  describe(`${implementationName} PortfolioExecutionRepository contract`, () => {
    beforeEach(async () => {
      await options.reset?.();
    });

    afterAll(async () => {
      await options.dispose?.();
    });

    it("returns undefined when an aggregate is absent", async () => {
      const repository = await options.createRepository();

      await expect(repository.loadByExecutionId(new ExecutionId("execution:missing"))).resolves.toBeUndefined();
    });

    it("rehydrates the exact saved aggregate state", async () => {
      const repository = await options.createRepository();
      const execution = createRichExecution();

      const saveResult = await repository.save(execution);
      expect(saveResult.isSuccess).toBe(true);
      expect(saveResult.value).toBeInstanceOf(PortfolioExecutionSaveResult);
      expect(saveResult.value?.revision.toJSON()).toBe(1);

      const loaded = expectLoaded(await repository.loadByExecutionId(execution.id));
      const loadedExecution = loaded.execution;

      expect(loaded).toBeInstanceOf(LoadedPortfolioExecution);
      expect(loaded.revision.toJSON()).toBe(1);
      expect(loadedExecution).toBeInstanceOf(PortfolioExecution);
      expect(loadedExecution.toJSON()).toEqual(execution.toJSON());
      expect(loadedExecution.id.equals(execution.id)).toBe(true);
      expect(loadedExecution.portfolioPlanReference.equals(execution.portfolioPlanReference)).toBe(true);
      expect(loadedExecution.planSnapshotReference.equals(execution.planSnapshotReference)).toBe(true);
      expect(loadedExecution.approvalReference.equals(execution.approvalReference)).toBe(true);
      expect(loadedExecution.commandContext.equals(execution.commandContext)).toBe(true);
      expect(loadedExecution.lifecycle).toBe(PortfolioExecutionLifecycle.Active);
      expect(loadedExecution.workItems().map((workItem) => workItem.toJSON())).toEqual(execution.workItems().map((workItem) => workItem.toJSON()));
      expect(loadedExecution.candidates().map((candidate) => candidate.toJSON())).toEqual(execution.candidates().map((candidate) => candidate.toJSON()));
      expect(loadedExecution.acceptedArtifacts().map((artifact) => artifact.toJSON())).toEqual(execution.acceptedArtifacts().map((artifact) => artifact.toJSON()));
    });

    it("preserves aggregate identity and returns the saved aggregate for its ExecutionId only", async () => {
      const repository = await options.createRepository();
      const first = createExecution("execution:first");
      const second = createExecution("execution:second");

      expect((await repository.save(first)).isSuccess).toBe(true);
      expect((await repository.save(second)).isSuccess).toBe(true);

      expect(expectLoaded(await repository.loadByExecutionId(first.id)).execution.toJSON()).toEqual(first.toJSON());
      expect(expectLoaded(await repository.loadByExecutionId(second.id)).execution.toJSON()).toEqual(second.toJSON());
      await expect(repository.loadByExecutionId(new ExecutionId("execution:third"))).resolves.toBeUndefined();
    });

    it("persists exactly the supplied aggregate state and does not mutate it while saving", async () => {
      const repository = await options.createRepository();
      const execution = createExecution("execution:state");
      const beforeSave = execution.toJSON();

      const createResult = await repository.save(execution);
      expect(createResult.isSuccess).toBe(true);

      expect(execution.toJSON()).toEqual(beforeSave);
      expect(expectLoaded(await repository.loadByExecutionId(execution.id)).execution.toJSON()).toEqual(beforeSave);

      execution.beginExecution(commandContext("begin"));
      const afterDomainDecision = execution.toJSON();
      const updateResult = await repository.save(execution, expectSuccess(createResult.value).revision);
      expect(updateResult.isSuccess).toBe(true);

      expect(execution.toJSON()).toEqual(afterDomainDecision);
      expect(expectLoaded(await repository.loadByExecutionId(execution.id)).execution.toJSON()).toEqual(afterDomainDecision);
    });

    it("preserves identifiers, references, command context, lifecycles, and collection ordering", async () => {
      const repository = await options.createRepository();
      const execution = createRichExecution();

      expect((await repository.save(execution)).isSuccess).toBe(true);
      const loaded = expectLoaded(await repository.loadByExecutionId(new ExecutionId("execution:rich"))).execution;

      expect(loaded.toJSON()).toEqual({
        id: "execution:rich",
        portfolioPlanReference: {
          planId: "plan:rich",
          roadmapId: "roadmap:rich",
          planArtifactReference: "artifact:plan:rich"
        },
        planSnapshotReference: {
          snapshotReference: "snapshot:plan:rich:v1"
        },
        approvalReference: {
          approvalReference: "approval:plan:rich"
        },
        commandContext: commandContext("initialization-rich").toJSON(),
        lifecycle: PortfolioExecutionLifecycle.Active,
        workItems: [
          { id: "work-item:pending", lifecycle: PortfolioWorkItemLifecycle.Pending },
          { id: "work-item:active", lifecycle: PortfolioWorkItemLifecycle.Active },
          { id: "work-item:blocked", lifecycle: PortfolioWorkItemLifecycle.Blocked },
          { id: "work-item:ready", lifecycle: PortfolioWorkItemLifecycle.ReadyForReview },
          { id: "work-item:completed", lifecycle: PortfolioWorkItemLifecycle.Completed },
          { id: "work-item:cancelled", lifecycle: PortfolioWorkItemLifecycle.Cancelled }
        ],
        candidates: [
          { id: "candidate:registered", lifecycle: ArtifactCandidateLifecycle.Registered },
          { id: "candidate:accepted", lifecycle: ArtifactCandidateLifecycle.Accepted },
          { id: "candidate:rejected", lifecycle: ArtifactCandidateLifecycle.Rejected }
        ],
        acceptedArtifacts: [
          { id: "accepted-artifact:one" },
          { id: "accepted-artifact:two" }
        ]
      });
    });

    it("restores state without replaying business decisions or producing facts", async () => {
      const repository = await options.createRepository();
      const execution = createRichExecution();

      expect((await repository.save(execution)).isSuccess).toBe(true);

      const loaded = expectLoaded(await repository.loadByExecutionId(execution.id)).execution;
      const summary = PortfolioExecutionSummaryProjection.fromExecution(loaded);

      expect(loaded.toJSON()).toEqual(execution.toJSON());
      expect(summary.factTypes).toEqual([]);
      expect(loaded).not.toHaveProperty("pendingFacts");
      expect(loaded).not.toHaveProperty("recordedFacts");
      expect(loaded).not.toHaveProperty("events");
      expect(loaded).not.toHaveProperty("outbox");
    });

    it("returns aggregates only and never stores projections, policies, transactions, or infrastructure state", async () => {
      const repository = await options.createRepository();
      const execution = createExecution("execution:boundary");

      expect((await repository.save(execution)).isSuccess).toBe(true);

      const loaded = expectLoaded(await repository.loadByExecutionId(execution.id)).execution;

      expect(loaded).toBeInstanceOf(PortfolioExecution);
      expect(loaded).not.toBeInstanceOf(PortfolioExecutionSummaryProjection);
      expect(loaded).not.toHaveProperty("summary");
      expect(loaded).not.toHaveProperty("projection");
      expect(loaded).not.toHaveProperty("policy");
      expect(loaded).not.toHaveProperty("transaction");
      expect(loaded).not.toHaveProperty("unitOfWork");
      expect(loaded).not.toHaveProperty("eventBus");
      expect(loaded).not.toHaveProperty("messageBroker");
      expect(loaded).not.toHaveProperty("database");
      expect(loaded).not.toHaveProperty("orm");
    });

    it("creates new aggregates with revision one and keeps revision outside domain serialization", async () => {
      const repository = await options.createRepository();
      const execution = createExecution("execution:create");

      const saveResult = await repository.save(execution);

      expect(saveResult.isSuccess).toBe(true);
      expect(saveResult.value?.toJSON()).toEqual({ revision: 1 });

      const loaded = expectLoaded(await repository.loadByExecutionId(execution.id));
      expect(loaded.revision.equals(new PortfolioExecutionRevision(1))).toBe(true);
      expect(loaded.execution.toJSON()).toEqual(execution.toJSON());
      expect(loaded.execution.toJSON()).not.toHaveProperty("revision");
      expect(loaded).not.toHaveProperty("record");
      expect(loaded).not.toHaveProperty("row");
      expect(loaded).not.toHaveProperty("sql");
    });

    it("rejects duplicate creation without overwriting the stored aggregate", async () => {
      const repository = await options.createRepository();
      const first = createExecution("execution:duplicate");
      const second = createExecution("execution:duplicate");
      second.beginExecution(commandContext("duplicate-overwrite-attempt"));

      expect((await repository.save(first)).isSuccess).toBe(true);
      const duplicateResult = await repository.save(second);

      expect(duplicateResult.isFailure).toBe(true);
      expect(duplicateResult.error).toBeInstanceOf(PortfolioExecutionAlreadyExistsError);
      expect(expectLoaded(await repository.loadByExecutionId(first.id)).execution.toJSON()).toEqual(first.toJSON());
    });

    it("updates only when the expected revision matches and advances the revision once", async () => {
      const repository = await options.createRepository();
      const execution = createExecution("execution:update");
      const createResult = await repository.save(execution);
      const createdRevision = expectSuccess(createResult.value).revision;
      const loaded = expectLoaded(await repository.loadByExecutionId(execution.id));

      loaded.execution.beginExecution(commandContext("update"));
      const updateResult = await repository.save(loaded.execution, loaded.revision);

      expect(createdRevision.toJSON()).toBe(1);
      expect(updateResult.isSuccess).toBe(true);
      expect(updateResult.value?.revision.toJSON()).toBe(2);

      const reloaded = expectLoaded(await repository.loadByExecutionId(execution.id));
      expect(reloaded.revision.toJSON()).toBe(2);
      expect(reloaded.execution.lifecycle).toBe(PortfolioExecutionLifecycle.Active);
    });

    it("rejects stale saves and preserves the first successful update", async () => {
      const repository = await options.createRepository();
      const execution = createExecution("execution:stale");
      expect((await repository.save(execution)).isSuccess).toBe(true);
      const firstLoad = expectLoaded(await repository.loadByExecutionId(execution.id));
      const secondLoad = expectLoaded(await repository.loadByExecutionId(execution.id));

      firstLoad.execution.beginExecution(commandContext("first-update"));
      const firstSave = await repository.save(firstLoad.execution, firstLoad.revision);
      expect(firstSave.isSuccess).toBe(true);

      secondLoad.execution.beginExecution(commandContext("stale-update"));
      const staleSave = await repository.save(secondLoad.execution, secondLoad.revision);

      expect(staleSave.isFailure).toBe(true);
      expect(staleSave.error).toBeInstanceOf(PortfolioExecutionConcurrencyConflictError);

      const reloaded = expectLoaded(await repository.loadByExecutionId(execution.id));
      expect(reloaded.revision.toJSON()).toBe(2);
      expect(reloaded.execution.lifecycle).toBe(PortfolioExecutionLifecycle.Active);
      expect(reloaded.execution.commandContext.toJSON()).toEqual(execution.commandContext.toJSON());
    });
  });
}

function createRichExecution(): PortfolioExecution {
  return new PortfolioExecution({
    id: new ExecutionId("execution:rich"),
    portfolioPlanReference: new PortfolioPlanReference({
      planId: "plan:rich",
      roadmapId: "roadmap:rich",
      planArtifactReference: "artifact:plan:rich"
    }),
    planSnapshotReference: new PlanSnapshotReference({
      snapshotReference: "snapshot:plan:rich:v1"
    }),
    approvalReference: new ApprovalReference({
      approvalReference: "approval:plan:rich"
    }),
    commandContext: commandContext("initialization-rich"),
    lifecycle: PortfolioExecutionLifecycle.Active,
    workItems: [
      workItem("work-item:pending", PortfolioWorkItemLifecycle.Pending),
      workItem("work-item:active", PortfolioWorkItemLifecycle.Active),
      workItem("work-item:blocked", PortfolioWorkItemLifecycle.Blocked),
      workItem("work-item:ready", PortfolioWorkItemLifecycle.ReadyForReview),
      workItem("work-item:completed", PortfolioWorkItemLifecycle.Completed),
      workItem("work-item:cancelled", PortfolioWorkItemLifecycle.Cancelled)
    ],
    candidates: [
      candidate("candidate:registered", ArtifactCandidateLifecycle.Registered),
      candidate("candidate:accepted", ArtifactCandidateLifecycle.Accepted),
      candidate("candidate:rejected", ArtifactCandidateLifecycle.Rejected)
    ],
    acceptedArtifacts: [
      acceptedArtifact("accepted-artifact:one"),
      acceptedArtifact("accepted-artifact:two")
    ]
  });
}

function createExecution(id: string): PortfolioExecution {
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
    commandContext: commandContext(`initialization:${id}`),
    lifecycle: PortfolioExecutionLifecycle.Initialized
  });
}

function workItem(
  id: string,
  lifecycle: ConstructorParameters<typeof PortfolioWorkItem>[0]["lifecycle"]
): PortfolioWorkItem {
  return new PortfolioWorkItem({
    id: new WorkItemId(id),
    lifecycle
  });
}

function candidate(
  id: string,
  lifecycle: ConstructorParameters<typeof ArtifactCandidate>[0]["lifecycle"]
): ArtifactCandidate {
  return new ArtifactCandidate({
    id: new CandidateId(id),
    lifecycle
  });
}

function acceptedArtifact(id: string): AcceptedArtifact {
  return new AcceptedArtifact({
    id: new AcceptedArtifactId(id)
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

function expectSuccess<T>(value: T | undefined): T {
  if (value === undefined) {
    throw new Error("Expected successful result value.");
  }

  return value;
}
