import type { CareerArtifact } from "@career-companion/career-artifacts";
import type { CareerStrategy } from "@career-companion/career-strategy";
import type { DecisionReference } from "@career-companion/decision-model";
import type { ExplanationSummary } from "@career-companion/explainability";
import type { InterviewPlan } from "@career-companion/interview-planner";
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
  NetworkingInitiativeKind,
  NetworkingNeedCategory,
  NetworkingPlannerPolicy,
  NetworkingPlannerStage,
  NetworkingPlanOutcome,
  NetworkingPlanningConstraint,
  NetworkingPlanningPreference
} from "../policies";

export interface NetworkingPlanContextInput {
  readonly careerStrategy: CareerStrategy;
  readonly portfolioPlan: PortfolioPlan;
  readonly learningPlan: LearningPlan;
  readonly interviewPlan: InterviewPlan;
  readonly opportunityDecision: OpportunityDecision;
  readonly assumptions?: readonly string[];
  readonly constraints?: readonly NetworkingPlanningConstraint[];
  readonly preferences?: readonly NetworkingPlanningPreference[];
  readonly policy?: Partial<NetworkingPlannerPolicy>;
  readonly traceId: string;
}

export interface NetworkingPlannerStageDefinition {
  readonly stage: NetworkingPlannerStage;
  readonly order: number;
  readonly entryCriteria: readonly string[];
  readonly exitCriteria: readonly string[];
  readonly dependencies: readonly NetworkingPlannerStage[];
}

