import type { EvidenceReferenceSnapshot, PortfolioAssetSnapshot, StorySnapshot } from "@career-companion/career-knowledge";
import { EvidenceRanker } from "../evidence";
import { StorySelector } from "../story";
import { createRecommendation, idToString } from "../shared";
import type { Ranking, Recommendation, ReferenceId } from "../shared";

export type PortfolioRecommendation = Recommendation<{
  readonly storyIds: readonly ReferenceId[];
  readonly portfolioAssetIds: readonly ReferenceId[];
  readonly evidenceReferenceIds: readonly ReferenceId[];
}>;

export class PortfolioStorySelector {
  constructor(private readonly storySelector: StorySelector = new StorySelector()) {}

  select(stories: readonly StorySnapshot[], limit = stories.length): readonly Ranking<StorySnapshot>[] {
    return this.storySelector.select(stories, limit);
  }
}

export class PortfolioEvidenceSelector {
  constructor(private readonly evidenceRanker: EvidenceRanker = new EvidenceRanker()) {}

  select(evidenceReferences: readonly EvidenceReferenceSnapshot[], limit = evidenceReferences.length): readonly Ranking<EvidenceReferenceSnapshot>[] {
    return this.evidenceRanker.rank(evidenceReferences).slice(0, limit);
  }
}

export function createPortfolioRecommendation(input: {
  readonly stories: readonly StorySnapshot[];
  readonly portfolioAssets: readonly PortfolioAssetSnapshot[];
  readonly evidenceReferences: readonly EvidenceReferenceSnapshot[];
}): PortfolioRecommendation {
  const storyIds = input.stories.map((story) => idToString(story.id));
  const portfolioAssetIds = input.portfolioAssets.map((asset) => idToString(asset.id));
  const evidenceReferenceIds = input.evidenceReferences.map((evidence) => idToString(evidence.id));
  const supportingReferenceIds = [...storyIds, ...portfolioAssetIds, ...evidenceReferenceIds];

  return createRecommendation({
    subject: {
      storyIds,
      portfolioAssetIds,
      evidenceReferenceIds
    },
    score: Math.min(supportingReferenceIds.length * 12, 100),
    confidence: input.evidenceReferences.length > 0 ? 0.8 : 0.45,
    reasons: [
      {
        code: "portfolio-support",
        message: `${supportingReferenceIds.length} portfolio support references are available.`,
        weight: supportingReferenceIds.length,
        supportingReferenceIds
      }
    ],
    supportingReferenceIds,
    summary: "Portfolio recommendation is based on available stories, assets, and evidence references."
  });
}
