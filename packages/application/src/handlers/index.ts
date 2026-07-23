import type { UseCaseContext } from "../context";
import type { UseCaseResult } from "../results";

export interface CommandHandler<TCommand, TResult> {
  handle(command: TCommand, context: UseCaseContext): UseCaseResult<TResult>;
}

export interface QueryHandler<TQuery, TResult> {
  handle(query: TQuery, context: UseCaseContext): UseCaseResult<TResult>;
}

