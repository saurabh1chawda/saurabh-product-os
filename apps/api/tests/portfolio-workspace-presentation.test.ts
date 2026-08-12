import { describe, expect, it } from "vitest";
import {
  AcceptCandidatePresentationRequest,
  ActivateWorkItemPresentationRequest,
  BeginExecutionPresentationRequest,
  CancelExecutionPresentationRequest,
  CancelWorkItemPresentationRequest,
  CompleteExecutionPresentationRequest,
  CompleteWorkItemPresentationRequest,
  DefaultPortfolioWorkspaceActorReferenceMapper,
  InitializeArtifactCandidatePresentationDefinition,
  InitializePortfolioExecutionPresentationRequest,
  InitializePortfolioWorkItemPresentationDefinition,
  PORTFOLIO_WORKSPACE_PRESENTATION_VERSION,
  PortfolioWorkspaceCommandContextFactory,
  PortfolioWorkspacePresentationContextErrorReason,
  PortfolioWorkspacePresentationErrorCategory,
  PortfolioWorkspacePresentationErrorCode,
  PortfolioWorkspacePresentationOutcome,
  PortfolioWorkspacePresentationPrincipal,
  PortfolioWorkspacePresentationPrincipalType,
  RejectCandidatePresentationRequest,
  createForbiddenPresentationError,
  createInvalidIdentifierPresentationError,
  createInvalidRequestPresentationError,
  createUnauthenticatedPresentationError,
  normalizePortfolioWorkspaceCorrelationId,
  mapAcceptCandidateResult,
  mapActivateWorkItemResult,
  mapBeginExecutionResult,
  mapCancelExecutionResult,
  mapCancelWorkItemResult,
  mapCompleteExecutionResult,
  mapCompleteWorkItemResult,
  mapInitializePortfolioExecutionRequestToInput,
  mapInitializePortfolioExecutionResult,
  mapPortfolioWorkspaceFailureToPresentationError,
  mapRejectCandidateResult
} from "../src";
import {
  PortfolioExecutionAlreadyExistsError,
  PortfolioExecutionConcurrencyConflictError,
  PortfolioExecutionNotFoundError,
  PortfolioExecutionPersistenceMappingError,
  PortfolioExecutionPersistenceUnavailableError,
  PortfolioExecutionRevision,
  UnsupportedPortfolioExecutionRecordVersionError,
  AcceptCandidateResult,
  ActivateWorkItemResult,
  BeginExecutionResult,
  CancelExecutionResult,
  CancelWorkItemResult,
  CompleteExecutionResult,
  CompleteWorkItemResult,
  InitializePortfolioExecutionInput,
  InitializePortfolioExecutionResult,
  RejectCandidateResult
} from "@career-companion/portfolio-workspace-application";
import {
  AcceptedArtifactId,
  AcceptedArtifactSummaryProjection,
  ApprovalReference,
  ArtifactCandidate,
  CandidateId,
  DuplicateAcceptedArtifactError,
  ExecutionId,
  InvalidExecutionOperationError,
  InvalidPortfolioWorkspaceIdentifierError,
  PlanSnapshotReference,
  PortfolioExecution,
  PortfolioExecutionCommandContext,
  PortfolioExecutionInitializedFact,
  PortfolioExecutionLifecycle,
  type PortfolioExecutionLifecycleValue,
  PortfolioExecutionSummaryProjection,
  PortfolioPlanReference,
  PortfolioWorkspaceAuthorizationResourceReference,
  PortfolioWorkItem,
  PortfolioWorkItemLifecycle,
  PortfolioWorkItemSummaryProjection,
  UnknownCandidateError,
  UnknownWorkItemError,
  WorkItemId
} from "@career-companion/portfolio-workspace";
import { mapExecutionSummaryProjection } from "../src/portfolio-workspace/presentation/responses";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

