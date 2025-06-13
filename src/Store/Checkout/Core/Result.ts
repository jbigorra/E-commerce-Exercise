export class Result<T> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value?: T,
    private readonly _error?: Error,
  ) {}

  static success<T>(value: T): Result<T> {
    return new Result<T>(true, value);
  }

  static error<T>(error: Error | string): Result<T> {
    const errorInstance = error instanceof Error ? error : new Error(error);
    return new Result<T>(false, undefined, errorInstance);
  }

  isSuccess(): boolean {
    return this._isSuccess;
  }

  isError(): boolean {
    return !this._isSuccess;
  }

  getValue(): T {
    if (!this._isSuccess) {
      throw new Error("Cannot get value from error result");
    }
    return this._value!;
  }

  getError(): Error {
    if (this._isSuccess) {
      throw new Error("Cannot get error from success result");
    }
    return this._error!;
  }

  map<U>(fn: (value: T) => U): Result<U> {
    if (this._isSuccess) {
      try {
        return Result.success(fn(this._value!));
      } catch (error) {
        return Result.error(error instanceof Error ? error : new Error(String(error)));
      }
    }
    return Result.error(this._error!);
  }

  flatMap<U>(fn: (value: T) => Result<U>): Result<U> {
    if (this._isSuccess) {
      try {
        return fn(this._value!);
      } catch (error) {
        return Result.error(error instanceof Error ? error : new Error(String(error)));
      }
    }
    return Result.error(this._error!);
  }

  mapError(fn: (error: Error) => Error): Result<T> {
    if (this._isSuccess) {
      return this;
    }
    return Result.error(fn(this._error!));
  }

  onSuccess(fn: (value: T) => void): Result<T> {
    if (this._isSuccess) {
      fn(this._value!);
    }
    return this;
  }

  onError(fn: (error: Error) => void): Result<T> {
    if (!this._isSuccess) {
      fn(this._error!);
    }
    return this;
  }
}
