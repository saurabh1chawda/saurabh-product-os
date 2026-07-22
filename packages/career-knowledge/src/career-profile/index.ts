import type {
  AchievementId,
  CareerProfileId,
  CertificationId,
  CompetencyId,
  EducationId,
  EmploymentRecordId,
  EvidenceReferenceId,
  PortfolioAssetId,
  ProjectId,
  SkillId,
  TechnologyId,
  VerificationStatus
} from "../shared";

export interface CareerProfile {
  readonly id: CareerProfileId;
  readonly displayName: string;
  readonly headline?: string;
  readonly summary?: string;
  readonly location?: string;
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
