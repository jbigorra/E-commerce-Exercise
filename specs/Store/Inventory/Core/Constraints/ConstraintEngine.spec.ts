import { ConstraintContext } from "../../../../../src/Store/Inventory/Core/Constraints/ConstraintContext";
import { ConstraintEngine } from "../../../../../src/Store/Inventory/Core/Constraints/ConstraintEngine";
import {
  Constraint,
  IncompatibleConstraint,
  PriceConstraint,
  ProductOptionChoice,
} from "../../../../../src/Store/Inventory/Core/Entities";
import { OptionId } from "../../../../../src/Store/Inventory/Core/ValueObjects";

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
      const priceConstraint: PriceConstraint = {
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
      const incompatibleConstraint: IncompatibleConstraint = {
        id: 1,
        optionChoiceId: 101,
        constrainedBy: 1,
        type: "incompatible",
      };

      const result = engine.applyConstraints([incompatibleConstraint], context);

      expect(result.isSuccess()).toBe(true);
    });
  });
});
