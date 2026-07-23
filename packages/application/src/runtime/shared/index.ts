import type { DecisionContext, DecisionResult, Pipeline } from "@career-companion/decision-engine";
import { createDecisionContext } from "@career-companion/decision-engine";
import type { DomainMetadata } from "@career-companion/kernel";
import type { PersistenceSession, UnitOfWork } from "@career-companion/persistence";
import type { RepositoryContext, RepositoryResult } from "@career-companion/repositories";
import type { RetrievalResult } from "@career-companion/retrieval";
import type { ApplicationCommand } from "../../commands";
import type { UseCaseContext } from "../../context";
import type { UseCasePolicy } from "../../policies";
import type { ApplicationResult, FailureSummary, ValidationSummary } from "../../results";
import type { ApplicationReference, ApplicationUseCaseName } from "../../shared";
import type { UseCase } from "../../use-cases";
import type { ValidationContract } from "../../validation";

export interface PersistenceSessionProvider {
  open(context: UseCaseContext): PersistenceSession;
}

export interface UnitOfWorkProvider {
  create(session: PersistenceSession, context: UseCaseContext): UnitOfWork;
}

export interface RepositoryLoadRequest {
  readonly reference: ApplicationReference;
}

export interface AggregateRepositoryLoader {
  load(request: RepositoryLoadRequest, context: RepositoryContext): RepositoryResult<unknown, string>;
}

export interface RuntimeRetrievalRequest<TCommand extends ApplicationCommand = ApplicationCommand> {
  readonly requestName: string;
  readonly command: TCommand;
  readonly references: readonly ApplicationReference[];
}

export interface RetrievalExecutor<TCommand extends ApplicationCommand = ApplicationCommand> {
  retrieve(request: RuntimeRetrievalRequest<TCommand>, context: UseCaseContext): RetrievalResult<unknown>;
}

export interface DecisionContextFactory<TCommand extends ApplicationCommand = ApplicationCommand> {
  create(input: RuntimeDecisionContextInput<TCommand>): DecisionContext;
}

export interface RuntimeDecisionContextInput<TCommand extends ApplicationCommand = ApplicationCommand> {
  readonly command: TCommand;
  readonly context: UseCaseContext;
  readonly aggregateResults: readonly RepositoryResult<unknown, string>[];
  readonly retrievalResults: readonly RetrievalResult<unknown>[];
}

export interface RuntimeUseCaseDependencies<TCommand extends ApplicationCommand = ApplicationCommand, TOutput = unknown> {
  readonly sessionProvider: PersistenceSessionProvider;
  readonly unitOfWorkProvider: UnitOfWorkProvider;
  readonly repositoryLoader: AggregateRepositoryLoader;
  readonly decisionPipeline: Pipeline<TOutput>;
  readonly decisionContextFactory?: DecisionContextFactory<TCommand>;
  readonly retrievalExecutor?: RetrievalExecutor<TCommand>;
}

export interface RuntimeUseCasePlan<TCommand extends ApplicationCommand = ApplicationCommand> {
  readonly useCaseName: ApplicationUseCaseName;
  readonly requiredReferences: (command: TCommand) => readonly ApplicationReference[];
  readonly retrievalRequests?: (command: TCommand) => readonly RuntimeRetrievalRequest<TCommand>[];
}

export interface RuntimeUseCaseOutput<TDecisionOutput = unknown> {
  readonly useCaseName: ApplicationUseCaseName;
  readonly commandId: string;
  readonly aggregateReferences: readonly ApplicationReference[];
  readonly retrievalCount: number;
  readonly decisionResult: DecisionResult<TDecisionOutput>;
}

