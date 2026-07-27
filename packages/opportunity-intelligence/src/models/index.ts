import type { CareerArtifact } from "@career-companion/career-artifacts";
import type { DecisionReference } from "@career-companion/decision-model";
import type { ExplanationSummary } from "@career-companion/explainability";
import type { EvaluationFramework, HiringModel, JobModel } from "@career-companion/job-intelligence";
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
import type { ResumeModel } from "@career-companion/resume-intelligence";
import type { OpportunityDecisionOutcome, OpportunityEvaluationPolicy, OpportunitySignal, OpportunityStage } from "../policies";

export interface OpportunityContextInput {
  readonly resume: ResumeModel;
  readonly portfolio: PortfolioModel;
  readonly jobModel: JobModel;
  readonly hiringModel: HiringModel;
  readonly evaluationFramework: EvaluationFramework;
  readonly opportunitySignals: readonly OpportunitySignal[];
  readonly assumptions?: readonly string[];
  readonly constraints?: readonly string[];
  readonly policy?: Partial<OpportunityEvaluationPolicy>;
  readonly traceId: string;
}

export interface OpportunityStageDefinition {
  readonly stage: OpportunityStage;
  readonly order: number;
  readonly entryCriteria: readonly string[];
  readonly exitCriteria: readonly string[];
  readonly dependencies: readonly OpportunityStage[];
}

