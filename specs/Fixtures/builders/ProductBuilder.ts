import { Part, PartChoice, PartChoices, Parts, Product, ProductType } from "../../../src/Store/Inventory/Core/Entities";

export class ProductBuilder {
  private id: number = 1;
  private type: ProductType = "customizable";
  private basePrice: number = 20;
  private options: Part[] = [];
  private optionChoices: PartChoice[] = [];

  withId(id: number): ProductBuilder {
    this.id = id;
    return this;
  }

  withBasePrice(price: number): ProductBuilder {
    this.basePrice = price;
    return this;
  }

  asStandard(): ProductBuilder {
    this.type = "standard";
    return this;
  }

  asCustomizable(): ProductBuilder {
    this.type = "customizable";
    return this;
  }

  withOption(option: Part): ProductBuilder {
    this.options.push(option);
    return this;
  }

  withOptionChoice(choice: PartChoice): ProductBuilder {
    this.optionChoices.push(choice);
    return this;
  }

  build(): Product {
    return new Product(
      this.id,
      this.type,
      this.basePrice,
      new Parts(this.options),
      new PartChoices(this.optionChoices),
    );
  }
}
