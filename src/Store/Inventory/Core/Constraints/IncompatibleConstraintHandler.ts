import { Constraint, IncompatibleConstraint } from "../Entities";
import { Result } from "../Result";
import { ConstraintContext } from "./ConstraintContext";
import { ConstraintStrategy } from "./Interfaces";

export class IncompatibleConstraintHandler
  implements ConstraintStrategy<IncompatibleConstraint>
{
  canHandle(constraint: Constraint): constraint is IncompatibleConstraint {
    return constraint.type === "incompatible";
  }

  apply(
    constraint: IncompatibleConstraint,
    context: ConstraintContext
  ): Result<void> {
    if (constraint.constrainedByChoiceId === context.selectedOptionId) {
      const choice = context.findChoiceById(constraint.optionChoiceId);

      if (choice) {
        choice.disabled = true;
      }
    }

    return Result.success(undefined);
  }
}
