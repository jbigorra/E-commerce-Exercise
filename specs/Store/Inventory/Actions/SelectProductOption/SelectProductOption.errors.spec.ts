import { mock } from "jest-mock-extended";
import { SelectProductOptionCommand } from "../../../../../src/Store/Inventory/Actions/SelectProductOption";
import { Product } from "../../../../../src/Store/Inventory/Core/Entities";
import { InMemoryInventory } from "../../../../../src/Store/Inventory/Infrastructure/InMemoryInventory";
import { IInventory, IProductRepository } from "../../../../../src/Store/Inventory/Interfaces";
import { PartIds, ProductIds, TestScenarios } from "../../../../Fixtures/constants/ProductConstants";
import { BasicProductScenarios } from "../../../../Fixtures/scenarios/BasicProductScenarios";
import { expectError } from "../../../../Helpers/forActions/Matchers";
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
   * - Result is error
   * - Catches system errors
   */

  let products: Product[];
  let inventory: IInventory;

  beforeEach(() => {
    products = BasicProductScenarios.productsCollection();
    inventory = createTestInventory(products);
  });

  it("should return error when product is not found", () => {
    const action = createSelectAction(inventory);
    const command = new SelectProductOptionCommand(TestScenarios.NOT_FOUND_PRODUCT, [PartIds.FRAME_TYPE], []);

    const actionResult = action.execute(command);

    expectError(actionResult, "Product not found");
  });

  it("should return error when product is not customizable", () => {
    const action = createSelectAction(inventory);
    const command = new SelectProductOptionCommand(ProductIds.STANDARD_PRODUCT, [], []);

    const actionResult = action.execute(command);

    expectError(actionResult, "Product is not customizable");
  });

  it("should catch and return any error", () => {
    const productRepository = mock<IProductRepository>();
    const inventory = new InMemoryInventory(productRepository);
    productRepository.findById.mockImplementation(() => {
      throw new Error("Error thrown by findById");
    });

    const action = createSelectAction(inventory);

    const actionResult = action.execute(new SelectProductOptionCommand(1, [1], [1]));

    expectError(actionResult, "Error thrown by findById");
  });

  it("should catch error with invalid selected options", () => {
    const action = createSelectAction(inventory);
    const commandWithInvalidSelectedOptions = new SelectProductOptionCommand(ProductIds.CUSTOMIZABLE_PRODUCT, [], []);

    const actionResult = action.execute(commandWithInvalidSelectedOptions);

    expectError(actionResult);
  });
});
