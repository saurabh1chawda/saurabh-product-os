import type {
  AchievementId,
  CompetencyId,
  EvidenceReferenceId,
  ProjectId,
  TechnologyId,
  VerificationStatus
} from "../shared";

export type TechnologyCategory = "platform" | "tool" | "language" | "framework" | "data" | "ai" | "other";

export interface Technology {
  readonly id: TechnologyId;
  readonly name: string;
  readonly category: TechnologyCategory;
  readonly description?: string;
  readonly verificationStatus: VerificationStatus;
  readonly competencyIds: readonly CompetencyId[];
  readonly achievementIds: readonly AchievementId[];
  readonly projectIds: readonly ProjectId[];
  readonly evidenceReferenceIds: readonly EvidenceReferenceId[];
}
