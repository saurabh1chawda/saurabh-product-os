import type { StorySnapshot } from "@career-companion/career-knowledge";
import {
  createReason,
  createRecommendation,
  idToString,
  rankRecommendations,
  uniqueByReference
} from "../shared";
import type { Ranking, Recommendation } from "../shared";

export type StoryRecommendation = Recommendation<StorySnapshot>;

export interface StoryRankingStrategy {
  rank(story: StorySnapshot): StoryRecommendation;
}

export class EvidenceBackedStoryRankingStrategy implements StoryRankingStrategy {
  rank(story: StorySnapshot): StoryRecommendation {
    const storyId = idToString(story.id);
    const evidenceWeight = Math.min(story.evidenceReferenceIds.length * 15, 35);
    const metricWeight = Math.min(story.metricIds.length * 15, 30);
    const competencyWeight = Math.min(story.competencyIds.length * 10, 25);
    const completenessWeight = story.actions.length > 0 && story.outcome.trim().length > 0 ? 10 : 0;
    const reasons = [
      createReason("story-evidence", `${story.evidenceReferenceIds.length} evidence references support this story.`, evidenceWeight, [storyId]),
      createReason("story-metrics", `${story.metricIds.length} metrics are attached to this story.`, metricWeight, [storyId]),
      createReason("story-competencies", `${story.competencyIds.length} competencies are represented.`, competencyWeight, [storyId]),
      createReason("story-completeness", "Story includes actions and outcome.", completenessWeight, [storyId])
    ];

    return createRecommendation({
      subject: story,
      score: evidenceWeight + metricWeight + competencyWeight + completenessWeight,
      confidence: story.evidenceReferenceIds.length > 0 ? 0.85 : 0.45,
      reasons,
      summary: `Story ${story.title} is ranked by evidence, metrics, competencies, and completeness.`
    });
  }
}

export class StorySelector {
  constructor(private readonly strategy: StoryRankingStrategy = new EvidenceBackedStoryRankingStrategy()) {}

  select(stories: readonly StorySnapshot[], limit = stories.length): readonly Ranking<StorySnapshot>[] {
    const uniqueStories = uniqueByReference(stories, (story) => idToString(story.id));
    return rankRecommendations(uniqueStories.map((story) => this.strategy.rank(story))).slice(0, limit);
  }
}
