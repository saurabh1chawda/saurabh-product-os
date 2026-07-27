import type { CareerArtifact } from "@career-companion/career-artifacts";
import { createNetworkingPlannerExplanationSummary } from "../explainability";
import type { NetworkingPlan, NetworkingPlanRecommendation, NetworkingRoadmap } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord, uniqueSorted } from "../shared";
import { confidenceFactors } from "./scoring";

export class NetworkingPlanAnalyzer {
  analyze(roadmap: NetworkingRoadmap): NetworkingPlan {
    const planId = `networking-plan:${roadmap.roadmapId}`;
    const topItem = roadmap.items[0];
    const confidenceScore = Math.round(roadmap.confidence.value * 100);
    const outcome = confidenceScore >= roadmap.policy.accelerationThreshold
      ? "VisibilityAcceleration" as const
      : confidenceScore >= roadmap.policy.foundationThreshold
        ? "RelationshipFocusedGrowth" as const
        : roadmap.portfolioPlan.outcome === "BuildCriticalEvidence"
          ? "ReferralReadiness" as const
          : "FoundationNetworking" as const;
    const recommendations = immutableArray<NetworkingPlanRecommendation>([
      immutableRecord({
        recommendationId: `networking-plan-recommendation:${planId}`,
        priority: topItem?.priority ?? "Medium",
        category: "Readiness" as const,
        recommendationType: "Prepare" as const,
        impact: roadmap.items.length >= 5 ? "Significant" as const : "Moderate" as const,
        affectedInitiativeIds: immutableArray(roadmap.items.slice(0, 4).map((item) => item.initiativeId)),
        rationale: "Networking plan recommendation follows the ordered networking roadmap.",
        confidence: confidenceFromScore(confidenceScore, "Plan recommendation confidence follows roadmap confidence.")
      })
    ]);
    const evidenceReferences = uniqueSorted([
      roadmap.careerStrategy.artifact.artifactId,
      roadmap.portfolioPlan.artifact.artifactId,
      roadmap.learningPlan.artifact.artifactId,
      roadmap.interviewPlan.artifact.artifactId,
      roadmap.opportunityDecision.artifact.artifactId,
      ...roadmap.items.map((item) => item.initiativeId)
    ]);

    return immutableRecord({
      artifactKind: "NetworkingPlan" as const,
      planId,
      roadmapId: roadmap.roadmapId,
      outcome,
      prioritizedNetworkingInitiatives: roadmap.items,
      rationale: immutableArray([
        roadmap.careerStrategy.profile,
        roadmap.portfolioPlan.outcome,
        roadmap.learningPlan.outcome,
        roadmap.interviewPlan.outcome,
        roadmap.opportunityDecision.outcome
      ]),
      recommendations,
      expectedNetworkingOutcomes: immutableArray(roadmap.items.map((item) => item.expectedNetworkingOutcome)),
      confidenceFactors: confidenceFactors(confidenceScore, roadmap.items.length),
      evidenceReferences,
      assumptions: roadmap.assumptions,
      constraints: roadmap.constraints,
      milestones: immutableArray(roadmap.items.map((item) => item.milestone)),
      decisionTrace: roadmap.traceId,
      artifact: networkingPlanArtifact(planId, outcome, confidenceScore),
      explanationSummary: createNetworkingPlannerExplanationSummary({
        decisionId: planId,
        title: "Networking Plan",
        outcome,
        confidenceScore,
        evidenceReferenceIds: evidenceReferences,
        reasonCodes: [outcome, ...roadmap.items.map((item) => item.initiativeId)],
        assumptions: roadmap.assumptions,
        constraints: roadmap.constraints.map((constraint) => constraint.label),
        tradeOffs: immutableArray(["networking acceleration is balanced against foundation-building confidence"])
      })
    });
  }
}

function networkingPlanArtifact(planId: string, outcome: string, score: number): CareerArtifact {
  return immutableRecord({
    artifactId: `artifact:${planId}`,
    artifactType: "CareerReport",
    metadata: immutableRecord({
      artifactId: `artifact:${planId}`,
      artifactType: "CareerReport",
      title: "Networking Plan",
      createdAt: "1970-01-01T00:00:00.000Z",
      source: "networking-planner",
      version: 1,
      references: immutableArray([])
    }),
    summary: immutableRecord({
      headline: outcome,
      summary: `Networking plan confidence ${score}.`,
      references: immutableArray([])
    }),
    sections: immutableArray([])
  });
}
