import { Product } from "../../../src/Store/Inventory/Core/Entities";
import { ProductBuilder } from "../builders/ProductBuilder";
import { ProductOptionBuilder } from "../builders/ProductOptionBuilder";
import { ProductOptionChoiceBuilder } from "../builders/ProductOptionChoiceBuilder";
import { ChoiceIds, OptionIds } from "../constants/ProductConstants";

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
    return [
      this.standardProduct(),
      this.customizableProduct(),
      this.customizableBikeProductWithoutConstraints(),
    ];
  }

  // prettier-ignore-start
  static customizableBikeProductWithoutConstraints(): Product {
    return new ProductBuilder()
      .withId(3)
      .asCustomizable()
      .withBasePrice(20)
      .withOption(
        new ProductOptionBuilder().withId(OptionIds.FRAME_TYPE).build()
      )
      .withOptionChoice(
        new ProductOptionChoiceBuilder()
          .withId(ChoiceIds.FULL_SUSPENSION_FRAME)
          .forOption(OptionIds.FRAME_TYPE)
          .withPriceAdjustment(10)
          .build()
      )
      .withOptionChoice(
        new ProductOptionChoiceBuilder()
          .withId(ChoiceIds.DIAMOND_FRAME)
          .forOption(OptionIds.FRAME_TYPE)
          .withPriceAdjustment(15)
          .build()
      )
      .withOption(
        new ProductOptionBuilder().withId(OptionIds.FRAME_FINISH).build()
      )
      .withOptionChoice(
        new ProductOptionChoiceBuilder()
          .withId(ChoiceIds.MATTE_FINISH)
          .forOption(OptionIds.FRAME_FINISH)
          .withPriceAdjustment(20)
          .build()
      )
      .withOptionChoice(
        new ProductOptionChoiceBuilder()
          .withId(ChoiceIds.SHINY_FINISH)
          .forOption(OptionIds.FRAME_FINISH)
          .withPriceAdjustment(25)
          .build()
      )
      .withOption(new ProductOptionBuilder().withId(OptionIds.WHEELS).build())
      .withOptionChoice(
        new ProductOptionChoiceBuilder()
          .withId(ChoiceIds.ROAD_WHEELS)
          .forOption(OptionIds.WHEELS)
          .withPriceAdjustment(30)
          .build()
      )
      .withOptionChoice(
        new ProductOptionChoiceBuilder()
          .withId(ChoiceIds.MOUNTAIN_WHEELS)
          .forOption(OptionIds.WHEELS)
          .withPriceAdjustment(35)
          .build()
      )
      .withOption(new ProductOptionBuilder().withId(OptionIds.CHAIN).build())
      .withOptionChoice(
        new ProductOptionChoiceBuilder()
          .withId(ChoiceIds.SINGLE_SPEED_CHAIN)
          .forOption(OptionIds.CHAIN)
          .withPriceAdjustment(40)
          .build()
      )
      .withOptionChoice(
        new ProductOptionChoiceBuilder()
          .withId(ChoiceIds.EIGHT_SPEED_CHAIN)
          .forOption(OptionIds.CHAIN)
          .withPriceAdjustment(45)
          .build()
      )
      .withOption(
        new ProductOptionBuilder().withId(OptionIds.RIM_COLOR).build()
      )
      .withOptionChoice(
        new ProductOptionChoiceBuilder()
          .withId(ChoiceIds.BLACK_RIM)
          .forOption(OptionIds.RIM_COLOR)
          .withPriceAdjustment(50)
          .build()
      )
      .withOptionChoice(
        new ProductOptionChoiceBuilder()
          .withId(ChoiceIds.BLUE_RIM)
          .forOption(OptionIds.RIM_COLOR)
          .withPriceAdjustment(55)
          .build()
      )
      .withOptionChoice(
        new ProductOptionChoiceBuilder()
          .withId(ChoiceIds.RED_RIM)
          .forOption(OptionIds.RIM_COLOR)
          .withPriceAdjustment(60)
          .build()
      )
      .build();
  }
  // prettier-ignore-end
}
