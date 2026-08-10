import { InvalidPortfolioWorkspaceIdentifierError } from "../errors/InvalidPortfolioWorkspaceIdentifierError";

export class AcceptedArtifactId {
  private readonly __acceptedArtifactIdBrand!: never;

  readonly value: string;

  constructor(value: string) {
    if (value.trim().length === 0) {
      throw new InvalidPortfolioWorkspaceIdentifierError("AcceptedArtifactId");
    }

    this.value = value;
    Object.freeze(this);
  }

  equals(other: AcceptedArtifactId | undefined): boolean {
    return other instanceof AcceptedArtifactId && this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }
}
