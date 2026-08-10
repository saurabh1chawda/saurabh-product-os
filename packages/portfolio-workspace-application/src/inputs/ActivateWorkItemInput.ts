import {
  ExecutionId,
  PortfolioExecutionCommandContext,
  WorkItemId
} from "@career-companion/portfolio-workspace";

export class ActivateWorkItemInput {
  private readonly __activateWorkItemInputBrand!: never;

  readonly executionId: ExecutionId;
  readonly workItemId: WorkItemId;
  readonly commandContext: PortfolioExecutionCommandContext;

  constructor(input: {
    readonly executionId: ExecutionId;
    readonly workItemId: WorkItemId;
    readonly commandContext: PortfolioExecutionCommandContext;
  }) {
    assertInstance(input.executionId, ExecutionId);
    assertInstance(input.workItemId, WorkItemId);
    assertInstance(input.commandContext, PortfolioExecutionCommandContext);

    this.executionId = input.executionId;
    this.workItemId = input.workItemId;
    this.commandContext = input.commandContext;
    Object.freeze(this);
  }

  equals(other: ActivateWorkItemInput | undefined): boolean {
    return other instanceof ActivateWorkItemInput
      && this.executionId.equals(other.executionId)
      && this.workItemId.equals(other.workItemId)
      && this.commandContext.equals(other.commandContext);
  }

  toJSON(): {
    readonly executionId: string;
    readonly workItemId: string;
    readonly commandContext: ReturnType<PortfolioExecutionCommandContext["toJSON"]>;
  } {
    return {
      executionId: this.executionId.toJSON(),
      workItemId: this.workItemId.toJSON(),
      commandContext: this.commandContext.toJSON()
    };
  }
}

function assertInstance<T>(value: unknown, constructor: new (...args: never[]) => T): asserts value is T {
  if (!(value instanceof constructor)) {
    throw new TypeError("Invalid ActivateWorkItemInput value.");
  }
}
