import { Result } from "@career-companion/kernel";
import {
  ArtifactCandidate,
  ArtifactCandidateLifecycle,
  PortfolioExecution,
  PortfolioExecutionSummaryProjection,
  PortfolioWorkItem,
  PortfolioWorkItemLifecycle,
  PortfolioWorkspaceDomainError
} from "@career-companion/portfolio-workspace";
import type { PortfolioExecutionRepositorySaveFailure } from "../errors/PortfolioExecutionRepositoryErrors";
import { InitializePortfolioExecutionInput } from "../inputs/InitializePortfolioExecutionInput";
import type { PortfolioExecutionRepository } from "../ports/PortfolioExecutionRepository";
import { InitializePortfolioExecutionResult } from "../results/InitializePortfolioExecutionResult";

export type InitializePortfolioExecutionError =
  | PortfolioExecutionRepositorySaveFailure
  | PortfolioWorkspaceDomainError;

export class InitializePortfolioExecutionApplicationService {
  private readonly __initializePortfolioExecutionApplicationServiceBrand!: never;

  private readonly repository: PortfolioExecutionRepository;

  constructor(input: {
    readonly repository: PortfolioExecutionRepository;
  }) {
    this.repository = input.repository;
    Object.freeze(this);
  }

  async initialize(
    input: InitializePortfolioExecutionInput
  ): Promise<Result<InitializePortfolioExecutionResult, InitializePortfolioExecutionError>> {
    try {
      const initialized = PortfolioExecution.initialize({
        id: input.executionId,
        portfolioPlanReference: input.portfolioPlanReference,
        planSnapshotReference: input.planSnapshotReference,
        approvalReference: input.approvalReference,
        commandContext: input.commandContext,
        workItems: input.workItems.map((definition) => new PortfolioWorkItem({
          id: definition.workItemId,
          lifecycle: PortfolioWorkItemLifecycle.Pending
        })),
        candidates: input.candidates.map((definition) => new ArtifactCandidate({
          id: definition.candidateId,
          lifecycle: ArtifactCandidateLifecycle.Registered
        }))
      });

      const saveResult = await this.repository.save(initialized.execution);
      if (saveResult.isFailure) {
        return Result.failure(saveResult.error as PortfolioExecutionRepositorySaveFailure);
      }

      return Result.success(new InitializePortfolioExecutionResult({
        summary: PortfolioExecutionSummaryProjection.fromExecution(initialized.execution, [initialized.fact]),
        fact: initialized.fact,
        correlationId: initialized.fact.commandContext.correlationId
      }));
    } catch (error) {
      if (error instanceof PortfolioWorkspaceDomainError) {
        return Result.failure(error);
      }

      throw error;
    }
  }
}
