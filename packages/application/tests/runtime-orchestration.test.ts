import type { DecisionResult, Pipeline } from "@career-companion/decision-engine";
import type { DomainMetadata } from "@career-companion/kernel";
import type { CommitResult, PersistenceSession, PersistenceTransaction, RollbackResult, UnitOfWork } from "@career-companion/persistence";
import type { RepositoryMetadata, RepositoryResult } from "@career-companion/repositories";
import type { RetrievalResult } from "@career-companion/retrieval";
import { describe, expect, it } from "vitest";
import type { ApplicationCommand, GenerateResumeCommand, UseCaseContext } from "../src";
import {
  AnalyzeJobDescriptionUseCase,
  EvaluateQualificationUseCase,
  GenerateLinkedInProfileUseCase,
  GeneratePortfolioUseCase,
  GenerateResumeUseCase,
  PrepareInterviewUseCase
} from "../src";
import type {
  AggregateRepositoryLoader,
  PersistenceSessionProvider,
  RepositoryLoadRequest,
  RetrievalExecutor,
  RuntimeUseCaseDependencies,
  UnitOfWorkProvider
} from "../src";

describe("application runtime orchestration", () => {
  it("executes repository loading before decision engine and commits on success", () => {
    const calls: string[] = [];
    const unitOfWork = createUnitOfWork(calls);
    const useCase = new GenerateResumeUseCase(createDependencies(calls, unitOfWork));

    const result = useCase.execute(createGenerateResumeCommand(), createUseCaseContext());

    expect(result.status).toBe("success");
    expect(result.value?.useCaseName).toBe("GenerateResumeUseCase");
    expect(result.value?.retrievalCount).toBe(1);
    expect(calls).toEqual([
      "session.open",
      "unit.create",
      "repository.load:career-profile:career-profile-1",
      "retrieval.retrieve:resume-supporting-context",
      "decision.execute",
      "unit.save:GenerateResumeUseCase",
      "unit.commit"
    ]);
  });

  it("rolls back when repository loading fails before decision execution", () => {
    const calls: string[] = [];
    const unitOfWork = createUnitOfWork(calls);
    const useCase = new GenerateResumeUseCase(createDependencies(calls, unitOfWork, "not-found"));

    const result = useCase.execute(createGenerateResumeCommand(), createUseCaseContext());

    expect(result.status).toBe("failure");
    expect(result.failure?.category).toBe("not-found");
    expect(calls).toEqual([
      "session.open",
      "unit.create",
      "repository.load:career-profile:career-profile-1",
      "unit.rollback:Required aggregate was not found: career-profile-1."
    ]);
  });

  it("rolls back when decision execution fails and preserves typed failure results", () => {
    const calls: string[] = [];
    const unitOfWork = createUnitOfWork(calls);
    const useCase = new GenerateResumeUseCase(createDependencies(calls, unitOfWork, "success", true));

    const result = useCase.execute(createGenerateResumeCommand(), createUseCaseContext());

    expect(result.status).toBe("failure");
    expect(result.failure?.code).toBe("application.runtime-failure");
    expect(calls).toEqual([
      "session.open",
      "unit.create",
      "repository.load:career-profile:career-profile-1",
      "retrieval.retrieve:resume-supporting-context",
      "decision.execute",
      "unit.rollback:Application runtime execution failed."
    ]);
  });

  it("creates all canonical runtime use case implementations", () => {
    const calls: string[] = [];
    const dependencies = createDependencies(calls, createUnitOfWork(calls));

    expect(new GenerateResumeUseCase(dependencies).useCaseName).toBe("GenerateResumeUseCase");
    expect(new GeneratePortfolioUseCase(dependencies).useCaseName).toBe("GeneratePortfolioUseCase");
    expect(new PrepareInterviewUseCase(dependencies).useCaseName).toBe("PrepareInterviewUseCase");
    expect(new AnalyzeJobDescriptionUseCase(dependencies).useCaseName).toBe("AnalyzeJobDescriptionUseCase");
    expect(new EvaluateQualificationUseCase(dependencies).useCaseName).toBe("EvaluateQualificationUseCase");
    expect(new GenerateLinkedInProfileUseCase(dependencies).useCaseName).toBe("GenerateLinkedInProfileUseCase");
  });
});

function createDependencies(
  calls: string[],
  unitOfWork: UnitOfWork,
  repositoryMode: "success" | "not-found" = "success",
  decisionFailure = false
): RuntimeUseCaseDependencies<ApplicationCommand, unknown> {
  const sessionProvider: PersistenceSessionProvider = {
    open: (context) => {
      calls.push("session.open");
      return createSession(context);
    }
  };
  const unitOfWorkProvider: UnitOfWorkProvider = {
    create: () => {
      calls.push("unit.create");
      return unitOfWork;
    }
  };
  const repositoryLoader: AggregateRepositoryLoader = {
    load: (request) => {
      calls.push(`repository.load:${request.reference.referenceType}:${request.reference.referenceId}`);
      return repositoryMode === "success"
        ? repositorySuccess(request)
        : repositoryNotFound(request);
    }
  };
  const retrievalExecutor: RetrievalExecutor<ApplicationCommand> = {
    retrieve: (request) => {
      calls.push(`retrieval.retrieve:${request.requestName}`);
      return retrievalResult();
    }
  };
  const decisionPipeline: Pipeline<unknown> = {
    pipelineName: "RuntimeTestPipeline",
    execute: () => {
      calls.push("decision.execute");

      if (decisionFailure) {
        throw new Error("Decision pipeline failed.");
      }

      return decisionResult();
    }
  };

  return {
    sessionProvider,
    unitOfWorkProvider,
    repositoryLoader,
    retrievalExecutor,
    decisionPipeline
  };
}

