export type ActionResult<TResult> =
  | { result: TResult; error: undefined }
  | { result: undefined; error: Error };

export class Application {
  static success<TResult>(result: TResult): ActionResult<TResult> {
    return { result, error: undefined };
  }

  static error<TResult>(error: Error): ActionResult<TResult> {
    return { result: undefined, error };
  }
}
