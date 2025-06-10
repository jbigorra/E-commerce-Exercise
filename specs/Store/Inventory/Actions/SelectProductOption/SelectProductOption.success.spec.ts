import { SelectProductOptionCommand } from "../../../../../src/Store/Inventory/Actions/SelectProductOption";
import {
  Product,
  ProductOptionChoices,
  ProductOptions,
} from "../../../../../src/Store/Inventory/Core/Entities";
import { IInventory } from "../../../../../src/Store/Inventory/Interfaces";
import { ProductBuilder } from "../../../../Fixtures/builders/ProductBuilder";
import { ProductOptionBuilder } from "../../../../Fixtures/builders/ProductOptionBuilder";
import { ProductOptionChoiceBuilder } from "../../../../Fixtures/builders/ProductOptionChoiceBuilder";
import {
  ChoiceIds,
  OptionIds,
  ProductIds,
} from "../../../../Fixtures/constants/ProductConstants";
import {
  CUSTOMIZABLE_PRODUCT_ID,
  EXPECTED_TOTAL_CUSTOMIZABLE_PRODUCT_PRICE,
  OPTION_1_ID,
  OPTION_2_ID,
  OPTION_3_ID,
  productsFixture,
  productsWithOptionChoicesFixture,
} from "../../../../Fixtures/Inventory";
import { expectSuccess } from "../../../../Helpers/forActions/Matchers";
import {
  expectSelectedChoices,
  expectTotalPrice,
} from "./shared/custom-matchers";
import { createSelectAction, createTestInventory } from "./shared/test-setup";

