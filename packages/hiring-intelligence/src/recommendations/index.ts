import type { HiringRecommendation, HiringSignal } from "../models";
import { immutableArray, immutableRecord, priorityFromScore } from "../shared";

export function createHiringRecommendations(signals: readonly HiringSignal[]): readonly HiringRecommendation[] {
  return immutableArray(signals
    .filter((signal) => signal.score.score < 75)
    .map((signal) => immutableRecord({
      recommendationId: `hiring-recommendation:${signal.signalId}`,
      priority: priorityFromScore(signal.score.score),
      category: categoryFor(signal.area),
      impact: signal.score.score < 50 ? "Significant" : "Moderate",
      recommendationType: signal.score.score < 50 ? "Validate" : "Strengthen",
      targetSignalIds: immutableArray([signal.signalId]),
      confidence: signal.confidence
    } satisfies HiringRecommendation)));
}

function categoryFor(area: HiringSignal["area"]): HiringRecommendation["category"] {
  if (area === "RiskSignals" || area === "Stability") return "RiskMitigation";
  if (area === "EvidenceQuality" || area === "BehavioralEvidence") return "Evidence";
  if (area === "BusinessImpact" || area === "Execution" || area === "ExecutionReasoning") return "Impact";
  if (area === "ResumeClarity" || area === "Communication") return "Clarity";
  return "Alignment";
}
