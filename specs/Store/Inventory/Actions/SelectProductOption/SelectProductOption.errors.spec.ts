import { SelectProductOptionCommand } from "../../../../../src/Store/Inventory/Actions/SelectProductOption";
import { Product } from "../../../../../src/Store/Inventory/Core/Entities";
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
import { IncompatibleConstraintScenarios } from "../../../../Fixtures/scenarios/IncompatibleConstraintScenarios";
import {
  expectError,
  expectSuccess,
} from "../../../../Helpers/forActions/Matchers";
import { createSelectAction, createTestInventory } from "./shared/test-setup";

describe("SelectProductOption - Error Scenarios", () => {
  /**
   * Test Suite: Error Handling Validation
   *
   * This suite verifies that the SelectProductOption action properly handles
   * invalid inputs and edge cases by returning appropriate error messages.
   *
   * Error categories tested:
   * - Product not found
   * - Invalid product types
   * - Missing or invalid options
   * - Constraint violations
   */

  let products: Product[];
  let inventory: IInventory;

  beforeEach(() => {
    products = BasicProductScenarios.productsCollection();
    inventory = createTestInventory(products);
  });

  /**
   * Verifies error handling when product doesn't exist in inventory.
   */
  it("should return error when product is not found", () => {
    // Arrange
    const action = createSelectAction(inventory);
    const command = new SelectProductOptionCommand(
      TestScenarios.NOT_FOUND_PRODUCT,
      [OptionIds.FRAME_TYPE],
      []
    );

    // Act
    const actionResult = action.execute(command);

    // Assert
    expectError(actionResult, "Product not found");
  });

  /**
   * Verifies error handling when attempting to customize non-customizable products.
   */
  it("should return error when selecting an option on a standard product", () => {
    // Arrange
    const action = createSelectAction(inventory);
    const command = new SelectProductOptionCommand(
      ProductIds.STANDARD_PRODUCT,
      [OptionIds.FRAME_TYPE],
      []
    );

    // Act
    const actionResult = action.execute(command);

    // Assert
    expectError(actionResult, "Product is not customizable");
  });

  /**
   * Verifies error handling when selecting options that don't exist on the product.
   */
  it("should return error when selecting unavailable options", () => {
    // Arrange
    const action = createSelectAction(inventory);
    const command = new SelectProductOptionCommand(
      ProductIds.CUSTOMIZABLE_PRODUCT,
      [TestScenarios.UNAVAILABLE_OPTION],
      []
    );

    // Act
    const actionResult = action.execute(command);

    // Assert
    expectError(
      actionResult,
      `Product option with Id = ${TestScenarios.UNAVAILABLE_OPTION} not found`
    );
  });

  /**
   * Verifies error handling when no options are provided for customization.
   */
  it("should return error when no options are selected", () => {
    // Arrange
    const action = createSelectAction(inventory);
    const command = new SelectProductOptionCommand(
      ProductIds.CUSTOMIZABLE_PRODUCT,
      [],
      []
    );

    // Act
    const actionResult = action.execute(command);

    // Assert
    expectError(
      actionResult,
      "At least one product option must be selected to customize the product"
    );
  });

  /**
   * Verifies error handling when multiple choices are selected for the same option.
   */
  it("should return error when selecting more than one option choice for the same option", () => {
    // Arrange - Create test data with choices for the same option
    const testOption = new ProductOptionBuilder()
      .withId(OptionIds.FRAME_TYPE)
      .withPrice(10)
      .build();

    const choice1 = new ProductOptionChoiceBuilder()
      .withId(ChoiceIds.FULL_SUSPENSION_FRAME)
      .forOption(OptionIds.FRAME_TYPE)
      .withPriceAdjustment(5)
      .build();

    const choice2 = new ProductOptionChoiceBuilder()
      .withId(ChoiceIds.DIAMOND_FRAME)
      .forOption(OptionIds.FRAME_TYPE)
      .withPriceAdjustment(10)
      .build();

    const testProduct = new ProductBuilder()
      .withId(ProductIds.CUSTOMIZABLE_PRODUCT)
      .asCustomizable()
      .withOption(testOption)
      .withOptionChoice(choice1)
      .withOptionChoice(choice2)
      .build();

    const inventory = createTestInventory([testProduct]);
    const action = createSelectAction(inventory);
    const command = new SelectProductOptionCommand(
      ProductIds.CUSTOMIZABLE_PRODUCT,
      [OptionIds.FRAME_TYPE],
      [ChoiceIds.FULL_SUSPENSION_FRAME, ChoiceIds.DIAMOND_FRAME] // Multiple choices for same option
    );

    // Act
    const actionResult = action.execute(command);

    // Assert
    expectError(actionResult, "Only one option choice can be selected");
  });

  /**
   * Verifies error handling when attempting to select disabled choices.
   * Business Rule: Disabled choices cannot be selected due to constraint violations.
   */
  it("should return error when selecting a disabled choice", () => {
    // Arrange - Use scenario factory for incompatible constraints
    const products = IncompatibleConstraintScenarios.productsCollection();
    const inventory = createTestInventory(products);
    const action = createSelectAction(inventory);

    // Try to select both the constraining option and the constrained choice at the same time
    // This will trigger the constraint and disable the choice, then fail when trying to select it
    // Note: IncompatibleConstraintScenarios uses option IDs 1, 3 and choice IDs 1, 5
    const command = new SelectProductOptionCommand(
      ProductIds.CUSTOMIZABLE_PRODUCT,
      [1, 3], // Option IDs from the scenario
      [
        TestScenarios.CONSTRAINING_OPTION_CHOICE,
        TestScenarios.CONSTRAINED_OPTION_CHOICE,
      ]
    );

    // Act
    const actionResult = action.execute(command);

    // Assert
    expectError(
      actionResult,
      `Choice with Id = ${TestScenarios.CONSTRAINED_OPTION_CHOICE} is disabled and cannot be selected`
    );
  });

  /**
   * Verifies graceful handling of non-existent choice IDs.
   * Business Rule: Invalid choice IDs should be ignored rather than causing errors.
   */
  it("should handle non-existent choice IDs gracefully", () => {
    // Arrange - Create test data with choices using builders
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
      [99999] // Non-existent choice ID
    );

    // Act
    const actionResult = action.execute(command);

    // Assert - Should succeed and ignore invalid choice IDs (verify current behavior)
    expectSuccess(actionResult);
  });
});
