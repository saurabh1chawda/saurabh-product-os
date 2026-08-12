import { describe, expect, it } from "vitest";
import { Result } from "@career-companion/kernel";
import {
  ApprovalReference,
  ExecutionId,
  InvalidExecutionOperationError,
  PlanSnapshotReference,
  PortfolioExecution,
  PortfolioExecutionCommandContext,
  PortfolioExecutionCompletedFact,
  PortfolioExecutionLifecycle,
  PortfolioExecutionSummaryProjection,
  PortfolioPlanReference,
  PortfolioWorkspaceAuthorizationResourceReference,
  PortfolioWorkItem,
  PortfolioWorkItemLifecycle,
  WorkItemId
} from "@career-companion/portfolio-workspace";
import {
  CompleteExecutionApplicationService,
  CompleteExecutionInput,
  CompleteExecutionResult,
  LoadedPortfolioExecution,
  PortfolioExecutionNotFoundError,
  PortfolioExecutionRevision,
  PortfolioExecutionSaveResult,
  type PortfolioExecutionRepository
} from "../../src";

describe("CompleteExecutionApplicationService", () => {
  it("loads the aggregate, completes execution, saves it, and returns immutable domain outputs", async () => {
    const execution = createExecution();
    const repository = new RecordingPortfolioExecutionRepository(execution);
    const service = new CompleteExecutionApplicationService({ repository });
    const input = createInput();
    let completeInvoked = false;
    let capturedCommandContext: PortfolioExecutionCommandContext | undefined;
    const originalCompleteExecution = execution.completeExecution.bind(execution);
    execution.completeExecution = (suppliedCommandContext): PortfolioExecutionCompletedFact => {
      completeInvoked = true;
      capturedCommandContext = suppliedCommandContext;
      return originalCompleteExecution(suppliedCommandContext);
    };

    const result = await service.complete(input);

    expect(result.isSuccess).toBe(true);
    expect(repository.loadCount).toBe(1);
    expect(repository.saveCount).toBe(1);
    expect(repository.savedExecution).toBe(execution);
    expect(repository.savedRevision?.toJSON()).toBe(1);
    expect(completeInvoked).toBe(true);
    expect(capturedCommandContext?.equals(input.commandContext)).toBe(true);
    expect(execution.lifecycle).toBe(PortfolioExecutionLifecycle.Completed);

    const value = expectSuccess(result.value);
    expect(value).toBeInstanceOf(CompleteExecutionResult);
    expect(Object.isFrozen(value)).toBe(true);
    expect(value.fact).toBeInstanceOf(PortfolioExecutionCompletedFact);
    expect(value.fact).toBe(result.value?.fact);
    expect(value.fact.toJSON()).toMatchObject({
      type: "PortfolioExecutionCompleted",
      executionId: "execution-1",
      commandContext: input.commandContext.toJSON()
    });
    expect(value.correlationId).toBe(value.fact.commandContext.correlationId);
    expect(value.summary).toBeInstanceOf(PortfolioExecutionSummaryProjection);
    expect(value.summary.toJSON()).toMatchObject({
      executionId: "execution-1",
      lifecycle: PortfolioExecutionLifecycle.Completed,
      factTypes: ["PortfolioExecutionCompleted"],
      workItemsByLifecycle: {
        Pending: 0,
        Active: 0,
        Blocked: 0,
        ReadyForReview: 0,
        Completed: 1,
        Cancelled: 1
      }
    });
    expect(value.toJSON()).toEqual({
      summary: value.summary.toJSON(),
      fact: value.fact.toJSON(),
      correlationId: "correlation-1"
    });
    expect(value).not.toHaveProperty("execution");
    expect(value).not.toHaveProperty("aggregate");
    expect(value).not.toHaveProperty("workItems");
    expect(value).not.toHaveProperty("repository");
    expect(value).not.toHaveProperty("transaction");
  });

  it("propagates not-active execution rejection and does not save", async () => {
    const execution = createExecution({ lifecycle: PortfolioExecutionLifecycle.Initialized });
    await assertRejectedCompletionIsAtomic(execution);
  });

  it("propagates unresolved pending work-item rejection and does not save", async () => {
    const execution = createExecution({
      workItems: [createWorkItem("work-item-1", PortfolioWorkItemLifecycle.Pending)]
    });
    await assertRejectedCompletionIsAtomic(execution);
  });

  it("propagates unresolved active work-item rejection and does not save", async () => {
    const execution = createExecution({
      workItems: [createWorkItem("work-item-1", PortfolioWorkItemLifecycle.Active)]
    });
    await assertRejectedCompletionIsAtomic(execution);
  });

  it("propagates unresolved blocked work-item rejection and does not save", async () => {
    const execution = createExecution({
      workItems: [createWorkItem("work-item-1", PortfolioWorkItemLifecycle.Blocked)]
    });
    await assertRejectedCompletionIsAtomic(execution);
  });

  it("propagates unresolved ready-for-review work-item rejection and does not save", async () => {
    const execution = createExecution({
      workItems: [createWorkItem("work-item-1", PortfolioWorkItemLifecycle.ReadyForReview)]
    });
    await assertRejectedCompletionIsAtomic(execution);
  });

  it("propagates completed execution rejection and does not save", async () => {
    const execution = createExecution({ lifecycle: PortfolioExecutionLifecycle.Completed });
    await assertRejectedCompletionIsAtomic(execution);
  });

  it("propagates cancelled execution rejection and does not save", async () => {
    const execution = createExecution({ lifecycle: PortfolioExecutionLifecycle.Cancelled });
    await assertRejectedCompletionIsAtomic(execution);
  });

  it("returns an application not-found failure and does not save when the aggregate is missing", async () => {
    const repository = new RecordingPortfolioExecutionRepository(undefined);
    const service = new CompleteExecutionApplicationService({ repository });

    const result = await service.complete(createInput());

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(PortfolioExecutionNotFoundError);
    expect(repository.loadCount).toBe(1);
    expect(repository.saveCount).toBe(0);
  });

  it("keeps the input and result immutable, deterministic, and value-comparable", async () => {
    const input = createInput();
    const equivalentInput = createInput();
    const execution = createExecution();
    const fact = execution.completeExecution(commandContext());
    const result = new CompleteExecutionResult({
      summary: PortfolioExecutionSummaryProjection.fromExecution(execution, [fact]),
      fact,
      correlationId: "correlation-1"
    });
    const equivalentResult = new CompleteExecutionResult({
      summary: PortfolioExecutionSummaryProjection.fromExecution(execution, [fact]),
      fact,
      correlationId: "correlation-1"
    });

    expect(Object.isFrozen(input)).toBe(true);
    expect(input.equals(equivalentInput)).toBe(true);
    expect(input.toJSON()).toEqual({
      executionId: "execution-1",
      commandContext: {
        commandId: "command-1",
        correlationId: "correlation-1",
        actorReference: "actor:1",
        occurredAt: "2026-08-01T00:00:00.000Z"
      }
    });
    expect(Object.isFrozen(result)).toBe(true);
    expect(result.equals(equivalentResult)).toBe(true);
  });

  it("does not expose workflow, publishing, retry, policy, adapter, or completion helper behavior", async () => {
    const service = new CompleteExecutionApplicationService({
      repository: new RecordingPortfolioExecutionRepository(createExecution())
    });

    expect(service).not.toHaveProperty("publish");
    expect(service).not.toHaveProperty("retry");
    expect(service).not.toHaveProperty("evaluatePolicy");
    expect(service).not.toHaveProperty("beginTransaction");
    expect(service).not.toHaveProperty("handleHttp");
    expect(service).not.toHaveProperty("executeWorkflow");
    expect(service).not.toHaveProperty("canComplete");
    expect(service).not.toHaveProperty("workItems");
    expect(service).not.toHaveProperty("setLifecycle");
  });
});

