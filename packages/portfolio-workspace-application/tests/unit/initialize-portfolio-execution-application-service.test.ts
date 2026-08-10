import { describe, expect, it } from "vitest";
import { Result } from "@career-companion/kernel";
import {
  ApprovalReference,
  ArtifactCandidateLifecycle,
  CandidateId,
  DuplicateCandidateError,
  DuplicateWorkItemError,
  ExecutionId,
  PlanSnapshotReference,
  PortfolioExecution,
  PortfolioExecutionCommandContext,
  PortfolioExecutionInitializedFact,
  PortfolioExecutionLifecycle,
  PortfolioExecutionSummaryProjection,
  PortfolioPlanReference,
  PortfolioWorkItemLifecycle,
  WorkItemId
} from "@career-companion/portfolio-workspace";
import {
  InitializeArtifactCandidateDefinition,
  InitializePortfolioExecutionApplicationService,
  InitializePortfolioExecutionInput,
  InitializePortfolioExecutionResult,
  InitializePortfolioWorkItemDefinition,
  LoadedPortfolioExecution,
  PortfolioExecutionAlreadyExistsError,
  PortfolioExecutionPersistenceUnavailableError,
  PortfolioExecutionRevision,
  PortfolioExecutionSaveResult,
  type PortfolioExecutionRepository
} from "../../src";

