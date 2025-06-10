import {
  Product,
  ProductOption,
  ProductOptionChoice,
  ProductOptionChoices,
  ProductOptions,
  ProductType,
} from "../../../src/Store/Inventory/Core/Entities";

export class ProductBuilder {
  private id: number = 1;
  private type: ProductType = "customizable";
  private basePrice: number = 20;
  private options: ProductOption[] = [];
  private optionChoices: ProductOptionChoice[] = [];

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

  withOption(option: ProductOption): ProductBuilder {
    this.options.push(option);
    return this;
  }

  withOptionChoice(choice: ProductOptionChoice): ProductBuilder {
    this.optionChoices.push(choice);
    return this;
  }

  build(): Product {
    return new Product(
      this.id,
      this.type,
      this.basePrice,
      new ProductOptions(this.options),
      new ProductOptionChoices(this.optionChoices)
    );
  }
}
