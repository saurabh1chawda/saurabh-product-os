import { Result } from "@career-companion/kernel";
import {
  PortfolioExecutionSummaryProjection,
  PortfolioWorkspaceDomainError
} from "@career-companion/portfolio-workspace";
import { PortfolioExecutionNotFoundError } from "../errors/PortfolioExecutionNotFoundError";
import type { PortfolioExecutionRepositorySaveFailure } from "../errors/PortfolioExecutionRepositoryErrors";
import { CancelExecutionInput } from "../inputs/CancelExecutionInput";
import type { PortfolioExecutionRepository } from "../ports/PortfolioExecutionRepository";
import { CancelExecutionResult } from "../results/CancelExecutionResult";

export type CancelExecutionError =
  | PortfolioExecutionNotFoundError
  | PortfolioExecutionRepositorySaveFailure
  | PortfolioWorkspaceDomainError;

export class CancelExecutionApplicationService {
  private readonly __cancelExecutionApplicationServiceBrand!: never;

  private readonly repository: PortfolioExecutionRepository;

  constructor(input: {
    readonly repository: PortfolioExecutionRepository;
  }) {
    this.repository = input.repository;
    Object.freeze(this);
  }

  async cancel(input: CancelExecutionInput): Promise<Result<CancelExecutionResult, CancelExecutionError>> {
    const loaded = await this.repository.loadByExecutionId(input.executionId);
    if (loaded === undefined) {
      return Result.failure(new PortfolioExecutionNotFoundError(input.executionId));
    }
    const execution = loaded.execution;

    try {
      const fact = execution.cancelExecution(input.commandContext);
      const saveResult = await this.repository.save(execution, loaded.revision);
      if (saveResult.isFailure) {
        return Result.failure(saveResult.error as PortfolioExecutionRepositorySaveFailure);
      }

      return Result.success(new CancelExecutionResult({
        summary: PortfolioExecutionSummaryProjection.fromExecution(execution, [fact]),
        fact,
        correlationId: fact.commandContext.correlationId
      }));
    } catch (error) {
      if (error instanceof PortfolioWorkspaceDomainError) {
        return Result.failure(error);
      }

      throw error;
    }
  }
}
