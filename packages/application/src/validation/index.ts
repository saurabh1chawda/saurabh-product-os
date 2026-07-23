import type { ExecutionContext } from "../context";
import type { ValidationSummary } from "../results";

export interface Validator<TRequest = unknown> {
  validate(request: TRequest, context: ExecutionContext): ValidationSummary;
}

export type CommandValidator<TCommand = unknown> = Validator<TCommand>;

export type QueryValidator<TQuery = unknown> = Validator<TQuery>;

export type ValidationContract<TRequest = unknown> = Validator<TRequest>;
