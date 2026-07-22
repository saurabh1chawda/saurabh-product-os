import type { CompetencySnapshot, EvidenceReferenceSnapshot } from "@career-companion/career-knowledge";
import { CompetencyCoverageAnalyzer } from "../competency";
import { EvidenceRanker } from "../evidence";
import { createRecommendation, idToString } from "../shared";
import type { Coverage, Ranking, Recommendation, ReferenceId } from "../shared";

export interface ResumeCompetencyCoverage extends Coverage {
  readonly gaps: readonly ReferenceId[];
}

export type ResumeRecommendation = Recommendation<{
  readonly recommendedEvidenceIds: readonly ReferenceId[];
  readonly competencyCoverage: ResumeCompetencyCoverage;
}>;

export class ResumeEvidenceSelector {
  constructor(private readonly evidenceRanker: EvidenceRanker = new EvidenceRanker()) {}

  selectEvidence(
    evidenceReferences: readonly EvidenceReferenceSnapshot[],
    limit = evidenceReferences.length
  ): readonly Ranking<EvidenceReferenceSnapshot>[] {
    return this.evidenceRanker.rank(evidenceReferences).slice(0, limit);
  }
}

export class ResumeGapAnalyzer {
  private readonly analyzer = new CompetencyCoverageAnalyzer();

  analyze(input: {
    readonly requiredCompetencyIds: readonly ReferenceId[];
    readonly demonstratedCompetencies: readonly CompetencySnapshot[];
  }): ResumeCompetencyCoverage {
    const demonstratedCompetencyIds = input.demonstratedCompetencies.map((competency) => idToString(competency.id));
    const coverage = this.analyzer.analyze({
      requiredCompetencyIds: input.requiredCompetencyIds,
      demonstratedCompetencyIds
    });

    return {
      ...coverage,
      gaps: this.analyzer.identifyGaps({
        requiredCompetencyIds: input.requiredCompetencyIds,
        demonstratedCompetencyIds
      }).map((gap) => gap.competencyId)
    };
  }
}

export function createResumeRecommendation(input: {
  readonly evidenceReferences: readonly EvidenceReferenceSnapshot[];
  readonly coverage: ResumeCompetencyCoverage;
}): ResumeRecommendation {
  const recommendedEvidenceIds = input.evidenceReferences.map((evidence) => idToString(evidence.id));

  return createRecommendation({
    subject: {
      recommendedEvidenceIds,
      competencyCoverage: input.coverage
    },
    score: input.coverage.ratio * 100,
    confidence: input.coverage.ratio,
    reasons: input.coverage.reasons,
    supportingReferenceIds: recommendedEvidenceIds,
    summary: "Resume support is recommended from verified evidence and competency coverage."
  });
}