export class RuntimeUseCase<TCommand extends ApplicationCommand, TDecisionOutput = unknown>
  implements UseCase<TCommand, RuntimeUseCaseOutput<TDecisionOutput>>
{
  readonly useCaseName: string;
  readonly policies: readonly UseCasePolicy<TCommand>[];
  readonly validators: readonly ValidationContract<TCommand>[];

  constructor(
    private readonly plan: RuntimeUseCasePlan<TCommand>,
    private readonly dependencies: RuntimeUseCaseDependencies<TCommand, TDecisionOutput>,
    validators: readonly ValidationContract<TCommand>[] = [],
    policies: readonly UseCasePolicy<TCommand>[] = []
  ) {
    this.useCaseName = plan.useCaseName;
    this.validators = Object.freeze([...validators]);
    this.policies = Object.freeze([...policies]);
  }

  execute(command: TCommand, context: UseCaseContext): ApplicationResult<RuntimeUseCaseOutput<TDecisionOutput>> {
    const startedAt = context.request.requestedAt;
    const validation = validateCommand(command, context, this.validators);

    if (!validation.valid) {
      return failureResult("validation-failed", startedAt, validation, {
        category: "validation",
        code: "application.validation",
        message: "Application command validation failed.",
        references: command.references
      });
    }

    const policyFailure = evaluatePolicies(command, context, this.policies);

    if (policyFailure !== undefined) {
      return failureResult("policy-denied", startedAt, validation, policyFailure);
    }

    const session = this.dependencies.sessionProvider.open(context);
    const unitOfWork = this.dependencies.unitOfWorkProvider.create(session, context);
    const repositoryContext: RepositoryContext = Object.freeze({
      persistenceContext: session.context,
      session,
      unitOfWork
    });

    try {
      const aggregateReferences = Object.freeze([...this.plan.requiredReferences(command)]);
      const aggregateResults = aggregateReferences.map((reference) =>
        this.dependencies.repositoryLoader.load({ reference }, repositoryContext)
      );
      const aggregateFailure = firstRepositoryFailure(aggregateResults);

      if (aggregateFailure !== undefined) {
        unitOfWork.rollback(aggregateFailure.message);
        return failureResult("failure", startedAt, validation, aggregateFailure);
      }

      const retrievalRequests = Object.freeze([...(this.plan.retrievalRequests?.(command) ?? [])]);
      const retrievalResults = retrievalRequests.map((request) => {
        if (this.dependencies.retrievalExecutor === undefined) {
          throw new Error("Retrieval executor is required for this use case.");
        }

        return this.dependencies.retrievalExecutor.retrieve(request, context);
      });
      const decisionContext = createRuntimeDecisionContext({
        command,
        context,
        aggregateResults,
        retrievalResults
      }, this.dependencies.decisionContextFactory);
      const decisionResult = this.dependencies.decisionPipeline.execute(decisionContext);
      const saveResult = unitOfWork.save(this.useCaseName);

      if (!saveResult.accepted) {
        unitOfWork.rollback("Unit of work save was rejected.");
        return failureResult("failure", startedAt, validation, {
          category: "execution",
          code: "application.save-rejected",
          message: "Unit of work save was rejected.",
          references: command.references
        });
      }

      const commitResult = unitOfWork.commit();

      if (commitResult.state !== "committed") {
        unitOfWork.rollback("Unit of work commit failed.");
        return failureResult("failure", startedAt, validation, {
          category: "execution",
          code: "application.commit-failed",
          message: "Unit of work commit failed.",
          references: command.references
        });
      }

      return successResult(startedAt, validation, decisionResult, {
        useCaseName: this.useCaseName,
        commandId: command.commandId,
        aggregateReferences,
        retrievalCount: retrievalResults.length,
        decisionResult
      });
    } catch (error) {
      unitOfWork.rollback("Application runtime execution failed.");
      return failureResult("failure", startedAt, validation, {
        category: "execution",
        code: "application.runtime-failure",
        message: error instanceof Error ? error.message : "Application runtime execution failed.",
        references: command.references,
        metadata: {
          useCaseName: this.useCaseName
        }
      });
    }
  }
}

export function createApplicationReference(referenceType: string, referenceId: string): ApplicationReference {
  return Object.freeze({
    referenceType,
    referenceId
  });
}

function validateCommand<TCommand extends ApplicationCommand>(
  command: TCommand,
  context: UseCaseContext,
  validators: readonly ValidationContract<TCommand>[]
): ValidationSummary {
  const errors = [
    ...(command.commandId.trim().length === 0 ? ["commandId is required."] : []),
    ...(command.references === undefined ? ["references are required."] : [])
  ];
  const summaries = validators.map((validator) => validator.validate(command, context));

  return Object.freeze({
    valid: errors.length === 0 && summaries.every((summary) => summary.valid),
    errors: Object.freeze([...errors, ...summaries.flatMap((summary) => summary.errors)]),
    warnings: Object.freeze(summaries.flatMap((summary) => summary.warnings))
  });
}

