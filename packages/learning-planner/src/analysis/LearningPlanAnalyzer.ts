import type { CareerArtifact } from "@career-companion/career-artifacts";
import { createLearningPlannerExplanationSummary } from "../explainability";
import type { LearningPlan, LearningPlanRecommendation, LearningRoadmap } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord, uniqueSorted } from "../shared";
import { confidenceFactors } from "./scoring";

export class LearningPlanAnalyzer {
  analyze(roadmap: LearningRoadmap): LearningPlan {
    const planId = `learning-plan:${roadmap.roadmapId}`;
    const topItem = roadmap.items[0];
    const confidenceScore = Math.round(roadmap.confidence.value * 100);
    const outcome = confidenceScore >= roadmap.policy.accelerationThreshold
      ? "StrategicCapabilityAcceleration" as const
      : confidenceScore >= roadmap.policy.foundationThreshold
        ? "CapabilityFocusedGrowth" as const
        : roadmap.portfolioPlan.outcome === "BuildCriticalEvidence"
          ? "EvidenceLedLearning" as const
          : "FoundationBuilding" as const;
    const recommendations = immutableArray<LearningPlanRecommendation>([
      immutableRecord({
        recommendationId: `learning-plan-recommendation:${planId}`,
        priority: topItem?.priority ?? "Medium",
        category: "Readiness" as const,
        recommendationType: "Strengthen" as const,
        impact: roadmap.items.length >= 5 ? "Significant" as const : "Moderate" as const,
        affectedInitiativeIds: immutableArray(roadmap.items.slice(0, 4).map((item) => item.initiativeId)),
        rationale: "Learning plan recommendation follows the ordered capability roadmap.",
        confidence: confidenceFromScore(confidenceScore, "Plan recommendation confidence follows roadmap confidence.")
      })
    ]);
    const evidenceReferences = uniqueSorted([
      roadmap.careerStrategy.artifact.artifactId,
      roadmap.portfolioPlan.artifact.artifactId,
      roadmap.opportunityDecision.artifact.artifactId,
      ...roadmap.items.map((item) => item.initiativeId)
    ]);

    return immutableRecord({
      artifactKind: "LearningPlan" as const,
      planId,
      roadmapId: roadmap.roadmapId,
      outcome,
      prioritizedInitiatives: roadmap.items,
      capabilityOutcomes: immutableArray(roadmap.items.map((item) => item.expectedOutcome)),
      strategicRationale: immutableArray([
        roadmap.careerStrategy.profile,
        roadmap.portfolioPlan.outcome,
        roadmap.opportunityDecision.outcome
      ]),
      recommendations,
      confidenceFactors: confidenceFactors(confidenceScore, roadmap.items.length),
      evidenceReferences,
      assumptions: roadmap.assumptions,
      constraints: roadmap.constraints,
      milestones: immutableArray(roadmap.items.map((item) => item.milestone)),
      decisionTrace: roadmap.traceId,
      artifact: learningPlanArtifact(planId, outcome, confidenceScore),
      explanationSummary: createLearningPlannerExplanationSummary({
        decisionId: planId,
        title: "Learning Plan",
        outcome,
        confidenceScore,
        evidenceReferenceIds: evidenceReferences,
        reasonCodes: [outcome, ...roadmap.items.map((item) => item.initiativeId)],
        tradeOffs: immutableArray(["capability acceleration is balanced against foundation-building confidence"]),
        assumptions: roadmap.assumptions,
        constraints: roadmap.constraints.map((constraint) => constraint.label)
      })
    });
  }
}

function learningPlanArtifact(planId: string, outcome: string, score: number): CareerArtifact {
  return immutableRecord({
    artifactId: `artifact:${planId}`,
    artifactType: "CareerReport",
    metadata: immutableRecord({
      artifactId: `artifact:${planId}`,
      artifactType: "CareerReport",
      title: "Learning Plan",
      createdAt: "1970-01-01T00:00:00.000Z",
      source: "learning-planner",
      version: 1,
      references: immutableArray([])
    }),
    summary: immutableRecord({
      headline: outcome,
      summary: `Learning plan confidence ${score}.`,
      references: immutableArray([])
    }),
    sections: immutableArray([])
  });
}
