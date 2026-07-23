import type { DecisionContext } from "../context";
import type { Pipeline, PipelineBuilder, PipelineExecutionResult, PipelineStep } from "../contracts";
import { createDecisionResult } from "../results";
import type { DecisionResult } from "../results";
import { createRecommendationBundle } from "../shared";
import { createDecisionTrace } from "../trace";

export class SequentialPipelineBuilder<TOutput = unknown> implements PipelineBuilder<TOutput> {
  private constructor(private readonly steps: readonly PipelineStep[] = []) {}

  static create<TOutput = unknown>(): SequentialPipelineBuilder<TOutput> {
    return new SequentialPipelineBuilder<TOutput>();
  }

  addStep(step: PipelineStep): SequentialPipelineBuilder<TOutput> {
    return new SequentialPipelineBuilder<TOutput>([...this.steps, step]);
  }

  build(
    pipelineName: string,
    compose: (context: DecisionContext, stepResults: readonly PipelineExecutionResult[]) => TOutput
  ): Pipeline<TOutput> {
    return new SequentialPipeline(pipelineName, this.steps, compose);
  }
}

export class SequentialPipeline<TOutput = unknown> implements Pipeline<TOutput> {
  constructor(
    readonly pipelineName: string,
    private readonly steps: readonly PipelineStep[],
    private readonly compose: (context: DecisionContext, stepResults: readonly PipelineExecutionResult[]) => TOutput
  ) {}

  execute(context: DecisionContext): DecisionResult<TOutput> {
    const stepResults = this.steps.map((step) => step.execute(context));
    const output = this.compose(context, stepResults);
    const trace = createDecisionTrace({
      metadata: {
        ...context.metadata,
        pipelineName: this.pipelineName
      },
      stepsExecuted: stepResults.map((result) => result.traceStep),
      decisionInputs: [
        `${context.candidate.identities.length} identities`,
        `${context.candidate.competencies.length} competencies`,
        `${context.candidate.evidenceReferences.length} evidence references`,
        `${context.candidate.stories.length} stories`,
        `${context.candidate.metrics.length} metrics`
      ],
      recommendations: stepResults.map((result) => result.traceStep.outputSummary)
    });

    return createDecisionResult({
      pipelineName: this.pipelineName,
      output,
      trace,
      summary: {
        pipelineName: this.pipelineName,
        status: "completed",
        stepCount: stepResults.length,
        recommendationCount: trace.recommendations.length,
        highestScore: trace.scores[0],
        highestConfidence: trace.confidence[0]
      },
      recommendationBundle: createRecommendationBundle({})
    });
  }
}
