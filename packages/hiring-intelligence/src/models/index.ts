import type { CareerArtifact } from "@career-companion/career-artifacts";
import type { DecisionReport } from "@career-companion/career-decision";
import type { ExplanationSummary } from "@career-companion/explainability";
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

export type HiringArtifactKind = "HiringPipeline" | "RecruiterEvaluation" | "HiringManagerEvaluation" | "InterviewEvaluation" | "HiringDecision";
export type HiringPipelineStage = "CareerDecision" | "RecruiterEvaluation" | "HiringManagerEvaluation" | "InterviewEvaluation" | "HiringDecision";
export type HiringDecisionOutcome = "StrongHire" | "Hire" | "LeanHire" | "Hold" | "NoHire";
export type HiringEvaluationArea =
  | "CareerProgression"
  | "ResumeClarity"
  | "BusinessImpact"
  | "EvidenceQuality"
  | "RiskSignals"
  | "Communication"
  | "Stability"
  | "Transferability"
  | "ProductThinking"
  | "Execution"
  | "CustomerObsession"
  | "TechnicalDepth"
  | "Leadership"
  | "Collaboration"
  | "DecisionQuality"
  | "Ownership"
  | "BehavioralEvidence"
  | "ProductSense"
  | "AnalyticalThinking"
  | "TradeoffReasoning"
  | "ExecutionReasoning"
  | "StakeholderManagement"
  | "LeadershipValidation";

export interface HiringStageDefinition {
  readonly stage: HiringPipelineStage;
  readonly order: number;
  readonly entryCriteria: readonly string[];
  readonly exitCriteria: readonly string[];
  readonly dependencies: readonly HiringPipelineStage[];
  readonly constraints: readonly string[];
}

export interface HiringPipeline {
  readonly artifactKind: "HiringPipeline";
  readonly pipelineId: string;
  readonly decisionReport: DecisionReport;
  readonly currentStage: HiringPipelineStage;
  readonly sequence: readonly HiringStageDefinition[];
  readonly entryCriteria: readonly string[];
  readonly exitCriteria: readonly string[];
  readonly stageDependencies: readonly HiringStageDefinition[];
  readonly evaluationConstraints: readonly string[];
  readonly pipelineConfidence: Confidence;
  readonly decisionTrace: DecisionReport["decisionTrace"];
  readonly artifact: CareerArtifact;
  readonly explanationSummary: ExplanationSummary;
}

export interface HiringSignal {
  readonly signalId: string;
  readonly area: HiringEvaluationArea;
  readonly label: string;
  readonly evidence: readonly string[];
  readonly score: ScoreDimension;
  readonly confidence: Confidence;
  readonly rankingReason: RankingReason;
}

export interface HiringRecommendation {
  readonly recommendationId: string;
  readonly priority: RecommendationPriority;
  readonly category: RecommendationCategory;
  readonly impact: RecommendationImpact;
  readonly recommendationType: RecommendationType;
  readonly targetSignalIds: readonly string[];
  readonly confidence: Confidence;
}

export interface RecruiterEvaluation {
  readonly artifactKind: "RecruiterEvaluation";
  readonly evaluationId: string;
  readonly pipelineId: string;
  readonly proceedToHiringManager: boolean;
  readonly careerProgression: HiringSignal;
  readonly resumeClarity: HiringSignal;
  readonly businessImpact: HiringSignal;
  readonly evidenceQuality: HiringSignal;
  readonly riskSignals: HiringSignal;
  readonly communication: HiringSignal;
  readonly stability: HiringSignal;
  readonly transferability: HiringSignal;
  readonly score: ScoreBreakdown;
  readonly gaps: readonly GapClassification[];
  readonly recommendations: readonly HiringRecommendation[];
  readonly confidence: Confidence;
  readonly confidenceFactors: readonly ConfidenceFactor[];
  readonly artifact: CareerArtifact;
  readonly explanationSummary: ExplanationSummary;
}

export interface HiringManagerEvaluation {
  readonly artifactKind: "HiringManagerEvaluation";
  readonly evaluationId: string;
  readonly recruiterEvaluationId: string;
  readonly spendInterviewTime: boolean;
  readonly productThinking: HiringSignal;
  readonly execution: HiringSignal;
  readonly businessImpact: HiringSignal;
  readonly customerObsession: HiringSignal;
  readonly technicalDepth: HiringSignal;
  readonly leadership: HiringSignal;
  readonly crossFunctionalCollaboration: HiringSignal;
  readonly decisionQuality: HiringSignal;
  readonly ownership: HiringSignal;
  readonly score: ScoreBreakdown;
  readonly gaps: readonly GapClassification[];
  readonly recommendations: readonly HiringRecommendation[];
  readonly confidence: Confidence;
  readonly confidenceFactors: readonly ConfidenceFactor[];
  readonly artifact: CareerArtifact;
  readonly explanationSummary: ExplanationSummary;
}

export interface InterviewEvaluation {
  readonly artifactKind: "InterviewEvaluation";
  readonly evaluationId: string;
  readonly hiringManagerEvaluationId: string;
  readonly assumptionsValidated: boolean;
  readonly behavioralEvidence: HiringSignal;
  readonly communication: HiringSignal;
  readonly productSense: HiringSignal;
  readonly analyticalThinking: HiringSignal;
  readonly tradeoffReasoning: HiringSignal;
  readonly executionReasoning: HiringSignal;
  readonly stakeholderManagement: HiringSignal;
  readonly leadershipValidation: HiringSignal;
  readonly score: ScoreBreakdown;
  readonly gaps: readonly GapClassification[];
  readonly recommendations: readonly HiringRecommendation[];
  readonly confidence: Confidence;
  readonly confidenceFactors: readonly ConfidenceFactor[];
  readonly artifact: CareerArtifact;
  readonly explanationSummary: ExplanationSummary;
}

export interface HiringDecision {
  readonly artifactKind: "HiringDecision";
  readonly decisionId: string;
  readonly pipeline: HiringPipeline;
  readonly recruiterEvaluation: RecruiterEvaluation;
  readonly hiringManagerEvaluation: HiringManagerEvaluation;
  readonly interviewEvaluation: InterviewEvaluation;
  readonly decision: HiringDecisionOutcome;
  readonly confidence: Confidence;
  readonly supportingEvidence: readonly string[];
  readonly contradictingEvidence: readonly string[];
  readonly pipelineSummary: HiringPipelineSummary;
  readonly decisionTrace: DecisionReport["decisionTrace"];
  readonly recommendationPriority: RecommendationPriority;
  readonly recommendations: readonly HiringRecommendation[];
  readonly artifact: CareerArtifact;
  readonly explanationSummary: ExplanationSummary;
}

export interface HiringPipelineSummary {
  readonly stageScores: readonly ScoreDimension[];
  readonly strongestSignals: readonly string[];
  readonly weakestSignals: readonly string[];
  readonly terminationStage?: HiringPipelineStage;
}
