import type { CareerArtifact } from "@career-companion/career-artifacts";
import type { DecisionReference } from "@career-companion/decision-model";
import type { ExplanationSummary } from "@career-companion/explainability";
import type { DecisionReport } from "@career-companion/career-decision";
import type { OpportunityDecision } from "@career-companion/opportunity-intelligence";
import type {
  Confidence,
  ConfidenceFactor,
  GapClassification,
  RankingReason,
  RecommendationImpact,
  RecommendationPriority,
  ScoreBreakdown,
  ScoreDimension
} from "@career-companion/product-intelligence";
import type { CareerStrategyPolicy, CareerStrategyProfile, CareerStrategyStage, StrategicPreference, StrategyOptionKind } from "../policies";

export interface CareerGoalInput {
  readonly opportunityDecision: OpportunityDecision;
  readonly decisionReport: DecisionReport;
  readonly targetRole: string;
  readonly targetLevel: string;
  readonly targetDomains: readonly string[];
  readonly preferredCompanies: readonly string[];
  readonly preferredIndustries: readonly string[];
  readonly preferredLocations: readonly string[];
  readonly timeline: string;
  readonly compensationObjective?: string;
  readonly constraints?: readonly string[];
  readonly strategicPreferences?: readonly StrategicPreference[];
  readonly assumptions?: readonly string[];
  readonly policy?: Partial<CareerStrategyPolicy>;
  readonly traceId: string;
}

export interface CareerStrategyStageDefinition {
  readonly stage: CareerStrategyStage;
  readonly order: number;
  readonly entryCriteria: readonly string[];
  readonly exitCriteria: readonly string[];
  readonly dependencies: readonly CareerStrategyStage[];
}

