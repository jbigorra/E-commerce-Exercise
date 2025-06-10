import { ProductOption } from "../../../src/Store/Inventory/Core/Entities";

export class ProductOptionBuilder {
  private id: number = 1;
  private price: number = 10;
  private isSelected: boolean = false;

  withId(id: number): ProductOptionBuilder {
    this.id = id;
    return this;
  }

  withPrice(price: number): ProductOptionBuilder {
    this.price = price;
    return this;
  }

  selected(isSelected: boolean = true): ProductOptionBuilder {
    this.isSelected = isSelected;
    return this;
  }

  build(): ProductOption {
    return {
      id: this.id,
      price: this.price,
      selected: this.isSelected,
    };
  }
}
