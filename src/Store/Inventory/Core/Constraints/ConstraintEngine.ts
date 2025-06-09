import { Constraint } from "../Entities";
import { Result } from "../Result";
import { ConstraintContext } from "./ConstraintContext";
import { ConstraintHandler } from "./ConstraintHandler";
import { IncompatibleConstraintHandler } from "./IncompatibleConstraintHandler";
import { PriceConstraintHandler } from "./PriceConstraintHandler";

export class ConstraintEngine {
  private handlers: ConstraintHandler[] = [
    new IncompatibleConstraintHandler(),
    new PriceConstraintHandler(),
  ];

  applyConstraints(
    constraints: Constraint[],
    context: ConstraintContext
  ): Result<void> {
    for (const constraint of constraints) {
      const handler = this.handlers.find((h) => h.canHandle(constraint));
      if (!handler) {
        return Result.error(
          new Error(`No handler for constraint type: ${constraint.type}`)
        );
      }

      const result = handler.handle(constraint, context);
      if (result.isError()) return result;
    }

    return Result.success(undefined);
  }

  addHandler(handler: ConstraintHandler): void {
    this.handlers.push(handler);
  }

  removeHandler(handlerType: new () => ConstraintHandler): void {
    this.handlers = this.handlers.filter((h) => !(h instanceof handlerType));
  }
}
