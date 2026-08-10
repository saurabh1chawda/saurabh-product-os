import {
  ArtifactCandidateRejectedFact,
  PortfolioExecutionSummaryProjection
} from "@career-companion/portfolio-workspace";

export class RejectCandidateResult {
  private readonly __rejectCandidateResultBrand!: never;

  readonly summary: PortfolioExecutionSummaryProjection;
  readonly fact: ArtifactCandidateRejectedFact;
  readonly correlationId: string;

  constructor(input: {
    readonly summary: PortfolioExecutionSummaryProjection;
    readonly fact: ArtifactCandidateRejectedFact;
    readonly correlationId: string;
  }) {
    if (!(input.summary instanceof PortfolioExecutionSummaryProjection)) {
      throw new TypeError("Invalid RejectCandidateResult summary.");
    }
    assertInstance(input.fact, ArtifactCandidateRejectedFact);
    assertNonEmpty(input.correlationId);

    this.summary = input.summary;
    this.fact = input.fact;
    this.correlationId = input.correlationId;
    Object.freeze(this);
  }

  equals(other: RejectCandidateResult | undefined): boolean {
    return other instanceof RejectCandidateResult
      && this.summary.equals(other.summary)
      && this.fact.equals(other.fact)
      && this.correlationId === other.correlationId;
  }

  toJSON(): {
    readonly summary: ReturnType<PortfolioExecutionSummaryProjection["toJSON"]>;
    readonly fact: ReturnType<ArtifactCandidateRejectedFact["toJSON"]>;
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
    throw new TypeError("Invalid RejectCandidateResult value.");
  }
}

function assertNonEmpty(value: string): void {
  if (value.trim().length === 0) {
    throw new TypeError("RejectCandidateResult correlationId is required.");
  }
}
