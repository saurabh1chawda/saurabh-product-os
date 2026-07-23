import type { DecisionContext, DecisionResult, Pipeline } from "@career-companion/decision-engine";
import { createDecisionResult, createRecommendationBundle, createDecisionTrace } from "@career-companion/decision-engine";
import { CareerProfileId, PortfolioAssetId } from "@career-companion/career-knowledge";
import type { CommitResult, PersistenceSession, RollbackResult } from "@career-companion/persistence";
import type { RepositoryResult } from "@career-companion/repositories";
import type {
  AggregateRepositoryLoader,
  ApplicationCommand,
  RuntimeRetrievalRequest,
  RuntimeUseCaseDependencies,
  UseCaseContext
} from "../../../src";
import {
  InMemoryCareerProfileRepository,
  InMemoryKnowledgeRetrievalService,
  InMemoryPersistenceSession,
  InMemoryPortfolioRepository,
  InMemoryUnitOfWork,
  createCareerKnowledgeFixtures,
  createCareerKnowledgeProjectionFixtures
} from "@career-companion/infrastructure-memory";

export interface WorkflowTrace {
  readonly calls: readonly string[];
  readonly repositoryLoads: readonly string[];
  readonly retrievalRequests: readonly string[];
  readonly decisionExecutions: number;
  readonly committed: boolean;
  readonly rolledBack: boolean;
}

export interface WorkflowHarness<TCommand extends ApplicationCommand = ApplicationCommand> {
  readonly dependencies: RuntimeUseCaseDependencies<TCommand, WorkflowDecisionOutput>;
  readonly trace: WorkflowTrace;
}

export interface WorkflowDecisionOutput {
  readonly accepted: boolean;
  readonly pipelineName: string;
  readonly aggregateLoadCount: number;
  readonly retrievalCount: number;
}

export interface WorkflowBuilderOptions {
  readonly repositoryFailure?: boolean;
  readonly retrievalFailure?: boolean;
  readonly decisionFailure?: boolean;
  readonly persistenceFailure?: boolean;
}

interface MutableWorkflowTrace {
  readonly calls: string[];
  readonly repositoryLoads: string[];
  readonly retrievalRequests: string[];
  decisionExecutions: number;
  committed: boolean;
  rolledBack: boolean;
}

export function createWorkflowHarness<TCommand extends ApplicationCommand>(
  options: WorkflowBuilderOptions = {}
): WorkflowHarness<TCommand> {
  const fixtures = createCareerKnowledgeFixtures();
  const projections = createCareerKnowledgeProjectionFixtures();
  const careerProfileRepository = new InMemoryCareerProfileRepository([fixtures.careerProfile]);
  const portfolioRepository = new InMemoryPortfolioRepository([fixtures.portfolioAsset]);
  const retrievalService = new InMemoryKnowledgeRetrievalService([
    ...projections.careerProfiles,
    ...projections.competencies,
    ...projections.evidence,
    ...projections.metrics,
    ...projections.stories,
    ...projections.projects,
    ...projections.portfolioAssets,
    ...projections.professionalIdentities,
    ...projections.capabilityEvidence
  ]);
  const trace: MutableWorkflowTrace = {
    calls: [],
    repositoryLoads: [],
    retrievalRequests: [],
    decisionExecutions: 0,
    committed: false,
    rolledBack: false
  };

  return Object.freeze({
    trace,
    dependencies: Object.freeze({
      sessionProvider: {
        open(context: UseCaseContext) {
          trace.calls.push("session.open");
          return new InMemoryPersistenceSession(`${context.execution.useCaseName}:session`, {
            actor: context.actor.actorId,
            correlationId: context.correlation.correlationId,
            createdAt: context.request.requestedAt
          });
        }
      },
      unitOfWorkProvider: {
        create(session: PersistenceSession) {
          trace.calls.push("unit.create");
          return options.persistenceFailure
            ? new FailingCommitUnitOfWork(session, trace)
            : new TracedUnitOfWork(session, trace);
        }
      },
      repositoryLoader: createRepositoryLoader({
        careerProfileRepository,
        portfolioRepository,
        repositoryFailure: options.repositoryFailure ?? false,
        trace
      }),
      retrievalExecutor: {
        retrieve(request: RuntimeRetrievalRequest<TCommand>, context: UseCaseContext) {
          trace.calls.push(`retrieval:${request.requestName}`);
          trace.retrievalRequests.push(request.requestName);

          if (options.retrievalFailure) {
            throw new Error("Deterministic retrieval failure.");
          }

          return retrievalService.retrieveKnowledge({
            queryName: request.requestName,
            criteria: Object.freeze({
              actor: context.actor.actorId,
              referenceCount: request.references.length
            }),
            pagination: Object.freeze({
              pageNumber: 1,
              pageSize: 3
            })
          }, {
            actor: context.actor.actorId,
            correlationId: context.correlation.correlationId,
            retrievalTimestamp: context.request.requestedAt
          });
        }
      },
      decisionPipeline: new WorkflowPipeline(trace, options.decisionFailure ?? false)
    })
  });
}

