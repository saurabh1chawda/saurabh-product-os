import type { CareerArtifact } from "@career-companion/career-artifacts";
import type { DecisionTrace } from "@career-companion/decision-engine";
import type { ExplanationSummary } from "@career-companion/explainability";
import type { InterviewModel } from "@career-companion/interview-intelligence";
import type { EvaluationFramework, HiringModel, JobMatchReport, JobModel } from "@career-companion/job-intelligence";
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

export type DecisionArtifactKind = "DecisionContext" | "DecisionAssessment" | "DecisionStrategy" | "DecisionPlan" | "DecisionReport";
export type DecisionCoverageArea = "Resume" | "Portfolio" | "Interview" | "JobMatch" | "Evidence" | "Competency";

export interface ProductIntelligenceSet {
  readonly resume: ResumeModel;
  readonly portfolio: PortfolioModel;
  readonly interview: InterviewModel;
  readonly jobModel: JobModel;
  readonly hiringModel: HiringModel;
  readonly evaluationFramework: EvaluationFramework;
  readonly jobMatchReport: JobMatchReport;
  readonly decisionTrace: DecisionTrace;
}

export interface DecisionContext {
  readonly artifactKind: "DecisionContext";
  readonly contextId: string;
  readonly resume: ResumeModel;
  readonly portfolio: PortfolioModel;
  readonly interview: InterviewModel;
  readonly jobModel: JobModel;
  readonly hiringModel: HiringModel;
  readonly evaluationFramework: EvaluationFramework;
  readonly jobMatchReport: JobMatchReport;
  readonly sourceArtifactIds: readonly string[];
  readonly decisionTrace: DecisionTrace;
  readonly artifact: CareerArtifact;
  readonly explanationSummary: ExplanationSummary;
}

export interface DecisionFinding {
  readonly findingId: string;
  readonly area: DecisionCoverageArea;
  readonly label: string;
  readonly rationale: string;
  readonly confidence: Confidence;
}

export interface DecisionAssessment {
  readonly artifactKind: "DecisionAssessment";
  readonly assessmentId: string;
  readonly contextId: string;
  readonly overallReadiness: ScoreBreakdown;
  readonly strengthAreas: readonly DecisionFinding[];
  readonly weaknessAreas: readonly DecisionFinding[];
  readonly riskAreas: readonly DecisionFinding[];
  readonly opportunityAreas: readonly DecisionFinding[];
  readonly coverage: readonly ScoreDimension[];
  readonly confidence: Confidence;
  readonly confidenceFactors: readonly ConfidenceFactor[];
  readonly evidenceSufficiency: ScoreDimension;
  readonly gaps: readonly GapClassification[];
  readonly artifact: CareerArtifact;
  readonly explanationSummary: ExplanationSummary;
}

export interface StrategyObjective {
  readonly objectiveId: string;
  readonly label: string;
  readonly priority: RecommendationPriority;
  readonly expectedImpact: RecommendationImpact;
  readonly rationale: RankingReason;
}

export interface StrategyTradeoff {
  readonly tradeoffId: string;
  readonly accepted: string;
  readonly reduced: string;
  readonly rationale: string;
  readonly confidence: Confidence;
}

export interface DecisionStrategy {
  readonly artifactKind: "DecisionStrategy";
  readonly strategyId: string;
  readonly assessmentId: string;
  readonly strategicObjectives: readonly StrategyObjective[];
  readonly optimizationFocus: readonly string[];
  readonly priorityThemes: readonly string[];
  readonly tradeoffs: readonly StrategyTradeoff[];
  readonly sequencing: readonly string[];
  readonly expectedImpact: RecommendationImpact;
  readonly recommendationPriorities: readonly RecommendationPriority[];
  readonly confidence: Confidence;
  readonly artifact: CareerArtifact;
  readonly explanationSummary: ExplanationSummary;
}

export interface DecisionAction {
  readonly actionId: string;
  readonly priority: RecommendationPriority;
  readonly category: RecommendationCategory;
  readonly recommendationType: RecommendationType;
  readonly expectedImpact: RecommendationImpact;
  readonly dependencies: readonly string[];
  readonly evidenceRequired: readonly string[];
  readonly completionCriteria: readonly string[];
  readonly confidence: Confidence;
}

export interface DecisionRecommendation {
  readonly recommendationId: string;
  readonly priority: RecommendationPriority;
  readonly category: RecommendationCategory;
  readonly impact: RecommendationImpact;
  readonly recommendationType: RecommendationType;
  readonly targetActionIds: readonly string[];
  readonly confidence: Confidence;
}

export interface DecisionPlan {
  readonly artifactKind: "DecisionPlan";
  readonly planId: string;
  readonly strategyId: string;
  readonly actions: readonly DecisionAction[];
  readonly recommendations: readonly DecisionRecommendation[];
  readonly confidence: Confidence;
  readonly artifact: CareerArtifact;
  readonly explanationSummary: ExplanationSummary;
}

export interface DecisionReportSummary {
  readonly headline: string;
  readonly readinessBand: string;
  readonly topStrengths: readonly string[];
  readonly topRisks: readonly string[];
  readonly nextActions: readonly string[];
}

export interface DecisionReport {
  readonly artifactKind: "DecisionReport";
  readonly reportId: string;
  readonly context: DecisionContext;
  readonly assessment: DecisionAssessment;
  readonly strategy: DecisionStrategy;
  readonly plan: DecisionPlan;
  readonly summary: DecisionReportSummary;
  readonly confidence: Confidence;
  readonly recommendations: readonly DecisionRecommendation[];
  readonly decisionTrace: DecisionTrace;
  readonly artifact: CareerArtifact;
  readonly explanationSummary: ExplanationSummary;
}
