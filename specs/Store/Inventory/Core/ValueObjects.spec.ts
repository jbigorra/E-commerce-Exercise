import { SelectedOptions } from "../../../../src/Store/Inventory/Core/ValueObjects";

describe("ValueObjects", () => {
  describe("SelectedOptions", () => {
    it("should create SelectedOptions with empty arrays", () => {
      const selectedOptions = new SelectedOptions([], []);

      expect(selectedOptions.optionIds).toHaveLength(0);
      expect(selectedOptions.choiceIds).toHaveLength(0);
      expect(selectedOptions.hasOptions()).toBe(false);
      expect(selectedOptions.hasChoices()).toBe(false);
    });

    it("should create SelectedOptions with options and choices", () => {
      const optionIds = [1, 2];
      const choiceIds = [101, 102];
      const selectedOptions = new SelectedOptions(optionIds, choiceIds);

      expect(selectedOptions.optionIds).toHaveLength(2);
      expect(selectedOptions.choiceIds).toHaveLength(2);
      expect(selectedOptions.hasOptions()).toBe(true);
      expect(selectedOptions.hasChoices()).toBe(true);
    });

    it("should detect options only", () => {
      const optionIds = [1];
      const selectedOptions = new SelectedOptions(optionIds, []);

      expect(selectedOptions.hasOptions()).toBe(true);
      expect(selectedOptions.hasChoices()).toBe(false);
    });

    it("should detect choices only", () => {
      const choiceIds = [101];
      const selectedOptions = new SelectedOptions([], choiceIds);

      expect(selectedOptions.hasOptions()).toBe(false);
      expect(selectedOptions.hasChoices()).toBe(true);
    });
  });
});
