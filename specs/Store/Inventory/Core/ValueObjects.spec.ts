import {
  ChoiceId,
  OptionId,
  ProductId,
  SelectedOptions,
} from "../../../../src/Store/Inventory/Core/ValueObjects";

describe("ValueObjects", () => {
  describe("OptionId", () => {
    it("should create valid OptionId", () => {
      const optionId = new OptionId(1);
      expect(optionId.value).toBe(1);
    });

    it("should throw error for non-positive values", () => {
      expect(() => new OptionId(0)).toThrow("OptionId must be positive");
      expect(() => new OptionId(-1)).toThrow("OptionId must be positive");
    });

    it("should check equality correctly", () => {
      const optionId1 = new OptionId(1);
      const optionId2 = new OptionId(1);
      const optionId3 = new OptionId(2);

      expect(optionId1.equals(optionId2)).toBe(true);
      expect(optionId1.equals(optionId3)).toBe(false);
    });
  });

  describe("ChoiceId", () => {
    it("should create valid ChoiceId", () => {
      const choiceId = new ChoiceId(1);
      expect(choiceId.value).toBe(1);
    });

    it("should throw error for non-positive values", () => {
      expect(() => new ChoiceId(0)).toThrow("ChoiceId must be positive");
      expect(() => new ChoiceId(-1)).toThrow("ChoiceId must be positive");
    });

    it("should check equality correctly", () => {
      const choiceId1 = new ChoiceId(1);
      const choiceId2 = new ChoiceId(1);
      const choiceId3 = new ChoiceId(2);

      expect(choiceId1.equals(choiceId2)).toBe(true);
      expect(choiceId1.equals(choiceId3)).toBe(false);
    });
  });

  describe("ProductId", () => {
    it("should create valid ProductId", () => {
      const productId = new ProductId(1);
      expect(productId.value).toBe(1);
    });

    it("should throw error for non-positive values", () => {
      expect(() => new ProductId(0)).toThrow("ProductId must be positive");
      expect(() => new ProductId(-1)).toThrow("ProductId must be positive");
    });

    it("should check equality correctly", () => {
      const productId1 = new ProductId(1);
      const productId2 = new ProductId(1);
      const productId3 = new ProductId(2);

      expect(productId1.equals(productId2)).toBe(true);
      expect(productId1.equals(productId3)).toBe(false);
    });
  });

  describe("SelectedOptions", () => {
    it("should create SelectedOptions with empty arrays", () => {
      const selectedOptions = new SelectedOptions([], []);

      expect(selectedOptions.optionIds).toHaveLength(0);
      expect(selectedOptions.choiceIds).toHaveLength(0);
      expect(selectedOptions.hasOptions()).toBe(false);
      expect(selectedOptions.hasChoices()).toBe(false);
    });

    it("should create SelectedOptions with options and choices", () => {
      const optionIds = [new OptionId(1), new OptionId(2)];
      const choiceIds = [new ChoiceId(101), new ChoiceId(102)];
      const selectedOptions = new SelectedOptions(optionIds, choiceIds);

      expect(selectedOptions.optionIds).toHaveLength(2);
      expect(selectedOptions.choiceIds).toHaveLength(2);
      expect(selectedOptions.hasOptions()).toBe(true);
      expect(selectedOptions.hasChoices()).toBe(true);
    });

    it("should detect options only", () => {
      const optionIds = [new OptionId(1)];
      const selectedOptions = new SelectedOptions(optionIds, []);

      expect(selectedOptions.hasOptions()).toBe(true);
      expect(selectedOptions.hasChoices()).toBe(false);
    });

    it("should detect choices only", () => {
      const choiceIds = [new ChoiceId(101)];
      const selectedOptions = new SelectedOptions([], choiceIds);

      expect(selectedOptions.hasOptions()).toBe(false);
      expect(selectedOptions.hasChoices()).toBe(true);
    });
  });
});
