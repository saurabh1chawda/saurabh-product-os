import type {
  AchievementSnapshot,
  CareerProfileSnapshot,
  CompetencySnapshot,
  EmploymentRecordSnapshot,
  EvidenceReferenceSnapshot,
  MetricSnapshot,
  SkillSnapshot,
  StorySnapshot,
  TechnologySnapshot
} from "@career-companion/career-knowledge";
import type { Ranking, RecommendationScore, Confidence } from "@career-companion/career-intelligence";
import type { DecisionTrace } from "@career-companion/decision-engine";
import type { AlternativeSummary, ExplanationSummary } from "@career-companion/explainability";

export type ResumeSectionType = "summary" | "experience" | "skills" | "evidence" | "gaps" | "recommendations";

export interface ResumeSourceData {
  readonly careerProfile: CareerProfileSnapshot;
  readonly employmentRecords: readonly EmploymentRecordSnapshot[];
  readonly achievements: readonly AchievementSnapshot[];
  readonly competencies: readonly CompetencySnapshot[];
  readonly skills: readonly SkillSnapshot[];
  readonly technologies: readonly TechnologySnapshot[];
  readonly stories: readonly StorySnapshot[];
  readonly metrics: readonly MetricSnapshot[];
  readonly evidence: readonly EvidenceReferenceSnapshot[];
  readonly requiredCompetencyIds: readonly string[];
  readonly decisionTrace: DecisionTrace;
}

export interface ResumeEvidence {
  readonly evidence: EvidenceReferenceSnapshot;
  readonly rank: number;
  readonly score: RecommendationScore;
  readonly confidence: Confidence;
}

export interface ResumeSummary {
  readonly headline: string;
  readonly summary: string;
  readonly competencies: readonly CompetencySnapshot[];
  readonly evidence: readonly ResumeEvidence[];
}

export interface ResumeExperience {
  readonly employment: EmploymentRecordSnapshot;
  readonly achievements: readonly AchievementSnapshot[];
  readonly metrics: readonly MetricSnapshot[];
  readonly evidence: readonly ResumeEvidence[];
}

export interface ResumeSkillSection {
  readonly skills: readonly SkillSnapshot[];
  readonly technologies: readonly TechnologySnapshot[];
  readonly competencies: readonly CompetencySnapshot[];
}

export interface ResumeGap {
  readonly gapId: string;
  readonly competencyId: string;
  readonly reason: string;
  readonly severity: "low" | "medium" | "high";
}

export interface ResumeExplanation {
  readonly selectedEvidence: readonly ResumeEvidence[];
  readonly competencies: readonly CompetencySnapshot[];
  readonly confidence: Confidence;
  readonly decisionTraceReference: string;
  readonly alternativeConsideration: AlternativeSummary;
  readonly explanationSummary: ExplanationSummary;
}

export interface ResumeRecommendation {
  readonly recommendationId: string;
  readonly title: string;
  readonly reason: string;
  readonly selectedEvidence: readonly ResumeEvidence[];
  readonly competencies: readonly CompetencySnapshot[];
  readonly confidence: Confidence;
  readonly decisionTraceReference: string;
  readonly alternativeConsideration: AlternativeSummary;
  readonly explanation: ResumeExplanation;
}

export interface ResumeScore {
  readonly value: number;
  readonly evidenceScore: number;
  readonly competencyScore: number;
  readonly impactScore: number;
  readonly gapPenalty: number;
}

export interface ResumeSection<TContent = unknown> {
  readonly sectionId: string;
  readonly sectionType: ResumeSectionType;
  readonly title: string;
  readonly order: number;
  readonly content: TContent;
}

export interface ResumeModel {
  readonly resumeId: string;
  readonly profileId: string;
  readonly sections: readonly ResumeSection[];
  readonly summary: ResumeSummary;
  readonly experience: readonly ResumeExperience[];
  readonly skills: ResumeSkillSection;
  readonly evidence: readonly ResumeEvidence[];
  readonly gaps: readonly ResumeGap[];
  readonly recommendations: readonly ResumeRecommendation[];
  readonly score: ResumeScore;
  readonly explanation: ResumeExplanation;
}

export type RankedAchievement = Ranking<AchievementSnapshot>;

export function immutableArray<T>(items: readonly T[]): readonly T[] {
  return Object.freeze([...items]);
}

export function immutableRecord<T extends object>(record: T): Readonly<T> {
  return Object.freeze({ ...record });
}
