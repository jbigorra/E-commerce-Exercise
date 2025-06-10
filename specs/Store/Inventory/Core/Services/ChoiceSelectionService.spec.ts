import { Product } from "../../../../../src/Store/Inventory/Core/Entities";
import { ChoiceSelectionService } from "../../../../../src/Store/Inventory/Core/Services/ChoiceSelectionService";
import {
  ChoiceId,
  OptionId,
} from "../../../../../src/Store/Inventory/Core/ValueObjects";
import { ProductBuilder } from "../../../../Fixtures/builders/ProductBuilder";
import { ProductOptionBuilder } from "../../../../Fixtures/builders/ProductOptionBuilder";
import { ProductOptionChoiceBuilder } from "../../../../Fixtures/builders/ProductOptionChoiceBuilder";
import {
  ChoiceIds,
  OptionIds,
  ProductIds,
} from "../../../../Fixtures/constants/ProductConstants";

describe("ChoiceSelectionService", () => {
  let service: ChoiceSelectionService;
  let product: Product;

  beforeEach(() => {
    service = new ChoiceSelectionService();

    // Create focused test data using builders
    const option1 = new ProductOptionBuilder()
      .withId(OptionIds.FRAME_TYPE)
      .withPrice(10)
      .build();

    const option2 = new ProductOptionBuilder()
      .withId(OptionIds.WHEELS)
      .withPrice(20)
      .build();

    const choice1 = new ProductOptionChoiceBuilder()
      .withId(ChoiceIds.FULL_SUSPENSION_FRAME)
      .forOption(OptionIds.FRAME_TYPE)
      .withPriceAdjustment(5)
      .build();

    const choice2 = new ProductOptionChoiceBuilder()
      .withId(ChoiceIds.DIAMOND_FRAME)
      .forOption(OptionIds.FRAME_TYPE)
      .withPriceAdjustment(10)
      .build();

    const choice3 = new ProductOptionChoiceBuilder()
      .withId(ChoiceIds.ROAD_WHEELS)
      .forOption(OptionIds.WHEELS)
      .withPriceAdjustment(15)
      .build();

    product = new ProductBuilder()
      .withId(ProductIds.CUSTOMIZABLE_PRODUCT)
      .asCustomizable()
      .withBasePrice(100)
      .withOption(option1)
      .withOption(option2)
      .withOptionChoice(choice1)
      .withOptionChoice(choice2)
      .withOptionChoice(choice3)
      .build();
  });

  describe("selectChoices", () => {
    it("should select valid choices", () => {
      const optionIds = [new OptionId(OptionIds.FRAME_TYPE)];
      const choiceIds = [new ChoiceId(ChoiceIds.FULL_SUSPENSION_FRAME)];

      const result = service.selectChoices(product, optionIds, choiceIds);

      expect(result.isSuccess()).toBe(true);
      const selectedChoice = product.optionChoices.findById(
        ChoiceIds.FULL_SUSPENSION_FRAME
      );
      expect(selectedChoice!.selected).toBe(true);
    });

    it("should reject multiple choices for same option", () => {
      const optionIds = [new OptionId(OptionIds.FRAME_TYPE)];
      const choiceIds = [
        new ChoiceId(ChoiceIds.FULL_SUSPENSION_FRAME),
        new ChoiceId(ChoiceIds.DIAMOND_FRAME),
      ];

      const result = service.selectChoices(product, optionIds, choiceIds);

      expect(result.isError()).toBe(true);
      expect(result.getError().message).toBe(
        "Only one option choice can be selected"
      );
    });

    it("should reject selecting disabled choice", () => {
      // Disable the first choice
      const choiceToDisable = product.optionChoices.findById(
        ChoiceIds.FULL_SUSPENSION_FRAME
      );
      choiceToDisable!.disabled = true;

      const optionIds = [new OptionId(OptionIds.FRAME_TYPE)];
      const choiceIds = [new ChoiceId(ChoiceIds.FULL_SUSPENSION_FRAME)];

      const result = service.selectChoices(product, optionIds, choiceIds);

      expect(result.isError()).toBe(true);
      expect(result.getError().message).toBe(
        `Choice with Id = ${ChoiceIds.FULL_SUSPENSION_FRAME} is disabled and cannot be selected`
      );
    });

    it("should handle options with no matching choices", () => {
      const optionIds = [new OptionId(OptionIds.FRAME_TYPE)];
      const choiceIds = [new ChoiceId(999)]; // Non-existent choice

      const result = service.selectChoices(product, optionIds, choiceIds);

      expect(result.isSuccess()).toBe(true);
    });
  });
});
