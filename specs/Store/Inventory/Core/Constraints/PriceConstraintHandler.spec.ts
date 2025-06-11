import { ConstraintContext } from "../../../../../src/Store/Inventory/Core/Constraints/ConstraintContext";
import { PriceConstraintHandler } from "../../../../../src/Store/Inventory/Core/Constraints/PriceConstraintHandler";
import {
  IncompatibleConstraint,
  PriceConstraint,
  ProductOptionChoice,
} from "../../../../../src/Store/Inventory/Core/Entities";
import { OptionId } from "../../../../../src/Store/Inventory/Core/ValueObjects";

describe("PriceConstraintHandler", () => {
  let handler: PriceConstraintHandler;
  let context: ConstraintContext;

  beforeEach(() => {
    handler = new PriceConstraintHandler();
    const optionChoices: ProductOptionChoice[] = [
      {
        id: 101,
        optionId: 1,
        priceAdjustment: 5,
        selected: false,
        disabled: false,
        constraints: [],
      },
      {
        id: 102,
        optionId: 2,
        priceAdjustment: 10,
        selected: false,
        disabled: false,
        constraints: [],
      },
    ];
    context = new ConstraintContext(optionChoices, new OptionId(1));
  });

  describe("canHandle", () => {
    it("should handle price constraints", () => {
      const priceConstraint: PriceConstraint = {
        id: 1,
        optionChoiceId: 101,
        constrainedBy: 1,
        type: "price",
        priceAdjustment: 5,
      };

      expect(handler.canHandle(priceConstraint)).toBe(true);
    });

    it("should not handle incompatible constraints", () => {
      const incompatibleConstraint: IncompatibleConstraint = {
        id: 1,
        optionChoiceId: 101,
        constrainedBy: 1,
        type: "incompatible",
      };

      expect(handler.canHandle(incompatibleConstraint)).toBe(false);
    });
  });

  describe("handle", () => {
    it("should successfully handle price constraint when constrainedBy matches", () => {
      const priceConstraint: PriceConstraint = {
        id: 1,
        optionChoiceId: 101,
        constrainedBy: 1,
        type: "price",
        priceAdjustment: 5,
      };

      const result = handler.apply(priceConstraint, context);

      expect(result.isSuccess()).toBe(true);
    });

    it("should handle price constraint when constrainedBy doesn't match", () => {
      const priceConstraint: PriceConstraint = {
        id: 1,
        optionChoiceId: 101,
        constrainedBy: 2, // Different from context's selectedOptionId
        type: "price",
        priceAdjustment: 5,
      };

      const result = handler.apply(priceConstraint, context);

      expect(result.isSuccess()).toBe(true);
    });

    it("should handle price constraint when choice is not found", () => {
      const priceConstraint: PriceConstraint = {
        id: 1,
        optionChoiceId: 999, // Non-existent choice
        constrainedBy: 1,
        type: "price",
        priceAdjustment: 5,
      };

      const result = handler.apply(priceConstraint, context);

      expect(result.isSuccess()).toBe(true);
    });
  });
});
