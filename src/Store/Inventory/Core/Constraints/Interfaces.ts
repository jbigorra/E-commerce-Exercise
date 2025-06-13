import { Constraint } from "../Entities";
import { Result } from "../Result";
import { ConstraintContext } from "./ConstraintContext";

export interface ConstraintStrategy<T extends Constraint = Constraint> {
  canHandle(constraint: Constraint): constraint is T;
  apply(constraint: T, context: ConstraintContext): Result<void>;
}

export interface PriorityConstraintStrategy<T extends Constraint = Constraint>
  extends ConstraintStrategy<T> {
  readonly priority: number;
}
