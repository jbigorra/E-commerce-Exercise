import { ConstraintEngine } from "../../../../../src/Store/Inventory/Core/Constraints/ConstraintEngine";
import { Product } from "../../../../../src/Store/Inventory/Core/Entities";
import { ChoiceSelectionService } from "../../../../../src/Store/Inventory/Core/Services/ChoiceSelectionService";
import { OptionSelectionService } from "../../../../../src/Store/Inventory/Core/Services/OptionSelectionService";
import {
  DefaultProductCustomizationService,
  ProductCustomizationService,
} from "../../../../../src/Store/Inventory/Core/Services/ProductCustomizationService";
import { SelectedOptions } from "../../../../../src/Store/Inventory/Core/ValueObjects";
import { ConstraintBuilder } from "../../../../Fixtures/builders/ConstraintBuilder";
import { ProductBuilder } from "../../../../Fixtures/builders/ProductBuilder";
import { ProductOptionBuilder } from "../../../../Fixtures/builders/ProductOptionBuilder";
import { ProductOptionChoiceBuilder } from "../../../../Fixtures/builders/ProductOptionChoiceBuilder";
import {
  ChoiceIds,
  OptionIds,
  ProductIds,
} from "../../../../Fixtures/constants/ProductConstants";

describe("ProductCustomizationService", () => {
  let service: ProductCustomizationService;
  let product: Product;

  beforeEach(() => {
    const optionSelectionService = new OptionSelectionService();
    const choiceSelectionService = new ChoiceSelectionService();
    const constraintEngine = new ConstraintEngine();

    service = new DefaultProductCustomizationService(
      optionSelectionService,
      choiceSelectionService,
      constraintEngine
    );

    const FRAME_TYPE = new ProductOptionBuilder()
      .withId(OptionIds.FRAME_TYPE)
      .withPrice(10)
      .build();

    const WHEELS = new ProductOptionBuilder()
      .withId(OptionIds.WHEELS)
      .withPrice(20)
      .build();

    const FRAME_FINISH = new ProductOptionBuilder()
      .withId(OptionIds.FRAME_FINISH)
      .withPrice(30)
      .build();

    const FULL_SUSPENSION_FRAME = new ProductOptionChoiceBuilder()
      .withId(ChoiceIds.FULL_SUSPENSION_FRAME)
      .forOption(OptionIds.FRAME_TYPE)
      .withPriceAdjustment(5)
      .build();

    const DIAMOND_FRAME = new ProductOptionChoiceBuilder()
      .withId(ChoiceIds.DIAMOND_FRAME)
      .forOption(OptionIds.FRAME_TYPE)
      .withPriceAdjustment(5)
      .build();

    const ROAD_WHEELS = new ProductOptionChoiceBuilder()
      .withId(ChoiceIds.ROAD_WHEELS)
      .forOption(OptionIds.WHEELS)
      .withPriceAdjustment(10)
      .withConstraint(
        new ConstraintBuilder()
          .withId(1)
          .forChoice(ChoiceIds.ROAD_WHEELS)
          .asIncompatible()
          .constrainedByChoice(ChoiceIds.FULL_SUSPENSION_FRAME)
          .build()
      )
      .build();

    const FAT_BIKE_WHEELS = new ProductOptionChoiceBuilder()
      .withId(ChoiceIds.FAT_BIKE_WHEELS)
      .forOption(OptionIds.WHEELS)
      .withPriceAdjustment(15)
      .build();

    const MATTE_FINISH = new ProductOptionChoiceBuilder()
      .withId(ChoiceIds.MATTE_FINISH)
      .forOption(OptionIds.FRAME_FINISH)
      .withPriceAdjustment(15)
      .withConstraint(
        new ConstraintBuilder()
          .withId(2)
          .forChoice(ChoiceIds.MATTE_FINISH)
          .asPrice(10)
          .constrainedByChoice(ChoiceIds.FULL_SUSPENSION_FRAME)
          .build()
      )
      .build();

    const SHINY_FINISH = new ProductOptionChoiceBuilder()
      .withId(ChoiceIds.SHINY_FINISH)
      .forOption(OptionIds.FRAME_FINISH)
      .withPriceAdjustment(15)
      .withConstraint(
        new ConstraintBuilder()
          .withId(3)
          .forChoice(ChoiceIds.SHINY_FINISH)
          .asPrice(10)
          .constrainedByChoice(ChoiceIds.FULL_SUSPENSION_FRAME)
          .build()
      )
      .withConstraint(
        new ConstraintBuilder()
          .withId(4)
          .forChoice(ChoiceIds.SHINY_FINISH)
          .asPrice(5)
          .constrainedByChoice(ChoiceIds.DIAMOND_FRAME)
          .build()
      )
      .build();

    product = new ProductBuilder()
      .withId(ProductIds.CUSTOMIZABLE_PRODUCT)
      .asCustomizable()
      .withBasePrice(20)
      .withOption(FRAME_TYPE)
      .withOption(WHEELS)
      .withOption(FRAME_FINISH)
      .withOptionChoice(FULL_SUSPENSION_FRAME)
      .withOptionChoice(DIAMOND_FRAME)
      .withOptionChoice(ROAD_WHEELS)
      .withOptionChoice(FAT_BIKE_WHEELS)
      .withOptionChoice(MATTE_FINISH)
      .withOptionChoice(SHINY_FINISH)
      .build();
  });

  describe("customize", () => {
    it("should disable incompatible choices", () => {
      const selectedOptions = new SelectedOptions(
        [OptionIds.FRAME_TYPE, OptionIds.WHEELS],
        [ChoiceIds.FULL_SUSPENSION_FRAME, ChoiceIds.FAT_BIKE_WHEELS]
      );

      const result = service.customize(product, selectedOptions);

      expect(result.isSuccess()).toBe(true);
      expect(
        result.getValue().optionChoices.findById(ChoiceIds.ROAD_WHEELS)!
          .disabled
      ).toBe(true);
    });

    it("should select valid choices for selected options", () => {
      const selectedOptions = new SelectedOptions(
        [OptionIds.FRAME_TYPE, OptionIds.WHEELS],
        [ChoiceIds.FULL_SUSPENSION_FRAME, ChoiceIds.FAT_BIKE_WHEELS]
      );

      const result = service.customize(product, selectedOptions);

      expect(result.isSuccess()).toBe(true);
      const actualChoices = result.getValue().optionChoices;
      expect(
        actualChoices.findById(ChoiceIds.FULL_SUSPENSION_FRAME)!.selected
      ).toBe(true);
      expect(actualChoices.findById(ChoiceIds.FAT_BIKE_WHEELS)!.selected).toBe(
        true
      );
      expect(actualChoices.all.filter((c) => c.selected).length).toBe(2);
    });

    /**
     * This test should consider:
     * - The base price of the product
     * - The price adjustments of the selected options
     * - The price adjustments of the selected choices
     * - The price adjustments of the constrained choices
     */
    it("should apply price adjustments from price constrained choices", () => {
      const selectedOptions = new SelectedOptions(
        [OptionIds.FRAME_TYPE, OptionIds.FRAME_FINISH, OptionIds.WHEELS],
        [ChoiceIds.DIAMOND_FRAME, ChoiceIds.SHINY_FINISH, ChoiceIds.ROAD_WHEELS]
      );

      const result = service.customize(product, selectedOptions);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().totalPrice).toBe(115);
    });

    it("should handle constraints during customization", () => {
      const selectedOptions = new SelectedOptions(
        [OptionIds.FRAME_TYPE, OptionIds.FRAME_FINISH, OptionIds.WHEELS],
        [
          ChoiceIds.FULL_SUSPENSION_FRAME,
          ChoiceIds.SHINY_FINISH,
          ChoiceIds.FAT_BIKE_WHEELS,
        ]
      );

      const result = service.customize(product, selectedOptions);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().totalPrice).toBe(125);
    });
  });
});
