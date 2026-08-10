import { describe, expect, it } from "vitest";
import { Result } from "@career-companion/kernel";
import {
  ApprovalReference,
  ExecutionId,
  InvalidExecutionOperationError,
  PlanSnapshotReference,
  PortfolioExecution,
  PortfolioExecutionCommandContext,
  PortfolioExecutionLifecycle,
  PortfolioExecutionSummaryProjection,
  PortfolioPlanReference,
  PortfolioWorkItem,
  PortfolioWorkItemCancelledFact,
  PortfolioWorkItemLifecycle,
  PortfolioWorkItemSummaryProjection,
  UnknownWorkItemError,
  WorkItemId
} from "@career-companion/portfolio-workspace";
import {
  CancelWorkItemApplicationService,
  CancelWorkItemInput,
  CancelWorkItemResult,
  LoadedPortfolioExecution,
  PortfolioExecutionNotFoundError,
  PortfolioExecutionRevision,
  PortfolioExecutionSaveResult,
  type PortfolioExecutionRepository
} from "../../src";

describe("CancelWorkItemApplicationService", () => {
  it("loads the aggregate, cancels the work item, saves it, and returns immutable domain outputs", async () => {
    const execution = createExecution();
    const repository = new RecordingPortfolioExecutionRepository(execution);
    const service = new CancelWorkItemApplicationService({ repository });
    const input = createInput();
    let capturedWorkItemId: WorkItemId | undefined;
    let capturedCommandContext: PortfolioExecutionCommandContext | undefined;
    const originalCancelWorkItem = execution.cancelWorkItem.bind(execution);
    execution.cancelWorkItem = (workItemId, suppliedCommandContext): PortfolioWorkItemCancelledFact => {
      capturedWorkItemId = workItemId;
      capturedCommandContext = suppliedCommandContext;
      return originalCancelWorkItem(workItemId, suppliedCommandContext);
    };

    const result = await service.cancel(input);

    expect(result.isSuccess).toBe(true);
    expect(repository.loadCount).toBe(1);
    expect(repository.saveCount).toBe(1);
    expect(repository.savedExecution).toBe(execution);
    expect(repository.savedRevision?.toJSON()).toBe(1);
    expect(capturedWorkItemId?.equals(input.workItemId)).toBe(true);
    expect(capturedCommandContext?.equals(input.commandContext)).toBe(true);
    expect(execution.findWorkItem(new WorkItemId("work-item-1"))?.lifecycle).toBe(PortfolioWorkItemLifecycle.Cancelled);

    const value = expectSuccess(result.value);
    expect(value).toBeInstanceOf(CancelWorkItemResult);
    expect(Object.isFrozen(value)).toBe(true);
    expect(value.fact).toBeInstanceOf(PortfolioWorkItemCancelledFact);
    expect(value.fact).toBe(result.value?.fact);
    expect(value.fact.commandContext.equals(input.commandContext)).toBe(true);
    expect(value.fact.toJSON()).toMatchObject({
      type: "PortfolioWorkItemCancelled",
      executionId: "execution-1",
      workItemId: "work-item-1",
      commandContext: input.commandContext.toJSON()
    });
    expect(value.summary).toBeInstanceOf(PortfolioExecutionSummaryProjection);
    expect(value.summary.toJSON()).toMatchObject({
      executionId: "execution-1",
      lifecycle: PortfolioExecutionLifecycle.Active,
      factTypes: ["PortfolioWorkItemCancelled"],
      workItemsByLifecycle: {
        Pending: 0,
        Active: 0,
        Blocked: 0,
        ReadyForReview: 0,
        Completed: 0,
        Cancelled: 1
      }
    });
    expect(value.workItemSummary).toBeInstanceOf(PortfolioWorkItemSummaryProjection);
    expect(value.workItemSummary.toJSON()).toEqual({
      id: "work-item-1",
      lifecycle: PortfolioWorkItemLifecycle.Cancelled
    });
    expect(value.correlationId).toBe(value.fact.commandContext.correlationId);
    expect(value.toJSON()).toEqual({
      summary: value.summary.toJSON(),
      workItemSummary: value.workItemSummary.toJSON(),
      fact: value.fact.toJSON(),
      correlationId: "correlation-1"
    });
    expect(value).not.toHaveProperty("execution");
    expect(value).not.toHaveProperty("aggregate");
    expect(value).not.toHaveProperty("workItem");
    expect(value).not.toHaveProperty("repository");
    expect(value).not.toHaveProperty("transaction");
  });

  it("propagates unknown work-item rejection and does not save", async () => {
    const execution = createExecution();
    const before = execution.toJSON();
    const repository = new RecordingPortfolioExecutionRepository(execution);
    const service = new CancelWorkItemApplicationService({ repository });

    const result = await service.cancel(new CancelWorkItemInput({
      executionId: new ExecutionId("execution-1"),
      workItemId: new WorkItemId("missing-work-item"),
      commandContext: commandContext("missing")
    }));

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnknownWorkItemError);
    expect(repository.loadCount).toBe(1);
    expect(repository.saveCount).toBe(0);
    expect(execution.toJSON()).toEqual(before);
  });

  it("propagates completed work-item rejection and does not save", async () => {
    const execution = createExecution({
      workItems: [createWorkItem("work-item-1", PortfolioWorkItemLifecycle.Completed)]
    });
    await assertRejectedCancellationIsAtomic(execution);
  });

  it("propagates already cancelled work-item rejection and does not save", async () => {
    const execution = createExecution({
      workItems: [createWorkItem("work-item-1", PortfolioWorkItemLifecycle.Cancelled)]
    });
    await assertRejectedCancellationIsAtomic(execution);
  });

  it("propagates inactive execution rejection and does not save", async () => {
    const execution = createExecution({ lifecycle: PortfolioExecutionLifecycle.Initialized });
    await assertRejectedCancellationIsAtomic(execution);
  });

  it("propagates completed execution rejection and does not save", async () => {
    const execution = createExecution({ lifecycle: PortfolioExecutionLifecycle.Completed });
    await assertRejectedCancellationIsAtomic(execution);
  });

  it("propagates cancelled execution rejection and does not save", async () => {
    const execution = createExecution({ lifecycle: PortfolioExecutionLifecycle.Cancelled });
    await assertRejectedCancellationIsAtomic(execution);
  });

  it("returns an application not-found failure and does not save when the aggregate is missing", async () => {
    const repository = new RecordingPortfolioExecutionRepository(undefined);
    const service = new CancelWorkItemApplicationService({ repository });

    const result = await service.cancel(createInput());

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(PortfolioExecutionNotFoundError);
    expect(repository.loadCount).toBe(1);
    expect(repository.saveCount).toBe(0);
  });

  it("keeps the input and result immutable, deterministic, and value-comparable", async () => {
    const input = createInput();
    const equivalentInput = createInput();
    const execution = createExecution();
    const fact = execution.cancelWorkItem(new WorkItemId("work-item-1"), commandContext("1"));
    const workItem = execution.findWorkItem(new WorkItemId("work-item-1"));
    if (workItem === undefined) {
      throw new Error("Expected cancelled work item.");
    }
    const result = new CancelWorkItemResult({
      summary: PortfolioExecutionSummaryProjection.fromExecution(execution, [fact]),
      workItemSummary: PortfolioWorkItemSummaryProjection.fromWorkItem(workItem),
      fact,
      correlationId: fact.commandContext.correlationId
    });
    const equivalentResult = new CancelWorkItemResult({
      summary: PortfolioExecutionSummaryProjection.fromExecution(execution, [fact]),
      workItemSummary: PortfolioWorkItemSummaryProjection.fromWorkItem(workItem),
      fact,
      correlationId: fact.commandContext.correlationId
    });

    expect(Object.isFrozen(input)).toBe(true);
    expect(input.equals(equivalentInput)).toBe(true);
    expect(input.toJSON()).toEqual({
      executionId: "execution-1",
      workItemId: "work-item-1",
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

  it("does not expose workflow, publishing, retry, policy, adapter, or cancellation helper behavior", async () => {
    const service = new CancelWorkItemApplicationService({
      repository: new RecordingPortfolioExecutionRepository(createExecution())
    });

    expect(service).not.toHaveProperty("publish");
    expect(service).not.toHaveProperty("retry");
    expect(service).not.toHaveProperty("evaluatePolicy");
    expect(service).not.toHaveProperty("beginTransaction");
    expect(service).not.toHaveProperty("handleHttp");
    expect(service).not.toHaveProperty("executeWorkflow");
    expect(service).not.toHaveProperty("canCancel");
    expect(service).not.toHaveProperty("lifecycle");
    expect(service).not.toHaveProperty("replaceWorkItem");
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

async function assertRejectedCancellationIsAtomic(execution: PortfolioExecution): Promise<void> {
  const before = execution.toJSON();
  const repository = new RecordingPortfolioExecutionRepository(execution);
  const service = new CancelWorkItemApplicationService({ repository });

  const result = await service.cancel(createInput());

  expect(result.isFailure).toBe(true);
  expect(result.error).toBeInstanceOf(InvalidExecutionOperationError);
  expect(repository.loadCount).toBe(1);
  expect(repository.saveCount).toBe(0);
  expect(execution.toJSON()).toEqual(before);
}

function createInput(): CancelWorkItemInput {
  return new CancelWorkItemInput({
    executionId: new ExecutionId("execution-1"),
    workItemId: new WorkItemId("work-item-1"),
    commandContext: commandContext("1")
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
    commandContext: commandContext("initialization"),
    lifecycle: PortfolioExecutionLifecycle.Active,
    workItems: [createWorkItem("work-item-1", PortfolioWorkItemLifecycle.Active)],
    ...overrides
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

function commandContext(suffix: string): PortfolioExecutionCommandContext {
  return new PortfolioExecutionCommandContext({
    commandId: `command-${suffix}`,
    correlationId: `correlation-${suffix}`,
    actorReference: `actor:${suffix}`,
    occurredAt: "2026-08-01T00:00:00.000Z"
  });
}

function expectSuccess<T>(value: T | undefined): T {
  if (value === undefined) {
    throw new Error("Expected successful result value.");
  }

  return value;
}
