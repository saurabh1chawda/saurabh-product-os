import { createCareerStrategyExplanationSummary } from "../explainability";
import type { CareerGap, StrategyOptions } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord } from "../shared";
import { option } from "./scoring";

export class StrategyOptionsAnalyzer {
  analyze(gapArtifact: CareerGap): StrategyOptions {
    const mediumOrHigher = gapArtifact.gaps.filter((gap) => gap.severity !== "low");
    const gapIds = mediumOrHigher.map((gap) => gap.gapId);
    const options = immutableArray([
      option("AggressiveGrowth", "Aggressive Growth", gapIds, 76),
      option("BalancedGrowth", "Balanced Growth", gapIds, 82),
      option("AIFirst", "AI First", gapIds.filter((id) => id.includes(":ai")), gapArtifact.aiCapabilityGap.severity === "low" ? 78 : 70),
      option("LeadershipFirst", "Leadership First", gapIds.filter((id) => id.includes(":leadership")), gapArtifact.leadershipGap.severity === "low" ? 78 : 72),
      option("StartupFocus", "Startup Focus", gapIds, gapArtifact.opportunityDecision.outcome === "PursueImmediately" ? 74 : 62),
      option("EnterpriseFocus", "Enterprise Focus", gapIds, 68),
      option("GeographicPivot", "Geographic Pivot", gapIds.filter((id) => id.includes("market")), 58)
    ]);
    const optionsId = `strategy-options:${gapArtifact.gapId}`;
    const confidenceScore = Math.round(options.reduce((sum, item) => sum + item.confidence.value * 100, 0) / options.length);

    return immutableRecord({
      artifactKind: "StrategyOptions" as const,
      optionsId,
      gapId: gapArtifact.gapId,
      options,
      opportunityDecision: gapArtifact.opportunityDecision,
      decisionReport: gapArtifact.decisionReport,
      gaps: gapArtifact.gaps,
      policy: gapArtifact.policy,
      assumptions: gapArtifact.assumptions,
      constraints: gapArtifact.constraints,
      traceId: gapArtifact.traceId,
      confidence: confidenceFromScore(confidenceScore, "StrategyOptions confidence follows deterministic option generation."),
      explanationSummary: createCareerStrategyExplanationSummary({
        decisionId: optionsId,
        title: "Strategy Options",
        outcome: "BalancedGrowth",
        confidenceScore,
        evidenceReferenceIds: [gapArtifact.decisionReport.artifact.artifactId, gapArtifact.opportunityDecision.artifact.artifactId],
        reasonCodes: options.map((item) => item.kind),
        assumptions: gapArtifact.assumptions,
        constraints: gapArtifact.constraints
      })
    });
  }
}
