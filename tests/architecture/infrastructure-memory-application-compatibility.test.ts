import { describe, expect, it } from "vitest";
import { GenerateResumeUseCase } from "../../packages/application/src";
import type { GenerateResumeCommand, UseCaseContext } from "../../packages/application/src";
import type { DecisionContext, DecisionResult, Pipeline } from "../../packages/decision-engine/src";
import { createDecisionResult, createRecommendationBundle, createDecisionTrace } from "../../packages/decision-engine/src";
import { CareerProfileId } from "../../packages/career-knowledge/src";
import type { RepositoryResult } from "../../packages/repositories/src";
import {
  InMemoryCareerProfileRepository,
  InMemoryKnowledgeRetrievalService,
  InMemoryPersistenceSession,
  InMemoryUnitOfWork,
  createCareerProfileFixture
} from "../../packages/infrastructure-memory/src";

describe("infrastructure-memory application runtime compatibility", () => {
  it("executes an application use case against real in-memory persistence and repositories", () => {
    const profile = createCareerProfileFixture();
    const profileRepository = new InMemoryCareerProfileRepository([profile]);
    const retrievalService = new InMemoryKnowledgeRetrievalService([profile.toSnapshot()]);
    const pipeline = new CompatibilityPipeline();
    const sessions: InMemoryPersistenceSession[] = [];
    const unitsOfWork: InMemoryUnitOfWork[] = [];
    const useCase = new GenerateResumeUseCase({
      sessionProvider: {
        open(context) {
          const session = new InMemoryPersistenceSession("compat-session", {
            correlationId: context.correlation.correlationId,
            actor: context.actor.actorId,
            createdAt: context.request.requestedAt
          });
          sessions.push(session);
          return session;
        }
      },
      unitOfWorkProvider: {
        create(session) {
          const unitOfWork = new InMemoryUnitOfWork(session.context, "compat-uow");
          unitsOfWork.push(unitOfWork);
          return unitOfWork;
        }
      },
      repositoryLoader: {
        load(request, context): RepositoryResult<unknown, string> {
          const result = profileRepository.getById(new CareerProfileId(request.reference.referenceId), context);
          if (result.status === "success") {
            return {
              status: "success",
              value: result.value,
              metadata: result.metadata
            };
          }

          if (result.status === "not-found") {
            return {
              status: "not-found",
              id: request.reference.referenceId,
              metadata: result.metadata
            };
          }

          if (result.status === "conflict") {
            return {
              ...result,
              id: request.reference.referenceId
            };
          }

          return result;
        }
      },
      retrievalExecutor: {
        retrieve(request, context) {
          return retrievalService.retrieveKnowledge({
            queryName: request.requestName,
            criteria: Object.freeze({
              actor: context.actor.actorId
            })
          });
        }
      },
      decisionPipeline: pipeline
    });

    const result = useCase.execute(createGenerateResumeCommand(profile.id.toString()), createUseCaseContext());

    expect(result.status).toBe("success");
    expect(pipeline.executions).toBe(1);
    expect(sessions[0]?.state).toBe("active");
    expect(unitsOfWork[0]?.state).toBe("committed");
    const output = result.status === "success" ? result.value : undefined;
    expect(output?.retrievalCount).toBe(1);
  });
});

class CompatibilityPipeline implements Pipeline<{ readonly accepted: boolean }> {
  readonly pipelineName = "CompatibilityPipeline";
  executions = 0;

  execute(context: DecisionContext): DecisionResult<{ readonly accepted: boolean }> {
    this.executions += 1;

    return createDecisionResult({
      pipelineName: this.pipelineName,
      output: Object.freeze({ accepted: true }),
      trace: createDecisionTrace({
        metadata: {
          pipelineName: this.pipelineName,
          executionTimestamp: context.metadata.executionTimestamp,
          correlationId: context.metadata.correlationId,
          actor: context.metadata.actor
        },
        stepsExecuted: Object.freeze([]),
        decisionInputs: Object.freeze(["compatibility"]),
        recommendations: Object.freeze(["continue"])
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

function createGenerateResumeCommand(careerProfileId: string): GenerateResumeCommand {
  return Object.freeze({
    commandId: "command-compat-1",
    commandName: "generate-resume",
    payload: Object.freeze({
      careerProfileId,
      decisionReferences: Object.freeze([])
    }),
    references: Object.freeze([])
  });
}

function createUseCaseContext(): UseCaseContext {
  return Object.freeze({
    actor: Object.freeze({
      actorId: "engineer",
      actorType: "system",
      roles: Object.freeze(["tester"])
    }),
    request: Object.freeze({
      requestId: "request-compat-1",
      requestedAt: "2026-01-01T00:00:00.000Z",
      source: "test"
    }),
    correlation: Object.freeze({
      correlationId: "correlation-compat-1"
    }),
    execution: Object.freeze({
      useCaseName: "GenerateResumeUseCase"
    })
  });
}
