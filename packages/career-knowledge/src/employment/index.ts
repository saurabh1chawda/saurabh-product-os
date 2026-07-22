import type {
  AchievementId,
  DateRange,
  EmploymentRecordId,
  EvidenceReferenceId,
  ProjectId,
  SkillId,
  TechnologyId,
  VerificationStatus
} from "../shared";

export interface EmploymentRecord {
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
  readonly evidenceReferenceIds: readonly EvidenceReferenceId[];
}
