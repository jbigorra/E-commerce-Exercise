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
import {
  createCustomizableProduct,
  createProductOptions,
} from "../../../../Fixtures/Inventory";

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

    const options: ProductOption[] = createProductOptions();
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
    product = createCustomizableProduct({ id: 1 }, options, optionChoices);
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
      product.optionChoices.all[1].constraints = constraints;

      const selectedOptions = new SelectedOptions([new OptionId(1)], []);

      const result = service.customize(product, selectedOptions);

      expect(result.isSuccess()).toBe(true);
      expect(product.optionChoices.all[1].disabled).toBe(true);
    });
  });
});
