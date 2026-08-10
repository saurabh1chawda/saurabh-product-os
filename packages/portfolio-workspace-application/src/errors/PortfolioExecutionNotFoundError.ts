import { ExecutionId } from "@career-companion/portfolio-workspace";

export class PortfolioExecutionNotFoundError extends Error {
  private readonly __portfolioExecutionNotFoundErrorBrand!: never;

  readonly executionId: ExecutionId;

  constructor(executionId: ExecutionId) {
    super("Portfolio execution was not found.");
    this.name = "PortfolioExecutionNotFoundError";
    this.executionId = executionId;
    Object.freeze(this);
  }

  equals(other: PortfolioExecutionNotFoundError | undefined): boolean {
    return other instanceof PortfolioExecutionNotFoundError
      && this.executionId.equals(other.executionId);
  }

  toJSON(): {
    readonly name: "PortfolioExecutionNotFoundError";
    readonly executionId: string;
  } {
    return {
      name: "PortfolioExecutionNotFoundError",
      executionId: this.executionId.toJSON()
    };
  }
}
