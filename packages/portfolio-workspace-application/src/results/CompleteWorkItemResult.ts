import {
  PortfolioExecutionSummaryProjection,
  PortfolioWorkItemCompletedFact
} from "@career-companion/portfolio-workspace";

export class CompleteWorkItemResult {
  private readonly __completeWorkItemResultBrand!: never;

  readonly summary: PortfolioExecutionSummaryProjection;
  readonly fact: PortfolioWorkItemCompletedFact;
  readonly correlationId: string;

  constructor(input: {
    readonly summary: PortfolioExecutionSummaryProjection;
    readonly fact: PortfolioWorkItemCompletedFact;
    readonly correlationId: string;
  }) {
    if (!(input.summary instanceof PortfolioExecutionSummaryProjection)) {
      throw new TypeError("Invalid CompleteWorkItemResult summary.");
    }
    assertInstance(input.fact, PortfolioWorkItemCompletedFact);
    assertNonEmpty(input.correlationId);

    this.summary = input.summary;
    this.fact = input.fact;
    this.correlationId = input.correlationId;
    Object.freeze(this);
  }

  equals(other: CompleteWorkItemResult | undefined): boolean {
    return other instanceof CompleteWorkItemResult
      && this.summary.equals(other.summary)
      && this.fact.equals(other.fact)
      && this.correlationId === other.correlationId;
  }

  toJSON(): {
    readonly summary: ReturnType<PortfolioExecutionSummaryProjection["toJSON"]>;
    readonly fact: ReturnType<PortfolioWorkItemCompletedFact["toJSON"]>;
    readonly correlationId: string;
  } {
    return {
      summary: this.summary.toJSON(),
      fact: this.fact.toJSON(),
      correlationId: this.correlationId
    };
  }
}

function assertInstance<T>(value: unknown, constructor: new (...args: never[]) => T): asserts value is T {
  if (!(value instanceof constructor)) {
    throw new TypeError("Invalid CompleteWorkItemResult value.");
  }
}

function assertNonEmpty(value: string): void {
  if (value.trim().length === 0) {
    throw new TypeError("CompleteWorkItemResult correlationId is required.");
  }
}
