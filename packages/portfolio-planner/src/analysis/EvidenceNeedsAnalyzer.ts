import { createPortfolioPlannerExplanationSummary } from "../explainability";
import type { EvidenceNeeds, PortfolioPlanContext } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord, uniqueSorted } from "../shared";
import { evidenceNeed, planningGap } from "./scoring";

export class EvidenceNeedsAnalyzer {
  analyze(context: PortfolioPlanContext): EvidenceNeeds {
    const portfolioGaps = immutableArray([
      ...context.portfolio.gaps.map((gap) => planningGap(`portfolio-gap:${gap.gapId}`, gap.description, severityScore(gap.severity))),
      ...context.careerStrategy.risks.map((risk) => planningGap(`strategy-risk:${risk}`, risk, 45))
    ]);
    const needs = immutableArray(portfolioGaps.map((gap, index) => evidenceNeed(
      `evidence-need:${index + 1}:${gap.gapId}`,
      `Address ${gap.gapType}`,
      gap.gapId,
      evidenceTypeFor(gap.gapType),
      severityScore(gap.severity),
      uniqueSorted([
        context.careerStrategy.strategyId,
        context.portfolio.artifact.artifactId,
        context.opportunityDecision.decisionId
      ])
    )));
    const needsId = `evidence-needs:${context.contextId}`;
    const confidenceScore = Math.max(35, Math.round(needs.reduce((sum, need) => sum + need.confidence.value * 100, 0) / Math.max(1, needs.length)));

    return immutableRecord({
      artifactKind: "EvidenceNeeds" as const,
      needsId,
      contextId: context.contextId,
      careerStrategy: context.careerStrategy,
      portfolio: context.portfolio,
      opportunityDecision: context.opportunityDecision,
      needs,
      portfolioGaps,
      strategicRisks: context.careerStrategy.risks,
      policy: context.policy,
      assumptions: context.assumptions,
      constraints: context.constraints,
      traceId: context.traceId,
      confidence: confidenceFromScore(confidenceScore, "EvidenceNeeds confidence follows deterministic portfolio and strategy gaps."),
      explanationSummary: createPortfolioPlannerExplanationSummary({
        decisionId: needsId,
        title: "Evidence Needs",
        outcome: "NeedsRepresented",
        confidenceScore,
        evidenceReferenceIds: needs.flatMap((need) => need.supportingReferences),
        reasonCodes: needs.map((need) => need.targetEvidenceType),
        assumptions: context.assumptions,
        constraints: context.constraints.map((constraint) => constraint.label)
      })
    });
  }
}

function severityScore(severity: string): number {
  if (severity === "high") return 35;
  if (severity === "medium") return 58;
  return 78;
}

function evidenceTypeFor(label: string): string {
  const normalized = label.toLowerCase();
  if (normalized.includes("leadership")) return "leadership-evidence";
  if (normalized.includes("technical") || normalized.includes("ai")) return "technical-depth-evidence";
  if (normalized.includes("impact") || normalized.includes("evidence")) return "quantified-impact-evidence";
  if (normalized.includes("portfolio")) return "portfolio-publication-evidence";
  return "strategic-portfolio-evidence";
}
