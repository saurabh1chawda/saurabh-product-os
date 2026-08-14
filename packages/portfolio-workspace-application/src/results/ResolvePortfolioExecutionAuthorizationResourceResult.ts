import {
  ExecutionId,
  PortfolioWorkspaceAuthorizationResourceReference
} from "@career-companion/portfolio-workspace";

export class ResolvePortfolioExecutionAuthorizationResourceResult {
  private readonly __resolvePortfolioExecutionAuthorizationResourceResultBrand!: never;

  readonly executionId: ExecutionId;
  readonly authorizationResourceReference: PortfolioWorkspaceAuthorizationResourceReference;
  readonly correlationId: string | undefined;

  constructor(input: {
    readonly executionId: ExecutionId;
    readonly authorizationResourceReference: PortfolioWorkspaceAuthorizationResourceReference;
    readonly correlationId?: string;
  }) {
    assertInstance(input.executionId, ExecutionId);
    assertInstance(input.authorizationResourceReference, PortfolioWorkspaceAuthorizationResourceReference);
    if (input.correlationId !== undefined) {
      assertNonEmpty(input.correlationId);
    }

    this.executionId = input.executionId;
    this.authorizationResourceReference = input.authorizationResourceReference;
    this.correlationId = input.correlationId;
    Object.freeze(this);
  }

  equals(other: ResolvePortfolioExecutionAuthorizationResourceResult | undefined): boolean {
    return other instanceof ResolvePortfolioExecutionAuthorizationResourceResult
      && this.executionId.equals(other.executionId)
      && this.authorizationResourceReference.equals(other.authorizationResourceReference)
      && this.correlationId === other.correlationId;
  }

  toJSON(): {
    readonly executionId: string;
    readonly authorizationResourceReference: ReturnType<PortfolioWorkspaceAuthorizationResourceReference["toJSON"]>;
    readonly correlationId?: string;
  } {
    return {
      executionId: this.executionId.toJSON(),
      authorizationResourceReference: this.authorizationResourceReference.toJSON(),
      ...(this.correlationId === undefined ? {} : { correlationId: this.correlationId })
    };
  }
}

function assertInstance<T>(value: unknown, constructor: new (...args: never[]) => T): asserts value is T {
  if (!(value instanceof constructor)) {
    throw new TypeError("Invalid ResolvePortfolioExecutionAuthorizationResourceResult value.");
  }
}

function assertNonEmpty(value: string): void {
  if (value.trim().length === 0) {
    throw new TypeError("ResolvePortfolioExecutionAuthorizationResourceResult correlationId is required when supplied.");
  }
}