describe("InitializePortfolioExecutionApplicationService", () => {
  it("creates an initialized aggregate, saves it with creation semantics, and returns immutable domain outputs", async () => {
    const repository = new RecordingPortfolioExecutionRepository();
    const service = new InitializePortfolioExecutionApplicationService({ repository });
    const input = createInput();

    const result = await service.initialize(input);

    expect(result.isSuccess).toBe(true);
    expect(repository.loadCount).toBe(0);
    expect(repository.saveCount).toBe(1);
    expect(repository.savedRevision).toBeUndefined();
    expect(repository.saveResultRevision?.toJSON()).toBe(1);
    expect(repository.savedExecution).toBeInstanceOf(PortfolioExecution);
    expect(repository.savedExecution?.lifecycle).toBe(PortfolioExecutionLifecycle.Initialized);
    expect(repository.savedExecution?.workItems().map((workItem) => workItem.toJSON())).toEqual([{
      id: "work-item-1",
      lifecycle: PortfolioWorkItemLifecycle.Pending
    }]);
    expect(repository.savedExecution?.candidates().map((candidate) => candidate.toJSON())).toEqual([{
      id: "candidate-1",
      lifecycle: ArtifactCandidateLifecycle.Registered
    }]);
    expect(repository.savedExecution?.acceptedArtifacts()).toHaveLength(0);

    const value = expectSuccess(result.value);
    expect(value).toBeInstanceOf(InitializePortfolioExecutionResult);
    expect(Object.isFrozen(value)).toBe(true);
    expect(value.fact).toBeInstanceOf(PortfolioExecutionInitializedFact);
    expect(value.fact.commandContext.equals(input.commandContext)).toBe(true);
    expect(value.correlationId).toBe(value.fact.commandContext.correlationId);
    expect(value.summary).toBeInstanceOf(PortfolioExecutionSummaryProjection);
    expect(value.summary.toJSON()).toMatchObject({
      executionId: "execution-1",
      lifecycle: PortfolioExecutionLifecycle.Initialized,
      workItemCount: 1,
      candidateCount: 1,
      acceptedArtifactCount: 0,
      factTypes: ["PortfolioExecutionInitialized"]
    });
    expect(value.toJSON()).toEqual({
      summary: value.summary.toJSON(),
      fact: value.fact.toJSON(),
      correlationId: "correlation-1"
    });
    expect(value).not.toHaveProperty("execution");
    expect(value).not.toHaveProperty("aggregate");
    expect(value).not.toHaveProperty("revision");
    expect(value).not.toHaveProperty("repository");
  });

  it("keeps initialization input immutable, deterministic, and free of aggregates or accepted artifacts", () => {
    const workItems = [new InitializePortfolioWorkItemDefinition({ workItemId: new WorkItemId("work-item-1") })];
    const candidates = [new InitializeArtifactCandidateDefinition({ candidateId: new CandidateId("candidate-1") })];
    const input = createInput({ workItems, candidates });
    const equivalent = createInput({ workItems, candidates });

    workItems.push(new InitializePortfolioWorkItemDefinition({ workItemId: new WorkItemId("work-item-2") }));
    candidates.push(new InitializeArtifactCandidateDefinition({ candidateId: new CandidateId("candidate-2") }));

    expect(Object.isFrozen(input)).toBe(true);
    expect(Object.isFrozen(input.workItems)).toBe(true);
    expect(Object.isFrozen(input.candidates)).toBe(true);
    expect(input.workItems).toHaveLength(1);
    expect(input.candidates).toHaveLength(1);
    expect(input.equals(equivalent)).toBe(true);
    expect(input.toJSON()).toEqual({
      executionId: "execution-1",
      portfolioPlanReference: portfolioPlanReference().toJSON(),
      planSnapshotReference: planSnapshotReference().toJSON(),
      approvalReference: approvalReference().toJSON(),
      commandContext: commandContext().toJSON(),
      workItems: [{ workItemId: "work-item-1" }],
      candidates: [{ candidateId: "candidate-1" }]
    });
    expect(JSON.stringify(input)).not.toContain("PortfolioExecution");
    expect(JSON.stringify(input)).not.toContain("AcceptedArtifact");
    expect(input).not.toHaveProperty("execution");
    expect(input).not.toHaveProperty("repository");
    expect(input).not.toHaveProperty("revision");
  });

  it("rejects duplicate initial work items and candidates before repository save", async () => {
    const service = new InitializePortfolioExecutionApplicationService({
      repository: new RecordingPortfolioExecutionRepository()
    });
    const duplicateWorkItems = await service.initialize(createInput({
      workItems: [
        new InitializePortfolioWorkItemDefinition({ workItemId: new WorkItemId("work-item-1") }),
        new InitializePortfolioWorkItemDefinition({ workItemId: new WorkItemId("work-item-1") })
      ],
      candidates: []
    }));
    const duplicateCandidates = await service.initialize(createInput({
      workItems: [],
      candidates: [
        new InitializeArtifactCandidateDefinition({ candidateId: new CandidateId("candidate-1") }),
        new InitializeArtifactCandidateDefinition({ candidateId: new CandidateId("candidate-1") })
      ]
    }));

    expect(duplicateWorkItems.isFailure).toBe(true);
    expect(duplicateWorkItems.error).toBeInstanceOf(DuplicateWorkItemError);
    expect(duplicateCandidates.isFailure).toBe(true);
    expect(duplicateCandidates.error).toBeInstanceOf(DuplicateCandidateError);
  });

  it("propagates repository creation failures without load-before-save or retry", async () => {
    const executionId = new ExecutionId("execution-1");
    const alreadyExistsRepository = new RecordingPortfolioExecutionRepository({
      saveFailure: new PortfolioExecutionAlreadyExistsError({
        executionId,
        currentRevision: new PortfolioExecutionRevision(1)
      })
    });
    const unavailableRepository = new RecordingPortfolioExecutionRepository({
      saveFailure: new PortfolioExecutionPersistenceUnavailableError()
    });

    const alreadyExists = await new InitializePortfolioExecutionApplicationService({
      repository: alreadyExistsRepository
    }).initialize(createInput());
    const unavailable = await new InitializePortfolioExecutionApplicationService({
      repository: unavailableRepository
    }).initialize(createInput());

    expect(alreadyExists.isFailure).toBe(true);
    expect(alreadyExists.error).toBeInstanceOf(PortfolioExecutionAlreadyExistsError);
    expect(alreadyExistsRepository.loadCount).toBe(0);
    expect(alreadyExistsRepository.saveCount).toBe(1);
    expect(unavailable.isFailure).toBe(true);
    expect(unavailable.error).toBeInstanceOf(PortfolioExecutionPersistenceUnavailableError);
    expect(unavailableRepository.loadCount).toBe(0);
    expect(unavailableRepository.saveCount).toBe(1);
  });

  it("keeps initialization separate from beginning execution and other application services", async () => {
    const repository = new RecordingPortfolioExecutionRepository();
    const service = new InitializePortfolioExecutionApplicationService({ repository });

    await service.initialize(createInput());

    expect(repository.savedExecution?.lifecycle).toBe(PortfolioExecutionLifecycle.Initialized);
    expect(service).not.toHaveProperty("begin");
    expect(service).not.toHaveProperty("activate");
    expect(service).not.toHaveProperty("publish");
    expect(service).not.toHaveProperty("retry");
    expect(service).not.toHaveProperty("executeWorkflow");
  });
});