function createUseCaseContext(): UseCaseContext {
  return Object.freeze({
    actor: Object.freeze({
      actorId: "actor-1",
      actorType: "user",
      roles: Object.freeze(["owner"])
    }),
    request: Object.freeze({
      requestId: "request-1",
      requestedAt: "2026-07-23T00:00:00.000Z"
    }),
    correlation: Object.freeze({
      correlationId: "correlation-1"
    }),
    execution: Object.freeze({
      useCaseName: "GenerateResumeUseCase"
    })
  });
}

function createGenerateResumeCommand(): GenerateResumeCommand {
  return Object.freeze({
    commandId: "command-1",
    commandName: "generate-resume",
    payload: Object.freeze({
      careerProfileId: "career-profile-1",
      decisionReferences: Object.freeze([])
    }),
    references: Object.freeze([])
  });
}

function createSession(context: UseCaseContext): PersistenceSession {
  return Object.freeze({
    sessionId: "session-1",
    state: "active",
    context: Object.freeze({
      sessionId: "session-1",
      correlationId: context.correlation.correlationId,
      actor: context.actor.actorId,
      createdAt: context.request.requestedAt
    }),
    beginTransaction: (): PersistenceTransaction => ({
      transactionId: "transaction-1",
      state: "active",
      commit: () => ({
        transactionId: "transaction-1",
        state: "committed"
      }),
      rollback: () => ({
        transactionId: "transaction-1",
        state: "rolled-back"
      })
    }),
    close: () => createSession(context)
  });
}

function createUnitOfWork(calls: string[]): UnitOfWork {
  return Object.freeze({
    unitOfWorkId: "unit-1",
    state: "ready",
    context: Object.freeze({
      sessionId: "session-1",
      createdAt: "2026-07-23T00:00:00.000Z"
    }),
    save: (changeSetName: string) => {
      calls.push(`unit.save:${changeSetName}`);
      return {
        operationId: "save-1",
        accepted: true
      };
    },
    commit: (): CommitResult => {
      calls.push("unit.commit");
      return {
        transactionId: "transaction-1",
        state: "committed"
      };
    },
    rollback: (reason?: string): RollbackResult => {
      calls.push(`unit.rollback:${reason}`);
      return {
        transactionId: "transaction-1",
        state: "rolled-back"
      };
    }
  });
}

function repositorySuccess(request: RepositoryLoadRequest): RepositoryResult<unknown, string> {
  return {
    status: "success",
    value: Object.freeze({ id: request.reference.referenceId }),
    metadata: repositoryMetadata()
  };
}

function repositoryNotFound(request: RepositoryLoadRequest): RepositoryResult<unknown, string> {
  return {
    status: "not-found",
    id: request.reference.referenceId,
    metadata: repositoryMetadata()
  };
}

function repositoryMetadata(): RepositoryMetadata {
  return {
    operationId: "repo-op-1",
    repositoryName: "RuntimeTestRepository",
    aggregateType: "CareerProfile",
    occurredAt: "2026-07-23T00:00:00.000Z",
    metadata: Object.freeze({}) as DomainMetadata
  };
}

function retrievalResult(): RetrievalResult<unknown> {
  return Object.freeze({
    items: Object.freeze([]),
    references: Object.freeze([]),
    summary: Object.freeze({
      resultCount: 0
    }),
    metadata: Object.freeze({})
  });
}

function decisionResult(): DecisionResult<unknown> {
  return Object.freeze({
    pipelineName: "RuntimeTestPipeline",
    output: Object.freeze({ artifactCandidate: "candidate-1" }),
    trace: Object.freeze({
      pipeline: "RuntimeTestPipeline",
      stepsExecuted: Object.freeze([]),
      decisionInputs: Object.freeze([]),
      recommendations: Object.freeze([]),
      scores: Object.freeze([]),
      confidence: Object.freeze([]),
      reasons: Object.freeze([]),
      executionTimestamp: "2026-07-23T00:00:00.000Z"
    }),
    summary: Object.freeze({
      pipelineName: "RuntimeTestPipeline",
      status: "completed",
      stepCount: 0,
      recommendationCount: 0
    }),
    recommendationBundle: Object.freeze({
      recommendations: Object.freeze([]),
      rankings: Object.freeze([]),
      reasons: Object.freeze([])
    })
  });
}
