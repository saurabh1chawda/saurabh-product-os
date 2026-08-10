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
  PortfolioWorkItemActivatedFact,
  PortfolioWorkItemLifecycle,
  PortfolioWorkItemSummaryProjection,
  UnknownWorkItemError,
  WorkItemId
} from "@career-companion/portfolio-workspace";
import {
  ActivateWorkItemApplicationService,
  ActivateWorkItemInput,
  ActivateWorkItemResult,
  LoadedPortfolioExecution,
  PortfolioExecutionNotFoundError,
  PortfolioExecutionRevision,
  PortfolioExecutionSaveResult,
  type PortfolioExecutionRepository
} from "../../src";

describe("ActivateWorkItemApplicationService", () => {
  it("loads the aggregate, activates the work item, saves it, and returns immutable domain outputs", async () => {
    const execution = createExecution();
    const repository = new RecordingPortfolioExecutionRepository(execution);
    const service = new ActivateWorkItemApplicationService({ repository });
    const input = createInput();
    let capturedWorkItemId: WorkItemId | undefined;
    let capturedCommandContext: PortfolioExecutionCommandContext | undefined;
    const originalActivateWorkItem = execution.activateWorkItem.bind(execution);
    execution.activateWorkItem = (workItemId, suppliedCommandContext): PortfolioWorkItemActivatedFact => {
      capturedWorkItemId = workItemId;
      capturedCommandContext = suppliedCommandContext;
      return originalActivateWorkItem(workItemId, suppliedCommandContext);
    };

    const result = await service.activate(input);

    expect(result.isSuccess).toBe(true);
    expect(repository.loadCount).toBe(1);
    expect(repository.saveCount).toBe(1);
    expect(repository.savedExecution).toBe(execution);
    expect(repository.savedRevision?.toJSON()).toBe(1);
    expect(capturedWorkItemId?.equals(input.workItemId)).toBe(true);
    expect(capturedCommandContext?.equals(input.commandContext)).toBe(true);
    expect(execution.findWorkItem(new WorkItemId("work-item-1"))?.lifecycle).toBe(PortfolioWorkItemLifecycle.Active);

    const value = expectSuccess(result.value);
    expect(value).toBeInstanceOf(ActivateWorkItemResult);
    expect(Object.isFrozen(value)).toBe(true);
    expect(value.fact).toBeInstanceOf(PortfolioWorkItemActivatedFact);
    expect(value.fact).toBe(result.value?.fact);
    expect(value.fact.commandContext.equals(input.commandContext)).toBe(true);
    expect(value.fact.toJSON()).toMatchObject({
      type: "PortfolioWorkItemActivated",
      executionId: "execution-1",
      workItemId: "work-item-1",
      commandContext: input.commandContext.toJSON()
    });
    expect(value.summary).toBeInstanceOf(PortfolioExecutionSummaryProjection);
    expect(value.summary.toJSON()).toMatchObject({
      executionId: "execution-1",
      lifecycle: PortfolioExecutionLifecycle.Active,
      factTypes: ["PortfolioWorkItemActivated"],
      workItemsByLifecycle: {
        Pending: 0,
        Active: 1,
        Blocked: 0,
        ReadyForReview: 0,
        Completed: 0,
        Cancelled: 0
      }
    });
    expect(value.workItemSummary).toBeInstanceOf(PortfolioWorkItemSummaryProjection);
    expect(value.workItemSummary.toJSON()).toEqual({
      id: "work-item-1",
      lifecycle: PortfolioWorkItemLifecycle.Active
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
    const service = new ActivateWorkItemApplicationService({ repository });

    const result = await service.activate(new ActivateWorkItemInput({
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

  it("propagates non-pending work-item rejection and does not save", async () => {
    const execution = createExecution({
      workItems: [createWorkItem("work-item-1", PortfolioWorkItemLifecycle.Active)]
    });
    await assertRejectedActivationIsAtomic(execution);
  });

  it("propagates inactive execution rejection and does not save", async () => {
    const execution = createExecution({ lifecycle: PortfolioExecutionLifecycle.Initialized });
    await assertRejectedActivationIsAtomic(execution);
  });

  it("propagates completed execution rejection and does not save", async () => {
    const execution = createExecution({ lifecycle: PortfolioExecutionLifecycle.Completed });
    await assertRejectedActivationIsAtomic(execution);
  });

  it("propagates cancelled execution rejection and does not save", async () => {
    const execution = createExecution({ lifecycle: PortfolioExecutionLifecycle.Cancelled });
    await assertRejectedActivationIsAtomic(execution);
  });

  it("returns an application not-found failure and does not save when the aggregate is missing", async () => {
    const repository = new RecordingPortfolioExecutionRepository(undefined);
    const service = new ActivateWorkItemApplicationService({ repository });

    const result = await service.activate(createInput());

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(PortfolioExecutionNotFoundError);
    expect(repository.loadCount).toBe(1);
    expect(repository.saveCount).toBe(0);
  });

  it("keeps the input and result immutable, deterministic, and value-comparable", async () => {
    const input = createInput();
    const equivalentInput = createInput();
    const execution = createExecution();
    const fact = execution.activateWorkItem(new WorkItemId("work-item-1"), commandContext("1"));
    const workItem = execution.findWorkItem(new WorkItemId("work-item-1"));
    if (workItem === undefined) {
      throw new Error("Expected activated work item.");
    }
    const result = new ActivateWorkItemResult({
      summary: PortfolioExecutionSummaryProjection.fromExecution(execution, [fact]),
      workItemSummary: PortfolioWorkItemSummaryProjection.fromWorkItem(workItem),
      fact,
      correlationId: fact.commandContext.correlationId
    });
    const equivalentResult = new ActivateWorkItemResult({
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

  it("does not expose workflow, publishing, retry, policy, adapter, or activation helper behavior", async () => {
    const service = new ActivateWorkItemApplicationService({
      repository: new RecordingPortfolioExecutionRepository(createExecution())
    });

    expect(service).not.toHaveProperty("publish");
    expect(service).not.toHaveProperty("retry");
    expect(service).not.toHaveProperty("evaluatePolicy");
    expect(service).not.toHaveProperty("beginTransaction");
    expect(service).not.toHaveProperty("handleHttp");
    expect(service).not.toHaveProperty("executeWorkflow");
    expect(service).not.toHaveProperty("canActivate");
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

async function assertRejectedActivationIsAtomic(execution: PortfolioExecution): Promise<void> {
  const before = execution.toJSON();
  const repository = new RecordingPortfolioExecutionRepository(execution);
  const service = new ActivateWorkItemApplicationService({ repository });

  const result = await service.activate(createInput());

  expect(result.isFailure).toBe(true);
  expect(result.error).toBeInstanceOf(InvalidExecutionOperationError);
  expect(repository.loadCount).toBe(1);
  expect(repository.saveCount).toBe(0);
  expect(execution.toJSON()).toEqual(before);
}

function createInput(): ActivateWorkItemInput {
  return new ActivateWorkItemInput({
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
    workItems: [createWorkItem("work-item-1", PortfolioWorkItemLifecycle.Pending)],
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
