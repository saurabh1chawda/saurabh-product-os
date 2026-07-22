import { AggregateRoot, Result } from "@career-companion/kernel";
import {
  CompetencyId,
  MetricId,
  ProfessionalIdentityId,
  StoryId,
  addUniqueId,
  createCareerKnowledgeEvent,
  removeExistingId,
  requireNonEmpty
} from "../shared";
import type { DomainError, LifecycleStatus } from "../shared";

export const ProfessionalIdentityCreated = "ProfessionalIdentityCreated";
export const ProfessionalIdentityActivated = "ProfessionalIdentityActivated";

export interface ProfessionalIdentitySnapshot {
  readonly id: ProfessionalIdentityId;
  readonly name: string;
  readonly description?: string;
  readonly status: LifecycleStatus;
  readonly competencyIds: readonly CompetencyId[];
  readonly storyIds: readonly StoryId[];
  readonly metricIds: readonly MetricId[];
}

export class ProfessionalIdentity extends AggregateRoot<ProfessionalIdentityId> {
  private status: LifecycleStatus = "draft";
  private name: string;
  private readonly competencyIds: CompetencyId[] = [];
  private readonly storyIds: StoryId[] = [];
  private readonly metricIds: MetricId[] = [];

  private constructor(
    id: ProfessionalIdentityId,
    name: string,
    private readonly description: string | undefined
  ) {
    super(id);
    this.name = name;
  }

  static create(input: {
    readonly id: ProfessionalIdentityId;
    readonly name: string;
    readonly description?: string;
  }): Result<ProfessionalIdentity> {
    requireNonEmpty(input.name, "name");

    const identity = new ProfessionalIdentity(input.id, input.name, input.description);
    identity.registerEvent(createCareerKnowledgeEvent(ProfessionalIdentityCreated, identity.id, identity.version));

    return Result.success(identity);
  }

  rename(name: string): Result<this> {
    requireNonEmpty(name, "name");
    this.name = name;
    return Result.success(this);
  }

  attachCompetency(competencyId: CompetencyId): Result<this, DomainError> {
    return attach(this.competencyIds, competencyId, "Competency is already attached to this professional identity.", this);
  }

  detachCompetency(competencyId: CompetencyId): Result<this, DomainError> {
    return detach(this.competencyIds, competencyId, "Competency is not attached to this professional identity.", this);
  }

  attachStory(storyId: StoryId): Result<this, DomainError> {
    return attach(this.storyIds, storyId, "Story is already attached to this professional identity.", this);
  }

  detachStory(storyId: StoryId): Result<this, DomainError> {
    return detach(this.storyIds, storyId, "Story is not attached to this professional identity.", this);
  }

  attachMetric(metricId: MetricId): Result<this, DomainError> {
    return attach(this.metricIds, metricId, "Metric is already attached to this professional identity.", this);
  }

  detachMetric(metricId: MetricId): Result<this, DomainError> {
    return detach(this.metricIds, metricId, "Metric is not attached to this professional identity.", this);
  }

  activate(): Result<this, DomainError> {
    if (this.status === "active") {
      return Result.failure({
        code: "invalid-reference",
        message: "Professional identity cannot be activated twice."
      });
    }

    this.status = "active";
    this.registerEvent(createCareerKnowledgeEvent(ProfessionalIdentityActivated, this.id, this.version));
    return Result.success(this);
  }

  deactivate(): Result<this, DomainError> {
    if (this.status === "inactive") {
      return Result.failure({
        code: "invalid-reference",
        message: "Professional identity cannot be deactivated twice."
      });
    }

    this.status = "inactive";
    return Result.success(this);
  }

  toSnapshot(): ProfessionalIdentitySnapshot {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      status: this.status,
      competencyIds: [...this.competencyIds],
      storyIds: [...this.storyIds],
      metricIds: [...this.metricIds]
    };
  }
}

function attach<Id extends CompetencyId | StoryId | MetricId, Owner>(
  collection: Id[],
  id: Id,
  duplicateMessage: string,
  owner: Owner
): Result<Owner, DomainError> {
  const result = addUniqueId(collection, id, duplicateMessage);
  if (result.isFailure) {
    return Result.failure(result.error ?? {
      code: "invalid-reference",
      message: duplicateMessage
    });
  }

  collection.splice(0, collection.length, ...(result.value ?? []));
  return Result.success(owner);
}

function detach<Id extends CompetencyId | StoryId | MetricId, Owner>(
  collection: Id[],
  id: Id,
  missingMessage: string,
  owner: Owner
): Result<Owner, DomainError> {
  const result = removeExistingId(collection, id, missingMessage);
  if (result.isFailure) {
    return Result.failure(result.error ?? {
      code: "invalid-reference",
      message: missingMessage
    });
  }

  collection.splice(0, collection.length, ...(result.value ?? []));
  return Result.success(owner);
}
