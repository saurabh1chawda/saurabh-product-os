import type { ATSGateEvaluation, ATSRecommendation } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord, priorityFromScore } from "../shared";

export function createATSRecommendations(gates: readonly ATSGateEvaluation[]): readonly ATSRecommendation[] {
  return immutableArray(gates
    .filter((gate) => gate.result !== "passed")
    .map((gate) => immutableRecord({
      recommendationId: `ats-recommendation:${gate.gateId}`,
      priority: priorityFromScore(gate.actual ?? 40),
      category: gate.gateType === "hard" ? "RiskMitigation" : gate.label.toLowerCase().includes("evidence") ? "Evidence" : "Coverage",
      impact: gate.gateType === "hard" ? "Significant" : "Moderate",
      recommendationType: gate.gateType === "warning" ? "Clarify" : "Validate",
      deficiency: gate.rationale,
      affectedGateIds: immutableArray([gate.gateId]),
      confidence: confidenceFromScore(gate.actual ?? 50, "Recommendation confidence follows deterministic gate evidence.")
    } satisfies ATSRecommendation)));
}