export interface CareerGoal {
  readonly artifactKind: "CareerGoal";
  readonly goalId: string;
  readonly opportunityDecision: OpportunityDecision;
  readonly decisionReport: DecisionReport;
  readonly targetRole: string;
  readonly targetLevel: string;
  readonly targetDomains: readonly string[];
  readonly preferredCompanies: readonly string[];
  readonly preferredIndustries: readonly string[];
  readonly preferredLocations: readonly string[];
  readonly timeline: string;
  readonly compensationObjective?: string;
  readonly constraints: readonly string[];
  readonly strategicPreferences: readonly StrategicPreference[];
  readonly assumptions: readonly string[];
  readonly sequence: readonly CareerStrategyStageDefinition[];
  readonly currentStage: CareerStrategyStage;
  readonly sourceReferences: readonly DecisionReference[];
  readonly policy: CareerStrategyPolicy;
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface StrategicDimension {
  readonly dimension: string;
  readonly score: ScoreDimension;
  readonly evidence: readonly string[];
  readonly reasons: readonly RankingReason[];
}

export interface CurrentState {
  readonly artifactKind: "CurrentState";
  readonly stateId: string;
  readonly goalId: string;
  readonly opportunityDecision: OpportunityDecision;
  readonly decisionReport: DecisionReport;
  readonly targetRole: string;
  readonly targetDomains: readonly string[];
  readonly policy: CareerStrategyPolicy;
  readonly experience: StrategicDimension;
  readonly leadership: StrategicDimension;
  readonly aiCapability: StrategicDimension;
  readonly portfolioMaturity: StrategicDimension;
  readonly resumeMaturity: StrategicDimension;
  readonly interviewReadiness: StrategicDimension;
  readonly marketPositioning: StrategicDimension;
  readonly productBreadth: StrategicDimension;
  readonly productDepth: StrategicDimension;
  readonly evidenceMaturity: StrategicDimension;
  readonly scoreBreakdown: ScoreBreakdown;
  readonly assumptions: readonly string[];
  readonly constraints: readonly string[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface CareerGap {
  readonly artifactKind: "CareerGap";
  readonly gapId: string;
  readonly stateId: string;
  readonly opportunityDecision: OpportunityDecision;
  readonly decisionReport: DecisionReport;
  readonly targetRole: string;
  readonly targetDomains: readonly string[];
  readonly policy: CareerStrategyPolicy;
  readonly leadershipGap: GapClassification;
  readonly technicalGap: GapClassification;
  readonly domainGap: GapClassification;
  readonly aiCapabilityGap: GapClassification;
  readonly portfolioGap: GapClassification;
  readonly evidenceGap: GapClassification;
  readonly interviewGap: GapClassification;
  readonly marketVisibilityGap: GapClassification;
  readonly gaps: readonly GapClassification[];
  readonly currentStateScore: ScoreBreakdown;
  readonly assumptions: readonly string[];
  readonly constraints: readonly string[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface StrategyOption {
  readonly optionId: string;
  readonly kind: StrategyOptionKind;
  readonly label: string;
  readonly rationale: RankingReason;
  readonly assumptions: readonly string[];
  readonly addressedGapIds: readonly string[];
  readonly confidence: Confidence;
}

export interface StrategyOptions {
  readonly artifactKind: "StrategyOptions";
  readonly optionsId: string;
  readonly gapId: string;
  readonly options: readonly StrategyOption[];
  readonly opportunityDecision: OpportunityDecision;
  readonly decisionReport: DecisionReport;
  readonly gaps: readonly GapClassification[];
  readonly policy: CareerStrategyPolicy;
  readonly assumptions: readonly string[];
  readonly constraints: readonly string[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface StrategyOptionEvaluation {
  readonly optionId: string;
  readonly kind: StrategyOptionKind;
  readonly effort: ScoreDimension;
  readonly impact: ScoreDimension;
  readonly risk: ScoreDimension;
  readonly timeline: ScoreDimension;
  readonly confidenceDimension: ScoreDimension;
  readonly opportunityCost: ScoreDimension;
  readonly dependency: ScoreDimension;
  readonly strategicLeverage: ScoreDimension;
  readonly scoreBreakdown: ScoreBreakdown;
  readonly confidence: Confidence;
}

export interface StrategyEvaluation {
  readonly artifactKind: "StrategyEvaluation";
  readonly evaluationId: string;
  readonly optionsId: string;
  readonly evaluations: readonly StrategyOptionEvaluation[];
  readonly opportunityDecision: OpportunityDecision;
  readonly decisionReport: DecisionReport;
  readonly gaps: readonly GapClassification[];
  readonly policy: CareerStrategyPolicy;
  readonly assumptions: readonly string[];
  readonly constraints: readonly string[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface StrategicMilestone {
  readonly milestoneId: string;
  readonly label: string;
  readonly sequence: number;
  readonly target: string;
  readonly confidence: Confidence;
}

export interface CareerStrategy {
  readonly artifactKind: "CareerStrategy";
  readonly strategyId: string;
  readonly evaluationId: string;
  readonly profile: CareerStrategyProfile;
  readonly selectedOptionId: string;
  readonly confidence: Confidence;
  readonly supportingEvidence: readonly string[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly string[];
  readonly risks: readonly string[];
  readonly strategicMilestones: readonly StrategicMilestone[];
  readonly decisionTrace: string;
  readonly scoreSummary: ScoreBreakdown;
  readonly recommendationPriority: RecommendationPriority;
  readonly expectedImpact: RecommendationImpact;
  readonly confidenceFactors: readonly ConfidenceFactor[];
  readonly alternativeStrategiesConsidered: readonly StrategyOptionKind[];
  readonly artifact: CareerArtifact;
  readonly explanationSummary: ExplanationSummary;
}

export interface CareerStrategyExplanationInput {
  readonly decisionId: string;
  readonly title: string;
  readonly outcome: string;
  readonly confidenceScore: number;
  readonly evidenceReferenceIds: readonly string[];
  readonly reasonCodes: readonly string[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly string[];
}
