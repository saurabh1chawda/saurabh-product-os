import { createGapClassification, createScoreDimension } from "@career-companion/product-intelligence";
import { ATSScreeningArtifactBuilder } from "../builders";
import type { ATSGateEvaluation, ATSMatching, ATSScreening } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord, uniqueSorted } from "../shared";

export class ATSScreeningAnalyzer {
  private readonly artifactBuilder = new ATSScreeningArtifactBuilder();

  analyze(matching: ATSMatching): ATSScreening {
    const policy = matching.screeningPolicy;
    const gates = immutableArray([
      gate("minimum-parsing", "hard", "Minimum parsing sufficiency", matching.confidence.value * 100 >= policy.minimumParsingConfidence ? "passed" : "failed", policy.minimumParsingConfidence, matching.confidence.value * 100, ["parse-confidence"]),
      gate("required-skills", "hard", "Required skill threshold", matching.requiredSkillCoverage.score >= policy.minimumRequiredSkillCoverage ? "passed" : "failed", policy.minimumRequiredSkillCoverage, matching.requiredSkillCoverage.score, matching.requirementMatches.filter((item) => item.requirementType === "required-skill").flatMap((item) => item.evidence)),
      gate("mandatory-requirements", "hard", "Mandatory explicit requirements", matching.missingRequiredEvidence.length === 0 ? "passed" : "failed", 0, matching.missingRequiredEvidence.length, matching.missingRequiredEvidence),
      gate("preferred-skills", "warning", "Preferred skill coverage", matching.preferredSkillCoverage.score >= 50 ? "passed" : "warning", 50, matching.preferredSkillCoverage.score, matching.requirementMatches.filter((item) => item.requirementType === "preferred-skill").flatMap((item) => item.evidence)),
      gate("evidence-coverage", "soft", "Evidence threshold", matching.evidenceExpectationCoverage.score >= policy.minimumEvidenceCoverage ? "passed" : "warning", policy.minimumEvidenceCoverage, matching.evidenceExpectationCoverage.score, ["evidence-expectations"]),
      gate("minimum-match-score", "soft", "Minimum match score", matching.scoreBreakdown.overallScore >= policy.minimumMatchScore ? "passed" : "warning", policy.minimumMatchScore, matching.scoreBreakdown.overallScore, ["score-breakdown"]),
      gate("manual-review-confidence", "manual-review", "Manual review confidence", matching.confidence.value * 100 < policy.manualReviewBelowConfidence || policy.explicitManualReview ? "manual-review" : "passed", policy.manualReviewBelowConfidence, matching.confidence.value * 100, ["confidence-policy"]),
      gate("conflicting-evidence", "manual-review", "Conflicting evidence", matching.contradictoryEvidence.length > 0 ? "manual-review" : "passed", undefined, matching.contradictoryEvidence.length, matching.contradictoryEvidence)
    ]);
    const failedGates = immutableArray(gates.filter((item) => item.result === "failed"));
    const warningGates = immutableArray(gates.filter((item) => item.result === "warning"));
    const reviewTriggers = immutableArray(gates.filter((item) => item.result === "manual-review"));
    const passedGates = immutableArray(gates.filter((item) => item.result === "passed"));
    const hardGateResult = failedGates.some((item) => item.gateType === "hard") ? "failed" as const : "passed" as const;
    const softThresholdResult = warningGates.length > 0 ? "warning" as const : "passed" as const;
    const parsingSufficiencyResult = gates.find((item) => item.gateId === "ats-gate:minimum-parsing")?.result ?? "passed";
    const requiredSkillThresholdResult = gates.find((item) => item.gateId === "ats-gate:required-skills")?.result ?? "passed";
    const evidenceThresholdResult = gates.find((item) => item.gateId === "ats-gate:evidence-coverage")?.result ?? "passed";
    const status: ATSScreening["overallScreeningStatus"] = hardGateResult === "failed" ? "blocked" : reviewTriggers.length > 0 ? "manual-review" : warningGates.length > 0 ? "warnings" : "passed";
    const confidence = confidenceFromScore(Math.round((matching.confidence.value * 100 + matching.scoreBreakdown.overallScore) / 2), "Screening confidence follows matching confidence and gate results.");
    const partial = immutableRecord({
      artifactKind: "ATSScreening" as const,
      screeningId: `ats-screening:${matching.matchingId}`,
      matchingId: matching.matchingId,
      evaluatedGates: gates,
      passedGates,
      failedGates,
      warningGates,
      reviewTriggers,
      hardGateResult,
      softThresholdResult,
      parsingSufficiencyResult,
      requiredSkillThresholdResult,
      evidenceThresholdResult,
      overallScreeningStatus: status,
      confidence,
      gaps: immutableArray([...matching.gaps, ...failedGates.map((item) => createGapClassification({ gapId: `ats-screening-gap:${item.gateId}`, gapType: item.label, severity: "high", priority: "critical", rationale: item.rationale }))]),
      supportingEvidence: uniqueSorted(passedGates.flatMap((item) => item.evidence)),
      blockingEvidence: uniqueSorted(failedGates.flatMap((item) => item.evidence.length > 0 ? item.evidence : [item.label])),
      scoreSummary: matching.scoreBreakdown,
      matchSummary: matching.scoreBreakdown.dimensions,
      parsingSummary: createScoreDimension({ dimension: "Parsing Sufficiency", score: Math.round(matching.confidence.value * 100), weight: 1, rationale: "Parsing sufficiency carried from ATSMatching confidence." }),
      screeningPolicy: policy,
      decisionTrace: matching.decisionTrace
    });
    const built = this.artifactBuilder.build(partial);

    return immutableRecord({ ...partial, ...built });
  }
}

function gate(id: string, type: ATSGateEvaluation["gateType"], label: string, result: ATSGateEvaluation["result"], threshold: number | undefined, actual: number | undefined, evidence: readonly string[]): ATSGateEvaluation {
  return immutableRecord({
    gateId: `ats-gate:${id}`,
    gateType: type,
    label,
    result,
    threshold,
    actual,
    rationale: `${label} evaluated with explicit deterministic policy.`,
    evidence: immutableArray(evidence)
  });
}
