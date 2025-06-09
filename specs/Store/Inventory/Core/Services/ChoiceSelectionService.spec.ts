import {
  Product,
  ProductOption,
  ProductOptionChoice,
} from "../../../../../src/Store/Inventory/Core/Entities";
import { ChoiceSelectionService } from "../../../../../src/Store/Inventory/Core/Services/ChoiceSelectionService";
import {
  ChoiceId,
  OptionId,
} from "../../../../../src/Store/Inventory/Core/ValueObjects";
import { createCustomizableProduct } from "../../../../Fixtures/Inventory";

describe("ChoiceSelectionService", () => {
  let service: ChoiceSelectionService;
  let product: Product;

  beforeEach(() => {
    service = new ChoiceSelectionService();
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
        optionId: 1,
        priceAdjustment: 10,
        selected: false,
        disabled: false,
        constraints: [],
      },
      {
        id: 103,
        optionId: 2,
        priceAdjustment: 15,
        selected: false,
        disabled: false,
        constraints: [],
      },
    ];
    product = createCustomizableProduct(
      {
        id: 1,
        type: "customizable",
        basePrice: 100,
      },
      options,
      optionChoices
    );
  });

  describe("selectChoices", () => {
    it("should select valid choices", () => {
      const optionIds = [new OptionId(1)];
      const choiceIds = [new ChoiceId(101)];

      const result = service.selectChoices(product, optionIds, choiceIds);

      expect(result.isSuccess()).toBe(true);
      expect(
        product.optionChoices.findByOptionId(new OptionId(1))?.selected
      ).toBe(true);
    });

    it("should reject multiple choices for same option", () => {
      const optionIds = [new OptionId(1)];
      const choiceIds = [new ChoiceId(101), new ChoiceId(102)];

      const result = service.selectChoices(product, optionIds, choiceIds);

      expect(result.isError()).toBe(true);
      expect(result.getError().message).toBe(
        "Only one option choice can be selected"
      );
    });

    it("should reject selecting disabled choice", () => {
      product.optionChoices.findByOptionId(new OptionId(1))!.disabled = true;
      const optionIds = [new OptionId(1)];
      const choiceIds = [new ChoiceId(101)];

      const result = service.selectChoices(product, optionIds, choiceIds);

      expect(result.isError()).toBe(true);
      expect(result.getError().message).toBe(
        "Choice with Id = 101 is disabled and cannot be selected"
      );
    });

    it("should handle options with no matching choices", () => {
      const optionIds = [new OptionId(1)];
      const choiceIds = [new ChoiceId(999)]; // Non-existent choice

      const result = service.selectChoices(product, optionIds, choiceIds);

      expect(result.isSuccess()).toBe(true);
    });
  });
});
