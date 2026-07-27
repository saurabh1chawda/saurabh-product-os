import type { CareerArtifact } from "@career-companion/career-artifacts";
import { createPortfolioPlannerExplanationSummary } from "../explainability";
import type { PortfolioPlan, PortfolioPlanRecommendation, PortfolioRoadmap } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord, uniqueSorted } from "../shared";
import { confidenceFactors } from "./scoring";

export class PortfolioPlanAnalyzer {
  analyze(roadmap: PortfolioRoadmap): PortfolioPlan {
    const planId = `portfolio-plan:${roadmap.roadmapId}`;
    const topItem = roadmap.items[0];
    const confidenceScore = Math.round(roadmap.confidence.value * 100);
    const outcome = confidenceScore >= roadmap.policy.publishReadyThreshold
      ? "PublishReady" as const
      : confidenceScore >= roadmap.policy.improvementThreshold
        ? "ImproveBeforePublishing" as const
        : roadmap.items.some((item) => item.priority === "Critical")
          ? "BuildCriticalEvidence" as const
          : "SequenceStrategicInitiatives" as const;
    const recommendations = immutableArray<PortfolioPlanRecommendation>([
      immutableRecord({
        recommendationId: `portfolio-plan-recommendation:${planId}`,
        priority: topItem?.priority ?? "Medium",
        category: "Evidence" as const,
        recommendationType: outcome === "PublishReady" ? "Prepare" as const : "Strengthen" as const,
        impact: topItem?.expectedImpact ?? "Moderate",
        affectedInitiativeIds: immutableArray(roadmap.items.slice(0, 3).map((item) => item.initiativeId)),
        rationale: "Portfolio plan recommendation follows the ordered roadmap.",
        confidence: confidenceFromScore(confidenceScore, "Plan recommendation confidence follows roadmap confidence.")
      })
    ]);
    const supportingEvidence = uniqueSorted([
      roadmap.portfolio.artifact.artifactId,
      roadmap.careerStrategy.artifact.artifactId,
      roadmap.opportunityDecision.artifact.artifactId,
      ...roadmap.items.map((item) => item.initiativeId)
    ]);

    return immutableRecord({
      artifactKind: "PortfolioPlan" as const,
      planId,
      roadmapId: roadmap.roadmapId,
      outcome,
      orderedInitiatives: roadmap.items,
      recommendations,
      confidenceFactors: confidenceFactors(confidenceScore, roadmap.items.length),
      supportingEvidence,
      assumptions: roadmap.assumptions,
      constraints: roadmap.constraints,
      decisionTrace: roadmap.traceId,
      artifact: portfolioPlanArtifact(planId, outcome, confidenceScore),
      explanationSummary: createPortfolioPlannerExplanationSummary({
        decisionId: planId,
        title: "Portfolio Plan",
        outcome,
        confidenceScore,
        evidenceReferenceIds: supportingEvidence,
        reasonCodes: [outcome, ...roadmap.items.map((item) => item.initiativeId)],
        assumptions: roadmap.assumptions,
        constraints: roadmap.constraints.map((constraint) => constraint.label)
      })
    });
  }
}

function portfolioPlanArtifact(planId: string, outcome: string, score: number): CareerArtifact {
  return immutableRecord({
    artifactId: `artifact:${planId}`,
    artifactType: "CareerReport",
    metadata: immutableRecord({
      artifactId: `artifact:${planId}`,
      artifactType: "CareerReport",
      title: "Portfolio Plan",
      createdAt: "1970-01-01T00:00:00.000Z",
      source: "portfolio-planner",
      version: 1,
      references: immutableArray([])
    }),
    summary: immutableRecord({
      headline: outcome,
      summary: `Portfolio plan confidence ${score}.`,
      references: immutableArray([])
    }),
    sections: immutableArray([])
  });
}