describe("Portfolio Workspace presentation requests", () => {
  it("keeps request contracts immutable and primitive-only", () => {
    const request = new AcceptCandidatePresentationRequest({
      executionId: "execution:one",
      candidateId: "candidate:one",
      acceptedArtifactId: "accepted-artifact:one",
      incomingCorrelationId: "correlation:incoming"
    });

    expect(Object.isFrozen(request)).toBe(true);
    expect(request.toJSON()).toEqual({
      executionId: "execution:one",
      candidateId: "candidate:one",
      acceptedArtifactId: "accepted-artifact:one",
      incomingCorrelationId: "correlation:incoming"
    });
    expect(JSON.stringify(request)).not.toContain("commandContext");
    expect(JSON.stringify(request)).not.toContain("actorReference");
  });

  it("defines requests for the nine implemented mutation intents only", () => {
    const requests = [
      new InitializePortfolioExecutionPresentationRequest({
        executionId: "execution:initialize",
        portfolioPlanReference: {
          planId: "plan:initialize",
          roadmapId: "roadmap:initialize",
          planArtifactReference: "artifact:initialize"
        },
        planSnapshotReference: {
          snapshotReference: "snapshot:initialize"
        },
        approvalReference: {
          approvalReference: "approval:initialize"
        },
        initialWorkItems: [{ workItemId: "work-item:initialize" }],
        initialCandidates: [{ candidateId: "candidate:initialize" }]
      }),
      new BeginExecutionPresentationRequest({ executionId: "execution:one" }),
      new ActivateWorkItemPresentationRequest({ executionId: "execution:one", workItemId: "work-item:one" }),
      new CompleteWorkItemPresentationRequest({ executionId: "execution:one", workItemId: "work-item:one" }),
      new CancelWorkItemPresentationRequest({ executionId: "execution:one", workItemId: "work-item:one" }),
      new AcceptCandidatePresentationRequest({
        executionId: "execution:one",
        candidateId: "candidate:one",
        acceptedArtifactId: "accepted-artifact:one"
      }),
      new RejectCandidatePresentationRequest({ executionId: "execution:one", candidateId: "candidate:one" }),
      new CompleteExecutionPresentationRequest({ executionId: "execution:one" }),
      new CancelExecutionPresentationRequest({ executionId: "execution:one" })
    ];

    for (const request of requests) {
      expect(Object.isFrozen(request)).toBe(true);
      expect(JSON.stringify(request)).not.toContain("commandId");
      expect(JSON.stringify(request)).not.toContain("occurredAt");
      expect(JSON.stringify(request)).not.toContain("session");
      expect(JSON.stringify(request)).not.toContain("token");
    }
  });

  it("keeps initialization request data primitive, immutable, and defensively copied", () => {
    const workItems = [{ workItemId: "work-item:first" }];
    const candidates = [{ candidateId: "candidate:first" }];
    const request = new InitializePortfolioExecutionPresentationRequest({
      executionId: "execution:init",
      portfolioPlanReference: {
        planId: "plan:init",
        roadmapId: "roadmap:init",
        planArtifactReference: "artifact:init"
      },
      planSnapshotReference: {
        snapshotReference: "snapshot:init"
      },
      approvalReference: {
        approvalReference: "approval:init"
      },
      initialWorkItems: workItems,
      initialCandidates: candidates,
      incomingCorrelationId: "correlation:init"
    });

    workItems.push({ workItemId: "work-item:mutated" });
    candidates[0] = { candidateId: "candidate:mutated" };

    expect(Object.isFrozen(request)).toBe(true);
    expect(Object.isFrozen(request.initialWorkItems)).toBe(true);
    expect(Object.isFrozen(request.initialWorkItems[0])).toBe(true);
    expect(Object.isFrozen(request.initialCandidates)).toBe(true);
    expect(Object.isFrozen(request.initialCandidates[0])).toBe(true);
    expect(request.initialWorkItems).toHaveLength(1);
    expect(request.initialCandidates[0]?.candidateId).toBe("candidate:first");
    expect(request.toJSON()).toEqual({
      executionId: "execution:init",
      portfolioPlanReference: {
        planId: "plan:init",
        roadmapId: "roadmap:init",
        planArtifactReference: "artifact:init"
      },
      planSnapshotReference: {
        snapshotReference: "snapshot:init"
      },
      approvalReference: {
        approvalReference: "approval:init"
      },
      initialWorkItems: [{ workItemId: "work-item:first" }],
      initialCandidates: [{ candidateId: "candidate:first" }],
      incomingCorrelationId: "correlation:init"
    });
    expect(JSON.stringify(request)).not.toContain("commandContext");
    expect(JSON.stringify(request)).not.toContain("actorReference");
    expect(JSON.stringify(request)).not.toContain("lifecycle");
    expect(JSON.stringify(request)).not.toContain("acceptedArtifact");
    expect(JSON.stringify(request)).not.toContain("token");
  });

  it("rejects malformed initialization collection entries at the presentation contract boundary", () => {
    expect(() => new InitializePortfolioWorkItemPresentationDefinition({
      workItemId: 12 as unknown as string
    })).toThrow(TypeError);
    expect(() => new InitializeArtifactCandidatePresentationDefinition({
      candidateId: {} as unknown as string
    })).toThrow(TypeError);
    expect(() => new InitializePortfolioExecutionPresentationRequest({
      executionId: "execution:init",
      portfolioPlanReference: {
        planId: "plan:init",
        roadmapId: "roadmap:init",
        planArtifactReference: "artifact:init"
      },
      planSnapshotReference: {
        snapshotReference: "snapshot:init"
      },
      approvalReference: {
        approvalReference: "approval:init"
      },
      initialWorkItems: [null as unknown as { readonly workItemId: string }]
    })).toThrow(TypeError);
  });
});

