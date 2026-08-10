import { PortfolioExecutionRevision } from "./PortfolioExecutionRevision";

export class PortfolioExecutionSaveResult {
  private readonly __portfolioExecutionSaveResultBrand!: never;

  readonly revision: PortfolioExecutionRevision;

  constructor(input: {
    readonly revision: PortfolioExecutionRevision;
  }) {
    this.revision = input.revision;
    Object.freeze(this);
  }

  equals(other: PortfolioExecutionSaveResult | undefined): boolean {
    return other instanceof PortfolioExecutionSaveResult
      && this.revision.equals(other.revision);
  }

  toJSON(): {
    readonly revision: number;
  } {
    return {
      revision: this.revision.toJSON()
    };
  }
}
