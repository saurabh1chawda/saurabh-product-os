import type { CareerArtifact } from "@career-companion/career-artifacts";
import type { DecisionTrace } from "@career-companion/decision-engine";
import type { ExplanationSummary } from "@career-companion/explainability";
import type { EvaluationFramework, HiringModel, JobModel } from "@career-companion/job-intelligence";
import type {
  Confidence,
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
import type {
  ATSDecisionOutcome,
  ATSGateResult,
  ATSGateType,
  ATSMatchingPolicy,
  ATSParsingPolicy,
  ATSParsingStatus,
  ATSReviewReason,
  ATSScreeningPolicy,
  ATSStage
} from "../policies";

export interface ATSPipelineInput {
  readonly resume: ResumeModel;
  readonly jobModel: JobModel;
  readonly hiringModel: HiringModel;
  readonly evaluationFramework: EvaluationFramework;
  readonly decisionTrace: DecisionTrace;
  readonly screeningPolicy?: Partial<ATSScreeningPolicy>;
}

export interface ATSJobContext {
  readonly jobModel: JobModel;
  readonly hiringModel: HiringModel;
  readonly evaluationFramework: EvaluationFramework;
}

export interface ATSStageDefinition {
  readonly stage: ATSStage;
  readonly order: number;
  readonly entryCriteria: readonly string[];
  readonly exitCriteria: readonly string[];
  readonly dependencies: readonly ATSStage[];
}

export interface ATSPipeline {
  readonly artifactKind: "ATSPipeline";
  readonly pipelineId: string;
  readonly resume: ResumeModel;
  readonly jobContext: ATSJobContext;
  readonly sourceArtifactIds: readonly string[];
  readonly currentStage: ATSStage;
  readonly sequence: readonly ATSStageDefinition[];
  readonly entryCriteria: readonly string[];
  readonly exitCriteria: readonly string[];
  readonly stageDependencies: readonly ATSStageDefinition[];
  readonly parsingPolicy: ATSParsingPolicy;
  readonly matchingPolicy: ATSMatchingPolicy;
  readonly screeningPolicy: ATSScreeningPolicy;
  readonly screeningConstraints: readonly string[];
  readonly confidence: Confidence;
  readonly decisionTrace: DecisionTrace;
  readonly artifact: CareerArtifact;
  readonly explanationSummary: ExplanationSummary;
}

export interface ATSDetectedSection {
  readonly sectionId: string;
  readonly sectionType: string;
  readonly order: number;
  readonly present: boolean;
  readonly aliasesMatched: readonly string[];
}

export interface ATSParsedKeyword {
  readonly keyword: string;
  readonly source: string;
}

export interface ATSParsing {
  readonly artifactKind: "ATSParsing";
  readonly parsingId: string;
  readonly pipelineId: string;
  readonly status: ATSParsingStatus;
  readonly jobContext: ATSJobContext;
  readonly matchingPolicy: ATSMatchingPolicy;
  readonly screeningPolicy: ATSScreeningPolicy;
  readonly detectedSections: readonly ATSDetectedSection[];
  readonly candidateSummaryFields: readonly string[];
  readonly roles: readonly string[];
  readonly companies: readonly string[];
  readonly employmentDates: readonly string[];
  readonly employmentDurationProjections: readonly string[];
  readonly skills: readonly string[];
  readonly competencies: readonly string[];
  readonly education: readonly string[];
  readonly certifications: readonly string[];
  readonly achievements: readonly string[];
  readonly quantifiedEvidence: readonly string[];
  readonly contactFieldPresence: readonly string[];
  readonly parsedKeywords: readonly ATSParsedKeyword[];
  readonly ambiguousFields: readonly string[];
  readonly missingFields: readonly string[];
  readonly unsupportedStructures: readonly string[];
  readonly parsingWarnings: readonly string[];
  readonly confidence: Confidence;
  readonly evidenceReferences: readonly string[];
  readonly decisionTrace: DecisionTrace;
  readonly artifact: CareerArtifact;
  readonly explanationSummary: ExplanationSummary;
}

export interface ATSRequirementMatch {
  readonly requirementId: string;
  readonly requirementType: "required-skill" | "preferred-skill" | "responsibility" | "competency" | "evidence" | "education" | "certification" | "domain" | "seniority" | "role" | "function";
  readonly label: string;
  readonly matched: boolean;
  readonly score: number;
  readonly evidence: readonly string[];
  readonly missingEvidence: readonly string[];
  readonly rankingReason: RankingReason;
}

export interface ATSMatching {
  readonly artifactKind: "ATSMatching";
  readonly matchingId: string;
  readonly parsingId: string;
  readonly jobContext: ATSJobContext;
  readonly screeningPolicy: ATSScreeningPolicy;
  readonly requiredSkillCoverage: ScoreDimension;
  readonly preferredSkillCoverage: ScoreDimension;
  readonly responsibilityCoverage: ScoreDimension;
  readonly competencyCoverage: ScoreDimension;
  readonly roleAlignment: ScoreDimension;
  readonly seniorityAlignment: ScoreDimension;
  readonly functionAlignment: ScoreDimension;
  readonly domainAlignment: ScoreDimension;
  readonly experienceAlignment: ScoreDimension;
  readonly educationAlignment: ScoreDimension;
  readonly certificationAlignment: ScoreDimension;
  readonly businessObjectiveAlignment: ScoreDimension;
  readonly evidenceExpectationCoverage: ScoreDimension;
  readonly quantifiedImpactCoverage: ScoreDimension;
  readonly requirementMatches: readonly ATSRequirementMatch[];
  readonly missingRequiredEvidence: readonly string[];
  readonly contradictoryEvidence: readonly string[];
  readonly confidence: Confidence;
  readonly scoreBreakdown: ScoreBreakdown;
  readonly gaps: readonly GapClassification[];
  readonly decisionTrace: DecisionTrace;
  readonly artifact: CareerArtifact;
  readonly explanationSummary: ExplanationSummary;
}

export interface ATSGateEvaluation {
  readonly gateId: string;
  readonly gateType: ATSGateType;
  readonly label: string;
  readonly result: ATSGateResult;
  readonly threshold?: number;
  readonly actual?: number;
  readonly rationale: string;
  readonly evidence: readonly string[];
}

export interface ATSScreening {
  readonly artifactKind: "ATSScreening";
  readonly screeningId: string;
  readonly matchingId: string;
  readonly evaluatedGates: readonly ATSGateEvaluation[];
  readonly passedGates: readonly ATSGateEvaluation[];
  readonly failedGates: readonly ATSGateEvaluation[];
  readonly warningGates: readonly ATSGateEvaluation[];
  readonly reviewTriggers: readonly ATSGateEvaluation[];
  readonly hardGateResult: ATSGateResult;
  readonly softThresholdResult: ATSGateResult;
  readonly parsingSufficiencyResult: ATSGateResult;
  readonly requiredSkillThresholdResult: ATSGateResult;
  readonly evidenceThresholdResult: ATSGateResult;
  readonly overallScreeningStatus: "passed" | "warnings" | "manual-review" | "blocked";
  readonly confidence: Confidence;
  readonly gaps: readonly GapClassification[];
  readonly supportingEvidence: readonly string[];
  readonly blockingEvidence: readonly string[];
  readonly scoreSummary: ScoreBreakdown;
  readonly matchSummary: readonly ScoreDimension[];
  readonly parsingSummary: ScoreDimension;
  readonly screeningPolicy: ATSScreeningPolicy;
  readonly decisionTrace: DecisionTrace;
  readonly artifact: CareerArtifact;
  readonly explanationSummary: ExplanationSummary;
}

export interface ATSRecommendation {
  readonly recommendationId: string;
  readonly priority: RecommendationPriority;
  readonly category: RecommendationCategory;
  readonly impact: RecommendationImpact;
  readonly recommendationType: RecommendationType;
  readonly deficiency: string;
  readonly affectedGateIds: readonly string[];
  readonly confidence: Confidence;
}

export interface ATSDecision {
  readonly artifactKind: "ATSDecision";
  readonly decisionId: string;
  readonly screeningId: string;
  readonly outcome: ATSDecisionOutcome;
  readonly confidence: Confidence;
  readonly supportingEvidence: readonly string[];
  readonly blockingEvidence: readonly string[];
  readonly passedGates: readonly string[];
  readonly failedGates: readonly string[];
  readonly warnings: readonly string[];
  readonly manualReviewReasons: readonly ATSReviewReason[];
  readonly scoreSummary: ScoreBreakdown;
  readonly matchSummary: readonly ScoreDimension[];
  readonly parsingSummary: ScoreDimension;
  readonly screeningSummary: string;
  readonly recommendationPriority: RecommendationPriority;
  readonly recommendations: readonly ATSRecommendation[];
  readonly decisionTrace: DecisionTrace;
  readonly alternativeOutcomesConsidered: readonly ATSDecisionOutcome[];
  readonly constraints: readonly string[];
  readonly artifact: CareerArtifact;
  readonly explanationSummary: ExplanationSummary;
}

export interface ATSExplanationInput {
  readonly decisionId: string;
  readonly title: string;
  readonly confidenceScore: number;
  readonly reasonCodes: readonly string[];
  readonly evidenceReferenceIds: readonly string[];
  readonly rejectedSignals?: readonly string[];
  readonly constraints?: readonly string[];
}
