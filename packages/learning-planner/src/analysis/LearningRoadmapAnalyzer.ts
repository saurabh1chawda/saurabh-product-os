import { createLearningPlannerExplanationSummary } from "../explainability";
import type { LearningEvaluation, LearningRoadmap, LearningRoadmapItem } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord } from "../shared";

export class LearningRoadmapAnalyzer {
  analyze(evaluation: LearningEvaluation): LearningRoadmap {
    const ordered = [...evaluation.evaluations].sort((a, b) => b.scoreBreakdown.overallScore - a.scoreBreakdown.overallScore || a.initiativeId.localeCompare(b.initiativeId));
    const items = immutableArray(ordered.map((item, index): LearningRoadmapItem => immutableRecord({
      roadmapItemId: `learning-roadmap-item:${index + 1}:${item.initiativeId}`,
      initiativeId: item.initiativeId,
      sequence: index + 1,
      dependencyIds: immutableArray(index === 0 ? [] : [ordered[index - 1]?.initiativeId ?? ""]),
      milestone: `${item.kind} capability milestone`,
      completionCriteria: immutableArray([
        `${item.kind} produces observable capability evidence.`,
        "Capability outcome is explainable and traceable."
      ]),
      priority: item.priority,
      expectedOutcome: `${item.kind} improves intentional capability development.`,
      confidence: item.confidence
    })));
    const roadmapId = `learning-roadmap:${evaluation.evaluationId}`;
    const confidenceScore = Math.round(ordered.reduce((sum, item) => sum + item.scoreBreakdown.overallScore, 0) / Math.max(1, ordered.length));

    return immutableRecord({
      artifactKind: "LearningRoadmap" as const,
      roadmapId,
      evaluationId: evaluation.evaluationId,
      careerStrategy: evaluation.careerStrategy,
      portfolioPlan: evaluation.portfolioPlan,
      opportunityDecision: evaluation.opportunityDecision,
      items,
      policy: evaluation.policy,
      preferences: evaluation.preferences,
      assumptions: evaluation.assumptions,
      constraints: evaluation.constraints,
      traceId: evaluation.traceId,
      confidence: confidenceFromScore(confidenceScore, "LearningRoadmap confidence follows deterministic capability sequencing."),
      explanationSummary: createLearningPlannerExplanationSummary({
        decisionId: roadmapId,
        title: "Learning Roadmap",
        outcome: "RoadmapSequenced",
        confidenceScore,
        evidenceReferenceIds: [evaluation.careerStrategy.artifact.artifactId, evaluation.portfolioPlan.artifact.artifactId],
        reasonCodes: items.map((item) => item.initiativeId),
        tradeOffs: immutableArray(["highest capability-development value is balanced against dependency order"]),
        assumptions: evaluation.assumptions,
        constraints: evaluation.constraints.map((constraint) => constraint.label)
      })
    });
  }
}
