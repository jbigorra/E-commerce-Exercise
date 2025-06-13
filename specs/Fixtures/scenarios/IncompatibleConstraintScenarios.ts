import { Product } from "../../../src/Store/Inventory/Core/Entities";
import { ConstraintBuilder } from "../builders/ConstraintBuilder";
import { ProductBuilder } from "../builders/ProductBuilder";
import { ProductOptionBuilder } from "../builders/ProductOptionBuilder";
import { ProductOptionChoiceBuilder } from "../builders/ProductOptionChoiceBuilder";
import { BasicProductScenarios } from "./BasicProductScenarios";

export class IncompatibleConstraintScenarios {
  static withConflictingChoices(): Product {
    const incompatibleConstraint = new ConstraintBuilder()
      .withId(1)
      .forChoice(5) // CONSTRAINED_OPTION_CHOICE_ID
      .constrainedByChoice(1) // OPTION_1_ID
      .asIncompatible()
      .build();

    return new ProductBuilder()
      .withId(2)
      .asCustomizable()
      .withBasePrice(20)
      .withOption(new ProductOptionBuilder().withId(1).withPrice(10).build())
      .withOption(new ProductOptionBuilder().withId(2).withPrice(20).build())
      .withOption(new ProductOptionBuilder().withId(3).withPrice(30).build())
      .withOptionChoice(
        new ProductOptionChoiceBuilder()
          .withId(1) // CONSTRAINING_OPTION_CHOICE_ID
          .forOption(1)
          .withPriceAdjustment(10)
          .build()
      )
      .withOptionChoice(
        new ProductOptionChoiceBuilder()
          .withId(2)
          .forOption(2)
          .withPriceAdjustment(0)
          .build()
      )
      .withOptionChoice(
        new ProductOptionChoiceBuilder()
          .withId(3)
          .forOption(3)
          .withPriceAdjustment(0)
          .build()
      )
      .withOptionChoice(
        new ProductOptionChoiceBuilder()
          .withId(4)
          .forOption(3)
          .withPriceAdjustment(0)
          .build()
      )
      .withOptionChoice(
        new ProductOptionChoiceBuilder()
          .withId(5) // CONSTRAINED_OPTION_CHOICE_ID
          .forOption(3)
          .withPriceAdjustment(0)
          .withConstraint(incompatibleConstraint)
          .build()
      )
      .build();
  }

  static productsCollection(): Product[] {
    return [
      BasicProductScenarios.standardProduct(),
      this.withConflictingChoices(),
    ];
  }
}
