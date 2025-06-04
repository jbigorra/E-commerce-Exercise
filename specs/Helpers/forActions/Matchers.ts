import { expect } from "@jest/globals";
import { ActionResult } from "../../../src/Store/Inventory/ViewProduct";

type Matcher<T = unknown> = T | ((actual: T) => void);

export function expectSuccess<TResult>(
  obj: ActionResult<TResult>,
  expectedProps?: Record<string, Matcher>
): asserts obj is { result: TResult; error: undefined } {
  expect(obj.error).toBeUndefined();
  expect(obj.result).toBeDefined();

  if (expectedProps) {
    for (const [key, matcher] of Object.entries(expectedProps)) {
      const actual = (obj.result as TResult)[key as keyof TResult];
      expect(actual).toBeDefined();
      if (typeof matcher === "function") {
        matcher(actual);
      } else {
        expect(actual).toEqual(matcher);
      }
    }
  }
}

export function expectError<TResult>(
  obj: ActionResult<TResult>,
  expectedMessage?: string
): asserts obj is { result: undefined; error: Error } {
  expect(obj.error).toBeDefined();
  expect(obj.error).toBeInstanceOf(Error);
  expect(obj.result).toBeUndefined();

  if (expectedMessage) {
    expect(obj.error!.message).toBe(expectedMessage);
  }
}
