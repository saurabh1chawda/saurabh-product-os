import type { CareerArtifact } from "@career-companion/career-artifacts";
import type { DecisionTrace } from "@career-companion/decision-engine";
import type { ExplanationSummary } from "@career-companion/explainability";
import type {
  Confidence,
  ConfidenceFactor,
  GapClassification,
  GapEvidence,
  GapSeverity,
  RankingReason,
  RecommendationCategory,
  RecommendationImpact,
  RecommendationPriority,
  RecommendationType,
  ScoreBreakdown,
  ScoreDimension
} from "@career-companion/product-intelligence";

export type RoleClassification = "ProductManager" | "ProductLeader" | "ProgramManager" | "ProductOperations" | "Unknown";
export type SeniorityClassification = "Intern" | "Associate" | "MidLevel" | "Senior" | "Lead" | "Principal" | "Director" | "Executive" | "Unknown";
export type FunctionClassification = "ProductManagement" | "ProductStrategy" | "ProductOperations" | "Growth" | "Platform" | "DataProduct" | "TechnicalProduct" | "Unknown";
export type DomainClassification = "AI" | "FinTech" | "Payments" | "SaaS" | "Marketplace" | "Consumer" | "Enterprise" | "Healthcare" | "Unknown";
export type EmploymentType = "FullTime" | "PartTime" | "Contract" | "Internship" | "Unknown";
export type LocationExpectation = "Remote" | "Hybrid" | "OnSite" | "Mixed" | "Unspecified";

export interface RawJobDescription {
  readonly jobDescriptionId: string;
  readonly title?: string;
  readonly company?: string;
  readonly description: string;
  readonly capturedAt: string;
}

export interface ClassificationResult<TClassification extends string> {
  readonly classification: TClassification;
  readonly confidence: Confidence;
  readonly signals: readonly string[];
  readonly alternatives: readonly TClassification[];
}

export interface JobSignal {
  readonly signalId: string;
  readonly category: string;
  readonly value: string;
  readonly confidence: Confidence;
}

export interface Responsibility {
  readonly responsibilityId: string;
  readonly statement: string;
  readonly category: string;
  readonly rankingReasons: readonly RankingReason[];
}

export interface CompetencyRequirement {
  readonly competencyId: string;
  readonly name: string;
  readonly required: boolean;
  readonly weight: number;
  readonly evidenceExpectationIds: readonly string[];
}

export interface SkillRequirement {
  readonly skillId: string;
  readonly name: string;
  readonly required: boolean;
  readonly sourceSignal: string;
}

export interface BusinessObjective {
  readonly objectiveId: string;
  readonly statement: string;
  readonly successIndicators: readonly string[];
}

export interface EvidenceExpectation {
  readonly expectationId: string;
  readonly evidenceType: string;
  readonly description: string;
  readonly priority: RecommendationPriority;
  readonly gapSeverity: GapSeverity;
}

export interface JobConstraint {
  readonly constraintId: string;
  readonly constraintType: string;
  readonly description: string;
  readonly required: boolean;
}

export interface JobModel {
  readonly artifactKind: "JobModel";
  readonly artifact: CareerArtifact;
  readonly source: RawJobDescription;
  readonly role: ClassificationResult<RoleClassification>;
  readonly function: ClassificationResult<FunctionClassification>;
  readonly seniority: ClassificationResult<SeniorityClassification>;
  readonly domain: ClassificationResult<DomainClassification>;
  readonly industry: string;
  readonly responsibilities: readonly Responsibility[];
  readonly requiredCompetencies: readonly CompetencyRequirement[];
  readonly requiredSkills: readonly SkillRequirement[];
  readonly preferredSkills: readonly SkillRequirement[];
  readonly businessObjectives: readonly BusinessObjective[];
  readonly evidenceExpectations: readonly EvidenceExpectation[];
  readonly successIndicators: readonly string[];
  readonly constraints: readonly JobConstraint[];
  readonly signals: readonly JobSignal[];
  readonly location: LocationExpectation;
  readonly employmentType: EmploymentType;
  readonly experienceExpectations: readonly string[];
  readonly educationExpectations: readonly string[];
  readonly certificationExpectations: readonly string[];
  readonly travelExpectations: readonly string[];
  readonly explanationSummary: ExplanationSummary;
}

