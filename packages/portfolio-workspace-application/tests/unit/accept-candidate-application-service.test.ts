import { describe, expect, it } from "vitest";
import { Result } from "@career-companion/kernel";
import {
  AcceptedArtifact,
  AcceptedArtifactId,
  AcceptedArtifactSummaryProjection,
  ApprovalReference,
  ArtifactCandidate,
  ArtifactCandidateAcceptedFact,
  ArtifactCandidateLifecycle,
  CandidateId,
  DuplicateAcceptedArtifactError,
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
  AcceptCandidateApplicationService,
  AcceptCandidateInput,
  AcceptCandidateResult,
  LoadedPortfolioExecution,
  PortfolioExecutionNotFoundError,
  PortfolioExecutionRevision,
  PortfolioExecutionSaveResult,
  type PortfolioExecutionRepository
} from "../../src";

describe("AcceptCandidateApplicationService", () => {
  it("loads the aggregate, accepts the candidate, saves it, and returns immutable domain outputs", async () => {
    const execution = createExecution();
    const repository = new RecordingPortfolioExecutionRepository(execution);
    const service = new AcceptCandidateApplicationService({ repository });
    const input = createInput();
    const acceptedArtifactId = new AcceptedArtifactId("accepted-artifact-1");
    let capturedCandidateId: CandidateId | undefined;
    let capturedAcceptedArtifactId: AcceptedArtifactId | undefined;
    let capturedCommandContext: PortfolioExecutionCommandContext | undefined;
    const originalAcceptCandidate = execution.acceptCandidate.bind(execution);
    execution.acceptCandidate = (candidateId, suppliedAcceptedArtifactId, suppliedCommandContext): ArtifactCandidateAcceptedFact => {
      capturedCandidateId = candidateId;
      capturedAcceptedArtifactId = suppliedAcceptedArtifactId;
      capturedCommandContext = suppliedCommandContext;
      return originalAcceptCandidate(candidateId, suppliedAcceptedArtifactId, suppliedCommandContext);
    };

    const result = await service.accept(input);

    expect(result.isSuccess).toBe(true);
    expect(repository.loadCount).toBe(1);
    expect(repository.saveCount).toBe(1);
    expect(repository.savedExecution).toBe(execution);
    expect(repository.savedRevision?.toJSON()).toBe(1);
    expect(capturedCandidateId?.equals(new CandidateId("candidate-1"))).toBe(true);
    expect(capturedAcceptedArtifactId?.equals(acceptedArtifactId)).toBe(true);
    expect(capturedCommandContext?.equals(input.commandContext)).toBe(true);
    expect(execution.findCandidate(new CandidateId("candidate-1"))?.lifecycle).toBe(ArtifactCandidateLifecycle.Accepted);
    expect(execution.findAcceptedArtifact(acceptedArtifactId)).toBeInstanceOf(AcceptedArtifact);

    const value = expectSuccess(result.value);
    expect(value).toBeInstanceOf(AcceptCandidateResult);
    expect(Object.isFrozen(value)).toBe(true);
    expect(value.fact).toBeInstanceOf(ArtifactCandidateAcceptedFact);
    expect(value.fact).toBe(result.value?.fact);
    expect(value.fact.toJSON()).toMatchObject({
      type: "ArtifactCandidateAccepted",
      executionId: "execution-1",
      candidateId: "candidate-1",
      acceptedArtifactId: "accepted-artifact-1",
      commandContext: input.commandContext.toJSON()
    });
    expect(value.correlationId).toBe(value.fact.commandContext.correlationId);
    expect(value.summary).toBeInstanceOf(PortfolioExecutionSummaryProjection);
    expect(value.summary.toJSON()).toMatchObject({
      executionId: "execution-1",
      lifecycle: PortfolioExecutionLifecycle.Active,
      acceptedArtifactCount: 1,
      factTypes: ["ArtifactCandidateAccepted"],
      candidatesByLifecycle: {
        Registered: 0,
        Accepted: 1,
        Rejected: 0
      }
    });
    expect(value.acceptedArtifactSummary).toBeInstanceOf(AcceptedArtifactSummaryProjection);
    expect(value.acceptedArtifactSummary.toJSON()).toEqual({
      id: "accepted-artifact-1"
    });
    expect(value.toJSON()).toEqual({
      summary: value.summary.toJSON(),
      acceptedArtifactSummary: value.acceptedArtifactSummary.toJSON(),
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
    const service = new AcceptCandidateApplicationService({ repository });

    const result = await service.accept(new AcceptCandidateInput({
      executionId: new ExecutionId("execution-1"),
      candidateId: new CandidateId("missing-candidate"),
      acceptedArtifactId: new AcceptedArtifactId("accepted-artifact-1"),
      commandContext: commandContext()
    }));

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnknownCandidateError);
    expect(repository.loadCount).toBe(1);
    expect(repository.saveCount).toBe(0);
    expect(execution.toJSON()).toEqual(before);
    expect(execution.acceptedArtifacts()).toHaveLength(0);
  });

  it("propagates invalid candidate lifecycle rejection and does not save", async () => {
    const execution = createExecution({
      candidates: [createCandidate("candidate-1", ArtifactCandidateLifecycle.Accepted)]
    });
    const before = execution.toJSON();
    const repository = new RecordingPortfolioExecutionRepository(execution);
    const service = new AcceptCandidateApplicationService({ repository });

    const result = await service.accept(createInput());

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(InvalidExecutionOperationError);
    expect(repository.loadCount).toBe(1);
    expect(repository.saveCount).toBe(0);
    expect(execution.toJSON()).toEqual(before);
    expect(execution.acceptedArtifacts()).toHaveLength(0);
  });

  it("propagates duplicate accepted artifact identity rejection and does not save", async () => {
    const execution = createExecution({
      acceptedArtifacts: [new AcceptedArtifact({ id: new AcceptedArtifactId("accepted-artifact-1") })]
    });
    const before = execution.toJSON();
    const repository = new RecordingPortfolioExecutionRepository(execution);
    const service = new AcceptCandidateApplicationService({ repository });

    const result = await service.accept(createInput());

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(DuplicateAcceptedArtifactError);
    expect(repository.loadCount).toBe(1);
    expect(repository.saveCount).toBe(0);
    expect(execution.toJSON()).toEqual(before);
    expect(execution.findCandidate(new CandidateId("candidate-1"))?.lifecycle).toBe(ArtifactCandidateLifecycle.Registered);
    expect(execution.acceptedArtifacts()).toHaveLength(1);
  });

  it("propagates invalid execution lifecycle rejection and does not save", async () => {
    const execution = createExecution({ lifecycle: PortfolioExecutionLifecycle.Initialized });
    const before = execution.toJSON();
    const repository = new RecordingPortfolioExecutionRepository(execution);
    const service = new AcceptCandidateApplicationService({ repository });

    const result = await service.accept(createInput());

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(InvalidExecutionOperationError);
    expect(repository.loadCount).toBe(1);
    expect(repository.saveCount).toBe(0);
    expect(execution.toJSON()).toEqual(before);
    expect(execution.acceptedArtifacts()).toHaveLength(0);
  });

  it("returns an application not-found failure and does not save when the aggregate is missing", async () => {
    const repository = new RecordingPortfolioExecutionRepository(undefined);
    const service = new AcceptCandidateApplicationService({ repository });

    const result = await service.accept(createInput());

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(PortfolioExecutionNotFoundError);
    expect(repository.loadCount).toBe(1);
    expect(repository.saveCount).toBe(0);
  });

  it("keeps the input and result immutable, deterministic, and value-comparable", async () => {
    const input = createInput();
    const equivalentInput = createInput();
    const execution = createExecution();
    const fact = execution.acceptCandidate(new CandidateId("candidate-1"), new AcceptedArtifactId("accepted-artifact-1"), commandContext());
    const acceptedArtifact = execution.findAcceptedArtifact(new AcceptedArtifactId("accepted-artifact-1"));
    if (acceptedArtifact === undefined) {
      throw new Error("Expected accepted artifact.");
    }
    const result = new AcceptCandidateResult({
      summary: PortfolioExecutionSummaryProjection.fromExecution(execution, [fact]),
      acceptedArtifactSummary: AcceptedArtifactSummaryProjection.fromAcceptedArtifact(acceptedArtifact),
      fact,
      correlationId: "correlation-1"
    });
    const equivalentResult = new AcceptCandidateResult({
      summary: PortfolioExecutionSummaryProjection.fromExecution(execution, [fact]),
      acceptedArtifactSummary: AcceptedArtifactSummaryProjection.fromAcceptedArtifact(acceptedArtifact),
      fact,
      correlationId: "correlation-1"
    });

    expect(Object.isFrozen(input)).toBe(true);
    expect(input.equals(equivalentInput)).toBe(true);
    expect(input.toJSON()).toEqual({
      executionId: "execution-1",
      candidateId: "candidate-1",
      acceptedArtifactId: "accepted-artifact-1",
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

  it("does not expose workflow, publishing, retry, policy, adapter, or acceptance helper behavior", async () => {
    const service = new AcceptCandidateApplicationService({
      repository: new RecordingPortfolioExecutionRepository(createExecution())
    });

    expect(service).not.toHaveProperty("publish");
    expect(service).not.toHaveProperty("retry");
    expect(service).not.toHaveProperty("evaluatePolicy");
    expect(service).not.toHaveProperty("beginTransaction");
    expect(service).not.toHaveProperty("handleHttp");
    expect(service).not.toHaveProperty("executeWorkflow");
    expect(service).not.toHaveProperty("recordAcceptedArtifact");
    expect(service).not.toHaveProperty("createAcceptedArtifact");
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

function createInput(): AcceptCandidateInput {
  return new AcceptCandidateInput({
    executionId: new ExecutionId("execution-1"),
    candidateId: new CandidateId("candidate-1"),
    acceptedArtifactId: new AcceptedArtifactId("accepted-artifact-1"),
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
