import { Constraint, PartChoice } from "../../../src/Store/Inventory/Core/Entities";

export class ProductOptionChoiceBuilder {
  private id: number = 101;
  private optionId: number = 1;
  private priceAdjustment: number = 0;
  private isSelected: boolean = false;
  private isDisabled: boolean = false;
  private isOutOfStock: boolean = false;
  private constraints: Constraint[] = [];

  withId(id: number): ProductOptionChoiceBuilder {
    this.id = id;
    return this;
  }

  forOption(optionId: number): ProductOptionChoiceBuilder {
    this.optionId = optionId;
    return this;
  }

  withPriceAdjustment(adjustment: number): ProductOptionChoiceBuilder {
    this.priceAdjustment = adjustment;
    return this;
  }

  selected(isSelected: boolean = true): ProductOptionChoiceBuilder {
    this.isSelected = isSelected;
    return this;
  }

  disabled(isDisabled: boolean = true): ProductOptionChoiceBuilder {
    this.isDisabled = isDisabled;
    return this;
  }

  outOfStock(isOutOfStock: boolean = true): ProductOptionChoiceBuilder {
    this.isOutOfStock = isOutOfStock;
    return this;
  }

  withConstraint(constraint: Constraint): ProductOptionChoiceBuilder {
    this.constraints.push(constraint);
    return this;
  }

  build(): PartChoice {
    return {
      id: this.id,
      partId: this.optionId,
      priceAdjustment: this.priceAdjustment,
      outOfStock: this.isOutOfStock,
      selected: this.isSelected,
      disabled: this.isDisabled,
      constraints: [...this.constraints],
    };
  }
}
