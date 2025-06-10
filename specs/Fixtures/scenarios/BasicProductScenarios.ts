import { Product } from "../../../src/Store/Inventory/Core/Entities";
import { ProductBuilder } from "../builders/ProductBuilder";
import { ProductOptionBuilder } from "../builders/ProductOptionBuilder";

export class BasicProductScenarios {
  static standardProduct(): Product {
    return new ProductBuilder()
      .withId(1)
      .asStandard()
      .withBasePrice(20)
      .build();
  }

  static customizableProduct(): Product {
    return new ProductBuilder()
      .withId(2)
      .asCustomizable()
      .withBasePrice(20)
      .withOption(new ProductOptionBuilder().withId(1).withPrice(10).build())
      .withOption(new ProductOptionBuilder().withId(2).withPrice(20).build())
      .withOption(new ProductOptionBuilder().withId(3).withPrice(30).build())
      .build();
  }

  static productsCollection(): Product[] {
    return [this.standardProduct(), this.customizableProduct()];
  }
}
