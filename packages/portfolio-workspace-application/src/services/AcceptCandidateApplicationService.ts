import { Result } from "@career-companion/kernel";
import {
  AcceptedArtifactSummaryProjection,
  PortfolioExecutionSummaryProjection,
  PortfolioWorkspaceDomainError
} from "@career-companion/portfolio-workspace";
import { PortfolioExecutionNotFoundError } from "../errors/PortfolioExecutionNotFoundError";
import type { PortfolioExecutionRepositorySaveFailure } from "../errors/PortfolioExecutionRepositoryErrors";
import { AcceptCandidateInput } from "../inputs/AcceptCandidateInput";
import type { PortfolioExecutionRepository } from "../ports/PortfolioExecutionRepository";
import { AcceptCandidateResult } from "../results/AcceptCandidateResult";

export type AcceptCandidateError =
  | PortfolioExecutionNotFoundError
  | PortfolioExecutionRepositorySaveFailure
  | PortfolioWorkspaceDomainError;

export class AcceptCandidateApplicationService {
  private readonly __acceptCandidateApplicationServiceBrand!: never;

  private readonly repository: PortfolioExecutionRepository;

  constructor(input: {
    readonly repository: PortfolioExecutionRepository;
  }) {
    this.repository = input.repository;
    Object.freeze(this);
  }

  async accept(input: AcceptCandidateInput): Promise<Result<AcceptCandidateResult, AcceptCandidateError>> {
    const loaded = await this.repository.loadByExecutionId(input.executionId);
    if (loaded === undefined) {
      return Result.failure(new PortfolioExecutionNotFoundError(input.executionId));
    }
    const execution = loaded.execution;

    try {
      const fact = execution.acceptCandidate(input.candidateId, input.acceptedArtifactId, input.commandContext);
      const saveResult = await this.repository.save(execution, loaded.revision);
      if (saveResult.isFailure) {
        return Result.failure(saveResult.error as PortfolioExecutionRepositorySaveFailure);
      }

      const acceptedArtifact = execution.findAcceptedArtifact(input.acceptedArtifactId);
      if (acceptedArtifact === undefined) {
        throw new Error("Accepted artifact missing after candidate acceptance.");
      }

      return Result.success(new AcceptCandidateResult({
        summary: PortfolioExecutionSummaryProjection.fromExecution(execution, [fact]),
        acceptedArtifactSummary: AcceptedArtifactSummaryProjection.fromAcceptedArtifact(acceptedArtifact),
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
