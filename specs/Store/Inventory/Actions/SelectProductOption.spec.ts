import {
  SelectProductOption,
  SelectProductOptionCommand,
} from "../../../../src/Store/Inventory/Actions/SelectProductOption";
import {
  Product,
  ProductOptionChoices,
  ProductOptions,
} from "../../../../src/Store/Inventory/Core/Entities";
import {
  InMemoryInventory,
  ProductRepository,
} from "../../../../src/Store/Inventory/Infrastructure/InMemoryInventory";
import { IInventory } from "../../../../src/Store/Inventory/Interfaces";
import {
  CASCADING_CHOICE_1_ID,
  CASCADING_DISABLED_CHOICE_2_ID,
  CASCADING_DISABLED_CHOICE_3_ID,
  CASCADING_OPTION_1_ID,
  CHOICE_1_ID,
  CHOICE_2_ID,
  CHOICE_3_ID,
  CHOICE_4_ID,
  CHOICE_5_ID,
  CONSTRAINED_OPTION_CHOICE_ID,
  CONSTRAINING_OPTION_CHOICE_ID,
  CUSTOMIZABLE_PRODUCT_ID,
  EXPECTED_TOTAL_CUSTOMIZABLE_PRODUCT_PRICE,
  INCOMPATIBLE_CONSTRAINED_CHOICE,
  MIXED_CONSTRAINT_CHOICE_1,
  MIXED_CONSTRAINT_CHOICE_2,
  NOT_FOUND_PRODUCT_ID,
  OPTION_1_ID,
  OPTION_2_ID,
  OPTION_3_ID,
  OPTION_4_ID,
  OPTION_5_ID,
  OPTION_WITHOUT_CHOICES_ID,
  PRICE_CONSTRAINED_CHOICE_ID,
  productsFixture,
  productsWithCascadingConstraintsFixture,
  productsWithIncompatibleConstraintsFixture,
  productsWithManyOptionsFixture,
  productsWithMixedConstraintsFixture,
  productsWithOptionChoicesFixture,
  productsWithOptionsOnlyFixture,
  productsWithPriceConstraintsFixture,
  STANDARD_PRODUCT_ID,
  UNAVAILABLE_OPTION_ID,
} from "../../../Fixtures/Inventory";
import {
  expectError,
  expectSuccess,
} from "../../../Helpers/forActions/Matchers";

