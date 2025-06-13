import { Constraint, PriceConstraint } from "../Entities";
import { Result } from "../Result";
import { ConstraintContext } from "./ConstraintContext";
import { ConstraintStrategy } from "./Interfaces";

export class PriceConstraintHandler
  implements ConstraintStrategy<PriceConstraint>
{
  canHandle(constraint: Constraint): constraint is PriceConstraint {
    return constraint.type === "price";
  }

  apply(constraint: PriceConstraint, context: ConstraintContext): Result<void> {
    if (constraint.constrainedByChoiceId === context.selectedOptionId) {
      const choice = context.findChoiceById(constraint.optionChoiceId);

      if (choice) {
        // Apply price adjustment - the constraint already has priceAdjustment
        // This would typically modify the choice's price or add additional cost
        // For now, we'll just mark it as processed since the price adjustment
        // is already part of the constraint structure
      }
    }

    return Result.success(undefined);
  }
}
