import { AggregateRoot, Result } from "@career-companion/kernel";
import {
  AchievementId,
  CareerProfileId,
  CertificationId,
  CompetencyId,
  EducationId,
  EmploymentRecordId,
  EvidenceReferenceId,
  addUniqueId,
  createCareerKnowledgeEvent,
  removeExistingId,
  requireNonEmpty
} from "../shared";
import type {
  PortfolioAssetId,
  ProjectId,
  SkillId,
  TechnologyId,
  LifecycleStatus,
  VerificationStatus
} from "../shared";

export interface CareerProfileSnapshot {
  readonly id: CareerProfileId;
  readonly displayName: string;
  readonly headline?: string;
  readonly summary?: string;
  readonly location?: string;
  readonly status: LifecycleStatus;
  readonly verificationStatus: VerificationStatus;
  readonly employmentRecordIds: readonly EmploymentRecordId[];
  readonly achievementIds: readonly AchievementId[];
  readonly competencyIds: readonly CompetencyId[];
  readonly skillIds: readonly SkillId[];
  readonly technologyIds: readonly TechnologyId[];
  readonly projectIds: readonly ProjectId[];
  readonly portfolioAssetIds: readonly PortfolioAssetId[];
  readonly educationIds: readonly EducationId[];
  readonly certificationIds: readonly CertificationId[];
  readonly evidenceReferenceIds: readonly EvidenceReferenceId[];
}

export class CareerProfile extends AggregateRoot<CareerProfileId> {
  private status: LifecycleStatus = "draft";
  private summary?: string;
  private readonly employmentRecordIds: EmploymentRecordId[] = [];
  private readonly achievementIds: AchievementId[] = [];
  private readonly competencyIds: CompetencyId[] = [];
  private readonly skillIds: SkillId[] = [];
  private readonly technologyIds: TechnologyId[] = [];
  private readonly projectIds: ProjectId[] = [];
  private readonly portfolioAssetIds: PortfolioAssetId[] = [];
  private readonly educationIds: EducationId[] = [];
  private readonly certificationIds: CertificationId[] = [];
  private readonly evidenceReferenceIds: EvidenceReferenceId[] = [];

  private constructor(
    id: CareerProfileId,
    private readonly displayName: string,
    private readonly headline: string | undefined,
    summary: string | undefined,
    private readonly location: string | undefined,
    private readonly verificationStatus: VerificationStatus
  ) {
    super(id);
    this.summary = summary;
  }

  static create(input: {
    readonly id: CareerProfileId;
    readonly displayName: string;
    readonly headline?: string;
    readonly summary?: string;
    readonly location?: string;
    readonly verificationStatus?: VerificationStatus;
  }): Result<CareerProfile> {
    requireNonEmpty(input.displayName, "displayName");

    const profile = new CareerProfile(
      input.id,
      input.displayName,
      input.headline,
      input.summary,
      input.location,
      input.verificationStatus ?? "unverified"
    );
    profile.registerEvent(createCareerKnowledgeEvent("CareerProfileCreated", profile.id, profile.version));

    return Result.success(profile);
  }

  updateSummary(summary: string): Result<this> {
    requireNonEmpty(summary, "summary");
    this.summary = summary;
    return Result.success(this);
  }

  addEmployment(employmentRecordId: EmploymentRecordId): Result<this> {
    const result = addUniqueId(
      this.employmentRecordIds,
      employmentRecordId,
      "Employment record is already attached to this career profile."
    );

    if (result.isFailure) {
      return Result.failure(result.error);
    }

    this.employmentRecordIds.splice(0, this.employmentRecordIds.length, ...(result.value ?? []));
    return Result.success(this);
  }

  removeEmployment(employmentRecordId: EmploymentRecordId): Result<this> {
    const result = removeExistingId(
      this.employmentRecordIds,
      employmentRecordId,
      "Cannot remove employment record because it is not attached to this career profile."
    );

    if (result.isFailure) {
      return Result.failure(result.error);
    }

    this.employmentRecordIds.splice(0, this.employmentRecordIds.length, ...(result.value ?? []));
    return Result.success(this);
  }

  publish(): Result<this> {
    if (this.status === "published") {
      return Result.failure({
        code: "invalid-reference",
        message: "Career profile cannot be published twice."
      });
    }

    if (this.employmentRecordIds.length === 0) {
      return Result.failure({
        code: "missing-required-field",
        message: "Career profile cannot be published without at least one employment record."
      });
    }

    this.status = "published";
    this.registerEvent(createCareerKnowledgeEvent("CareerProfilePublished", this.id, this.version));
    return Result.success(this);
  }

  archive(): Result<this> {
    if (this.status === "archived") {
      return Result.failure({
        code: "invalid-reference",
        message: "Career profile cannot be archived twice."
      });
    }

    this.status = "archived";
    return Result.success(this);
  }

  toSnapshot(): CareerProfileSnapshot {
    return {
      id: this.id,
      displayName: this.displayName,
      headline: this.headline,
      summary: this.summary,
      location: this.location,
      status: this.status,
      verificationStatus: this.verificationStatus,
      employmentRecordIds: [...this.employmentRecordIds],
      achievementIds: [...this.achievementIds],
      competencyIds: [...this.competencyIds],
      skillIds: [...this.skillIds],
      technologyIds: [...this.technologyIds],
      projectIds: [...this.projectIds],
      portfolioAssetIds: [...this.portfolioAssetIds],
      educationIds: [...this.educationIds],
      certificationIds: [...this.certificationIds],
      evidenceReferenceIds: [...this.evidenceReferenceIds]
    };
  }
}
