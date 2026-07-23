import type { UseCaseContext } from "../context";
import type { UseCasePolicy } from "../policies";
import type { UseCaseResult } from "../results";
import type { ValidationContract } from "../validation";

export interface UseCase<TCommand, TResult> {
  readonly useCaseName: string;
  readonly policies: readonly UseCasePolicy<TCommand>[];
  readonly validators: readonly ValidationContract<TCommand>[];
  execute(command: TCommand, context: UseCaseContext): UseCaseResult<TResult>;
}

