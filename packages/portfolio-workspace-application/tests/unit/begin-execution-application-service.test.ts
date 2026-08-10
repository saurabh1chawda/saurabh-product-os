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
  PortfolioExecutionStartedFact,
  PortfolioExecutionSummaryProjection,
  PortfolioPlanReference
} from "@career-companion/portfolio-workspace";
import {
  BeginExecutionApplicationService,
  BeginExecutionInput,
  BeginExecutionResult,
  LoadedPortfolioExecution,
  PortfolioExecutionNotFoundError,
  PortfolioExecutionRevision,
  PortfolioExecutionSaveResult,
  type PortfolioExecutionRepository
} from "../../src";

describe("BeginExecutionApplicationService", () => {
  it("loads the aggregate, invokes beginExecution, saves it, and returns immutable domain outputs", async () => {
    const execution = createExecution();
    const repository = new RecordingPortfolioExecutionRepository(execution);
    const service = new BeginExecutionApplicationService({ repository });
    const input = createInput();
    let capturedCommandContext: PortfolioExecutionCommandContext | undefined;
    const originalBeginExecution = execution.beginExecution.bind(execution);
    execution.beginExecution = (suppliedCommandContext): PortfolioExecutionStartedFact => {
      capturedCommandContext = suppliedCommandContext;
      return originalBeginExecution(suppliedCommandContext);
    };

    const result = await service.begin(input);

    expect(result.isSuccess).toBe(true);
    expect(repository.loadCount).toBe(1);
    expect(repository.saveCount).toBe(1);
    expect(repository.savedExecution).toBe(execution);
    expect(repository.savedRevision?.toJSON()).toBe(1);
    expect(capturedCommandContext?.equals(input.commandContext)).toBe(true);
    expect(execution.lifecycle).toBe(PortfolioExecutionLifecycle.Active);

    const value = expectSuccess(result.value);
    expect(value).toBeInstanceOf(BeginExecutionResult);
    expect(Object.isFrozen(value)).toBe(true);
    expect(value.fact).toBeInstanceOf(PortfolioExecutionStartedFact);
    expect(value.fact.commandContext.equals(input.commandContext)).toBe(true);
    expect(value.correlationId).toBe(value.fact.commandContext.correlationId);
    expect(value.summary).toBeInstanceOf(PortfolioExecutionSummaryProjection);
    expect(value.summary.toJSON()).toMatchObject({
      executionId: "execution-1",
      lifecycle: PortfolioExecutionLifecycle.Active,
      factTypes: ["PortfolioExecutionStarted"]
    });
    expect(value.toJSON()).toEqual({
      summary: value.summary.toJSON(),
      fact: value.fact.toJSON(),
      correlationId: "correlation-1"
    });
    expect(value).not.toHaveProperty("execution");
    expect(value).not.toHaveProperty("aggregate");
    expect(value).not.toHaveProperty("repository");
    expect(value).not.toHaveProperty("transaction");
  });

  it("delegates domain rejection to the aggregate and does not save rejected state", async () => {
    const execution = createExecution({ lifecycle: PortfolioExecutionLifecycle.Active });
    const before = execution.toJSON();
    const repository = new RecordingPortfolioExecutionRepository(execution);
    const service = new BeginExecutionApplicationService({ repository });

    const result = await service.begin(createInput());

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(InvalidExecutionOperationError);
    expect(repository.loadCount).toBe(1);
    expect(repository.saveCount).toBe(0);
    expect(execution.toJSON()).toEqual(before);
  });

  it("returns an application not-found failure and does not save when the aggregate is missing", async () => {
    const repository = new RecordingPortfolioExecutionRepository(undefined);
    const service = new BeginExecutionApplicationService({ repository });

    const result = await service.begin(createInput());

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(PortfolioExecutionNotFoundError);
    const error = expectNotFound(result.error);
    expect(error.toJSON()).toEqual({
      name: "PortfolioExecutionNotFoundError",
      executionId: "execution-1"
    });
    expect(repository.loadCount).toBe(1);
    expect(repository.saveCount).toBe(0);
  });

  it("keeps the input and application error immutable and deterministic", async () => {
    const input = createInput();
    const equivalent = createInput();
    const notFound = new PortfolioExecutionNotFoundError(new ExecutionId("execution-1"));

    expect(Object.isFrozen(input)).toBe(true);
    expect(input.equals(equivalent)).toBe(true);
    expect(input.toJSON()).toEqual({
      executionId: "execution-1",
      commandContext: {
        commandId: "command-1",
        correlationId: "correlation-1",
        actorReference: "actor:1",
        occurredAt: "2026-08-01T00:00:00.000Z"
      }
    });
    expect(Object.isFrozen(notFound)).toBe(true);
    expect(notFound.equals(new PortfolioExecutionNotFoundError(new ExecutionId("execution-1")))).toBe(true);
  });

  it("does not expose workflow, publishing, retry, policy, or adapter behavior", async () => {
    const service = new BeginExecutionApplicationService({
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

function createInput(): BeginExecutionInput {
  return new BeginExecutionInput({
    executionId: new ExecutionId("execution-1"),
    commandContext: new PortfolioExecutionCommandContext({
      commandId: "command-1",
      correlationId: "correlation-1",
      actorReference: "actor:1",
      occurredAt: "2026-08-01T00:00:00.000Z"
    })
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
    commandContext: new PortfolioExecutionCommandContext({
      commandId: "command-1",
      correlationId: "correlation-1",
      actorReference: "actor:1",
      occurredAt: "2026-08-01T00:00:00.000Z"
    }),
    lifecycle: PortfolioExecutionLifecycle.Initialized,
    ...overrides
  });
}

function expectSuccess<T>(value: T | undefined): T {
  if (value === undefined) {
    throw new Error("Expected successful result value.");
  }

  return value;
}

function expectNotFound(error: unknown): PortfolioExecutionNotFoundError {
  if (!(error instanceof PortfolioExecutionNotFoundError)) {
    throw new Error("Expected PortfolioExecutionNotFoundError.");
  }

  return error;
}
