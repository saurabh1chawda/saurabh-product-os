import type {
  AchievementId,
  CompetencyId,
  EvidenceReferenceId,
  ProjectId,
  SkillId,
  VerificationStatus
} from "../shared";

export type SkillCategory = "product" | "research" | "analytics" | "leadership" | "delivery" | "communication" | "other";

export interface Skill {
  readonly id: SkillId;
  readonly name: string;
  readonly category: SkillCategory;
  readonly description?: string;
  readonly verificationStatus: VerificationStatus;
  readonly competencyIds: readonly CompetencyId[];
  readonly achievementIds: readonly AchievementId[];
  readonly projectIds: readonly ProjectId[];
  readonly evidenceReferenceIds: readonly EvidenceReferenceId[];
}
