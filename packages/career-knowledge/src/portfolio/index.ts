import type {
  AchievementId,
  CompetencyId,
  EvidenceReferenceId,
  PortfolioAssetId,
  ProjectId,
  SkillId,
  TechnologyId,
  UrlString,
  VerificationStatus
} from "../shared";

export type PortfolioAssetType = "case-study" | "report" | "presentation" | "writing" | "product-artifact" | "other";

export interface PortfolioAsset {
  readonly id: PortfolioAssetId;
  readonly title: string;
  readonly assetType: PortfolioAssetType;
  readonly description?: string;
  readonly url?: UrlString;
  readonly verificationStatus: VerificationStatus;
  readonly projectIds: readonly ProjectId[];
  readonly achievementIds: readonly AchievementId[];
  readonly competencyIds: readonly CompetencyId[];
  readonly skillIds: readonly SkillId[];
  readonly technologyIds: readonly TechnologyId[];
  readonly evidenceReferenceIds: readonly EvidenceReferenceId[];
}
