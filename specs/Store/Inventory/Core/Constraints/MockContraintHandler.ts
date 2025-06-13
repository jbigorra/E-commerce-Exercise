import { ConstraintContext } from "../../../../../src/Store/Inventory/Core/Constraints/ConstraintContext";
import { PriorityConstraintStrategy } from "../../../../../src/Store/Inventory/Core/Constraints/Interfaces";
import { Constraint } from "../../../../../src/Store/Inventory/Core/Entities";
import { Result } from "../../../../../src/Store/Inventory/Core/Result";

export class MockConstraintHandler implements PriorityConstraintStrategy {
  public executionOrder: number[] = [];
  private static globalExecutionCounter = 0;

  constructor(
    public readonly priority: number,
    public readonly handlerName: string,
    public readonly constraintType: string
  ) {}

  canHandle(constraint: Constraint): constraint is Constraint {
    return constraint.type === this.constraintType;
  }

  apply(constraint: Constraint, context: ConstraintContext): Result<void> {
    // Record execution order
    this.executionOrder.push(++MockConstraintHandler.globalExecutionCounter);
    return Result.success(undefined);
  }

  static resetExecutionCounter() {
    MockConstraintHandler.globalExecutionCounter = 0;
  }
}
