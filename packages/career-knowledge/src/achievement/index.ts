import { AggregateRoot, Result } from "@career-companion/kernel";
import {
  AchievementId,
  EmploymentRecordId,
  EvidenceReferenceId,
  addUniqueId,
  createCareerKnowledgeEvent,
  removeExistingId,
  requireNonEmpty
} from "../shared";
import type {
  CompetencyId,
  LifecycleStatus,
  ProjectId,
  SkillId,
  TechnologyId,
  VerificationStatus
} from "../shared";

export interface AchievementSnapshot {
  readonly id: AchievementId;
  readonly title: string;
  readonly description: string;
  readonly outcome?: string;
  readonly metricText?: string;
  readonly verificationStatus: VerificationStatus;
  readonly employmentRecordId?: EmploymentRecordId;
  readonly projectIds: readonly ProjectId[];
  readonly competencyIds: readonly CompetencyId[];
  readonly skillIds: readonly SkillId[];
  readonly technologyIds: readonly TechnologyId[];
  readonly evidenceReferenceIds: readonly EvidenceReferenceId[];
  readonly status: LifecycleStatus;
}

export class Achievement extends AggregateRoot<AchievementId> {
  private status: LifecycleStatus = "active";
  private verificationStatus: VerificationStatus = "unverified";
  private description: string;
  private readonly projectIds: ProjectId[] = [];
  private readonly competencyIds: CompetencyId[] = [];
  private readonly skillIds: SkillId[] = [];
  private readonly technologyIds: TechnologyId[] = [];
  private readonly evidenceReferenceIds: EvidenceReferenceId[] = [];

  private constructor(
    id: AchievementId,
    private readonly title: string,
    description: string,
    private readonly ownerId: EmploymentRecordId,
    private readonly outcome: string | undefined,
    private readonly metricText: string | undefined
  ) {
    super(id);
    this.description = description;
  }

  static create(input: {
    readonly id: AchievementId;
    readonly title: string;
    readonly description: string;
    readonly ownerId: EmploymentRecordId;
    readonly outcome?: string;
    readonly metricText?: string;
  }): Result<Achievement> {
    requireNonEmpty(input.title, "title");
    requireNonEmpty(input.description, "description");

    const achievement = new Achievement(
      input.id,
      input.title,
      input.description,
      input.ownerId,
      input.outcome,
      input.metricText
    );
    achievement.registerEvent(createCareerKnowledgeEvent("AchievementCreated", achievement.id, achievement.version));

    return Result.success(achievement);
  }

  updateDescription(description: string): Result<this> {
    requireNonEmpty(description, "description");
    this.description = description;
    return Result.success(this);
  }

  attachEvidence(evidenceReferenceId: EvidenceReferenceId): Result<this> {
    const result = addUniqueId(
      this.evidenceReferenceIds,
      evidenceReferenceId,
      "Evidence is already attached to this achievement."
    );

    if (result.isFailure) {
      return Result.failure(result.error);
    }

    this.evidenceReferenceIds.splice(0, this.evidenceReferenceIds.length, ...(result.value ?? []));
    this.registerEvent(createCareerKnowledgeEvent("EvidenceAttached", this.id, this.version, {
      evidenceReferenceId: evidenceReferenceId.toString()
    }));
    return Result.success(this);
  }

  detachEvidence(evidenceReferenceId: EvidenceReferenceId): Result<this> {
    const result = removeExistingId(
      this.evidenceReferenceIds,
      evidenceReferenceId,
      "Cannot detach evidence because it is not attached to this achievement."
    );

    if (result.isFailure) {
      return Result.failure(result.error);
    }

    this.evidenceReferenceIds.splice(0, this.evidenceReferenceIds.length, ...(result.value ?? []));
    return Result.success(this);
  }

  verify(): Result<this> {
    if (this.evidenceReferenceIds.length === 0) {
      return Result.failure({
        code: "unverified-evidence",
        message: "Achievement cannot be verified without evidence."
      });
    }

    this.verificationStatus = "verified";
    this.registerEvent(createCareerKnowledgeEvent("AchievementVerified", this.id, this.version));
    return Result.success(this);
  }

  archive(): Result<this> {
    if (this.status === "archived") {
      return Result.failure({
        code: "invalid-reference",
        message: "Achievement cannot be archived twice."
      });
    }

    this.status = "archived";
    return Result.success(this);
  }

  toSnapshot(): AchievementSnapshot {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      outcome: this.outcome,
      metricText: this.metricText,
      verificationStatus: this.verificationStatus,
      employmentRecordId: this.ownerId,
      projectIds: [...this.projectIds],
      competencyIds: [...this.competencyIds],
      skillIds: [...this.skillIds],
      technologyIds: [...this.technologyIds],
      evidenceReferenceIds: [...this.evidenceReferenceIds],
      status: this.status
    };
  }
}
