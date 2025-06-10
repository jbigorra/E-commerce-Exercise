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
  TestScenarios,
} from "../../../../Fixtures/constants/ProductConstants";
import { BasicProductScenarios } from "../../../../Fixtures/scenarios/BasicProductScenarios";
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
      products = BasicProductScenarios.productsCollection();
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
        ProductIds.CUSTOMIZABLE_PRODUCT,
        [1],
        []
      );

      // Act
      const actionResult = action.execute(command);

      // Assert
      expectSuccess(actionResult, {
        id: ProductIds.CUSTOMIZABLE_PRODUCT,
        options: (opts: ProductOptions) => {
          expect(opts.all).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ id: 1, selected: true }),
              expect.objectContaining({ id: 2, selected: false }),
              expect.objectContaining({ id: 3, selected: false }),
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
        ProductIds.CUSTOMIZABLE_PRODUCT,
        [1, 2],
        []
      );

      // Act
      const actionResult = action.execute(command);

      // Assert
      expectSuccess(actionResult, {
        id: ProductIds.CUSTOMIZABLE_PRODUCT,
        options: (opts: ProductOptions) => {
          expect(opts.all).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ id: 1, selected: true }),
              expect.objectContaining({ id: 2, selected: true }),
              expect.objectContaining({ id: 3, selected: false }),
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
        ProductIds.CUSTOMIZABLE_PRODUCT,
        [1, 2, 3],
        []
      );

      // Act
      const actionResult = action.execute(command);

      // Assert
      expectSuccess(actionResult, {
        id: ProductIds.CUSTOMIZABLE_PRODUCT,
        options: (opts: ProductOptions) => {
          expect(opts.all).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ id: 1, selected: true }),
              expect.objectContaining({ id: 2, selected: true }),
              expect.objectContaining({ id: 3, selected: true }),
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

    /**
     * Verifies multiple choice selection with locally created test data.
     * Business Rule: Multiple choices from different options can be selected simultaneously.
     */
    it("should return the product with 2 option choices selected", () => {
      // Arrange - Create focused test data with choices for multiple options
      const frameOption = new ProductOptionBuilder()
        .withId(OptionIds.FRAME_TYPE)
        .withPrice(10)
        .build();

      const wheelsOption = new ProductOptionBuilder()
        .withId(OptionIds.WHEELS)
        .withPrice(20)
        .build();

      const frameChoice = new ProductOptionChoiceBuilder()
        .withId(ChoiceIds.FULL_SUSPENSION_FRAME)
        .forOption(OptionIds.FRAME_TYPE)
        .withPriceAdjustment(5)
        .build();

      const wheelsChoice = new ProductOptionChoiceBuilder()
        .withId(ChoiceIds.ROAD_WHEELS)
        .forOption(OptionIds.WHEELS)
        .withPriceAdjustment(15)
        .build();

      const testProduct = new ProductBuilder()
        .withId(ProductIds.CUSTOMIZABLE_PRODUCT)
        .asCustomizable()
        .withOption(frameOption)
        .withOption(wheelsOption)
        .withOptionChoice(frameChoice)
        .withOptionChoice(wheelsChoice)
        .build();

      const inventory = createTestInventory([testProduct]);
      const action = createSelectAction(inventory);
      const command = new SelectProductOptionCommand(
        ProductIds.CUSTOMIZABLE_PRODUCT,
        [OptionIds.FRAME_TYPE, OptionIds.WHEELS],
        [ChoiceIds.FULL_SUSPENSION_FRAME, ChoiceIds.ROAD_WHEELS]
      );

      // Act
      const actionResult = action.execute(command);

      // Assert
      expectSuccess(actionResult, {
        id: ProductIds.CUSTOMIZABLE_PRODUCT,
        optionChoices: (choices: ProductOptionChoices) => {
          expect(choices.all).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: ChoiceIds.FULL_SUSPENSION_FRAME,
                selected: true,
              }),
              expect.objectContaining({
                id: ChoiceIds.ROAD_WHEELS,
                selected: true,
              }),
            ])
          );
        },
      });
    });
  });

  describe("Price calculations", () => {
    /**
     * Verifies that base product price is calculated correctly.
     * Business Rule: Base price should be returned when no options are selected.
     */
    it("should return the product with the base price when no option choice selected", () => {
      // Arrange - Create minimal test product with explicit pricing
      const testOption = new ProductOptionBuilder()
        .withId(OptionIds.FRAME_TYPE)
        .withPrice(10)
        .build();

      const testProduct = new ProductBuilder()
        .withId(ProductIds.CUSTOMIZABLE_PRODUCT)
        .asCustomizable()
        .withBasePrice(20)
        .withOption(testOption)
        .build();

      const inventory = createTestInventory([testProduct]);
      const action = createSelectAction(inventory);
      const command = new SelectProductOptionCommand(
        ProductIds.CUSTOMIZABLE_PRODUCT,
        [OptionIds.FRAME_TYPE],
        []
      );

      // Act
      const actionResult = action.execute(command);

      // Assert
      expectSuccess(actionResult);
      expectTotalPrice(actionResult.result!, 30); // 20 base + 10 option
    });

    /**
     * Verifies complete price calculation with options and choices.
     * Business Rule: Total = base price + option prices + choice adjustments.
     */
    it("should return the product with the total price when option choices are selected", () => {
      // Arrange - Create complete pricing scenario
      const frameOption = new ProductOptionBuilder()
        .withId(OptionIds.FRAME_TYPE)
        .withPrice(10)
        .build();

      const wheelsOption = new ProductOptionBuilder()
        .withId(OptionIds.WHEELS)
        .withPrice(20)
        .build();

      const frameChoice = new ProductOptionChoiceBuilder()
        .withId(ChoiceIds.FULL_SUSPENSION_FRAME)
        .forOption(OptionIds.FRAME_TYPE)
        .withPriceAdjustment(15) // Premium upgrade
        .build();

      const wheelsChoice = new ProductOptionChoiceBuilder()
        .withId(ChoiceIds.ROAD_WHEELS)
        .forOption(OptionIds.WHEELS)
        .withPriceAdjustment(25) // Premium wheels
        .build();

      const testProduct = new ProductBuilder()
        .withId(ProductIds.CUSTOMIZABLE_PRODUCT)
        .asCustomizable()
        .withBasePrice(20)
        .withOption(frameOption)
        .withOption(wheelsOption)
        .withOptionChoice(frameChoice)
        .withOptionChoice(wheelsChoice)
        .build();

      const inventory = createTestInventory([testProduct]);
      const action = createSelectAction(inventory);
      const command = new SelectProductOptionCommand(
        ProductIds.CUSTOMIZABLE_PRODUCT,
        [OptionIds.FRAME_TYPE, OptionIds.WHEELS],
        [ChoiceIds.FULL_SUSPENSION_FRAME, ChoiceIds.ROAD_WHEELS]
      );

      // Act
      const actionResult = action.execute(command);

      // Assert - Total: 20 base + 10 frame + 20 wheels + 15 frame adj + 25 wheels adj = 90
      expectSuccess(actionResult);
      expectTotalPrice(actionResult.result!, 90);
    });

    /**
     * Verifies legacy price calculation maintains compatibility.
     * Uses expected total from original test to ensure backwards compatibility.
     */
    it("should return product with expected total matching legacy calculation", () => {
      // Arrange - Use standard test data that matches legacy expectations
      const products = BasicProductScenarios.productsCollection();
      const inventory = createTestInventory(products);
      const action = createSelectAction(inventory);
      const command = new SelectProductOptionCommand(
        ProductIds.CUSTOMIZABLE_PRODUCT,
        [1, 2, 3], // BasicProductScenarios uses option IDs 1, 2, 3
        []
      );

      // Act
      const actionResult = action.execute(command);

      // Assert - Verify matches legacy expected total
      expectSuccess(actionResult);
      expectTotalPrice(
        actionResult.result!,
        TestScenarios.EXPECTED_TOTAL_CUSTOMIZABLE_PRICE
      );
    });
  });
});
