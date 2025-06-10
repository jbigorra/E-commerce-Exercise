import { SelectProductOptionCommand } from "../../../../../src/Store/Inventory/Actions/SelectProductOption";
import {
  ProductOptionChoices,
  ProductOptions,
} from "../../../../../src/Store/Inventory/Core/Entities";
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
  CUSTOMIZABLE_PRODUCT_ID,
  OPTION_1_ID,
  OPTION_2_ID,
  OPTION_3_ID,
  OPTION_4_ID,
  OPTION_5_ID,
  OPTION_WITHOUT_CHOICES_ID,
  productsWithCascadingConstraintsFixture,
  productsWithManyOptionsFixture,
  productsWithOptionsOnlyFixture,
} from "../../../../Fixtures/Inventory";
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
    const products = productsWithOptionsOnlyFixture();
    const inventory = createTestInventory(products);
    const action = createSelectAction(inventory);

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
    const inventory = createTestInventory(products);
    const action = createSelectAction(inventory);

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
    const inventory = createTestInventory(products);
    const action = createSelectAction(inventory);

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
