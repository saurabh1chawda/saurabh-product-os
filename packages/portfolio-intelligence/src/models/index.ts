import type { CareerArtifact, ArtifactSection } from "@career-companion/career-artifacts";
import type { Confidence, Ranking, RecommendationScore } from "@career-companion/career-intelligence";
import type {
  AchievementSnapshot,
  CompetencySnapshot,
  EvidenceReferenceSnapshot,
  MetricSnapshot,
  PortfolioAssetSnapshot,
  ProjectSnapshot,
  StorySnapshot
} from "@career-companion/career-knowledge";
import type { DecisionTrace } from "@career-companion/decision-engine";
import type { AlternativeSummary, ConstraintSummary, ExplanationSummary } from "@career-companion/explainability";

export type PortfolioSectionType = "overview" | "case-studies" | "evidence" | "gaps" | "recommendations";

export interface PortfolioSourceData {
  readonly projects: readonly ProjectSnapshot[];
  readonly portfolioAssets: readonly PortfolioAssetSnapshot[];
  readonly stories: readonly StorySnapshot[];
  readonly achievements: readonly AchievementSnapshot[];
  readonly competencies: readonly CompetencySnapshot[];
  readonly metrics: readonly MetricSnapshot[];
  readonly evidence: readonly EvidenceReferenceSnapshot[];
  readonly requiredCompetencyIds: readonly string[];
  readonly decisionTrace: DecisionTrace;
}

export interface PortfolioProject {
  readonly project: ProjectSnapshot;
  readonly rank: number;
  readonly score: RecommendationScore;
  readonly confidence: Confidence;
}

export interface PortfolioEvidence {
  readonly evidence: EvidenceReferenceSnapshot;
  readonly rank: number;
  readonly score: RecommendationScore;
  readonly confidence: Confidence;
}

export interface PortfolioExplanation {
  readonly selectedEvidence: readonly PortfolioEvidence[];
  readonly competencies: readonly CompetencySnapshot[];
  readonly confidence: Confidence;
  readonly decisionTraceReference: string;
  readonly acceptedAlternative: AlternativeSummary["acceptedAlternative"];
  readonly rejectedAlternatives: AlternativeSummary["rejectedAlternatives"];
  readonly constraintSummary: ConstraintSummary;
  readonly explanationSummary: ExplanationSummary;
}

export interface PortfolioCaseStudy {
  readonly caseStudyId: string;
  readonly project: ProjectSnapshot;
  readonly problem: string;
  readonly actions: readonly string[];
  readonly outcomes: readonly string[];
  readonly metrics: readonly MetricSnapshot[];
  readonly evidence: readonly PortfolioEvidence[];
  readonly competencies: readonly CompetencySnapshot[];
  readonly explanation: PortfolioExplanation;
  readonly confidence: Confidence;
  readonly decisionTraceReference: string;
  readonly acceptedAlternative: PortfolioExplanation["acceptedAlternative"];
  readonly rejectedAlternatives: PortfolioExplanation["rejectedAlternatives"];
  readonly explanationSummary: ExplanationSummary;
}

export interface PortfolioGap {
  readonly gapId: string;
  readonly description: string;
  readonly severity: "low" | "medium" | "high";
  readonly supportingEvidence: readonly PortfolioEvidence[];
  readonly recommendedImprovement: string;
  readonly confidence: Confidence;
}

export interface PortfolioRecommendation {
  readonly recommendationId: string;
  readonly title: string;
  readonly reason: string;
  readonly selectedEvidence: readonly PortfolioEvidence[];
  readonly competencies: readonly CompetencySnapshot[];
  readonly confidence: Confidence;
  readonly decisionTraceReference: string;
  readonly acceptedAlternative: PortfolioExplanation["acceptedAlternative"];
  readonly rejectedAlternatives: PortfolioExplanation["rejectedAlternatives"];
  readonly constraintSummary: ConstraintSummary;
  readonly explanationSummary: ExplanationSummary;
}

export interface PortfolioScore {
  readonly value: number;
  readonly projectQuality: number;
  readonly businessImpact: number;
  readonly technicalDepth: number;
  readonly leadershipEvidence: number;
  readonly domainDiversity: number;
  readonly recency: number;
  readonly evidenceStrength: number;
  readonly coverage: number;
  readonly consistency: number;
}

export type PortfolioSection<TContent = unknown> = ArtifactSection<TContent> & {
  readonly sectionType: PortfolioSectionType;
};

export interface PortfolioModel {
  readonly artifact: CareerArtifact;
  readonly caseStudies: readonly PortfolioCaseStudy[];
  readonly projects: readonly PortfolioProject[];
  readonly recommendations: readonly PortfolioRecommendation[];
  readonly gaps: readonly PortfolioGap[];
  readonly score: PortfolioScore;
  readonly explanationSummary: ExplanationSummary;
  readonly sections: readonly PortfolioSection[];
}

export type RankedStory = Ranking<StorySnapshot>;
