import {
  AcceptedArtifactId,
  CandidateId,
  ExecutionId,
  PortfolioExecutionCommandContext
} from "@career-companion/portfolio-workspace";

export class AcceptCandidateInput {
  private readonly __acceptCandidateInputBrand!: never;

  readonly executionId: ExecutionId;
  readonly candidateId: CandidateId;
  readonly acceptedArtifactId: AcceptedArtifactId;
  readonly commandContext: PortfolioExecutionCommandContext;

  constructor(input: {
    readonly executionId: ExecutionId;
    readonly candidateId: CandidateId;
    readonly acceptedArtifactId: AcceptedArtifactId;
    readonly commandContext: PortfolioExecutionCommandContext;
  }) {
    assertInstance(input.executionId, ExecutionId);
    assertInstance(input.candidateId, CandidateId);
    assertInstance(input.acceptedArtifactId, AcceptedArtifactId);
    assertInstance(input.commandContext, PortfolioExecutionCommandContext);

    this.executionId = input.executionId;
    this.candidateId = input.candidateId;
    this.acceptedArtifactId = input.acceptedArtifactId;
    this.commandContext = input.commandContext;
    Object.freeze(this);
  }

  equals(other: AcceptCandidateInput | undefined): boolean {
    return other instanceof AcceptCandidateInput
      && this.executionId.equals(other.executionId)
      && this.candidateId.equals(other.candidateId)
      && this.acceptedArtifactId.equals(other.acceptedArtifactId)
      && this.commandContext.equals(other.commandContext);
  }

  toJSON(): {
    readonly executionId: string;
    readonly candidateId: string;
    readonly acceptedArtifactId: string;
    readonly commandContext: ReturnType<PortfolioExecutionCommandContext["toJSON"]>;
  } {
    return {
      executionId: this.executionId.toJSON(),
      candidateId: this.candidateId.toJSON(),
      acceptedArtifactId: this.acceptedArtifactId.toJSON(),
      commandContext: this.commandContext.toJSON()
    };
  }
}

function assertInstance<T>(value: unknown, constructor: new (...args: never[]) => T): asserts value is T {
  if (!(value instanceof constructor)) {
    throw new TypeError("Invalid AcceptCandidateInput value.");
  }
}
