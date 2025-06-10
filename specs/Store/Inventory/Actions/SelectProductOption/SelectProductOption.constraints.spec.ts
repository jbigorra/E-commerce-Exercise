import { SelectProductOptionCommand } from "../../../../../src/Store/Inventory/Actions/SelectProductOption";
import {
  CONSTRAINED_OPTION_CHOICE_ID,
  CONSTRAINING_OPTION_CHOICE_ID,
  CUSTOMIZABLE_PRODUCT_ID,
  INCOMPATIBLE_CONSTRAINED_CHOICE,
  MIXED_CONSTRAINT_CHOICE_1,
  MIXED_CONSTRAINT_CHOICE_2,
  OPTION_1_ID,
  OPTION_2_ID,
  PRICE_CONSTRAINED_CHOICE_ID,
  productsWithIncompatibleConstraintsFixture,
  productsWithMixedConstraintsFixture,
  productsWithPriceConstraintsFixture,
} from "../../../../Fixtures/Inventory";
import { expectSuccess } from "../../../../Helpers/forActions/Matchers";
import {
  expectConstraintEffect,
  expectProductState,
  expectTotalPrice,
} from "./shared/custom-matchers";
import { createSelectAction, createTestInventory } from "./shared/test-setup";

describe("SelectProductOption - Product Constraint System", () => {
  /**
   * Test Suite: Product Constraint System Verification
   *
   * This suite validates the constraint engine's ability to:
   * - Enforce incompatible choice restrictions (e.g., certain components cannot be combined)
   * - Apply price adjustments based on component compatibility
   * - Handle complex scenarios with multiple constraint types simultaneously
   *
   * Business Context: In product customization, certain combinations are invalid due to
   * manufacturing limitations, design conflicts, or business rules.
   */

  /**
   * Verifies incompatible constraint behavior.
   * Business Rule: When one choice is selected, it can disable other conflicting choices
   * to prevent invalid product configurations.
   */
  it("should disable conflicting choices when incompatible constraint is triggered", () => {
    // Arrange
    const products = productsWithIncompatibleConstraintsFixture();
    const inventory = createTestInventory(products);
    const action = createSelectAction(inventory);

    // Act - Select a choice that should trigger constraint effects
    const actionResult = action.execute(
      new SelectProductOptionCommand(
        CUSTOMIZABLE_PRODUCT_ID,
        [OPTION_1_ID],
        [1]
      )
    );

    // Assert - Verify constraint was applied correctly using enhanced matchers
    expectSuccess(actionResult);
    expectConstraintEffect(
      actionResult.result!,
      [CONSTRAINING_OPTION_CHOICE_ID], // should be selected
      [CONSTRAINED_OPTION_CHOICE_ID] // should be disabled
    );
  });

  /**
   * Verifies price constraint functionality.
   * Business Rule: Certain choices may have conditional pricing based on other selections.
   */
  it("should calculate total price correctly when price constraints are applied", () => {
    // Arrange
    const products = productsWithPriceConstraintsFixture();
    const inventory = createTestInventory(products);
    const action = createSelectAction(inventory);

    // Act - Select a choice with price constraints
    const actionResult = action.execute(
      new SelectProductOptionCommand(
        CUSTOMIZABLE_PRODUCT_ID,
        [OPTION_1_ID],
        [PRICE_CONSTRAINED_CHOICE_ID]
      )
    );

    // Assert - Verify price calculation includes constraint effects
    // Price calculation: basePrice(20) + option1Price(10) + choicePrice(5) = 35
    const expectedPrice = 35;

    expectSuccess(actionResult);
    expectTotalPrice(actionResult.result!, expectedPrice);
  });

  /**
   * Verifies complex scenario handling with multiple constraint types.
   * Business Rule: Products can have both pricing and compatibility constraints
   * that must all be evaluated correctly in combination.
   */
  it("should handle complex scenarios with both price and incompatible constraints simultaneously", () => {
    // Arrange
    const products = productsWithMixedConstraintsFixture();
    const inventory = createTestInventory(products);
    const action = createSelectAction(inventory);

    // Act - Select choices that trigger multiple constraint types
    const actionResult = action.execute(
      new SelectProductOptionCommand(
        CUSTOMIZABLE_PRODUCT_ID,
        [OPTION_1_ID, OPTION_2_ID],
        [MIXED_CONSTRAINT_CHOICE_1, MIXED_CONSTRAINT_CHOICE_2]
      )
    );

    // Assert - Verify both constraint types are applied correctly using comprehensive matcher
    // Price calculation: basePrice(20) + option1Price(10) + option2Price(20) + choice1Price(5) + choice2Price(8) = 63
    expectSuccess(actionResult);
    expectProductState(actionResult.result!, {
      selectedChoices: [MIXED_CONSTRAINT_CHOICE_1, MIXED_CONSTRAINT_CHOICE_2],
      disabledChoices: [INCOMPATIBLE_CONSTRAINED_CHOICE],
      totalPrice: 63,
    });
  });
});
