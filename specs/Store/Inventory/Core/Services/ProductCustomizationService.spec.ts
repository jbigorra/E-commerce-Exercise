import { ConstraintEngine } from "../../../../../src/Store/Inventory/Core/Constraints/ConstraintEngine";
import {
  Constraint,
  Product,
  ProductOption,
  ProductOptionChoice,
} from "../../../../../src/Store/Inventory/Core/Entities";
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

    const options: ProductOption[] = [
      { id: 1, price: 10, selected: false },
      { id: 2, price: 20, selected: false },
    ];
    const optionChoices: ProductOptionChoice[] = [
      {
        id: 101,
        optionId: 1,
        priceAdjustment: 5,
        selected: false,
        disabled: false,
        constraints: [],
      },
      {
        id: 102,
        optionId: 2,
        priceAdjustment: 10,
        selected: false,
        disabled: false,
        constraints: [],
      },
    ];
    product = new Product(1, "customizable", 100, options, optionChoices);
  });

  describe("customize", () => {
    it("should reject standard products", () => {
      const standardProduct = new Product(1, "standard", 100, [], []);
      const selectedOptions = new SelectedOptions([new OptionId(1)], []);

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
        [new OptionId(1)],
        [new ChoiceId(101)]
      );

      const result = service.customize(product, selectedOptions);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toBe(product);
    });

    it("should handle constraints during customization", () => {
      const constraints: Constraint[] = [
        {
          id: 1,
          optionChoiceId: 102,
          constrainedBy: 1,
          type: "incompatible",
        },
      ];
      product.optionChoices[1].constraints = constraints;

      const selectedOptions = new SelectedOptions([new OptionId(1)], []);

      const result = service.customize(product, selectedOptions);

      expect(result.isSuccess()).toBe(true);
      expect(product.optionChoices[1].disabled).toBe(true);
    });
  });

  describe("reset", () => {
    it("should reset all options and choices", () => {
      // Set up product with selected options and choices
      product.options[0].selected = true;
      product.options[1].selected = true;
      product.optionChoices[0].selected = true;
      product.optionChoices[1].selected = true;
      product.optionChoices[1].disabled = true;

      const result = (service as DefaultProductCustomizationService).reset(
        product
      );

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toBe(product);
      expect(product.options.every((o) => !o.selected)).toBe(true);
      expect(product.optionChoices.every((c) => !c.selected)).toBe(true);
      expect(product.optionChoices.every((c) => !c.disabled)).toBe(true);
    });

    it("should handle product with no options", () => {
      const emptyProduct = new Product(1, "customizable", 100, [], []);

      const result = (service as DefaultProductCustomizationService).reset(
        emptyProduct
      );

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toBe(emptyProduct);
    });
  });
});
