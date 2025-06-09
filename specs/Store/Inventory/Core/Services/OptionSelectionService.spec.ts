import {
  Product,
  ProductOption,
} from "../../../../../src/Store/Inventory/Core/Entities";
import { OptionSelectionService } from "../../../../../src/Store/Inventory/Core/Services/OptionSelectionService";
import { OptionId } from "../../../../../src/Store/Inventory/Core/ValueObjects";

describe("OptionSelectionService", () => {
  let service: OptionSelectionService;
  let product: Product;

  beforeEach(() => {
    service = new OptionSelectionService();
    const options: ProductOption[] = [
      { id: 1, price: 10, selected: false },
      { id: 2, price: 20, selected: false },
      { id: 3, price: 30, selected: false },
    ];
    product = new Product(1, "customizable", 100, options, []);
  });

  describe("selectOptions", () => {
    it("should select valid options", () => {
      // Arrange
      const optionIds = [new OptionId(1), new OptionId(2)];

      // Act
      const result = service.selectOptions(product, optionIds);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(product.options[0].selected).toBe(true);
      expect(product.options[1].selected).toBe(true);
      expect(product.options[2].selected).toBe(false);
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
      expect(product.options.every((o) => !o.selected)).toBe(true);
    });
  });

  describe("deselectAllOptions", () => {
    it("should deselect all previously selected options", () => {
      // Arrange
      product.options[0].selected = true;
      product.options[1].selected = true;

      // Act
      const result = service.deselectAllOptions(product);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(product.options.every((o) => !o.selected)).toBe(true);
    });
  });

  describe("getSelectedOptions", () => {
    it("should return selected option IDs", () => {
      // Arrange
      product.options[0].selected = true;
      product.options[2].selected = true;

      // Act
      const selectedOptions = service.getSelectedOptions(product);

      // Assert
      expect(selectedOptions).toHaveLength(2);
      expect(selectedOptions[0].value).toBe(1);
      expect(selectedOptions[1].value).toBe(3);
    });

    it("should return empty array when no options selected", () => {
      // Act
      const selectedOptions = service.getSelectedOptions(product);

      // Assert
      expect(selectedOptions).toHaveLength(0);
    });
  });
});
