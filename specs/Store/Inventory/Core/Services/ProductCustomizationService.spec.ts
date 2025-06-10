import { ConstraintEngine } from "../../../../../src/Store/Inventory/Core/Constraints/ConstraintEngine";
import { Product } from "../../../../../src/Store/Inventory/Core/Entities";
import { ChoiceSelectionService } from "../../../../../src/Store/Inventory/Core/Services/ChoiceSelectionService";
import { OptionSelectionService } from "../../../../../src/Store/Inventory/Core/Services/OptionSelectionService";
import {
  DefaultProductCustomizationService,
  ProductCustomizationService,
} from "../../../../../src/Store/Inventory/Core/Services/ProductCustomizationService";
import {
  ChoiceId,
  OptionId,
  SelectedOptions,
} from "../../../../../src/Store/Inventory/Core/ValueObjects";
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

    // Create focused test data using builders
    const option1 = new ProductOptionBuilder()
      .withId(OptionIds.FRAME_TYPE)
      .withPrice(10)
      .build();

    const option2 = new ProductOptionBuilder()
      .withId(OptionIds.WHEELS)
      .withPrice(20)
      .build();

    const option3 = new ProductOptionBuilder()
      .withId(OptionIds.RIM_COLOR)
      .withPrice(30)
      .build();

    const choice1 = new ProductOptionChoiceBuilder()
      .withId(ChoiceIds.FULL_SUSPENSION_FRAME)
      .forOption(OptionIds.FRAME_TYPE)
      .withPriceAdjustment(5)
      .build();

    const choice2 = new ProductOptionChoiceBuilder()
      .withId(ChoiceIds.ROAD_WHEELS)
      .forOption(OptionIds.WHEELS)
      .withPriceAdjustment(10)
      .build();

    product = new ProductBuilder()
      .withId(ProductIds.CUSTOMIZABLE_PRODUCT)
      .asCustomizable()
      .withBasePrice(20)
      .withOption(option1)
      .withOption(option2)
      .withOption(option3)
      .withOptionChoice(choice1)
      .withOptionChoice(choice2)
      .build();
  });

  describe("customize", () => {
    it("should reject standard products", () => {
      const standardProduct = new ProductBuilder()
        .withId(ProductIds.STANDARD_PRODUCT)
        .asStandard()
        .build();

      const selectedOptions = new SelectedOptions(
        [new OptionId(OptionIds.FRAME_TYPE)],
        []
      );

      const result = service.customize(standardProduct, selectedOptions);

      expect(result.isError()).toBe(true);
      expect(result.getError().message).toBe("Product is not customizable");
    });

    it("should require at least one option", () => {
      const selectedOptions = new SelectedOptions([], []);

      const result = service.customize(product, selectedOptions);

      expect(result.isError()).toBe(true);
      expect(result.getError().message).toBe(
        "At least one product option must be selected to customize the product"
      );
    });

    it("should successfully customize with valid options", () => {
      const selectedOptions = new SelectedOptions(
        [new OptionId(OptionIds.FRAME_TYPE)],
        [new ChoiceId(ChoiceIds.FULL_SUSPENSION_FRAME)]
      );

      const result = service.customize(product, selectedOptions);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toBe(product);
    });

    it("should handle constraints during customization", () => {
      // Add constraint to choice using builder pattern
      const constraint = new ConstraintBuilder()
        .forChoice(ChoiceIds.ROAD_WHEELS)
        .asIncompatible()
        .constrainedBy(OptionIds.FRAME_TYPE)
        .build();

      const choiceToConstrain = product.optionChoices.findById(
        ChoiceIds.ROAD_WHEELS
      );
      choiceToConstrain!.constraints = [constraint];

      const selectedOptions = new SelectedOptions(
        [new OptionId(OptionIds.FRAME_TYPE)],
        []
      );

      const result = service.customize(product, selectedOptions);

      expect(result.isSuccess()).toBe(true);
      expect(choiceToConstrain!.disabled).toBe(true);
    });
  });
});
