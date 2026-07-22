import type {
  AchievementId,
  CompetencyId,
  DateRange,
  EmploymentRecordId,
  EvidenceReferenceId,
  PortfolioAssetId,
  ProjectId,
  SkillId,
  TechnologyId,
  VerificationStatus
} from "../shared";

export interface Project {
  readonly id: ProjectId;
  readonly name: string;
  readonly description?: string;
  readonly role?: string;
  readonly dateRange?: DateRange;
  readonly verificationStatus: VerificationStatus;
  readonly employmentRecordId?: EmploymentRecordId;
  readonly achievementIds: readonly AchievementId[];
  readonly competencyIds: readonly CompetencyId[];
  readonly skillIds: readonly SkillId[];
  readonly technologyIds: readonly TechnologyId[];
  readonly portfolioAssetIds: readonly PortfolioAssetId[];
  readonly evidenceReferenceIds: readonly EvidenceReferenceId[];
}
