import type { CareerArtifact } from "@career-companion/career-artifacts";
import type { CareerStrategy } from "@career-companion/career-strategy";
import type { DecisionReference } from "@career-companion/decision-model";
import type { ExplanationSummary } from "@career-companion/explainability";
import type { InterviewPlan } from "@career-companion/interview-planner";
import type { LearningPlan } from "@career-companion/learning-planner";
import type { NetworkingPlan } from "@career-companion/networking-planner";
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
  ApplicationInitiativeKind,
  ApplicationNeedCategory,
  ApplicationPlannerPolicy,
  ApplicationPlannerStage,
  ApplicationPlanOutcome,
  ApplicationPlanningConstraint,
  ApplicationPlanningPreference
} from "../policies";

export interface ApplicationPlanContextInput {
  readonly careerStrategy: CareerStrategy;
  readonly portfolioPlan: PortfolioPlan;
  readonly learningPlan: LearningPlan;
  readonly interviewPlan: InterviewPlan;
  readonly networkingPlan: NetworkingPlan;
  readonly opportunityDecision: OpportunityDecision;
  readonly assumptions?: readonly string[];
  readonly constraints?: readonly ApplicationPlanningConstraint[];
  readonly preferences?: readonly ApplicationPlanningPreference[];
  readonly policy?: Partial<ApplicationPlannerPolicy>;
  readonly traceId: string;
}

export interface ApplicationPlannerStageDefinition {
  readonly stage: ApplicationPlannerStage;
  readonly order: number;
  readonly entryCriteria: readonly string[];
  readonly exitCriteria: readonly string[];
  readonly dependencies: readonly ApplicationPlannerStage[];
}

