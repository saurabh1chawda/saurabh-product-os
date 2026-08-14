import { describe, expect, it } from "vitest";
import { Result } from "@career-companion/kernel";
import {
  ApprovalReference,
  ArtifactCandidate,
  ArtifactCandidateLifecycle,
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
  WorkItemId,
  CandidateId
} from "@career-companion/portfolio-workspace";
import {
  GetPortfolioExecutionApplicationService,
  GetPortfolioExecutionInput,
  GetPortfolioExecutionResult,
  LoadedPortfolioExecution,
  PortfolioExecutionNotFoundError,
  PortfolioExecutionRevision,
  PortfolioExecutionSaveResult,
  type PortfolioExecutionRepository
} from "../../src";

describe("GetPortfolioExecutionApplicationService", () => {
  it("loads an existing execution once and returns an immutable summary result", async () => {
    const execution = createExecution();
    const repository = new RecordingPortfolioExecutionRepository(execution);
    const service = new GetPortfolioExecutionApplicationService({ repository });
    const input = new GetPortfolioExecutionInput({
      executionId: execution.id,
      correlationId: "correlation:get"
    });

    const result = await service.get(input);

    expect(result.isSuccess).toBe(true);
    expect(repository.loadCount).toBe(1);
    expect(repository.saveCount).toBe(0);

    const value = expectSuccess(result.value);
    expect(value).toBeInstanceOf(GetPortfolioExecutionResult);
    expect(Object.isFrozen(value)).toBe(true);
    expect(value.summary).toBeInstanceOf(PortfolioExecutionSummaryProjection);
    expect(value.correlationId).toBe("correlation:get");
    expect(value.summary.toJSON()).toMatchObject({
      executionId: "execution:get",
      lifecycle: PortfolioExecutionLifecycle.Active,
      workItemCount: 2,
      candidateCount: 1,
      factTypes: []
    });
    expect(value.toJSON()).toEqual({
      summary: value.summary.toJSON(),
      correlationId: "correlation:get"
    });
    expect(value).not.toHaveProperty("execution");
    expect(value).not.toHaveProperty("aggregate");
    expect(value).not.toHaveProperty("workItems");
    expect(value).not.toHaveProperty("candidates");
    expect(value).not.toHaveProperty("revision");
    expect(value).not.toHaveProperty("repository");
  });

  it("returns not found as a typed Application failure and does not save", async () => {
    const repository = new RecordingPortfolioExecutionRepository(undefined);
    const service = new GetPortfolioExecutionApplicationService({ repository });
    const input = new GetPortfolioExecutionInput({
      executionId: new ExecutionId("execution:missing")
    });

    const result = await service.get(input);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(PortfolioExecutionNotFoundError);
    expect(repository.loadCount).toBe(1);
    expect(repository.saveCount).toBe(0);
    expect((result.error as PortfolioExecutionNotFoundError).toJSON()).toEqual({
      name: "PortfolioExecutionNotFoundError",
      executionId: "execution:missing"
    });
  });

  it("keeps input and result value comparable and deterministic", async () => {
    const execution = createExecution();
    const service = new GetPortfolioExecutionApplicationService({
      repository: new RecordingPortfolioExecutionRepository(execution)
    });
    const input = new GetPortfolioExecutionInput({
      executionId: execution.id,
      correlationId: "correlation:get"
    });
    const equivalentInput = new GetPortfolioExecutionInput({
      executionId: new ExecutionId("execution:get"),
      correlationId: "correlation:get"
    });

    const first = await service.get(input);
    const second = await service.get(equivalentInput);

    expect(Object.isFrozen(input)).toBe(true);
    expect(input.equals(equivalentInput)).toBe(true);
    expect(input.toJSON()).toEqual({
      executionId: "execution:get",
      correlationId: "correlation:get"
    });

    const firstValue = expectSuccess(first.value);
    const secondValue = expectSuccess(second.value);
    expect(firstValue.equals(secondValue)).toBe(true);
    expect(firstValue.toJSON()).toEqual(secondValue.toJSON());
    expect(JSON.stringify(firstValue)).not.toContain("PortfolioExecutionRevision");
    expect(JSON.stringify(firstValue)).not.toContain("revision");
  });

  it("supports query results without correlation when no caller correlation is supplied", async () => {
    const execution = createExecution();
    const service = new GetPortfolioExecutionApplicationService({
      repository: new RecordingPortfolioExecutionRepository(execution)
    });

    const result = await service.get(new GetPortfolioExecutionInput({
      executionId: execution.id
    }));

    expect(result.isSuccess).toBe(true);
    const value = expectSuccess(result.value);
    expect(value.correlationId).toBeUndefined();
    expect(value.toJSON()).not.toHaveProperty("correlationId");
  });

  it("does not expose workflow, mutation, persistence, projection storage, or adapter behavior", () => {
    const service = new GetPortfolioExecutionApplicationService({
      repository: new RecordingPortfolioExecutionRepository(createExecution())
    });

    expect(service).not.toHaveProperty("save");
    expect(service).not.toHaveProperty("findAll");
    expect(service).not.toHaveProperty("search");
    expect(service).not.toHaveProperty("paginate");
    expect(service).not.toHaveProperty("publish");
    expect(service).not.toHaveProperty("beginTransaction");
    expect(service).not.toHaveProperty("handleHttp");
    expect(service).not.toHaveProperty("executeWorkflow");
  });
});