describe("Portfolio Workspace presentation success mapping", () => {
  it("maps all nine Application Results to versioned presentation responses without raw facts", () => {
    const mapped = [
      mapInitializePortfolioExecutionResult(initializePortfolioExecutionResult()),
      mapBeginExecutionResult(beginExecutionResult()),
      mapActivateWorkItemResult(activateWorkItemResult()),
      mapCompleteWorkItemResult(completeWorkItemResult()),
      mapCancelWorkItemResult(cancelWorkItemResult()),
      mapAcceptCandidateResult(acceptCandidateResult()),
      mapRejectCandidateResult(rejectCandidateResult()),
      mapCompleteExecutionResult(completeExecutionResult()),
      mapCancelExecutionResult(cancelExecutionResult())
    ];

    expect(mapped.map((response) => response.outcome)).toEqual([
      PortfolioWorkspacePresentationOutcome.ExecutionInitialized,
      PortfolioWorkspacePresentationOutcome.ExecutionStarted,
      PortfolioWorkspacePresentationOutcome.WorkItemActivated,
      PortfolioWorkspacePresentationOutcome.WorkItemCompleted,
      PortfolioWorkspacePresentationOutcome.WorkItemCancelled,
      PortfolioWorkspacePresentationOutcome.CandidateAccepted,
      PortfolioWorkspacePresentationOutcome.CandidateRejected,
      PortfolioWorkspacePresentationOutcome.ExecutionCompleted,
      PortfolioWorkspacePresentationOutcome.ExecutionCancelled
    ]);

    for (const response of mapped) {
      expect(response.version).toBe(PORTFOLIO_WORKSPACE_PRESENTATION_VERSION);
      expect(response.correlationId).toMatch(/^correlation:/);
      expect(Object.isFrozen(response)).toBe(true);
      expect(response.execution.executionId).toMatch(/^execution:/);
      expect(JSON.stringify(response)).not.toContain("commandContext");
      expect(JSON.stringify(response)).not.toContain("actorReference");
      expect(response).not.toHaveProperty("fact");
      expect(response.execution).not.toHaveProperty("factTypes");
      expect(JSON.stringify(response)).not.toContain("revision");
      expect(response).not.toHaveProperty("summary");
    }
  });

  it("maps initialized fact types in execution summaries and supports the initialization response contract", () => {
    const summary = PortfolioExecutionSummaryProjection.fromExecution(executionFixture("initialized", PortfolioExecutionLifecycle.Initialized), [
      new PortfolioExecutionInitializedFact({
        executionId: new ExecutionId("execution:initialized"),
        portfolioPlanReference: new PortfolioPlanReference({
          planId: "plan:initialized",
          roadmapId: "roadmap:initialized",
          planArtifactReference: "artifact:initialized"
        }),
        planSnapshotReference: new PlanSnapshotReference({
          snapshotReference: "snapshot:initialized"
        }),
        approvalReference: new ApprovalReference({
          approvalReference: "approval:initialized"
        }),
        authorizationResourceReference: authorizationResourceReference(),
        commandContext: commandContext("initialized")
      })
    ]);
    const response = mapExecutionSummaryProjection(summary.toJSON());
    const initializedResponse = mapInitializePortfolioExecutionResult(initializePortfolioExecutionResult());

    expect(response.outcomes).toEqual([PortfolioWorkspacePresentationOutcome.ExecutionInitialized]);
    expect(initializedResponse.outcome).toBe(PortfolioWorkspacePresentationOutcome.ExecutionInitialized);
    expect(PortfolioWorkspacePresentationOutcome.ExecutionInitialized).toBe("execution-initialized");
  });

  it("maps approved work item and accepted artifact summaries without exposing entities", () => {
    const activated = mapActivateWorkItemResult(activateWorkItemResult());
    const cancelled = mapCancelWorkItemResult(cancelWorkItemResult());
    const accepted = mapAcceptCandidateResult(acceptCandidateResult());

    expect(activated.workItem).toEqual({
      id: "work-item:activate",
      lifecycle: PortfolioWorkItemLifecycle.Active
    });
    expect(cancelled.workItem).toEqual({
      id: "work-item:cancel",
      lifecycle: PortfolioWorkItemLifecycle.Cancelled
    });
    expect(accepted.acceptedArtifact).toEqual({
      id: "accepted-artifact:accept"
    });
    expect(accepted).not.toHaveProperty("candidate");
  });

  it("does not mutate Application Results while mapping", () => {
    const result = beginExecutionResult();
    const before = result.toJSON();

    mapBeginExecutionResult(result);

    expect(result.toJSON()).toEqual(before);
  });
});

describe("Portfolio Workspace presentation error mapping", () => {
  it("maps explicit input and auth boundary errors without transport status", () => {
    const invalidRequest = createInvalidRequestPresentationError({
      correlationId: "correlation:error",
      issues: [{
        field: "executionId",
        code: PortfolioWorkspacePresentationErrorCode.InvalidRequest,
        message: "Field is required."
      }]
    });
    const invalidIdentifier = createInvalidIdentifierPresentationError({
      correlationId: "correlation:error",
      field: "executionId"
    });
    const unauthenticated = createUnauthenticatedPresentationError("correlation:error");
    const forbidden = createForbiddenPresentationError("correlation:error");

    expect(invalidRequest.toJSON()).toMatchObject({
      version: "v1",
      category: PortfolioWorkspacePresentationErrorCategory.InvalidInput,
      code: PortfolioWorkspacePresentationErrorCode.InvalidRequest,
      retryable: false
    });
    expect(invalidIdentifier.toJSON().issues?.[0]?.field).toBe("executionId");
    expect(unauthenticated.category).toBe(PortfolioWorkspacePresentationErrorCategory.Unauthenticated);
    expect(forbidden.category).toBe(PortfolioWorkspacePresentationErrorCategory.Forbidden);
    expect(invalidRequest.toJSON()).not.toHaveProperty("status");
  });

  it("maps Application, Domain, Repository, and unknown failures safely", () => {
    const executionId = new ExecutionId("execution:error");
    const mapped = [
      mapPortfolioWorkspaceFailureToPresentationError(new PortfolioExecutionNotFoundError(executionId), "correlation:error"),
      mapPortfolioWorkspaceFailureToPresentationError(new UnknownWorkItemError(), "correlation:error"),
      mapPortfolioWorkspaceFailureToPresentationError(new UnknownCandidateError(), "correlation:error"),
      mapPortfolioWorkspaceFailureToPresentationError(new DuplicateAcceptedArtifactError(), "correlation:error"),
      mapPortfolioWorkspaceFailureToPresentationError(new InvalidExecutionOperationError(), "correlation:error"),
      mapPortfolioWorkspaceFailureToPresentationError(new PortfolioExecutionConcurrencyConflictError({
        executionId,
        expectedRevision: new PortfolioExecutionRevision(1),
        actualRevision: new PortfolioExecutionRevision(2)
      }), "correlation:error"),
      mapPortfolioWorkspaceFailureToPresentationError(new PortfolioExecutionAlreadyExistsError({
        executionId,
        currentRevision: new PortfolioExecutionRevision(1)
      }), "correlation:error"),
      mapPortfolioWorkspaceFailureToPresentationError(new PortfolioExecutionPersistenceUnavailableError(), "correlation:error"),
      mapPortfolioWorkspaceFailureToPresentationError(new PortfolioExecutionPersistenceMappingError(), "correlation:error"),
      mapPortfolioWorkspaceFailureToPresentationError(new UnsupportedPortfolioExecutionRecordVersionError(99), "correlation:error"),
      mapPortfolioWorkspaceFailureToPresentationError(new InvalidPortfolioWorkspaceIdentifierError("ExecutionId"), "correlation:error"),
      mapPortfolioWorkspaceFailureToPresentationError(new Error("SQLSTATE 23505 password secret stack"), "correlation:error")
    ];

    expect(mapped.map((error) => error.code)).toEqual([
      PortfolioWorkspacePresentationErrorCode.PortfolioExecutionNotFound,
      PortfolioWorkspacePresentationErrorCode.WorkItemNotFound,
      PortfolioWorkspacePresentationErrorCode.CandidateNotFound,
      PortfolioWorkspacePresentationErrorCode.AcceptedArtifactConflict,
      PortfolioWorkspacePresentationErrorCode.ExecutionOperationNotAllowed,
      PortfolioWorkspacePresentationErrorCode.PortfolioExecutionConcurrencyConflict,
      PortfolioWorkspacePresentationErrorCode.PortfolioExecutionAlreadyExists,
      PortfolioWorkspacePresentationErrorCode.PortfolioWorkspacePersistenceUnavailable,
      PortfolioWorkspacePresentationErrorCode.PortfolioWorkspacePersistenceCorrupt,
      PortfolioWorkspacePresentationErrorCode.PortfolioWorkspaceRecordVersionUnsupported,
      PortfolioWorkspacePresentationErrorCode.InvalidIdentifier,
      PortfolioWorkspacePresentationErrorCode.PortfolioWorkspaceInternalError
    ]);

    for (const error of mapped) {
      const serialized = JSON.stringify(error);
      expect(error.version).toBe("v1");
      expect(error.correlationId).toBe("correlation:error");
      expect(error.retryable).toBe(false);
      expect(serialized).not.toContain("SQLSTATE");
      expect(serialized).not.toContain("password");
      expect(serialized).not.toContain("stack");
      expect(serialized).not.toContain("expectedRevision");
      expect(serialized).not.toContain("actualRevision");
      expect(serialized).not.toContain("cause");
    }
  });
});

