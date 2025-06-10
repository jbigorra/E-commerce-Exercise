import { Product } from "../../../src/Store/Inventory/Core/Entities";
import { ConstraintBuilder } from "../builders/ConstraintBuilder";
import { ProductBuilder } from "../builders/ProductBuilder";
import { ProductOptionBuilder } from "../builders/ProductOptionBuilder";
import { ProductOptionChoiceBuilder } from "../builders/ProductOptionChoiceBuilder";
import { BasicProductScenarios } from "./BasicProductScenarios";

export class PriceConstraintScenarios {
  static withPriceConstraints(): Product {
    const priceConstraint = new ConstraintBuilder()
      .withId(1)
      .forChoice(201) // PRICE_CONSTRAINED_CHOICE_ID
      .constrainedBy(1) // OPTION_1_ID
      .asPrice(15) // PRICE_CONSTRAINT_ADJUSTMENT
      .build();

    return new ProductBuilder()
      .withId(2)
      .asCustomizable()
      .withBasePrice(20)
      .withOption(new ProductOptionBuilder().withId(1).withPrice(10).build())
      .withOption(new ProductOptionBuilder().withId(2).withPrice(20).build())
      .withOptionChoice(
        new ProductOptionChoiceBuilder()
          .withId(201)
          .forOption(1)
          .withPriceAdjustment(5)
          .withConstraint(priceConstraint)
          .build()
      )
      .build();
  }

  static productsCollection(): Product[] {
    return [
      BasicProductScenarios.standardProduct(),
      this.withPriceConstraints(),
    ];
  }
}
