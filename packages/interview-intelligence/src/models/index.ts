import type { CareerArtifact, ArtifactSection } from "@career-companion/career-artifacts";
import type { Confidence, RecommendationScore } from "@career-companion/career-intelligence";
import type {
  CompetencySnapshot,
  EvidenceReferenceSnapshot,
  MetricSnapshot,
  StorySnapshot
} from "@career-companion/career-knowledge";
import type { DecisionTrace } from "@career-companion/decision-engine";
import type { AlternativeSummary, ConstraintSummary, ExplanationSummary } from "@career-companion/explainability";

export type InterviewQuestionCategory =
  | "Behavioral"
  | "Leadership"
  | "ProductSense"
  | "ProductExecution"
  | "ProductStrategy"
  | "Analytical"
  | "TechnicalProduct"
  | "StakeholderManagement"
  | "CustomerDiscovery"
  | "Prioritization"
  | "FailureAndLearning"
  | "ConflictResolution"
  | "CareerMotivation"
  | "DomainSpecific"
  | "CaseStudy"
  | "Unknown";

export type InterviewAnswerFramework =
  | "STAR"
  | "CAR"
  | "PAR"
  | "PrincipleEvidenceOutcome"
  | "HypothesisApproachTradeoffOutcome"
  | "ClarifyStructureAnalyzeRecommend"
  | "MotivationEvidenceAlignment";

export type InterviewSectionType =
  | "context"
  | "question-analysis"
  | "competencies"
  | "recommended-story"
  | "answer-plan"
  | "evidence"
  | "follow-ups"
  | "gaps"
  | "recommendations"
  | "score"
  | "explanation";

export interface InterviewQuestion {
  readonly originalText: string;
  readonly normalizedText: string;
  readonly tokens: readonly string[];
}

export interface InterviewTargetContext {
  readonly targetRole?: string;
  readonly targetSeniority?: string;
  readonly targetCompanyContext?: string;
  readonly targetDomain?: string;
  readonly interviewFormat?: string;
}

export interface InterviewSourceData {
  readonly competencies: readonly CompetencySnapshot[];
  readonly stories: readonly StorySnapshot[];
  readonly metrics: readonly MetricSnapshot[];
  readonly evidence: readonly EvidenceReferenceSnapshot[];
  readonly decisionTrace: DecisionTrace;
}

export interface InterviewInput {
  readonly questionText: string;
  readonly targetContext?: InterviewTargetContext;
  readonly requiredCompetencyIds?: readonly string[];
  readonly source: InterviewSourceData;
  readonly policies?: InterviewPolicy;
}

export interface InterviewPolicy {
  readonly maximumAlternatives?: number;
  readonly followUpCount?: number;
}

export interface InterviewQuestionClassification {
  readonly primaryCategory: InterviewQuestionCategory;
  readonly secondaryCategories: readonly InterviewQuestionCategory[];
  readonly detectedSignals: readonly string[];
  readonly confidence: Confidence;
  readonly rationale: readonly string[];
}

export interface InterviewCompetencyMapping {
  readonly competency: CompetencySnapshot;
  readonly relevanceWeight: number;
  readonly rationale: string;
  readonly supportingClassificationSignals: readonly string[];
  readonly confidence: Confidence;
}

export interface InterviewEvidenceSelection {
  readonly evidence: EvidenceReferenceSnapshot;
  readonly rank: number;
  readonly score: RecommendationScore;
  readonly confidence: Confidence;
}

export interface InterviewStoryScoreBreakdown {
  readonly questionRelevance: number;
  readonly competencyCoverage: number;
  readonly evidenceStrength: number;
  readonly ownershipClarity: number;
  readonly problemClarity: number;
  readonly actionClarity: number;
  readonly outcomeStrength: number;
  readonly quantifiedImpact: number;
  readonly seniorityAlignment: number;
  readonly domainRelevance: number;
  readonly recency: number;
  readonly followUpResilience: number;
}

export interface InterviewStoryCandidate {
  readonly story: StorySnapshot;
  readonly rank: number;
  readonly totalScore: number;
  readonly evidenceStrength: number;
  readonly recency: number;
  readonly scoreBreakdown: InterviewStoryScoreBreakdown;
  readonly rankingRationale: readonly string[];
  readonly confidence: Confidence;
  readonly decisionTraceReference: string;
}

export interface InterviewStoryAlternative {
  readonly story: StorySnapshot;
  readonly rank: number;
  readonly totalScore: number;
  readonly rejectionReasons: readonly string[];
}

