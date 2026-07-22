import { AggregateRoot, Result } from "@career-companion/kernel";
import {
  AchievementId,
  CompetencyId,
  EvidenceReferenceId,
  PortfolioAssetId,
  ProjectId,
  SkillId,
  TechnologyId,
  createCareerKnowledgeEvent,
  requireNonEmpty
} from "../shared";
import type {
  LifecycleStatus,
  UrlString,
  VerificationStatus
} from "../shared";

export type PortfolioAssetType = "case-study" | "report" | "presentation" | "writing" | "product-artifact" | "other";

export interface PortfolioAssetSnapshot {
  readonly id: PortfolioAssetId;
  readonly title: string;
  readonly assetType: PortfolioAssetType;
  readonly description?: string;
  readonly url?: UrlString;
  readonly status: LifecycleStatus;
  readonly verificationStatus: VerificationStatus;
  readonly projectIds: readonly ProjectId[];
  readonly achievementIds: readonly AchievementId[];
  readonly competencyIds: readonly CompetencyId[];
  readonly skillIds: readonly SkillId[];
  readonly technologyIds: readonly TechnologyId[];
  readonly evidenceReferenceIds: readonly EvidenceReferenceId[];
}

export class PortfolioAsset extends AggregateRoot<PortfolioAssetId> {
  private status: LifecycleStatus = "draft";
  private description?: string;
  private readonly projectIds: ProjectId[] = [];
  private readonly achievementIds: AchievementId[] = [];
  private readonly competencyIds: CompetencyId[] = [];
  private readonly skillIds: SkillId[] = [];
  private readonly technologyIds: TechnologyId[] = [];
  private readonly evidenceReferenceIds: EvidenceReferenceId[] = [];

  private constructor(
    id: PortfolioAssetId,
    private readonly title: string,
    private readonly assetType: PortfolioAssetType,
    description: string | undefined,
    private readonly url: UrlString | undefined,
    private readonly verificationStatus: VerificationStatus
  ) {
    super(id);
    this.description = description;
  }

  static create(input: {
    readonly id: PortfolioAssetId;
    readonly title: string;
    readonly assetType: PortfolioAssetType;
    readonly description?: string;
    readonly url?: UrlString;
    readonly verificationStatus?: VerificationStatus;
  }): Result<PortfolioAsset> {
    requireNonEmpty(input.title, "title");

    return Result.success(
      new PortfolioAsset(
        input.id,
        input.title,
        input.assetType,
        input.description,
        input.url,
        input.verificationStatus ?? "unverified"
      )
    );
  }

  update(description: string): Result<this> {
    requireNonEmpty(description, "description");
    this.description = description;
    return Result.success(this);
  }

  publish(): Result<this> {
    if (this.status === "published") {
      return Result.failure({
        code: "invalid-reference",
        message: "Portfolio asset cannot be published twice."
      });
    }

    this.status = "published";
    this.registerEvent(createCareerKnowledgeEvent("PortfolioAssetPublished", this.id, this.version));
    return Result.success(this);
  }

  archive(): Result<this> {
    if (this.status === "archived") {
      return Result.failure({
        code: "invalid-reference",
        message: "Portfolio asset cannot be archived twice."
      });
    }

    this.status = "archived";
    return Result.success(this);
  }

  toSnapshot(): PortfolioAssetSnapshot {
    return {
      id: this.id,
      title: this.title,
      assetType: this.assetType,
      description: this.description,
      url: this.url,
      status: this.status,
      verificationStatus: this.verificationStatus,
      projectIds: [...this.projectIds],
      achievementIds: [...this.achievementIds],
      competencyIds: [...this.competencyIds],
      skillIds: [...this.skillIds],
      technologyIds: [...this.technologyIds],
      evidenceReferenceIds: [...this.evidenceReferenceIds]
    };
  }
}
