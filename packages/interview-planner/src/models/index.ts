import type { CareerArtifact } from "@career-companion/career-artifacts";
import type { CareerStrategy } from "@career-companion/career-strategy";
import type { DecisionReference } from "@career-companion/decision-model";
import type { ExplanationSummary } from "@career-companion/explainability";
import type { LearningPlan } from "@career-companion/learning-planner";
import type { OpportunityDecision } from "@career-companion/opportunity-intelligence";
import type { PortfolioPlan } from "@career-companion/portfolio-planner";
import type {
  Confidence,
  ConfidenceFactor,
  GapClassification,
  RankingReason,
  RecommendationCategory,
  RecommendationImpact,
  RecommendationPriority,
  RecommendationType,
  ScoreBreakdown,
  ScoreDimension
} from "@career-companion/product-intelligence";
import type {
  InterviewInitiativeKind,
  InterviewPlannerPolicy,
  InterviewPlannerStage,
  InterviewPlanOutcome,
  InterviewPlanningConstraint,
  InterviewPlanningPreference,
  InterviewReadinessCategory
} from "../policies";

export interface InterviewPlanContextInput {
  readonly careerStrategy: CareerStrategy;
  readonly portfolioPlan: PortfolioPlan;
  readonly learningPlan: LearningPlan;
  readonly opportunityDecision: OpportunityDecision;
  readonly assumptions?: readonly string[];
  readonly constraints?: readonly InterviewPlanningConstraint[];
  readonly preferences?: readonly InterviewPlanningPreference[];
  readonly policy?: Partial<InterviewPlannerPolicy>;
  readonly traceId: string;
}

export interface InterviewPlannerStageDefinition {
  readonly stage: InterviewPlannerStage;
  readonly order: number;
  readonly entryCriteria: readonly string[];
  readonly exitCriteria: readonly string[];
  readonly dependencies: readonly InterviewPlannerStage[];
}

