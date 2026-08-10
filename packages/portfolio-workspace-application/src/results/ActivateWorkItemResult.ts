import {
  PortfolioExecutionSummaryProjection,
  PortfolioWorkItemActivatedFact,
  PortfolioWorkItemSummaryProjection
} from "@career-companion/portfolio-workspace";

export class ActivateWorkItemResult {
  private readonly __activateWorkItemResultBrand!: never;

  readonly summary: PortfolioExecutionSummaryProjection;
  readonly workItemSummary: PortfolioWorkItemSummaryProjection;
  readonly fact: PortfolioWorkItemActivatedFact;
  readonly correlationId: string;

  constructor(input: {
    readonly summary: PortfolioExecutionSummaryProjection;
    readonly workItemSummary: PortfolioWorkItemSummaryProjection;
    readonly fact: PortfolioWorkItemActivatedFact;
    readonly correlationId: string;
  }) {
    if (!(input.summary instanceof PortfolioExecutionSummaryProjection)) {
      throw new TypeError("Invalid ActivateWorkItemResult summary.");
    }
    if (!(input.workItemSummary instanceof PortfolioWorkItemSummaryProjection)) {
      throw new TypeError("Invalid ActivateWorkItemResult workItemSummary.");
    }
    assertInstance(input.fact, PortfolioWorkItemActivatedFact);
    assertNonEmpty(input.correlationId);

    this.summary = input.summary;
    this.workItemSummary = input.workItemSummary;
    this.fact = input.fact;
    this.correlationId = input.correlationId;
    Object.freeze(this);
  }

  equals(other: ActivateWorkItemResult | undefined): boolean {
    return other instanceof ActivateWorkItemResult
      && this.summary.equals(other.summary)
      && this.workItemSummary.equals(other.workItemSummary)
      && this.fact.equals(other.fact)
      && this.correlationId === other.correlationId;
  }

  toJSON(): {
    readonly summary: ReturnType<PortfolioExecutionSummaryProjection["toJSON"]>;
    readonly workItemSummary: ReturnType<PortfolioWorkItemSummaryProjection["toJSON"]>;
    readonly fact: ReturnType<PortfolioWorkItemActivatedFact["toJSON"]>;
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
    throw new TypeError("Invalid ActivateWorkItemResult value.");
  }
}

function assertNonEmpty(value: string): void {
  if (value.trim().length === 0) {
    throw new TypeError("ActivateWorkItemResult correlationId is required.");
  }
}
