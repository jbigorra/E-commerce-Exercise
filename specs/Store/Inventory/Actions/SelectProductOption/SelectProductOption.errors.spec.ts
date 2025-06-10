import { SelectProductOptionCommand } from "../../../../../src/Store/Inventory/Actions/SelectProductOption";
import { Product } from "../../../../../src/Store/Inventory/Core/Entities";
import { IInventory } from "../../../../../src/Store/Inventory/Interfaces";
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
import {
  expectError,
  expectSuccess,
} from "../../../../Helpers/forActions/Matchers";
import { createSelectAction, createTestInventory } from "./shared/test-setup";

describe("SelectProductOption - Error Scenarios", () => {
  let products: Product[];
  let inventory: IInventory;

  beforeEach(() => {
    products = productsFixture();
    inventory = createTestInventory(products);
  });

  it("Should return error when product is not found", () => {
    const action = createSelectAction(inventory);

    const actionResult = action.execute(
      new SelectProductOptionCommand(NOT_FOUND_PRODUCT_ID, [OPTION_1_ID], [])
    );

    expectError(actionResult, "Product not found");
  });

  it("Should return error when selecting an option on a standard product", () => {
    const action = createSelectAction(inventory);

    const actionResult = action.execute(
      new SelectProductOptionCommand(STANDARD_PRODUCT_ID, [OPTION_1_ID], [])
    );

    expectError(actionResult, "Product is not customizable");
  });

  it("Should return error when selecting unavailable options", () => {
    const action = createSelectAction(inventory);

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
    const action = createSelectAction(inventory);

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
    const inventory = createTestInventory(products);
    const action = createSelectAction(inventory);

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
    const inventory = createTestInventory(products);
    const action = createSelectAction(inventory);

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
    const inventory = createTestInventory(products);
    const action = createSelectAction(inventory);

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
