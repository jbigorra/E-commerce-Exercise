import { Constraint } from "../Entities";
import { Result } from "../Result";
import { ConstraintContext } from "./ConstraintContext";

export interface ConstraintStrategy {
  canHandle(constraint: Constraint): boolean;
  apply(constraint: Constraint, context: ConstraintContext): Result<void>;
}
