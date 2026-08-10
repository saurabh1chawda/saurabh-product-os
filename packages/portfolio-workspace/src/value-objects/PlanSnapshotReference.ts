import { InvalidPortfolioWorkspaceIdentifierError } from "../errors/InvalidPortfolioWorkspaceIdentifierError";

export interface PlanSnapshotReferenceJson {
  readonly snapshotReference: string;
}

export class PlanSnapshotReference {
  private readonly __planSnapshotReferenceBrand!: never;

  readonly snapshotReference: string;

  constructor(input: PlanSnapshotReferenceJson) {
    if (input.snapshotReference.trim().length === 0) {
      throw new InvalidPortfolioWorkspaceIdentifierError("PlanSnapshotReference.snapshotReference");
    }

    this.snapshotReference = input.snapshotReference;
    Object.freeze(this);
  }

  equals(other: PlanSnapshotReference | undefined): boolean {
    return other instanceof PlanSnapshotReference && this.snapshotReference === other.snapshotReference;
  }

  toString(): string {
    return this.snapshotReference;
  }

  toJSON(): PlanSnapshotReferenceJson {
    return {
      snapshotReference: this.snapshotReference
    };
  }
}