class RecordingPortfolioExecutionRepository implements PortfolioExecutionRepository {
  loadCount = 0;
  saveCount = 0;

  constructor(private readonly execution: PortfolioExecution | undefined) {}

  async loadByExecutionId(executionId: ExecutionId): Promise<LoadedPortfolioExecution | undefined> {
    this.loadCount += 1;
    if (this.execution?.id.equals(executionId) === true) {
      return new LoadedPortfolioExecution({
        execution: this.execution,
        revision: new PortfolioExecutionRevision(42)
      });
    }

    return undefined;
  }

  async save() {
    this.saveCount += 1;
    return Result.success(new PortfolioExecutionSaveResult({
      revision: new PortfolioExecutionRevision(43)
    }));
  }
}

function createExecution(): PortfolioExecution {
  return new PortfolioExecution({
    id: new ExecutionId("execution:get"),
    portfolioPlanReference: new PortfolioPlanReference({
      planId: "portfolio-plan:get",
      roadmapId: "roadmap:get",
      planArtifactReference: "artifact:portfolio-plan:get"
    }),
    planSnapshotReference: new PlanSnapshotReference({
      snapshotReference: "snapshot:portfolio-plan:get:v1"
    }),
    approvalReference: new ApprovalReference({
      approvalReference: "approval:portfolio-plan:get"
    }),
    authorizationResourceReference: new PortfolioWorkspaceAuthorizationResourceReference({
      authorizationResourceReference: "portfolio-workspace:execution-owner-1"
    }),
    commandContext: new PortfolioExecutionCommandContext({
      commandId: "command:get-created",
      correlationId: "correlation:get-created",
      actorReference: "actor:get-created",
      occurredAt: "2026-08-06T00:00:00.000Z"
    }),
    lifecycle: PortfolioExecutionLifecycle.Active,
    workItems: [
      new PortfolioWorkItem({
        id: new WorkItemId("work-item:get-active"),
        lifecycle: PortfolioWorkItemLifecycle.Active
      }),
      new PortfolioWorkItem({
        id: new WorkItemId("work-item:get-completed"),
        lifecycle: PortfolioWorkItemLifecycle.Completed
      })
    ],
    candidates: [
      new ArtifactCandidate({
        id: new CandidateId("candidate:get"),
        lifecycle: ArtifactCandidateLifecycle.Registered
      })
    ]
  });
}

function expectSuccess<T>(value: T | undefined): T {
  if (value === undefined) {
    throw new Error("Expected successful result value.");
  }

  return value;
}
