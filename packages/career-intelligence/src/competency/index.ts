import type { CapabilityEvidenceSnapshot, CompetencySnapshot } from "@career-companion/career-knowledge";
import {
  calculateCoverage,
  createReason,
  createRecommendation,
  idToString,
  rankRecommendations
} from "../shared";
import type { Coverage, Ranking, Recommendation, ReferenceId } from "../shared";

export interface CompetencyGap {
  readonly competencyId: ReferenceId;
  readonly reason: string;
}

export type CompetencyRecommendation = Recommendation<CompetencySnapshot>;

export class CompetencyStrengthCalculator {
  calculate(
    competency: CompetencySnapshot,
    capabilityEvidence: readonly CapabilityEvidenceSnapshot[] = []
  ): CompetencyRecommendation {
    const competencyId = idToString(competency.id);
    const directEvidenceCount = competency.evidenceReferenceIds.length + competency.achievementIds.length + competency.projectIds.length;
    const capabilityEvidenceCount = capabilityEvidence.filter((evidence) => evidence.competencyId.equals(competency.id)).length;
    const verificationWeight = competency.verificationStatus === "verified" ? 35 : 10;
    const statusWeight = competency.status === "active" ? 20 : 0;
    const evidenceWeight = Math.min((directEvidenceCount + capabilityEvidenceCount) * 10, 45);
    const reasons = [
      createReason("competency-status", `${competency.status} competency contributes to usability.`, statusWeight, [competencyId]),
      createReason("competency-verification", `${competency.verificationStatus} competency contributes to confidence.`, verificationWeight, [competencyId]),
      createReason("competency-evidence", `${directEvidenceCount + capabilityEvidenceCount} supporting references found.`, evidenceWeight, [competencyId])
    ];

    return createRecommendation({
      subject: competency,
      score: statusWeight + verificationWeight + evidenceWeight,
      confidence: competency.verificationStatus === "verified" ? 0.9 : 0.6,
      reasons,
      summary: `Competency ${competency.name} is ranked by status, verification, and supporting evidence.`
    });
  }

  rank(
    competencies: readonly CompetencySnapshot[],
    capabilityEvidence: readonly CapabilityEvidenceSnapshot[] = []
  ): readonly Ranking<CompetencySnapshot>[] {
    return rankRecommendations(competencies.map((competency) => this.calculate(competency, capabilityEvidence)));
  }
}

export class CompetencyCoverageAnalyzer {
  analyze(input: {
    readonly requiredCompetencyIds: readonly ReferenceId[];
    readonly demonstratedCompetencyIds: readonly ReferenceId[];
  }): Coverage {
    return calculateCoverage(input.demonstratedCompetencyIds, input.requiredCompetencyIds, "competency-coverage");
  }

  identifyGaps(input: {
    readonly requiredCompetencyIds: readonly ReferenceId[];
    readonly demonstratedCompetencyIds: readonly ReferenceId[];
  }): readonly CompetencyGap[] {
    const demonstrated = new Set(input.demonstratedCompetencyIds);

    return input.requiredCompetencyIds
      .filter((competencyId) => !demonstrated.has(competencyId))
      .map((competencyId) => ({
        competencyId,
        reason: "Required competency has no demonstrated supporting reference."
      }));
  }
}
