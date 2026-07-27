import type { CareerArtifact } from "@career-companion/career-artifacts";
import type { CareerStrategy } from "@career-companion/career-strategy";
import type { DecisionReference } from "@career-companion/decision-model";
import type { ExplanationSummary } from "@career-companion/explainability";
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
  CapabilityCategory,
  LearningInitiativeKind,
  LearningPlannerPolicy,
  LearningPlannerStage,
  LearningPlanOutcome,
  LearningPlanningConstraint,
  LearningPreference
} from "../policies";

export interface LearningPlanContextInput {
  readonly careerStrategy: CareerStrategy;
  readonly portfolioPlan: PortfolioPlan;
  readonly opportunityDecision: OpportunityDecision;
  readonly assumptions?: readonly string[];
  readonly constraints?: readonly LearningPlanningConstraint[];
  readonly preferences?: readonly LearningPreference[];
  readonly policy?: Partial<LearningPlannerPolicy>;
  readonly traceId: string;
}

export interface LearningPlannerStageDefinition {
  readonly stage: LearningPlannerStage;
  readonly order: number;
  readonly entryCriteria: readonly string[];
  readonly exitCriteria: readonly string[];
  readonly dependencies: readonly LearningPlannerStage[];
}

export interface LearningPlanContext {
  readonly artifactKind: "LearningPlanContext";
  readonly contextId: string;
  readonly careerStrategy: CareerStrategy;
  readonly portfolioPlan: PortfolioPlan;
  readonly opportunityDecision: OpportunityDecision;
  readonly strategicObjectives: readonly string[];
  readonly portfolioRoadmapReferences: readonly string[];
  readonly targetOpportunityReferences: readonly string[];
  readonly sourceReferences: readonly DecisionReference[];
  readonly sequence: readonly LearningPlannerStageDefinition[];
  readonly currentStage: LearningPlannerStage;
  readonly policy: LearningPlannerPolicy;
  readonly preferences: readonly LearningPreference[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly LearningPlanningConstraint[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface CapabilityNeed {
  readonly needId: string;
  readonly category: CapabilityCategory;
  readonly targetCapability: string;
  readonly currentCapabilityReference: string;
  readonly desiredCapability: string;
  readonly gap: GapClassification;
  readonly strategicImportance: ScoreDimension;
  readonly assumptions: readonly string[];
  readonly constraints: readonly LearningPlanningConstraint[];
  readonly confidence: Confidence;
  readonly supportingEvidence: readonly string[];
  readonly explanationSummary: ExplanationSummary;
  readonly traceLink: string;
}

export interface CapabilityNeeds {
  readonly artifactKind: "CapabilityNeeds";
  readonly needsId: string;
  readonly contextId: string;
  readonly careerStrategy: CareerStrategy;
  readonly portfolioPlan: PortfolioPlan;
  readonly opportunityDecision: OpportunityDecision;
  readonly needs: readonly CapabilityNeed[];
  readonly policy: LearningPlannerPolicy;
  readonly preferences: readonly LearningPreference[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly LearningPlanningConstraint[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface LearningInitiative {
  readonly initiativeId: string;
  readonly kind: LearningInitiativeKind;
  readonly title: string;
  readonly capabilityNeedIds: readonly string[];
  readonly category: RecommendationCategory;
  readonly recommendationType: RecommendationType;
  readonly expectedCapabilityOutcome: string;
  readonly evidenceContribution: readonly string[];
  readonly rationale: RankingReason;
  readonly confidence: Confidence;
}

export interface LearningInitiatives {
  readonly artifactKind: "LearningInitiatives";
  readonly initiativesId: string;
  readonly needsId: string;
  readonly careerStrategy: CareerStrategy;
  readonly portfolioPlan: PortfolioPlan;
  readonly opportunityDecision: OpportunityDecision;
  readonly initiatives: readonly LearningInitiative[];
  readonly policy: LearningPlannerPolicy;
  readonly preferences: readonly LearningPreference[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly LearningPlanningConstraint[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface LearningEvaluationItem {
  readonly initiativeId: string;
  readonly kind: LearningInitiativeKind;
  readonly strategicImpact: ScoreDimension;
  readonly capabilityCoverage: ScoreDimension;
  readonly evidenceContribution: ScoreDimension;
  readonly recruiterValue: ScoreDimension;
  readonly hiringManagerValue: ScoreDimension;
  readonly effort: ScoreDimension;
  readonly complexity: ScoreDimension;
  readonly dependency: ScoreDimension;
  readonly leverage: ScoreDimension;
  readonly opportunityCost: ScoreDimension;
  readonly executionRisk: ScoreDimension;
  readonly scoreBreakdown: ScoreBreakdown;
  readonly priority: RecommendationPriority;
  readonly impact: RecommendationImpact;
  readonly confidence: Confidence;
}

export interface LearningEvaluation {
  readonly artifactKind: "LearningEvaluation";
  readonly evaluationId: string;
  readonly initiativesId: string;
  readonly careerStrategy: CareerStrategy;
  readonly portfolioPlan: PortfolioPlan;
  readonly opportunityDecision: OpportunityDecision;
  readonly evaluations: readonly LearningEvaluationItem[];
  readonly policy: LearningPlannerPolicy;
  readonly preferences: readonly LearningPreference[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly LearningPlanningConstraint[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface LearningRoadmapItem {
  readonly roadmapItemId: string;
  readonly initiativeId: string;
  readonly sequence: number;
  readonly dependencyIds: readonly string[];
  readonly milestone: string;
  readonly completionCriteria: readonly string[];
  readonly priority: RecommendationPriority;
  readonly expectedOutcome: string;
  readonly confidence: Confidence;
}

export interface LearningRoadmap {
  readonly artifactKind: "LearningRoadmap";
  readonly roadmapId: string;
  readonly evaluationId: string;
  readonly careerStrategy: CareerStrategy;
  readonly portfolioPlan: PortfolioPlan;
  readonly opportunityDecision: OpportunityDecision;
  readonly items: readonly LearningRoadmapItem[];
  readonly policy: LearningPlannerPolicy;
  readonly preferences: readonly LearningPreference[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly LearningPlanningConstraint[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface LearningPlanRecommendation {
  readonly recommendationId: string;
  readonly priority: RecommendationPriority;
  readonly category: RecommendationCategory;
  readonly recommendationType: RecommendationType;
  readonly impact: RecommendationImpact;
  readonly affectedInitiativeIds: readonly string[];
  readonly rationale: string;
  readonly confidence: Confidence;
}

export interface LearningPlan {
  readonly artifactKind: "LearningPlan";
  readonly planId: string;
  readonly roadmapId: string;
  readonly outcome: LearningPlanOutcome;
  readonly prioritizedInitiatives: readonly LearningRoadmapItem[];
  readonly capabilityOutcomes: readonly string[];
  readonly strategicRationale: readonly string[];
  readonly recommendations: readonly LearningPlanRecommendation[];
  readonly confidenceFactors: readonly ConfidenceFactor[];
  readonly evidenceReferences: readonly string[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly LearningPlanningConstraint[];
  readonly milestones: readonly string[];
  readonly decisionTrace: string;
  readonly artifact: CareerArtifact;
  readonly explanationSummary: ExplanationSummary;
}

export interface LearningPlannerExplanationInput {
  readonly decisionId: string;
  readonly title: string;
  readonly outcome: string;
  readonly confidenceScore: number;
  readonly evidenceReferenceIds: readonly string[];
  readonly reasonCodes: readonly string[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly string[];
}