export interface OpportunityContext {
  readonly artifactKind: "OpportunityContext";
  readonly contextId: string;
  readonly resume: ResumeModel;
  readonly portfolio: PortfolioModel;
  readonly jobModel: JobModel;
  readonly hiringModel: HiringModel;
  readonly evaluationFramework: EvaluationFramework;
  readonly sourceReferences: readonly DecisionReference[];
  readonly sequence: readonly OpportunityStageDefinition[];
  readonly currentStage: OpportunityStage;
  readonly policy: OpportunityEvaluationPolicy;
  readonly opportunitySignals: readonly OpportunitySignal[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly string[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface OpportunityDimension {
  readonly dimension: string;
  readonly score: ScoreDimension;
  readonly signals: readonly OpportunitySignal[];
  readonly reasons: readonly RankingReason[];
}

export interface CompanyAnalysis {
  readonly artifactKind: "CompanyAnalysis";
  readonly analysisId: string;
  readonly contextId: string;
  readonly resume: ResumeModel;
  readonly jobModel: JobModel;
  readonly portfolio: PortfolioModel;
  readonly policy: OpportunityEvaluationPolicy;
  readonly companySize: OpportunityDimension;
  readonly fundingStage: OpportunityDimension;
  readonly businessModel: OpportunityDimension;
  readonly productMaturity: OpportunityDimension;
  readonly engineeringMaturity: OpportunityDimension;
  readonly aiMaturityIndicators: OpportunityDimension;
  readonly remotePolicy: OpportunityDimension;
  readonly publicStabilityIndicators: OpportunityDimension;
  readonly scoreBreakdown: ScoreBreakdown;
  readonly assumptions: readonly string[];
  readonly constraints: readonly string[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface RoleAnalysis {
  readonly artifactKind: "RoleAnalysis";
  readonly analysisId: string;
  readonly companyAnalysisId: string;
  readonly resume: ResumeModel;
  readonly jobModel: JobModel;
  readonly portfolio: PortfolioModel;
  readonly policy: OpportunityEvaluationPolicy;
  readonly ownership: OpportunityDimension;
  readonly productScope: OpportunityDimension;
  readonly platformVsFeature: OpportunityDimension;
  readonly leadershipExpectations: OpportunityDimension;
  readonly technicalComplexity: OpportunityDimension;
  readonly crossFunctionalExposure: OpportunityDimension;
  readonly experimentationCulture: OpportunityDimension;
  readonly aiExposure: OpportunityDimension;
  readonly productInfluence: OpportunityDimension;
  readonly decisionAuthority: OpportunityDimension;
  readonly scoreBreakdown: ScoreBreakdown;
  readonly companyScore: ScoreBreakdown;
  readonly assumptions: readonly string[];
  readonly constraints: readonly string[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface MarketAnalysis {
  readonly artifactKind: "MarketAnalysis";
  readonly analysisId: string;
  readonly roleAnalysisId: string;
  readonly resume: ResumeModel;
  readonly jobModel: JobModel;
  readonly portfolio: PortfolioModel;
  readonly policy: OpportunityEvaluationPolicy;
  readonly hiringDemandIndicator: OpportunityDimension;
  readonly compensationCompetitiveness: OpportunityDimension;
  readonly industryGrowth: OpportunityDimension;
  readonly marketMaturity: OpportunityDimension;
  readonly competitiveLandscape: OpportunityDimension;
  readonly hiringVelocityIndicator: OpportunityDimension;
  readonly scoreBreakdown: ScoreBreakdown;
  readonly roleScore: ScoreBreakdown;
  readonly companyScore: ScoreBreakdown;
  readonly assumptions: readonly string[];
  readonly constraints: readonly string[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface CandidateFit {
  readonly artifactKind: "CandidateFit";
  readonly fitId: string;
  readonly marketAnalysisId: string;
  readonly resume: ResumeModel;
  readonly portfolio: PortfolioModel;
  readonly jobModel: JobModel;
  readonly policy: OpportunityEvaluationPolicy;
  readonly experienceAlignment: OpportunityDimension;
  readonly skillAlignment: OpportunityDimension;
  readonly leadershipAlignment: OpportunityDimension;
  readonly domainAlignment: OpportunityDimension;
  readonly platformAlignment: OpportunityDimension;
  readonly growthAlignment: OpportunityDimension;
  readonly learningOpportunity: OpportunityDimension;
  readonly evidenceSufficiency: OpportunityDimension;
  readonly scoreBreakdown: ScoreBreakdown;
  readonly marketScore: ScoreBreakdown;
  readonly roleScore: ScoreBreakdown;
  readonly companyScore: ScoreBreakdown;
  readonly gaps: readonly GapClassification[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly string[];
  readonly traceId: string;
  readonly confidence: Confidence;
  readonly explanationSummary: ExplanationSummary;
}

export interface OpportunityRecommendation {
  readonly recommendationId: string;
  readonly priority: RecommendationPriority;
  readonly category: RecommendationCategory;
  readonly impact: RecommendationImpact;
  readonly recommendationType: RecommendationType;
  readonly rationale: string;
  readonly affectedDimensions: readonly string[];
  readonly confidence: Confidence;
}

export interface OpportunityDecision {
  readonly artifactKind: "OpportunityDecision";
  readonly decisionId: string;
  readonly fitId: string;
  readonly outcome: OpportunityDecisionOutcome;
  readonly confidence: Confidence;
  readonly supportingEvidence: readonly string[];
  readonly risks: readonly string[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly string[];
  readonly opportunityStrengths: readonly string[];
  readonly opportunityWeaknesses: readonly string[];
  readonly candidateStrengths: readonly string[];
  readonly candidateGaps: readonly GapClassification[];
  readonly scoreSummary: ScoreBreakdown;
  readonly recommendationPriority: RecommendationPriority;
  readonly recommendations: readonly OpportunityRecommendation[];
  readonly alternativeOutcomesConsidered: readonly OpportunityDecisionOutcome[];
  readonly confidenceFactors: readonly ConfidenceFactor[];
  readonly traceId: string;
  readonly artifact: CareerArtifact;
  readonly explanationSummary: ExplanationSummary;
}

export interface OpportunityExplanationInput {
  readonly decisionId: string;
  readonly title: string;
  readonly outcome: string;
  readonly confidenceScore: number;
  readonly evidenceReferenceIds: readonly string[];
  readonly reasonCodes: readonly string[];
  readonly assumptions: readonly string[];
  readonly constraints: readonly string[];
}