describe("Portfolio Workspace presentation trusted command context mapping", () => {
  it("validates trusted principals without accepting auth provider internals", () => {
    const principalResult = PortfolioWorkspacePresentationPrincipal.create({
      principalId: "user-123",
      principalType: PortfolioWorkspacePresentationPrincipalType.User,
      authenticationProvider: "career-auth",
      displayName: "Saurabh"
    });

    expect(principalResult.isSuccess).toBe(true);
    const principal = principalResult.value as PortfolioWorkspacePresentationPrincipal;

    expect(Object.isFrozen(principal)).toBe(true);
    expect(principal.toJSON()).toEqual({
      principalId: "user-123",
      principalType: "user",
      authenticationProvider: "career-auth",
      displayName: "Saurabh"
    });
    expect(JSON.stringify(principal)).not.toContain("token");
    expect(JSON.stringify(principal)).not.toContain("claims");

    const invalidPrincipal = PortfolioWorkspacePresentationPrincipal.create({
      principalId: " ",
      principalType: PortfolioWorkspacePresentationPrincipalType.User,
      authenticationProvider: "career-auth"
    });

    expect(invalidPrincipal.isFailure).toBe(true);
    expect(invalidPrincipal.error?.reason).toBe(PortfolioWorkspacePresentationContextErrorReason.InvalidPrincipal);
  });

  it("maps authenticated principals to deterministic actor references", () => {
    const principal = trustedPrincipal();
    const mapper = new DefaultPortfolioWorkspaceActorReferenceMapper();
    const mapped = mapper.map(principal);

    expect(mapped.isSuccess).toBe(true);
    expect(mapped.value).toBe("user:career-auth:user-123");

    const mappedAgain = mapper.map(principal);

    expect(mappedAgain.value).toBe(mapped.value);
  });

  it("normalizes safe correlation hints and falls back to a trusted generator for unsafe hints", () => {
    const accepted = normalizePortfolioWorkspaceCorrelationId({
      incomingCorrelationId: " correlation:incoming-1 ",
      generator: { generate: () => "correlation:generated" }
    });
    const generated = normalizePortfolioWorkspaceCorrelationId({
      incomingCorrelationId: "bad value with spaces",
      generator: { generate: () => "correlation:generated" }
    });

    expect(accepted.isSuccess).toBe(true);
    expect(accepted.value).toBe("correlation:incoming-1");
    expect(generated.isSuccess).toBe(true);
    expect(generated.value).toBe("correlation:generated");

    const failed = normalizePortfolioWorkspaceCorrelationId({
      incomingCorrelationId: "\n",
      generator: { generate: () => "bad generated value" }
    });

    expect(failed.isFailure).toBe(true);
    expect(failed.error?.reason).toBe(PortfolioWorkspacePresentationContextErrorReason.CorrelationIdGenerationFailed);
  });

  it("creates immutable domain command context from trusted principal, generators, and host clock", () => {
    const factory = new PortfolioWorkspaceCommandContextFactory({
      commandIdGenerator: { generate: () => "command:presentation-1" },
      correlationIdGenerator: { generate: () => "correlation:generated" },
      clock: { now: () => new Date("2026-08-05T10:30:00.000Z") }
    });

    const result = factory.createCommandContext({
      principal: trustedPrincipal(),
      incomingCorrelationId: "correlation:incoming-1"
    });

    expect(result.isSuccess).toBe(true);
    const context = result.value as PortfolioExecutionCommandContext;

    expect(context).toBeInstanceOf(PortfolioExecutionCommandContext);
    expect(Object.isFrozen(factory)).toBe(true);
    expect(context.toJSON()).toEqual({
      commandId: "command:presentation-1",
      correlationId: "correlation:incoming-1",
      actorReference: "user:career-auth:user-123",
      occurredAt: "2026-08-05T10:30:00.000Z"
    });
  });

  it("derives a fresh operation context per factory call without leaking previous metadata", () => {
    let sequence = 0;
    const factory = new PortfolioWorkspaceCommandContextFactory({
      commandIdGenerator: { generate: () => `command:${++sequence}` },
      correlationIdGenerator: { generate: () => `correlation:${sequence}` },
      clock: { now: () => new Date(`2026-08-05T10:30:0${sequence}.000Z`) }
    });

    const first = factory.createCommandContext({ principal: trustedPrincipal() });
    const second = factory.createCommandContext({ principal: trustedServicePrincipal() });

    expect(first.isSuccess).toBe(true);
    expect(second.isSuccess).toBe(true);
    expect(first.value?.toJSON()).toEqual({
      commandId: "command:1",
      correlationId: "correlation:1",
      actorReference: "user:career-auth:user-123",
      occurredAt: "2026-08-05T10:30:01.000Z"
    });
    expect(second.value?.toJSON()).toEqual({
      commandId: "command:2",
      correlationId: "correlation:2",
      actorReference: "service:career-auth:service-123",
      occurredAt: "2026-08-05T10:30:02.000Z"
    });
  });

  it("returns safe mapping failures without exposing secrets or vendor details", () => {
    const failedCommandId = new PortfolioWorkspaceCommandContextFactory({
      commandIdGenerator: { generate: () => "bad command id" },
      correlationIdGenerator: { generate: () => "correlation:generated" },
      clock: { now: () => new Date("2026-08-05T10:30:00.000Z") }
    }).createCommandContext({ principal: trustedPrincipal() });
    const failedClock = new PortfolioWorkspaceCommandContextFactory({
      commandIdGenerator: { generate: () => "command:presentation-1" },
      correlationIdGenerator: { generate: () => "correlation:generated" },
      clock: { now: () => new Date("not-a-date") }
    }).createCommandContext({ principal: trustedPrincipal() });

    expect(failedCommandId.isFailure).toBe(true);
    expect(failedCommandId.error?.reason).toBe(PortfolioWorkspacePresentationContextErrorReason.CommandIdGenerationFailed);
    expect(failedClock.isFailure).toBe(true);
    expect(failedClock.error?.reason).toBe(PortfolioWorkspacePresentationContextErrorReason.ClockFailed);

    for (const failure of [failedCommandId.error, failedClock.error]) {
      expect(Object.isFrozen(failure)).toBe(true);
      expect(JSON.stringify(failure)).not.toContain("password");
      expect(JSON.stringify(failure)).not.toContain("SQLSTATE");
      expect(JSON.stringify(failure)).not.toContain("stack");
      expect(JSON.stringify(failure)).not.toContain("cause");
    }
  });
});