export interface ApplicationPlanContext {
  readonly artifactKind: "ApplicationPlanContext";
  readonly contextId: string;
  readonly careerStrategy: CareerStrategy;
  readonly portfolioPlan: PortfolioPlan;
  readonly learningPlan: LearningPlan;
  readonly interviewPlan: InterviewPlan;
  readonly networkingPlan: NetworkingPlan;
  readonly opportunityDecision: OpportunityDecision;
  readonly targetOpportunities: readonly string[];
  readonly strategicPriorities: readonly string[];
  readonly portfolioReferences: readonly string[];
  readonly capabilityReferences: readonly string[];
  readonly interviewReadinessReferences: readonly string[];
  readonly networkingReadinessReferences: readonly string[];
  readonly sourceReferences: readonly DecisionReference[];
  readonly sequence: readonly ApplicationPlannerStageDefinition[];
  readonly currentStage: ApplicationPlannerStage;
  readonly policy: ApplicationPlannerPolicy;
  readonly preferences: readonly ApplicationPlanningPreference[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly ApplicationPlanningConstraint[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface ApplicationNeed {
  readonly needId: string;
  readonly category: ApplicationNeedCategory;
  readonly currentApplicationReference: string;
  readonly desiredApplicationOutcome: string;
  readonly gap: GapClassification;
  readonly strategicImportance: ScoreDimension;
  readonly confidence: Confidence;
  readonly evidence: readonly string[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly ApplicationPlanningConstraint[];
  readonly explanationSummary: ExplanationSummary;
  readonly traceLink: string;
}

export interface ApplicationNeeds {
  readonly artifactKind: "ApplicationNeeds";
  readonly needsId: string;
  readonly contextId: string;
  readonly careerStrategy: CareerStrategy;
  readonly portfolioPlan: PortfolioPlan;
  readonly learningPlan: LearningPlan;
  readonly interviewPlan: InterviewPlan;
  readonly networkingPlan: NetworkingPlan;
  readonly opportunityDecision: OpportunityDecision;
  readonly needs: readonly ApplicationNeed[];
  readonly policy: ApplicationPlannerPolicy;
  readonly preferences: readonly ApplicationPlanningPreference[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly ApplicationPlanningConstraint[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface ApplicationInitiative {
  readonly initiativeId: string;
  readonly kind: ApplicationInitiativeKind;
  readonly title: string;
  readonly applicationNeedIds: readonly string[];
  readonly category: RecommendationCategory;
  readonly recommendationType: RecommendationType;
  readonly expectedApplicationOutcome: string;
  readonly evidenceContribution: readonly string[];
  readonly rationale: RankingReason;
  readonly confidence: Confidence;
}

export interface ApplicationInitiatives {
  readonly artifactKind: "ApplicationInitiatives";
  readonly initiativesId: string;
  readonly needsId: string;
  readonly careerStrategy: CareerStrategy;
  readonly portfolioPlan: PortfolioPlan;
  readonly learningPlan: LearningPlan;
  readonly interviewPlan: InterviewPlan;
  readonly networkingPlan: NetworkingPlan;
  readonly opportunityDecision: OpportunityDecision;
  readonly initiatives: readonly ApplicationInitiative[];
  readonly policy: ApplicationPlannerPolicy;
  readonly preferences: readonly ApplicationPlanningPreference[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly ApplicationPlanningConstraint[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface ApplicationEvaluationItem {
  readonly initiativeId: string;
  readonly kind: ApplicationInitiativeKind;
  readonly strategicImpact: ScoreDimension;
  readonly opportunityAlignment: ScoreDimension;
  readonly readinessImprovement: ScoreDimension;
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

export interface ApplicationEvaluation {
  readonly artifactKind: "ApplicationEvaluation";
  readonly evaluationId: string;
  readonly initiativesId: string;
  readonly careerStrategy: CareerStrategy;
  readonly portfolioPlan: PortfolioPlan;
  readonly learningPlan: LearningPlan;
  readonly interviewPlan: InterviewPlan;
  readonly networkingPlan: NetworkingPlan;
  readonly opportunityDecision: OpportunityDecision;
  readonly evaluations: readonly ApplicationEvaluationItem[];
  readonly policy: ApplicationPlannerPolicy;
  readonly preferences: readonly ApplicationPlanningPreference[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly ApplicationPlanningConstraint[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface ApplicationRoadmapItem {
  readonly roadmapItemId: string;
  readonly initiativeId: string;
  readonly sequence: number;
  readonly dependencyIds: readonly string[];
  readonly milestone: string;
  readonly completionCriteria: readonly string[];
  readonly priority: RecommendationPriority;
  readonly expectedApplicationOutcome: string;
  readonly confidence: Confidence;
}

export interface ApplicationRoadmap {
  readonly artifactKind: "ApplicationRoadmap";
  readonly roadmapId: string;
  readonly evaluationId: string;
  readonly careerStrategy: CareerStrategy;
  readonly portfolioPlan: PortfolioPlan;
  readonly learningPlan: LearningPlan;
  readonly interviewPlan: InterviewPlan;
  readonly networkingPlan: NetworkingPlan;
  readonly opportunityDecision: OpportunityDecision;
  readonly items: readonly ApplicationRoadmapItem[];
  readonly policy: ApplicationPlannerPolicy;
  readonly preferences: readonly ApplicationPlanningPreference[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly ApplicationPlanningConstraint[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface ApplicationPlanRecommendation {
  readonly recommendationId: string;
  readonly priority: RecommendationPriority;
  readonly category: RecommendationCategory;
  readonly recommendationType: RecommendationType;
  readonly impact: RecommendationImpact;
  readonly affectedInitiativeIds: readonly string[];
  readonly rationale: string;
  readonly confidence: Confidence;
}

export interface ApplicationPlan {
  readonly artifactKind: "ApplicationPlan";
  readonly planId: string;
  readonly roadmapId: string;
  readonly outcome: ApplicationPlanOutcome;
  readonly prioritizedApplicationInitiatives: readonly ApplicationRoadmapItem[];
  readonly rationale: readonly string[];
  readonly recommendations: readonly ApplicationPlanRecommendation[];
  readonly expectedApplicationOutcomes: readonly string[];
  readonly confidenceFactors: readonly ConfidenceFactor[];
  readonly evidenceReferences: readonly string[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly ApplicationPlanningConstraint[];
  readonly milestones: readonly string[];
  readonly decisionTrace: string;
  readonly artifact: CareerArtifact;
  readonly explanationSummary: ExplanationSummary;
}

export interface ApplicationPlannerExplanationInput {
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
