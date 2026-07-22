import { Result } from "../result";

export interface GuardFailure {
  readonly argumentName: string;
  readonly message: string;
}

export class Guard {
  static isDefined<T>(
    value: T | null | undefined,
    argumentName: string
  ): Result<T, GuardFailure> {
    if (value === null || value === undefined) {
      return Result.failure({
        argumentName,
        message: `${argumentName} must be defined.`
      });
    }

    return Result.success(value);
  }

  static isNonEmptyString(
    value: string | null | undefined,
    argumentName: string
  ): Result<string, GuardFailure> {
    if (typeof value !== "string" || value.trim().length === 0) {
      return Result.failure({
        argumentName,
        message: `${argumentName} must be a non-empty string.`
      });
    }

    return Result.success(value);
  }

  static isTrue(condition: boolean, argumentName: string): Result<true, GuardFailure> {
    if (!condition) {
      return Result.failure({
        argumentName,
        message: `${argumentName} must be true.`
      });
    }

    return Result.success(true);
  }
}