function createRepositoryLoader(input: {
  readonly careerProfileRepository: InMemoryCareerProfileRepository;
  readonly portfolioRepository: InMemoryPortfolioRepository;
  readonly repositoryFailure: boolean;
  readonly trace: MutableWorkflowTrace;
}): AggregateRepositoryLoader {
  return {
    load(request, context): RepositoryResult<unknown, string> {
      const key = `${request.reference.referenceType}:${request.reference.referenceId}`;
      input.trace.calls.push(`repository:${key}`);
      input.trace.repositoryLoads.push(key);

      if (input.repositoryFailure) {
        return notFound(request.reference.referenceId, request.reference.referenceType);
      }

      if (request.reference.referenceType === "career-profile") {
        return toApplicationRepositoryResult(
          input.careerProfileRepository.getById(new CareerProfileId(request.reference.referenceId), context)
        );
      }

      if (request.reference.referenceType === "portfolio-asset") {
        return toApplicationRepositoryResult(
          input.portfolioRepository.getById(new PortfolioAssetId(request.reference.referenceId), context)
        );
      }

      return {
        status: "success",
        value: Object.freeze({
          referenceType: request.reference.referenceType,
          referenceId: request.reference.referenceId
        }),
        metadata: Object.freeze({
          operationId: `reference:${request.reference.referenceType}`,
          repositoryName: "InMemoryReferenceRepository",
          aggregateType: request.reference.referenceType,
          occurredAt: context.persistenceContext.createdAt
        })
      };
    }
  };
}

function toApplicationRepositoryResult(result: RepositoryResult<unknown, unknown>): RepositoryResult<unknown, string> {
  if (result.status === "success" || result.status === "failure") {
    return result;
  }

  if (result.status === "not-found") {
    return {
      status: "not-found",
      id: String(result.id),
      metadata: result.metadata
    };
  }

  return {
    ...result,
    id: String(result.id)
  };
}

function notFound(id: string, aggregateType: string): RepositoryResult<unknown, string> {
  return {
    status: "not-found",
    id,
    metadata: Object.freeze({
      operationId: `not-found:${id}`,
      repositoryName: "InMemoryWorkflowRepository",
      aggregateType,
      occurredAt: "2026-07-23T00:00:00.000Z"
    })
  };
}

class WorkflowPipeline implements Pipeline<WorkflowDecisionOutput> {
  readonly pipelineName = "WorkflowE2EPipeline";

  constructor(
    private readonly trace: MutableWorkflowTrace,
    private readonly shouldFail: boolean
  ) {}

  execute(context: DecisionContext): DecisionResult<WorkflowDecisionOutput> {
    this.trace.calls.push("decision.execute");
    this.trace.decisionExecutions += 1;

    if (this.shouldFail) {
      throw new Error("Deterministic decision failure.");
    }

    return createDecisionResult({
      pipelineName: this.pipelineName,
      output: Object.freeze({
        accepted: true,
        pipelineName: this.pipelineName,
        aggregateLoadCount: context.candidate.identities.length,
        retrievalCount: 1
      }),
      trace: createDecisionTrace({
        metadata: {
          pipelineName: this.pipelineName,
          executionTimestamp: context.metadata.executionTimestamp,
          correlationId: context.metadata.correlationId,
          actor: context.metadata.actor
        },
        stepsExecuted: Object.freeze([]),
        decisionInputs: Object.freeze(["application-runtime", "in-memory-repositories", "in-memory-retrieval"]),
        recommendations: Object.freeze(["typed-application-result"])
      }),
      summary: Object.freeze({
        pipelineName: this.pipelineName,
        status: "completed",
        stepCount: 0,
        recommendationCount: 1
      }),
      recommendationBundle: createRecommendationBundle({})
    });
  }
}

class TracedUnitOfWork extends InMemoryUnitOfWork {
  constructor(
    session: PersistenceSession,
    protected readonly trace: MutableWorkflowTrace
  ) {
    super(session.context, `${session.sessionId}:unit-of-work`);
  }

  override save(changeSetName: string) {
    this.trace.calls.push(`unit.save:${changeSetName}`);
    return super.save(changeSetName);
  }

  override commit(): CommitResult {
    this.trace.calls.push("unit.commit");
    this.trace.committed = true;
    return super.commit();
  }

  override rollback(reason?: string): RollbackResult {
    this.trace.calls.push(`unit.rollback:${reason}`);
    this.trace.rolledBack = true;
    return super.rollback(reason);
  }
}

class FailingCommitUnitOfWork extends TracedUnitOfWork {
  override commit(): CommitResult {
    this.trace.calls.push("unit.commit");
    this.trace.committed = false;
    return Object.freeze({
      transactionId: this.unitOfWorkId,
      state: "failed",
      completedAt: "2026-07-23T00:00:00.000Z"
    });
  }

  constructor(
    session: PersistenceSession,
    trace: MutableWorkflowTrace
  ) {
    super(session, trace);
  }
}
