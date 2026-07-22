import type {
  AchievementId,
  CompetencyId,
  EvidenceReferenceId,
  ProjectId,
  SkillId,
  TechnologyId,
  VerificationStatus
} from "../shared";

export type CompetencyCategory =
  | "customer-discovery"
  | "product-strategy"
  | "platform-thinking"
  | "payments"
  | "ai-product-management"
  | "leadership"
  | "analytics"
  | "execution"
  | "other";

export interface Competency {
  readonly id: CompetencyId;
  readonly name: string;
  readonly category: CompetencyCategory;
  readonly description?: string;
  readonly verificationStatus: VerificationStatus;
  readonly achievementIds: readonly AchievementId[];
  readonly projectIds: readonly ProjectId[];
  readonly evidenceReferenceIds: readonly EvidenceReferenceId[];
  readonly skillIds: readonly SkillId[];
  readonly technologyIds: readonly TechnologyId[];
}
