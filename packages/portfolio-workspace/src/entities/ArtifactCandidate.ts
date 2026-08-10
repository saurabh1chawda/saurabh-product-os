import { InvalidExecutionOperationError } from "../errors/PortfolioWorkspaceDomainErrors";
import {
  ArtifactCandidateLifecycle,
  type ArtifactCandidateLifecycleValue
} from "../models/ArtifactCandidateLifecycle";
import { CandidateId } from "../value-objects/CandidateId";

export class ArtifactCandidate {
  private readonly __artifactCandidateBrand!: never;

  readonly id: CandidateId;
  readonly lifecycle: ArtifactCandidateLifecycleValue;

  constructor(input: {
    readonly id: CandidateId;
    readonly lifecycle: ArtifactCandidateLifecycleValue;
  }) {
    if (!(input.id instanceof CandidateId)) {
      throw new InvalidExecutionOperationError();
    }
    if (!isArtifactCandidateLifecycle(input.lifecycle)) {
      throw new InvalidExecutionOperationError();
    }

    this.id = input.id;
    this.lifecycle = input.lifecycle;
    Object.freeze(this);
  }

  equals(other: ArtifactCandidate | undefined): boolean {
    return other instanceof ArtifactCandidate && this.id.equals(other.id);
  }

  toJSON(): {
    readonly id: string;
    readonly lifecycle: ArtifactCandidateLifecycleValue;
  } {
    return {
      id: this.id.toJSON(),
      lifecycle: this.lifecycle
    };
  }
}

function isArtifactCandidateLifecycle(value: string): value is ArtifactCandidateLifecycleValue {
  return Object.values(ArtifactCandidateLifecycle).includes(value as ArtifactCandidateLifecycleValue);
}
