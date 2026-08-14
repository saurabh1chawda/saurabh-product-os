import { Result } from "@career-companion/kernel";
import { PortfolioExecutionNotFoundError } from "../errors/PortfolioExecutionNotFoundError";
import { ResolvePortfolioExecutionAuthorizationResourceInput } from "../inputs/ResolvePortfolioExecutionAuthorizationResourceInput";
import type { PortfolioExecutionRepository } from "../ports/PortfolioExecutionRepository";
import { ResolvePortfolioExecutionAuthorizationResourceResult } from "../results/ResolvePortfolioExecutionAuthorizationResourceResult";

export type ResolvePortfolioExecutionAuthorizationResourceError =
  | PortfolioExecutionNotFoundError;

export class ResolvePortfolioExecutionAuthorizationResourceApplicationService {
  private readonly __resolvePortfolioExecutionAuthorizationResourceApplicationServiceBrand!: never;

  private readonly repository: PortfolioExecutionRepository;

  constructor(input: {
    readonly repository: PortfolioExecutionRepository;
  }) {
    this.repository = input.repository;
    Object.freeze(this);
  }

  async resolve(
    input: ResolvePortfolioExecutionAuthorizationResourceInput
  ): Promise<Result<ResolvePortfolioExecutionAuthorizationResourceResult, ResolvePortfolioExecutionAuthorizationResourceError>> {
    const loaded = await this.repository.loadByExecutionId(input.executionId);
    if (loaded === undefined) {
      return Result.failure(new PortfolioExecutionNotFoundError(input.executionId));
    }

    return Result.success(new ResolvePortfolioExecutionAuthorizationResourceResult({
      executionId: loaded.execution.id,
      authorizationResourceReference: loaded.execution.authorizationResourceReference,
      correlationId: input.correlationId
    }));
  }
}
