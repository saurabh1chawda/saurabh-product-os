import type { DecisionContext } from "../context";
import type { Pipeline } from "../contracts";
import {
  CompetencyAnalysisStep,
  EvidenceSelectionStep,
  IdentitySelectionStep,
  MetricAnalysisStep,
  PortfolioRecommendationStep,
  ResumeRecommendationStep,
  StoryRecommendationStep
} from "../steps";
import { SequentialPipelineBuilder } from "../pipeline";

export const IdentitySelectionPipeline = SequentialPipelineBuilder.create()
  .addStep(new IdentitySelectionStep())
  .build("IdentitySelectionPipeline", (_context, stepResults) => Object.freeze({ identities: stepResults[0]?.output }));

export const CompetencyAnalysisPipeline = SequentialPipelineBuilder.create()
  .addStep(new CompetencyAnalysisStep())
  .build("CompetencyAnalysisPipeline", (_context, stepResults) => Object.freeze({ competencies: stepResults[0]?.output }));

export const EvidenceSelectionPipeline = SequentialPipelineBuilder.create()
  .addStep(new EvidenceSelectionStep())
  .build("EvidenceSelectionPipeline", (_context, stepResults) => Object.freeze({ evidence: stepResults[0]?.output }));

export const StoryRecommendationPipeline = SequentialPipelineBuilder.create()
  .addStep(new StoryRecommendationStep())
  .build("StoryRecommendationPipeline", (_context, stepResults) => Object.freeze({ stories: stepResults[0]?.output }));

export const ResumeRecommendationPipeline = SequentialPipelineBuilder.create()
  .addStep(new EvidenceSelectionStep())
  .addStep(new CompetencyAnalysisStep())
  .addStep(new ResumeRecommendationStep())
  .build("ResumeRecommendationPipeline", (_context, stepResults) =>
    Object.freeze({
      evidence: stepResults[0]?.output,
      competencies: stepResults[1]?.output,
      resume: stepResults[2]?.output
    })
  );

export const PortfolioRecommendationPipeline = SequentialPipelineBuilder.create()
  .addStep(new StoryRecommendationStep())
  .addStep(new EvidenceSelectionStep())
  .addStep(new PortfolioRecommendationStep())
  .build("PortfolioRecommendationPipeline", (_context, stepResults) =>
    Object.freeze({
      stories: stepResults[0]?.output,
      evidence: stepResults[1]?.output,
      portfolio: stepResults[2]?.output
    })
  );

export const MetricRecommendationPipeline = SequentialPipelineBuilder.create()
  .addStep(new MetricAnalysisStep())
  .build("MetricRecommendationPipeline", (_context, stepResults) => Object.freeze({ metrics: stepResults[0]?.output }));

export function executePipeline<TOutput>(pipeline: Pipeline<TOutput>, context: DecisionContext) {
  return pipeline.execute(context);
}