describe("SelectProductOption - Success Scenarios", () => {
  /**
   * Test Suite: Successful Product Option Selection
   *
   * This suite validates core product customization functionality:
   * - Option selection and state management
   * - Choice selection with option associations
   * - Price calculation accuracy
   * - Product state consistency after modifications
   *
   * Test Data Strategy: Each test creates its own specific data using builders
   * for maximum clarity and independence.
   */

  describe("Option & Choice selection", () => {
    let products: Product[];
    let inventory: IInventory;

    beforeEach(() => {
      products = productsFixture();
      inventory = createTestInventory(products);
    });

    /**
     * Verifies single option selection behavior.
     * Business Rule: Selecting an option should mark only that option as selected.
     */
    it("should return the product with 1 selected option", () => {
      // Arrange
      const action = createSelectAction(inventory);
      const command = new SelectProductOptionCommand(
        CUSTOMIZABLE_PRODUCT_ID,
        [OPTION_1_ID],
        []
      );

      // Act
      const actionResult = action.execute(command);

      // Assert
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

    /**
     * Verifies multiple option selection behavior.
     * Business Rule: Multiple options can be selected simultaneously.
     */
    it("should return the product with 2 selected options", () => {
      // Arrange
      const action = createSelectAction(inventory);
      const command = new SelectProductOptionCommand(
        CUSTOMIZABLE_PRODUCT_ID,
        [OPTION_1_ID, OPTION_2_ID],
        []
      );

      // Act
      const actionResult = action.execute(command);

      // Assert
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

    /**
     * Verifies maximum option selection behavior.
     * Business Rule: All available options can be selected if desired.
     */
    it("should return the product with 3 selected options", () => {
      // Arrange
      const action = createSelectAction(inventory);
      const command = new SelectProductOptionCommand(
        CUSTOMIZABLE_PRODUCT_ID,
        [OPTION_1_ID, OPTION_2_ID, OPTION_3_ID],
        []
      );

      // Act
      const actionResult = action.execute(command);

      // Assert
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

    /**
     * Verifies single choice selection with local test data.
     * Demonstrates test data locality using inline product creation.
     */
    it("should return the product with 1 option choice selected", () => {
      // Arrange - Create focused test data locally
      const testOption = new ProductOptionBuilder()
        .withId(OptionIds.FRAME_TYPE)
        .withPrice(10)
        .build();

      const testChoice = new ProductOptionChoiceBuilder()
        .withId(ChoiceIds.FULL_SUSPENSION_FRAME)
        .forOption(OptionIds.FRAME_TYPE)
        .withPriceAdjustment(5)
        .build();

      const testProduct = new ProductBuilder()
        .withId(ProductIds.CUSTOMIZABLE_PRODUCT)
        .asCustomizable()
        .withOption(testOption)
        .withOptionChoice(testChoice)
        .build();

      const inventory = createTestInventory([testProduct]);
      const action = createSelectAction(inventory);
      const command = new SelectProductOptionCommand(
        ProductIds.CUSTOMIZABLE_PRODUCT,
        [OptionIds.FRAME_TYPE],
        [ChoiceIds.FULL_SUSPENSION_FRAME]
      );

      // Act
      const actionResult = action.execute(command);

      // Assert - Use enhanced matchers for clarity
      expectSuccess(actionResult);
      expectSelectedChoices(actionResult.result!, [
        ChoiceIds.FULL_SUSPENSION_FRAME,
      ]);
    });

    it("should return the product with 2 option choices selected", () => {
      const products = productsWithOptionChoicesFixture();
      const inventory = createTestInventory(products);
      const action = createSelectAction(inventory);

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
    let products: Product[];
    let inventory: IInventory;

    beforeEach(() => {
      products = productsFixture();
      inventory = createTestInventory(products);
    });

    /**
     * Verifies price calculation accuracy.
     * Business Rule: Total price = base price + sum of selected option prices.
     */
    it("should return the product with the total price calculated", () => {
      // Arrange
      const action = createSelectAction(inventory);
      const command = new SelectProductOptionCommand(
        CUSTOMIZABLE_PRODUCT_ID,
        [OPTION_1_ID, OPTION_2_ID, OPTION_3_ID],
        []
      );

      // Act
      const actionResult = action.execute(command);

      // Assert
      expectSuccess(actionResult, {
        id: CUSTOMIZABLE_PRODUCT_ID,
        totalPrice: (price: number) => {
          expect(price).toBe(EXPECTED_TOTAL_CUSTOMIZABLE_PRODUCT_PRICE);
        },
      });
    });
  });

  describe("Price adjustments", () => {
    /**
     * Verifies choice price adjustments with self-contained test data.
     * Demonstrates test independence by creating all necessary data inline.
     */
    it("should return the product total price considering the option choices selected", () => {
      // Arrange - Create test data with explicit pricing
      const BASE_PRICE = 20;
      const OPTION_PRICE = 10;
      const CHOICE_PRICE = 10;
      const EXPECTED_TOTAL = BASE_PRICE + OPTION_PRICE + CHOICE_PRICE;

      const testChoice = new ProductOptionChoiceBuilder()
        .withId(ChoiceIds.FULL_SUSPENSION_FRAME)
        .forOption(OptionIds.FRAME_TYPE)
        .withPriceAdjustment(CHOICE_PRICE)
        .build();

      const testOption = new ProductOptionBuilder()
        .withId(OptionIds.FRAME_TYPE)
        .withPrice(OPTION_PRICE)
        .build();

      const testProduct = new ProductBuilder()
        .withId(ProductIds.CUSTOMIZABLE_PRODUCT)
        .asCustomizable()
        .withBasePrice(BASE_PRICE)
        .withOption(testOption)
        .withOptionChoice(testChoice)
        .build();

      const inventory = createTestInventory([testProduct]);
      const action = createSelectAction(inventory);
      const command = new SelectProductOptionCommand(
        ProductIds.CUSTOMIZABLE_PRODUCT,
        [OptionIds.FRAME_TYPE],
        [ChoiceIds.FULL_SUSPENSION_FRAME]
      );

      // Act
      const actionResult = action.execute(command);

      // Assert - Use enhanced matcher for clear price verification
      expectSuccess(actionResult);
      expectTotalPrice(actionResult.result!, EXPECTED_TOTAL);
    });
  });
});