export interface InterviewPlanContext {
  readonly artifactKind: "InterviewPlanContext";
  readonly contextId: string;
  readonly careerStrategy: CareerStrategy;
  readonly portfolioPlan: PortfolioPlan;
  readonly learningPlan: LearningPlan;
  readonly opportunityDecision: OpportunityDecision;
  readonly targetRoleExpectations: readonly string[];
  readonly strategicPriorities: readonly string[];
  readonly capabilityReferences: readonly string[];
  readonly portfolioEvidenceReferences: readonly string[];
  readonly sourceReferences: readonly DecisionReference[];
  readonly sequence: readonly InterviewPlannerStageDefinition[];
  readonly currentStage: InterviewPlannerStage;
  readonly policy: InterviewPlannerPolicy;
  readonly preferences: readonly InterviewPlanningPreference[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly InterviewPlanningConstraint[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface InterviewNeed {
  readonly needId: string;
  readonly category: InterviewReadinessCategory;
  readonly currentReadinessReference: string;
  readonly desiredReadiness: string;
  readonly gap: GapClassification;
  readonly strategicImportance: ScoreDimension;
  readonly confidence: Confidence;
  readonly evidence: readonly string[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly InterviewPlanningConstraint[];
  readonly explanationSummary: ExplanationSummary;
  readonly traceLink: string;
}

export interface InterviewNeeds {
  readonly artifactKind: "InterviewNeeds";
  readonly needsId: string;
  readonly contextId: string;
  readonly careerStrategy: CareerStrategy;
  readonly portfolioPlan: PortfolioPlan;
  readonly learningPlan: LearningPlan;
  readonly opportunityDecision: OpportunityDecision;
  readonly needs: readonly InterviewNeed[];
  readonly policy: InterviewPlannerPolicy;
  readonly preferences: readonly InterviewPlanningPreference[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly InterviewPlanningConstraint[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface InterviewInitiative {
  readonly initiativeId: string;
  readonly kind: InterviewInitiativeKind;
  readonly title: string;
  readonly readinessNeedIds: readonly string[];
  readonly category: RecommendationCategory;
  readonly recommendationType: RecommendationType;
  readonly expectedReadinessOutcome: string;
  readonly evidenceContribution: readonly string[];
  readonly rationale: RankingReason;
  readonly confidence: Confidence;
}

export interface InterviewInitiatives {
  readonly artifactKind: "InterviewInitiatives";
  readonly initiativesId: string;
  readonly needsId: string;
  readonly careerStrategy: CareerStrategy;
  readonly portfolioPlan: PortfolioPlan;
  readonly learningPlan: LearningPlan;
  readonly opportunityDecision: OpportunityDecision;
  readonly initiatives: readonly InterviewInitiative[];
  readonly policy: InterviewPlannerPolicy;
  readonly preferences: readonly InterviewPlanningPreference[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly InterviewPlanningConstraint[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface InterviewEvaluationItem {
  readonly initiativeId: string;
  readonly kind: InterviewInitiativeKind;
  readonly strategicImpact: ScoreDimension;
  readonly interviewCoverage: ScoreDimension;
  readonly capabilityReinforcement: ScoreDimension;
  readonly evidenceContribution: ScoreDimension;
  readonly recruiterRelevance: ScoreDimension;
  readonly hiringManagerRelevance: ScoreDimension;
  readonly effort: ScoreDimension;
  readonly complexity: ScoreDimension;
  readonly dependency: ScoreDimension;
  readonly leverage: ScoreDimension;
  readonly opportunityCost: ScoreDimension;
  readonly initiativeRisk: ScoreDimension;
  readonly scoreBreakdown: ScoreBreakdown;
  readonly priority: RecommendationPriority;
  readonly impact: RecommendationImpact;
  readonly confidence: Confidence;
}

export interface InterviewEvaluation {
  readonly artifactKind: "InterviewEvaluation";
  readonly evaluationId: string;
  readonly initiativesId: string;
  readonly careerStrategy: CareerStrategy;
  readonly portfolioPlan: PortfolioPlan;
  readonly learningPlan: LearningPlan;
  readonly opportunityDecision: OpportunityDecision;
  readonly evaluations: readonly InterviewEvaluationItem[];
  readonly policy: InterviewPlannerPolicy;
  readonly preferences: readonly InterviewPlanningPreference[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly InterviewPlanningConstraint[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface InterviewRoadmapItem {
  readonly roadmapItemId: string;
  readonly initiativeId: string;
  readonly sequence: number;
  readonly dependencyIds: readonly string[];
  readonly milestone: string;
  readonly completionCriteria: readonly string[];
  readonly priority: RecommendationPriority;
  readonly expectedReadinessOutcome: string;
  readonly confidence: Confidence;
}

export interface InterviewRoadmap {
  readonly artifactKind: "InterviewRoadmap";
  readonly roadmapId: string;
  readonly evaluationId: string;
  readonly careerStrategy: CareerStrategy;
  readonly portfolioPlan: PortfolioPlan;
  readonly learningPlan: LearningPlan;
  readonly opportunityDecision: OpportunityDecision;
  readonly items: readonly InterviewRoadmapItem[];
  readonly policy: InterviewPlannerPolicy;
  readonly preferences: readonly InterviewPlanningPreference[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly InterviewPlanningConstraint[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface InterviewPlanRecommendation {
  readonly recommendationId: string;
  readonly priority: RecommendationPriority;
  readonly category: RecommendationCategory;
  readonly recommendationType: RecommendationType;
  readonly impact: RecommendationImpact;
  readonly affectedInitiativeIds: readonly string[];
  readonly rationale: string;
  readonly confidence: Confidence;
}

export interface InterviewPlan {
  readonly artifactKind: "InterviewPlan";
  readonly planId: string;
  readonly roadmapId: string;
  readonly outcome: InterviewPlanOutcome;
  readonly prioritizedReadinessInitiatives: readonly InterviewRoadmapItem[];
  readonly expectedReadinessOutcomes: readonly string[];
  readonly rationale: readonly string[];
  readonly recommendations: readonly InterviewPlanRecommendation[];
  readonly confidenceFactors: readonly ConfidenceFactor[];
  readonly evidenceReferences: readonly string[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly InterviewPlanningConstraint[];
  readonly milestones: readonly string[];
  readonly decisionTrace: string;
  readonly artifact: CareerArtifact;
  readonly explanationSummary: ExplanationSummary;
}

export interface InterviewPlannerExplanationInput {
  readonly decisionId: string;
  readonly title: string;
  readonly outcome: string;
  readonly confidenceScore: number;
  readonly evidenceReferenceIds: readonly string[];
  readonly reasonCodes: readonly string[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly string[];
  readonly tradeOffs: readonly string[];
}
