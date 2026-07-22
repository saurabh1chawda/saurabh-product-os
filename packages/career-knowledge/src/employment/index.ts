import { AggregateRoot, Result } from "@career-companion/kernel";
import {
  AchievementId,
  DateRange,
  EmploymentRecordId,
  EvidenceReferenceId,
  addUniqueId,
  createCareerKnowledgeEvent,
  removeExistingId,
  requireNonEmpty
} from "../shared";
import type {
  CompetencyId,
  ProjectId,
  SkillId,
  TechnologyId,
  VerificationStatus
} from "../shared";

export interface EmploymentRecordSnapshot {
  readonly id: EmploymentRecordId;
  readonly employerName: string;
  readonly roleTitle: string;
  readonly businessUnit?: string;
  readonly location?: string;
  readonly dateRange: DateRange;
  readonly verificationStatus: VerificationStatus;
  readonly achievementIds: readonly AchievementId[];
  readonly projectIds: readonly ProjectId[];
  readonly skillIds: readonly SkillId[];
  readonly technologyIds: readonly TechnologyId[];
  readonly competencyIds: readonly CompetencyId[];
  readonly evidenceReferenceIds: readonly EvidenceReferenceId[];
}

export class EmploymentRecord extends AggregateRoot<EmploymentRecordId> {
  private endDate?: DateRange["endDate"];
  private hasEnded = false;
  private readonly achievementIds: AchievementId[] = [];
  private readonly projectIds: ProjectId[] = [];
  private readonly skillIds: SkillId[] = [];
  private readonly technologyIds: TechnologyId[] = [];
  private readonly competencyIds: CompetencyId[] = [];
  private readonly evidenceReferenceIds: EvidenceReferenceId[] = [];

  private constructor(
    id: EmploymentRecordId,
    private readonly employerName: string,
    private readonly roleTitle: string,
    private readonly dateRange: DateRange,
    private readonly businessUnit: string | undefined,
    private readonly location: string | undefined,
    private readonly verificationStatus: VerificationStatus
  ) {
    super(id);
    this.endDate = dateRange.endDate;
    this.hasEnded = dateRange.endDate !== undefined;
  }

  static start(input: {
    readonly id: EmploymentRecordId;
    readonly employerName: string;
    readonly roleTitle: string;
    readonly dateRange: DateRange;
    readonly businessUnit?: string;
    readonly location?: string;
    readonly verificationStatus?: VerificationStatus;
  }): Result<EmploymentRecord> {
    requireNonEmpty(input.employerName, "employerName");
    requireNonEmpty(input.roleTitle, "roleTitle");

    const employment = new EmploymentRecord(
      input.id,
      input.employerName,
      input.roleTitle,
      input.dateRange,
      input.businessUnit,
      input.location,
      input.verificationStatus ?? "unverified"
    );
    employment.registerEvent(createCareerKnowledgeEvent("EmploymentStarted", employment.id, employment.version));

    return Result.success(employment);
  }

  end(endDate: DateRange["endDate"]): Result<this> {
    if (this.hasEnded) {
      return Result.failure({
        code: "invalid-date-range",
        message: "Employment record cannot be ended twice.",
        field: "endDate"
      });
    }

    if (endDate !== undefined && endDate < this.dateRange.startDate) {
      return Result.failure({
        code: "invalid-date-range",
        message: "Employment end date cannot precede start date.",
        field: "endDate"
      });
    }

    this.endDate = endDate;
    this.hasEnded = true;
    this.registerEvent(createCareerKnowledgeEvent("EmploymentEnded", this.id, this.version));
    return Result.success(this);
  }

  addAchievement(achievementId: AchievementId): Result<this> {
    const result = addUniqueId(
      this.achievementIds,
      achievementId,
      "Achievement is already attached to this employment record."
    );

    if (result.isFailure) {
      return Result.failure(result.error);
    }

    this.achievementIds.splice(0, this.achievementIds.length, ...(result.value ?? []));
    return Result.success(this);
  }

  removeAchievement(achievementId: AchievementId): Result<this> {
    const result = removeExistingId(
      this.achievementIds,
      achievementId,
      "Cannot remove achievement because it is not attached to this employment record."
    );

    if (result.isFailure) {
      return Result.failure(result.error);
    }

    this.achievementIds.splice(0, this.achievementIds.length, ...(result.value ?? []));
    return Result.success(this);
  }

  assignCompetency(competencyId: CompetencyId): Result<this> {
    const result = addUniqueId(
      this.competencyIds,
      competencyId,
      "Competency is already assigned to this employment record."
    );

    if (result.isFailure) {
      return Result.failure(result.error);
    }

    this.competencyIds.splice(0, this.competencyIds.length, ...(result.value ?? []));
    return Result.success(this);
  }

  toSnapshot(): EmploymentRecordSnapshot {
    return {
      id: this.id,
      employerName: this.employerName,
      roleTitle: this.roleTitle,
      businessUnit: this.businessUnit,
      location: this.location,
      dateRange: this.endDate === undefined ? this.dateRange : DateRange.create({
        startDate: this.dateRange.startDate,
        endDate: this.endDate,
        isCurrent: false
      }).value ?? this.dateRange,
      verificationStatus: this.verificationStatus,
      achievementIds: [...this.achievementIds],
      projectIds: [...this.projectIds],
      skillIds: [...this.skillIds],
      technologyIds: [...this.technologyIds],
      competencyIds: [...this.competencyIds],
      evidenceReferenceIds: [...this.evidenceReferenceIds]
    };
  }
}
