import { Constraint } from "../../../src/Store/ProductCatalog/Core/Entities";

export class ConstraintBuilder {
  private id: number = 1;
  private optionChoiceId: number = 101;
  private constrainedByChoiceId: number = 1;
  private type: "price" | "incompatible" = "incompatible";
  private priceAdjustment?: number;

  withId(id: number): ConstraintBuilder {
    this.id = id;
    return this;
  }

  forChoice(choiceId: number): ConstraintBuilder {
    this.optionChoiceId = choiceId;
    return this;
  }

  constrainedByChoice(optionChoiceId: number): ConstraintBuilder {
    this.constrainedByChoiceId = optionChoiceId;
    return this;
  }

  asIncompatible(): ConstraintBuilder {
    this.type = "incompatible";
    this.priceAdjustment = undefined;
    return this;
  }

  asPrice(adjustment: number): ConstraintBuilder {
    this.type = "price";
    this.priceAdjustment = adjustment;
    return this;
  }

  build(): Constraint {
    const baseConstraint = {
      id: this.id,
      optionChoiceId: this.optionChoiceId,
      constrainedByChoiceId: this.constrainedByChoiceId,
      type: this.type,
    };

    if (this.type === "price" && this.priceAdjustment !== undefined) {
      return {
        ...baseConstraint,
        priceAdjustment: this.priceAdjustment,
      } as Constraint;
    } else {
      return baseConstraint as Constraint;
    }
  }
}
