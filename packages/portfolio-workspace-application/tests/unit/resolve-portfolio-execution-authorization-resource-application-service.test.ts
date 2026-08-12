import { describe, expect, it } from "vitest";
import { Result } from "@career-companion/kernel";
import {
  ApprovalReference,
  ExecutionId,
  PlanSnapshotReference,
  PortfolioExecution,
  PortfolioExecutionCommandContext,
  PortfolioExecutionLifecycle,
  PortfolioPlanReference,
  PortfolioWorkspaceAuthorizationResourceReference
} from "@career-companion/portfolio-workspace";
import {
  LoadedPortfolioExecution,
  PortfolioExecutionNotFoundError,
  PortfolioExecutionRevision,
  PortfolioExecutionSaveResult,
  ResolvePortfolioExecutionAuthorizationResourceApplicationService,
  ResolvePortfolioExecutionAuthorizationResourceInput,
  ResolvePortfolioExecutionAuthorizationResourceResult,
  type PortfolioExecutionRepository
} from "../../src";

describe("ResolvePortfolioExecutionAuthorizationResourceApplicationService", () => {
  it("loads once and returns the durable authorization resource without saving", async () => {
    const execution = executionFixture();
    const repository = new RecordingPortfolioExecutionRepository(execution);
    const service = new ResolvePortfolioExecutionAuthorizationResourceApplicationService({ repository });

    const result = await service.resolve(new ResolvePortfolioExecutionAuthorizationResourceInput({
      executionId: execution.id,
      correlationId: "correlation:authz"
    }));

    expect(result.isSuccess).toBe(true);
    expect(repository.loadCount).toBe(1);
    expect(repository.saveCount).toBe(0);

    const value = expectSuccess(result.value);
    expect(value).toBeInstanceOf(ResolvePortfolioExecutionAuthorizationResourceResult);
    expect(Object.isFrozen(value)).toBe(true);
    expect(value.executionId.equals(execution.id)).toBe(true);
    expect(value.authorizationResourceReference.equals(execution.authorizationResourceReference)).toBe(true);
    expect(value.correlationId).toBe("correlation:authz");
    expect(value.toJSON()).toEqual({
      executionId: "execution:authz",
      authorizationResourceReference: {
        authorizationResourceReference: "portfolio-workspace:principal:user:owner"
      },
      correlationId: "correlation:authz"
    });
    expect(value).not.toHaveProperty("execution");
    expect(value).not.toHaveProperty("repository");
    expect(value).not.toHaveProperty("revision");
  });

  it("returns not found as a typed Application failure and does not save", async () => {
    const repository = new RecordingPortfolioExecutionRepository(undefined);
    const service = new ResolvePortfolioExecutionAuthorizationResourceApplicationService({ repository });

    const result = await service.resolve(new ResolvePortfolioExecutionAuthorizationResourceInput({
      executionId: new ExecutionId("execution:missing")
    }));

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(PortfolioExecutionNotFoundError);
    expect(repository.loadCount).toBe(1);
    expect(repository.saveCount).toBe(0);
  });

  it("keeps input and result deterministic and value comparable", async () => {
    const execution = executionFixture();
    const service = new ResolvePortfolioExecutionAuthorizationResourceApplicationService({
      repository: new RecordingPortfolioExecutionRepository(execution)
    });
    const input = new ResolvePortfolioExecutionAuthorizationResourceInput({
      executionId: new ExecutionId("execution:authz"),
      correlationId: "correlation:authz"
    });
    const equivalentInput = new ResolvePortfolioExecutionAuthorizationResourceInput({
      executionId: execution.id,
      correlationId: "correlation:authz"
    });

    const first = await service.resolve(input);
    const second = await service.resolve(equivalentInput);

    expect(Object.isFrozen(input)).toBe(true);
    expect(input.equals(equivalentInput)).toBe(true);
    expect(expectSuccess(first.value).equals(expectSuccess(second.value))).toBe(true);
    expect(JSON.stringify(first.value)).not.toContain("PortfolioExecutionRevision");
    expect(JSON.stringify(first.value)).not.toContain("revision");
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
        revision: new PortfolioExecutionRevision(1)
      });
    }

    return undefined;
  }

  async save() {
    this.saveCount += 1;
    return Result.success(new PortfolioExecutionSaveResult({
      revision: new PortfolioExecutionRevision(2)
    }));
  }
}

function executionFixture(): PortfolioExecution {
  return new PortfolioExecution({
    id: new ExecutionId("execution:authz"),
    portfolioPlanReference: new PortfolioPlanReference({
      planId: "plan:authz",
      roadmapId: "roadmap:authz",
      planArtifactReference: "artifact:authz"
    }),
    planSnapshotReference: new PlanSnapshotReference({
      snapshotReference: "snapshot:authz"
    }),
    approvalReference: new ApprovalReference({
      approvalReference: "approval:authz"
    }),
    authorizationResourceReference: new PortfolioWorkspaceAuthorizationResourceReference({
      authorizationResourceReference: "portfolio-workspace:principal:user:owner"
    }),
    commandContext: new PortfolioExecutionCommandContext({
      commandId: "command:authz",
      correlationId: "correlation:authz",
      actorReference: "actor:authz",
      occurredAt: "2026-08-06T00:00:00.000Z"
    }),
    lifecycle: PortfolioExecutionLifecycle.Initialized,
    workItems: [],
    candidates: []
  });
}

function expectSuccess<T>(value: T | undefined): T {
  if (value === undefined) {
    throw new Error("Expected successful result value.");
  }

  return value;
}
