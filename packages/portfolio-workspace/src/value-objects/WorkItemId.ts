import { InvalidPortfolioWorkspaceIdentifierError } from "../errors/InvalidPortfolioWorkspaceIdentifierError";

export class WorkItemId {
  private readonly __workItemIdBrand!: never;

  readonly value: string;

  constructor(value: string) {
    if (value.trim().length === 0) {
      throw new InvalidPortfolioWorkspaceIdentifierError("WorkItemId");
    }

    this.value = value;
    Object.freeze(this);
  }

  equals(other: WorkItemId | undefined): boolean {
    return other instanceof WorkItemId && this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }
}
