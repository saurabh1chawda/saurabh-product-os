import { ExecutionId } from "@career-companion/portfolio-workspace";

export class ResolvePortfolioExecutionAuthorizationResourceInput {
  private readonly __resolvePortfolioExecutionAuthorizationResourceInputBrand!: never;

  readonly executionId: ExecutionId;
  readonly correlationId: string | undefined;

  constructor(input: {
    readonly executionId: ExecutionId;
    readonly correlationId?: string;
  }) {
    assertInstance(input.executionId, ExecutionId);
    if (input.correlationId !== undefined) {
      assertNonEmpty(input.correlationId);
    }

    this.executionId = input.executionId;
    this.correlationId = input.correlationId;
    Object.freeze(this);
  }

  equals(other: ResolvePortfolioExecutionAuthorizationResourceInput | undefined): boolean {
    return other instanceof ResolvePortfolioExecutionAuthorizationResourceInput
      && this.executionId.equals(other.executionId)
      && this.correlationId === other.correlationId;
  }

  toJSON(): {
    readonly executionId: string;
    readonly correlationId?: string;
  } {
    return {
      executionId: this.executionId.toJSON(),
      ...(this.correlationId === undefined ? {} : { correlationId: this.correlationId })
    };
  }
}

function assertInstance<T>(value: unknown, constructor: new (...args: never[]) => T): asserts value is T {
  if (!(value instanceof constructor)) {
    throw new TypeError("Invalid ResolvePortfolioExecutionAuthorizationResourceInput value.");
  }
}

function assertNonEmpty(value: string): void {
  if (value.trim().length === 0) {
    throw new TypeError("ResolvePortfolioExecutionAuthorizationResourceInput correlationId is required when supplied.");
  }
}
