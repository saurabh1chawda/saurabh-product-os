import type { CareerArtifact } from "@career-companion/career-artifacts";
import type { DecisionReference } from "@career-companion/decision-model";
import {
  createConfidence,
  type Confidence,
  type RecommendationPriority,
  type ScoreBand
} from "@career-companion/product-intelligence";

export function immutableArray<T>(items: readonly T[]): readonly T[] {
  return Object.freeze([...items]);
}

export function immutableRecord<T extends object>(record: T): Readonly<T> {
  return Object.freeze({ ...record });
}

export function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ");
}

export function uniqueSorted(values: readonly string[]): readonly string[] {
  return immutableArray([...new Set(values.filter((value) => value.trim().length > 0))].sort((a, b) => a.localeCompare(b)));
}

export function average(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function confidenceFromScore(score: number, rationale: string): Confidence {
  return createConfidence({ value: clampScore(score) / 100, band: "medium", rationale });
}

export function scoreBand(value: number): ScoreBand {
  if (value >= 85) return "strong";
  if (value >= 70) return "high";
  if (value >= 50) return "medium";
  if (value >= 35) return "needs-review";
  return "low";
}

export function priorityFromScore(score: number): RecommendationPriority {
  if (score < 45) return "Critical";
  if (score < 65) return "High";
  if (score < 80) return "Medium";
  return "Low";
}

export function textMatch(text: string, signal: string): boolean {
  const normalizedText = normalizeText(text);
  const normalizedSignal = normalizeText(signal);
  return normalizedSignal.length > 0 && normalizedText.includes(normalizedSignal);
}

export function artifactReference(artifact: CareerArtifact): DecisionReference {
  return immutableRecord({
    referenceId: artifact.artifactId,
    referenceType: artifact.artifactType,
    label: artifact.metadata.title,
    authority: "derived" as const
  });
}
