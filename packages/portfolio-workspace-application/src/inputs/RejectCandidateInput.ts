import {
  CandidateId,
  ExecutionId,
  PortfolioExecutionCommandContext
} from "@career-companion/portfolio-workspace";

export class RejectCandidateInput {
  private readonly __rejectCandidateInputBrand!: never;

  readonly executionId: ExecutionId;
  readonly candidateId: CandidateId;
  readonly commandContext: PortfolioExecutionCommandContext;

  constructor(input: {
    readonly executionId: ExecutionId;
    readonly candidateId: CandidateId;
    readonly commandContext: PortfolioExecutionCommandContext;
  }) {
    assertInstance(input.executionId, ExecutionId);
    assertInstance(input.candidateId, CandidateId);
    assertInstance(input.commandContext, PortfolioExecutionCommandContext);

    this.executionId = input.executionId;
    this.candidateId = input.candidateId;
    this.commandContext = input.commandContext;
    Object.freeze(this);
  }

  equals(other: RejectCandidateInput | undefined): boolean {
    return other instanceof RejectCandidateInput
      && this.executionId.equals(other.executionId)
      && this.candidateId.equals(other.candidateId)
      && this.commandContext.equals(other.commandContext);
  }

  toJSON(): {
    readonly executionId: string;
    readonly candidateId: string;
    readonly commandContext: ReturnType<PortfolioExecutionCommandContext["toJSON"]>;
  } {
    return {
      executionId: this.executionId.toJSON(),
      candidateId: this.candidateId.toJSON(),
      commandContext: this.commandContext.toJSON()
    };
  }
}

function assertInstance<T>(value: unknown, constructor: new (...args: never[]) => T): asserts value is T {
  if (!(value instanceof constructor)) {
    throw new TypeError("Invalid RejectCandidateInput value.");
  }
}
