import { Constraint } from "../Entities";
import { Result } from "../Result";
import { ConstraintContext } from "./ConstraintContext";
import { ConstraintStrategy } from "./Interfaces";

export class IncompatibleConstraintHandler implements ConstraintStrategy {
  canHandle(constraint: Constraint): boolean {
    return constraint.type === "incompatible";
  }

  apply(constraint: Constraint, context: ConstraintContext): Result<void> {
    if (!this.canHandle(constraint)) {
      return Result.error(
        new Error("Cannot handle non-incompatible constraint")
      );
    }

    if (constraint.constrainedBy === context.selectedOptionId.value) {
      const choice = context.findChoiceById(constraint.optionChoiceId);

      if (choice) {
        choice.disabled = true;
      }
    }

    return Result.success(undefined);
  }
}
