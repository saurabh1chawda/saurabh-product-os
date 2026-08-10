import { PortfolioExecutionSummaryProjection } from "@career-companion/portfolio-workspace";

export class GetPortfolioExecutionResult {
  private readonly __getPortfolioExecutionResultBrand!: never;

  readonly summary: PortfolioExecutionSummaryProjection;
  readonly correlationId: string | undefined;

  constructor(input: {
    readonly summary: PortfolioExecutionSummaryProjection;
    readonly correlationId?: string;
  }) {
    if (!(input.summary instanceof PortfolioExecutionSummaryProjection)) {
      throw new TypeError("Invalid GetPortfolioExecutionResult summary.");
    }
    if (input.correlationId !== undefined) {
      assertNonEmpty(input.correlationId);
    }

    this.summary = input.summary;
    this.correlationId = input.correlationId;
    Object.freeze(this);
  }

  equals(other: GetPortfolioExecutionResult | undefined): boolean {
    return other instanceof GetPortfolioExecutionResult
      && this.summary.equals(other.summary)
      && this.correlationId === other.correlationId;
  }

  toJSON(): {
    readonly summary: ReturnType<PortfolioExecutionSummaryProjection["toJSON"]>;
    readonly correlationId?: string;
  } {
    return {
      summary: this.summary.toJSON(),
      ...(this.correlationId === undefined ? {} : { correlationId: this.correlationId })
    };
  }
}

function assertNonEmpty(value: string): void {
  if (value.trim().length === 0) {
    throw new TypeError("GetPortfolioExecutionResult correlationId is required when supplied.");
  }
}
