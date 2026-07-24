import { ResumeGapAnalyzer as DeterministicResumeGapAnalyzer } from "@career-companion/career-intelligence";
import type { CompetencySnapshot } from "@career-companion/career-knowledge";
import type { ResumeGap } from "../models";

export class ResumeGapAnalyzer {
  constructor(private readonly analyzer = new DeterministicResumeGapAnalyzer()) {}

  analyze(input: {
    readonly requiredCompetencyIds: readonly string[];
    readonly demonstratedCompetencies: readonly CompetencySnapshot[];
  }): readonly ResumeGap[] {
    const coverage = this.analyzer.analyze(input);

    return Object.freeze(coverage.gaps.map((competencyId, index) => Object.freeze({
      gapId: `resume-gap:${competencyId}`,
      competencyId,
      reason: `Required competency ${competencyId} is not represented in the resume evidence set.`,
      severity: index === 0 ? "high" : "medium"
    })));
  }
}
