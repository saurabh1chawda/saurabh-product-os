import { AggregateRoot, Result } from "@career-companion/kernel";
import {
  AchievementId,
  CompetencyId,
  EvidenceReferenceId,
  addUniqueId,
  createCareerKnowledgeEvent,
  removeExistingId,
  requireNonEmpty
} from "../shared";
import type {
  LifecycleStatus,
  ProjectId,
  SkillId,
  TechnologyId,
  VerificationStatus
} from "../shared";

export type CompetencyCategory =
  | "customer-discovery"
  | "product-strategy"
  | "platform-thinking"
  | "payments"
  | "ai-product-management"
  | "leadership"
  | "analytics"
  | "execution"
  | "other";

export interface CompetencySnapshot {
  readonly id: CompetencyId;
  readonly name: string;
  readonly category: CompetencyCategory;
  readonly description?: string;
  readonly status: LifecycleStatus;
  readonly verificationStatus: VerificationStatus;
  readonly achievementIds: readonly AchievementId[];
  readonly projectIds: readonly ProjectId[];
  readonly evidenceReferenceIds: readonly EvidenceReferenceId[];
  readonly skillIds: readonly SkillId[];
  readonly technologyIds: readonly TechnologyId[];
}

export class Competency extends AggregateRoot<CompetencyId> {
  private status: LifecycleStatus = "active";
  private readonly achievementIds: AchievementId[] = [];
  private readonly projectIds: ProjectId[] = [];
  private readonly evidenceReferenceIds: EvidenceReferenceId[] = [];
  private readonly skillIds: SkillId[] = [];
  private readonly technologyIds: TechnologyId[] = [];

  private constructor(
    id: CompetencyId,
    private readonly name: string,
    private readonly category: CompetencyCategory,
    private readonly description: string | undefined,
    private readonly verificationStatus: VerificationStatus
  ) {
    super(id);
  }

  static create(input: {
    readonly id: CompetencyId;
    readonly name: string;
    readonly category: CompetencyCategory;
    readonly description?: string;
    readonly verificationStatus?: VerificationStatus;
  }): Result<Competency> {
    requireNonEmpty(input.name, "name");

    const competency = new Competency(
      input.id,
      input.name,
      input.category,
      input.description,
      input.verificationStatus ?? "unverified"
    );
    competency.registerEvent(createCareerKnowledgeEvent("CompetencyCreated", competency.id, competency.version));

    return Result.success(competency);
  }

  attachAchievement(achievementId: AchievementId): Result<this> {
    return this.attachToCollection(this.achievementIds, achievementId, "Achievement is already attached to this competency.");
  }

  detachAchievement(achievementId: AchievementId): Result<this> {
    return this.detachFromCollection(this.achievementIds, achievementId, "Achievement is not attached to this competency.");
  }

  attachProject(projectId: ProjectId): Result<this> {
    return this.attachToCollection(this.projectIds, projectId, "Project is already attached to this competency.");
  }

  detachProject(projectId: ProjectId): Result<this> {
    return this.detachFromCollection(this.projectIds, projectId, "Project is not attached to this competency.");
  }

  attachEvidence(evidenceReferenceId: EvidenceReferenceId): Result<this> {
    return this.attachToCollection(this.evidenceReferenceIds, evidenceReferenceId, "Evidence is already attached to this competency.");
  }

  attachSkill(skillId: SkillId): Result<this> {
    return this.attachToCollection(this.skillIds, skillId, "Skill is already attached to this competency.");
  }

  attachTechnology(technologyId: TechnologyId): Result<this> {
    return this.attachToCollection(this.technologyIds, technologyId, "Technology is already attached to this competency.");
  }

  deactivate(): Result<this> {
    if (this.status === "inactive") {
      return Result.failure({
        code: "invalid-reference",
        message: "Competency cannot be deactivated twice."
      });
    }

    this.status = "inactive";
    this.registerEvent(createCareerKnowledgeEvent("CompetencyDeactivated", this.id, this.version));
    return Result.success(this);
  }

  toSnapshot(): CompetencySnapshot {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      description: this.description,
      status: this.status,
      verificationStatus: this.verificationStatus,
      achievementIds: [...this.achievementIds],
      projectIds: [...this.projectIds],
      evidenceReferenceIds: [...this.evidenceReferenceIds],
      skillIds: [...this.skillIds],
      technologyIds: [...this.technologyIds]
    };
  }

  private attachToCollection<Id extends AchievementId | ProjectId | EvidenceReferenceId | SkillId | TechnologyId>(
    collection: Id[],
    id: Id,
    duplicateMessage: string
  ): Result<this> {
    const result = addUniqueId(collection, id, duplicateMessage);

    if (result.isFailure) {
      return Result.failure(result.error);
    }

    collection.splice(0, collection.length, ...(result.value ?? []));
    return Result.success(this);
  }

  private detachFromCollection<Id extends AchievementId | ProjectId>(
    collection: Id[],
    id: Id,
    missingMessage: string
  ): Result<this> {
    const result = removeExistingId(collection, id, missingMessage);

    if (result.isFailure) {
      return Result.failure(result.error);
    }

    collection.splice(0, collection.length, ...(result.value ?? []));
    return Result.success(this);
  }
}
