import {
  createReason,
  createRecommendation,
  idToString,
  rankRecommendations
} from "@career-companion/career-intelligence";
import type { AchievementSnapshot } from "@career-companion/career-knowledge";
import type { RankedAchievement } from "../models";

export class AchievementPrioritizer {
  prioritize(achievements: readonly AchievementSnapshot[]): readonly RankedAchievement[] {
    const recommendations = achievements.map((achievement) => {
      const achievementId = idToString(achievement.id);
      const evidenceWeight = Math.min(achievement.evidenceReferenceIds.length * 15, 45);
      const impactWeight = achievement.metricText === undefined ? 0 : 25;
      const outcomeWeight = achievement.outcome === undefined ? 0 : 20;
      const verifiedWeight = achievement.verificationStatus === "verified" ? 10 : 0;

      return createRecommendation({
        subject: achievement,
        score: evidenceWeight + impactWeight + outcomeWeight + verifiedWeight,
        confidence: achievement.evidenceReferenceIds.length === 0 ? 0.35 : 0.8,
        reasons: [
          createReason("achievement-evidence", "Evidence-backed achievements are prioritized.", evidenceWeight, [achievementId]),
          createReason("achievement-impact", "Metric and outcome details increase resume relevance.", impactWeight + outcomeWeight, [achievementId])
        ],
        supportingReferenceIds: [achievementId, ...achievement.evidenceReferenceIds.map((id) => idToString(id))],
        summary: `${achievement.title} has deterministic resume priority.`
      });
    });

    return Object.freeze(rankRecommendations(recommendations));
  }
}
