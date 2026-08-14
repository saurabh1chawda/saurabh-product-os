import { describe, expect, it } from "vitest";
import { Result } from "@career-companion/kernel";
import {
  ApprovalReference,
  ArtifactCandidate,
  ArtifactCandidateLifecycle,
  ArtifactCandidateRejectedFact,
  CandidateId,
  ExecutionId,
  InvalidExecutionOperationError,
  PlanSnapshotReference,
  PortfolioExecution,
  PortfolioExecutionCommandContext,
  PortfolioExecutionLifecycle,
  PortfolioExecutionSummaryProjection,
  PortfolioPlanReference,
  PortfolioWorkspaceAuthorizationResourceReference,
  UnknownCandidateError
} from "@career-companion/portfolio-workspace";
import {
  LoadedPortfolioExecution,
  PortfolioExecutionNotFoundError,
  PortfolioExecutionRevision,
  PortfolioExecutionSaveResult,
  RejectCandidateApplicationService,
  RejectCandidateInput,
  RejectCandidateResult,
  type PortfolioExecutionRepository
} from "../../src";

describe("RejectCandidateApplicationService", () => {
  it("loads the aggregate, rejects the candidate, saves it, and returns immutable domain outputs", async () => {
    const execution = createExecution();
    const repository = new RecordingPortfolioExecutionRepository(execution);
    const service = new RejectCandidateApplicationService({ repository });
    const input = createInput();
    let capturedCandidateId: CandidateId | undefined;
    let capturedCommandContext: PortfolioExecutionCommandContext | undefined;
    const originalRejectCandidate = execution.rejectCandidate.bind(execution);
    execution.rejectCandidate = (candidateId, suppliedCommandContext): ArtifactCandidateRejectedFact => {
      capturedCandidateId = candidateId;
      capturedCommandContext = suppliedCommandContext;
      return originalRejectCandidate(candidateId, suppliedCommandContext);
    };

    const result = await service.reject(input);

    expect(result.isSuccess).toBe(true);
    expect(repository.loadCount).toBe(1);
    expect(repository.saveCount).toBe(1);
    expect(repository.savedExecution).toBe(execution);
    expect(repository.savedRevision?.toJSON()).toBe(1);
    expect(capturedCandidateId?.equals(new CandidateId("candidate-1"))).toBe(true);
    expect(capturedCommandContext?.equals(input.commandContext)).toBe(true);
    expect(execution.findCandidate(new CandidateId("candidate-1"))?.lifecycle).toBe(ArtifactCandidateLifecycle.Rejected);
    expect(execution.acceptedArtifacts()).toHaveLength(0);

    const value = expectSuccess(result.value);
    expect(value).toBeInstanceOf(RejectCandidateResult);
    expect(Object.isFrozen(value)).toBe(true);
    expect(value.fact).toBeInstanceOf(ArtifactCandidateRejectedFact);
    expect(value.fact).toBe(result.value?.fact);
    expect(value.fact.toJSON()).toMatchObject({
      type: "ArtifactCandidateRejected",
      executionId: "execution-1",
      candidateId: "candidate-1",
      commandContext: input.commandContext.toJSON()
    });
    expect(value.correlationId).toBe(value.fact.commandContext.correlationId);
    expect(value.summary).toBeInstanceOf(PortfolioExecutionSummaryProjection);
    expect(value.summary.toJSON()).toMatchObject({
      executionId: "execution-1",
      lifecycle: PortfolioExecutionLifecycle.Active,
      acceptedArtifactCount: 0,
      factTypes: ["ArtifactCandidateRejected"],
      candidatesByLifecycle: {
        Registered: 0,
        Accepted: 0,
        Rejected: 1
      }
    });
    expect(value.toJSON()).toEqual({
      summary: value.summary.toJSON(),
      fact: value.fact.toJSON(),
      correlationId: "correlation-1"
    });
    expect(value).not.toHaveProperty("execution");
    expect(value).not.toHaveProperty("aggregate");
    expect(value).not.toHaveProperty("candidate");
    expect(value).not.toHaveProperty("acceptedArtifact");
    expect(value).not.toHaveProperty("repository");
    expect(value).not.toHaveProperty("transaction");
  });

  it("propagates unknown candidate rejection and does not save", async () => {
    const execution = createExecution();
    const before = execution.toJSON();
    const repository = new RecordingPortfolioExecutionRepository(execution);
    const service = new RejectCandidateApplicationService({ repository });

    const result = await service.reject(new RejectCandidateInput({
      executionId: new ExecutionId("execution-1"),
      candidateId: new CandidateId("missing-candidate"),
      commandContext: commandContext()
    }));

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnknownCandidateError);
    expect(repository.loadCount).toBe(1);
    expect(repository.saveCount).toBe(0);
    expect(execution.toJSON()).toEqual(before);
    expect(execution.acceptedArtifacts()).toHaveLength(0);
  });

  it("propagates accepted candidate rejection and does not save", async () => {
    const execution = createExecution({
      candidates: [createCandidate("candidate-1", ArtifactCandidateLifecycle.Accepted)]
    });
    const before = execution.toJSON();
    const repository = new RecordingPortfolioExecutionRepository(execution);
    const service = new RejectCandidateApplicationService({ repository });

    const result = await service.reject(createInput());

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(InvalidExecutionOperationError);
    expect(repository.loadCount).toBe(1);
    expect(repository.saveCount).toBe(0);
    expect(execution.toJSON()).toEqual(before);
  });

  it("propagates already rejected candidate rejection and does not save", async () => {
    const execution = createExecution({
      candidates: [createCandidate("candidate-1", ArtifactCandidateLifecycle.Rejected)]
    });
    const before = execution.toJSON();
    const repository = new RecordingPortfolioExecutionRepository(execution);
    const service = new RejectCandidateApplicationService({ repository });

    const result = await service.reject(createInput());

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(InvalidExecutionOperationError);
    expect(repository.loadCount).toBe(1);
    expect(repository.saveCount).toBe(0);
    expect(execution.toJSON()).toEqual(before);
  });

  it("propagates invalid execution lifecycle rejection and does not save", async () => {
    const execution = createExecution({ lifecycle: PortfolioExecutionLifecycle.Initialized });
    const before = execution.toJSON();
    const repository = new RecordingPortfolioExecutionRepository(execution);
    const service = new RejectCandidateApplicationService({ repository });

    const result = await service.reject(createInput());

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(InvalidExecutionOperationError);
    expect(repository.loadCount).toBe(1);
    expect(repository.saveCount).toBe(0);
    expect(execution.toJSON()).toEqual(before);
  });

  it("returns an application not-found failure and does not save when the aggregate is missing", async () => {
    const repository = new RecordingPortfolioExecutionRepository(undefined);
    const service = new RejectCandidateApplicationService({ repository });

    const result = await service.reject(createInput());

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(PortfolioExecutionNotFoundError);
    expect(repository.loadCount).toBe(1);
    expect(repository.saveCount).toBe(0);
  });

  it("keeps the input and result immutable, deterministic, and value-comparable", async () => {
    const input = createInput();
    const equivalentInput = createInput();
    const execution = createExecution();
    const fact = execution.rejectCandidate(new CandidateId("candidate-1"), commandContext());
    const result = new RejectCandidateResult({
      summary: PortfolioExecutionSummaryProjection.fromExecution(execution, [fact]),
      fact,
      correlationId: "correlation-1"
    });
    const equivalentResult = new RejectCandidateResult({
      summary: PortfolioExecutionSummaryProjection.fromExecution(execution, [fact]),
      fact,
      correlationId: "correlation-1"
    });

    expect(Object.isFrozen(input)).toBe(true);
    expect(input.equals(equivalentInput)).toBe(true);
    expect(input.toJSON()).toEqual({
      executionId: "execution-1",
      candidateId: "candidate-1",
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

  it("does not expose workflow, publishing, retry, policy, adapter, or rejection helper behavior", async () => {
    const service = new RejectCandidateApplicationService({
      repository: new RecordingPortfolioExecutionRepository(createExecution())
    });

    expect(service).not.toHaveProperty("publish");
    expect(service).not.toHaveProperty("retry");
    expect(service).not.toHaveProperty("evaluatePolicy");
    expect(service).not.toHaveProperty("beginTransaction");
    expect(service).not.toHaveProperty("handleHttp");
    expect(service).not.toHaveProperty("executeWorkflow");
    expect(service).not.toHaveProperty("recordAcceptedArtifact");
    expect(service).not.toHaveProperty("createCandidate");
    expect(service).not.toHaveProperty("replaceCandidate");
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

function createInput(): RejectCandidateInput {
  return new RejectCandidateInput({
    executionId: new ExecutionId("execution-1"),
    candidateId: new CandidateId("candidate-1"),
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
    candidates: [createCandidate("candidate-1", ArtifactCandidateLifecycle.Registered)],
    ...overrides,
    authorizationResourceReference: overrides.authorizationResourceReference ?? new PortfolioWorkspaceAuthorizationResourceReference({
      authorizationResourceReference: "portfolio-workspace:execution-owner-1"
    })
  });
}

function createCandidate(
  id: string,
  lifecycle: ConstructorParameters<typeof ArtifactCandidate>[0]["lifecycle"]
): ArtifactCandidate {
  return new ArtifactCandidate({
    id: new CandidateId(id),
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
