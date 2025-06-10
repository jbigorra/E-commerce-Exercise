import { Constraint } from "../Entities";
import { Result } from "../Result";
import { ConstraintContext } from "./ConstraintContext";
import { IncompatibleConstraintHandler } from "./IncompatibleConstraintHandler";
import { ConstraintStrategy } from "./Interfaces";
import { PriceConstraintHandler } from "./PriceConstraintHandler";

class DefaultConstraintHandler implements ConstraintStrategy {
  canHandle(constraint: Constraint): boolean {
    return true;
  }

  apply(constraint: Constraint, context: ConstraintContext): Result<void> {
    return Result.error(
      new Error(`No handler for constraint type: ${constraint.type}`)
    );
  }
}

export class ConstraintEngine {
  private readonly defaultHandler: ConstraintStrategy =
    new DefaultConstraintHandler();

  constructor(
    private readonly handlers: ConstraintStrategy[] = [
      new IncompatibleConstraintHandler(),
      new PriceConstraintHandler(),
    ]
  ) {}

  applyConstraints(
    constraints: Constraint[],
    context: ConstraintContext
  ): Result<void> {
    for (const constraint of constraints) {
      const handler =
        this.handlers.find((h) => h.canHandle(constraint)) ??
        this.defaultHandler;

      const result = handler.apply(constraint, context);

      if (result.isError()) return result;
    }

    return Result.success(undefined);
  }
}
