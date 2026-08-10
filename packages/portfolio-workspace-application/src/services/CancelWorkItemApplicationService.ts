import { Result } from "@career-companion/kernel";
import {
  PortfolioExecutionSummaryProjection,
  PortfolioWorkItemSummaryProjection,
  PortfolioWorkspaceDomainError
} from "@career-companion/portfolio-workspace";
import { PortfolioExecutionNotFoundError } from "../errors/PortfolioExecutionNotFoundError";
import type { PortfolioExecutionRepositorySaveFailure } from "../errors/PortfolioExecutionRepositoryErrors";
import { CancelWorkItemInput } from "../inputs/CancelWorkItemInput";
import type { PortfolioExecutionRepository } from "../ports/PortfolioExecutionRepository";
import { CancelWorkItemResult } from "../results/CancelWorkItemResult";

export type CancelWorkItemError =
  | PortfolioExecutionNotFoundError
  | PortfolioExecutionRepositorySaveFailure
  | PortfolioWorkspaceDomainError;

export class CancelWorkItemApplicationService {
  private readonly __cancelWorkItemApplicationServiceBrand!: never;

  private readonly repository: PortfolioExecutionRepository;

  constructor(input: {
    readonly repository: PortfolioExecutionRepository;
  }) {
    this.repository = input.repository;
    Object.freeze(this);
  }

  async cancel(input: CancelWorkItemInput): Promise<Result<CancelWorkItemResult, CancelWorkItemError>> {
    const loaded = await this.repository.loadByExecutionId(input.executionId);
    if (loaded === undefined) {
      return Result.failure(new PortfolioExecutionNotFoundError(input.executionId));
    }
    const execution = loaded.execution;

    try {
      const fact = execution.cancelWorkItem(input.workItemId, input.commandContext);
      const saveResult = await this.repository.save(execution, loaded.revision);
      if (saveResult.isFailure) {
        return Result.failure(saveResult.error as PortfolioExecutionRepositorySaveFailure);
      }

      const workItem = execution.findWorkItem(input.workItemId);
      if (workItem === undefined) {
        throw new Error("Work item missing after cancellation.");
      }

      return Result.success(new CancelWorkItemResult({
        summary: PortfolioExecutionSummaryProjection.fromExecution(execution, [fact]),
        workItemSummary: PortfolioWorkItemSummaryProjection.fromWorkItem(workItem),
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
