import { SelectedOptions } from "../../../../src/Store/ProductCatalog/Core/ValueObjects";

describe("ValueObjects", () => {
  describe("SelectedOptions", () => {
    describe("Constructor validation", () => {
      it("should throw error when no parts are provided", () => {
        expect(() => {
          new SelectedOptions([], [101, 102]);
        }).toThrow("At least one product part must be selected to customize the product");
      });

      it("should throw error when no part choices are provided", () => {
        expect(() => {
          new SelectedOptions([1, 2], []);
        }).toThrow("At least one product part choice must be selected to customize the product");
      });

      it("should throw error when both parts and part choices are empty", () => {
        expect(() => {
          new SelectedOptions([], []);
        }).toThrow("At least one product part must be selected to customize the product");
      });

      it("should throw error when duplicate part choices are provided", () => {
        expect(() => {
          new SelectedOptions([1, 2], [101, 101, 102]);
        }).toThrow("Only one part choice can be selected per part");
      });

      it("should create valid SelectedOptions with unique parts and part choices", () => {
        const partIds = [1, 2, 3];
        const partChoiceIds = [101, 102, 103];

        expect(() => {
          new SelectedOptions(partIds, partChoiceIds);
        }).not.toThrow();

        const selectedOptions = new SelectedOptions(partIds, partChoiceIds);
        expect(selectedOptions.partIds).toEqual(partIds);
        expect(selectedOptions.choiceIds).toEqual(partChoiceIds);
      });
    });
  });
});
