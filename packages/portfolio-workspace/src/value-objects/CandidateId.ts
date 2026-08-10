import { InvalidPortfolioWorkspaceIdentifierError } from "../errors/InvalidPortfolioWorkspaceIdentifierError";

export class CandidateId {
  private readonly __candidateIdBrand!: never;

  readonly value: string;

  constructor(value: string) {
    if (value.trim().length === 0) {
      throw new InvalidPortfolioWorkspaceIdentifierError("CandidateId");
    }

    this.value = value;
    Object.freeze(this);
  }

  equals(other: CandidateId | undefined): boolean {
    return other instanceof CandidateId && this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }
}
