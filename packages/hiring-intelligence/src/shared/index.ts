import type { ArtifactReference } from "@career-companion/career-artifacts";
import type { DecisionReference } from "@career-companion/decision-model";
import type { Confidence, ConfidenceBand, RecommendationPriority, ScoreBand } from "@career-companion/product-intelligence";
import { createConfidence } from "@career-companion/product-intelligence";

export function immutableArray<T>(items: readonly T[]): readonly T[] {
  return Object.freeze([...items]);
}

export function immutableRecord<T extends object>(record: T): Readonly<T> {
  return Object.freeze({ ...record });
}

export function clamp(value: number, minimum = 0, maximum = 100): number {
  return Math.min(Math.max(value, minimum), maximum);
}

export function average(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function uniqueSorted(values: readonly string[]): readonly string[] {
  return immutableArray([...new Set(values.map((value) => value.trim()).filter((value) => value.length > 0))].sort((left, right) => left.localeCompare(right)));
}

export function scoreBand(value: number): ScoreBand {
  if (value >= 75) return "high";
  if (value >= 50) return "medium";
  return "low";
}

export function confidenceFromScore(score: number, rationale: string): Confidence {
  const value = clamp(score, 0, 100) / 100;
  return createConfidence({
    value,
    band: confidenceBand(value),
    rationale
  });
}

export function confidenceBand(value: number): ConfidenceBand {
  if (value >= 0.75) return "high";
  if (value >= 0.5) return "medium";
  return "low";
}

export function priorityFromScore(score: number): RecommendationPriority {
  if (score < 45) return "Critical";
  if (score < 65) return "High";
  if (score < 80) return "Medium";
  return "Low";
}

export function artifactReference(referenceId: string, referenceType: string, label?: string): ArtifactReference {
  return immutableRecord({ referenceId, referenceType, label });
}

export function decisionReference(
  referenceId: string,
  referenceType: string,
  label: string,
  authority: DecisionReference["authority"] = "derived"
): DecisionReference {
  return immutableRecord({ referenceId, referenceType, label, authority });
}
