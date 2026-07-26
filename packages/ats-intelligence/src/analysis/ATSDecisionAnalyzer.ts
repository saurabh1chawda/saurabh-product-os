import { ATSDecisionArtifactBuilder } from "../builders";
import type { ATSDecision, ATSScreening } from "../models";
import type { ATSDecisionOutcome, ATSReviewReason } from "../policies";
import { createATSRecommendations } from "../recommendations";
import { confidenceFromScore, immutableArray, immutableRecord, priorityFromScore, uniqueSorted } from "../shared";

export class ATSDecisionAnalyzer {
  private readonly artifactBuilder = new ATSDecisionArtifactBuilder();

  analyze(screening: ATSScreening): ATSDecision {
    const outcome = outcomeFor(screening);
    const confidenceScore = Math.round(screening.confidence.value * 100);
    const partial = immutableRecord({
      artifactKind: "ATSDecision" as const,
      decisionId: `ats-decision:${screening.screeningId}`,
      screeningId: screening.screeningId,
      outcome,
      confidence: confidenceFromScore(confidenceScore, "ATS decision confidence is carried from screening."),
      supportingEvidence: screening.supportingEvidence,
      blockingEvidence: screening.blockingEvidence,
      passedGates: immutableArray(screening.passedGates.map((gate) => gate.gateId)),
      failedGates: immutableArray(screening.failedGates.map((gate) => gate.gateId)),
      warnings: immutableArray(screening.warningGates.map((gate) => gate.label)),
      manualReviewReasons: manualReasons(screening),
      scoreSummary: screening.scoreSummary,
      matchSummary: screening.matchSummary,
      parsingSummary: screening.parsingSummary,
      screeningSummary: screening.overallScreeningStatus,
      recommendationPriority: priorityFromScore(screening.scoreSummary.overallScore),
      recommendations: createATSRecommendations(screening.evaluatedGates),
      decisionTrace: screening.decisionTrace,
      alternativeOutcomesConsidered: alternativesFor(outcome),
      constraints: uniqueSorted(screening.evaluatedGates.map((gate) => gate.label))
    });
    const built = this.artifactBuilder.build(partial);

    return immutableRecord({ ...partial, ...built });
  }
}

function outcomeFor(screening: ATSScreening): ATSDecisionOutcome {
  if (screening.failedGates.length > 0) return "Reject";
  if (screening.reviewTriggers.length > 0) return "ManualReview";
  if (screening.warningGates.length > 0) return "PassWithWarnings";
  return "Pass";
}

function manualReasons(screening: ATSScreening): readonly ATSReviewReason[] {
  return immutableArray(screening.reviewTriggers.map((gate) => {
    if (gate.gateId.includes("conflicting")) return "conflicting-evidence";
    if (gate.gateId.includes("confidence")) return "manual-policy";
    return "ambiguous-evidence";
  }));
}

function alternativesFor(outcome: ATSDecisionOutcome): readonly ATSDecisionOutcome[] {
  return immutableArray((["Pass", "PassWithWarnings", "ManualReview", "Reject"] as const).filter((item) => item !== outcome));
}
