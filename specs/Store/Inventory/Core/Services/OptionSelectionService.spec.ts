import {
  Product,
  ProductOption,
} from "../../../../../src/Store/Inventory/Core/Entities";
import { OptionSelectionService } from "../../../../../src/Store/Inventory/Core/Services/OptionSelectionService";
import { OptionId } from "../../../../../src/Store/Inventory/Core/ValueObjects";
import {
  createCustomizableProduct,
  createProductOptions,
} from "../../../../Fixtures/Inventory";

describe("OptionSelectionService", () => {
  let service: OptionSelectionService;
  let product: Product;

  beforeEach(() => {
    service = new OptionSelectionService();
    const options: ProductOption[] = createProductOptions();
    product = createCustomizableProduct(
      {
        id: 1,
        type: "customizable",
        basePrice: 100,
      },
      options,
      []
    );
  });

  describe("selectOptions", () => {
    it("should select valid options", () => {
      // Arrange
      const optionIds = [new OptionId(1), new OptionId(2)];

      // Act
      const result = service.selectOptions(product, optionIds);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(product.options.findById(1)!.selected).toBe(true);
      expect(product.options.findById(2)!.selected).toBe(true);
      expect(product.options.findById(3)!.selected).toBe(false);
    });

    it("should return error for invalid option ID", () => {
      // Arrange
      const optionIds = [new OptionId(999)];

      // Act
      const result = service.selectOptions(product, optionIds);

      // Assert
      expect(result.isError()).toBe(true);
      expect(result.getError().message).toBe(
        "Product option with Id = 999 not found"
      );
    });

    it("should handle empty option array", () => {
      // Arrange
      const optionIds: OptionId[] = [];

      // Act
      const result = service.selectOptions(product, optionIds);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(product.options.all.every((o) => !o.selected)).toBe(true);
    });
  });
});