describe("Portfolio Workspace initialization presentation mapping", () => {
  it("maps trusted primitive initialization requests to Application input without mutating the request", () => {
    const request = initializationRequestFixture();
    const trustedContext = commandContext("presentation-initialize");
    const trustedAuthorizationResource = authorizationResourceReference();
    const before = request.toJSON();

    const result = mapInitializePortfolioExecutionRequestToInput(request, trustedContext, trustedAuthorizationResource, "correlation:host");

    expect(result.isSuccess).toBe(true);
    const input = result.value as InitializePortfolioExecutionInput;

    expect(input).toBeInstanceOf(InitializePortfolioExecutionInput);
    expect(input.commandContext).toBe(trustedContext);
    expect(input.toJSON()).toEqual({
      executionId: "execution:init",
      portfolioPlanReference: {
        planId: "plan:init",
        roadmapId: "roadmap:init",
        planArtifactReference: "artifact:init"
      },
      planSnapshotReference: {
        snapshotReference: "snapshot:init"
      },
      approvalReference: {
        approvalReference: "approval:init"
      },
      authorizationResourceReference: trustedAuthorizationResource.toJSON(),
      commandContext: trustedContext.toJSON(),
      workItems: [
        { workItemId: "work-item:first" },
        { workItemId: "work-item:second" }
      ],
      candidates: [
        { candidateId: "candidate:first" },
        { candidateId: "candidate:second" }
      ]
    });
    expect(request.toJSON()).toEqual(before);
  });

  it("preserves A15.2 trusted command context and ignores client-controlled context-shaped fields", () => {
    const factory = new PortfolioWorkspaceCommandContextFactory({
      commandIdGenerator: { generate: () => "command:trusted" },
      correlationIdGenerator: { generate: () => "correlation:generated" },
      clock: { now: () => new Date("2026-08-05T10:30:00.000Z") }
    });
    const contextResult = factory.createCommandContext({
      principal: trustedPrincipal(),
      incomingCorrelationId: "correlation:trusted"
    });
    expect(contextResult.isSuccess).toBe(true);

    const request = new InitializePortfolioExecutionPresentationRequest({
      ...initializationRequestFixture().toJSON(),
      commandId: "command:client",
      actorReference: "actor:client",
      occurredAt: "1999-01-01T00:00:00.000Z",
      authorizationResourceReference: "portfolio-workspace:client-spoof"
    } as unknown as ConstructorParameters<typeof InitializePortfolioExecutionPresentationRequest>[0]);
    const trustedAuthorizationResource = authorizationResourceReference();
    const result = mapInitializePortfolioExecutionRequestToInput(
      request,
      contextResult.value as PortfolioExecutionCommandContext,
      trustedAuthorizationResource,
      "correlation:host"
    );

    expect(result.isSuccess).toBe(true);
    expect((result.value as InitializePortfolioExecutionInput).commandContext.toJSON()).toEqual({
      commandId: "command:trusted",
      correlationId: "correlation:trusted",
      actorReference: "user:career-auth:user-123",
      occurredAt: "2026-08-05T10:30:00.000Z"
    });
    expect((result.value as InitializePortfolioExecutionInput).authorizationResourceReference).toBe(trustedAuthorizationResource);
    expect(JSON.stringify(request)).not.toContain("command:client");
    expect(JSON.stringify(request)).not.toContain("actor:client");
    expect(JSON.stringify(request)).not.toContain("1999-01-01");
    expect(JSON.stringify(request)).not.toContain("client-spoof");
  });

  it("maps invalid initialization identifiers and source references to safe presentation errors", () => {
    const cases = [
      {
        request: new InitializePortfolioExecutionPresentationRequest({
          ...initializationRequestFixture().toJSON(),
          executionId: " "
        }),
        field: "executionId"
      },
      {
        request: new InitializePortfolioExecutionPresentationRequest({
          ...initializationRequestFixture().toJSON(),
          portfolioPlanReference: {
            planId: " ",
            roadmapId: "roadmap:init",
            planArtifactReference: "artifact:init"
          }
        }),
        field: "portfolioPlanReference"
      },
      {
        request: new InitializePortfolioExecutionPresentationRequest({
          ...initializationRequestFixture().toJSON(),
          initialWorkItems: [{ workItemId: " " }]
        }),
        field: "initialWorkItems[0].workItemId"
      },
      {
        request: new InitializePortfolioExecutionPresentationRequest({
          ...initializationRequestFixture().toJSON(),
          initialCandidates: [{ candidateId: " " }]
        }),
        field: "initialCandidates[0].candidateId"
      }
    ];

    for (const item of cases) {
      const result = mapInitializePortfolioExecutionRequestToInput(item.request, commandContext("invalid-init"), authorizationResourceReference(), "correlation:host");

      expect(result.isFailure).toBe(true);
      expect(result.error?.toJSON()).toMatchObject({
        category: PortfolioWorkspacePresentationErrorCategory.InvalidInput,
        code: PortfolioWorkspacePresentationErrorCode.InvalidInitializationRequest,
        correlationId: "correlation:host",
        retryable: false
      });
      expect(result.error?.issues?.[0]?.field).toBe(item.field);
      expect(JSON.stringify(result.error)).not.toContain("cannot be empty");
      expect(JSON.stringify(result.error)).not.toContain("SQLSTATE");
      expect(JSON.stringify(result.error)).not.toContain("password");
    }
  });
});

