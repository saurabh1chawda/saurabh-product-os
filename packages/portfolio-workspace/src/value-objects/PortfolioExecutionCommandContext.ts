import { InvalidPortfolioWorkspaceIdentifierError } from "../errors/InvalidPortfolioWorkspaceIdentifierError";

export interface PortfolioExecutionCommandContextJson {
  readonly commandId: string;
  readonly correlationId: string;
  readonly actorReference: string;
  readonly occurredAt: string;
}

export class PortfolioExecutionCommandContext {
  private readonly __portfolioExecutionCommandContextBrand!: never;

  readonly commandId: string;
  readonly correlationId: string;
  readonly actorReference: string;
  readonly occurredAt: string;

  constructor(input: PortfolioExecutionCommandContextJson) {
    assertRequiredString(input.commandId, "PortfolioExecutionCommandContext.commandId");
    assertRequiredString(input.correlationId, "PortfolioExecutionCommandContext.correlationId");
    assertRequiredString(input.actorReference, "PortfolioExecutionCommandContext.actorReference");
    assertRequiredString(input.occurredAt, "PortfolioExecutionCommandContext.occurredAt");

    this.commandId = input.commandId;
    this.correlationId = input.correlationId;
    this.actorReference = input.actorReference;
    this.occurredAt = input.occurredAt;
    Object.freeze(this);
  }

  equals(other: PortfolioExecutionCommandContext | undefined): boolean {
    return other instanceof PortfolioExecutionCommandContext
      && this.commandId === other.commandId
      && this.correlationId === other.correlationId
      && this.actorReference === other.actorReference
      && this.occurredAt === other.occurredAt;
  }

  toJSON(): PortfolioExecutionCommandContextJson {
    return {
      commandId: this.commandId,
      correlationId: this.correlationId,
      actorReference: this.actorReference,
      occurredAt: this.occurredAt
    };
  }
}

function assertRequiredString(value: string, name: string): void {
  if (value.trim().length === 0) {
    throw new InvalidPortfolioWorkspaceIdentifierError(name);
  }
}
