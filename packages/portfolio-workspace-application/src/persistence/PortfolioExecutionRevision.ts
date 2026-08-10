export class PortfolioExecutionRevision {
  private readonly __portfolioExecutionRevisionBrand!: never;

  readonly value: number;

  constructor(value: number) {
    if (!Number.isInteger(value) || value < 1) {
      throw new Error("PortfolioExecutionRevision must be a positive integer.");
    }

    this.value = value;
    Object.freeze(this);
  }

  next(): PortfolioExecutionRevision {
    return new PortfolioExecutionRevision(this.value + 1);
  }

  equals(other: PortfolioExecutionRevision | undefined): boolean {
    return other instanceof PortfolioExecutionRevision
      && this.value === other.value;
  }

  toJSON(): number {
    return this.value;
  }
}
