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
  PortfolioPlanReference,
  PortfolioWorkspaceAuthorizationResourceReference,
  PortfolioWorkItem,
  PortfolioWorkItemCompletedFact,
  PortfolioWorkItemLifecycle,
  PortfolioExecutionSummaryProjection,
  UnknownWorkItemError,
  WorkItemId
} from "@career-companion/portfolio-workspace";
import {
  CompleteWorkItemApplicationService,
  CompleteWorkItemInput,
  CompleteWorkItemResult,
  LoadedPortfolioExecution,
  PortfolioExecutionNotFoundError,
  PortfolioExecutionRevision,
  PortfolioExecutionSaveResult,
  type PortfolioExecutionRepository
} from "../../src";

describe("CompleteWorkItemApplicationService", () => {
  it("loads the aggregate, invokes completeWorkItem, saves it, and returns immutable domain outputs", async () => {
    const execution = createExecution();
    const repository = new RecordingPortfolioExecutionRepository(execution);
    const service = new CompleteWorkItemApplicationService({ repository });
    const input = createInput();
    let capturedWorkItemId: WorkItemId | undefined;
    let capturedCommandContext: PortfolioExecutionCommandContext | undefined;
    const originalCompleteWorkItem = execution.completeWorkItem.bind(execution);
    execution.completeWorkItem = (workItemId, suppliedCommandContext): PortfolioWorkItemCompletedFact => {
      capturedWorkItemId = workItemId;
      capturedCommandContext = suppliedCommandContext;
      return originalCompleteWorkItem(workItemId, suppliedCommandContext);
    };

    const result = await service.complete(input);

    expect(result.isSuccess).toBe(true);
    expect(repository.loadCount).toBe(1);
    expect(repository.saveCount).toBe(1);
    expect(repository.savedExecution).toBe(execution);
    expect(repository.savedRevision?.toJSON()).toBe(1);
    expect(capturedWorkItemId?.equals(input.workItemId)).toBe(true);
    expect(capturedCommandContext?.equals(input.commandContext)).toBe(true);
    expect(execution.findWorkItem(new WorkItemId("work-item-1"))?.lifecycle).toBe(PortfolioWorkItemLifecycle.Completed);

    const value = expectSuccess(result.value);
    expect(value).toBeInstanceOf(CompleteWorkItemResult);
    expect(Object.isFrozen(value)).toBe(true);
    expect(value.fact).toBeInstanceOf(PortfolioWorkItemCompletedFact);
    expect(value.fact.commandContext.equals(input.commandContext)).toBe(true);
    expect(value.correlationId).toBe(value.fact.commandContext.correlationId);
    expect(value.summary).toBeInstanceOf(PortfolioExecutionSummaryProjection);
    expect(value.summary.toJSON()).toMatchObject({
      executionId: "execution-1",
      lifecycle: PortfolioExecutionLifecycle.Active,
      factTypes: ["PortfolioWorkItemCompleted"],
      workItemsByLifecycle: {
        Pending: 0,
        Active: 0,
        Blocked: 0,
        ReadyForReview: 0,
        Completed: 1,
        Cancelled: 0
      }
    });
    expect(value.toJSON()).toEqual({
      summary: value.summary.toJSON(),
      fact: value.fact.toJSON(),
      correlationId: "correlation-1"
    });
    expect(value).not.toHaveProperty("execution");
    expect(value).not.toHaveProperty("aggregate");
    expect(value).not.toHaveProperty("workItem");
    expect(value).not.toHaveProperty("repository");
    expect(value).not.toHaveProperty("transaction");
  });

  it("delegates domain rejection to the aggregate and does not save rejected state", async () => {
    const execution = createExecution({
      workItems: [new PortfolioWorkItem({
        id: new WorkItemId("work-item-1"),
        lifecycle: PortfolioWorkItemLifecycle.Pending
      })]
    });
    const before = execution.toJSON();
    const repository = new RecordingPortfolioExecutionRepository(execution);
    const service = new CompleteWorkItemApplicationService({ repository });

    const result = await service.complete(createInput());

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(InvalidExecutionOperationError);
    expect(repository.loadCount).toBe(1);
    expect(repository.saveCount).toBe(0);
    expect(execution.toJSON()).toEqual(before);
  });

  it("propagates unknown work-item rejection from the aggregate and does not save", async () => {
    const execution = createExecution();
    const before = execution.toJSON();
    const repository = new RecordingPortfolioExecutionRepository(execution);
    const service = new CompleteWorkItemApplicationService({ repository });

    const result = await service.complete(new CompleteWorkItemInput({
      executionId: new ExecutionId("execution-1"),
      workItemId: new WorkItemId("missing-work-item"),
      commandContext: commandContext()
    }));

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnknownWorkItemError);
    expect(repository.loadCount).toBe(1);
    expect(repository.saveCount).toBe(0);
    expect(execution.toJSON()).toEqual(before);
  });

  it("returns an application not-found failure and does not save when the aggregate is missing", async () => {
    const repository = new RecordingPortfolioExecutionRepository(undefined);
    const service = new CompleteWorkItemApplicationService({ repository });

    const result = await service.complete(createInput());

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(PortfolioExecutionNotFoundError);
    expect(repository.loadCount).toBe(1);
    expect(repository.saveCount).toBe(0);
  });

  it("keeps the input immutable and deterministic", async () => {
    const input = createInput();
    const equivalent = createInput();

    expect(Object.isFrozen(input)).toBe(true);
    expect(input.equals(equivalent)).toBe(true);
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
  });

  it("does not expose workflow, publishing, retry, policy, or adapter behavior", async () => {
    const service = new CompleteWorkItemApplicationService({
      repository: new RecordingPortfolioExecutionRepository(createExecution())
    });

    expect(service).not.toHaveProperty("publish");
    expect(service).not.toHaveProperty("retry");
    expect(service).not.toHaveProperty("evaluatePolicy");
    expect(service).not.toHaveProperty("beginTransaction");
    expect(service).not.toHaveProperty("handleHttp");
    expect(service).not.toHaveProperty("executeWorkflow");
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

function createInput(): CompleteWorkItemInput {
  return new CompleteWorkItemInput({
    executionId: new ExecutionId("execution-1"),
    workItemId: new WorkItemId("work-item-1"),
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
    workItems: [new PortfolioWorkItem({
      id: new WorkItemId("work-item-1"),
      lifecycle: PortfolioWorkItemLifecycle.Active
    })],
    ...overrides,
    authorizationResourceReference: overrides.authorizationResourceReference ?? new PortfolioWorkspaceAuthorizationResourceReference({
      authorizationResourceReference: "portfolio-workspace:execution-owner-1"
    })
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
