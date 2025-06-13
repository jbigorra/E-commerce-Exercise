import { SelectProductOptionCommand } from "../../../../../src/Store/Inventory/Actions/SelectProductOption";
import {
  Product,
  ProductOptionChoices,
} from "../../../../../src/Store/Inventory/Core/Entities";
import { IInventory } from "../../../../../src/Store/Inventory/Interfaces";
import {
  ChoiceIds,
  OptionIds,
} from "../../../../Fixtures/constants/ProductConstants";
import { BasicProductScenarios } from "../../../../Fixtures/scenarios/BasicProductScenarios";
import { expectSuccess } from "../../../../Helpers/forActions/Matchers";
import { createSelectAction, createTestInventory } from "./shared/test-setup";

describe("SelectProductOption - Success Scenarios", () => {
  describe("Option & Choice selection", () => {
    let products: Product[];
    let inventory: IInventory;

    beforeEach(() => {
      products = BasicProductScenarios.productsCollection();
      inventory = createTestInventory(products);
    });

    it("should return the product with 1 selected part choice", () => {
      const action = createSelectAction(inventory);
      const command = new SelectProductOptionCommand(
        3,
        [OptionIds.FRAME_TYPE],
        [ChoiceIds.FULL_SUSPENSION_FRAME]
      );

      const actionResult = action.execute(command);

      expectSuccess(actionResult, {
        id: 3,
        optionChoices: (choices: ProductOptionChoices) => {
          expect(choices.all).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: ChoiceIds.FULL_SUSPENSION_FRAME,
                optionId: OptionIds.FRAME_TYPE,
                selected: true,
              }),
            ])
          );
          expect(choices.selected).toHaveLength(1);
        },
      });
    });

    it("should return the product with 2 selected part choice for 2 different options", () => {
      const action = createSelectAction(inventory);
      const command = new SelectProductOptionCommand(
        3,
        [OptionIds.FRAME_TYPE, OptionIds.FRAME_FINISH],
        [ChoiceIds.FULL_SUSPENSION_FRAME, ChoiceIds.MATTE_FINISH]
      );

      const actionResult = action.execute(command);

      expectSuccess(actionResult, {
        id: 3,
        optionChoices: (choices: ProductOptionChoices) => {
          expect(choices.all).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: ChoiceIds.FULL_SUSPENSION_FRAME,
                optionId: OptionIds.FRAME_TYPE,
                selected: true,
              }),
              expect.objectContaining({
                id: ChoiceIds.MATTE_FINISH,
                optionId: OptionIds.FRAME_FINISH,
                selected: true,
              }),
            ])
          );
          expect(choices.selected).toHaveLength(2);
        },
      });
    });

    it("should return the product with current total price", () => {
      const action = createSelectAction(inventory);
      const command = new SelectProductOptionCommand(
        3,
        [OptionIds.FRAME_TYPE, OptionIds.FRAME_FINISH],
        [ChoiceIds.FULL_SUSPENSION_FRAME, ChoiceIds.MATTE_FINISH]
      );

      const actionResult = action.execute(command);

      expectSuccess(actionResult, {
        id: 3,
        currentTotalPrice: 20 + 10 + 20,
      });
    });
  });
});
