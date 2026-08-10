import { Result } from "@career-companion/kernel";
import {
  PortfolioExecutionSummaryProjection,
  PortfolioWorkItemSummaryProjection,
  PortfolioWorkspaceDomainError
} from "@career-companion/portfolio-workspace";
import { PortfolioExecutionNotFoundError } from "../errors/PortfolioExecutionNotFoundError";
import type { PortfolioExecutionRepositorySaveFailure } from "../errors/PortfolioExecutionRepositoryErrors";
import { ActivateWorkItemInput } from "../inputs/ActivateWorkItemInput";
import type { PortfolioExecutionRepository } from "../ports/PortfolioExecutionRepository";
import { ActivateWorkItemResult } from "../results/ActivateWorkItemResult";

export type ActivateWorkItemError =
  | PortfolioExecutionNotFoundError
  | PortfolioExecutionRepositorySaveFailure
  | PortfolioWorkspaceDomainError;

export class ActivateWorkItemApplicationService {
  private readonly __activateWorkItemApplicationServiceBrand!: never;

  private readonly repository: PortfolioExecutionRepository;

  constructor(input: {
    readonly repository: PortfolioExecutionRepository;
  }) {
    this.repository = input.repository;
    Object.freeze(this);
  }

  async activate(input: ActivateWorkItemInput): Promise<Result<ActivateWorkItemResult, ActivateWorkItemError>> {
    const loaded = await this.repository.loadByExecutionId(input.executionId);
    if (loaded === undefined) {
      return Result.failure(new PortfolioExecutionNotFoundError(input.executionId));
    }
    const execution = loaded.execution;

    try {
      const fact = execution.activateWorkItem(input.workItemId, input.commandContext);
      const saveResult = await this.repository.save(execution, loaded.revision);
      if (saveResult.isFailure) {
        return Result.failure(saveResult.error as PortfolioExecutionRepositorySaveFailure);
      }

      const workItem = execution.findWorkItem(input.workItemId);
      if (workItem === undefined) {
        throw new Error("Work item missing after activation.");
      }

      return Result.success(new ActivateWorkItemResult({
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
