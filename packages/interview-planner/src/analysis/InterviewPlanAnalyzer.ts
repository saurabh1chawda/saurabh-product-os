import type { CareerArtifact } from "@career-companion/career-artifacts";
import { createInterviewPlannerExplanationSummary } from "../explainability";
import type { InterviewPlan, InterviewPlanRecommendation, InterviewRoadmap } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord, uniqueSorted } from "../shared";
import { confidenceFactors } from "./scoring";

export class InterviewPlanAnalyzer {
  analyze(roadmap: InterviewRoadmap): InterviewPlan {
    const planId = `interview-plan:${roadmap.roadmapId}`;
    const topItem = roadmap.items[0];
    const confidenceScore = Math.round(roadmap.confidence.value * 100);
    const outcome = confidenceScore >= roadmap.policy.accelerationThreshold
      ? "ReadinessAcceleration" as const
      : confidenceScore >= roadmap.policy.foundationThreshold
        ? "StrategicInterviewReadiness" as const
        : roadmap.learningPlan.outcome === "EvidenceLedLearning"
          ? "EvidenceFocusedReadiness" as const
          : "FoundationReadiness" as const;
    const recommendations = immutableArray<InterviewPlanRecommendation>([
      immutableRecord({
        recommendationId: `interview-plan-recommendation:${planId}`,
        priority: topItem?.priority ?? "Medium",
        category: "Readiness" as const,
        recommendationType: "Prepare" as const,
        impact: roadmap.items.length >= 5 ? "Significant" as const : "Moderate" as const,
        affectedInitiativeIds: immutableArray(roadmap.items.slice(0, 4).map((item) => item.initiativeId)),
        rationale: "Interview plan recommendation follows the ordered readiness roadmap.",
        confidence: confidenceFromScore(confidenceScore, "Plan recommendation confidence follows roadmap confidence.")
      })
    ]);
    const evidenceReferences = uniqueSorted([
      roadmap.careerStrategy.artifact.artifactId,
      roadmap.portfolioPlan.artifact.artifactId,
      roadmap.learningPlan.artifact.artifactId,
      roadmap.opportunityDecision.artifact.artifactId,
      ...roadmap.items.map((item) => item.initiativeId)
    ]);

    return immutableRecord({
      artifactKind: "InterviewPlan" as const,
      planId,
      roadmapId: roadmap.roadmapId,
      outcome,
      prioritizedReadinessInitiatives: roadmap.items,
      expectedReadinessOutcomes: immutableArray(roadmap.items.map((item) => item.expectedReadinessOutcome)),
      rationale: immutableArray([
        roadmap.careerStrategy.profile,
        roadmap.portfolioPlan.outcome,
        roadmap.learningPlan.outcome,
        roadmap.opportunityDecision.outcome
      ]),
      recommendations,
      confidenceFactors: confidenceFactors(confidenceScore, roadmap.items.length),
      evidenceReferences,
      assumptions: roadmap.assumptions,
      constraints: roadmap.constraints,
      milestones: immutableArray(roadmap.items.map((item) => item.milestone)),
      decisionTrace: roadmap.traceId,
      artifact: interviewPlanArtifact(planId, outcome, confidenceScore),
      explanationSummary: createInterviewPlannerExplanationSummary({
        decisionId: planId,
        title: "Interview Plan",
        outcome,
        confidenceScore,
        evidenceReferenceIds: evidenceReferences,
        reasonCodes: [outcome, ...roadmap.items.map((item) => item.initiativeId)],
        assumptions: roadmap.assumptions,
        constraints: roadmap.constraints.map((constraint) => constraint.label),
        tradeOffs: immutableArray(["readiness acceleration is balanced against foundation-building confidence"])
      })
    });
  }
}

function interviewPlanArtifact(planId: string, outcome: string, score: number): CareerArtifact {
  return immutableRecord({
    artifactId: `artifact:${planId}`,
    artifactType: "CareerReport",
    metadata: immutableRecord({
      artifactId: `artifact:${planId}`,
      artifactType: "CareerReport",
      title: "Interview Plan",
      createdAt: "1970-01-01T00:00:00.000Z",
      source: "interview-planner",
      version: 1,
      references: immutableArray([])
    }),
    summary: immutableRecord({
      headline: outcome,
      summary: `Interview plan confidence ${score}.`,
      references: immutableArray([])
    }),
    sections: immutableArray([])
  });
}