class RecordingPortfolioExecutionRepository implements PortfolioExecutionRepository {
  loadCount = 0;
  saveCount = 0;
  savedExecution: PortfolioExecution | undefined;
  savedRevision: PortfolioExecutionRevision | undefined;

  constructor(private readonly execution: PortfolioExecution | undefined) {}

  async loadByExecutionId(executionId: ExecutionId): Promise<LoadedPortfolioExecution | undefined> {
    this.loadCount += 1;
    if (this.execution?.id.equals(executionId) === true) {
      return new LoadedPortfolioExecution({
        execution: this.execution,
        revision: new PortfolioExecutionRevision(1)
      });
    }

    return undefined;
  }

  async save(execution: PortfolioExecution, expectedRevision?: PortfolioExecutionRevision) {
    this.saveCount += 1;
    this.savedExecution = execution;
    this.savedRevision = expectedRevision;
    return Result.success(new PortfolioExecutionSaveResult({
      revision: new PortfolioExecutionRevision((expectedRevision?.value ?? 0) + 1)
    }));
  }
}

async function assertRejectedCompletionIsAtomic(execution: PortfolioExecution): Promise<void> {
  const before = execution.toJSON();
  const repository = new RecordingPortfolioExecutionRepository(execution);
  const service = new CompleteExecutionApplicationService({ repository });

  const result = await service.complete(createInput());

  expect(result.isFailure).toBe(true);
  expect(result.error).toBeInstanceOf(InvalidExecutionOperationError);
  expect(repository.loadCount).toBe(1);
  expect(repository.saveCount).toBe(0);
  expect(execution.toJSON()).toEqual(before);
}

