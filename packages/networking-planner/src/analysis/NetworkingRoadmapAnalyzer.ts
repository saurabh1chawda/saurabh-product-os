import { createNetworkingPlannerExplanationSummary } from "../explainability";
import type { NetworkingEvaluation, NetworkingRoadmap, NetworkingRoadmapItem } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord } from "../shared";

export class NetworkingRoadmapAnalyzer {
  analyze(evaluation: NetworkingEvaluation): NetworkingRoadmap {
    const ordered = [...evaluation.evaluations].sort((a, b) => b.scoreBreakdown.overallScore - a.scoreBreakdown.overallScore || a.initiativeId.localeCompare(b.initiativeId));
    const items = immutableArray(ordered.map((item, index): NetworkingRoadmapItem => immutableRecord({
      roadmapItemId: `networking-roadmap-item:${index + 1}:${item.initiativeId}`,
      initiativeId: item.initiativeId,
      sequence: index + 1,
      dependencyIds: immutableArray(index === 0 ? [] : [ordered[index - 1]?.initiativeId ?? ""]),
      milestone: `${item.kind} networking milestone`,
      completionCriteria: immutableArray([
        `${item.kind} produces observable networking planning evidence.`,
        "Networking outcome is explainable and traceable."
      ]),
      priority: item.priority,
      expectedNetworkingOutcome: `${item.kind} improves networking readiness.`,
      confidence: item.confidence
    })));
    const roadmapId = `networking-roadmap:${evaluation.evaluationId}`;
    const confidenceScore = Math.round(ordered.reduce((sum, item) => sum + item.scoreBreakdown.overallScore, 0) / Math.max(1, ordered.length));

    return immutableRecord({
      artifactKind: "NetworkingRoadmap" as const,
      roadmapId,
      evaluationId: evaluation.evaluationId,
      careerStrategy: evaluation.careerStrategy,
      portfolioPlan: evaluation.portfolioPlan,
      learningPlan: evaluation.learningPlan,
      interviewPlan: evaluation.interviewPlan,
      opportunityDecision: evaluation.opportunityDecision,
      items,
      policy: evaluation.policy,
      preferences: evaluation.preferences,
      assumptions: evaluation.assumptions,
      constraints: evaluation.constraints,
      traceId: evaluation.traceId,
      confidence: confidenceFromScore(confidenceScore, "NetworkingRoadmap confidence follows deterministic networking sequencing."),
      explanationSummary: createNetworkingPlannerExplanationSummary({
        decisionId: roadmapId,
        title: "Networking Roadmap",
        outcome: "RoadmapSequenced",
        confidenceScore,
        evidenceReferenceIds: [evaluation.careerStrategy.artifact.artifactId, evaluation.portfolioPlan.artifact.artifactId, evaluation.learningPlan.artifact.artifactId, evaluation.interviewPlan.artifact.artifactId],
        reasonCodes: items.map((item) => item.initiativeId),
        assumptions: evaluation.assumptions,
        constraints: evaluation.constraints.map((constraint) => constraint.label),
        tradeOffs: immutableArray(["highest networking value is balanced against dependency order"])
      })
    });
  }
}
