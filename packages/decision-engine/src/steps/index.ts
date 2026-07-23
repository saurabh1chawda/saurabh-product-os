import {
  CompetencyStrengthCalculator,
  EvidenceRanker,
  IdentitySelector,
  MetricStrengthCalculator,
  PortfolioEvidenceSelector,
  PortfolioStorySelector,
  ResumeEvidenceSelector,
  ResumeGapAnalyzer,
  StorySelector
} from "@career-companion/career-intelligence";
import type {
  Ranking,
  Recommendation
} from "@career-companion/career-intelligence";
import type {
  CompetencySnapshot,
  EvidenceReferenceSnapshot,
  MetricSnapshot,
  ProfessionalIdentitySnapshot,
  StorySnapshot
} from "@career-companion/career-knowledge";
import type { DecisionContext } from "../context";
import type { PipelineExecutionResult, PipelineStep } from "../contracts";
import { createTraceStep } from "../trace";

export class IdentitySelectionStep implements PipelineStep<readonly Ranking<ProfessionalIdentitySnapshot>[]> {
  readonly stepName = "IdentitySelectionStep";
  private readonly selector = new IdentitySelector();

  execute(context: DecisionContext): PipelineExecutionResult<readonly Ranking<ProfessionalIdentitySnapshot>[]> {
    const output = this.selector.select(context.candidate.identities);
    return {
      output,
      traceStep: createTraceStep({
        stepName: this.stepName,
        inputSummary: `${context.candidate.identities.length} identities evaluated.`,
        outputSummary: `${output.length} identity recommendations ranked.`,
        score: output[0]?.score,
        confidence: output[0]?.confidence,
        reasons: output.flatMap((ranking) => ranking.reasons)
      })
    };
  }
}

export class CompetencyAnalysisStep implements PipelineStep<readonly Recommendation<CompetencySnapshot>[]> {
  readonly stepName = "CompetencyAnalysisStep";
  private readonly calculator = new CompetencyStrengthCalculator();

  execute(context: DecisionContext): PipelineExecutionResult<readonly Recommendation<CompetencySnapshot>[]> {
    const output = context.candidate.competencies.map((competency) =>
      this.calculator.calculate(competency, context.candidate.capabilityEvidence)
    );
    return {
      output,
      traceStep: createTraceStep({
        stepName: this.stepName,
        inputSummary: `${context.candidate.competencies.length} competencies analyzed.`,
        outputSummary: `${output.length} competency recommendations created.`,
        score: output[0]?.score,
        confidence: output[0]?.confidence,
        reasons: output.flatMap((recommendation) => recommendation.reasons)
      })
    };
  }
}

export class EvidenceSelectionStep implements PipelineStep<readonly Ranking<EvidenceReferenceSnapshot>[]> {
  readonly stepName = "EvidenceSelectionStep";
  private readonly ranker = new EvidenceRanker();

  execute(context: DecisionContext): PipelineExecutionResult<readonly Ranking<EvidenceReferenceSnapshot>[]> {
    const output = this.ranker.rank(context.candidate.evidenceReferences);
    return {
      output,
      traceStep: createTraceStep({
        stepName: this.stepName,
        inputSummary: `${context.candidate.evidenceReferences.length} evidence references ranked.`,
        outputSummary: `${output.length} evidence recommendations ranked.`,
        score: output[0]?.score,
        confidence: output[0]?.confidence,
        reasons: output.flatMap((ranking) => ranking.reasons)
      })
    };
  }
}

export class StoryRecommendationStep implements PipelineStep<readonly Ranking<StorySnapshot>[]> {
  readonly stepName = "StoryRecommendationStep";
  private readonly selector = new StorySelector();

  execute(context: DecisionContext): PipelineExecutionResult<readonly Ranking<StorySnapshot>[]> {
    const output = this.selector.select(context.candidate.stories, context.criteria.limit);
    return {
      output,
      traceStep: createTraceStep({
        stepName: this.stepName,
        inputSummary: `${context.candidate.stories.length} stories evaluated.`,
        outputSummary: `${output.length} story recommendations ranked.`,
        score: output[0]?.score,
        confidence: output[0]?.confidence,
        reasons: output.flatMap((ranking) => ranking.reasons)
      })
    };
  }
}

