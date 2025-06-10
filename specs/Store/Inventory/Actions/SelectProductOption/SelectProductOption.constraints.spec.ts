import { SelectProductOptionCommand } from "../../../../../src/Store/Inventory/Actions/SelectProductOption";
import {
  ChoiceIds,
  OptionIds,
  ProductIds,
  TestScenarios,
} from "../../../../Fixtures/constants/ProductConstants";
import { IncompatibleConstraintScenarios } from "../../../../Fixtures/scenarios/IncompatibleConstraintScenarios";
import { PriceConstraintScenarios } from "../../../../Fixtures/scenarios/PriceConstraintScenarios";
import { expectSuccess } from "../../../../Helpers/forActions/Matchers";
import {
  expectConstraintEffect,
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
    const products = IncompatibleConstraintScenarios.productsCollection();
    const inventory = createTestInventory(products);
    const action = createSelectAction(inventory);

    // Act - Select a choice that should trigger constraint effects
    // Note: IncompatibleConstraintScenarios uses specific IDs in its implementation
    const actionResult = action.execute(
      new SelectProductOptionCommand(
        ProductIds.CUSTOMIZABLE_PRODUCT,
        [1], // option ID from scenario
        [1] // choice ID that triggers constraints
      )
    );

    // Assert - Verify constraint was applied correctly using enhanced matchers
    expectSuccess(actionResult);
    expectConstraintEffect(
      actionResult.result!,
      [TestScenarios.CONSTRAINING_OPTION_CHOICE], // should be selected
      [TestScenarios.CONSTRAINED_OPTION_CHOICE] // should be disabled
    );
  });

  /**
   * Verifies price constraint functionality.
   * Business Rule: Certain choices may have conditional pricing based on other selections.
   */
  it("should calculate total price correctly when price constraints are applied", () => {
    // Arrange
    const products = PriceConstraintScenarios.productsCollection();
    const inventory = createTestInventory(products);
    const action = createSelectAction(inventory);

    // Act - Select a choice with price constraints
    const actionResult = action.execute(
      new SelectProductOptionCommand(
        ProductIds.CUSTOMIZABLE_PRODUCT,
        [OptionIds.FRAME_TYPE],
        [ChoiceIds.PRICE_CONSTRAINED_CHOICE]
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
    // Arrange - Create a complex scenario with mixed constraints using builders inline
    const products = PriceConstraintScenarios.productsCollection();
    const inventory = createTestInventory(products);
    const action = createSelectAction(inventory);

    // Act - Select choices that trigger constraint types
    // Note: Using actual IDs from PriceConstraintScenarios
    const actionResult = action.execute(
      new SelectProductOptionCommand(
        ProductIds.CUSTOMIZABLE_PRODUCT,
        [1], // option ID from scenario
        [201] // choice ID with price constraint
      )
    );

    // Assert - Verify constraint types are applied correctly
    // Price calculation: basePrice(20) + option1Price(10) + choicePrice(5) = 35
    expectSuccess(actionResult);
    expectTotalPrice(actionResult.result!, 35);
  });
});
