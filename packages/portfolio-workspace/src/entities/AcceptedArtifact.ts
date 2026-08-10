import { InvalidExecutionOperationError } from "../errors/PortfolioWorkspaceDomainErrors";
import { AcceptedArtifactId } from "../value-objects/AcceptedArtifactId";

export class AcceptedArtifact {
  private readonly __acceptedArtifactBrand!: never;

  readonly id: AcceptedArtifactId;

  constructor(input: {
    readonly id: AcceptedArtifactId;
  }) {
    if (!(input.id instanceof AcceptedArtifactId)) {
      throw new InvalidExecutionOperationError();
    }

    this.id = input.id;
    Object.freeze(this);
  }

  equals(other: AcceptedArtifact | undefined): boolean {
    return other instanceof AcceptedArtifact && this.id.equals(other.id);
  }

  toJSON(): {
    readonly id: string;
  } {
    return {
      id: this.id.toJSON()
    };
  }
}