describe("Portfolio Workspace presentation boundaries", () => {
  it("keeps the presentation module free of infrastructure, runtime, and framework dependencies", () => {
    const source = readSource(portfolioWorkspacePresentationSourcePath());

    expect(source).not.toContain("@career-companion/infrastructure");
    expect(source).not.toContain("drizzle");
    expect(source).not.toContain("pg");
    expect(source).not.toContain("next/");
    expect(source).not.toContain("express");
    expect(source).not.toContain("process.env");
    expect(source).not.toContain("PortfolioWorkspaceRuntime");
    expect(source).not.toContain("PostgresPortfolioExecutionRepository");
    expect(source).not.toContain("PortfolioExecutionRepository ");
    expect(source).not.toContain("PortfolioExecutionRepository;");
  });

  it("constructs PortfolioExecutionCommandContext only in the approved presentation factory", () => {
    const sourceEntries = sourceEntriesByFile(portfolioWorkspacePresentationSourcePath());
    const constructionFiles = sourceEntries
      .filter((entry) => entry.source.includes("new PortfolioExecutionCommandContext"))
      .map((entry) => entry.file);

    expect(constructionFiles).toEqual(["command-context.ts"]);
  });

  it("exposes initialization and get-by-id contracts without exposing list/search contracts from the public API", async () => {
    const api = await import("../src");

    expect(api).not.toHaveProperty("CreatePortfolioExecutionPresentationRequest");
    expect(api).toHaveProperty("InitializePortfolioExecutionPresentationRequest");
    expect(api).toHaveProperty("mapInitializePortfolioExecutionRequestToInput");
    expect(api).toHaveProperty("mapInitializePortfolioExecutionResult");
    expect(api).toHaveProperty("GetPortfolioExecutionPresentationRequest");
    expect(api).toHaveProperty("mapGetPortfolioExecutionRequestToInput");
    expect(api).toHaveProperty("mapGetPortfolioExecutionResult");
    expect(api).not.toHaveProperty("ListPortfolioExecutionsPresentationRequest");
  });

  it("does not initialize aggregates, construct supporting entities, or call services in presentation source", () => {
    const source = readSource(portfolioWorkspacePresentationSourcePath());

    expect(source).not.toContain("PortfolioExecution.initialize");
    expect(source).not.toContain("new PortfolioExecution(");
    expect(source).not.toContain("new PortfolioWorkItem(");
    expect(source).not.toContain("new ArtifactCandidate(");
    expect(source).not.toContain("InitializePortfolioExecutionApplicationService");
    expect(source).not.toContain(".initialize(");
    expect(source).not.toContain("idempotency");
    expect(source).not.toContain("authorizeInitialize");
    expect(source).not.toContain("authorizeGet");
    expect(source).not.toContain("raw fact");
  });
});

