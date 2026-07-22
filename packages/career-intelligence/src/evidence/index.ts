import type { EvidenceReferenceSnapshot } from "@career-companion/career-knowledge";
import {
  createReason,
  createRecommendation,
  idToString,
  rankRecommendations
} from "../shared";
import type { Coverage, Ranking, Recommendation } from "../shared";

export interface EvidenceCoverage extends Coverage {
  readonly verifiedEvidenceCount: number;
  readonly primaryEvidenceCount: number;
}

export type EvidenceRecommendation = Recommendation<EvidenceReferenceSnapshot>;

export class EvidenceStrengthCalculator {
  calculate(evidence: EvidenceReferenceSnapshot): EvidenceRecommendation {
    const evidenceId = idToString(evidence.id);
    const reasons = [
      createReason("evidence-strength", `${evidence.strength} evidence contributes to confidence.`, strengthWeight(evidence.strength), [evidenceId]),
      createReason(
        "verification-status",
        `${evidence.verificationStatus} evidence receives deterministic verification weighting.`,
        verificationWeight(evidence.verificationStatus),
        [evidenceId]
      )
    ];

    return createRecommendation({
      subject: evidence,
      score: strengthWeight(evidence.strength) + verificationWeight(evidence.verificationStatus),
      confidence: evidence.verificationStatus === "verified" ? 0.95 : 0.55,
      reasons,
      summary: `Evidence ${evidence.title} has deterministic support score.`
    });
  }
}

export class EvidenceRanker {
  constructor(private readonly calculator: EvidenceStrengthCalculator = new EvidenceStrengthCalculator()) {}

  rank(evidenceReferences: readonly EvidenceReferenceSnapshot[]): readonly Ranking<EvidenceReferenceSnapshot>[] {
    return rankRecommendations(evidenceReferences.map((evidence) => this.calculator.calculate(evidence)));
  }
}

export function calculateEvidenceCoverage(evidenceReferences: readonly EvidenceReferenceSnapshot[]): EvidenceCoverage {
  const verifiedEvidenceCount = evidenceReferences.filter((evidence) => evidence.verificationStatus === "verified").length;
  const primaryEvidenceCount = evidenceReferences.filter((evidence) => evidence.strength === "primary").length;

  return {
    present: evidenceReferences.length,
    required: evidenceReferences.length,
    missing: 0,
    ratio: evidenceReferences.length === 0 ? 0 : verifiedEvidenceCount / evidenceReferences.length,
    verifiedEvidenceCount,
    primaryEvidenceCount,
    reasons: [
      createReason("evidence-coverage", `${verifiedEvidenceCount} verified evidence references are available.`, verifiedEvidenceCount)
    ]
  };
}

function strengthWeight(strength: EvidenceReferenceSnapshot["strength"]): number {
  if (strength === "primary") {
    return 45;
  }

  if (strength === "supporting") {
    return 30;
  }

  return 15;
}

function verificationWeight(status: EvidenceReferenceSnapshot["verificationStatus"]): number {
  if (status === "verified") {
    return 45;
  }

  if (status === "candidate") {
    return 25;
  }

  if (status === "rejected") {
    return 0;
  }

  return 10;
}
