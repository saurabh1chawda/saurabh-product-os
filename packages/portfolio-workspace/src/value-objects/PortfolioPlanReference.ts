import { InvalidPortfolioWorkspaceIdentifierError } from "../errors/InvalidPortfolioWorkspaceIdentifierError";

export interface PortfolioPlanReferenceJson {
  readonly planId: string;
  readonly roadmapId: string;
  readonly planArtifactReference: string;
}

export class PortfolioPlanReference {
  private readonly __portfolioPlanReferenceBrand!: never;

  readonly planId: string;
  readonly roadmapId: string;
  readonly planArtifactReference: string;

  constructor(input: PortfolioPlanReferenceJson) {
    assertRequiredString(input.planId, "PortfolioPlanReference.planId");
    assertRequiredString(input.roadmapId, "PortfolioPlanReference.roadmapId");
    assertRequiredString(input.planArtifactReference, "PortfolioPlanReference.planArtifactReference");

    this.planId = input.planId;
    this.roadmapId = input.roadmapId;
    this.planArtifactReference = input.planArtifactReference;
    Object.freeze(this);
  }

  equals(other: PortfolioPlanReference | undefined): boolean {
    return other instanceof PortfolioPlanReference
      && this.planId === other.planId
      && this.roadmapId === other.roadmapId
      && this.planArtifactReference === other.planArtifactReference;
  }

  toJSON(): PortfolioPlanReferenceJson {
    return {
      planId: this.planId,
      roadmapId: this.roadmapId,
      planArtifactReference: this.planArtifactReference
    };
  }
}

function assertRequiredString(value: string, name: string): void {
  if (value.trim().length === 0) {
    throw new InvalidPortfolioWorkspaceIdentifierError(name);
  }
}
