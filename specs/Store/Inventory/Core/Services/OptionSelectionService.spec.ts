import { Product } from "../../../../../src/Store/Inventory/Core/Entities";
import { OptionSelectionService } from "../../../../../src/Store/Inventory/Core/Services/OptionSelectionService";
import { ProductBuilder } from "../../../../Fixtures/builders/ProductBuilder";
import { ProductOptionBuilder } from "../../../../Fixtures/builders/ProductOptionBuilder";
import {
  OptionIds,
  ProductIds,
  TestScenarios,
} from "../../../../Fixtures/constants/ProductConstants";

describe("OptionSelectionService", () => {
  let service: OptionSelectionService;
  let product: Product;

  beforeEach(() => {
    service = new OptionSelectionService();

    // Create focused test data using builders
    const testOptions = [
      new ProductOptionBuilder()
        .withId(OptionIds.FRAME_TYPE)
        .withPrice(10)
        .build(),
      new ProductOptionBuilder().withId(OptionIds.WHEELS).withPrice(20).build(),
      new ProductOptionBuilder()
        .withId(OptionIds.RIM_COLOR)
        .withPrice(30)
        .build(),
    ];

    product = new ProductBuilder()
      .withId(ProductIds.CUSTOMIZABLE_PRODUCT)
      .asCustomizable()
      .withBasePrice(100)
      .withOption(testOptions[0])
      .withOption(testOptions[1])
      .withOption(testOptions[2])
      .build();
  });

  describe("selectOptions", () => {
    it("should select valid options", () => {
      // Arrange
      const optionIds = [OptionIds.FRAME_TYPE, OptionIds.WHEELS];

      // Act
      const result = service.selectOptions(product, optionIds);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(product.options.findById(OptionIds.FRAME_TYPE)!.selected).toBe(
        true
      );
      expect(product.options.findById(OptionIds.WHEELS)!.selected).toBe(true);
      expect(product.options.findById(OptionIds.RIM_COLOR)!.selected).toBe(
        false
      );
    });

    it("should return error for invalid option ID", () => {
      // Arrange
      const optionIds = [TestScenarios.UNAVAILABLE_OPTION];

      // Act
      const result = service.selectOptions(product, optionIds);

      // Assert
      expect(result.isError()).toBe(true);
      expect(result.getError().message).toBe(
        `Product option with Id = ${TestScenarios.UNAVAILABLE_OPTION} not found`
      );
    });

    it("should handle empty option array", () => {
      // Arrange
      const optionIds: number[] = [];

      // Act
      const result = service.selectOptions(product, optionIds);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(product.options.all.every((o) => !o.selected)).toBe(true);
    });
  });
});
