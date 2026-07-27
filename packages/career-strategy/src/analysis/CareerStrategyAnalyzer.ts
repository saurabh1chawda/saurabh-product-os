import type { CareerArtifact } from "@career-companion/career-artifacts";
import { createCareerStrategyExplanationSummary } from "../explainability";
import type { CareerStrategy, StrategyEvaluation } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord, uniqueSorted } from "../shared";
import { confidenceFactors, profileFor, recommendationPriority } from "./scoring";

export class CareerStrategyAnalyzer {
  analyze(evaluation: StrategyEvaluation): CareerStrategy {
    const ordered = [...evaluation.evaluations].sort((a, b) => b.scoreBreakdown.overallScore - a.scoreBreakdown.overallScore || a.kind.localeCompare(b.kind));
    const best = ordered[0];
    if (best === undefined) {
      throw new Error("StrategyEvaluation requires at least one evaluated strategy option.");
    }
    const profile = profileFor(best);
    const strategyId = `career-strategy:${evaluation.evaluationId}`;
    const risks = uniqueSorted(evaluation.gaps.filter((gap) => gap.severity !== "low").map((gap) => gap.gapType));
    const supportingEvidence = uniqueSorted([
      evaluation.opportunityDecision.decisionId,
      evaluation.decisionReport.reportId,
      best.optionId,
      ...evaluation.opportunityDecision.supportingEvidence
    ]);
    const partial = immutableRecord({
      artifactKind: "CareerStrategy" as const,
      strategyId,
      evaluationId: evaluation.evaluationId,
      profile,
      selectedOptionId: best.optionId,
      confidence: confidenceFromScore(best.scoreBreakdown.overallScore, "CareerStrategy confidence follows selected strategy evaluation."),
      supportingEvidence,
      assumptions: evaluation.assumptions,
      constraints: evaluation.constraints,
      risks,
      strategicMilestones: immutableArray([
        milestone("strategy-milestone:positioning", "Confirm strategic positioning", 1, profile, best.scoreBreakdown.overallScore),
        milestone("strategy-milestone:evidence", "Strengthen strategic evidence", 2, profile, Math.max(50, best.scoreBreakdown.overallScore - 5)),
        milestone("strategy-milestone:market", "Validate market direction", 3, profile, Math.max(45, best.scoreBreakdown.overallScore - 10))
      ]),
      decisionTrace: evaluation.traceId,
      scoreSummary: best.scoreBreakdown,
      recommendationPriority: recommendationPriority(best.scoreBreakdown.overallScore),
      expectedImpact: best.impact.score >= 80 ? "Significant" as const : "Moderate" as const,
      confidenceFactors: immutableArray([]),
      alternativeStrategiesConsidered: immutableArray(ordered.slice(1).map((item) => item.kind)),
      artifact: careerStrategyArtifact(strategyId, profile, best.scoreBreakdown.overallScore),
      explanationSummary: createCareerStrategyExplanationSummary({
        decisionId: strategyId,
        title: "Career Strategy",
        outcome: profile,
        confidenceScore: best.scoreBreakdown.overallScore,
        evidenceReferenceIds: [evaluation.decisionReport.artifact.artifactId, evaluation.opportunityDecision.artifact.artifactId],
        reasonCodes: uniqueSorted([profile, best.kind, ...risks]),
        assumptions: evaluation.assumptions,
        constraints: evaluation.constraints
      })
    });

    return immutableRecord({ ...partial, confidenceFactors: confidenceFactors(partial) });
  }
}

function milestone(milestoneId: string, label: string, sequence: number, target: string, confidenceScore: number) {
  return immutableRecord({
    milestoneId,
    label,
    sequence,
    target,
    confidence: confidenceFromScore(confidenceScore, `${label} confidence follows selected strategy.`)
  });
}

function careerStrategyArtifact(strategyId: string, profile: string, score: number): CareerArtifact {
  return immutableRecord({
    artifactId: `artifact:${strategyId}`,
    artifactType: "CareerReport",
    metadata: immutableRecord({
      artifactId: `artifact:${strategyId}`,
      artifactType: "CareerReport",
      title: "Career Strategy",
      createdAt: "1970-01-01T00:00:00.000Z",
      source: "career-strategy",
      version: 1,
      references: immutableArray([])
    }),
    summary: immutableRecord({
      headline: profile,
      summary: `Career strategy score ${score}.`,
      references: immutableArray([])
    }),
    sections: immutableArray([])
  });
}