class RecordingPortfolioExecutionRepository implements PortfolioExecutionRepository {
  loadCount = 0;
  saveCount = 0;
  savedExecution: PortfolioExecution | undefined;
  savedRevision: PortfolioExecutionRevision | undefined;
  saveResultRevision: PortfolioExecutionRevision | undefined;

  constructor(private readonly input: {
    readonly saveFailure?: PortfolioExecutionAlreadyExistsError | PortfolioExecutionPersistenceUnavailableError;
  } = {}) {}

  async loadByExecutionId(): Promise<LoadedPortfolioExecution | undefined> {
    this.loadCount += 1;
    return undefined;
  }

  async save(execution: PortfolioExecution, expectedRevision?: PortfolioExecutionRevision) {
    this.saveCount += 1;
    this.savedExecution = execution;
    this.savedRevision = expectedRevision;

    if (this.input.saveFailure !== undefined) {
      return Result.failure(this.input.saveFailure);
    }

    this.saveResultRevision = new PortfolioExecutionRevision(1);
    return Result.success(new PortfolioExecutionSaveResult({
      revision: this.saveResultRevision
    }));
  }
}

function createInput(overrides: {
  readonly workItems?: readonly InitializePortfolioWorkItemDefinition[];
  readonly candidates?: readonly InitializeArtifactCandidateDefinition[];
} = {}): InitializePortfolioExecutionInput {
  return new InitializePortfolioExecutionInput({
    executionId: new ExecutionId("execution-1"),
    portfolioPlanReference: portfolioPlanReference(),
    planSnapshotReference: planSnapshotReference(),
    approvalReference: approvalReference(),
    commandContext: commandContext(),
    workItems: overrides.workItems ?? [
      new InitializePortfolioWorkItemDefinition({ workItemId: new WorkItemId("work-item-1") })
    ],
    candidates: overrides.candidates ?? [
      new InitializeArtifactCandidateDefinition({ candidateId: new CandidateId("candidate-1") })
    ]
  });
}

function portfolioPlanReference(): PortfolioPlanReference {
  return new PortfolioPlanReference({
    planId: "portfolio-plan-1",
    roadmapId: "roadmap-1",
    planArtifactReference: "artifact:portfolio-plan-1"
  });
}

function planSnapshotReference(): PlanSnapshotReference {
  return new PlanSnapshotReference({
    snapshotReference: "snapshot:portfolio-plan-1:v1"
  });
}

function approvalReference(): ApprovalReference {
  return new ApprovalReference({
    approvalReference: "approval:portfolio-plan-1"
  });
}

function commandContext(): PortfolioExecutionCommandContext {
  return new PortfolioExecutionCommandContext({
    commandId: "command-1",
    correlationId: "correlation-1",
    actorReference: "actor:1",
    occurredAt: "2026-08-05T00:00:00.000Z"
  });
}

function expectSuccess<T>(value: T | undefined): T {
  if (value === undefined) {
    throw new Error("Expected successful result value.");
  }

  return value;
}
