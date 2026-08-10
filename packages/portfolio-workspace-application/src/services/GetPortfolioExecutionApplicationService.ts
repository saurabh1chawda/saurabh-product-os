import { Result } from "@career-companion/kernel";
import { PortfolioExecutionSummaryProjection } from "@career-companion/portfolio-workspace";
import { PortfolioExecutionNotFoundError } from "../errors/PortfolioExecutionNotFoundError";
import { GetPortfolioExecutionInput } from "../inputs/GetPortfolioExecutionInput";
import type { PortfolioExecutionRepository } from "../ports/PortfolioExecutionRepository";
import { GetPortfolioExecutionResult } from "../results/GetPortfolioExecutionResult";

export type GetPortfolioExecutionError =
  | PortfolioExecutionNotFoundError;

export class GetPortfolioExecutionApplicationService {
  private readonly __getPortfolioExecutionApplicationServiceBrand!: never;

  private readonly repository: PortfolioExecutionRepository;

  constructor(input: {
    readonly repository: PortfolioExecutionRepository;
  }) {
    this.repository = input.repository;
    Object.freeze(this);
  }

  async get(input: GetPortfolioExecutionInput): Promise<Result<GetPortfolioExecutionResult, GetPortfolioExecutionError>> {
    const loaded = await this.repository.loadByExecutionId(input.executionId);
    if (loaded === undefined) {
      return Result.failure(new PortfolioExecutionNotFoundError(input.executionId));
    }

    return Result.success(new GetPortfolioExecutionResult({
      summary: PortfolioExecutionSummaryProjection.fromExecution(loaded.execution),
      correlationId: input.correlationId
    }));
  }
}
