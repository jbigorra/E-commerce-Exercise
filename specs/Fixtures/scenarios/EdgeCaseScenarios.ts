import { Product } from "../../../src/Store/Inventory/Core/Entities";
import { ConstraintBuilder } from "../builders/ConstraintBuilder";
import { ProductBuilder } from "../builders/ProductBuilder";
import { ProductOptionBuilder } from "../builders/ProductOptionBuilder";
import { ProductOptionChoiceBuilder } from "../builders/ProductOptionChoiceBuilder";
import { BasicProductScenarios } from "./BasicProductScenarios";

export class EdgeCaseScenarios {
  static withOptionsOnly(): Product {
    return new ProductBuilder()
      .withId(2)
      .asCustomizable()
      .withBasePrice(20)
      .withOption(new ProductOptionBuilder().withId(6).withPrice(15).build()) // OPTION_WITHOUT_CHOICES_ID
      .withOption(new ProductOptionBuilder().withId(1).withPrice(10).build())
      .build(); // No choices for these options
  }

  static withCascadingConstraints(): Product {
    const cascadingConstraint1 = new ConstraintBuilder()
      .withId(1)
      .forChoice(402) // CASCADING_DISABLED_CHOICE_2_ID
      .constrainedByChoice(7) // CASCADING_OPTION_1_ID
      .asIncompatible()
      .build();

    const cascadingConstraint2 = new ConstraintBuilder()
      .withId(2)
      .forChoice(403) // CASCADING_DISABLED_CHOICE_3_ID
      .constrainedByChoice(7) // CASCADING_OPTION_1_ID
      .asIncompatible()
      .build();

    return new ProductBuilder()
      .withId(2)
      .asCustomizable()
      .withBasePrice(20)
      .withOption(new ProductOptionBuilder().withId(7).withPrice(25).build()) // CASCADING_OPTION_1_ID
      .withOptionChoice(
        new ProductOptionChoiceBuilder()
          .withId(401) // CASCADING_CHOICE_1_ID
          .forOption(7)
          .withPriceAdjustment(0)
          .build()
      )
      .withOptionChoice(
        new ProductOptionChoiceBuilder()
          .withId(402) // CASCADING_DISABLED_CHOICE_2_ID
          .forOption(7)
          .withPriceAdjustment(0)
          .withConstraint(cascadingConstraint1)
          .build()
      )
      .withOptionChoice(
        new ProductOptionChoiceBuilder()
          .withId(403) // CASCADING_DISABLED_CHOICE_3_ID
          .forOption(7)
          .withPriceAdjustment(0)
          .withConstraint(cascadingConstraint2)
          .build()
      )
      .build();
  }

  static withManyOptions(): Product {
    return new ProductBuilder()
      .withId(2)
      .asCustomizable()
      .withBasePrice(20)
      .withOption(new ProductOptionBuilder().withId(1).withPrice(10).build())
      .withOption(new ProductOptionBuilder().withId(2).withPrice(20).build())
      .withOption(new ProductOptionBuilder().withId(3).withPrice(30).build())
      .withOption(new ProductOptionBuilder().withId(4).withPrice(40).build())
      .withOption(new ProductOptionBuilder().withId(5).withPrice(50).build())
      .withOptionChoice(
        new ProductOptionChoiceBuilder()
          .withId(501) // CHOICE_1_ID
          .forOption(1)
          .withPriceAdjustment(5)
          .build()
      )
      .withOptionChoice(
        new ProductOptionChoiceBuilder()
          .withId(502) // CHOICE_2_ID
          .forOption(2)
          .withPriceAdjustment(8)
          .build()
      )
      .withOptionChoice(
        new ProductOptionChoiceBuilder()
          .withId(503) // CHOICE_3_ID
          .forOption(3)
          .withPriceAdjustment(12)
          .build()
      )
      .withOptionChoice(
        new ProductOptionChoiceBuilder()
          .withId(504) // CHOICE_4_ID
          .forOption(4)
          .withPriceAdjustment(15)
          .build()
      )
      .withOptionChoice(
        new ProductOptionChoiceBuilder()
          .withId(505) // CHOICE_5_ID
          .forOption(5)
          .withPriceAdjustment(20)
          .build()
      )
      .build();
  }

  static optionsOnlyCollection(): Product[] {
    return [BasicProductScenarios.standardProduct(), this.withOptionsOnly()];
  }

  static cascadingConstraintsCollection(): Product[] {
    return [
      BasicProductScenarios.standardProduct(),
      this.withCascadingConstraints(),
    ];
  }

  static manyOptionsCollection(): Product[] {
    return [BasicProductScenarios.standardProduct(), this.withManyOptions()];
  }
}
