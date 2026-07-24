import type { ResumeEvidence, ResumeGap, ResumeScore } from "../models";

export class ResumeScoreCalculator {
  calculate(input: {
    readonly selectedEvidence: readonly ResumeEvidence[];
    readonly demonstratedCompetencyCount: number;
    readonly requiredCompetencyCount: number;
    readonly impactCount: number;
    readonly gaps: readonly ResumeGap[];
  }): ResumeScore {
    const evidenceScore = average(input.selectedEvidence.map((evidence) => evidence.score.value));
    const competencyScore = input.requiredCompetencyCount === 0
      ? 100
      : (input.demonstratedCompetencyCount / input.requiredCompetencyCount) * 100;
    const impactScore = Math.min(input.impactCount * 20, 100);
    const gapPenalty = Math.min(input.gaps.length * 10, 40);
    const value = clamp(Math.round((evidenceScore * 0.35) + (competencyScore * 0.35) + (impactScore * 0.2) - gapPenalty), 0, 100);

    return Object.freeze({
      value,
      evidenceScore: Math.round(evidenceScore),
      competencyScore: Math.round(clamp(competencyScore, 0, 100)),
      impactScore: Math.round(impactScore),
      gapPenalty
    });
  }
}

function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}
