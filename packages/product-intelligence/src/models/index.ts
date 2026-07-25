import type { ArtifactEvidence, ArtifactReference } from "@career-companion/career-artifacts";
import { assertFiniteNumber, clamp, immutableArray, immutableRecord } from "../shared";

export type ScoreBand = "low" | "medium" | "high" | "strong" | "needs-review";
export type ConfidenceBand = "low" | "medium" | "high";
export type GapSeverity = "low" | "medium" | "high";
export type GapPriority = "low" | "medium" | "high" | "critical";
export type EvidenceStrength = "none" | "weak" | "supporting" | "primary" | "authoritative";
export type OrderingDirection = "ascending" | "descending";

export const RECOMMENDATION_PRIORITIES = Object.freeze(["Critical", "High", "Medium", "Low"] as const);
export const RECOMMENDATION_CATEGORIES = Object.freeze(["Evidence", "Positioning", "Clarity", "Coverage", "Impact", "Readiness", "Alignment", "RiskMitigation"] as const);
export const RECOMMENDATION_IMPACTS = Object.freeze(["Transformational", "Significant", "Moderate", "Minor"] as const);
export const RECOMMENDATION_TYPES = Object.freeze(["Add", "Strengthen", "Clarify", "Quantify", "Reframe", "Validate", "Remove", "Replace", "Prepare"] as const);

export type RecommendationPriority = typeof RECOMMENDATION_PRIORITIES[number];
export type RecommendationCategory = typeof RECOMMENDATION_CATEGORIES[number];
export type RecommendationImpact = typeof RECOMMENDATION_IMPACTS[number];
export type RecommendationType = typeof RECOMMENDATION_TYPES[number];

export interface ScoreWeight {
  readonly key: string;
  readonly weight: number;
  readonly rationale?: string;
}

export interface ScoreDimension {
  readonly dimension: string;
  readonly score: number;
  readonly weight: number;
  readonly rationale: string;
}

export interface ScoreContribution {
  readonly source: string;
  readonly amount: number;
  readonly rationale: string;
}

export interface ScorePenalty {
  readonly code: string;
  readonly amount: number;
  readonly severity: GapSeverity;
  readonly rationale: string;
}

export interface ScoreBreakdown {
  readonly overallScore: number;
  readonly band: ScoreBand;
  readonly dimensions: readonly ScoreDimension[];
  readonly contributions: readonly ScoreContribution[];
  readonly penalties: readonly ScorePenalty[];
}

export interface WeightedScore {
  readonly value: number;
  readonly weight: number;
  readonly weightedValue: number;
  readonly band: ScoreBand;
}

export interface Confidence {
  readonly value: number;
  readonly band: ConfidenceBand;
  readonly rationale?: string;
}

export interface ConfidenceFactor {
  readonly factor: string;
  readonly value: number;
  readonly weight?: number;
  readonly rationale: string;
}

export interface ConfidenceExplanationReference {
  readonly referenceId: string;
  readonly referenceType: string;
  readonly confidence: Confidence;
}

export interface RankingReason {
  readonly code: string;
  readonly statement: string;
  readonly weight?: number;
}

export interface GapClassification {
  readonly gapId: string;
  readonly gapType: string;
  readonly severity: GapSeverity;
  readonly priority: GapPriority;
  readonly rationale: string;
}

export interface GapRecommendationPriority {
  readonly priority: GapPriority;
  readonly rationale: string;
}

export interface MissingEvidenceDescriptor {
  readonly descriptorId: string;
  readonly evidenceType: string;
  readonly description: string;
  readonly reference?: ArtifactReference;
}

export interface GapEvidence {
  readonly supportingEvidence: readonly ArtifactEvidence[];
  readonly missingEvidence: readonly MissingEvidenceDescriptor[];
  readonly confidence: Confidence;
  readonly constraintReferences: readonly ArtifactReference[];
  readonly explanationReference?: ArtifactReference;
}

export function createScoreWeight(input: ScoreWeight): ScoreWeight {
  assertFiniteNumber(input.weight, "weight");
  return immutableRecord({
    ...input,
    weight: clamp(input.weight, 0, 1)
  });
}

export function createScoreDimension(input: ScoreDimension): ScoreDimension {
  assertFiniteNumber(input.score, "score");
  assertFiniteNumber(input.weight, "weight");
  return immutableRecord({
    ...input,
    score: Math.round(clamp(input.score, 0, 100)),
    weight: clamp(input.weight, 0, 1)
  });
}

export function createScoreContribution(input: ScoreContribution): ScoreContribution {
  assertFiniteNumber(input.amount, "amount");
  return immutableRecord(input);
}

export function createScorePenalty(input: ScorePenalty): ScorePenalty {
  assertFiniteNumber(input.amount, "amount");
  return immutableRecord({
    ...input,
    amount: Math.max(input.amount, 0)
  });
}

export function createScoreBreakdown(input: ScoreBreakdown): ScoreBreakdown {
  assertFiniteNumber(input.overallScore, "overallScore");
  return immutableRecord({
    ...input,
    overallScore: Math.round(clamp(input.overallScore, 0, 100)),
    dimensions: immutableArray(input.dimensions),
    contributions: immutableArray(input.contributions),
    penalties: immutableArray(input.penalties)
  });
}

export function createWeightedScore(input: Omit<WeightedScore, "weightedValue">): WeightedScore {
  assertFiniteNumber(input.value, "value");
  assertFiniteNumber(input.weight, "weight");
  const value = clamp(input.value, 0, 100);
  const weight = clamp(input.weight, 0, 1);

  return immutableRecord({
    ...input,
    value,
    weight,
    weightedValue: value * weight
  });
}

export function createConfidence(input: Confidence): Confidence {
  assertFiniteNumber(input.value, "value");
  const value = clamp(input.value, 0, 1);
  return immutableRecord({
    ...input,
    value,
    band: confidenceBandFor(value)
  });
}

export function createConfidenceFactor(input: ConfidenceFactor): ConfidenceFactor {
  assertFiniteNumber(input.value, "value");
  return immutableRecord({
    ...input,
    value: clamp(input.value, 0, 1),
    weight: input.weight === undefined ? undefined : clamp(input.weight, 0, 1)
  });
}

export function createConfidenceExplanationReference(input: ConfidenceExplanationReference): ConfidenceExplanationReference {
  return immutableRecord(input);
}

export function createRankingReason(input: RankingReason): RankingReason {
  return immutableRecord(input);
}

export function createGapClassification(input: GapClassification): GapClassification {
  return immutableRecord(input);
}

export function createGapRecommendationPriority(input: GapRecommendationPriority): GapRecommendationPriority {
  return immutableRecord(input);
}

export function createMissingEvidenceDescriptor(input: MissingEvidenceDescriptor): MissingEvidenceDescriptor {
  return immutableRecord(input);
}

export function createGapEvidence(input: GapEvidence): GapEvidence {
  return immutableRecord({
    ...input,
    supportingEvidence: immutableArray(input.supportingEvidence),
    missingEvidence: immutableArray(input.missingEvidence),
    constraintReferences: immutableArray(input.constraintReferences)
  });
}

function confidenceBandFor(value: number): ConfidenceBand {
  if (value >= 0.75) return "high";
  if (value >= 0.5) return "medium";
  return "low";
}
