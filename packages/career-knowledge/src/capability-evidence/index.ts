import { AggregateRoot, Result } from "@career-companion/kernel";
import {
  AchievementId,
  CapabilityEvidenceId,
  CompetencyId,
  MetricId,
  PortfolioAssetId,
  ProjectId,
  StoryId,
  addUniqueId,
  createCareerKnowledgeEvent,
  requireNonEmpty
} from "../shared";
import type { DomainError, LifecycleStatus, VerificationStatus } from "../shared";

export const CapabilityEvidenceCreated = "CapabilityEvidenceCreated";
export const CapabilityEvidenceVerified = "CapabilityEvidenceVerified";

export interface CapabilityEvidenceSnapshot {
  readonly id: CapabilityEvidenceId;
  readonly competencyId: CompetencyId;
  readonly description: string;
  readonly verificationStatus: VerificationStatus;
  readonly status: LifecycleStatus;
  readonly achievementIds: readonly AchievementId[];
  readonly storyIds: readonly StoryId[];
  readonly metricIds: readonly MetricId[];
  readonly projectIds: readonly ProjectId[];
  readonly portfolioAssetIds: readonly PortfolioAssetId[];
}

export class CapabilityEvidence extends AggregateRoot<CapabilityEvidenceId> {
  private status: LifecycleStatus = "active";
  private verificationStatus: VerificationStatus = "unverified";
  private readonly achievementIds: AchievementId[] = [];
  private readonly storyIds: StoryId[] = [];
  private readonly metricIds: MetricId[] = [];
  private readonly projectIds: ProjectId[] = [];
  private readonly portfolioAssetIds: PortfolioAssetId[] = [];

  private constructor(
    id: CapabilityEvidenceId,
    private readonly competencyId: CompetencyId,
    private readonly description: string
  ) {
    super(id);
  }

  static create(input: {
    readonly id: CapabilityEvidenceId;
    readonly competencyId: CompetencyId;
    readonly description: string;
  }): Result<CapabilityEvidence> {
    requireNonEmpty(input.description, "description");

    const capabilityEvidence = new CapabilityEvidence(input.id, input.competencyId, input.description);
    capabilityEvidence.registerEvent(
      createCareerKnowledgeEvent(CapabilityEvidenceCreated, capabilityEvidence.id, capabilityEvidence.version, {
        competencyId: input.competencyId.toString()
      })
    );

    return Result.success(capabilityEvidence);
  }

  attachAchievement(achievementId: AchievementId): Result<this, DomainError> {
    return attach(this.achievementIds, achievementId, "Achievement is already attached to this capability evidence.", this);
  }

  attachStory(storyId: StoryId): Result<this, DomainError> {
    return attach(this.storyIds, storyId, "Story is already attached to this capability evidence.", this);
  }

  attachMetric(metricId: MetricId): Result<this, DomainError> {
    return attach(this.metricIds, metricId, "Metric is already attached to this capability evidence.", this);
  }

  attachProject(projectId: ProjectId): Result<this, DomainError> {
    return attach(this.projectIds, projectId, "Project is already attached to this capability evidence.", this);
  }

  attachPortfolioAsset(portfolioAssetId: PortfolioAssetId): Result<this, DomainError> {
    return attach(
      this.portfolioAssetIds,
      portfolioAssetId,
      "Portfolio asset is already attached to this capability evidence.",
      this
    );
  }

  verify(): Result<this, DomainError> {
    if (this.verificationStatus === "verified") {
      return Result.failure({
        code: "invalid-reference",
        message: "Capability evidence cannot be verified twice."
      });
    }

    if (!this.hasSupportingArtifact()) {
      return Result.failure({
        code: "unverified-evidence",
        message: "Capability evidence cannot be verified without at least one supporting artifact."
      });
    }

    this.verificationStatus = "verified";
    this.registerEvent(createCareerKnowledgeEvent(CapabilityEvidenceVerified, this.id, this.version));
    return Result.success(this);
  }

  archive(): Result<this, DomainError> {
    if (this.status === "archived") {
      return Result.failure({
        code: "invalid-reference",
        message: "Capability evidence cannot be archived twice."
      });
    }

    this.status = "archived";
    return Result.success(this);
  }

  toSnapshot(): CapabilityEvidenceSnapshot {
    return {
      id: this.id,
      competencyId: this.competencyId,
      description: this.description,
      verificationStatus: this.verificationStatus,
      status: this.status,
      achievementIds: [...this.achievementIds],
      storyIds: [...this.storyIds],
      metricIds: [...this.metricIds],
      projectIds: [...this.projectIds],
      portfolioAssetIds: [...this.portfolioAssetIds]
    };
  }

  private hasSupportingArtifact(): boolean {
    return (
      this.achievementIds.length > 0 ||
      this.storyIds.length > 0 ||
      this.metricIds.length > 0 ||
      this.projectIds.length > 0 ||
      this.portfolioAssetIds.length > 0
    );
  }
}

function attach<Id extends AchievementId | StoryId | MetricId | ProjectId | PortfolioAssetId, Owner>(
  collection: Id[],
  id: Id,
  duplicateMessage: string,
  owner: Owner
): Result<Owner, DomainError> {
  const result = addUniqueId(collection, id, duplicateMessage);
  if (result.isFailure) {
    return Result.failure(result.error ?? {
      code: "invalid-reference",
      message: duplicateMessage
    });
  }

  collection.splice(0, collection.length, ...(result.value ?? []));
  return Result.success(owner);
}
