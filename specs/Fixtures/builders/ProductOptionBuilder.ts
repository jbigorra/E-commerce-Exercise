import { ProductOption } from "../../../src/Store/Inventory/Core/Entities";

export class ProductOptionBuilder {
  private id: number = 1;
  private price: number = 10;

  withId(id: number): ProductOptionBuilder {
    this.id = id;
    return this;
  }

  withPrice(price: number): ProductOptionBuilder {
    this.price = price;
    return this;
  }

  build(): ProductOption {
    return {
      id: this.id,
      price: this.price,
    };
  }
}
