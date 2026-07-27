import { createOpportunityExplanationSummary } from "../explainability";
import type { MarketAnalysis, RoleAnalysis } from "../models";
import { confidenceFromScore, immutableRecord } from "../shared";
import { breakdown, dimension } from "./scoring";

export class MarketAnalysisAnalyzer {
  analyze(role: RoleAnalysis): MarketAnalysis {
    const sourceText = `${role.jobModel.source.description} ${role.jobModel.industry} ${role.jobModel.signals.map((signal) => signal.value).join(" ")}`;
    const marketSignals = role.jobModel.signals.filter((signal) => signal.category === "market").map((signal) => ({
      signalId: signal.signalId,
      category: "market" as const,
      label: signal.category,
      value: signal.value,
      weight: signal.confidence.value
    }));
    const dimensions = {
      hiringDemandIndicator: dimension("Hiring Demand", sourceText, marketSignals, textDefault(sourceText, "demand", 58), 0.2),
      compensationCompetitiveness: dimension("Compensation Competitiveness", sourceText, marketSignals, textDefault(sourceText, "competitive", 55), 0.14),
      industryGrowth: dimension("Industry Growth", sourceText, marketSignals, textDefault(sourceText, "growth", role.jobModel.domain.classification === "AI" ? 72 : 54), 0.2),
      marketMaturity: dimension("Market Maturity", sourceText, marketSignals, textDefault(sourceText, "mature", 56), 0.16),
      competitiveLandscape: dimension("Competitive Landscape", sourceText, marketSignals, textDefault(sourceText, "competition", 50), 0.14),
      hiringVelocityIndicator: dimension("Hiring Velocity", sourceText, marketSignals, textDefault(sourceText, "velocity", 52), 0.16)
    };
    const scoreBreakdown = breakdown("market", Object.values(dimensions));
    const analysisId = `market-analysis:${role.analysisId}`;

    return immutableRecord({
      artifactKind: "MarketAnalysis" as const,
      analysisId,
      roleAnalysisId: role.analysisId,
      resume: role.resume,
      jobModel: role.jobModel,
      portfolio: role.portfolio,
      policy: role.policy,
      ...dimensions,
      scoreBreakdown,
      roleScore: role.scoreBreakdown,
      companyScore: role.companyScore,
      assumptions: role.assumptions,
      constraints: role.constraints,
      traceId: role.traceId,
      confidence: confidenceFromScore(scoreBreakdown.overallScore, "Market confidence follows supplied market evidence only."),
      explanationSummary: createOpportunityExplanationSummary({
        decisionId: analysisId,
        title: "Market Analysis",
        outcome: "WorthExploring",
        confidenceScore: scoreBreakdown.overallScore,
        evidenceReferenceIds: [role.jobModel.artifact.artifactId],
        reasonCodes: scoreBreakdown.dimensions.map((item) => item.dimension),
        assumptions: role.assumptions,
        constraints: role.constraints
      })
    });
  }
}

function textDefault(text: string, signal: string, score: number): number {
  return text.toLowerCase().includes(signal) ? score : 45;
}
