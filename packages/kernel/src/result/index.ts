export class Result<T, E = string> {
  private constructor(
    readonly isSuccess: boolean,
    readonly value?: T,
    readonly error?: E
  ) {}

  get isFailure(): boolean {
    return !this.isSuccess;
  }

  static success<T>(value: T): Result<T, never> {
    return new Result<T, never>(true, value);
  }

  static failure<E>(error: E): Result<never, E> {
    return new Result<never, E>(false, undefined, error);
  }
}
