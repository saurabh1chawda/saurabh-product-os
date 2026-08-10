import { Result } from "@career-companion/kernel";
import type {
  ExecutionId,
  PortfolioExecution
} from "@career-companion/portfolio-workspace";
import type { PortfolioExecutionRepositorySaveFailure } from "../errors/PortfolioExecutionRepositoryErrors";
import type { LoadedPortfolioExecution } from "../persistence/LoadedPortfolioExecution";
import type { PortfolioExecutionRevision } from "../persistence/PortfolioExecutionRevision";
import type { PortfolioExecutionSaveResult } from "../persistence/PortfolioExecutionSaveResult";

export interface PortfolioExecutionRepository {
  loadByExecutionId(executionId: ExecutionId): Promise<LoadedPortfolioExecution | undefined>;
  save(
    execution: PortfolioExecution,
    expectedRevision?: PortfolioExecutionRevision
  ): Promise<Result<PortfolioExecutionSaveResult, PortfolioExecutionRepositorySaveFailure>>;
}