export class MetricAnalysisStep implements PipelineStep<readonly Ranking<MetricSnapshot>[]> {
  readonly stepName = "MetricAnalysisStep";
  private readonly calculator = new MetricStrengthCalculator();

  execute(context: DecisionContext): PipelineExecutionResult<readonly Ranking<MetricSnapshot>[]> {
    const output = this.calculator.rank(context.candidate.metrics);
    return {
      output,
      traceStep: createTraceStep({
        stepName: this.stepName,
        inputSummary: `${context.candidate.metrics.length} metrics evaluated.`,
        outputSummary: `${output.length} metric recommendations ranked.`,
        score: output[0]?.score,
        confidence: output[0]?.confidence,
        reasons: output.flatMap((ranking) => ranking.reasons)
      })
    };
  }
}

export class ResumeRecommendationStep implements PipelineStep<{
  readonly evidence: readonly Ranking<EvidenceReferenceSnapshot>[];
  readonly gaps: ReturnType<ResumeGapAnalyzer["analyze"]>;
}> {
  readonly stepName = "ResumeRecommendationStep";
  private readonly evidenceSelector = new ResumeEvidenceSelector();
  private readonly gapAnalyzer = new ResumeGapAnalyzer();

  execute(context: DecisionContext): PipelineExecutionResult<{
    readonly evidence: readonly Ranking<EvidenceReferenceSnapshot>[];
    readonly gaps: ReturnType<ResumeGapAnalyzer["analyze"]>;
  }> {
    const evidence = this.evidenceSelector.selectEvidence(context.candidate.evidenceReferences, context.criteria.limit);
    const gaps = this.gapAnalyzer.analyze({
      requiredCompetencyIds: context.target.requiredCompetencyIds,
      demonstratedCompetencies: context.candidate.competencies
    });
    return {
      output: Object.freeze({ evidence, gaps }),
      traceStep: createTraceStep({
        stepName: this.stepName,
        inputSummary: `${context.target.requiredCompetencyIds.length} required competencies checked.`,
        outputSummary: `${evidence.length} resume evidence recommendations with ${gaps.gaps.length} gaps.`,
        score: evidence[0]?.score,
        confidence: evidence[0]?.confidence,
        reasons: [...evidence.flatMap((ranking) => ranking.reasons), ...gaps.reasons]
      })
    };
  }
}

export class PortfolioRecommendationStep implements PipelineStep<{
  readonly stories: readonly Ranking<StorySnapshot>[];
  readonly evidence: readonly Ranking<EvidenceReferenceSnapshot>[];
}> {
  readonly stepName = "PortfolioRecommendationStep";
  private readonly storySelector = new PortfolioStorySelector();
  private readonly evidenceSelector = new PortfolioEvidenceSelector();

  execute(context: DecisionContext): PipelineExecutionResult<{
    readonly stories: readonly Ranking<StorySnapshot>[];
    readonly evidence: readonly Ranking<EvidenceReferenceSnapshot>[];
  }> {
    const stories = this.storySelector.select(context.candidate.stories, context.criteria.limit);
    const evidence = this.evidenceSelector.select(context.candidate.evidenceReferences, context.criteria.limit);
    return {
      output: Object.freeze({ stories, evidence }),
      traceStep: createTraceStep({
        stepName: this.stepName,
        inputSummary: `${context.candidate.stories.length} stories and ${context.candidate.evidenceReferences.length} evidence references evaluated.`,
        outputSummary: `${stories.length} stories and ${evidence.length} evidence references ranked for portfolio use.`,
        score: stories[0]?.score ?? evidence[0]?.score,
        confidence: stories[0]?.confidence ?? evidence[0]?.confidence,
        reasons: [...stories.flatMap((ranking) => ranking.reasons), ...evidence.flatMap((ranking) => ranking.reasons)]
      })
    };
  }
}