function trustedPrincipal(): PortfolioWorkspacePresentationPrincipal {
  const result = PortfolioWorkspacePresentationPrincipal.create({
    principalId: "user-123",
    principalType: PortfolioWorkspacePresentationPrincipalType.User,
    authenticationProvider: "career-auth"
  });

  if (result.isFailure || result.value === undefined) {
    throw new Error("Expected trusted principal fixture.");
  }

  return result.value;
}

function trustedServicePrincipal(): PortfolioWorkspacePresentationPrincipal {
  const result = PortfolioWorkspacePresentationPrincipal.create({
    principalId: "service-123",
    principalType: PortfolioWorkspacePresentationPrincipalType.Service,
    authenticationProvider: "career-auth"
  });

  if (result.isFailure || result.value === undefined) {
    throw new Error("Expected trusted service principal fixture.");
  }

  return result.value;
}

function initializationRequestFixture(): InitializePortfolioExecutionPresentationRequest {
  return new InitializePortfolioExecutionPresentationRequest({
    executionId: "execution:init",
    portfolioPlanReference: {
      planId: "plan:init",
      roadmapId: "roadmap:init",
      planArtifactReference: "artifact:init"
    },
    planSnapshotReference: {
      snapshotReference: "snapshot:init"
    },
    approvalReference: {
      approvalReference: "approval:init"
    },
    initialWorkItems: [
      { workItemId: "work-item:first" },
      { workItemId: "work-item:second" }
    ],
    initialCandidates: [
      { candidateId: "candidate:first" },
      { candidateId: "candidate:second" }
    ],
    incomingCorrelationId: "correlation:init"
  });
}

function initializePortfolioExecutionResult(): InitializePortfolioExecutionResult {
  const initialized = PortfolioExecution.initialize({
    id: new ExecutionId("execution:initialize"),
    portfolioPlanReference: new PortfolioPlanReference({
      planId: "plan:initialize",
      roadmapId: "roadmap:initialize",
      planArtifactReference: "artifact:initialize"
    }),
    planSnapshotReference: new PlanSnapshotReference({
      snapshotReference: "snapshot:initialize"
    }),
    approvalReference: new ApprovalReference({
      approvalReference: "approval:initialize"
    }),
    authorizationResourceReference: authorizationResourceReference(),
    commandContext: commandContext("initialize"),
    workItems: [new PortfolioWorkItem({
      id: new WorkItemId("work-item:initialize"),
      lifecycle: PortfolioWorkItemLifecycle.Pending
    })],
    candidates: [new ArtifactCandidate({
      id: new CandidateId("candidate:initialize"),
      lifecycle: "Registered"
    })]
  });

  return new InitializePortfolioExecutionResult({
    summary: PortfolioExecutionSummaryProjection.fromExecution(initialized.execution, [initialized.fact]),
    fact: initialized.fact,
    correlationId: initialized.fact.commandContext.correlationId
  });
}

function beginExecutionResult(): BeginExecutionResult {
  const execution = executionFixture("begin", PortfolioExecutionLifecycle.Initialized);
  const fact = execution.beginExecution(commandContext("begin"));

  return new BeginExecutionResult({
    summary: PortfolioExecutionSummaryProjection.fromExecution(execution, [fact]),
    fact,
    correlationId: fact.commandContext.correlationId
  });
}

function activateWorkItemResult(): ActivateWorkItemResult {
  const workItemId = new WorkItemId("work-item:activate");
  const execution = executionFixture("activate", PortfolioExecutionLifecycle.Active, {
    workItems: [new PortfolioWorkItem({
      id: workItemId,
      lifecycle: PortfolioWorkItemLifecycle.Pending
    })]
  });
  const fact = execution.activateWorkItem(workItemId, commandContext("activate"));
  const workItem = execution.findWorkItem(workItemId);

  if (workItem === undefined) {
    throw new Error("Missing activated work item.");
  }

  return new ActivateWorkItemResult({
    summary: PortfolioExecutionSummaryProjection.fromExecution(execution, [fact]),
    workItemSummary: PortfolioWorkItemSummaryProjection.fromWorkItem(workItem),
    fact,
    correlationId: fact.commandContext.correlationId
  });
}

function completeWorkItemResult(): CompleteWorkItemResult {
  const workItemId = new WorkItemId("work-item:complete");
  const execution = executionFixture("complete-work-item", PortfolioExecutionLifecycle.Active, {
    workItems: [new PortfolioWorkItem({
      id: workItemId,
      lifecycle: PortfolioWorkItemLifecycle.Active
    })]
  });
  const fact = execution.completeWorkItem(workItemId, commandContext("complete-work-item"));

  return new CompleteWorkItemResult({
    summary: PortfolioExecutionSummaryProjection.fromExecution(execution, [fact]),
    fact,
    correlationId: fact.commandContext.correlationId
  });
}

