import { AggregateRoot, Result } from "@career-companion/kernel";
import {
  AchievementId,
  CompetencyId,
  EmploymentRecordId,
  EvidenceReferenceId,
  PortfolioAssetId,
  ProjectId,
  SkillId,
  TechnologyId,
  createCareerKnowledgeEvent,
  requireNonEmpty
} from "../shared";
import type {
  DateRange,
  LifecycleStatus,
  VerificationStatus
} from "../shared";

export interface ProjectSnapshot {
  readonly id: ProjectId;
  readonly name: string;
  readonly description?: string;
  readonly role?: string;
  readonly dateRange?: DateRange;
  readonly status: LifecycleStatus;
  readonly verificationStatus: VerificationStatus;
  readonly employmentRecordId?: EmploymentRecordId;
  readonly achievementIds: readonly AchievementId[];
  readonly competencyIds: readonly CompetencyId[];
  readonly skillIds: readonly SkillId[];
  readonly technologyIds: readonly TechnologyId[];
  readonly portfolioAssetIds: readonly PortfolioAssetId[];
  readonly evidenceReferenceIds: readonly EvidenceReferenceId[];
}

export class Project extends AggregateRoot<ProjectId> {
  private status: LifecycleStatus = "active";
  private description?: string;
  private readonly achievementIds: AchievementId[] = [];
  private readonly competencyIds: CompetencyId[] = [];
  private readonly skillIds: SkillId[] = [];
  private readonly technologyIds: TechnologyId[] = [];
  private readonly portfolioAssetIds: PortfolioAssetId[] = [];
  private readonly evidenceReferenceIds: EvidenceReferenceId[] = [];

  private constructor(
    id: ProjectId,
    private readonly name: string,
    description: string | undefined,
    private readonly role: string | undefined,
    private readonly dateRange: DateRange | undefined,
    private readonly employmentRecordId: EmploymentRecordId | undefined,
    private readonly verificationStatus: VerificationStatus
  ) {
    super(id);
    this.description = description;
  }

  static create(input: {
    readonly id: ProjectId;
    readonly name: string;
    readonly description?: string;
    readonly role?: string;
    readonly dateRange?: DateRange;
    readonly employmentRecordId?: EmploymentRecordId;
    readonly verificationStatus?: VerificationStatus;
  }): Result<Project> {
    requireNonEmpty(input.name, "name");

    return Result.success(
      new Project(
        input.id,
        input.name,
        input.description,
        input.role,
        input.dateRange,
        input.employmentRecordId,
        input.verificationStatus ?? "unverified"
      )
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
        message: "Project cannot be archived twice."
      });
    }

    this.status = "archived";
    this.registerEvent(createCareerKnowledgeEvent("ProjectArchived", this.id, this.version));
    return Result.success(this);
  }

  toSnapshot(): ProjectSnapshot {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      role: this.role,
      dateRange: this.dateRange,
      status: this.status,
      verificationStatus: this.verificationStatus,
      employmentRecordId: this.employmentRecordId,
      achievementIds: [...this.achievementIds],
      competencyIds: [...this.competencyIds],
      skillIds: [...this.skillIds],
      technologyIds: [...this.technologyIds],
      portfolioAssetIds: [...this.portfolioAssetIds],
      evidenceReferenceIds: [...this.evidenceReferenceIds]
    };
  }
}
