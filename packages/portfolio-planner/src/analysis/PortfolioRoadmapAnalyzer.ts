import { createPortfolioPlannerExplanationSummary } from "../explainability";
import type { InitiativeEvaluation, PortfolioRoadmap, RoadmapItem } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord } from "../shared";

export class PortfolioRoadmapAnalyzer {
  analyze(evaluation: InitiativeEvaluation): PortfolioRoadmap {
    const ordered = [...evaluation.evaluations].sort((a, b) => b.scoreBreakdown.overallScore - a.scoreBreakdown.overallScore || a.initiativeId.localeCompare(b.initiativeId));
    const items = immutableArray(ordered.map((item, index): RoadmapItem => immutableRecord({
      roadmapItemId: `roadmap-item:${index + 1}:${item.initiativeId}`,
      initiativeId: item.initiativeId,
      sequence: index + 1,
      priority: item.priority,
      dependencyIds: immutableArray(index === 0 ? [] : [ordered[index - 1]?.initiativeId ?? ""]),
      expectedImpact: item.impact,
      completionSignal: `${item.kind} has a verified portfolio evidence outcome.`,
      confidence: item.confidence
    })));
    const roadmapId = `portfolio-roadmap:${evaluation.evaluationId}`;
    const confidenceScore = Math.round(ordered.reduce((sum, item) => sum + item.scoreBreakdown.overallScore, 0) / Math.max(1, ordered.length));

    return immutableRecord({
      artifactKind: "PortfolioRoadmap" as const,
      roadmapId,
      evaluationId: evaluation.evaluationId,
      careerStrategy: evaluation.careerStrategy,
      portfolio: evaluation.portfolio,
      opportunityDecision: evaluation.opportunityDecision,
      items,
      policy: evaluation.policy,
      assumptions: evaluation.assumptions,
      constraints: evaluation.constraints,
      traceId: evaluation.traceId,
      confidence: confidenceFromScore(confidenceScore, "PortfolioRoadmap confidence follows deterministic initiative sequencing."),
      explanationSummary: createPortfolioPlannerExplanationSummary({
        decisionId: roadmapId,
        title: "Portfolio Roadmap",
        outcome: "RoadmapSequenced",
        confidenceScore,
        evidenceReferenceIds: [evaluation.portfolio.artifact.artifactId, evaluation.careerStrategy.artifact.artifactId],
        reasonCodes: items.map((item) => item.initiativeId),
        tradeOffs: immutableArray(["highest portfolio value is balanced against dependency order"]),
        assumptions: evaluation.assumptions,
        constraints: evaluation.constraints.map((constraint) => constraint.label)
      })
    });
  }
}
