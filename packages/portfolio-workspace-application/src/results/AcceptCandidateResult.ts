import {
  AcceptedArtifactSummaryProjection,
  ArtifactCandidateAcceptedFact,
  PortfolioExecutionSummaryProjection
} from "@career-companion/portfolio-workspace";

export class AcceptCandidateResult {
  private readonly __acceptCandidateResultBrand!: never;

  readonly summary: PortfolioExecutionSummaryProjection;
  readonly acceptedArtifactSummary: AcceptedArtifactSummaryProjection;
  readonly fact: ArtifactCandidateAcceptedFact;
  readonly correlationId: string;

  constructor(input: {
    readonly summary: PortfolioExecutionSummaryProjection;
    readonly acceptedArtifactSummary: AcceptedArtifactSummaryProjection;
    readonly fact: ArtifactCandidateAcceptedFact;
    readonly correlationId: string;
  }) {
    if (!(input.summary instanceof PortfolioExecutionSummaryProjection)) {
      throw new TypeError("Invalid AcceptCandidateResult summary.");
    }
    if (!(input.acceptedArtifactSummary instanceof AcceptedArtifactSummaryProjection)) {
      throw new TypeError("Invalid AcceptCandidateResult acceptedArtifactSummary.");
    }
    assertInstance(input.fact, ArtifactCandidateAcceptedFact);
    assertNonEmpty(input.correlationId);

    this.summary = input.summary;
    this.acceptedArtifactSummary = input.acceptedArtifactSummary;
    this.fact = input.fact;
    this.correlationId = input.correlationId;
    Object.freeze(this);
  }

  equals(other: AcceptCandidateResult | undefined): boolean {
    return other instanceof AcceptCandidateResult
      && this.summary.equals(other.summary)
      && this.acceptedArtifactSummary.equals(other.acceptedArtifactSummary)
      && this.fact.equals(other.fact)
      && this.correlationId === other.correlationId;
  }

  toJSON(): {
    readonly summary: ReturnType<PortfolioExecutionSummaryProjection["toJSON"]>;
    readonly acceptedArtifactSummary: ReturnType<AcceptedArtifactSummaryProjection["toJSON"]>;
    readonly fact: ReturnType<ArtifactCandidateAcceptedFact["toJSON"]>;
    readonly correlationId: string;
  } {
    return {
      summary: this.summary.toJSON(),
      acceptedArtifactSummary: this.acceptedArtifactSummary.toJSON(),
      fact: this.fact.toJSON(),
      correlationId: this.correlationId
    };
  }
}

function assertInstance<T>(value: unknown, constructor: new (...args: never[]) => T): asserts value is T {
  if (!(value instanceof constructor)) {
    throw new TypeError("Invalid AcceptCandidateResult value.");
  }
}

function assertNonEmpty(value: string): void {
  if (value.trim().length === 0) {
    throw new TypeError("AcceptCandidateResult correlationId is required.");
  }
}