export interface InterviewStorySelection {
  readonly selectedStory?: InterviewStoryCandidate;
  readonly acceptedAlternative?: InterviewStoryAlternative;
  readonly rejectedAlternatives: readonly InterviewStoryAlternative[];
  readonly candidates: readonly InterviewStoryCandidate[];
}

export interface InterviewAnswerSection {
  readonly sectionId: string;
  readonly title: string;
  readonly content: readonly string[];
  readonly evidenceReferences: readonly InterviewEvidenceSelection[];
  readonly complete: boolean;
  readonly cautionNotes: readonly string[];
}

export interface InterviewAnswerPlan {
  readonly framework: InterviewAnswerFramework;
  readonly sections: readonly InterviewAnswerSection[];
}

export interface InterviewFollowUpQuestion {
  readonly followUpId: string;
  readonly questionText: string;
  readonly purpose: string;
  readonly competencyBeingTested: string;
  readonly supportingTrigger: string;
  readonly priority: number;
  readonly confidence: Confidence;
  readonly evidenceReadinessStatus: "ready" | "partial" | "missing";
}

export type InterviewGapType =
  | "no-relevant-story"
  | "weak-competency-coverage"
  | "weak-ownership"
  | "missing-quantified-outcome"
  | "weak-baseline-measurement"
  | "incomplete-actions"
  | "missing-tradeoff"
  | "limited-leadership-evidence"
  | "insufficient-technical-depth"
  | "weak-customer-evidence"
  | "outdated-evidence"
  | "low-domain-relevance"
  | "weak-learning-reflection"
  | "unsupported-claim"
  | "poor-follow-up-resilience";

export interface InterviewGap {
  readonly gapId: string;
  readonly gapType: InterviewGapType;
  readonly description: string;
  readonly severity: "low" | "medium" | "high";
  readonly affectedQuestionOrCompetency: string;
  readonly supportingEvidence: readonly InterviewEvidenceSelection[];
  readonly missingEvidence: readonly string[];
  readonly rationale: string;
  readonly recommendedImprovement: string;
  readonly confidence: Confidence;
}

export interface InterviewScoreDimension {
  readonly dimension: string;
  readonly score: number;
  readonly weight: number;
  readonly rationale: string;
}

export interface InterviewScoreDeduction {
  readonly code: string;
  readonly amount: number;
  readonly rationale: string;
}

export interface InterviewScore {
  readonly overallScore: number;
  readonly readinessBand: "low" | "medium" | "high";
  readonly dimensions: readonly InterviewScoreDimension[];
  readonly deductions: readonly InterviewScoreDeduction[];
  readonly confidence: Confidence;
}

export interface InterviewExplanation {
  readonly selectedEvidence: readonly InterviewEvidenceSelection[];
  readonly mappedCompetencies: readonly InterviewCompetencyMapping[];
  readonly confidence: Confidence;
  readonly decisionTraceReference: string;
  readonly acceptedAlternative: AlternativeSummary["acceptedAlternative"];
  readonly rejectedAlternatives: AlternativeSummary["rejectedAlternatives"];
  readonly constraintSummary: ConstraintSummary;
  readonly explanationSummary: ExplanationSummary;
}

export interface InterviewRecommendation {
  readonly recommendationId: string;
  readonly title: string;
  readonly reason: string;
  readonly selectedEvidence: readonly InterviewEvidenceSelection[];
  readonly mappedCompetencies: readonly InterviewCompetencyMapping[];
  readonly confidence: Confidence;
  readonly decisionTraceReference: string;
  readonly acceptedAlternative: InterviewExplanation["acceptedAlternative"];
  readonly rejectedAlternatives: InterviewExplanation["rejectedAlternatives"];
  readonly constraintSummary: ConstraintSummary;
  readonly explanationSummary: ExplanationSummary;
}

export type InterviewArtifactSection<TContent = unknown> = ArtifactSection<TContent> & {
  readonly sectionType: InterviewSectionType;
};

export interface InterviewModel {
  readonly artifact: CareerArtifact;
  readonly question: InterviewQuestion;
  readonly classification: InterviewQuestionClassification;
  readonly mappedCompetencies: readonly InterviewCompetencyMapping[];
  readonly storySelection: InterviewStorySelection;
  readonly answerPlan: InterviewAnswerPlan;
  readonly followUpQuestions: readonly InterviewFollowUpQuestion[];
  readonly recommendations: readonly InterviewRecommendation[];
  readonly gaps: readonly InterviewGap[];
  readonly readinessScore: InterviewScore;
  readonly explanationSummary: ExplanationSummary;
  readonly sections: readonly InterviewArtifactSection[];
}
