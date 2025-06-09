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
    product = new Product(1, "customizable", 100, options, optionChoices);
  });

  describe("selectChoices", () => {
    it("should select valid choices", () => {
      const optionIds = [new OptionId(1)];
      const choiceIds = [new ChoiceId(101)];

      const result = service.selectChoices(product, optionIds, choiceIds);

      expect(result.isSuccess()).toBe(true);
      expect(product.optionChoices[0].selected).toBe(true);
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
      product.optionChoices[0].disabled = true;
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

  describe("deselectAllChoices", () => {
    it("should deselect all previously selected choices", () => {
      product.optionChoices[0].selected = true;
      product.optionChoices[1].selected = true;

      const result = service.deselectAllChoices(product);

      expect(result.isSuccess()).toBe(true);
      expect(product.optionChoices.every((c) => !c.selected)).toBe(true);
    });
  });

  describe("getSelectedChoices", () => {
    it("should return selected choice IDs", () => {
      product.optionChoices[0].selected = true;
      product.optionChoices[2].selected = true;

      const selectedChoices = service.getSelectedChoices(product);

      expect(selectedChoices).toHaveLength(2);
      expect(selectedChoices[0].value).toBe(101);
      expect(selectedChoices[1].value).toBe(103);
    });

    it("should return empty array when no choices selected", () => {
      const selectedChoices = service.getSelectedChoices(product);

      expect(selectedChoices).toHaveLength(0);
    });
  });

  describe("getChoicesForOption", () => {
    it("should return choices for specific option", () => {
      const choicesForOption1 = service.getChoicesForOption(
        product,
        new OptionId(1)
      );
      const choicesForOption2 = service.getChoicesForOption(
        product,
        new OptionId(2)
      );

      expect(choicesForOption1).toHaveLength(2);
      expect(choicesForOption1[0].value).toBe(101);
      expect(choicesForOption1[1].value).toBe(102);

      expect(choicesForOption2).toHaveLength(1);
      expect(choicesForOption2[0].value).toBe(103);
    });

    it("should return empty array for option with no choices", () => {
      const choicesForOption = service.getChoicesForOption(
        product,
        new OptionId(999)
      );

      expect(choicesForOption).toHaveLength(0);
    });
  });
});
