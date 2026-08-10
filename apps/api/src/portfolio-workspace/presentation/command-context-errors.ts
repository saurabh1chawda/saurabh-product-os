export const PortfolioWorkspacePresentationContextErrorReason = {
  InvalidPrincipal: "invalid-principal",
  InvalidActorReference: "invalid-actor-reference",
  InvalidCorrelationId: "invalid-correlation-id",
  CorrelationIdGenerationFailed: "correlation-id-generation-failed",
  CommandIdGenerationFailed: "command-id-generation-failed",
  ClockFailed: "clock-failed",
  CommandContextConstructionFailed: "command-context-construction-failed"
} as const;

export type PortfolioWorkspacePresentationContextErrorReasonValue =
  (typeof PortfolioWorkspacePresentationContextErrorReason)[keyof typeof PortfolioWorkspacePresentationContextErrorReason];

export interface PortfolioWorkspacePresentationContextErrorJson {
  readonly name: "PortfolioWorkspacePresentationContextError";
  readonly reason: PortfolioWorkspacePresentationContextErrorReasonValue;
  readonly message: string;
}

export class PortfolioWorkspacePresentationContextError {
  readonly name = "PortfolioWorkspacePresentationContextError";
  readonly reason: PortfolioWorkspacePresentationContextErrorReasonValue;
  readonly message: string;

  private constructor(
    reason: PortfolioWorkspacePresentationContextErrorReasonValue,
    message: string
  ) {
    this.reason = reason;
    this.message = message;

    Object.freeze(this);
  }

  static invalidPrincipal(message: string): PortfolioWorkspacePresentationContextError {
    return new PortfolioWorkspacePresentationContextError(
      PortfolioWorkspacePresentationContextErrorReason.InvalidPrincipal,
      message
    );
  }

  static invalidActorReference(): PortfolioWorkspacePresentationContextError {
    return new PortfolioWorkspacePresentationContextError(
      PortfolioWorkspacePresentationContextErrorReason.InvalidActorReference,
      "Authenticated principal could not be mapped to an actor reference."
    );
  }

  static invalidCorrelationId(): PortfolioWorkspacePresentationContextError {
    return new PortfolioWorkspacePresentationContextError(
      PortfolioWorkspacePresentationContextErrorReason.InvalidCorrelationId,
      "Correlation identifier is not safe for presentation mapping."
    );
  }

  static correlationIdGenerationFailed(): PortfolioWorkspacePresentationContextError {
    return new PortfolioWorkspacePresentationContextError(
      PortfolioWorkspacePresentationContextErrorReason.CorrelationIdGenerationFailed,
      "Trusted correlation identifier generation failed."
    );
  }

  static commandIdGenerationFailed(): PortfolioWorkspacePresentationContextError {
    return new PortfolioWorkspacePresentationContextError(
      PortfolioWorkspacePresentationContextErrorReason.CommandIdGenerationFailed,
      "Trusted command identifier generation failed."
    );
  }

  static clockFailed(): PortfolioWorkspacePresentationContextError {
    return new PortfolioWorkspacePresentationContextError(
      PortfolioWorkspacePresentationContextErrorReason.ClockFailed,
      "Trusted host clock failed."
    );
  }

  static commandContextConstructionFailed(): PortfolioWorkspacePresentationContextError {
    return new PortfolioWorkspacePresentationContextError(
      PortfolioWorkspacePresentationContextErrorReason.CommandContextConstructionFailed,
      "Portfolio Workspace command context could not be constructed."
    );
  }

  toJSON(): PortfolioWorkspacePresentationContextErrorJson {
    return {
      name: this.name,
      reason: this.reason,
      message: this.message
    };
  }
}
