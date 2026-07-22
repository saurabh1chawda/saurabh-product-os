import { AggregateRoot, Result } from "@career-companion/kernel";
import {
  AchievementId,
  CompetencyId,
  EvidenceReferenceId,
  ProjectId,
  SkillId,
  requireNonEmpty
} from "../shared";
import type {
  LifecycleStatus,
  VerificationStatus
} from "../shared";

export type SkillCategory = "product" | "research" | "analytics" | "leadership" | "delivery" | "communication" | "other";

export interface SkillSnapshot {
  readonly id: SkillId;
  readonly name: string;
  readonly category: SkillCategory;
  readonly description?: string;
  readonly status: LifecycleStatus;
  readonly verificationStatus: VerificationStatus;
  readonly competencyIds: readonly CompetencyId[];
  readonly achievementIds: readonly AchievementId[];
  readonly projectIds: readonly ProjectId[];
  readonly evidenceReferenceIds: readonly EvidenceReferenceId[];
}

export class Skill extends AggregateRoot<SkillId> {
  private status: LifecycleStatus = "active";
  private description?: string;
  private readonly competencyIds: CompetencyId[] = [];
  private readonly achievementIds: AchievementId[] = [];
  private readonly projectIds: ProjectId[] = [];
  private readonly evidenceReferenceIds: EvidenceReferenceId[] = [];

  private constructor(
    id: SkillId,
    private readonly name: string,
    private readonly category: SkillCategory,
    description: string | undefined,
    private readonly verificationStatus: VerificationStatus
  ) {
    super(id);
    this.description = description;
  }

  static create(input: {
    readonly id: SkillId;
    readonly name: string;
    readonly category: SkillCategory;
    readonly description?: string;
    readonly verificationStatus?: VerificationStatus;
  }): Result<Skill> {
    requireNonEmpty(input.name, "name");

    return Result.success(
      new Skill(input.id, input.name, input.category, input.description, input.verificationStatus ?? "unverified")
    );
  }

  update(description: string): Result<this> {
    requireNonEmpty(description, "description");
    this.description = description;
    return Result.success(this);
  }

  archive(): Result<this> {
    if (this.status === "archived") {
      return Result.failure({
        code: "invalid-reference",
        message: "Skill cannot be archived twice."
      });
    }

    this.status = "archived";
    return Result.success(this);
  }

  toSnapshot(): SkillSnapshot {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      description: this.description,
      status: this.status,
      verificationStatus: this.verificationStatus,
      competencyIds: [...this.competencyIds],
      achievementIds: [...this.achievementIds],
      projectIds: [...this.projectIds],
      evidenceReferenceIds: [...this.evidenceReferenceIds]
    };
  }
}