function cancelWorkItemResult(): CancelWorkItemResult {
  const workItemId = new WorkItemId("work-item:cancel");
  const execution = executionFixture("cancel-work-item", PortfolioExecutionLifecycle.Active, {
    workItems: [new PortfolioWorkItem({
      id: workItemId,
      lifecycle: PortfolioWorkItemLifecycle.Pending
    })]
  });
  const fact = execution.cancelWorkItem(workItemId, commandContext("cancel-work-item"));
  const workItem = execution.findWorkItem(workItemId);

  if (workItem === undefined) {
    throw new Error("Missing cancelled work item.");
  }

  return new CancelWorkItemResult({
    summary: PortfolioExecutionSummaryProjection.fromExecution(execution, [fact]),
    workItemSummary: PortfolioWorkItemSummaryProjection.fromWorkItem(workItem),
    fact,
    correlationId: fact.commandContext.correlationId
  });
}

function acceptCandidateResult(): AcceptCandidateResult {
  const candidateId = new CandidateId("candidate:accept");
  const acceptedArtifactId = new AcceptedArtifactId("accepted-artifact:accept");
  const execution = executionFixture("accept", PortfolioExecutionLifecycle.Active, {
    candidates: [new ArtifactCandidate({
      id: candidateId,
      lifecycle: "Registered"
    })]
  });
  const fact = execution.acceptCandidate(candidateId, acceptedArtifactId, commandContext("accept"));
  const acceptedArtifact = execution.findAcceptedArtifact(acceptedArtifactId);

  if (acceptedArtifact === undefined) {
    throw new Error("Missing accepted artifact.");
  }

  return new AcceptCandidateResult({
    summary: PortfolioExecutionSummaryProjection.fromExecution(execution, [fact]),
    acceptedArtifactSummary: AcceptedArtifactSummaryProjection.fromAcceptedArtifact(acceptedArtifact),
    fact,
    correlationId: fact.commandContext.correlationId
  });
}

function rejectCandidateResult(): RejectCandidateResult {
  const candidateId = new CandidateId("candidate:reject");
  const execution = executionFixture("reject", PortfolioExecutionLifecycle.Active, {
    candidates: [new ArtifactCandidate({
      id: candidateId,
      lifecycle: "Registered"
    })]
  });
  const fact = execution.rejectCandidate(candidateId, commandContext("reject"));

  return new RejectCandidateResult({
    summary: PortfolioExecutionSummaryProjection.fromExecution(execution, [fact]),
    fact,
    correlationId: fact.commandContext.correlationId
  });
}

function completeExecutionResult(): CompleteExecutionResult {
  const execution = executionFixture("complete-execution", PortfolioExecutionLifecycle.Active, {
    workItems: [new PortfolioWorkItem({
      id: new WorkItemId("work-item:complete-execution"),
      lifecycle: PortfolioWorkItemLifecycle.Completed
    })]
  });
  const fact = execution.completeExecution(commandContext("complete-execution"));

  return new CompleteExecutionResult({
    summary: PortfolioExecutionSummaryProjection.fromExecution(execution, [fact]),
    fact,
    correlationId: fact.commandContext.correlationId
  });
}

function cancelExecutionResult(): CancelExecutionResult {
  const execution = executionFixture("cancel-execution", PortfolioExecutionLifecycle.Active);
  const fact = execution.cancelExecution(commandContext("cancel-execution"));

  return new CancelExecutionResult({
    summary: PortfolioExecutionSummaryProjection.fromExecution(execution, [fact]),
    fact,
    correlationId: fact.commandContext.correlationId
  });
}

function executionFixture(
  suffix: string,
  lifecycle: PortfolioExecutionLifecycleValue,
  owned: {
    readonly workItems?: readonly PortfolioWorkItem[];
    readonly candidates?: readonly ArtifactCandidate[];
  } = {}
): PortfolioExecution {
  return new PortfolioExecution({
    id: new ExecutionId(`execution:${suffix}`),
    portfolioPlanReference: new PortfolioPlanReference({
      planId: `plan:${suffix}`,
      roadmapId: `roadmap:${suffix}`,
      planArtifactReference: `artifact:${suffix}`
    }),
    planSnapshotReference: new PlanSnapshotReference({
      snapshotReference: `snapshot:${suffix}`
    }),
    approvalReference: new ApprovalReference({
      approvalReference: `approval:${suffix}`
    }),
    authorizationResourceReference: authorizationResourceReference(),
    commandContext: commandContext(`created:${suffix}`),
    lifecycle,
    workItems: owned.workItems,
    candidates: owned.candidates
  });
}

function commandContext(suffix: string): PortfolioExecutionCommandContext {
  return new PortfolioExecutionCommandContext({
    commandId: `command:${suffix}`,
    correlationId: `correlation:${suffix}`,
    actorReference: `actor:${suffix}`,
    occurredAt: "2026-08-05T00:00:00.000Z"
  });
}

function readSource(directory: string): string {
  return sourceEntriesByFile(directory).map((entry) => entry.source).join("\n");
}

function sourceEntriesByFile(directory: string): ReadonlyArray<{ readonly file: string; readonly source: string }> {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    const stat = statSync(path);

    if (stat.isDirectory()) {
      return sourceEntriesByFile(path);
    }

    return [{
      file: entry,
      source: readFileSync(path, "utf8")
    }];
  });
}

function portfolioWorkspacePresentationSourcePath(): string {
  const cwd = process.cwd();

  if (cwd.endsWith(`${join("apps", "api")}`)) {
    return join(cwd, "src", "portfolio-workspace", "presentation");
  }

  return join(cwd, "apps", "api", "src", "portfolio-workspace", "presentation");
}


function authorizationResourceReference(): PortfolioWorkspaceAuthorizationResourceReference {
  return new PortfolioWorkspaceAuthorizationResourceReference({
    authorizationResourceReference: "portfolio-workspace:execution-owner-1"
  });
}
