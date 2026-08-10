import { InvalidPortfolioWorkspaceIdentifierError } from "../errors/InvalidPortfolioWorkspaceIdentifierError";

export class ExecutionId {
  private readonly __executionIdBrand!: never;

  readonly value: string;

  constructor(value: string) {
    if (value.trim().length === 0) {
      throw new InvalidPortfolioWorkspaceIdentifierError("ExecutionId");
    }

    this.value = value;
    Object.freeze(this);
  }

  equals(other: ExecutionId | undefined): boolean {
    return other instanceof ExecutionId && this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }
}
