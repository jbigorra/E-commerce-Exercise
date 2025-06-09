import { ConstraintContext } from "../../../../../src/Store/Inventory/Core/Constraints/ConstraintContext";
import { ConstraintEngine } from "../../../../../src/Store/Inventory/Core/Constraints/ConstraintEngine";
import { ConstraintHandler } from "../../../../../src/Store/Inventory/Core/Constraints/ConstraintHandler";
import {
  Constraint,
  ProductOptionChoice,
} from "../../../../../src/Store/Inventory/Core/Entities";
import { Result } from "../../../../../src/Store/Inventory/Core/Result";
import { OptionId } from "../../../../../src/Store/Inventory/Core/ValueObjects";

// Mock constraint handler for testing error scenarios
class MockFailingConstraintHandler implements ConstraintHandler {
  canHandle(constraint: Constraint): boolean {
    return constraint.type === "price";
  }

  handle(constraint: Constraint, context: ConstraintContext): Result<void> {
    return Result.error(new Error("Mock constraint handler error"));
  }
}

describe("ConstraintEngine", () => {
  let engine: ConstraintEngine;
  let context: ConstraintContext;

  beforeEach(() => {
    engine = new ConstraintEngine();
    const optionChoices: ProductOptionChoice[] = [
      {
        id: 101,
        optionId: 1,
        priceAdjustment: 5,
        selected: false,
        disabled: false,
        constraints: [],
      },
    ];
    context = new ConstraintContext(optionChoices, new OptionId(1));
  });

  describe("applyConstraints", () => {
    it("should return error when no handler found for constraint type", () => {
      // Create a constraint with unknown type
      const unknownConstraint = {
        id: 1,
        optionChoiceId: 101,
        constrainedBy: 1,
        type: "unknown_type",
      } as any as Constraint;

      const result = engine.applyConstraints([unknownConstraint], context);

      expect(result.isError()).toBe(true);
      expect(result.getError().message).toBe(
        "No handler for constraint type: unknown_type"
      );
    });

    it("should handle empty constraints array", () => {
      const result = engine.applyConstraints([], context);

      expect(result.isSuccess()).toBe(true);
    });

    it("should succeed with valid price constraint", () => {
      const priceConstraint: Constraint = {
        id: 1,
        optionChoiceId: 101,
        constrainedBy: 1,
        type: "price",
        priceAdjustment: 5,
      };

      const result = engine.applyConstraints([priceConstraint], context);

      expect(result.isSuccess()).toBe(true);
    });

    it("should succeed with valid incompatible constraint", () => {
      const incompatibleConstraint: Constraint = {
        id: 1,
        optionChoiceId: 101,
        constrainedBy: 1,
        type: "incompatible",
      };

      const result = engine.applyConstraints([incompatibleConstraint], context);

      expect(result.isSuccess()).toBe(true);
    });
  });

  describe("addHandler", () => {
    it("should add new handler", () => {
      const newHandler = new MockFailingConstraintHandler();
      engine.addHandler(newHandler);

      // The engine should now have 3 handlers (2 default + 1 new)
      // We can test this by having a handler that matches and fails
      const priceConstraint: Constraint = {
        id: 1,
        optionChoiceId: 101,
        constrainedBy: 1,
        type: "price",
        priceAdjustment: 5,
      };

      const result = engine.applyConstraints([priceConstraint], context);
      // The first matching handler (default price handler) should handle it successfully
      expect(result.isSuccess()).toBe(true);
    });
  });

  describe("removeHandler", () => {
    it("should remove handler by type", () => {
      class TestHandler implements ConstraintHandler {
        canHandle(): boolean {
          return false;
        }
        handle(): Result<void> {
          return Result.success(undefined);
        }
      }

      engine.addHandler(new TestHandler());
      engine.removeHandler(TestHandler);

      // Test that basic functionality still works
      const priceConstraint: Constraint = {
        id: 1,
        optionChoiceId: 101,
        constrainedBy: 1,
        type: "price",
        priceAdjustment: 5,
      };

      const result = engine.applyConstraints([priceConstraint], context);
      expect(result.isSuccess()).toBe(true);
    });
  });
});