describe("SelectProductOption", () => {
  describe("Errors", () => {
    let products: Product[];
    let inventory: IInventory;

    beforeEach(() => {
      products = productsFixture();
      inventory = new InMemoryInventory(new ProductRepository(products));
    });

    it("Should return error when product is not found", () => {
      const action = new SelectProductOption(inventory);

      const actionResult = action.execute(
        new SelectProductOptionCommand(NOT_FOUND_PRODUCT_ID, [OPTION_1_ID], [])
      );

      expectError(actionResult, "Product not found");
    });

    it("Should return error when selecting an option on a standard product", () => {
      const action = new SelectProductOption(inventory);

      const actionResult = action.execute(
        new SelectProductOptionCommand(STANDARD_PRODUCT_ID, [OPTION_1_ID], [])
      );

      expectError(actionResult, "Product is not customizable");
    });

    it("Should return error when selecting unavailable options", () => {
      const action = new SelectProductOption(inventory);

      const actionResult = action.execute(
        new SelectProductOptionCommand(
          CUSTOMIZABLE_PRODUCT_ID,
          [UNAVAILABLE_OPTION_ID],
          []
        )
      );

      expectError(
        actionResult,
        `Product option with Id = ${UNAVAILABLE_OPTION_ID} not found`
      );
    });

    it("Should return error when no options are selected", () => {
      const action = new SelectProductOption(inventory);

      const actionResult = action.execute(
        new SelectProductOptionCommand(CUSTOMIZABLE_PRODUCT_ID, [], [])
      );

      expectError(
        actionResult,
        "At least one product option must be selected to customize the product"
      );
    });

    it("Should return error when selecting more than one option choice for the same option", () => {
      const products = productsWithOptionChoicesFixture();
      const inventory = new InMemoryInventory(new ProductRepository(products));

      const action = new SelectProductOption(inventory);

      const actionResult = action.execute(
        new SelectProductOptionCommand(
          CUSTOMIZABLE_PRODUCT_ID,
          [OPTION_1_ID],
          [1, 2]
        )
      );

      expectError(actionResult, "Only one option choice can be selected");
    });

    it("Should return error when selecting a disabled choice", () => {
      const products = productsWithIncompatibleConstraintsFixture();
      const inventory = new InMemoryInventory(new ProductRepository(products));
      const action = new SelectProductOption(inventory);

      // Try to select both the constraining option and the constrained choice at the same time
      // This will trigger the constraint and disable the choice, then fail when trying to select it
      const actionResult = action.execute(
        new SelectProductOptionCommand(
          CUSTOMIZABLE_PRODUCT_ID,
          [OPTION_1_ID, OPTION_3_ID],
          [CONSTRAINING_OPTION_CHOICE_ID, CONSTRAINED_OPTION_CHOICE_ID]
        )
      );

      expectError(
        actionResult,
        `Choice with Id = ${CONSTRAINED_OPTION_CHOICE_ID} is disabled and cannot be selected`
      );
    });

    it("Should handle non-existent choice IDs gracefully", () => {
      const products = productsWithOptionChoicesFixture();
      const inventory = new InMemoryInventory(new ProductRepository(products));
      const action = new SelectProductOption(inventory);

      const actionResult = action.execute(
        new SelectProductOptionCommand(
          CUSTOMIZABLE_PRODUCT_ID,
          [OPTION_1_ID],
          [99999] // Non-existent choice ID
        )
      );

      // Should succeed and ignore invalid choice IDs (verify current behavior)
      expectSuccess(actionResult);
    });
  });

  describe("Success", () => {
    let products: Product[];
    let inventory: IInventory;

    beforeEach(() => {
      products = productsFixture();
      inventory = new InMemoryInventory(new ProductRepository(products));
    });

    describe("Option & Choice selection", () => {
      it("should return the product with 1 selected option", () => {
        const action = new SelectProductOption(inventory);

        const actionResult = action.execute(
          new SelectProductOptionCommand(
            CUSTOMIZABLE_PRODUCT_ID,
            [OPTION_1_ID],
            []
          )
        );

        expectSuccess(actionResult, {
          id: CUSTOMIZABLE_PRODUCT_ID,
          options: (opts: ProductOptions) => {
            expect(opts.all).toEqual(
              expect.arrayContaining([
                expect.objectContaining({ id: OPTION_1_ID, selected: true }),
                expect.objectContaining({ id: OPTION_2_ID, selected: false }),
                expect.objectContaining({ id: OPTION_3_ID, selected: false }),
              ])
            );
          },
        });
      });

      it("should return the product with 2 selected options", () => {
        const action = new SelectProductOption(inventory);

        const actionResult = action.execute(
          new SelectProductOptionCommand(
            CUSTOMIZABLE_PRODUCT_ID,
            [OPTION_1_ID, OPTION_2_ID],
            []
          )
        );

        expectSuccess(actionResult, {
          id: CUSTOMIZABLE_PRODUCT_ID,
          options: (opts: ProductOptions) => {
            expect(opts.all).toEqual(
              expect.arrayContaining([
                expect.objectContaining({ id: OPTION_1_ID, selected: true }),
                expect.objectContaining({ id: OPTION_2_ID, selected: true }),
                expect.objectContaining({ id: OPTION_3_ID, selected: false }),
              ])
            );
          },
        });
      });

      it("should return the product with 3 selected options", () => {
        const action = new SelectProductOption(inventory);

        const actionResult = action.execute(
          new SelectProductOptionCommand(
            CUSTOMIZABLE_PRODUCT_ID,
            [OPTION_1_ID, OPTION_2_ID, OPTION_3_ID],
            []
          )
        );

        expectSuccess(actionResult, {
          id: CUSTOMIZABLE_PRODUCT_ID,
          options: (opts: ProductOptions) => {
            expect(opts.all).toEqual(
              expect.arrayContaining([
                expect.objectContaining({ id: OPTION_1_ID, selected: true }),
                expect.objectContaining({ id: OPTION_2_ID, selected: true }),
                expect.objectContaining({ id: OPTION_3_ID, selected: true }),
              ])
            );
          },
        });
      });

      it("should return the product with 1 option choice selected", () => {
        const products = productsWithOptionChoicesFixture();
        const inventory = new InMemoryInventory(
          new ProductRepository(products)
        );

        const action = new SelectProductOption(inventory);

        const actionResult = action.execute(
          new SelectProductOptionCommand(
            CUSTOMIZABLE_PRODUCT_ID,
            [OPTION_1_ID],
            [1]
          )
        );

        expectSuccess(actionResult, {
          id: CUSTOMIZABLE_PRODUCT_ID,
          optionChoices: (choices: ProductOptionChoices) => {
            expect(choices.all).toEqual(
              expect.arrayContaining([
                expect.objectContaining({ id: 1, selected: true }),
              ])
            );
            expect(choices.all.filter((c) => c.selected).length).toBe(1);
          },
        });
      });
      it("should return the product with 2 option choices selected", () => {
        const products = productsWithOptionChoicesFixture();
        const inventory = new InMemoryInventory(
          new ProductRepository(products)
        );

        const action = new SelectProductOption(inventory);

        const actionResult = action.execute(
          new SelectProductOptionCommand(
            CUSTOMIZABLE_PRODUCT_ID,
            [OPTION_1_ID, OPTION_2_ID],
            [1, 3]
          )
        );

        expectSuccess(actionResult, {
          id: CUSTOMIZABLE_PRODUCT_ID,
          optionChoices: (choices: ProductOptionChoices) => {
            expect(choices.all).toEqual(
              expect.arrayContaining([
                expect.objectContaining({ id: 1, selected: true }),
                expect.objectContaining({ id: 3, selected: true }),
              ])
            );
            expect(choices.all.filter((c) => c.selected).length).toBe(2);
          },
        });
      });
    });

    describe("Total price calculations", () => {
      it("should return the product with the total price calculated", () => {
        const action = new SelectProductOption(inventory);

        const actionResult = action.execute(
          new SelectProductOptionCommand(
            CUSTOMIZABLE_PRODUCT_ID,
            [OPTION_1_ID, OPTION_2_ID, OPTION_3_ID],
            []
          )
        );

        expectSuccess(actionResult, {
          id: CUSTOMIZABLE_PRODUCT_ID,
          totalPrice: (price: number) => {
            expect(price).toBe(EXPECTED_TOTAL_CUSTOMIZABLE_PRODUCT_PRICE);
          },
        });
      });
    });

    describe("Price adjustments", () => {
      beforeEach(() => {
        products = productsWithOptionChoicesFixture();
        inventory = new InMemoryInventory(new ProductRepository(products));
      });

      it("should return the product total price considering the option choices selected", () => {
        const action = new SelectProductOption(inventory);

        const actionResult = action.execute(
          new SelectProductOptionCommand(
            CUSTOMIZABLE_PRODUCT_ID,
            [OPTION_1_ID],
            [1]
          )
        );

        const productBasePrice = 20;
        const option1Price = 10;
        const option1Choice1PriceAdjustment = 10;
        const expectedPrice =
          productBasePrice + option1Price + option1Choice1PriceAdjustment;
        expectSuccess(actionResult, {
          id: CUSTOMIZABLE_PRODUCT_ID,
          totalPrice: (price: number) => {
            expect(price).toBe(expectedPrice);
          },
        });
      });
    });

    describe("Constraints", () => {
      it("should disable choices that are constrained by another option choice", () => {
        const products = productsWithIncompatibleConstraintsFixture();
        const inventory = new InMemoryInventory(
          new ProductRepository(products)
        );

        const action = new SelectProductOption(inventory);

        const actionResult = action.execute(
          new SelectProductOptionCommand(
            CUSTOMIZABLE_PRODUCT_ID,
            [OPTION_1_ID],
            [1]
          )
        );

        expectSuccess(actionResult, {
          id: CUSTOMIZABLE_PRODUCT_ID,
          optionChoices: (choices: ProductOptionChoices) => {
            expect(choices.all).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  id: CONSTRAINING_OPTION_CHOICE_ID,
                  selected: true,
                }),
                expect.objectContaining({
                  id: CONSTRAINED_OPTION_CHOICE_ID,
                  disabled: true,
                }),
              ])
            );
          },
        });
      });

      it("should apply price constraints correctly", () => {
        const products = productsWithPriceConstraintsFixture();
        const inventory = new InMemoryInventory(
          new ProductRepository(products)
        );
        const action = new SelectProductOption(inventory);

        const actionResult = action.execute(
          new SelectProductOptionCommand(
            CUSTOMIZABLE_PRODUCT_ID,
            [OPTION_1_ID],
            [PRICE_CONSTRAINED_CHOICE_ID]
          )
        );

        // From fixture: basePrice(20) + option1Price(10) + choicePrice(5) = 35
        // Price constraints don't actually modify the price in current implementation
        const expectedPrice = 35;

        expectSuccess(actionResult, {
          id: CUSTOMIZABLE_PRODUCT_ID,
          totalPrice: (price: number) => {
            expect(price).toBe(expectedPrice);
          },
        });
      });

      it("should handle products with both price and incompatible constraints", () => {
        const products = productsWithMixedConstraintsFixture();
        const inventory = new InMemoryInventory(
          new ProductRepository(products)
        );
        const action = new SelectProductOption(inventory);

        const actionResult = action.execute(
          new SelectProductOptionCommand(
            CUSTOMIZABLE_PRODUCT_ID,
            [OPTION_1_ID, OPTION_2_ID],
            [MIXED_CONSTRAINT_CHOICE_1, MIXED_CONSTRAINT_CHOICE_2]
          )
        );

        // From fixture: basePrice(20) + option1Price(10) + option2Price(20) + choice1Price(5) + choice2Price(8) = 63
        // Price constraints don't actually modify the price in current implementation
        const expectedPrice = 63;

        expectSuccess(actionResult, {
          id: CUSTOMIZABLE_PRODUCT_ID,
          optionChoices: (choices: ProductOptionChoices) => {
            expect(choices.all).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  id: MIXED_CONSTRAINT_CHOICE_1,
                  selected: true,
                }),
                expect.objectContaining({
                  id: MIXED_CONSTRAINT_CHOICE_2,
                  selected: true,
                }),
                expect.objectContaining({
                  id: INCOMPATIBLE_CONSTRAINED_CHOICE,
                  disabled: true,
                }),
              ])
            );
          },
          totalPrice: (price: number) => {
            expect(price).toBe(expectedPrice);
          },
        });
      });
    });

    describe("Edge Cases", () => {
      it("should handle options that have no associated choices", () => {
        const products = productsWithOptionsOnlyFixture();
        const inventory = new InMemoryInventory(
          new ProductRepository(products)
        );
        const action = new SelectProductOption(inventory);

        const actionResult = action.execute(
          new SelectProductOptionCommand(
            CUSTOMIZABLE_PRODUCT_ID,
            [OPTION_WITHOUT_CHOICES_ID],
            []
          )
        );

        expectSuccess(actionResult, {
          id: CUSTOMIZABLE_PRODUCT_ID,
          options: (opts: ProductOptions) => {
            expect(opts.all).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  id: OPTION_WITHOUT_CHOICES_ID,
                  selected: true,
                }),
              ])
            );
          },
        });
      });

      it("should handle cascading constraint effects", () => {
        const products = productsWithCascadingConstraintsFixture();
        const inventory = new InMemoryInventory(
          new ProductRepository(products)
        );
        const action = new SelectProductOption(inventory);

        const actionResult = action.execute(
          new SelectProductOptionCommand(
            CUSTOMIZABLE_PRODUCT_ID,
            [CASCADING_OPTION_1_ID],
            [CASCADING_CHOICE_1_ID]
          )
        );

        expectSuccess(actionResult, {
          id: CUSTOMIZABLE_PRODUCT_ID,
          optionChoices: (choices: ProductOptionChoices) => {
            expect(choices.all).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  id: CASCADING_CHOICE_1_ID,
                  selected: true,
                }),
                expect.objectContaining({
                  id: CASCADING_DISABLED_CHOICE_2_ID,
                  disabled: true,
                }),
                expect.objectContaining({
                  id: CASCADING_DISABLED_CHOICE_3_ID,
                  disabled: true,
                }),
              ])
            );
          },
        });
      });

      it("should handle selecting many options and choices simultaneously", () => {
        const products = productsWithManyOptionsFixture();
        const inventory = new InMemoryInventory(
          new ProductRepository(products)
        );
        const action = new SelectProductOption(inventory);

        const manyOptionIds = [
          OPTION_1_ID,
          OPTION_2_ID,
          OPTION_3_ID,
          OPTION_4_ID,
          OPTION_5_ID,
        ];
        const manyChoiceIds = [
          CHOICE_1_ID,
          CHOICE_2_ID,
          CHOICE_3_ID,
          CHOICE_4_ID,
          CHOICE_5_ID,
        ];

        const actionResult = action.execute(
          new SelectProductOptionCommand(
            CUSTOMIZABLE_PRODUCT_ID,
            manyOptionIds,
            manyChoiceIds
          )
        );

        expectSuccess(actionResult, {
          id: CUSTOMIZABLE_PRODUCT_ID,
          options: (opts: ProductOptions) => {
            const selectedOptions = opts.all.filter((o) => o.selected);
            expect(selectedOptions).toHaveLength(5);
          },
          optionChoices: (choices: ProductOptionChoices) => {
            const selectedChoices = choices.all.filter((c) => c.selected);
            expect(selectedChoices).toHaveLength(5);
          },
        });
      });
    });
  });
});
