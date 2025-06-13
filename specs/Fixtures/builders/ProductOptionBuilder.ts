import { Part } from "../../../src/Store/ProductCatalog/Core/Entities";

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

  build(): Part {
    return {
      id: this.id,
      name: `Part ${this.id} name`,
      description: `Part ${this.id} description`,
      price: this.price,
    };
  }
}
