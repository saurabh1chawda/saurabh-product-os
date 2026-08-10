import {
  PortfolioExecutionSummaryProjection,
  PortfolioWorkItemCancelledFact,
  PortfolioWorkItemSummaryProjection
} from "@career-companion/portfolio-workspace";

export class CancelWorkItemResult {
  private readonly __cancelWorkItemResultBrand!: never;

  readonly summary: PortfolioExecutionSummaryProjection;
  readonly workItemSummary: PortfolioWorkItemSummaryProjection;
  readonly fact: PortfolioWorkItemCancelledFact;
  readonly correlationId: string;

  constructor(input: {
    readonly summary: PortfolioExecutionSummaryProjection;
    readonly workItemSummary: PortfolioWorkItemSummaryProjection;
    readonly fact: PortfolioWorkItemCancelledFact;
    readonly correlationId: string;
  }) {
    if (!(input.summary instanceof PortfolioExecutionSummaryProjection)) {
      throw new TypeError("Invalid CancelWorkItemResult summary.");
    }
    if (!(input.workItemSummary instanceof PortfolioWorkItemSummaryProjection)) {
      throw new TypeError("Invalid CancelWorkItemResult workItemSummary.");
    }
    assertInstance(input.fact, PortfolioWorkItemCancelledFact);
    assertNonEmpty(input.correlationId);

    this.summary = input.summary;
    this.workItemSummary = input.workItemSummary;
    this.fact = input.fact;
    this.correlationId = input.correlationId;
    Object.freeze(this);
  }

  equals(other: CancelWorkItemResult | undefined): boolean {
    return other instanceof CancelWorkItemResult
      && this.summary.equals(other.summary)
      && this.workItemSummary.equals(other.workItemSummary)
      && this.fact.equals(other.fact)
      && this.correlationId === other.correlationId;
  }

  toJSON(): {
    readonly summary: ReturnType<PortfolioExecutionSummaryProjection["toJSON"]>;
    readonly workItemSummary: ReturnType<PortfolioWorkItemSummaryProjection["toJSON"]>;
    readonly fact: ReturnType<PortfolioWorkItemCancelledFact["toJSON"]>;
    readonly correlationId: string;
  } {
    return {
      summary: this.summary.toJSON(),
      workItemSummary: this.workItemSummary.toJSON(),
      fact: this.fact.toJSON(),
      correlationId: this.correlationId
    };
  }
}

function assertInstance<T>(value: unknown, constructor: new (...args: never[]) => T): asserts value is T {
  if (!(value instanceof constructor)) {
    throw new TypeError("Invalid CancelWorkItemResult value.");
  }
}

function assertNonEmpty(value: string): void {
  if (value.trim().length === 0) {
    throw new TypeError("CancelWorkItemResult correlationId is required.");
  }
}
