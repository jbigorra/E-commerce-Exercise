import { ConstraintContext } from "../../../../../src/Store/Inventory/Core/Constraints/ConstraintContext";
import { ConstraintEngine } from "../../../../../src/Store/Inventory/Core/Constraints/ConstraintEngine";
import {
  Constraint,
  IncompatibleConstraint,
  PartChoice,
  PriceConstraint,
} from "../../../../../src/Store/Inventory/Core/Entities";
import { Result } from "../../../../../src/Store/Inventory/Core/Result";
import { MockConstraintHandler } from "./MockContraintHandler";

describe("ConstraintEngine", () => {
  let engine: ConstraintEngine;
  let context: ConstraintContext;

  beforeEach(() => {
    engine = new ConstraintEngine();
    const optionChoices: PartChoice[] = [
      {
        id: 101,
        partId: 1,
        priceAdjustment: 5,
        outOfStock: false,
        selected: false,
        disabled: false,
        constraints: [],
      },
    ];
    context = new ConstraintContext(optionChoices, 1);
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
      expect(result.getError().message).toBe("No handler for constraint type: unknown_type");
    });

    it("should handle empty constraints array", () => {
      const result = engine.applyConstraints([], context);

      expect(result.isSuccess()).toBe(true);
    });

    it("should succeed with valid price constraint", () => {
      const priceConstraint: PriceConstraint = {
        id: 1,
        optionChoiceId: 101,
        constrainedByChoiceId: 1,
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
        constrainedByChoiceId: 1,
        type: "incompatible",
      };

      const result = engine.applyConstraints([incompatibleConstraint], context);

      expect(result.isSuccess()).toBe(true);
    });
  });

  describe("Priority-based execution order", () => {
    let engine: ConstraintEngine;
    let context: ConstraintContext;

    beforeEach(() => {
      engine = new ConstraintEngine();
      const optionChoices: PartChoice[] = [
        {
          id: 101,
          partId: 1,
          priceAdjustment: 5,
          outOfStock: false,
          selected: false,
          disabled: false,
          constraints: [],
        },
      ];
      context = new ConstraintContext(optionChoices, 1);
      MockConstraintHandler.resetExecutionCounter();
    });

    it("should execute handlers in priority order (lower priority numbers first)", () => {
      const highPriorityHandler = new MockConstraintHandler(1, "High", "type_a");
      const mediumPriorityHandler = new MockConstraintHandler(5, "Medium", "type_b");
      const lowPriorityHandler = new MockConstraintHandler(10, "Low", "type_c");

      const engineWithMocks = new ConstraintEngine([lowPriorityHandler, highPriorityHandler, mediumPriorityHandler]);

      const constraints: Constraint[] = [
        {
          id: 1,
          optionChoiceId: 101,
          constrainedByChoiceId: 1,
          type: "type_c",
        } as any,
        {
          id: 2,
          optionChoiceId: 101,
          constrainedByChoiceId: 1,
          type: "type_a",
        } as any,
        {
          id: 3,
          optionChoiceId: 101,
          constrainedByChoiceId: 1,
          type: "type_b",
        } as any,
      ];

      const result = engineWithMocks.applyConstraints(constraints, context);

      expect(result.isSuccess()).toBe(true);

      expect(highPriorityHandler.executionOrder[0]).toBe(1);
      expect(mediumPriorityHandler.executionOrder[0]).toBe(2);
      expect(lowPriorityHandler.executionOrder[0]).toBe(3);
    });

    it("should execute all constraints of same priority before moving to next priority", () => {
      const handler1 = new MockConstraintHandler(1, "Handler1", "type_a");
      const handler2 = new MockConstraintHandler(1, "Handler2", "type_b");
      const handler3 = new MockConstraintHandler(5, "Handler3", "type_c");

      const engineWithMocks = new ConstraintEngine([handler3, handler1, handler2]);

      const constraints: Constraint[] = [
        {
          id: 1,
          optionChoiceId: 101,
          constrainedByChoiceId: 1,
          type: "type_a",
        } as any,
        {
          id: 2,
          optionChoiceId: 101,
          constrainedByChoiceId: 1,
          type: "type_a",
        } as any,
        {
          id: 3,
          optionChoiceId: 101,
          constrainedByChoiceId: 1,
          type: "type_b",
        } as any,
        {
          id: 4,
          optionChoiceId: 101,
          constrainedByChoiceId: 1,
          type: "type_c",
        } as any,
      ];

      const result = engineWithMocks.applyConstraints(constraints, context);

      expect(result.isSuccess()).toBe(true);

      expect(handler1.executionOrder).toEqual([1, 2]);
      expect(handler2.executionOrder).toEqual([3]);
      expect(handler3.executionOrder).toEqual([4]);
    });

    it("should handle handlers with same priority in registration order", () => {
      const handler1 = new MockConstraintHandler(5, "First", "type_a");
      const handler2 = new MockConstraintHandler(5, "Second", "type_b");
      const handler3 = new MockConstraintHandler(5, "Third", "type_c");

      const engineWithMocks = new ConstraintEngine([handler1, handler2, handler3]);

      const constraints: Constraint[] = [
        {
          id: 1,
          optionChoiceId: 101,
          constrainedByChoiceId: 1,
          type: "type_c",
        } as any,
        {
          id: 2,
          optionChoiceId: 101,
          constrainedByChoiceId: 1,
          type: "type_a",
        } as any,
        {
          id: 3,
          optionChoiceId: 101,
          constrainedByChoiceId: 1,
          type: "type_b",
        } as any,
      ];

      const result = engineWithMocks.applyConstraints(constraints, context);

      expect(result.isSuccess()).toBe(true);

      expect(handler1.executionOrder).toEqual([1]);
      expect(handler2.executionOrder).toEqual([2]);
      expect(handler3.executionOrder).toEqual([3]);
    });

    it("should verify default incompatible and price constraint handler priorities", () => {
      const incompatibleConstraint: IncompatibleConstraint = {
        id: 1,
        optionChoiceId: 101,
        constrainedByChoiceId: 1,
        type: "incompatible",
      };

      const priceConstraint: PriceConstraint = {
        id: 2,
        optionChoiceId: 101,
        constrainedByChoiceId: 1,
        type: "price",
        priceAdjustment: 10,
      };

      const result = engine.applyConstraints([priceConstraint, incompatibleConstraint], context);

      expect(result.isSuccess()).toBe(true);

      const incompatibleHandler = engine.handlers.find((h) => h.canHandle(incompatibleConstraint));
      const priceHandler = engine.handlers.find((h) => h.canHandle(priceConstraint));

      expect(incompatibleHandler).toBeDefined();
      expect(priceHandler).toBeDefined();
      expect(incompatibleHandler!.priority).toBeLessThan(priceHandler!.priority);
      expect(incompatibleHandler!.priority).toBeLessThan(engine.defaultHandler.priority);
      expect(priceHandler!.priority).toBeLessThan(engine.defaultHandler.priority);
    });

    it("should stop execution and return error when a handler fails", () => {
      const failingHandler = new MockConstraintHandler(1, "Failing", "type_fail");
      const successHandler = new MockConstraintHandler(5, "Success", "type_success");

      failingHandler.apply = () => Result.error(new Error("Handler failed"));

      const engineWithMocks = new ConstraintEngine([failingHandler, successHandler]);

      const constraints: Constraint[] = [
        {
          id: 1,
          optionChoiceId: 101,
          constrainedByChoiceId: 1,
          type: "type_fail",
        } as any,
        {
          id: 2,
          optionChoiceId: 101,
          constrainedByChoiceId: 1,
          type: "type_success",
        } as any,
      ];

      const result = engineWithMocks.applyConstraints(constraints, context);

      expect(result.isError()).toBe(true);
      expect(result.getError().message).toBe("Handler failed");

      expect(successHandler.executionOrder).toHaveLength(0);
    });
  });
});
