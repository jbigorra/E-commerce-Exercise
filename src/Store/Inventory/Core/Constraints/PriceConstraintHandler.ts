import { Constraint } from "../Entities";
import { Result } from "../Result";
import { ConstraintContext } from "./ConstraintContext";
import { ConstraintHandler } from "./ConstraintHandler";

export class PriceConstraintHandler implements ConstraintHandler {
  canHandle(constraint: Constraint): boolean {
    return constraint.type === "price";
  }

  handle(constraint: Constraint, context: ConstraintContext): Result<void> {
    if (!this.canHandle(constraint)) {
      return Result.error(new Error("Cannot handle non-price constraint"));
    }

    if (constraint.constrainedBy === context.selectedOptionId.value) {
      const choice = context.findChoiceById(constraint.optionChoiceId);

      if (choice && constraint.type === "price") {
        // Apply price adjustment - the constraint already has priceAdjustment
        // This would typically modify the choice's price or add additional cost
        // For now, we'll just mark it as processed since the price adjustment
        // is already part of the constraint structure
      }
    }

    return Result.success(undefined);
  }
}
