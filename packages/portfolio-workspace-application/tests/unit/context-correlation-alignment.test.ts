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
  PortfolioWorkspaceAuthorizationResourceReference,
  PortfolioWorkItem,
  PortfolioWorkItemLifecycle,
  WorkItemId
} from "@career-companion/portfolio-workspace";
import {
  ActivateWorkItemApplicationService,
  ActivateWorkItemInput,
  BeginExecutionApplicationService,
  BeginExecutionInput,
  CancelExecutionApplicationService,
  CancelExecutionInput,
  CancelWorkItemApplicationService,
  CancelWorkItemInput,
  LoadedPortfolioExecution,
  PortfolioExecutionRevision,
  PortfolioExecutionSaveResult,
  type PortfolioExecutionRepository
} from "../../src";

describe("application command context and correlation alignment", () => {
  it("uses each operation context for its fact and result without leaking context between use cases", async () => {
    const execution = createExecution();
    const repository = new RecordingPortfolioExecutionRepository(execution);
    const beginService = new BeginExecutionApplicationService({ repository });
    const activateService = new ActivateWorkItemApplicationService({ repository });
    const cancelWorkItemService = new CancelWorkItemApplicationService({ repository });
    const cancelService = new CancelExecutionApplicationService({ repository });
    const beginContext = commandContext("begin");
    const activateContext = commandContext("activate");
    const cancelWorkItemContext = commandContext("cancel-work-item");
    const cancelContext = commandContext("cancel");

    const beginResult = await beginService.begin(new BeginExecutionInput({
      executionId: new ExecutionId("execution-1"),
      commandContext: beginContext
    }));
    const activateResult = await activateService.activate(new ActivateWorkItemInput({
      executionId: new ExecutionId("execution-1"),
      workItemId: new WorkItemId("work-item-1"),
      commandContext: activateContext
    }));
    const cancelWorkItemResult = await cancelWorkItemService.cancel(new CancelWorkItemInput({
      executionId: new ExecutionId("execution-1"),
      workItemId: new WorkItemId("work-item-1"),
      commandContext: cancelWorkItemContext
    }));
    const cancelResult = await cancelService.cancel(new CancelExecutionInput({
      executionId: new ExecutionId("execution-1"),
      commandContext: cancelContext
    }));

    expect(beginResult.isSuccess).toBe(true);
    expect(activateResult.isSuccess).toBe(true);
    expect(cancelWorkItemResult.isSuccess).toBe(true);
    expect(cancelResult.isSuccess).toBe(true);
    expect(beginResult.value?.fact.commandContext.equals(beginContext)).toBe(true);
    expect(activateResult.value?.fact.commandContext.equals(activateContext)).toBe(true);
    expect(cancelWorkItemResult.value?.fact.commandContext.equals(cancelWorkItemContext)).toBe(true);
    expect(cancelResult.value?.fact.commandContext.equals(cancelContext)).toBe(true);
    expect(beginResult.value?.fact.commandContext.equals(cancelResult.value?.fact.commandContext)).toBe(false);
    expect(activateResult.value?.fact.commandContext.equals(beginResult.value?.fact.commandContext)).toBe(false);
    expect(activateResult.value?.fact.commandContext.equals(cancelResult.value?.fact.commandContext)).toBe(false);
    expect(cancelWorkItemResult.value?.fact.commandContext.equals(beginResult.value?.fact.commandContext)).toBe(false);
    expect(cancelWorkItemResult.value?.fact.commandContext.equals(activateResult.value?.fact.commandContext)).toBe(false);
    expect(cancelWorkItemResult.value?.fact.commandContext.equals(cancelResult.value?.fact.commandContext)).toBe(false);
    expect(beginResult.value?.correlationId).toBe(beginResult.value?.fact.commandContext.correlationId);
    expect(activateResult.value?.correlationId).toBe(activateResult.value?.fact.commandContext.correlationId);
    expect(cancelWorkItemResult.value?.correlationId).toBe(cancelWorkItemResult.value?.fact.commandContext.correlationId);
    expect(cancelResult.value?.correlationId).toBe(cancelResult.value?.fact.commandContext.correlationId);
    expect(repository.loadCount).toBe(4);
    expect(repository.saveCount).toBe(4);
    expect(execution.lifecycle).toBe(PortfolioExecutionLifecycle.Cancelled);
  });
});

class RecordingPortfolioExecutionRepository implements PortfolioExecutionRepository {
  loadCount = 0;
  saveCount = 0;
  revision = new PortfolioExecutionRevision(1);

  constructor(private readonly execution: PortfolioExecution | undefined) {}

  async loadByExecutionId(executionId: ExecutionId): Promise<LoadedPortfolioExecution | undefined> {
    this.loadCount += 1;
    if (this.execution?.id.equals(executionId) === true) {
      return new LoadedPortfolioExecution({
        execution: this.execution,
        revision: this.revision
      });
    }

    return undefined;
  }

  async save() {
    this.saveCount += 1;
    this.revision = this.revision.next();
    return Result.success(new PortfolioExecutionSaveResult({
      revision: this.revision
    }));
  }
}

function createExecution(): PortfolioExecution {
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
    authorizationResourceReference: new PortfolioWorkspaceAuthorizationResourceReference({
      authorizationResourceReference: "portfolio-workspace:execution-owner-1"
    }),
    commandContext: commandContext("initialization"),
    lifecycle: PortfolioExecutionLifecycle.Initialized,
    workItems: [new PortfolioWorkItem({
      id: new WorkItemId("work-item-1"),
      lifecycle: PortfolioWorkItemLifecycle.Pending
    })]
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