export interface HiringExpectation {
  readonly expectationId: string;
  readonly dimension: string;
  readonly expectation: string;
  readonly evidenceExpectations: readonly EvidenceExpectation[];
  readonly confidence: Confidence;
}

export interface HiringModel {
  readonly artifactKind: "HiringModel";
  readonly artifact: CareerArtifact;
  readonly jobModelId: string;
  readonly leadershipExpectations: readonly HiringExpectation[];
  readonly communicationExpectations: readonly HiringExpectation[];
  readonly stakeholderExpectations: readonly HiringExpectation[];
  readonly executionExpectations: readonly HiringExpectation[];
  readonly customerThinking: HiringExpectation;
  readonly productThinking: HiringExpectation;
  readonly businessThinking: HiringExpectation;
  readonly technicalDepth: HiringExpectation;
  readonly analyticalThinking: HiringExpectation;
  readonly strategicThinking: HiringExpectation;
  readonly ownership: HiringExpectation;
  readonly autonomy: HiringExpectation;
  readonly decisionMaking: HiringExpectation;
  readonly riskManagement: HiringExpectation;
  readonly experimentation: HiringExpectation;
  readonly influence: HiringExpectation;
  readonly crossFunctionalCollaboration: HiringExpectation;
  readonly behavioralExpectations: readonly HiringExpectation[];
  readonly evidenceExpectations: readonly EvidenceExpectation[];
  readonly explanationSummary: ExplanationSummary;
}

export interface EvaluationDimension {
  readonly dimensionId: string;
  readonly dimension: string;
  readonly weight: number;
  readonly expectedEvidence: readonly EvidenceExpectation[];
  readonly minimumExpectation: string;
  readonly recommendationPriority: RecommendationPriority;
  readonly confidence: Confidence;
  readonly gapSeverity: GapSeverity;
  readonly rankingReason: RankingReason;
}

export interface EvaluationFramework {
  readonly artifactKind: "EvaluationFramework";
  readonly artifact: CareerArtifact;
  readonly jobModelId: string;
  readonly hiringModelId: string;
  readonly dimensions: readonly EvaluationDimension[];
  readonly totalWeight: number;
  readonly scoringPolicyId: string;
  readonly explanationSummary: ExplanationSummary;
}

export interface CandidateIntelligence {
  readonly candidateId: string;
  readonly competencies: readonly string[];
  readonly skills: readonly string[];
  readonly evidence: readonly string[];
  readonly domains: readonly string[];
  readonly senioritySignals: readonly string[];
}

export interface DimensionMatch {
  readonly dimensionId: string;
  readonly dimension: string;
  readonly score: number;
  readonly evidenceCoverage: number;
  readonly competencyCoverage: number;
  readonly missingEvidence: readonly string[];
  readonly confidence: Confidence;
  readonly gapEvidence: GapEvidence;
}

export interface JobRecommendation {
  readonly recommendationId: string;
  readonly priority: RecommendationPriority;
  readonly category: RecommendationCategory;
  readonly impact: RecommendationImpact;
  readonly recommendationType: RecommendationType;
  readonly statement: string;
  readonly affectedDimensionIds: readonly string[];
  readonly confidence: Confidence;
}

export interface JobMatchReport {
  readonly artifactKind: "JobMatchReport";
  readonly artifact: CareerArtifact;
  readonly candidateId: string;
  readonly jobModelId: string;
  readonly hiringModelId: string;
  readonly evaluationFrameworkId: string;
  readonly overallFit: ScoreBreakdown;
  readonly dimensionScores: readonly DimensionMatch[];
  readonly evidenceCoverage: ScoreDimension;
  readonly competencyCoverage: ScoreDimension;
  readonly missingEvidence: readonly string[];
  readonly gaps: readonly GapClassification[];
  readonly gapEvidence: readonly GapEvidence[];
  readonly recommendations: readonly JobRecommendation[];
  readonly riskAreas: readonly string[];
  readonly strengthAreas: readonly string[];
  readonly confidence: Confidence;
  readonly confidenceFactors: readonly ConfidenceFactor[];
  readonly explanationSummary: ExplanationSummary;
}

export interface JobIntelligenceResult {
  readonly jobModel: JobModel;
  readonly hiringModel: HiringModel;
  readonly evaluationFramework: EvaluationFramework;
  readonly jobMatchReport: JobMatchReport;
  readonly decisionTrace: DecisionTrace;
}
