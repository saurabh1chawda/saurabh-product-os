import type { DecisionContext } from "../context";
import type { DecisionResult } from "../results";
import type { DecisionTraceStep } from "../trace";

export interface PipelineExecutionResult<TOutput = unknown> {
  readonly output: TOutput;
  readonly traceStep: DecisionTraceStep;
}

export interface PipelineStep<TOutput = unknown> {
  readonly stepName: string;
  execute(context: DecisionContext): PipelineExecutionResult<TOutput>;
}

export interface Pipeline<TOutput = unknown> {
  readonly pipelineName: string;
  execute(context: DecisionContext): DecisionResult<TOutput>;
}

export interface PipelineBuilder<TOutput = unknown> {
  addStep(step: PipelineStep): PipelineBuilder<TOutput>;
  build(pipelineName: string, compose: (context: DecisionContext, stepResults: readonly PipelineExecutionResult[]) => TOutput): Pipeline<TOutput>;
}
