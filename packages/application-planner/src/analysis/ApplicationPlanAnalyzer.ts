import type { CareerArtifact } from "@career-companion/career-artifacts";
import { createApplicationPlannerExplanationSummary } from "../explainability";
import type { ApplicationPlan, ApplicationPlanRecommendation, ApplicationRoadmap } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord, uniqueSorted } from "../shared";
import { confidenceFactors } from "./scoring";

export class ApplicationPlanAnalyzer {
  analyze(roadmap: ApplicationRoadmap): ApplicationPlan {
    const planId = `application-plan:${roadmap.roadmapId}`;
    const topItem = roadmap.items[0];
    const confidenceScore = Math.round(roadmap.confidence.value * 100);
    const outcome = confidenceScore >= roadmap.policy.accelerationThreshold
      ? "ApplicationReadinessAcceleration" as const
      : confidenceScore >= roadmap.policy.foundationThreshold
        ? "OpportunityFocusedReadiness" as const
        : roadmap.networkingPlan.outcome === "ReferralReadiness"
          ? "ReferralLedApplications" as const
          : "FoundationApplicationReadiness" as const;
    const recommendations = immutableArray<ApplicationPlanRecommendation>([
      immutableRecord({
        recommendationId: `application-plan-recommendation:${planId}`,
        priority: topItem?.priority ?? "Medium",
        category: "Readiness" as const,
        recommendationType: "Prepare" as const,
        impact: roadmap.items.length >= 5 ? "Significant" as const : "Moderate" as const,
        affectedInitiativeIds: immutableArray(roadmap.items.slice(0, 4).map((item) => item.initiativeId)),
        rationale: "Application plan recommendation follows the ordered application roadmap.",
        confidence: confidenceFromScore(confidenceScore, "Plan recommendation confidence follows roadmap confidence.")
      })
    ]);
    const evidenceReferences = uniqueSorted([
      roadmap.careerStrategy.artifact.artifactId,
      roadmap.portfolioPlan.artifact.artifactId,
      roadmap.learningPlan.artifact.artifactId,
      roadmap.interviewPlan.artifact.artifactId,
      roadmap.networkingPlan.artifact.artifactId,
      roadmap.opportunityDecision.artifact.artifactId,
      ...roadmap.items.map((item) => item.initiativeId)
    ]);

    return immutableRecord({
      artifactKind: "ApplicationPlan" as const,
      planId,
      roadmapId: roadmap.roadmapId,
      outcome,
      prioritizedApplicationInitiatives: roadmap.items,
      rationale: immutableArray([
        roadmap.careerStrategy.profile,
        roadmap.portfolioPlan.outcome,
        roadmap.learningPlan.outcome,
        roadmap.interviewPlan.outcome,
        roadmap.networkingPlan.outcome,
        roadmap.opportunityDecision.outcome
      ]),
      recommendations,
      expectedApplicationOutcomes: immutableArray(roadmap.items.map((item) => item.expectedApplicationOutcome)),
      confidenceFactors: confidenceFactors(confidenceScore, roadmap.items.length),
      evidenceReferences,
      assumptions: roadmap.assumptions,
      constraints: roadmap.constraints,
      milestones: immutableArray(roadmap.items.map((item) => item.milestone)),
      decisionTrace: roadmap.traceId,
      artifact: applicationPlanArtifact(planId, outcome, confidenceScore),
      explanationSummary: createApplicationPlannerExplanationSummary({
        decisionId: planId,
        title: "Application Plan",
        outcome,
        confidenceScore,
        evidenceReferenceIds: evidenceReferences,
        reasonCodes: [outcome, ...roadmap.items.map((item) => item.initiativeId)],
        assumptions: roadmap.assumptions,
        constraints: roadmap.constraints.map((constraint) => constraint.label),
        tradeOffs: immutableArray(["application readiness acceleration is balanced against foundation-building confidence"])
      })
    });
  }
}

function applicationPlanArtifact(planId: string, outcome: string, score: number): CareerArtifact {
  return immutableRecord({
    artifactId: `artifact:${planId}`,
    artifactType: "CareerReport",
    metadata: immutableRecord({
      artifactId: `artifact:${planId}`,
      artifactType: "CareerReport",
      title: "Application Plan",
      createdAt: "1970-01-01T00:00:00.000Z",
      source: "application-planner",
      version: 1,
      references: immutableArray([])
    }),
    summary: immutableRecord({
      headline: outcome,
      summary: `Application plan confidence ${score}.`,
      references: immutableArray([])
    }),
    sections: immutableArray([])
  });
}
