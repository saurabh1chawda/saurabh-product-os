import type { PortfolioExecution } from "@career-companion/portfolio-workspace";
import { PortfolioExecutionRevision } from "./PortfolioExecutionRevision";

export class LoadedPortfolioExecution {
  private readonly __loadedPortfolioExecutionBrand!: never;

  readonly execution: PortfolioExecution;
  readonly revision: PortfolioExecutionRevision;

  constructor(input: {
    readonly execution: PortfolioExecution;
    readonly revision: PortfolioExecutionRevision;
  }) {
    this.execution = input.execution;
    this.revision = input.revision;
    Object.freeze(this);
  }
}
