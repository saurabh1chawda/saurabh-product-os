import {
  PortfolioEvidenceSelector as DeterministicPortfolioEvidenceSelector,
  PortfolioStorySelector,
  createReason,
  createRecommendation,
  rankRecommendations
} from "@career-companion/career-intelligence";
import type {
  EvidenceReferenceSnapshot,
  ProjectSnapshot,
  StorySnapshot
} from "@career-companion/career-knowledge";
import type { PortfolioEvidence, PortfolioProject, RankedStory } from "../models";
import { idToString, immutableArray } from "../shared";

export class ProjectSelector {
  select(projects: readonly ProjectSnapshot[], limit = projects.length): readonly PortfolioProject[] {
    return immutableArray(rankRecommendations(projects.map((project) => {
      const projectId = idToString(project.id);
      const evidenceWeight = Math.min(project.evidenceReferenceIds.length * 15, 35);
      const competencyWeight = Math.min(project.competencyIds.length * 10, 25);
      const technologyWeight = Math.min(project.technologyIds.length * 10, 20);
      const assetWeight = Math.min(project.portfolioAssetIds.length * 10, 20);

      return createRecommendation({
        subject: project,
        score: evidenceWeight + competencyWeight + technologyWeight + assetWeight,
        confidence: project.evidenceReferenceIds.length > 0 ? 0.8 : 0.45,
        reasons: [
          createReason("project-evidence", "Evidence-backed projects are prioritized.", evidenceWeight, [projectId]),
          createReason("project-depth", "Competencies, technologies, and portfolio assets increase project strength.", competencyWeight + technologyWeight + assetWeight, [projectId])
        ],
        supportingReferenceIds: [projectId],
        summary: `${project.name} has deterministic portfolio priority.`
      });
    })).slice(0, limit).map((ranking) => Object.freeze({
      project: ranking.subject,
      rank: ranking.rank,
      score: ranking.score,
      confidence: ranking.confidence
    })));
  }
}

export class CaseStudyPrioritizer {
  constructor(private readonly storySelector = new PortfolioStorySelector()) {}

  prioritize(stories: readonly StorySnapshot[], limit = stories.length): readonly RankedStory[] {
    return this.storySelector.select(stories, limit);
  }
}

export class EvidenceSelector {
  constructor(private readonly evidenceSelector = new DeterministicPortfolioEvidenceSelector()) {}

  select(evidence: readonly EvidenceReferenceSnapshot[], limit = evidence.length): readonly PortfolioEvidence[] {
    return immutableArray(this.evidenceSelector.select(evidence, limit).map((ranking) => Object.freeze({
      evidence: ranking.subject,
      rank: ranking.rank,
      score: ranking.score,
      confidence: ranking.confidence
    })));
  }
}
