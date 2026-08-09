import type { Decision } from "@career-companion/decision-model";
import type { ConfidenceBreakdown, ConfidenceComponent } from "../models";
import { immutableArray, immutableRecord } from "../models";

export class ConfidenceAnalyzer {
  analyze(decision: Decision): ConfidenceBreakdown {
    const evidenceStrength = scoreAuthority(decision.references.map((reference) => reference.authority));
    const coverage = decision.references.length === 0 ? 0 : Math.min(decision.references.length / 3, 1);
    const consistency = decision.reasons.length === 0
      ? 0
      : Math.max(0, Math.min(1, decision.reasons.reduce((sum, reason) => sum + (reason.weight ?? 0), 0) / decision.reasons.length));
    const constraintSatisfaction = decision.outcome === "rejected" || decision.outcome === "not-recommended" ? 0.25 : 1;
    const components: readonly ConfidenceComponent[] = immutableArray([
      createComponent("evidence-strength", evidenceStrength, 0.35, ["Reference authority was evaluated deterministically."]),
      createComponent("coverage", coverage, 0.25, ["Reference coverage was calculated from the decision references."]),
      createComponent("consistency", consistency, 0.2, ["Reason weights were averaged for consistency."]),
      createComponent("constraint-satisfaction", constraintSatisfaction, 0.2, ["Decision outcome was mapped to constraint satisfaction."])
    ]);
    const aggregateValue = components.reduce((sum, component) => sum + component.score * component.weight, 0);

    return immutableRecord({
      aggregateConfidence: immutableRecord({
        value: round(aggregateValue),
        level: levelFor(aggregateValue),
        rationale: "Aggregate confidence is a deterministic weighted composition."
      }),
      components
    });
  }
}

function createComponent(
  component: ConfidenceComponent["component"],
  score: number,
  weight: number,
  reasons: readonly string[]
): ConfidenceComponent {
  return immutableRecord({
    component,
    score: round(score),
    weight,
    reasons: immutableArray(reasons)
  });
}

function scoreAuthority(authorities: readonly string[]): number {
  if (authorities.length === 0) {
    return 0;
  }

  const total = authorities.reduce((sum, authority) => {
    if (authority === "authoritative") {
      return sum + 1;
    }

    if (authority === "supporting") {
      return sum + 0.75;
    }

    if (authority === "derived") {
      return sum + 0.5;
    }

    return sum + 0.25;
  }, 0);

  return total / authorities.length;
}

function levelFor(value: number): "low" | "medium" | "high" | "unknown" {
  if (value >= 0.75) {
    return "high";
  }

  if (value >= 0.4) {
    return "medium";
  }

  return "low";
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
