import { InvalidPortfolioWorkspaceIdentifierError } from "../errors/InvalidPortfolioWorkspaceIdentifierError";

export interface ApprovalReferenceJson {
  readonly approvalReference: string;
}

export class ApprovalReference {
  private readonly __approvalReferenceBrand!: never;

  readonly approvalReference: string;

  constructor(input: ApprovalReferenceJson) {
    if (input.approvalReference.trim().length === 0) {
      throw new InvalidPortfolioWorkspaceIdentifierError("ApprovalReference.approvalReference");
    }

    this.approvalReference = input.approvalReference;
    Object.freeze(this);
  }

  equals(other: ApprovalReference | undefined): boolean {
    return other instanceof ApprovalReference && this.approvalReference === other.approvalReference;
  }

  toString(): string {
    return this.approvalReference;
  }

  toJSON(): ApprovalReferenceJson {
    return {
      approvalReference: this.approvalReference
    };
  }
}
