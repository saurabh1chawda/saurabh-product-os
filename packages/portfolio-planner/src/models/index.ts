import type { CareerArtifact } from "@career-companion/career-artifacts";
import type { CareerStrategy } from "@career-companion/career-strategy";
import type { DecisionReference } from "@career-companion/decision-model";
import type { ExplanationSummary } from "@career-companion/explainability";
import type { OpportunityDecision } from "@career-companion/opportunity-intelligence";
import type { PortfolioModel } from "@career-companion/portfolio-intelligence";
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
import type { PortfolioInitiativeKind, PortfolioPlannerPolicy, PortfolioPlannerStage, PortfolioPlanOutcome, PortfolioPlanningConstraint } from "../policies";

export interface PortfolioPlanContextInput {
  readonly careerStrategy: CareerStrategy;
  readonly portfolio: PortfolioModel;
  readonly opportunityDecision: OpportunityDecision;
  readonly assumptions?: readonly string[];
  readonly constraints?: readonly PortfolioPlanningConstraint[];
  readonly policy?: Partial<PortfolioPlannerPolicy>;
  readonly traceId: string;
}

export interface PortfolioPlannerStageDefinition {
  readonly stage: PortfolioPlannerStage;
  readonly order: number;
  readonly entryCriteria: readonly string[];
  readonly exitCriteria: readonly string[];
  readonly dependencies: readonly PortfolioPlannerStage[];
}

export interface PortfolioPlanContext {
  readonly artifactKind: "PortfolioPlanContext";
  readonly contextId: string;
  readonly careerStrategy: CareerStrategy;
  readonly portfolio: PortfolioModel;
  readonly opportunityDecision: OpportunityDecision;
  readonly sourceReferences: readonly DecisionReference[];
  readonly sequence: readonly PortfolioPlannerStageDefinition[];
  readonly currentStage: PortfolioPlannerStage;
  readonly policy: PortfolioPlannerPolicy;
  readonly assumptions: readonly string[];
  readonly constraints: readonly PortfolioPlanningConstraint[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface EvidenceNeed {
  readonly needId: string;
  readonly label: string;
  readonly sourceGapId: string;
  readonly targetEvidenceType: string;
  readonly priority: RecommendationPriority;
  readonly severity: GapClassification["severity"];
  readonly rationale: RankingReason;
  readonly supportingReferences: readonly string[];
  readonly confidence: Confidence;
}

export interface EvidenceNeeds {
  readonly artifactKind: "EvidenceNeeds";
  readonly needsId: string;
  readonly contextId: string;
  readonly careerStrategy: CareerStrategy;
  readonly portfolio: PortfolioModel;
  readonly opportunityDecision: OpportunityDecision;
  readonly needs: readonly EvidenceNeed[];
  readonly portfolioGaps: readonly GapClassification[];
  readonly strategicRisks: readonly string[];
  readonly policy: PortfolioPlannerPolicy;
  readonly assumptions: readonly string[];
  readonly constraints: readonly PortfolioPlanningConstraint[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface PortfolioInitiative {
  readonly initiativeId: string;
  readonly kind: PortfolioInitiativeKind;
  readonly title: string;
  readonly objective: string;
  readonly evidenceNeedIds: readonly string[];
  readonly targetArtifactReferences: readonly string[];
  readonly category: RecommendationCategory;
  readonly recommendationType: RecommendationType;
  readonly rationale: RankingReason;
  readonly confidence: Confidence;
}

export interface PortfolioInitiatives {
  readonly artifactKind: "PortfolioInitiatives";
  readonly initiativesId: string;
  readonly needsId: string;
  readonly careerStrategy: CareerStrategy;
  readonly portfolio: PortfolioModel;
  readonly opportunityDecision: OpportunityDecision;
  readonly initiatives: readonly PortfolioInitiative[];
  readonly policy: PortfolioPlannerPolicy;
  readonly assumptions: readonly string[];
  readonly constraints: readonly PortfolioPlanningConstraint[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface InitiativeEvaluationItem {
  readonly initiativeId: string;
  readonly kind: PortfolioInitiativeKind;
  readonly strategicAlignment: ScoreDimension;
  readonly evidenceUrgency: ScoreDimension;
  readonly opportunityImpact: ScoreDimension;
  readonly feasibility: ScoreDimension;
  readonly scoreBreakdown: ScoreBreakdown;
  readonly priority: RecommendationPriority;
  readonly impact: RecommendationImpact;
  readonly confidence: Confidence;
}

export interface InitiativeEvaluation {
  readonly artifactKind: "InitiativeEvaluation";
  readonly evaluationId: string;
  readonly initiativesId: string;
  readonly careerStrategy: CareerStrategy;
  readonly portfolio: PortfolioModel;
  readonly opportunityDecision: OpportunityDecision;
  readonly evaluations: readonly InitiativeEvaluationItem[];
  readonly policy: PortfolioPlannerPolicy;
  readonly assumptions: readonly string[];
  readonly constraints: readonly PortfolioPlanningConstraint[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface RoadmapItem {
  readonly roadmapItemId: string;
  readonly initiativeId: string;
  readonly sequence: number;
  readonly priority: RecommendationPriority;
  readonly dependencyIds: readonly string[];
  readonly expectedImpact: RecommendationImpact;
  readonly completionSignal: string;
  readonly confidence: Confidence;
}

export interface PortfolioRoadmap {
  readonly artifactKind: "PortfolioRoadmap";
  readonly roadmapId: string;
  readonly evaluationId: string;
  readonly careerStrategy: CareerStrategy;
  readonly portfolio: PortfolioModel;
  readonly opportunityDecision: OpportunityDecision;
  readonly items: readonly RoadmapItem[];
  readonly policy: PortfolioPlannerPolicy;
  readonly assumptions: readonly string[];
  readonly constraints: readonly PortfolioPlanningConstraint[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface PortfolioPlanRecommendation {
  readonly recommendationId: string;
  readonly priority: RecommendationPriority;
  readonly category: RecommendationCategory;
  readonly recommendationType: RecommendationType;
  readonly impact: RecommendationImpact;
  readonly affectedInitiativeIds: readonly string[];
  readonly rationale: string;
  readonly confidence: Confidence;
}

export interface PortfolioPlan {
  readonly artifactKind: "PortfolioPlan";
  readonly planId: string;
  readonly roadmapId: string;
  readonly outcome: PortfolioPlanOutcome;
  readonly orderedInitiatives: readonly RoadmapItem[];
  readonly recommendations: readonly PortfolioPlanRecommendation[];
  readonly confidenceFactors: readonly ConfidenceFactor[];
  readonly supportingEvidence: readonly string[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly PortfolioPlanningConstraint[];
  readonly decisionTrace: string;
  readonly artifact: CareerArtifact;
  readonly explanationSummary: ExplanationSummary;
}

export interface PortfolioPlannerExplanationInput {
  readonly decisionId: string;
  readonly title: string;
  readonly outcome: string;
  readonly confidenceScore: number;
  readonly evidenceReferenceIds: readonly string[];
  readonly reasonCodes: readonly string[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly string[];
}