export interface NetworkingPlanContext {
  readonly artifactKind: "NetworkingPlanContext";
  readonly contextId: string;
  readonly careerStrategy: CareerStrategy;
  readonly portfolioPlan: PortfolioPlan;
  readonly learningPlan: LearningPlan;
  readonly interviewPlan: InterviewPlan;
  readonly opportunityDecision: OpportunityDecision;
  readonly targetOpportunities: readonly string[];
  readonly strategicPriorities: readonly string[];
  readonly portfolioReferences: readonly string[];
  readonly capabilityReferences: readonly string[];
  readonly interviewReadinessReferences: readonly string[];
  readonly sourceReferences: readonly DecisionReference[];
  readonly sequence: readonly NetworkingPlannerStageDefinition[];
  readonly currentStage: NetworkingPlannerStage;
  readonly policy: NetworkingPlannerPolicy;
  readonly preferences: readonly NetworkingPlanningPreference[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly NetworkingPlanningConstraint[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface NetworkingNeed {
  readonly needId: string;
  readonly category: NetworkingNeedCategory;
  readonly currentNetworkingReference: string;
  readonly desiredNetworkingOutcome: string;
  readonly gap: GapClassification;
  readonly strategicImportance: ScoreDimension;
  readonly confidence: Confidence;
  readonly evidence: readonly string[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly NetworkingPlanningConstraint[];
  readonly explanationSummary: ExplanationSummary;
  readonly traceLink: string;
}

export interface NetworkingNeeds {
  readonly artifactKind: "NetworkingNeeds";
  readonly needsId: string;
  readonly contextId: string;
  readonly careerStrategy: CareerStrategy;
  readonly portfolioPlan: PortfolioPlan;
  readonly learningPlan: LearningPlan;
  readonly interviewPlan: InterviewPlan;
  readonly opportunityDecision: OpportunityDecision;
  readonly needs: readonly NetworkingNeed[];
  readonly policy: NetworkingPlannerPolicy;
  readonly preferences: readonly NetworkingPlanningPreference[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly NetworkingPlanningConstraint[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface NetworkingInitiative {
  readonly initiativeId: string;
  readonly kind: NetworkingInitiativeKind;
  readonly title: string;
  readonly networkingNeedIds: readonly string[];
  readonly category: RecommendationCategory;
  readonly recommendationType: RecommendationType;
  readonly expectedNetworkingOutcome: string;
  readonly evidenceContribution: readonly string[];
  readonly rationale: RankingReason;
  readonly confidence: Confidence;
}

export interface NetworkingInitiatives {
  readonly artifactKind: "NetworkingInitiatives";
  readonly initiativesId: string;
  readonly needsId: string;
  readonly careerStrategy: CareerStrategy;
  readonly portfolioPlan: PortfolioPlan;
  readonly learningPlan: LearningPlan;
  readonly interviewPlan: InterviewPlan;
  readonly opportunityDecision: OpportunityDecision;
  readonly initiatives: readonly NetworkingInitiative[];
  readonly policy: NetworkingPlannerPolicy;
  readonly preferences: readonly NetworkingPlanningPreference[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly NetworkingPlanningConstraint[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface NetworkingEvaluationItem {
  readonly initiativeId: string;
  readonly kind: NetworkingInitiativeKind;
  readonly strategicImpact: ScoreDimension;
  readonly opportunityAlignment: ScoreDimension;
  readonly visibilityImprovement: ScoreDimension;
  readonly relationshipLeverage: ScoreDimension;
  readonly recruiterRelevance: ScoreDimension;
  readonly hiringManagerRelevance: ScoreDimension;
  readonly effort: ScoreDimension;
  readonly complexity: ScoreDimension;
  readonly dependency: ScoreDimension;
  readonly opportunityCost: ScoreDimension;
  readonly initiativeRisk: ScoreDimension;
  readonly scoreBreakdown: ScoreBreakdown;
  readonly priority: RecommendationPriority;
  readonly impact: RecommendationImpact;
  readonly confidence: Confidence;
}

export interface NetworkingEvaluation {
  readonly artifactKind: "NetworkingEvaluation";
  readonly evaluationId: string;
  readonly initiativesId: string;
  readonly careerStrategy: CareerStrategy;
  readonly portfolioPlan: PortfolioPlan;
  readonly learningPlan: LearningPlan;
  readonly interviewPlan: InterviewPlan;
  readonly opportunityDecision: OpportunityDecision;
  readonly evaluations: readonly NetworkingEvaluationItem[];
  readonly policy: NetworkingPlannerPolicy;
  readonly preferences: readonly NetworkingPlanningPreference[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly NetworkingPlanningConstraint[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface NetworkingRoadmapItem {
  readonly roadmapItemId: string;
  readonly initiativeId: string;
  readonly sequence: number;
  readonly dependencyIds: readonly string[];
  readonly milestone: string;
  readonly completionCriteria: readonly string[];
  readonly priority: RecommendationPriority;
  readonly expectedNetworkingOutcome: string;
  readonly confidence: Confidence;
}

export interface NetworkingRoadmap {
  readonly artifactKind: "NetworkingRoadmap";
  readonly roadmapId: string;
  readonly evaluationId: string;
  readonly careerStrategy: CareerStrategy;
  readonly portfolioPlan: PortfolioPlan;
  readonly learningPlan: LearningPlan;
  readonly interviewPlan: InterviewPlan;
  readonly opportunityDecision: OpportunityDecision;
  readonly items: readonly NetworkingRoadmapItem[];
  readonly policy: NetworkingPlannerPolicy;
  readonly preferences: readonly NetworkingPlanningPreference[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly NetworkingPlanningConstraint[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface NetworkingPlanRecommendation {
  readonly recommendationId: string;
  readonly priority: RecommendationPriority;
  readonly category: RecommendationCategory;
  readonly recommendationType: RecommendationType;
  readonly impact: RecommendationImpact;
  readonly affectedInitiativeIds: readonly string[];
  readonly rationale: string;
  readonly confidence: Confidence;
}

export interface NetworkingPlan {
  readonly artifactKind: "NetworkingPlan";
  readonly planId: string;
  readonly roadmapId: string;
  readonly outcome: NetworkingPlanOutcome;
  readonly prioritizedNetworkingInitiatives: readonly NetworkingRoadmapItem[];
  readonly rationale: readonly string[];
  readonly recommendations: readonly NetworkingPlanRecommendation[];
  readonly expectedNetworkingOutcomes: readonly string[];
  readonly confidenceFactors: readonly ConfidenceFactor[];
  readonly evidenceReferences: readonly string[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly NetworkingPlanningConstraint[];
  readonly milestones: readonly string[];
  readonly decisionTrace: string;
  readonly artifact: CareerArtifact;
  readonly explanationSummary: ExplanationSummary;
}

export interface NetworkingPlannerExplanationInput {
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
