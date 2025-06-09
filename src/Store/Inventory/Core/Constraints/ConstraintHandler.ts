import { Constraint } from "../Entities";
import { Result } from "../Result";
import { ConstraintContext } from "./ConstraintContext";

export interface ConstraintHandler {
  canHandle(constraint: Constraint): boolean;
  handle(constraint: Constraint, context: ConstraintContext): Result<void>;
}
