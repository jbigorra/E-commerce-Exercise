export type ActionResult<TResult> =
  | { result: TResult; error: undefined }
  | { result: undefined; error: Error };

export class Application {
  static success<TResult>(result: TResult): ActionResult<TResult> {
    return { result, error: undefined };
  }

  static error<TResult>(error: Error): ActionResult<TResult>;
  static error<TResult>(error: string): ActionResult<TResult>;

  static error<TResult>(error: Error | string): ActionResult<TResult> {
    const errorInstance = error instanceof Error ? error : new Error(error);
    return { result: undefined, error: errorInstance };
  }
}