function createInput(): CompleteExecutionInput {
  return new CompleteExecutionInput({
    executionId: new ExecutionId("execution-1"),
    commandContext: commandContext()
  });
}

function createExecution(
  overrides: Partial<ConstructorParameters<typeof PortfolioExecution>[0]> = {}
): PortfolioExecution {
  return new PortfolioExecution({
    id: new ExecutionId("execution-1"),
    portfolioPlanReference: new PortfolioPlanReference({
      planId: "portfolio-plan-1",
      roadmapId: "roadmap-1",
      planArtifactReference: "artifact:portfolio-plan-1"
    }),
    planSnapshotReference: new PlanSnapshotReference({
      snapshotReference: "snapshot:portfolio-plan-1:v1"
    }),
    approvalReference: new ApprovalReference({
      approvalReference: "approval:portfolio-plan-1"
    }),
    commandContext: commandContext(),
    lifecycle: PortfolioExecutionLifecycle.Active,
    workItems: [
      createWorkItem("work-item-1", PortfolioWorkItemLifecycle.Completed),
      createWorkItem("work-item-2", PortfolioWorkItemLifecycle.Cancelled)
    ],
    ...overrides,
    authorizationResourceReference: overrides.authorizationResourceReference ?? new PortfolioWorkspaceAuthorizationResourceReference({
      authorizationResourceReference: "portfolio-workspace:execution-owner-1"
    })
  });
}

function createWorkItem(
  id: string,
  lifecycle: ConstructorParameters<typeof PortfolioWorkItem>[0]["lifecycle"]
): PortfolioWorkItem {
  return new PortfolioWorkItem({
    id: new WorkItemId(id),
    lifecycle
  });
}

function commandContext(): PortfolioExecutionCommandContext {
  return new PortfolioExecutionCommandContext({
    commandId: "command-1",
    correlationId: "correlation-1",
    actorReference: "actor:1",
    occurredAt: "2026-08-01T00:00:00.000Z"
  });
}

function expectSuccess<T>(value: T | undefined): T {
  if (value === undefined) {
    throw new Error("Expected successful result value.");
  }

  return value;
}
