import { SelectProductOptionCommand } from "../../../../../src/Store/Inventory/Actions/SelectProductOption";
import {
  ProductOptionChoices,
  ProductOptions,
} from "../../../../../src/Store/Inventory/Core/Entities";
import {
  ChoiceIds,
  ProductIds,
} from "../../../../Fixtures/constants/ProductConstants";
import { EdgeCaseScenarios } from "../../../../Fixtures/scenarios/EdgeCaseScenarios";
import { expectSuccess } from "../../../../Helpers/forActions/Matchers";
import { createSelectAction, createTestInventory } from "./shared/test-setup";

describe("SelectProductOption - Edge Cases", () => {
  /*
   * Tests verify system behavior in edge scenarios:
   * - Options without associated choices
   * - Cascading constraint effects that disable multiple items
   * - Large-scale operations with many options and choices
   */

  it("should handle options that have no associated choices", () => {
    const products = EdgeCaseScenarios.optionsOnlyCollection();
    const inventory = createTestInventory(products);
    const action = createSelectAction(inventory);

    const actionResult = action.execute(
      new SelectProductOptionCommand(
        ProductIds.CUSTOMIZABLE_PRODUCT,
        [6], // OPTION_WITHOUT_CHOICES_ID from scenario
        []
      )
    );

    expectSuccess(actionResult, {
      id: ProductIds.CUSTOMIZABLE_PRODUCT,
      options: (opts: ProductOptions) => {
        expect(opts.all).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: 6, // OPTION_WITHOUT_CHOICES_ID
              selected: true,
            }),
          ])
        );
      },
    });
  });

  it("should handle cascading constraint effects", () => {
    const products = EdgeCaseScenarios.cascadingConstraintsCollection();
    const inventory = createTestInventory(products);
    const action = createSelectAction(inventory);

    const actionResult = action.execute(
      new SelectProductOptionCommand(
        ProductIds.CUSTOMIZABLE_PRODUCT,
        [7], // CASCADING_OPTION_1_ID from scenario
        [ChoiceIds.CASCADING_CHOICE_1]
      )
    );

    expectSuccess(actionResult, {
      id: ProductIds.CUSTOMIZABLE_PRODUCT,
      optionChoices: (choices: ProductOptionChoices) => {
        expect(choices.all).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: ChoiceIds.CASCADING_CHOICE_1,
              selected: true,
            }),
            expect.objectContaining({
              id: ChoiceIds.CASCADING_DISABLED_CHOICE_2,
              disabled: true,
            }),
            expect.objectContaining({
              id: ChoiceIds.CASCADING_DISABLED_CHOICE_3,
              disabled: true,
            }),
          ])
        );
      },
    });
  });

  it("should handle selecting many options and choices simultaneously", () => {
    const products = EdgeCaseScenarios.manyOptionsCollection();
    const inventory = createTestInventory(products);
    const action = createSelectAction(inventory);

    // Use the first 5 options and choices from the many options scenario
    const manyOptionIds = [1, 2, 3, 4, 5]; // Option IDs from scenario
    const manyChoiceIds = [
      ChoiceIds.CHOICE_1,
      ChoiceIds.CHOICE_2,
      ChoiceIds.CHOICE_3,
      ChoiceIds.CHOICE_4,
      ChoiceIds.CHOICE_5,
    ];

    const actionResult = action.execute(
      new SelectProductOptionCommand(
        ProductIds.CUSTOMIZABLE_PRODUCT,
        manyOptionIds,
        manyChoiceIds
      )
    );

    expectSuccess(actionResult, {
      id: ProductIds.CUSTOMIZABLE_PRODUCT,
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
