import { createInterviewPlannerExplanationSummary } from "../explainability";
import type { InterviewEvaluation, InterviewRoadmap, InterviewRoadmapItem } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord } from "../shared";

export class InterviewRoadmapAnalyzer {
  analyze(evaluation: InterviewEvaluation): InterviewRoadmap {
    const ordered = [...evaluation.evaluations].sort((a, b) => b.scoreBreakdown.overallScore - a.scoreBreakdown.overallScore || a.initiativeId.localeCompare(b.initiativeId));
    const items = immutableArray(ordered.map((item, index): InterviewRoadmapItem => immutableRecord({
      roadmapItemId: `interview-roadmap-item:${index + 1}:${item.initiativeId}`,
      initiativeId: item.initiativeId,
      sequence: index + 1,
      dependencyIds: immutableArray(index === 0 ? [] : [ordered[index - 1]?.initiativeId ?? ""]),
      milestone: `${item.kind} readiness milestone`,
      completionCriteria: immutableArray([
        `${item.kind} produces observable interview readiness evidence.`,
        "Readiness outcome is explainable and traceable."
      ]),
      priority: item.priority,
      expectedReadinessOutcome: `${item.kind} improves interview readiness.`,
      confidence: item.confidence
    })));
    const roadmapId = `interview-roadmap:${evaluation.evaluationId}`;
    const confidenceScore = Math.round(ordered.reduce((sum, item) => sum + item.scoreBreakdown.overallScore, 0) / Math.max(1, ordered.length));

    return immutableRecord({
      artifactKind: "InterviewRoadmap" as const,
      roadmapId,
      evaluationId: evaluation.evaluationId,
      careerStrategy: evaluation.careerStrategy,
      portfolioPlan: evaluation.portfolioPlan,
      learningPlan: evaluation.learningPlan,
      opportunityDecision: evaluation.opportunityDecision,
      items,
      policy: evaluation.policy,
      preferences: evaluation.preferences,
      assumptions: evaluation.assumptions,
      constraints: evaluation.constraints,
      traceId: evaluation.traceId,
      confidence: confidenceFromScore(confidenceScore, "InterviewRoadmap confidence follows deterministic readiness sequencing."),
      explanationSummary: createInterviewPlannerExplanationSummary({
        decisionId: roadmapId,
        title: "Interview Roadmap",
        outcome: "RoadmapSequenced",
        confidenceScore,
        evidenceReferenceIds: [evaluation.careerStrategy.artifact.artifactId, evaluation.portfolioPlan.artifact.artifactId, evaluation.learningPlan.artifact.artifactId],
        reasonCodes: items.map((item) => item.initiativeId),
        assumptions: evaluation.assumptions,
        constraints: evaluation.constraints.map((constraint) => constraint.label),
        tradeOffs: immutableArray(["highest readiness value is balanced against dependency order"])
      })
    });
  }
}
