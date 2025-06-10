import { SelectProductOptionCommand } from "../../../../../src/Store/Inventory/Actions/SelectProductOption";
import { Product } from "../../../../../src/Store/Inventory/Core/Entities";
import { IInventory } from "../../../../../src/Store/Inventory/Interfaces";
import { ProductIds } from "../../../../Fixtures/constants/ProductConstants";
import {
  CONSTRAINED_OPTION_CHOICE_ID,
  CONSTRAINING_OPTION_CHOICE_ID,
  CUSTOMIZABLE_PRODUCT_ID,
  NOT_FOUND_PRODUCT_ID,
  OPTION_1_ID,
  OPTION_3_ID,
  productsFixture,
  productsWithIncompatibleConstraintsFixture,
  productsWithOptionChoicesFixture,
  STANDARD_PRODUCT_ID,
  UNAVAILABLE_OPTION_ID,
} from "../../../../Fixtures/Inventory";
import { BasicProductScenarios } from "../../../../Fixtures/scenarios/BasicProductScenarios";
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
    products = productsFixture();
    inventory = createTestInventory(products);
  });

  /**
   * Verifies error handling when product doesn't exist in inventory.
   */
  it("should return error when product is not found", () => {
    // Arrange
    const action = createSelectAction(inventory);
    const command = new SelectProductOptionCommand(
      NOT_FOUND_PRODUCT_ID,
      [OPTION_1_ID],
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
      STANDARD_PRODUCT_ID,
      [OPTION_1_ID],
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
      CUSTOMIZABLE_PRODUCT_ID,
      [UNAVAILABLE_OPTION_ID],
      []
    );

    // Act
    const actionResult = action.execute(command);

    // Assert
    expectError(
      actionResult,
      `Product option with Id = ${UNAVAILABLE_OPTION_ID} not found`
    );
  });

  /**
   * Verifies error handling when no options are provided for customization.
   */
  it("should return error when no options are selected", () => {
    // Arrange
    const action = createSelectAction(inventory);
    const command = new SelectProductOptionCommand(
      CUSTOMIZABLE_PRODUCT_ID,
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
    // Arrange
    const products = productsWithOptionChoicesFixture();
    const inventory = createTestInventory(products);
    const action = createSelectAction(inventory);
    const command = new SelectProductOptionCommand(
      CUSTOMIZABLE_PRODUCT_ID,
      [OPTION_1_ID],
      [1, 2] // Multiple choices for same option
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
    // Arrange
    const products = productsWithIncompatibleConstraintsFixture();
    const inventory = createTestInventory(products);
    const action = createSelectAction(inventory);
    // Try to select both the constraining option and the constrained choice at the same time
    // This will trigger the constraint and disable the choice, then fail when trying to select it
    const command = new SelectProductOptionCommand(
      CUSTOMIZABLE_PRODUCT_ID,
      [OPTION_1_ID, OPTION_3_ID],
      [CONSTRAINING_OPTION_CHOICE_ID, CONSTRAINED_OPTION_CHOICE_ID]
    );

    // Act
    const actionResult = action.execute(command);

    // Assert
    expectError(
      actionResult,
      `Choice with Id = ${CONSTRAINED_OPTION_CHOICE_ID} is disabled and cannot be selected`
    );
  });

  /**
   * Verifies graceful handling of non-existent choice IDs.
   * Business Rule: Invalid choice IDs should be ignored rather than causing errors.
   */
  it("should handle non-existent choice IDs gracefully", () => {
    // Arrange
    const products = productsWithOptionChoicesFixture();
    const inventory = createTestInventory(products);
    const action = createSelectAction(inventory);
    const command = new SelectProductOptionCommand(
      CUSTOMIZABLE_PRODUCT_ID,
      [OPTION_1_ID],
      [99999] // Non-existent choice ID
    );

    // Act
    const actionResult = action.execute(command);

    // Assert - Should succeed and ignore invalid choice IDs (verify current behavior)
    expectSuccess(actionResult);
  });

  /**
   * Demonstrates new builder pattern for creating focused test scenarios.
   * This shows the future direction for test data creation.
   */
  it("should demonstrate new builder pattern for basic error case", () => {
    // Arrange - explicit data creation using builders
    const products = BasicProductScenarios.productsCollection();
    const inventory = createTestInventory(products);
    const action = createSelectAction(inventory);
    const command = new SelectProductOptionCommand(
      ProductIds.STANDARD_PRODUCT,
      [1],
      []
    );

    // Act
    const actionResult = action.execute(command);

    // Assert
    expectError(actionResult, "Product is not customizable");
  });
});
