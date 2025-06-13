import { Constraint } from "../Entities";
import { Result } from "../Result";
import { ConstraintContext } from "./ConstraintContext";
import { IncompatibleConstraintHandler } from "./IncompatibleConstraintHandler";
import { PriorityConstraintStrategy } from "./Interfaces";
import { PriceConstraintHandler } from "./PriceConstraintHandler";

class DefaultConstraintHandler implements PriorityConstraintStrategy {
  priority: number = Number.MAX_SAFE_INTEGER;

  canHandle(constraint: Constraint): constraint is Constraint {
    return true;
  }

  apply(constraint: Constraint, context: ConstraintContext): Result<void> {
    return Result.error(
      new Error(`No handler for constraint type: ${constraint.type}`)
    );
  }
}

export class ConstraintEngine {
  readonly defaultHandler: PriorityConstraintStrategy =
    new DefaultConstraintHandler();
  private readonly sortedHandlers: PriorityConstraintStrategy<Constraint>[];

  constructor(
    readonly handlers: PriorityConstraintStrategy[] = [
      new IncompatibleConstraintHandler(),
      new PriceConstraintHandler(),
    ]
  ) {
    this.sortedHandlers = this.handlers.sort((a, b) => a.priority - b.priority);
  }

  applyConstraints(
    constraints: Constraint[],
    context: ConstraintContext
  ): Result<void> {
    for (const handler of this.sortedHandlers) {
      const applicableConstraints = constraints.filter((c) =>
        handler.canHandle(c)
      );

      for (const constraint of applicableConstraints) {
        const result = handler.apply(constraint, context);
        if (result.isError()) return result;
      }
    }

    const unhandledConstraints = constraints.filter(
      (c) => !this.sortedHandlers.some((h) => h.canHandle(c))
    );

    for (const constraint of unhandledConstraints) {
      const result = this.defaultHandler.apply(constraint, context);
      if (result.isError()) return result;
    }

    return Result.success(undefined);
  }
}
