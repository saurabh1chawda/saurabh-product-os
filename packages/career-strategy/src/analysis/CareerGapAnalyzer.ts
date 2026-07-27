import { createCareerStrategyExplanationSummary } from "../explainability";
import type { CareerGap, CurrentState } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord } from "../shared";
import { gap } from "./scoring";

export class CareerGapAnalyzer {
  analyze(state: CurrentState): CareerGap {
    const gaps = {
      leadershipGap: gap("career-gap:leadership", "Leadership Gap", state.leadership.score.score),
      technicalGap: gap("career-gap:technical", "Technical Gap", state.productDepth.score.score),
      domainGap: gap("career-gap:domain", "Domain Gap", state.marketPositioning.score.score),
      aiCapabilityGap: gap("career-gap:ai", "AI Capability Gap", state.aiCapability.score.score),
      portfolioGap: gap("career-gap:portfolio", "Portfolio Gap", state.portfolioMaturity.score.score),
      evidenceGap: gap("career-gap:evidence", "Evidence Gap", state.evidenceMaturity.score.score),
      interviewGap: gap("career-gap:interview", "Interview Gap", state.interviewReadiness.score.score),
      marketVisibilityGap: gap("career-gap:market-visibility", "Market Visibility Gap", state.marketPositioning.score.score)
    };
    const allGaps = immutableArray(Object.values(gaps));
    const gapId = `career-gap:${state.stateId}`;
    const confidenceScore = Math.max(35, 100 - allGaps.filter((item) => item.severity !== "low").length * 8);

    return immutableRecord({
      artifactKind: "CareerGap" as const,
      gapId,
      stateId: state.stateId,
      opportunityDecision: state.opportunityDecision,
      decisionReport: state.decisionReport,
      targetRole: state.targetRole,
      targetDomains: state.targetDomains,
      policy: state.policy,
      ...gaps,
      gaps: allGaps,
      currentStateScore: state.scoreBreakdown,
      assumptions: state.assumptions,
      constraints: state.constraints,
      traceId: state.traceId,
      confidence: confidenceFromScore(confidenceScore, "CareerGap confidence follows deterministic current-state gaps."),
      explanationSummary: createCareerStrategyExplanationSummary({
        decisionId: gapId,
        title: "Career Gap",
        outcome: "BalancedGrowth",
        confidenceScore,
        evidenceReferenceIds: [state.decisionReport.artifact.artifactId, state.opportunityDecision.artifact.artifactId],
        reasonCodes: allGaps.map((item) => item.gapType),
        assumptions: state.assumptions,
        constraints: state.constraints
      })
    });
  }
}
