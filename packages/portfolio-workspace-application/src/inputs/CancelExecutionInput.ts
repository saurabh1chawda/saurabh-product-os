import {
  ExecutionId,
  PortfolioExecutionCommandContext
} from "@career-companion/portfolio-workspace";

export class CancelExecutionInput {
  private readonly __cancelExecutionInputBrand!: never;

  readonly executionId: ExecutionId;
  readonly commandContext: PortfolioExecutionCommandContext;

  constructor(input: {
    readonly executionId: ExecutionId;
    readonly commandContext: PortfolioExecutionCommandContext;
  }) {
    assertInstance(input.executionId, ExecutionId);
    assertInstance(input.commandContext, PortfolioExecutionCommandContext);

    this.executionId = input.executionId;
    this.commandContext = input.commandContext;
    Object.freeze(this);
  }

  equals(other: CancelExecutionInput | undefined): boolean {
    return other instanceof CancelExecutionInput
      && this.executionId.equals(other.executionId)
      && this.commandContext.equals(other.commandContext);
  }

  toJSON(): {
    readonly executionId: string;
    readonly commandContext: ReturnType<PortfolioExecutionCommandContext["toJSON"]>;
  } {
    return {
      executionId: this.executionId.toJSON(),
      commandContext: this.commandContext.toJSON()
    };
  }
}

function assertInstance<T>(value: unknown, constructor: new (...args: never[]) => T): asserts value is T {
  if (!(value instanceof constructor)) {
    throw new TypeError("Invalid CancelExecutionInput value.");
  }
}
