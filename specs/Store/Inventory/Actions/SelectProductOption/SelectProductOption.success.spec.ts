import { SelectProductOptionCommand } from "../../../../../src/Store/Inventory/Actions/SelectProductOption";
import {
  Product,
  ProductOptionChoices,
  ProductOptions,
} from "../../../../../src/Store/Inventory/Core/Entities";
import { IInventory } from "../../../../../src/Store/Inventory/Interfaces";
import {
  CUSTOMIZABLE_PRODUCT_ID,
  EXPECTED_TOTAL_CUSTOMIZABLE_PRODUCT_PRICE,
  OPTION_1_ID,
  OPTION_2_ID,
  OPTION_3_ID,
  productsFixture,
  productsWithOptionChoicesFixture,
} from "../../../../Fixtures/Inventory";
import { expectSuccess } from "../../../../Helpers/forActions/Matchers";
import { createSelectAction, createTestInventory } from "./shared/test-setup";

describe("SelectProductOption - Success Scenarios", () => {
  describe("Option & Choice selection", () => {
    let products: Product[];
    let inventory: IInventory;

    beforeEach(() => {
      products = productsFixture();
      inventory = createTestInventory(products);
    });

    it("should return the product with 1 selected option", () => {
      const action = createSelectAction(inventory);

      const actionResult = action.execute(
        new SelectProductOptionCommand(
          CUSTOMIZABLE_PRODUCT_ID,
          [OPTION_1_ID],
          []
        )
      );

      expectSuccess(actionResult, {
        id: CUSTOMIZABLE_PRODUCT_ID,
        options: (opts: ProductOptions) => {
          expect(opts.all).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ id: OPTION_1_ID, selected: true }),
              expect.objectContaining({ id: OPTION_2_ID, selected: false }),
              expect.objectContaining({ id: OPTION_3_ID, selected: false }),
            ])
          );
        },
      });
    });

    it("should return the product with 2 selected options", () => {
      const action = createSelectAction(inventory);

      const actionResult = action.execute(
        new SelectProductOptionCommand(
          CUSTOMIZABLE_PRODUCT_ID,
          [OPTION_1_ID, OPTION_2_ID],
          []
        )
      );

      expectSuccess(actionResult, {
        id: CUSTOMIZABLE_PRODUCT_ID,
        options: (opts: ProductOptions) => {
          expect(opts.all).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ id: OPTION_1_ID, selected: true }),
              expect.objectContaining({ id: OPTION_2_ID, selected: true }),
              expect.objectContaining({ id: OPTION_3_ID, selected: false }),
            ])
          );
        },
      });
    });

    it("should return the product with 3 selected options", () => {
      const action = createSelectAction(inventory);

      const actionResult = action.execute(
        new SelectProductOptionCommand(
          CUSTOMIZABLE_PRODUCT_ID,
          [OPTION_1_ID, OPTION_2_ID, OPTION_3_ID],
          []
        )
      );

      expectSuccess(actionResult, {
        id: CUSTOMIZABLE_PRODUCT_ID,
        options: (opts: ProductOptions) => {
          expect(opts.all).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ id: OPTION_1_ID, selected: true }),
              expect.objectContaining({ id: OPTION_2_ID, selected: true }),
              expect.objectContaining({ id: OPTION_3_ID, selected: true }),
            ])
          );
        },
      });
    });

    it("should return the product with 1 option choice selected", () => {
      const products = productsWithOptionChoicesFixture();
      const inventory = createTestInventory(products);
      const action = createSelectAction(inventory);

      const actionResult = action.execute(
        new SelectProductOptionCommand(
          CUSTOMIZABLE_PRODUCT_ID,
          [OPTION_1_ID],
          [1]
        )
      );

      expectSuccess(actionResult, {
        id: CUSTOMIZABLE_PRODUCT_ID,
        optionChoices: (choices: ProductOptionChoices) => {
          expect(choices.all).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ id: 1, selected: true }),
            ])
          );
          expect(choices.all.filter((c) => c.selected).length).toBe(1);
        },
      });
    });

    it("should return the product with 2 option choices selected", () => {
      const products = productsWithOptionChoicesFixture();
      const inventory = createTestInventory(products);
      const action = createSelectAction(inventory);

      const actionResult = action.execute(
        new SelectProductOptionCommand(
          CUSTOMIZABLE_PRODUCT_ID,
          [OPTION_1_ID, OPTION_2_ID],
          [1, 3]
        )
      );

      expectSuccess(actionResult, {
        id: CUSTOMIZABLE_PRODUCT_ID,
        optionChoices: (choices: ProductOptionChoices) => {
          expect(choices.all).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ id: 1, selected: true }),
              expect.objectContaining({ id: 3, selected: true }),
            ])
          );
          expect(choices.all.filter((c) => c.selected).length).toBe(2);
        },
      });
    });
  });

  describe("Total price calculations", () => {
    let products: Product[];
    let inventory: IInventory;

    beforeEach(() => {
      products = productsFixture();
      inventory = createTestInventory(products);
    });

    it("should return the product with the total price calculated", () => {
      const action = createSelectAction(inventory);

      const actionResult = action.execute(
        new SelectProductOptionCommand(
          CUSTOMIZABLE_PRODUCT_ID,
          [OPTION_1_ID, OPTION_2_ID, OPTION_3_ID],
          []
        )
      );

      expectSuccess(actionResult, {
        id: CUSTOMIZABLE_PRODUCT_ID,
        totalPrice: (price: number) => {
          expect(price).toBe(EXPECTED_TOTAL_CUSTOMIZABLE_PRODUCT_PRICE);
        },
      });
    });
  });

  describe("Price adjustments", () => {
    let products: Product[];
    let inventory: IInventory;

    beforeEach(() => {
      products = productsWithOptionChoicesFixture();
      inventory = createTestInventory(products);
    });

    it("should return the product total price considering the option choices selected", () => {
      const action = createSelectAction(inventory);

      const actionResult = action.execute(
        new SelectProductOptionCommand(
          CUSTOMIZABLE_PRODUCT_ID,
          [OPTION_1_ID],
          [1]
        )
      );

      const productBasePrice = 20;
      const option1Price = 10;
      const option1Choice1PriceAdjustment = 10;
      const expectedPrice =
        productBasePrice + option1Price + option1Choice1PriceAdjustment;
      expectSuccess(actionResult, {
        id: CUSTOMIZABLE_PRODUCT_ID,
        totalPrice: (price: number) => {
          expect(price).toBe(expectedPrice);
        },
      });
    });
  });
});
