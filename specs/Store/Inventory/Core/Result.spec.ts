import { Result } from "../../../../src/Store/Inventory/Core/Result";

describe("Result", () => {
  describe("Success", () => {
    it("should create success result", () => {
      const value = "test value";
      const result = Result.success(value);

      expect(result.isSuccess()).toBe(true);
      expect(result.isError()).toBe(false);
      expect(result.getValue()).toBe(value);
    });

    it("should throw error when trying to get error from success", () => {
      const result = Result.success("test");

      expect(() => result.getError()).toThrow("Success result has no error");
    });

    it("should map successfully", () => {
      const result = Result.success(5);
      const mapped = result.map((x) => x * 2);

      expect(mapped.isSuccess()).toBe(true);
      expect(mapped.getValue()).toBe(10);
    });

    it("should flatMap successfully", () => {
      const result = Result.success(5);
      const flatMapped = result.flatMap((x) => Result.success(x * 2));

      expect(flatMapped.isSuccess()).toBe(true);
      expect(flatMapped.getValue()).toBe(10);
    });

    it("should handle flatMap with error result", () => {
      const result = Result.success(5);
      const error = new Error("Test error");
      const flatMapped = result.flatMap((x) => Result.error(error));

      expect(flatMapped.isError()).toBe(true);
      expect(flatMapped.getError()).toBe(error);
    });
  });

  describe("Failure", () => {
    it("should create error result", () => {
      const error = new Error("test error");
      const result = Result.error(error);

      expect(result.isSuccess()).toBe(false);
      expect(result.isError()).toBe(true);
      expect(result.getError()).toBe(error);
    });

    it("should throw error when trying to get value from failure", () => {
      const result = Result.error(new Error("test"));

      expect(() => result.getValue()).toThrow("Failure result has no value");
    });

    it("should propagate error in map", () => {
      const error = new Error("test error");
      const result = Result.error<number>(error);
      const mapped = result.map((x) => x * 2);

      expect(mapped.isError()).toBe(true);
      expect(mapped.getError()).toBe(error);
    });

    it("should propagate error in flatMap", () => {
      const error = new Error("test error");
      const result = Result.error<number>(error);
      const flatMapped = result.flatMap((x) => Result.success(x * 2));

      expect(flatMapped.isError()).toBe(true);
      expect(flatMapped.getError()).toBe(error);
    });
  });

  describe("Chaining operations", () => {
    it("should chain successful operations", () => {
      const result = Result.success(5)
        .map((x) => x * 2)
        .flatMap((x) => Result.success(x + 1))
        .map((x) => x.toString());

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toBe("11");
    });

    it("should stop chaining on first error", () => {
      const error = new Error("Chain error");
      const result = Result.success(5)
        .map((x) => x * 2)
        .flatMap((x) => Result.error<number>(error))
        .map((x: number) => x + 1); // This should not execute

      expect(result.isError()).toBe(true);
      expect(result.getError()).toBe(error);
    });
  });
});
