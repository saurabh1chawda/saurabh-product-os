import { createApplicationPlannerExplanationSummary } from "../explainability";
import type { ApplicationEvaluation, ApplicationRoadmap, ApplicationRoadmapItem } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord } from "../shared";

export class ApplicationRoadmapAnalyzer {
  analyze(evaluation: ApplicationEvaluation): ApplicationRoadmap {
    const ordered = [...evaluation.evaluations].sort((a, b) => b.scoreBreakdown.overallScore - a.scoreBreakdown.overallScore || a.initiativeId.localeCompare(b.initiativeId));
    const items = immutableArray(ordered.map((item, index): ApplicationRoadmapItem => immutableRecord({
      roadmapItemId: `application-roadmap-item:${index + 1}:${item.initiativeId}`,
      initiativeId: item.initiativeId,
      sequence: index + 1,
      dependencyIds: immutableArray(index === 0 ? [] : [ordered[index - 1]?.initiativeId ?? ""]),
      milestone: `${item.kind} application milestone`,
      completionCriteria: immutableArray([
        `${item.kind} produces observable application planning evidence.`,
        "Application outcome is explainable and traceable."
      ]),
      priority: item.priority,
      expectedApplicationOutcome: `${item.kind} improves application readiness.`,
      confidence: item.confidence
    })));
    const roadmapId = `application-roadmap:${evaluation.evaluationId}`;
    const confidenceScore = Math.round(ordered.reduce((sum, item) => sum + item.scoreBreakdown.overallScore, 0) / Math.max(1, ordered.length));

    return immutableRecord({
      artifactKind: "ApplicationRoadmap" as const,
      roadmapId,
      evaluationId: evaluation.evaluationId,
      careerStrategy: evaluation.careerStrategy,
      portfolioPlan: evaluation.portfolioPlan,
      learningPlan: evaluation.learningPlan,
      interviewPlan: evaluation.interviewPlan,
      networkingPlan: evaluation.networkingPlan,
      opportunityDecision: evaluation.opportunityDecision,
      items,
      policy: evaluation.policy,
      preferences: evaluation.preferences,
      assumptions: evaluation.assumptions,
      constraints: evaluation.constraints,
      traceId: evaluation.traceId,
      confidence: confidenceFromScore(confidenceScore, "ApplicationRoadmap confidence follows deterministic application sequencing."),
      explanationSummary: createApplicationPlannerExplanationSummary({
        decisionId: roadmapId,
        title: "Application Roadmap",
        outcome: "RoadmapSequenced",
        confidenceScore,
        evidenceReferenceIds: [evaluation.careerStrategy.artifact.artifactId, evaluation.portfolioPlan.artifact.artifactId, evaluation.learningPlan.artifact.artifactId, evaluation.interviewPlan.artifact.artifactId, evaluation.networkingPlan.artifact.artifactId],
        reasonCodes: items.map((item) => item.initiativeId),
        assumptions: evaluation.assumptions,
        constraints: evaluation.constraints.map((constraint) => constraint.label),
        tradeOffs: immutableArray(["highest application value is balanced against dependency order"])
      })
    });
  }
}
