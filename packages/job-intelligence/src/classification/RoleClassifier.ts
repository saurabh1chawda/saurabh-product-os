import type { ClassificationResult, RoleClassification } from "../models";
import { confidenceFromScore, countSignals, immutableArray, immutableRecord } from "../shared";

const ROLE_SIGNALS: Readonly<Record<Exclude<RoleClassification, "Unknown">, readonly string[]>> = Object.freeze({
  ProductManager: ["product manager", "pm", "product owner", "product management"],
  ProductLeader: ["head of product", "director product", "vp product", "product lead", "lead product", "lead ai", "group product manager"],
  ProgramManager: ["program manager", "technical program", "tpm", "program management"],
  ProductOperations: ["product operations", "product ops", "operating model"],
  Unknown: []
} as Record<RoleClassification, readonly string[]>);

export class RoleClassifier {
  classify(description: string): ClassificationResult<RoleClassification> {
    return classifySignals(description, ROLE_SIGNALS, "Role classification");
  }
}

export function classifySignals<TClassification extends string>(
  description: string,
  signalMap: Readonly<Record<TClassification, readonly string[]>>,
  rationale: string
): ClassificationResult<TClassification | "Unknown"> {
  const scores = Object.entries(signalMap).map(([classification, signals]) => {
    return {
      classification: classification as TClassification,
      score: countSignals(description, signals as readonly string[]),
      signals: (signals as readonly string[]).filter((signal) => description.toLowerCase().includes(signal.toLowerCase()))
    };
  }).sort((left, right) => {
    const scoreDifference = right.score - left.score;
    return scoreDifference === 0 ? left.classification.localeCompare(right.classification) : scoreDifference;
  });
  const selected = scores[0];
  const classification = selected === undefined || selected.score === 0 ? "Unknown" : selected.classification;
  const alternatives = scores
    .filter((score) => score.classification !== classification && score.score > 0)
    .map((score) => score.classification);
  const score = selected === undefined ? 20 : Math.min(35 + selected.score * 25, 95);

  return immutableRecord({
    classification,
    confidence: confidenceFromScore(classification === "Unknown" ? 20 : score, rationale),
    signals: immutableArray(selected?.signals ?? []),
    alternatives: immutableArray(alternatives)
  });
}
