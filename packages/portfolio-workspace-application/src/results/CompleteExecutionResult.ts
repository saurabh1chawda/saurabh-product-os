import {
  PortfolioExecutionCompletedFact,
  PortfolioExecutionSummaryProjection
} from "@career-companion/portfolio-workspace";

export class CompleteExecutionResult {
  private readonly __completeExecutionResultBrand!: never;

  readonly summary: PortfolioExecutionSummaryProjection;
  readonly fact: PortfolioExecutionCompletedFact;
  readonly correlationId: string;

  constructor(input: {
    readonly summary: PortfolioExecutionSummaryProjection;
    readonly fact: PortfolioExecutionCompletedFact;
    readonly correlationId: string;
  }) {
    if (!(input.summary instanceof PortfolioExecutionSummaryProjection)) {
      throw new TypeError("Invalid CompleteExecutionResult summary.");
    }
    assertInstance(input.fact, PortfolioExecutionCompletedFact);
    assertNonEmpty(input.correlationId);

    this.summary = input.summary;
    this.fact = input.fact;
    this.correlationId = input.correlationId;
    Object.freeze(this);
  }

  equals(other: CompleteExecutionResult | undefined): boolean {
    return other instanceof CompleteExecutionResult
      && this.summary.equals(other.summary)
      && this.fact.equals(other.fact)
      && this.correlationId === other.correlationId;
  }

  toJSON(): {
    readonly summary: ReturnType<PortfolioExecutionSummaryProjection["toJSON"]>;
    readonly fact: ReturnType<PortfolioExecutionCompletedFact["toJSON"]>;
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
    throw new TypeError("Invalid CompleteExecutionResult value.");
  }
}

function assertNonEmpty(value: string): void {
  if (value.trim().length === 0) {
    throw new TypeError("CompleteExecutionResult correlationId is required.");
  }
}