function evaluatePolicies<TCommand extends ApplicationCommand>(
  command: TCommand,
  context: UseCaseContext,
  policies: readonly UseCasePolicy<TCommand>[]
): FailureSummary | undefined {
  for (const policy of policies) {
    if ("evaluateAuthorization" in policy) {
      const decision = policy.evaluateAuthorization(command, context);
      if (!decision.allowed) {
        return policyFailure("authorization", decision.reason, decision.metadata, command.references);
      }
    }

    if ("evaluateExecution" in policy) {
      const decision = policy.evaluateExecution(command, context);
      if (!decision.allowed) {
        return policyFailure("policy", decision.reason, decision.metadata, command.references);
      }
    }

    if ("evaluateValidation" in policy) {
      const decision = policy.evaluateValidation(command, context);
      if (!decision.allowed) {
        return policyFailure("validation", decision.reason, decision.metadata, command.references);
      }
    }
  }

  return undefined;
}

function policyFailure(
  category: FailureSummary["category"],
  reason: string | undefined,
  metadata: DomainMetadata | undefined,
  references: readonly ApplicationReference[]
): FailureSummary {
  return Object.freeze({
    category,
    code: `application.${category}`,
    message: reason ?? "Application policy denied execution.",
    references,
    metadata
  });
}

function firstRepositoryFailure(
  results: readonly RepositoryResult<unknown, string>[]
): FailureSummary | undefined {
  const failedResult = results.find((result) => result.status !== "success");

  if (failedResult === undefined) {
    return undefined;
  }

  if (failedResult.status === "not-found") {
    return Object.freeze({
      category: "not-found",
      code: "application.aggregate-not-found",
      message: `Required aggregate was not found: ${failedResult.id}.`,
      references: []
    });
  }

  if (failedResult.status === "conflict") {
    return Object.freeze({
      category: "conflict",
      code: "application.aggregate-conflict",
      message: `Required aggregate has a version conflict: ${failedResult.id}.`,
      references: []
    });
  }

  return Object.freeze({
    category: "execution",
    code: failedResult.code,
    message: failedResult.message,
    references: [],
    metadata: failedResult.metadata.metadata
  });
}

function createRuntimeDecisionContext<TCommand extends ApplicationCommand>(
  input: RuntimeDecisionContextInput<TCommand>,
  factory: DecisionContextFactory<TCommand> | undefined
): DecisionContext {
  if (factory !== undefined) {
    return factory.create(input);
  }

  return createDecisionContext({
    candidate: {
      identities: [],
      competencies: [],
      capabilityEvidence: [],
      evidenceReferences: [],
      stories: [],
      metrics: [],
      portfolioAssets: []
    },
    target: {
      targetName: input.command.commandName,
      requiredCompetencyIds: [],
      preferredCompetencyIds: [],
      preferredEvidenceIds: []
    },
    criteria: {},
    metadata: {
      pipelineName: input.command.commandName,
      executionTimestamp: input.context.request.requestedAt,
      correlationId: input.context.correlation.correlationId,
      actor: input.context.actor.actorId
    }
  });
}

function successResult<TDecisionOutput>(
  startedAt: string,
  validation: ValidationSummary,
  decisionResult: DecisionResult<TDecisionOutput>,
  value: RuntimeUseCaseOutput<TDecisionOutput>
): ApplicationResult<RuntimeUseCaseOutput<TDecisionOutput>> {
  return Object.freeze({
    status: "success",
    value: Object.freeze(value),
    validation,
    execution: Object.freeze({
      startedAt,
      status: "success",
      decisionResult
    })
  });
}

function failureResult<T>(
  status: ApplicationResult<T>["status"],
  startedAt: string,
  validation: ValidationSummary,
  failure: FailureSummary
): ApplicationResult<T> {
  return Object.freeze({
    status,
    validation,
    execution: Object.freeze({
      startedAt,
      status
    }),
    failure: Object.freeze(failure)
  });
}

