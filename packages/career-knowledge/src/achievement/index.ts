import type {
  AchievementId,
  CompetencyId,
  EmploymentRecordId,
  EvidenceReferenceId,
  ProjectId,
  SkillId,
  TechnologyId,
  VerificationStatus
} from "../shared";

export interface Achievement {
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
}
